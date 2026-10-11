// src/screens/ExcluirContaScreen.tsx
// Exclusão definitiva da conta (LGPD e exigência da Google Play para apps com cadastro).
import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { excluirConta } from '../services/usuariaService';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import { mensagemErroAuth } from '../utils/mensagemErroAuth';
import { colors, spacing, radius } from '../theme/colors';

export default function ExcluirContaScreen({ navigation }: any) {
    const [senha, setSenha] = useState('');
    const [excluindo, setExcluindo] = useState(false);

    function confirmar() {
        if (!senha) {
            Alert.alert('Senha obrigatória', 'Digite sua senha para confirmar.');
            return;
        }
        Alert.alert(
            'Excluir conta definitivamente?',
            'Seus dados e contatos de confiança serão apagados. Essa ação não pode ser desfeita.',
            [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Excluir', style: 'destructive', onPress: executar },
            ]
        );
    }

    async function executar() {
        setExcluindo(true);
        try {
            await excluirConta(senha);
            Alert.alert('Conta excluída', 'Seus dados foram apagados.');
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        } catch (error: any) {
            console.error('Erro ao excluir conta:', error);
            Alert.alert('Não foi possível excluir', mensagemErroAuth(error?.code));
            setExcluindo(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.aviso}>
                <Ionicons name="warning-outline" size={28} color={colors.error} />
                <Text style={styles.avisoTexto}>
                    Ao excluir sua conta, apagaremos seu cadastro e todos os seus contatos de
                    confiança. Essa ação é permanente.
                </Text>
            </View>

            <Campo
                label="Confirme sua senha"
                placeholder="Sua senha atual"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <BotaoPrimario
                titulo="Excluir minha conta"
                onPress={confirmar}
                carregando={excluindo}
                cor={colors.error}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    aviso: {
        flexDirection: 'row',
        gap: spacing.md,
        alignItems: 'center',
        backgroundColor: '#FDECEA',
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    avisoTexto: { flex: 1, color: colors.textPrimary, fontSize: 14, lineHeight: 20 },
});