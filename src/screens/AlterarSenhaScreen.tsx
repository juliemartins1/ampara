// src/screens/AlterarSenhaScreen.tsx
// Troca de senha dentro do app, sem enviar e-mail (mais discreto).
import React, { useState } from 'react';
import { Alert } from 'react-native';
import { alterarSenha } from '../services/usuariaService';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import { semErros, TAMANHO_MINIMO_SENHA } from '../utils/validacao';
import { mensagemErroAuth } from '../utils/mensagemErroAuth';

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
        if (novaSenha.length < TAMANHO_MINIMO_SENHA) {
            novos.nova = `A nova senha precisa ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
        } else if (novaSenha === senhaAtual) {
            novos.nova = 'A nova senha deve ser diferente da atual.';
        }
        if (confirmar !== novaSenha) novos.confirmar = 'As senhas não conferem.';
        setErros(novos);
        return semErros(novos);
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
        <TelaFormulario>
            <Campo
                label="Senha atual"
                value={senhaAtual}
                onChangeText={setSenhaAtual}
                secureTextEntry
                erro={erros.atual}
            />
            <Campo
                label="Nova senha"
                placeholder={`Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`}
                value={novaSenha}
                onChangeText={setNovaSenha}
                secureTextEntry
                erro={erros.nova}
            />
            <Campo
                label="Confirmar nova senha"
                value={confirmar}
                onChangeText={setConfirmar}
                secureTextEntry
                erro={erros.confirmar}
            />
            <BotaoPrimario titulo="Alterar senha" onPress={salvar} carregando={salvando} />
        </TelaFormulario>
    );
}