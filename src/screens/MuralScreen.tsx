import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import {
    View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Modal, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';
import {
    ehModeradora,
    denunciarPublicacao,
    jaDenunciei,
    MOTIVOS_DENUNCIA,
    MotivoDenuncia,
} from '../services/moderacao';

type Categoria = 'relato' | 'apoio' | 'dica';

interface Publicacao {
    id: string;
    texto: string;
    categoria: Categoria;
    criadaEm: Timestamp | null;
    denuncias: number;
}

const ROTULOS: Record<Categoria, string> = {
    relato: 'Relato',
    apoio: 'Apoio',
    dica: 'Dica',
};

// A partir de quantas denúncias a publicação some do mural até ser revisada
const LIMITE_OCULTAR = 3;

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
    const [denunciando, setDenunciando] = useState<string | null>(null); // id da publicação no modal

    // Publicações que esta usuária já denunciou (o botão vira "Denunciada")
    const [denunciadas, setDenunciadas] = useState<Set<string>>(new Set());
    // Ids já conferidos no banco, para não repetir a consulta a cada atualização
    const conferidas = useRef<Set<string>>(new Set());

    function marcarComoDenunciada(id: string) {
        setDenunciadas(atual => new Set(atual).add(id));
    }

    // Para cada publicação nova na tela, confere uma única vez se ela já foi denunciada
    useEffect(() => {
        const novas = publicacoes.filter(p => !conferidas.current.has(p.id));
        novas.forEach(p => {
            conferidas.current.add(p.id);
            jaDenunciei(p.id)
                .then(sim => { if (sim) marcarComoDenunciada(p.id); })
                .catch(() => { /* sem conexão: o botão continua disponível */ });
        });
    }, [publicacoes]);

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
        const consulta = query(
            collection(db, 'publicacoes'),
            where('status', '==', 'aprovada'),
            orderBy('criadaEm', 'desc')
        );

        const cancelar = onSnapshot(
            consulta,
            snapshot => {
                const lista = snapshot.docs
                    .map(doc => ({
                        id: doc.id,
                        texto: doc.data().texto,
                        categoria: doc.data().categoria,
                        criadaEm: doc.data().criadaEm ?? null,
                        denuncias: doc.data().denuncias ?? 0,
                    }))
                    // esconde as muito denunciadas até a moderação revisar
                    .filter(p => p.denuncias < LIMITE_OCULTAR);
                setPublicacoes(lista);
                setCarregando(false);
            },
            falha => {
                console.error(falha);
                setErro(true);
                setCarregando(false);
            }
        );

        return cancelar;
    }, []);

    async function enviarDenuncia(motivo: MotivoDenuncia) {
        if (!denunciando) return;
        const id = denunciando;
        setDenunciando(null);
        try {
            await denunciarPublicacao(id, motivo);
            marcarComoDenunciada(id);
            Alert.alert('Denúncia enviada', 'Obrigada. A moderação vai revisar esta publicação.');
        } catch (e: any) {
            if (e?.message === 'ja-denunciou') {
                marcarComoDenunciada(id);
                Alert.alert('Denúncia já registrada', 'Você já denunciou esta publicação.');
            } else {
                // Mostra o código no terminal para facilitar achar a causa
                console.error('[mural] erro ao denunciar:', e?.code, e?.message);
                Alert.alert('Erro', 'Não foi possível enviar a denúncia. Tente novamente.');
            }
        }
    }

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator size="large" color={colors.primary} />
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
                            <View style={styles.rodapeCard}>
                                <Text style={styles.autora}>Anônima</Text>

                                {/* Só a moderadora vê quantas denúncias a publicação tem */}
                                {podeModerar && item.denuncias > 0 && (
                                    <Text style={styles.contadorDenuncias}>
                                        {item.denuncias} de {LIMITE_OCULTAR} denúncias
                                    </Text>
                                )}

                                {denunciadas.has(item.id) ? (
                                    <View style={styles.botaoDenunciar}>
                                        <Ionicons name="flag" size={14} color={colors.error} />
                                        <Text style={[styles.textoDenunciar, { color: colors.error }]}>
                                            Denunciada
                                        </Text>
                                    </View>
                                ) : (
                                    <TouchableOpacity
                                        style={styles.botaoDenunciar}
                                        onPress={() => setDenunciando(item.id)}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                        accessibilityLabel="Denunciar publicação"
                                    >
                                        <Ionicons name="flag-outline" size={14} color={colors.textSecondary} />
                                        <Text style={styles.textoDenunciar}>Denunciar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}
                />
            )}

            <TouchableOpacity style={styles.botaoNovo} onPress={() => navigation.navigate('NovaPublicacao')}>
                <Text style={styles.textoBotaoNovo}>+</Text>
            </TouchableOpacity>

            {/* Modal de escolha do motivo da denúncia */}
            <Modal
                visible={denunciando !== null}
                transparent
                animationType="fade"
                onRequestClose={() => setDenunciando(null)}
            >
                <View style={styles.fundoModal}>
                    <View style={styles.caixaModal}>
                        <Text style={styles.tituloModal}>Por que você está denunciando?</Text>
                        {MOTIVOS_DENUNCIA.map(m => (
                            <TouchableOpacity key={m.valor} style={styles.opcaoMotivo} onPress={() => enviarDenuncia(m.valor)}>
                                <Text style={styles.textoMotivo}>{m.rotulo}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity style={styles.cancelarModal} onPress={() => setDenunciando(null)}>
                            <Text style={styles.textoCancelar}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

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
    rodapeCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
    autora: { ...typography.helper, fontStyle: 'italic' },
    botaoDenunciar: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    contadorDenuncias: { fontSize: 12, fontWeight: '700', color: colors.error },
    textoDenunciar: { ...typography.helper },
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
    fundoModal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
    caixaModal: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    tituloModal: { ...typography.label, fontSize: 16, marginBottom: spacing.sm },
    opcaoMotivo: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border },
    textoMotivo: { fontSize: 15, color: colors.textPrimary },
    cancelarModal: { paddingVertical: 12, alignItems: 'center', marginTop: spacing.xs },
    textoCancelar: { color: colors.primary, fontWeight: '700' },
});