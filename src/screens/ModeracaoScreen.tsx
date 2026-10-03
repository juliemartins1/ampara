import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { ehModeradora } from '../services/moderacao';
import { colors, spacing, radius, typography } from '../theme/colors';

type Categoria = 'relato' | 'apoio' | 'dica';
type Aba = 'pendentes' | 'denunciadas';

interface Publicacao {
    id: string;
    texto: string;
    categoria: Categoria;
    criadaEm: Timestamp | null;
    denuncias: number;
}

const ROTULOS: Record<Categoria, string> = { relato: 'Relato', apoio: 'Apoio', dica: 'Dica' };

export default function ModeracaoScreen() {
    const [autorizada, setAutorizada] = useState<boolean | null>(null);
    const [aba, setAba] = useState<Aba>('pendentes');
    const [itens, setItens] = useState<Publicacao[]>([]);
    const [processando, setProcessando] = useState<string | null>(null);

    useEffect(() => {
        ehModeradora().then(setAutorizada);
    }, []);

    // Troca a consulta conforme a aba escolhida
    useEffect(() => {
        if (!autorizada) return;
        setItens([]);

        const consulta =
            aba === 'pendentes'
                ? query(collection(db, 'publicacoes'), where('status', '==', 'pendente'), orderBy('criadaEm', 'asc'))
                : query(
                    collection(db, 'publicacoes'),
                    where('status', '==', 'aprovada'),
                    where('denuncias', '>', 0),
                    orderBy('denuncias', 'desc') // mais denunciadas primeiro
                );

        const cancelar = onSnapshot(
            consulta,
            snap =>
                setItens(
                    snap.docs.map(d => ({
                        id: d.id,
                        texto: d.data().texto,
                        categoria: d.data().categoria,
                        criadaEm: d.data().criadaEm ?? null,
                        denuncias: d.data().denuncias ?? 0,
                    }))
                ),
            erro => console.error('Erro ao carregar moderação:', erro)
        );
        return cancelar;
    }, [autorizada, aba]);

    async function atualizar(id: string, dados: { status?: 'aprovada' | 'rejeitada'; denuncias?: number }) {
        setProcessando(id);
        try {
            await updateDoc(doc(db, 'publicacoes', id), dados);
        } catch (erro) {
            console.error(erro);
            Alert.alert('Erro', 'Não foi possível atualizar a publicação.');
        } finally {
            setProcessando(null);
        }
    }

    function confirmar(titulo: string, mensagem: string, acao: () => void) {
        Alert.alert(titulo, mensagem, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Confirmar', style: 'destructive', onPress: acao },
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
        <View style={styles.container}>
            <View style={styles.abas}>
                {(['pendentes', 'denunciadas'] as Aba[]).map(a => (
                    <TouchableOpacity key={a} style={[styles.aba, aba === a && styles.abaAtiva]} onPress={() => setAba(a)}>
                        <Text style={[styles.textoAba, aba === a && styles.textoAbaAtiva]}>
                            {a === 'pendentes' ? 'Pendentes' : 'Denunciadas'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <FlatList
                data={itens}
                keyExtractor={p => p.id}
                contentContainerStyle={styles.lista}
                ListEmptyComponent={
                    <Text style={styles.vazio}>
                        {aba === 'pendentes' ? 'Nenhuma publicação pendente.' : 'Nenhuma publicação denunciada.'}
                    </Text>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.topoCard}>
                            <Text style={styles.categoria}>{ROTULOS[item.categoria]}</Text>
                            {aba === 'denunciadas' ? (
                                <Text style={styles.contadorDenuncias}>{item.denuncias} denúncia(s)</Text>
                            ) : (
                                <Text style={styles.data}>{item.criadaEm ? item.criadaEm.toDate().toLocaleString('pt-BR') : ''}</Text>
                            )}
                        </View>
                        <Text style={styles.texto}>{item.texto}</Text>

                        {processando === item.id ? (
                            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />
                        ) : aba === 'pendentes' ? (
                            <View style={styles.acoes}>
                                <TouchableOpacity
                                    style={[styles.botao, styles.botaoNegativo]}
                                    onPress={() => confirmar('Rejeitar publicação', 'Ela não aparecerá no mural.', () => atualizar(item.id, { status: 'rejeitada' }))}
                                >
                                    <Text style={styles.textoNegativo}>Rejeitar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.botao, styles.botaoPositivo]} onPress={() => atualizar(item.id, { status: 'aprovada' })}>
                                    <Text style={styles.textoPositivo}>Aprovar</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.acoes}>
                                <TouchableOpacity
                                    style={[styles.botao, styles.botaoNegativo]}
                                    onPress={() => confirmar('Remover do mural', 'A publicação deixará de aparecer para todas.', () => atualizar(item.id, { status: 'rejeitada' }))}
                                >
                                    <Text style={styles.textoNegativo}>Remover</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.botao, styles.botaoPositivo]} onPress={() => atualizar(item.id, { denuncias: 0 })}>
                                    <Text style={styles.textoPositivo}>Manter</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centro: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
    abas: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, paddingTop: spacing.md },
    aba: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.primary, alignItems: 'center' },
    abaAtiva: { backgroundColor: colors.primary },
    textoAba: { color: colors.primary, fontWeight: '700' },
    textoAbaAtiva: { color: colors.white },
    lista: { padding: spacing.md, gap: 12 },
    vazio: { ...typography.subtitle, textAlign: 'center', marginTop: 40 },
    card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.border },
    topoCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
    categoria: {
        color: colors.primaryDark, backgroundColor: colors.primarySoft, fontWeight: '700', fontSize: 12,
        paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.pill, overflow: 'hidden',
    },
    data: { ...typography.helper },
    contadorDenuncias: { color: colors.error, fontWeight: '700', fontSize: 12 },
    texto: { fontSize: 15, color: colors.textPrimary, lineHeight: 21 },
    acoes: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    botao: { flex: 1, paddingVertical: 10, borderRadius: radius.pill, alignItems: 'center' },
    botaoNegativo: { borderWidth: 1, borderColor: colors.error },
    botaoPositivo: { backgroundColor: colors.sucess },
    textoNegativo: { color: colors.error, fontWeight: '700' },
    textoPositivo: { color: colors.white, fontWeight: '700' },
});