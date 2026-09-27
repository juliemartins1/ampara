import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';
import { sairDaConta } from '../services/usuariaService';
import {
    ESPERA_REENVIO_S,
    confirmarCodigo,
    enviarCodigo,
    existeCodigoValido,
} from '../services/verificarEmailService';
import { colors, spacing, radius, typography } from '../theme/colors';

const TAMANHO_CODIGO = 6;

export default function VerificarEmailScreen() {
    const email = auth.currentUser?.email ?? '';
    const inputRef = useRef<TextInput>(null);
    const [codigo, setCodigo] = useState('');
    const [erro, setErro] = useState('');
    const [verificando, setVerificando] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [segundosReenvio, setSegundosReenvio] = useState(0);

    // Ao abrir: só envia um código novo se não houver um ainda válido
    useEffect(() => {
        existeCodigoValido()
            .then((valido) => (valido ? setSegundosReenvio(ESPERA_REENVIO_S) : reenviar()))
            .catch(() => reenviar());
    }, []);

    // Contagem regressiva do "Reenviar código"
    useEffect(() => {
        if (segundosReenvio <= 0) return;
        const t = setTimeout(() => setSegundosReenvio((s) => s - 1), 1000);
        return () => clearTimeout(t);
    }, [segundosReenvio]);

    async function reenviar() {
        setEnviando(true);
        setErro('');
        setCodigo('');
        try {
            await enviarCodigo();
            setSegundosReenvio(ESPERA_REENVIO_S);
        } catch (e) {
            console.error('Erro ao enviar código:', e);
            setErro('Não foi possível enviar o código. Verifique sua internet e tente novamente.');
        } finally {
            setEnviando(false);
        }
    }

    async function verificar(valor: string) {
        setVerificando(true);
        setErro('');
        try {
            const resultado = await confirmarCodigo(valor);
            if (resultado.ok) return; // o App.tsx troca para a Home sozinho

            setCodigo('');
            if (resultado.motivo === 'incorreto') {
                setErro(`Código incorreto. Você tem mais ${resultado.restantes} tentativa(s).`);
            } else if (resultado.motivo === 'expirado') {
                setErro('Este código expirou. Toque em "Reenviar código".');
            } else {
                setErro('Muitas tentativas ou código inválido. Peça um código novo.');
                setSegundosReenvio(0);
            }
        } catch (e) {
            console.error('Erro ao verificar código:', e);
            setErro('Não foi possível verificar agora. Tente novamente.');
        } finally {
            setVerificando(false);
        }
    }

    function aoDigitar(texto: string) {
        const somenteNumeros = texto.replace(/\D/g, '').slice(0, TAMANHO_CODIGO);
        setCodigo(somenteNumeros);
        setErro('');
        // Verifica sozinho quando completa os 6 dígitos (como apps de banco)
        if (somenteNumeros.length === TAMANHO_CODIGO) verificar(somenteNumeros);
    }

    function trocarConta() {
        Alert.alert('Usar outra conta', 'Deseja sair e entrar com outro e-mail?', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sair', onPress: () => sairDaConta() },
        ]);
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.icone}>
                <Ionicons name="mail-unread-outline" size={36} color={colors.white} />
            </View>
            <Text style={styles.titulo}>Verifique seu e-mail</Text>
            <Text style={styles.subtitulo}>
                Enviamos um código de 6 dígitos para{'\n'}
                <Text style={styles.email}>{email}</Text>
            </Text>

            {/* Um TextInput invisível recebe a digitação; as caixas só mostram os números */}
            <TouchableOpacity
                activeOpacity={1}
                style={styles.caixas}
                onPress={() => inputRef.current?.focus()}
            >
                {Array.from({ length: TAMANHO_CODIGO }).map((_, i) => {
                    const ativa = i === codigo.length && !verificando;
                    return (
                        <View
                            key={i}
                            style={[
                                styles.caixa,
                                ativa && styles.caixaAtiva,
                                erro ? styles.caixaErro : null,
                            ]}
                        >
                            <Text style={styles.digito}>{codigo[i] ?? ''}</Text>
                        </View>
                    );
                })}
            </TouchableOpacity>
            <TextInput
                ref={inputRef}
                value={codigo}
                onChangeText={aoDigitar}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                maxLength={TAMANHO_CODIGO}
                autoFocus
                editable={!verificando}
                style={styles.inputOculto}
            />

            {verificando ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} /> : null}
            {erro ? <Text style={styles.erro}>{erro}</Text> : null}

            <Text style={styles.dica}>Não chegou? Confira a caixa de spam.</Text>

            <TouchableOpacity
                onPress={reenviar}
                disabled={segundosReenvio > 0 || enviando}
                style={styles.botaoReenviar}
            >
                {enviando ? (
                    <ActivityIndicator color={colors.primary} />
                ) : (
                    <Text
                        style={[
                            styles.textoReenviar,
                            segundosReenvio > 0 && { color: colors.placeholder },
                        ]}
                    >
                        {segundosReenvio > 0
                            ? `Reenviar código em ${segundosReenvio}s`
                            : 'Reenviar código'}
                    </Text>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={trocarConta} style={{ marginTop: spacing.lg }}>
                <Text style={styles.textoTrocar}>Usar outro e-mail</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
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
    caixas: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
    caixa: {
        width: 46,
        height: 56,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    caixaAtiva: { borderColor: colors.primary, borderWidth: 2 },
    caixaErro: { borderColor: colors.error },
    digito: { fontSize: 24, fontWeight: '700', color: colors.textPrimary },
    inputOculto: { position: 'absolute', opacity: 0, width: 1, height: 1 },
    erro: { ...typography.errorText, fontSize: 14, marginTop: spacing.md, textAlign: 'center' },
    dica: { ...typography.helper, marginTop: spacing.lg },
    botaoReenviar: { marginTop: spacing.sm, padding: spacing.sm, minHeight: 40, justifyContent: 'center' },
    textoReenviar: { color: colors.primary, fontWeight: '700', fontSize: 15 },
    textoTrocar: { color: colors.textSecondary, fontSize: 14, textDecorationLine: 'underline' },
});