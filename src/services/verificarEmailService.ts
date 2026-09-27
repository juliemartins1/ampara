import * as Crypto from 'expo-crypto';
import { send } from '@emailjs/react-native';
import { deleteDoc, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';
import {
    EMAILJS_PUBLIC_KEY,
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
} from '../config/emailjs';

const VALIDADE_MS = 10 * 60 * 1000; // 10 minutos
const MAX_TENTATIVAS = 5;
export const ESPERA_REENVIO_S = 60;

export type ResultadoConfirmacao =
    | { ok: true }
    | { ok: false; motivo: 'incorreto'; restantes: number }
    | { ok: false; motivo: 'expirado' | 'bloqueado' | 'inexistente' };

function uidAtual(): string {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuária não autenticada.');
    return uid;
}

function refVerificacao() {
    return doc(db, 'verificacoesEmail', uidAtual());
}

/** Código de 6 dígitos com gerador criptográfico (não usa Math.random). */
function gerarCodigo(): string {
    const bytes = Crypto.getRandomBytes(4);
    const numero = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
    return String(numero % 1_000_000).padStart(6, '0');
}

/** Hash com o uid junto ("sal"), para o mesmo código não gerar o mesmo hash. */
function hashCodigo(codigo: string): Promise<string> {
    return Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        `${uidAtual()}:${codigo}`
    );
}

/** Existe um código ainda válido? (evita reenviar toda vez que abre a tela) */
export async function existeCodigoValido(): Promise<boolean> {
    const snap = await getDoc(refVerificacao());
    return snap.exists() && Date.now() < snap.data().expiraEm;
}

/** Gera um código novo, salva o hash e envia por e-mail. */
export async function enviarCodigo(): Promise<void> {
    const user = auth.currentUser;
    if (!user?.email) throw new Error('Usuária não autenticada.');

    const codigo = gerarCodigo();
    await setDoc(refVerificacao(), {
        codigoHash: await hashCodigo(codigo),
        expiraEm: Date.now() + VALIDADE_MS,
        tentativas: 0,
    });

    // Os nomes {{email}}, {{codigo}} e {{validade}} precisam existir no template do EmailJS
    await send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        { email: user.email, codigo, validade: '10 minutos' },
        { publicKey: EMAILJS_PUBLIC_KEY }
    );
}

/** Confere o código digitado. */
export async function confirmarCodigo(codigoDigitado: string): Promise<ResultadoConfirmacao> {
    const ref = refVerificacao();
    const snap = await getDoc(ref);
    if (!snap.exists()) return { ok: false, motivo: 'inexistente' };

    const { codigoHash, expiraEm, tentativas } = snap.data();
    if (Date.now() > expiraEm) return { ok: false, motivo: 'expirado' };
    if (tentativas >= MAX_TENTATIVAS) return { ok: false, motivo: 'bloqueado' };

    if ((await hashCodigo(codigoDigitado)) !== codigoHash) {
        await updateDoc(ref, { tentativas: tentativas + 1 });
        const restantes = MAX_TENTATIVAS - tentativas - 1;
        return restantes > 0
            ? { ok: false, motivo: 'incorreto', restantes }
            : { ok: false, motivo: 'bloqueado' };
    }

    // Deu certo: marca a usuária como verificada e apaga o código usado.
    // O App.tsx está ouvindo esse campo e leva para a Home sozinho.
    await setDoc(doc(db, 'usuarias', uidAtual()), { emailVerificado: true }, { merge: true });
    await deleteDoc(ref);
    return { ok: true };
}