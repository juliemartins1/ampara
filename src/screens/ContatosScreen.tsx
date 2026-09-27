// src/screens/ContatosScreen.tsx
// Lista os contatos de confiança com opções de editar e excluir.
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
    Contato,
    LIMITE_CONTATOS,
    excluirContato,
    ouvirContatos,
} from '../services/contatosService';
import { telefoneParaExibicao } from '../utils/formatarTelefone';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function ContatosScreen({ navigation }: any) {
    const [contatos, setContatos] = useState<Contato[] | null>(null);
    const [erro, setErro] = useState(false);

    // Escuta em tempo real: ao voltar da edição a lista já está atualizada
    useEffect(() => ouvirContatos(setContatos, () => setErro(true)), []);

    function confirmarExclusao(contato: Contato) {
        Alert.alert(
            'Excluir contato',
            `${contato.nome} não receberá mais seus alertas de emergência. Deseja excluir?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: () =>
                        excluirContato(contato.id).catch(() =>
                            Alert.alert('Erro', 'Não foi possível excluir. Tente novamente.')
                        ),
                },
            ]
        );
    }

    if (erro) {
        return (
            <View style={styles.centro}>
                <Text style={styles.textoVazio}>
                    Não foi possível carregar seus contatos. Verifique sua conexão.
                </Text>
            </View>
        );
    }

    if (!contatos) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    const podeAdicionar = contatos.length < LIMITE_CONTATOS;

    return (
        <View style={styles.container}>
            <FlatList
                data={contatos}
                keyExtractor={(c) => c.id}
                contentContainerStyle={contatos.length ? styles.lista : styles.listaVazia}
                ListHeaderComponent={
                    contatos.length ? (
                        <Text style={styles.contador}>
                            {contatos.length} de {LIMITE_CONTATOS} contatos · recebem seu alerta SOS
                        </Text>
                    ) : null
                }
                ListEmptyComponent={
                    <View style={{ alignItems: 'center' }}>
                        <Ionicons name="people-outline" size={56} color={colors.primaryLight} />
                        <Text style={styles.tituloVazio}>Nenhum contato ainda</Text>
                        <Text style={styles.textoVazio}>
                            Cadastre pessoas de confiança. Elas receberão sua localização
                            quando você acionar o botão SOS.
                        </Text>
                    </View>
                }
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarTexto}>
                                {item.nome.trim().charAt(0).toUpperCase() || '?'}
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nome}>{item.nome}</Text>
                            <Text style={styles.detalhe}>
                                {telefoneParaExibicao(item.telefone)} · {item.parentesco}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.acao}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            onPress={() =>
                                navigation.navigate('CadastroContatoConfianca', { contato: item })
                            }
                            accessibilityLabel={`Editar ${item.nome}`}
                        >
                            <Ionicons name="create-outline" size={22} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.acao}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                            onPress={() => confirmarExclusao(item)}
                            accessibilityLabel={`Excluir ${item.nome}`}
                        >
                            <Ionicons name="trash-outline" size={22} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                )}
            />

            {podeAdicionar ? (
                <TouchableOpacity
                    style={styles.fab}
                    onPress={() => navigation.navigate('CadastroContatoConfianca')}
                    activeOpacity={0.85}
                    accessibilityLabel="Adicionar contato"
                >
                    <Ionicons name="add" size={30} color={colors.white} />
                </TouchableOpacity>
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    centro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
        backgroundColor: colors.background,
    },
    lista: { padding: spacing.md, paddingBottom: 100 },
    listaVazia: { flexGrow: 1, justifyContent: 'center', padding: spacing.xl },
    contador: { ...typography.helper, marginBottom: spacing.sm },
    tituloVazio: { ...typography.label, fontSize: 18, marginTop: spacing.md },
    textoVazio: {
        ...typography.subtitle,
        textAlign: 'center',
        marginTop: spacing.sm,
        lineHeight: 22,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: radius.pill,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    avatarTexto: { color: colors.primaryDark, fontWeight: '700', fontSize: 18 },
    nome: { ...typography.label, fontSize: 16 },
    detalhe: { ...typography.helper, fontSize: 13, marginTop: 2 },
    acao: { padding: spacing.sm, marginLeft: spacing.xs },
    fab: {
        position: 'absolute',
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: colors.black,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
    },
});