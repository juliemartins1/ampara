// Regras de validação usadas em mais de uma tela.

const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TAMANHO_MINIMO_SENHA = 6;

/** Retorna a mensagem de erro do e-mail, ou undefined se estiver válido. */
export function validarEmail(valor: string): string | undefined {
    const email = valor.trim();
    if (!email) return 'Informe seu e-mail.';
    if (!REGEX_EMAIL.test(email)) return 'Informe um e-mail válido.';
    return undefined;
}

/** true quando nenhum campo do objeto de erros tem mensagem. */
export function semErros(erros: object): boolean {
    return Object.values(erros).every((mensagem) => !mensagem);
}