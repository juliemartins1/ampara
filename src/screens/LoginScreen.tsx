// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { emailFoiVerificado } from '../services/verificarEmailService';
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

            // Só entra na Home quem já confirmou o código do e-mail.
            // Quem não confirmou vai para a tela do código.
            const verificado = await emailFoiVerificado();
            navigation.reset({
                index: 0,
                routes: [{ name: verificado ? 'Home' : 'VerificarEmail' }],
            });
        } catch (error: any) {
            console.error('Erro ao entrar:', error);
            Alert.alert('Erro ao entrar', mensagemErroAuth(error?.code, 'login'));
        } finally {
            setLoading(false);
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

            <TouchableOpacity
                style={formStyles.linkBotao}
                onPress={() => navigation?.navigate?.('CadastroUsuaria')}
            >
                <Text style={formStyles.linkTexto}>Ainda não tenho conta</Text>
            </TouchableOpacity>
        </TelaFormulario>
    );
}