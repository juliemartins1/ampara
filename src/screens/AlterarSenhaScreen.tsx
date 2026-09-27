// src/screens/AlterarSenhaScreen.tsx
// Troca de senha dentro do app, sem enviar e-mail (mais discreto).
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { alterarSenha, mensagemErroAuth } from '../services/usuariaService';
import { colors, spacing, radius, typography } from '../theme/colors';

interface Erros {
    atual?: string;
    nova?: string;
    confirmar?: string;
}

export default function AlterarSenhaScreen({ navigation }: any) {
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmar, setConfirmar] = useState('');
    const [erros, setErros] = useState<Erros>({});
    const [salvando, setSalvando] = useState(false);

    function validar(): boolean {
        const novos: Erros = {};
        if (!senhaAtual) novos.atual = 'Informe sua senha atual.';
        if (novaSenha.length < 6) novos.nova = 'A nova senha precisa ter ao menos 6 caracteres.';
        else if (novaSenha === senhaAtual) novos.nova = 'A nova senha deve ser diferente da atual.';
        if (confirmar !== novaSenha) novos.confirmar = 'As senhas não conferem.';
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function salvar() {
        if (!validar()) return;
        setSalvando(true);
        try {
            await alterarSenha(senhaAtual, novaSenha);
            Alert.alert('Senha alterada', 'Sua senha foi atualizada.');
            navigation.goBack();
        } catch (error: any) {
            console.error('Erro ao alterar senha:', error);
            Alert.alert('Não foi possível alterar', mensagemErroAuth(error?.code));
        } finally {
            setSalvando(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.campo}>
                    <Text style={typography.label}>Senha atual</Text>
                    <TextInput
                        style={[styles.input, erros.atual ? styles.inputErro : null]}
                        value={senhaAtual}
                        onChangeText={setSenhaAtual}
                        secureTextEntry
                    />
                    {erros.atual ? <Text style={typography.errorText}>{erros.atual}</Text> : null}
                </View>

                <View style={styles.campo}>
                    <Text style={typography.label}>Nova senha</Text>
                    <TextInput
                        style={[styles.input, erros.nova ? styles.inputErro : null]}
                        value={novaSenha}
                        onChangeText={setNovaSenha}
                        secureTextEntry
                        placeholder="Mínimo de 6 caracteres"
                        placeholderTextColor={colors.placeholder}
                    />
                    {erros.nova ? <Text style={typography.errorText}>{erros.nova}</Text> : null}
                </View>

                <View style={styles.campo}>
                    <Text style={typography.label}>Confirmar nova senha</Text>
                    <TextInput
                        style={[styles.input, erros.confirmar ? styles.inputErro : null]}
                        value={confirmar}
                        onChangeText={setConfirmar}
                        secureTextEntry
                    />
                    {erros.confirmar ? <Text style={typography.errorText}>{erros.confirmar}</Text> : null}
                </View>

                <TouchableOpacity
                    style={[styles.botao, salvando && { opacity: 0.6 }]}
                    onPress={salvar}
                    disabled={salvando}
                    activeOpacity={0.85}
                >
                    {salvando ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={typography.button}>Alterar senha</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    campo: { gap: spacing.xs, marginBottom: spacing.md },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        ...typography.input,
    },
    inputErro: { borderColor: colors.error },
    botao: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: spacing.md,
    },
});