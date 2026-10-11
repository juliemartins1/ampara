// src/utils/mensagemErroAuth.ts
// Traduz os códigos de erro do Firebase para mensagens em português.
// Antes existiam três versões disso (login, cadastro e usuariaService).

type Contexto = 'login' | 'cadastro' | 'conta';

const COMUNS: Record<string, string> = {
    'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento e tente novamente.',
    'auth/network-request-failed': 'Falha de conexão. Verifique sua internet e tente novamente.',
    'auth/invalid-email': 'Informe um e-mail válido.',
    'auth/weak-password': 'A senha é muito fraca. Use ao menos 6 caracteres.',
};

const POR_CONTEXTO: Record<Contexto, Record<string, string>> = {
    login: {
        'auth/invalid-credential': 'E-mail ou senha incorretos.',
        'auth/wrong-password': 'E-mail ou senha incorretos.',
        'auth/user-not-found': 'E-mail ou senha incorretos.',
    },
    cadastro: {
        'auth/email-already-in-use': 'Este e-mail já está cadastrado.',
        'auth/operation-not-allowed': 'Cadastro por e-mail e senha não está habilitado no momento.',
        'permission-denied':
            'Sua conta foi criada, mas não foi possível salvar seus dados. Contate o suporte.',
    },
    // Alterar senha e excluir conta (pedem a senha atual)
    conta: {
        'auth/invalid-credential': 'Senha incorreta.',
        'auth/wrong-password': 'Senha incorreta.',
        'auth/weak-password': 'A nova senha é muito fraca. Use ao menos 6 caracteres.',
    },
};

const PADRAO: Record<Contexto, string> = {
    login: 'Não foi possível entrar. Tente novamente.',
    cadastro: 'Não foi possível concluir o cadastro. Tente novamente.',
    conta: 'Não foi possível concluir. Tente novamente.',
};

export function mensagemErroAuth(codigo: string | undefined, contexto: Contexto = 'conta'): string {
    if (!codigo) return PADRAO[contexto];
    return POR_CONTEXTO[contexto][codigo] ?? COMUNS[codigo] ?? PADRAO[contexto];
}