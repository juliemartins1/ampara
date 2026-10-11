// src/screens/CadastroContatoConfiancaScreen.tsx
// Serve para CRIAR e para EDITAR contato. Se a tela receber
// route.params.contato, entra em modo edição.
import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { validarTelefone } from '../utils/validarTelefone';
import { formatarTelefone, telefoneParaExibicao, telefoneParaSalvar } from '../utils/formatarTelefone';
import { semErros } from '../utils/validacao';
import { Contato, criarContato, editarContato } from '../services/contatosService';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import { formStyles } from '../theme/formStyle';
import { colors, spacing, radius, typography } from '../theme/colors';
import { ParentescoContato, OPCOES_PARENTESCO } from '../types/models';

interface FormErrors {
    nome?: string;
    telefone?: string;
    parentesco?: string;
}

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

        if (!nome.trim()) novosErros.nome = 'Informe o nome do contato.';

        const resultadoTelefone = validarTelefone(telefone);
        if (!resultadoTelefone.valido) novosErros.telefone = resultadoTelefone.mensagem;

        if (!parentesco) novosErros.parentesco = 'Selecione o tipo de relação.';

        setErrors(novosErros);
        return semErros(novosErros);
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
            if (contatoEmEdicao) {
                await editarContato(contatoEmEdicao.id, dados);
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
        <TelaFormulario
            icone="♥"
            titulo={editando ? 'Editar contato' : 'Contato de confiança'}
            subtitulo="Essa pessoa poderá ser acionada em situações de emergência, recebendo alertas com sua localização."
            emCartao
        >
            <Campo
                label="Nome do contato"
                placeholder="Digite o nome"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                erro={errors.nome}
            />

            <Campo
                label="Telefone"
                placeholder="(53) 99999-9999"
                value={telefone}
                onChangeText={(v) => setTelefone(formatarTelefone(v))}
                keyboardType="phone-pad"
                erro={errors.telefone}
            />

            <View style={formStyles.campo}>
                <Text style={typography.label}>Relação com o contato</Text>
                <View style={styles.chipsWrapper}>
                    {OPCOES_PARENTESCO.map((opcao) => {
                        const selecionado = parentesco === opcao;
                        return (
                            <TouchableOpacity
                                key={opcao}
                                style={[styles.chip, selecionado && styles.chipSelected]}
                                onPress={() => setParentesco(opcao)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.chipText, selecionado && styles.chipTextSelected]}>
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

            <BotaoPrimario
                titulo={editando ? 'Salvar alterações' : 'Salvar contato'}
                onPress={handleSalvar}
                carregando={loading}
            />

            <TouchableOpacity style={formStyles.linkBotao} onPress={() => navigation?.goBack?.()}>
                <Text style={formStyles.linkTexto}>
                    {editando ? 'Cancelar' : 'Cadastrar mais tarde'}
                </Text>
            </TouchableOpacity>
        </TelaFormulario>
    );
}

const styles = StyleSheet.create({
    chipsWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    chip: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
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
});