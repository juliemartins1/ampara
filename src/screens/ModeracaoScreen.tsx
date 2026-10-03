import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { ehModeradora } from '../services/moderacao';
import { colors, spacing, radius, typography } from '../theme/colors';

type Categoria = 'relato' | 'apoio' | 'dica';

interface Publicacao {
    id: string;
    texto: string;
    categoria: Categoria;
    criadaEm: Timestamp | null;
}

const ROTULOS: Record<Categoria, string> = { relato: 'Relato', apoio: 'Apoio', dica: 'Dica' };

export default function ModeracaoScreen() {
    const [autorizada, setAutorizada] = useState<boolean | null>(null);
    const [pendentes, setPendentes] = useState<Publicacao[]>([]);
    const [processando, setProcessando] = useState<string | null>(null); // id em atualização

    // 1º: confirma se é moderadora
    useEffect(() => {
        ehModeradora().then(setAutorizada);
    }, []);

    // 2º: só então escuta as pendentes, mais antigas primeiro (fila)
    useEffect(() => {
        if (!autorizada) return;
        const consulta = query(
            collection(db, 'publicacoes'),
            where('status', '==', 'pendente'),
            orderBy('criadaEm', 'asc')
        );
        const cancelar = onSnapshot(
            consulta,
            snap =>
                setPendentes(
                    snap.docs.map(d => ({
                        id: d.id,
                        texto: d.data().texto,
                        categoria: d.data().categoria,
                        criadaEm: d.data().criadaEm ?? null,
                    }))
                ),
            erro => console.error('Erro ao carregar pendentes:', erro)
        );
        return cancelar;
    }, [autorizada]);

    async function mudarStatus(id: string, status: 'aprovada' | 'rejeitada') {
        setProcessando(id);
        try {
            await updateDoc(doc(db, 'publicacoes', id), { status });
            // não precisa remover da lista: o onSnapshot faz isso sozinho
        } catch (erro) {
            console.error(erro);
            Alert.alert('Erro', 'Não foi possível atualizar a publicação.');
        } finally {
            setProcessando(null);
        }
    }

    function confirmarRejeicao(id: string) {
        Alert.alert('Rejeitar publicação', 'Ela não aparecerá no mural.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Rejeitar', style: 'destructive', onPress: () => mudarStatus(id, 'rejeitada') },
        ]);
    }

    if (autorizada === null) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!autorizada) {
        return (
            <View style={styles.centro}>
                <Text style={styles.vazio}>Você não tem permissão para acessar esta área.</Text>
            </View>
        );
    }

    return (
        <FlatList
            style={styles.container}
            data={pendentes}
            keyExtractor={p => p.id}
            contentContainerStyle={styles.lista}
            ListHeaderComponent={<Text style={styles.cabecalho}>{pendentes.length} publicação(ões) aguardando revisão</Text>}
            ListEmptyComponent={<Text style={styles.vazio}>Nenhuma publicação pendente.</Text>}
            renderItem={({ item }) => (
                <View style={styles.card}>
                    <View style={styles.topoCard}>
                        <Text style={styles.categoria}>{ROTULOS[item.categoria]}</Text>
                        <Text style={styles.data}>{item.criadaEm ? item.criadaEm.toDate().toLocaleString('pt-BR') : ''}</Text>
                    </View>
                    <Text style={styles.texto}>{item.texto}</Text>

                    {processando === item.id ? (
                        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
                    ) : (
                        <View style={styles.acoes}>
                            <TouchableOpacity style={[styles.botao, styles.botaoRejeitar]} onPress={() => confirmarRejeicao(item.id)}>
                                <Text style={styles.textoRejeitar}>Rejeitar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.botao, styles.botaoAprovar]} onPress={() => mudarStatus(item.id, 'aprovada')}>
                                <Text style={styles.textoAprovar}>Aprovar</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        />
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
    lista: { padding: spacing.md, gap: 12 },
    cabecalho: { ...typography.label, marginBottom: spacing.xs },
    vazio: { ...typography.subtitle, textAlign: 'center', marginTop: 40 },
    card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
    topoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    categoria: {
        color: colors.primaryDark, backgroundColor: colors.primarySoft, fontWeight: '700', fontSize: 12,
        paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill, overflow: 'hidden',
    },
    data: { ...typography.helper },
    texto: { fontSize: 15, color: colors.textPrimary, lineHeight: 21 },
    acoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    botao: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
    botaoRejeitar: { borderWidth: 1, borderColor: colors.error },
    botaoAprovar: { backgroundColor: colors.sucess },
    textoRejeitar: { color: colors.error, fontWeight: '700' },
    textoAprovar: { color: colors.white, fontWeight: '700' },
});