export interface Usuaria{
    uid?: string;
    nome: string;
    email: string;
    senha?: string; //usado apenas no cadastro
    bairro: string;
    createdAt?:string;
}

export type ParentescoContato =
'Familiar'| 'Amigo(a)' | 'Vizinho(a)' |
'Colega de trabalho' | 'Outro';

export interface ContatoConfianca{
    id?: string;
    usuariaId: string; 
    nome: string;
    telefone: string;
    parentesco: ParentescoContato;
    createdAt?:string;
}