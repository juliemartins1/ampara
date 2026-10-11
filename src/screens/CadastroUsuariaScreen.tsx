// src/screens/CadastroUsuariaScreen.tsx
import React, { useState } from 'react';
import { Text, TouchableOpacity, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import SeletorBairro from '../components/SeletorBairro';
import { formStyles } from '../theme/formStyle';
import { validarTelefone } from '../utils/validarTelefone';
import { formatarTelefone, telefoneParaSalvar } from '../utils/formatarTelefone';
import { validarEmail, semErros, TAMANHO_MINIMO_SENHA } from '../utils/validacao';
import { mensagemErroAuth } from '../utils/mensagemErroAuth';

interface FormErrors {
    nome?: string;
    email?: string;
    telefone?: string;
    bairro?: string;
    senha?: string;
    confirmarSenha?: string;
}

export default function CadastroUsuariaScreen({ navigation }: any) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [bairro, setBairro] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    function selecionarBairro(valor: string) {
        setBairro(valor);
        setErrors((prev) => ({ ...prev, bairro: undefined }));
    }

    function validar(): boolean {
        const novosErros: FormErrors = {};

        if (!nome.trim()) novosErros.nome = 'Informe seu nome.';

        novosErros.email = validarEmail(email);

        const resultadoTelefone = validarTelefone(telefone);
        if (!resultadoTelefone.valido) novosErros.telefone = resultadoTelefone.mensagem;

        if (!bairro.trim()) novosErros.bairro = 'Selecione seu bairro.';

        if (!senha) {
            novosErros.senha = 'Crie uma senha.';
        } else if (senha.length < TAMANHO_MINIMO_SENHA) {
            novosErros.senha = `A senha deve ter ao menos ${TAMANHO_MINIMO_SENHA} caracteres.`;
        }

        if (confirmarSenha !== senha) novosErros.confirmarSenha = 'As senhas não coincidem.';

        setErrors(novosErros);
        return semErros(novosErros);
    }

    async function handleCadastrar() {
        if (!validar()) return;

        setLoading(true);
        try {
            const credencial = await createUserWithEmailAndPassword(auth, email.trim(), senha);

            try {
                await setDoc(doc(db, 'usuarias', credencial.user.uid), {
                    nome: nome.trim(),
                    email: email.trim(),
                    telefone: telefoneParaSalvar(telefone),
                    bairro,
                    emailVerificado: false, // vira true na tela do código
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

            // A conta criada já fica logada: o App.tsx mostra a tela do código sozinho.
            Alert.alert('Cadastro realizado', 'Enviamos um código de 6 dígitos para o seu e-mail.');
            navigation.reset({ index: 0, routes: [{ name: 'VerificarEmail' }] });
        } catch (error: any) {
            console.error('Erro ao cadastrar usuária:', error);
            Alert.alert('Erro no cadastro', mensagemErroAuth(error?.code, 'cadastro'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <TelaFormulario
            icone="A"
            titulo="Criar conta"
            subtitulo="Seus dados são protegidos e usados apenas para o funcionamento do aplicativo."
            emCartao
        >
            <Campo
                label="Nome completo"
                placeholder="Digite seu nome"
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
                erro={errors.nome}
            />

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
                label="Telefone"
                placeholder="(53) 99999-9999"
                value={telefone}
                onChangeText={(v) => setTelefone(formatarTelefone(v))}
                keyboardType="phone-pad"
                erro={errors.telefone}
            />

            <SeletorBairro valor={bairro} aoSelecionar={selecionarBairro} erro={errors.bairro} />

            <Campo
                label="Senha"
                placeholder={`Mínimo de ${TAMANHO_MINIMO_SENHA} caracteres`}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
                erro={errors.senha}
            />

            <Campo
                label="Confirmar senha"
                placeholder="Repita a senha"
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
                erro={errors.confirmarSenha}
            />

            <BotaoPrimario titulo="Cadastrar" onPress={handleCadastrar} carregando={loading} />

            <TouchableOpacity
                style={formStyles.linkBotao}
                onPress={() => navigation?.navigate?.('Login')}
            >
                <Text style={formStyles.linkTexto}>Já tenho uma conta</Text>
            </TouchableOpacity>
        </TelaFormulario>
    );
}