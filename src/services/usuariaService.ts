// src/services/usuariaService.ts
// Operações sobre a conta e os dados da usuária (documento usuarias/{uid}).
import {
    EmailAuthProvider,
    deleteUser,
    reauthenticateWithCredential,
    signOut,
    updatePassword,
} from 'firebase/auth';
import {
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { CHAVE_ULTIMA_LOCALIZACAO } from './alertaService';
import { CHAVE_CACHE_CONTATOS } from './contatosService';
import { CHAVE_EMAIL_VERIFICADO, emailFoiVerificado } from './verificarEmailService';

export interface DadosUsuaria {
    nome: string;
    email: string;
    telefone: string; // 55 + DDD + número
    bairro: string;
}

export type DadosEditaveis = Pick<DadosUsuaria, 'nome' | 'telefone' | 'bairro'>;

function uidAtual(): string {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuária não autenticada.');
    return uid;
}

/** Escuta o documento da usuária; a tela atualiza sozinha depois de editar. */
export function ouvirUsuaria(
    aoMudar: (dados: DadosUsuaria | null) => void,
    aoFalhar?: (erro: Error) => void
) {
    return onSnapshot(
        doc(db, 'usuarias', uidAtual()),
        (snap) => aoMudar(snap.exists() ? (snap.data() as DadosUsuaria) : null),
        (erro) => aoFalhar?.(erro)
    );
}

export function atualizarUsuaria(dados: DadosEditaveis) {
    return updateDoc(doc(db, 'usuarias', uidAtual()), {
        ...dados,
        updatedAt: serverTimestamp(),
    });
}

/**
 * Tela certa para a sessão atual. Usada ao abrir o app, no login e ao sair do disfarce:
 *   sem login -> Login | e-mail não verificado -> VerificarEmail | verificada -> Home
 */
export async function rotaDaSessao(): Promise<'Login' | 'VerificarEmail' | 'Home'> {
    if (!auth.currentUser) return 'Login';
    return (await emailFoiVerificado().catch(() => false)) ? 'Home' : 'VerificarEmail';
}

/** Apaga dados locais sensíveis ao sair (outra pessoa pode usar o celular). */
async function limparDadosLocais() {
    await AsyncStorage.multiRemove([
        CHAVE_CACHE_CONTATOS,
        CHAVE_ULTIMA_LOCALIZACAO,
        CHAVE_EMAIL_VERIFICADO,
    ]).catch(() => { });
}

export async function sairDaConta() {
    await limparDadosLocais();
    await signOut(auth);
}

/**
 * Exclui a conta e todos os dados da usuária (LGPD / exigência da Google Play).
 * O Firebase só permite excluir a conta com login recente, por isso
 * pedimos a senha de novo (reautenticação).
 */
export async function excluirConta(senha: string) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Usuária não autenticada.');

    await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, senha)
    );

    // O Firestore não apaga subcoleções junto com o documento pai,
    // então os contatos precisam ser apagados um por um.
    const contatos = await getDocs(
        collection(db, 'usuarias', user.uid, 'contatosConfianca')
    );
    await Promise.all(contatos.docs.map((d) => deleteDoc(d.ref)));
    await deleteDoc(doc(db, 'verificacoesEmail', user.uid));
    await deleteDoc(doc(db, 'usuarias', user.uid));

    await limparDadosLocais();
    await deleteUser(user); // por último: sem login, o Firestore não deixaria apagar
}

/**
 * Troca a senha sem enviar e-mail. O Firebase exige login recente para
 * isso, então confirmamos a senha atual antes (reautenticação).
 */
export async function alterarSenha(senhaAtual: string, novaSenha: string) {
    const user = auth.currentUser;
    if (!user || !user.email) throw new Error('Usuária não autenticada.');

    await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, senhaAtual)
    );
    await updatePassword(user, novaSenha);
}