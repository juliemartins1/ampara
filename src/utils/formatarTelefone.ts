// src/utils/formatarTelefone.ts
// Funções de telefone compartilhadas entre cadastro de usuária, contatos e perfil.
// No Firestore o telefone é salvo como "55" + DDD + número (ex.: 5553999999999).

/** Aplica a máscara (53) 99999-9999 enquanto a usuária digita. */
export function formatarTelefone(valor: string): string {
    const digitos = valor.replace(/\D/g, '').slice(0, 11);
    if (digitos.length <= 2) return digitos;
    if (digitos.length <= 7) {
        return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
    }
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

/** "(53) 99999-9999" -> "5553999999999" (formato salvo no Firestore). */
export function telefoneParaSalvar(valorFormatado: string): string {
    return `55${valorFormatado.replace(/\D/g, '')}`;
}

/**
 * "5553999999999" -> "(53) 99999-9999".
 * Só remove o "55" quando o número tem 12 ou 13 dígitos (ou seja, veio com
 * código do país), porque 55 também é um DDD válido do RS.
 */
export function telefoneParaExibicao(salvo: string): string {
    const digitos = salvo.replace(/\D/g, '');
    const semPais =
        digitos.startsWith('55') && digitos.length >= 12 ? digitos.slice(2) : digitos;
    return formatarTelefone(semPais);
}