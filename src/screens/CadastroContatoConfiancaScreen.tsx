// src/screens/CadastroContatoConfiancaScreen.tsx
// Serve para CRIAR e para EDITAR contato. Se a tela receber
// route.params.contato, entra em modo edição.
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { validarTelefone } from '../utils/validarTelefone';
import { formatarTelefone, telefoneParaExibicao, telefoneParaSalvar } from '../utils/formatarTelefone';
import { Contato, criarContato, editarContato } from '../services/contatosService';
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

export default function CadastroContatoConfiancaScreen({ navigation, route }: any) {
    // Se veio um contato pela navegação, a tela está em modo EDIÇÃO
    const contatoEmEdicao: Contato | undefined = route?.params?.contato;
    const editando = !!contatoEmEdicao;

    // Em modo edição, os campos já começam preenchidos com os dados do contato
    const [nome, setNome] = useState(contatoEmEdicao?.nome ?? '');
    const [telefone, setTelefone] = useState(
        contatoEmEdicao ? telefoneParaExibicao(contatoEmEdicao.telefone) : ''
    );
    const [parentesco, setParentesco] = useState<ParentescoContato | null>(
        contatoEmEdicao?.parentesco ?? null
    );
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    // Muda o título do cabeçalho conforme o modo
    useLayoutEffect(() => {
        navigation.setOptions({ title: editando ? 'Editar contato' : 'Novo contato' });
    }, [navigation, editando]);

    function validar(): boolean {
        const novosErros: FormErrors = {};

        if (!nome.trim()) {
            novosErros.nome = 'Informe o nome do contato.';
        }

        const resultadoTelefone = validarTelefone(telefone);
        if (!resultadoTelefone.valido) {
            novosErros.telefone = resultadoTelefone.mensagem;
        }

        if (!parentesco) {
            novosErros.parentesco = 'Selecione o tipo de relação.';
        }

        setErrors(novosErros);
        return Object.keys(novosErros).length === 0;
    }

    async function handleSalvar() {
        if (!validar()) return;

        setLoading(true);
        const dados = {
            nome: nome.trim(),
            telefone: telefoneParaSalvar(telefone),
            parentesco: parentesco as ParentescoContato,
        };

        try {
            if (editando) {
                await editarContato(contatoEmEdicao!.id, dados);
            } else {
                await criarContato(dados);
                Alert.alert(
                    'Contato cadastrado',
                    `${dados.nome} foi adicionado(a) aos seus contatos de confiança.`
                );
            }
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao salvar contato:', error);
            Alert.alert('Erro ao salvar', 'Não foi possível salvar o contato. Tente novamente.');
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
                    <Text style={styles.title}>
                        {editando ? 'Editar contato' : 'Contato de confiança'}
                    </Text>
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
                        onPress={handleSalvar}
                        disabled={loading}
                        activeOpacity={0.85}
                    >
                        {loading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={typography.button}>
                                {editando ? 'Salvar alterações' : 'Salvar contato'}
                            </Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.linkButton}
                        onPress={() => navigation?.goBack?.()}
                    >
                        <Text style={styles.linkText}>
                            {editando ? 'Cancelar' : 'Cadastrar mais tarde'}
                        </Text>
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