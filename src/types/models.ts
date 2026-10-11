// src/types/models.ts
// Tipos usados em mais de um arquivo. Os tipos de usuária e contato
// ficam junto dos serviços (usuariaService / contatosService).
import type { Timestamp } from 'firebase/firestore';

// ---- Contatos de confiança ----
export type ParentescoContato =
    | 'Familiar'
    | 'Amigo(a)'
    | 'Vizinho(a)'
    | 'Colega de trabalho'
    | 'Outro';

export const OPCOES_PARENTESCO: ParentescoContato[] = [
    'Familiar',
    'Amigo(a)',
    'Vizinho(a)',
    'Colega de trabalho',
    'Outro',
];

// ---- Mural ----
export type Categoria = 'relato' | 'apoio' | 'dica';

export const ROTULOS_CATEGORIA: Record<Categoria, string> = {
    relato: 'Relato',
    apoio: 'Apoio',
    dica: 'Dica',
};

export const CATEGORIAS = (Object.keys(ROTULOS_CATEGORIA) as Categoria[]).map((valor) => ({
    valor,
    rotulo: ROTULOS_CATEGORIA[valor],
}));

export interface Publicacao {
    id: string;
    texto: string;
    categoria: Categoria;
    criadaEm: Timestamp | null;
    denuncias: number;
}

// ---- Relato: formas de violência da Lei Maria da Penha (art. 7º, I a V) ----
export const TIPOS_VIOLENCIA = ['Física', 'Psicológica', 'Sexual', 'Patrimonial', 'Moral'];