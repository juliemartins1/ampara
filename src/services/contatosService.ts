// src/services/contatosService.ts
// Toda a leitura e escrita dos contatos de confiança fica aqui, em vez de
// espalhada pelas telas. Caminho no Firestore:
//   usuarias/{uid}/contatosConfianca/{contatoId}
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { ParentescoContato } from '../types/models';

export interface Contato {
    id: string;
    nome: string;
    telefone: string; // formato salvo: 55 + DDD + número
    parentesco: ParentescoContato;
}

export type DadosContato = Omit<Contato, 'id'>;

export const LIMITE_CONTATOS = 5;

// Cópia local dos contatos, para o botão SOS funcionar mesmo sem internet
export const CHAVE_CACHE_CONTATOS = '@ampara_contatos_cache';

function colecaoContatos() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Usuária não autenticada.');
    return collection(db, 'usuarias', uid, 'contatosConfianca');
}

function paraContato(id: string, dados: any): Contato {
    return {
        id,
        nome: dados.nome ?? '',
        telefone: dados.telefone ?? '',
        parentesco: dados.parentesco ?? 'Outro',
    };
}

function salvarCache(lista: Contato[]) {
    AsyncStorage.setItem(CHAVE_CACHE_CONTATOS, JSON.stringify(lista)).catch(() => { });
}

/**
 * Escuta os contatos em tempo real. Qualquer criação, edição ou exclusão
 * aparece na hora em todas as telas que estiverem ouvindo.
 * Retorna a função que cancela a escuta (usar no cleanup do useEffect).
 */
export function ouvirContatos(
    aoMudar: (contatos: Contato[]) => void,
    aoFalhar?: (erro: Error) => void
) {
    return onSnapshot(
        query(colecaoContatos(), orderBy('nome')),
        (snapshot) => {
            const lista = snapshot.docs.map((d) => paraContato(d.id, d.data()));
            salvarCache(lista);
            aoMudar(lista);
        },
        (erro) => aoFalhar?.(erro)
    );
}

/**
 * Usado pelo SOS. Primeiro tenta a cópia local (instantâneo e funciona
 * offline); se ela não existir, busca no Firestore.
 */
export async function buscarContatosParaEmergencia(): Promise<Contato[]> {
    try {
        const cache = await AsyncStorage.getItem(CHAVE_CACHE_CONTATOS);
        if (cache) {
            const lista: Contato[] = JSON.parse(cache);
            if (lista.length > 0) return lista;
        }
    } catch {
        // cache corrompido: segue para o Firestore
    }

    const snapshot = await getDocs(colecaoContatos());
    const lista = snapshot.docs.map((d) => paraContato(d.id, d.data()));
    salvarCache(lista);
    return lista;
}

export function criarContato(dados: DadosContato) {
    return addDoc(colecaoContatos(), { ...dados, createdAt: serverTimestamp() });
}

export function editarContato(id: string, dados: DadosContato) {
    return updateDoc(doc(colecaoContatos(), id), {
        ...dados,
        updatedAt: serverTimestamp(),
    });
}

export function excluirContato(id: string) {
    return deleteDoc(doc(colecaoContatos(), id));
}