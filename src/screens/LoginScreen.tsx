// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { enviarEmailRedefinicaoSenha, rotaDaSessao } from '../services/usuariaService';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import { formStyles } from '../theme/formStyle';
import { validarEmail, semErros } from '../utils/validacao';
import { mensagemErroAuth } from '../utils/mensagemErroAuth';

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
        const novosErros: FormErrors = {
            email: validarEmail(email),
            senha: senha ? undefined : 'Informe sua senha.',
        };
        setErrors(novosErros);
        return semErros(novosErros);
    }

    async function handleEntrar() {
        if (!validar()) return;

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email.trim(), senha);

            // Só entra na Home quem já confirmou o código do e-mail
            navigation.reset({ index: 0, routes: [{ name: await rotaDaSessao() }] });
        } catch (error: any) {
            console.error('Erro ao entrar:', error);
            Alert.alert('Erro ao entrar', mensagemErroAuth(error?.code, 'login'));
        } finally {
            setLoading(false);
        }
    }

    // Usa o e-mail já digitado no campo
    async function esqueciSenha() {
        const erroEmail = validarEmail(email);
        if (erroEmail) {
            setErrors({ email: 'Digite seu e-mail acima para receber o link.' });
            return;
        }
        try {
            await enviarEmailRedefinicaoSenha(email);
            Alert.alert('Verifique seu e-mail', 'Se houver uma conta com este e-mail, enviamos um link para criar uma nova senha. Confira também o spam.');
        } catch (error: any) {
            Alert.alert('Erro', mensagemErroAuth(error?.code, 'login'));
        }
    }

    return (
        <TelaFormulario
            icone="A"
            titulo="Entrar"
            subtitulo="Acesse sua conta para continuar usando o Ampara."
            emCartao
        >
            <Campo
                label="E-mail"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                erro={errors.email}
            />

            <Campo
                label="Senha"
                placeholder="Digite sua senha"
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                erro={errors.senha}
            />

            <BotaoPrimario titulo="Entrar" onPress={handleEntrar} carregando={loading} />

            <TouchableOpacity style={formStyles.linkBotao} onPress={esqueciSenha}>
                <Text style={formStyles.linkTexto}>Esqueci minha senha</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={formStyles.linkBotao}
                onPress={() => navigation?.navigate?.('CadastroUsuaria')}
            >
                <Text style={formStyles.linkTexto}>Ainda não tenho conta</Text>
            </TouchableOpacity>
        </TelaFormulario>
    );
}