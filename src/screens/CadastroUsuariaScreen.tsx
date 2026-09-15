// src/screens/CadastroUsuariaScreen.tsx
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
    Modal,
    FlatList,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';
import { BAIRROS_RIO_GRANDE } from '../constants/bairrosRioGrande';

interface FormErrors {
    nome?: string;
    email?: string;
    telefone?: string;
    bairro?: string;
    senha?: string;
    confirmarSenha?: string;
}

function formatarTelefone(valor: string): string {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 7) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function CadastroUsuariaScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [bairro, setBairro] = useState('');
    const [modalBairroVisivel, setModalBairroVisivel] = useState(false);
    const [buscaBairro, setBuscaBairro] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const bairrosFiltrados = BAIRROS_RIO_GRANDE.filter((b) =>
        b.toLowerCase().includes(buscaBairro.trim().toLowerCase())
    );

    function selecionarBairro(valorSelecionado: string) {
        setBairro(valorSelecionado);
        setErrors((prev) => ({ ...prev, bairro: undefined }));
        setBuscaBairro('');
        setModalBairroVisivel(false);
    }

    function validar(): boolean {
        const novosErros: FormErrors = {};

        if (!nome.trim()) {
            novosErros.nome = 'Informe seu nome.';
        }

        if (!email.trim()) {
            novosErros.email = 'Informe seu e-mail.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            novosErros.email = 'Informe um e-mail válido.';
        }

        const digitosTelefone = telefone.replace(/\D/g, '');
        if (!digitosTelefone) {
            novosErros.telefone = 'Informe seu telefone.';
        } else if (digitosTelefone.length < 10) {
            novosErros.telefone = 'Telefone incompleto.';
        }

        if (!bairro.trim()) {
            novosErros.bairro = 'Selecione seu bairro.';
        }

        if (!senha) {
            novosErros.senha = 'Crie uma senha.';
        } else if (senha.length < 6) {
            novosErros.senha = 'A senha deve ter ao menos 6 caracteres.';
        }

        if (confirmarSenha !== senha) {
            novosErros.confirmarSenha = 'As senhas não coincidem.';
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    async function handleCadastrar() {
        if (!validar()) return;

        setLoading(true);
        try {
            const credencial = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                senha
            );

            try {
                await setDoc(doc(db, 'usuarias', credencial.user.uid), {
                    nome: nome.trim(),
                    email: email.trim(),
                    telefone: `55${telefone.replace(/\D/g, '')}`,
                    bairro,
                    createdAt: serverTimestamp(),
                });
            } catch (firestoreError) {
                // A conta JÁ FOI criada no Firebase Auth neste ponto, mesmo
                // que salvar os dados no Firestore tenha falhado (ex: regras
                // de segurança bloqueando a escrita). Registrar isso é
                // importante para não confundir com "cadastro não existe".
                console.error(
                    'Conta criada no Auth, mas falhou ao salvar no Firestore:',
                    firestoreError
                );
                throw firestoreError;
            }

            Alert.alert('Cadastro realizado', 'Sua conta foi criada com sucesso.');
            navigation?.navigate?.('CadastroContatoConfianca');
        } catch (error: any) {
            console.error('Erro ao cadastrar usuária:', error);

            const mensagem =
                error?.code === 'auth/email-already-in-use'
                    ? 'Este e-mail já está cadastrado.'
                    : error?.code === 'auth/invalid-email'
                        ? 'Informe um e-mail válido.'
                        : error?.code === 'auth/weak-password'
                            ? 'A senha é muito fraca. Use ao menos 6 caracteres.'
                            : error?.code === 'auth/network-request-failed'
                                ? 'Falha de conexão. Verifique sua internet e tente novamente.'
                                : error?.code === 'auth/operation-not-allowed'
                                    ? 'Cadastro por e-mail e senha não está habilitado no momento.'
                                    : error?.code === 'permission-denied'
                                        ? 'Sua conta foi criada, mas não foi possível salvar seus dados. Contate o suporte.'
                                        : 'Não foi possível concluir o cadastro. Tente novamente.';

            Alert.alert('Erro no cadastro', mensagem);
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
                    <Text style={styles.title}>Criar conta</Text>
                    <Text style={styles.subtitle}>
                        Seus dados são protegidos e usados apenas para o funcionamento do
                        aplicativo.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Campo
                        label="Nome completo"
                        value={nome}
                        onChangeText={setNome}
                        placeholder="Digite seu nome"
                        error={errors.nome}
                        autoCapitalize="words"
                    />

                    <Campo
                        label="E-mail"
                        value={email}
                        onChangeText={setEmail}
                        placeholder="seuemail@exemplo.com"
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Campo
                        label="Telefone"
                        value={telefone}
                        onChangeText={(v: string) => setTelefone(formatarTelefone(v))}
                        placeholder="(53) 99999-9999"
                        error={errors.telefone}
                        keyboardType="phone-pad"
                    />

                    <View style={styles.fieldWrapper}>
                        <Text style={typography.label}>Bairro</Text>
                        <TouchableOpacity
                            style={[
                                styles.input,
                                styles.selectInput,
                                errors.bairro && styles.inputError,
                            ]}
                            onPress={() => setModalBairroVisivel(true)}
                            activeOpacity={0.7}
                        >
                            <Text
                                style={
                                    bairro
                                        ? styles.selectValueText
                                        : styles.selectPlaceholderText
                                }
                            >
                                {bairro || 'Selecione seu bairro em Rio Grande'}
                            </Text>
                        </TouchableOpacity>
                        {errors.bairro ? (
                            <Text style={typography.errorText}>{errors.bairro}</Text>
                        ) : null}
                    </View>

                    <Campo
                        label="Senha"
                        value={senha}
                        onChangeText={setSenha}
                        placeholder="Mínimo de 6 caracteres"
                        error={errors.senha}
                        secureTextEntry
                    />

                    <Campo
                        label="Confirmar senha"
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha}
                        placeholder="Repita a senha"
                        error={errors.confirmarSenha}
                        secureTextEntry
                    />

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleCadastrar}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={typography.button}>Cadastrar</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation?.navigate?.('Login')}
                    >
                        <Text style={styles.linkText}>Já tenho uma conta</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal
                visible={modalBairroVisivel}
                animationType="slide"
                transparent
                onRequestClose={() => setModalBairroVisivel(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Selecione seu bairro</Text>

                        <TextInput
                            style={styles.modalSearchInput}
                            placeholder="Buscar bairro..."
                            placeholderTextColor={colors.placeholder}
                            value={buscaBairro}
                            onChangeText={setBuscaBairro}
                            autoCapitalize="words"
                        />

                        <FlatList
                            data={bairrosFiltrados}
                            keyExtractor={(item) => item}
                            style={styles.modalList}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => selecionarBairro(item)}
                                >
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.modalEmptyText}>
                                    Nenhum bairro encontrado.
                                </Text>
                            }
                        />

                        <TouchableOpacity
                            style={styles.modalCloseButton}
                            onPress={() => {
                                setBuscaBairro('');
                                setModalBairroVisivel(false);
                            }}
                        >
                            <Text style={styles.modalCloseText}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

