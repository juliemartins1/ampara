// src/screens/EditarPerfilScreen.tsx
// Edição de nome, telefone e bairro. O e-mail não é editável porque é o
// login da conta (trocar exigiria verificar o novo e-mail).
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { getDoc, doc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { atualizarUsuaria } from '../services/usuariaService';
import { validarTelefone } from '../utils/validarTelefone';
import { formatarTelefone, telefoneParaExibicao, telefoneParaSalvar } from '../utils/formatarTelefone';
import { semErros } from '../utils/validacao';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import SeletorBairro from '../components/SeletorBairro';
import { colors } from '../theme/colors';

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
        return semErros(novos);
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
        <TelaFormulario>
            <Campo
                label="Nome completo"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                erro={erros.nome}
            />
            <Campo
                label="E-mail"
                value={auth.currentUser?.email ?? ''}
                editable={false}
                ajuda="O e-mail é usado para entrar na conta e não pode ser alterado."
            />
            <Campo
                label="Telefone"
                placeholder="(53) 99999-9999"
                value={telefone}
                onChangeText={(v) => setTelefone(formatarTelefone(v))}
                keyboardType="phone-pad"
                erro={erros.telefone}
            />
            <SeletorBairro valor={bairro} aoSelecionar={setBairro} erro={erros.bairro} />
            <BotaoPrimario titulo="Salvar alterações" onPress={salvar} carregando={salvando} />
        </TelaFormulario>
    );
}

const styles = StyleSheet.create({
    centro: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});