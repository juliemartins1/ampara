// src/services/verificarEmailService.ts
// Verificação de e-mail pelo próprio Firebase Authentication (gratuito):
// 1. O Firebase envia um e-mail com um link.
// 2. Ao tocar no link, o SERVIDOR do Google marca a conta como verificada.
// 3. A marcação vai dentro do token de login (email_verified), que ninguém
//    consegue falsificar, e as regras do Firestore conferem esse valor.
import { reload, sendEmailVerification } from 'firebase/auth';
import { auth } from './firebaseConfig';

export const ESPERA_REENVIO_S = 60;

function usuariaAtual() {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuária não autenticada.');
    return user;
}

/** Envia (ou reenvia) o e-mail com o link de confirmação, em português. */
export function enviarLinkVerificacao() {
    auth.languageCode = 'pt-BR';
    return sendEmailVerification(usuariaAtual());
}

/**
 * A usuária logada já tocou no link? Usado ao abrir o app, no login e na tela
 * de verificação. Sem internet, vale o último valor que o Firebase guardou
 * no celular (assim quem já é verificada não fica presa nem sem o SOS).
 */
export async function emailFoiVerificado(): Promise<boolean> {
    const user = usuariaAtual();
    try {
        await reload(user);
        // Renova o token para as regras do Firestore já enxergarem a verificação
        if (user.emailVerified) await user.getIdToken(true);
    } catch {
        // sem internet: segue com o valor guardado
    }
    return user.emailVerified;
}
