// src/screens/CadastroContatoConfiancaScreen.tsx
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
import {
    collection,
    addDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';
import { ParentescoContato } from '../types/models';

interface FormErrors {
    nome?: string;
    telefone?: string;
    parentesco?: string;
}

const OPCOES_PARENTESCO: ParentescoContato[] = [
    'Familiar',
    'Amigo(a)',
    'Vizinho(a)',
    'Colega de trabalho',
    'Outro',
];

function formatarTelefone(valor: string): string {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 7) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

export default function CadastroContatoConfiancaScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [parentesco, setParentesco] = useState<ParentescoContato | null>(
        null
    );
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    function validar(): boolean {
        const novosErros: FormErrors = {};

        if (!nome.trim()) {
            novosErros.nome = 'Informe o nome do contato.';
        }

        const digitosTelefone = telefone.replace(/\D/g, '');
        if (!digitosTelefone) {
            novosErros.telefone = 'Informe o telefone do contato.';
        } else if (digitosTelefone.length < 10) {
            novosErros.telefone = 'Telefone incompleto.';
        }

        if (!parentesco) {
            novosErros.parentesco = 'Selecione o tipo de relação.';
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    async function handleCadastrar() {
        if (!validar()) return;

        setLoading(true);

        const usuariaId = await new Promise<string | null>((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user?.uid ?? null);
            });
        });

        if (!usuariaId) {
            setLoading(false);
            Alert.alert(
                'Sessão expirada',
                'Faça login novamente para cadastrar um contato de confiança.'
            );
            return;
        }

        try {
            await addDoc(collection(db, 'contatosConfianca'), {
                usuariaId,
                nome: nome.trim(),
                telefone: `55${telefone.replace(/\D/g, '')}`, 
                parentesco,
                createdAt: serverTimestamp(),
            });

            Alert.alert(
                'Contato cadastrado',
                `${nome.trim()} foi adicionado(a) aos seus contatos de confiança.`
            );
            setNome('');
            setTelefone('');
            setParentesco(null);
            navigation?.navigate?.('Informacoes');
        } catch (error) {
            Alert.alert(
                'Erro ao cadastrar',
                'Não foi possível salvar o contato. Tente novamente.'
            );
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
                        <Text style={styles.logoText}>♥</Text>
                    </View>
                    <Text style={styles.title}>Contato de confiança</Text>
                    <Text style={styles.subtitle}>
                        Essa pessoa poderá ser acionada em situações de emergência,
                        recebendo alertas com sua localização.
                    </Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.fieldWrapper}>
                        <Text style={typography.label}>Nome do contato</Text>
                        <TextInput
                            style={[styles.input, errors.nome && styles.inputError]}
                            placeholder="Digite o nome"
                            placeholderTextColor={colors.placeholder}
                            value={nome}
                            onChangeText={setNome}
                            autoCapitalize="words"
                        />
                        {errors.nome ? (
                            <Text style={typography.errorText}>{errors.nome}</Text>
                        ) : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={typography.label}>Telefone</Text>
                        <TextInput
                            style={[styles.input, errors.telefone && styles.inputError]}
                            placeholder="(53) 99999-9999"
                            placeholderTextColor={colors.placeholder}
                            value={telefone}
                            onChangeText={(v) => setTelefone(formatarTelefone(v))}
                            keyboardType="phone-pad"
                        />
                        {errors.telefone ? (
                            <Text style={typography.errorText}>{errors.telefone}</Text>
                        ) : null}
                    </View>

                    <View style={styles.fieldWrapper}>
                        <Text style={typography.label}>Relação com o contato</Text>
                        <View style={styles.chipsWrapper}>
                            {OPCOES_PARENTESCO.map((opcao) => {
                                const selecionado = parentesco === opcao;
                                return (
                                    <TouchableOpacity
                                        key={opcao}
                                        style={[
                                            styles.chip,
                                            selecionado && styles.chipSelected,
                                        ]}
                                        onPress={() => setParentesco(opcao)}
                                        activeOpacity={0.8}
                                    >
                                        <Text
                                            style={[
                                                styles.chipText,
                                                selecionado && styles.chipTextSelected,
                                            ]}
                                        >
                                            {opcao}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                        {errors.parentesco ? (
                            <Text style={typography.errorText}>{errors.parentesco}</Text>
                        ) : null}
                    </View>

                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleCadastrar}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={typography.button}>Salvar contato</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation?.goBack?.()}
                    >
                        <Text style={styles.linkText}>Cadastrar mais tarde</Text>
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
        fontSize: 26,
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
    chipsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: 4,
    },
    chip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        borderWidth: 1,
        borderColor: colors.primaryLight,
        backgroundColor: colors.primarySoft,
    },
    chipSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    chipText: {
        fontSize: 13,
        color: colors.primaryDark,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: colors.white,
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