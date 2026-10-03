import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';
import { ehModeradora } from '../services/moderacao';

type Categoria = 'relato' | 'apoio' | 'dica';

interface Publicacao {
    id: string;
    texto: string;
    categoria: Categoria;
    criadaEm: Timestamp | null;
}

const ROTULOS: Record<Categoria, string> = {
    relato: 'Relato',
    apoio: 'Apoio',
    dica: 'Dica',
};

function formatarData(data: Timestamp | null) {
    if (!data) return '';
    return data.toDate().toLocaleDateString('pt-BR');
}

export default function MuralScreen() {
         
    const navigation = useNavigation<any>();
    const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(false);

    const [podeModerar, setPodeModerar] = useState(false);

    // Verifica se a usuária logada é moderadora
    useEffect(() => {
        ehModeradora().then(setPodeModerar);
    }, []);

    // Botão "Moderar" no cabeçalho, só para moderadoras
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: podeModerar
                ? () => (
                    <TouchableOpacity onPress={() => navigation.navigate('Moderacao')}>
                        <Text style={styles.botaoModerar}>Moderar</Text>
                    </TouchableOpacity>
                )
                : undefined,
        });
    }, [navigation, podeModerar]);

    useEffect(() => {
        // Só aprovadas, mais recentes primeiro
        const consulta = query(
            collection(db, 'publicacoes'),
            where('status', '==', 'aprovada'),
            orderBy('criadaEm', 'desc')
        );

        // onSnapshot: o mural atualiza sozinho quando uma moderadora aprova algo
        const cancelar = onSnapshot(
            consulta,
            snapshot => {
                const lista = snapshot.docs.map(doc => ({
                    id: doc.id,
                    texto: doc.data().texto,
                    categoria: doc.data().categoria,
                    criadaEm: doc.data().criadaEm ?? null,
                }));
                setPublicacoes(lista);
                setCarregando(false);
            },
            falha => {
                console.error(falha);
                setErro(true);
                setCarregando(false);
            }
        );

        return cancelar; // para de escutar ao sair da tela
    }, []);

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color={roxo} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {erro ? (
                <Text style={styles.vazio}>Não foi possível carregar o mural.</Text>
            ) : (
                <FlatList
                    data={publicacoes}
                    keyExtractor={p => p.id}
                    contentContainerStyle={styles.lista}
                    ListEmptyComponent={<Text style={styles.vazio}>Ainda não há publicações.</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.topoCard}>
                                <Text style={styles.categoria}>{ROTULOS[item.categoria]}</Text>
                                <Text style={styles.data}>{formatarData(item.criadaEm)}</Text>
                            </View>
                            <Text style={styles.texto}>{item.texto}</Text>
                            <Text style={styles.autora}>Anônima</Text>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate('NovaPublicacao')}>
                <Text style={styles.textoBotaoNovo}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

// Cores provisórias — troque pelos tokens de src/theme/colors.ts
const roxo = colors.primary;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
    lista: { padding: spacing.md, gap: 12, paddingBottom: 96 },
    vazio: { ...typography.subtitle, textAlign: 'center', marginTop: 40 },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    topoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    categoria: {
        color: colors.primaryDark,
        backgroundColor: colors.primarySoft,
        fontWeight: '700',
        fontSize: 12,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    data: { ...typography.helper },
    texto: { fontSize: 15, color: colors.textPrimary, lineHeight: 21 },
    autora: { ...typography.helper, marginTop: 10, fontStyle: 'italic' },
    botaoModerar: { color: colors.primary, fontWeight: '700', fontSize: 15 },
    botaoNovo: {
        position: 'absolute',
        right: 20,
        bottom: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
    },
    textoBotaoNovo: { color: colors.white, fontSize: 28, lineHeight: 30 },
});