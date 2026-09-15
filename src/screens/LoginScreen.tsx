
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';

interface FormErrors {
    email?: string;
    senha?: string;
}

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    function validar(): boolean {
        const novosErros: FormErrors = {};

        if (!email.trim()) {
            novosErros.email = 'Informe seu e-mail.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            novosErros.email = 'Informe um e-mail válido.';
        }

        if (!senha) {
            novosErros.senha = 'Informe sua senha.';
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    async function handleEntrar() {
        if (!validar()) return;

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), senha);

            // Reseta a pilha de navegação para a Home, impedindo que o
            // botão "voltar" do dispositivo retorne para a tela de Login.
            navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
        } catch (error: any) {
            console.error('Erro ao entrar:', error);

            const mensagem =
                error?.code === 'auth/invalid-credential' ||
                    error?.code === 'auth/wrong-password' ||
                    error?.code === 'auth/user-not-found'
                    ? 'E-mail ou senha incorretos.'
                    : error?.code === 'auth/too-many-requests'
                        ? 'Muitas tentativas. Aguarde um momento e tente novamente.'
                        : error?.code === 'auth/invalid-email'
                            ? 'Informe um e-mail válido.'
                            : 'Não foi possível entrar. Tente novamente.';

            Alert.alert('Erro ao entrar', mensagem);
        } finally {
            setLoading(false);
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
                <View style={styles.headerBar}>
                    <View style={styles.logoCircle}>
                        <Text style={styles.logoText}>A</Text>
                    </View>
                    <Text style={styles.title}>Entrar</Text>
                    <Text style={styles.subtitle}>
                        Acesse sua conta para continuar usando o Ampara.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.fieldWrapper}>
                        <Text style={typography.label}>E-mail</Text>
                        <TextInput
                            style={[styles.input, errors.email && styles.inputError]}
                            placeholder="seuemail@exemplo.com"
                            placeholderTextColor={colors.placeholder}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        {errors.email ? (
                            <Text style={typography.errorText}>{errors.email}</Text>
                        ) : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={typography.label}>Senha</Text>
                        <TextInput
                            style={[styles.input, errors.senha && styles.inputError]}
                            placeholder="Digite sua senha"
                            placeholderTextColor={colors.placeholder}
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry
                        />
                        {errors.senha ? (
                            <Text style={typography.errorText}>{errors.senha}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleEntrar}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={typography.button}>Entrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation?.navigate?.('CadastroUsuaria')}
                    >
                        <Text style={styles.linkText}>Ainda não tenho conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingBottom: 32,
    },
    headerBar: {
        alignItems: 'center',
        marginBottom: 24,
    },
    logoCircle: {
        width: 64,
        height: 64,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    logoText: {
        color: colors.white,
        fontSize: 28,
        fontWeight: '700',
    },
    title: {
        ...typography.title,
        marginBottom: 4,
    },
    subtitle: {
        ...typography.subtitle,
        textAlign: 'center',
        paddingHorizontal: 16,
    },
    form: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: 24,
        borderWidth: 1,
        borderColor: colors.border,
    },
    fieldWrapper: {
        marginBottom: 16,
    },
    input: {
        ...typography.input,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginTop: 4,
    },
    inputError: {
        borderColor: colors.error,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    linkButton: {
        marginTop: 16,
        alignItems: 'center',
    },
    linkText: {
        color: colors.primaryDark,
        fontWeight: '600',
        fontSize: 14,
    },
});