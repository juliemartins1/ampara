// src/screens/PerfilScreen.tsx
// Dados da usuária + atalhos da conta.
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';
import {
    DadosUsuaria,
    enviarEmailRedefinicaoSenha,
    ouvirUsuaria,
    sairDaConta,
} from '../services/usuariaService';
import { telefoneParaExibicao } from '../utils/formatarTelefone';
import { colors, spacing, radius, typography } from '../theme/colors';

interface ItemMenuProps {
    icone: keyof typeof Ionicons.glyphMap;
    texto: string;
    onPress: () => void;
    destrutivo?: boolean;
}

function ItemMenu({ icone, texto, onPress, destrutivo }: ItemMenuProps) {
    const cor = destrutivo ? colors.error : colors.textPrimary;
    return (
        <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
            <Ionicons name={icone} size={22} color={destrutivo ? colors.error : colors.primary} />
            <Text style={[styles.itemTexto, { color: cor }]}>{texto}</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.placeholder} />
        </TouchableOpacity>
    );
}

function LinhaInfo({ icone, valor }: { icone: keyof typeof Ionicons.glyphMap; valor: string }) {
    return (
        <View style={styles.linhaInfo}>
            <Ionicons name={icone} size={16} color={colors.textSecondary} />
            <Text style={styles.info}>{valor}</Text>
        </View>
    );
}

export default function PerfilScreen({ navigation }: any) {
    const [dados, setDados] = useState<DadosUsuaria | null | undefined>(undefined);
    const email = auth.currentUser?.email ?? '';

    useEffect(
        () => ouvirUsuaria(setDados, (e) => console.error('Erro ao carregar perfil:', e)),
        []
    );

    function alterarSenha() {
        Alert.alert(
            'Alterar senha',
            `Vamos enviar para ${email} um link para você criar uma nova senha.`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Enviar',
                    onPress: async () => {
                        try {
                            await enviarEmailRedefinicaoSenha(email);
                            Alert.alert('E-mail enviado', 'Confira sua caixa de entrada e o spam.');
                        } catch {
                            Alert.alert('Erro', 'Não foi possível enviar o e-mail. Tente novamente.');
                        }
                    },
                },
            ]
        );
    }

    function confirmarSaida() {
        Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await sairDaConta();
                        // Volta para o Login e apaga o histórico (não dá para "voltar")
                        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch {
                        Alert.alert('Erro', 'Não foi possível sair. Tente novamente.');
                    }
                },
            },
        ]);
    }

    if (dados === undefined) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    const nome = dados?.nome || 'Usuária';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.cabecalho}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarTexto}>{nome.charAt(0).toUpperCase()}</Text>
                </View>
                <Text style={styles.nome}>{nome}</Text>
                <LinhaInfo icone="mail-outline" valor={email} />
                {dados?.telefone ? (
                    <LinhaInfo icone="call-outline" valor={telefoneParaExibicao(dados.telefone)} />
                ) : null}
                {dados?.bairro ? <LinhaInfo icone="location-outline" valor={dados.bairro} /> : null}
            </View>

            <Text style={styles.secao}>Minha conta</Text>
            <ItemMenu icone="create-outline" texto="Editar meus dados" onPress={() => navigation.navigate('EditarPerfil')} />
            <ItemMenu icone="key-outline" texto="Alterar senha" onPress={alterarSenha} />
            <ItemMenu icone="people-outline" texto="Contatos de confiança" onPress={() => navigation.navigate('Contatos')} />
            <ItemMenu icone="settings-outline" texto="Configurações" onPress={() => navigation.navigate('Configuracoes')} />

            <Text style={styles.secao}>Sessão</Text>
            <ItemMenu icone="log-out-outline" texto="Sair da conta" onPress={confirmarSaida} destrutivo />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.md, paddingBottom: spacing.xl },
    centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    cabecalho: {
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.lg,
        marginBottom: spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    avatarTexto: { color: colors.white, fontSize: 34, fontWeight: '700' },
    nome: { ...typography.title, fontSize: 20, marginBottom: spacing.sm },
    linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    info: { ...typography.subtitle, fontSize: 14 },
    secao: {
        ...typography.helper,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    itemTexto: { flex: 1, fontSize: 16, marginLeft: spacing.md },
});