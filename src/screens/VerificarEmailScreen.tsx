// src/screens/VerificarEmailScreen.tsx
// Aparece depois do cadastro e sempre que a conta ainda não foi verificada.
// A usuária toca no link do e-mail e volta para o app: ao voltar, o app
// confere sozinho (ou ela toca em "Já confirmei").
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, AppState, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';
import {
    ESPERA_REENVIO_S,
    emailFoiVerificado,
    enviarLinkVerificacao,
} from '../services/verificarEmailService';
import BotaoPrimario from '../components/BotaoPrimario';
import { confirmarSaida } from '../utils/confirmarSaida';
import { mensagemErroAuth } from '../utils/mensagemErroAuth';
import { colors, spacing, radius, typography } from '../theme/colors';

export default function VerificarEmailScreen({ navigation }: any) {
    const email = auth.currentUser?.email ?? '';
    const [aviso, setAviso] = useState('');
    const [conferindo, setConferindo] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [segundosReenvio, setSegundosReenvio] = useState(0);

    async function conferir(avisarSeNao: boolean) {
        setConferindo(true);
        try {
            if (await emailFoiVerificado()) {
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            } else if (avisarSeNao) {
                setAviso('Ainda não recebemos a confirmação. Toque no link do e-mail e tente de novo.');
            }
        } finally {
            setConferindo(false);
        }
    }

    // Quando ela volta do aplicativo de e-mail para o Ampara, confere sozinho
    useEffect(() => {
        const sub = AppState.addEventListener('change', (estado) => {
            if (estado === 'active') conferir(false);
        });
        return () => sub.remove();
    }, []);

    // Contagem regressiva do "Reenviar e-mail"
    useEffect(() => {
        if (segundosReenvio <= 0) return;
        const t = setTimeout(() => setSegundosReenvio((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [segundosReenvio]);

    async function reenviar() {
        setEnviando(true);
        setAviso('');
        try {
            await enviarLinkVerificacao();
            setSegundosReenvio(ESPERA_REENVIO_S);
            setAviso('E-mail reenviado.');
        } catch (e: any) {
            console.error('Erro ao reenviar link:', e);
            setAviso(mensagemErroAuth(e?.code));
        } finally {
            setEnviando(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.icone}>
                <Ionicons name="mail-unread-outline" size={36} color={colors.white} />
            </View>
            <Text style={styles.titulo}>Confirme seu e-mail</Text>
            <Text style={styles.subtitulo}>
                Enviamos um link de confirmação para{'\n'}
                <Text style={styles.email}>{email}</Text>
                {'\n\n'}Abra o e-mail, toque no link e volte para o app.
            </Text>

            <BotaoPrimario
                titulo="Já confirmei"
                onPress={() => conferir(true)}
                carregando={conferindo}
                style={styles.botao}
            />

            {aviso ? <Text style={styles.aviso}>{aviso}</Text> : null}

            <Text style={styles.dica}>Não chegou? Confira a caixa de spam.</Text>

            <TouchableOpacity
                onPress={reenviar}
                disabled={segundosReenvio > 0 || enviando}
                style={styles.botaoReenviar}
            >
                {enviando ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    <Text style={[styles.textoReenviar, segundosReenvio > 0 && { color: colors.placeholder }]}>
                        {segundosReenvio > 0 ? `Reenviar e-mail em ${segundosReenvio}s` : 'Reenviar e-mail'}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => confirmarSaida(navigation, 'Usar outra conta', 'Deseja sair e entrar com outro e-mail?')}
                style={{ marginTop: spacing.lg }}
            >
                <Text style={styles.textoTrocar}>Usar outro e-mail</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
    },
    icone: {
        width: 72,
        height: 72,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.md,
    },
    titulo: { ...typography.title, marginBottom: spacing.sm },
    subtitulo: { ...typography.subtitle, textAlign: 'center', lineHeight: 22 },
    email: { fontWeight: '700', color: colors.textPrimary },
    botao: { alignSelf: 'stretch', marginTop: spacing.xl },
    aviso: { ...typography.helper, fontSize: 14, marginTop: spacing.md, textAlign: 'center' },
    dica: { ...typography.helper, marginTop: spacing.lg },
    botaoReenviar: { marginTop: spacing.sm, padding: spacing.sm, minHeight: 40, justifyContent: 'center' },
    textoReenviar: { color: colors.primary, fontWeight: '700', fontSize: 15 },
    textoTrocar: { color: colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
});