// Componente de campo reutilizável com rótulo e mensagem de erro
function Campo({
    label,
    error,
    ...inputProps
}: {
    label: string;
    error?: string;
    [key: string]: any;
}) {
    return (
        <View style={styles.fieldWrapper}>
            <Text style={typography.label}>{label}</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholderTextColor={colors.placeholder}
                {...inputProps}
            />
            {error ? <Text style={typography.errorText}>{error}</Text> : null}
        </View>
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
        marginBottom: 12,
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
        borderRadius: 12,
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
        marginTop: 32,
    },
    inputError: {
        borderColor: colors.error,
    },
    selectInput: {
        justifyContent: 'center',
    },
    selectValueText: {
        ...typography.input,
    },
    selectPlaceholderText: {
        ...typography.input,
        color: colors.placeholder,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(46, 32, 51, 0.45)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: 24,
        maxHeight: '75%',
    },
    modalTitle: {
        ...typography.title,
        fontSize: 18,
        marginBottom: 24,
    },
    modalSearchInput: {
        ...typography.input,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 24,
        paddingVertical: 10,
        marginBottom: 8,
    },
    modalList: {
        marginBottom: 8,
    },
    modalItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalItemText: {
        ...typography.input,
        color: colors.textPrimary,
    },
    modalEmptyText: {
        ...typography.helper,
        textAlign: 'center',
        paddingVertical: 24,
    },
    modalCloseButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    modalCloseText: {
        color: colors.primaryDark,
        fontWeight: '600',
        fontSize: 14,
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