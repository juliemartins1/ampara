// src/screens/EditarPerfilScreen.tsx
// Edição de nome, telefone e bairro. O e-mail não é editável porque é o
// login da conta (trocar exigiria verificar o novo e-mail).
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { getDoc, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { atualizarUsuaria } from '../services/usuariaService';
import { validarTelefone } from '../utils/validarTelefone';
import {
    formatarTelefone,
    telefoneParaExibicao,
    telefoneParaSalvar,
} from '../utils/formatarTelefone';
import SeletorBairro from '../components/SeletorBairro';
import { colors, spacing, radius, typography } from '../theme/colors';

interface Erros {
    nome?: string;
    telefone?: string;
    bairro?: string;
}

export default function EditarPerfilScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [telefone, setTelefone] = useState('');
    const [bairro, setBairro] = useState('');
    const [erros, setErros] = useState<Erros>({});
    const [carregando, setCarregando] = useState(true);
    const [salvando, setSalvando] = useState(false);

    useEffect(() => {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        getDoc(doc(db, 'usuarias', uid))
            .then((snap) => {
                const d = snap.data();
                setNome(d?.nome ?? '');
                setTelefone(d?.telefone ? telefoneParaExibicao(d.telefone) : '');
                setBairro(d?.bairro ?? '');
            })
            .catch(() => Alert.alert('Erro', 'Não foi possível carregar seus dados.'))
            .finally(() => setCarregando(false));
    }, []);

    function validar(): boolean {
        const novos: Erros = {};
        if (nome.trim().length < 2) novos.nome = 'Informe seu nome.';
        const tel = validarTelefone(telefone);
        if (!tel.valido) novos.telefone = tel.mensagem;
        if (!bairro) novos.bairro = 'Selecione seu bairro.';
        setErros(novos);
        return Object.keys(novos).length === 0;
    }

    async function salvar() {
        if (!validar()) return;
        setSalvando(true);
        try {
            await atualizarUsuaria({
                nome: nome.trim(),
                telefone: telefoneParaSalvar(telefone),
                bairro,
            });
            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: nome.trim() });
            }
            Alert.alert('Dados atualizados', 'Suas informações foram salvas.');
            navigation.goBack();
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    if (carregando) {
        return (
            <View style={styles.centro}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
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
                    <Text style={typography.label}>Nome completo</Text>
                    <TextInput
                        style={[styles.input, erros.nome ? styles.inputErro : null]}
                        value={nome}
                        onChangeText={setNome}
                        autoCapitalize="words"
                    />
                    {erros.nome ? <Text style={typography.errorText}>{erros.nome}</Text> : null}
                </View>

                <View style={styles.campo}>
                    <Text style={typography.label}>E-mail</Text>
                    <TextInput
                        style={[styles.input, styles.inputDesativado]}
                        value={auth.currentUser?.email ?? ''}
                        editable={false}
                    />
                    <Text style={typography.helper}>
                        O e-mail é usado para entrar na conta e não pode ser alterado.
                    </Text>
                </View>

                <View style={styles.campo}>
                    <Text style={typography.label}>Telefone</Text>
                    <TextInput
                        style={[styles.input, erros.telefone ? styles.inputErro : null]}
                        value={telefone}
                        onChangeText={(v) => setTelefone(formatarTelefone(v))}
                        keyboardType="phone-pad"
                        placeholder="(53) 99999-9999"
                        placeholderTextColor={colors.placeholder}
                    />
                    {erros.telefone ? <Text style={typography.errorText}>{erros.telefone}</Text> : null}
                </View>

                <SeletorBairro valor={bairro} aoSelecionar={setBairro} erro={erros.bairro} />

                <TouchableOpacity
                    style={[styles.botao, salvando && { opacity: 0.6 }]}
                    onPress={salvar}
                    disabled={salvando}
                    activeOpacity={0.85}
                >
                    {salvando ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={typography.button}>Salvar alterações</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg },
    centro: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
    inputDesativado: { backgroundColor: colors.primarySoft, color: colors.textSecondary },
    botao: {
        backgroundColor: colors.primary,
        borderRadius: radius.md,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: spacing.md,
    },
});