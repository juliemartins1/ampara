const DDDS_VALIDOS = new Set([
    11, 12, 13, 14, 15, 16, 17, 18, 19, // SP
    21, 22, 24, // RJ
    27, 28, // ES
    31, 32, 33, 34, 35, 37, 38, // MG
    41, 42, 43, 44, 45, 46, // PR
    47, 48, 49, // SC
    51, 53, 54, 55, // RS
    61, // DF
    62, 64, // GO
    63, // TO
    65, 66, // MT
    67, // MS
    68, // AC
    69, // RO
    71, 73, 74, 75, 77, // BA
    79, // SE
    81, 87, // PE
    82, // AL
    83, // PB
    84, // RN
    85, 88, // CE
    86, 89, // PI
    91, 93, 94, // PA
    92, 97, // AM
    95, // RR
    96, // AP
    98, 99, // MA
]);

export interface ResultadoValidacaoTelefone {
    valido: boolean;
    mensagem?: string;
}

/**
 * Valida um número de telefone brasileiro (com ou sem formatação).
 * Verifica: quantidade de dígitos, DDD real (lista ANATEL) e,
 * para celulares (11 dígitos), o 9º dígito obrigatório.
 */
export function validarTelefone(valor: string): ResultadoValidacaoTelefone {
    const digitos = valor.replace(/\D/g, '');

    if (!digitos) {
        return { valido: false, mensagem: 'Informe o telefone.' };
    }

    if (digitos.length !== 10 && digitos.length !== 11) {
        return { valido: false, mensagem: 'Telefone deve ter 10 ou 11 dígitos.' };
    }

    const ddd = parseInt(digitos.slice(0, 2), 10);
    if (!DDDS_VALIDOS.has(ddd)) {
        return { valido: false, mensagem: 'DDD inválido.' };
    }

    // Celular (11 dígitos) precisa começar com 9 após o DDD
    if (digitos.length === 11 && digitos[2] !== '9') {
        return { valido: false, mensagem: 'Número de celular inválido.' };
    }

    // Evita sequências óbvias tipo (53) 00000-0000 ou (53) 11111-1111
    const numeroSemDdd = digitos.slice(2);
    if (/^(\d)\1+$/.test(numeroSemDdd)) {
        return { valido: false, mensagem: 'Número de telefone inválido.' };
    }

    return { valido: true };
}