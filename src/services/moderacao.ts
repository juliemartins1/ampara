import { doc, getDoc, writeBatch, increment, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

export type MotivoDenuncia = 'dados_pessoais' | 'ofensivo' | 'falso' | 'outro';

export const MOTIVOS_DENUNCIA: { valor: MotivoDenuncia; rotulo: string }[] = [
    { valor: 'dados_pessoais', rotulo: 'Expõe dados pessoais de alguém' },
    { valor: 'ofensivo', rotulo: 'Conteúdo ofensivo ou discriminatório' },
    { valor: 'falso', rotulo: 'Informação falsa ou perigosa' },
    { valor: 'outro', rotulo: 'Outro motivo' },
];

// Verifica se existe o documento moderadoras/{uid} da usuária logada
export async function ehModeradora(): Promise<boolean> {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    try {
        const snap = await getDoc(doc(db, 'moderadoras', uid));
        return snap.exists();
    } catch (erro) {
        console.error('[moderacao] erro ao verificar:', erro);
        return false;
    }
}

// A usuária logada já denunciou esta publicação?
// (as regras permitem que ela leia a própria denúncia: denuncias/{uid})
export async function jaDenunciei(publicacaoId: string): Promise<boolean> {
    const uid = auth.currentUser?.uid;
    if (!uid) return false;
    const snap = await getDoc(doc(db, 'publicacoes', publicacaoId, 'denuncias', uid));
    return snap.exists();
}

// Cria a denúncia e soma +1 no contador numa única operação (batch):
// ou as duas gravações acontecem, ou nenhuma
export async function denunciarPublicacao(publicacaoId: string, motivo: MotivoDenuncia) {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('sem-sessao');

    // Confere antes, para não confundir "já denunciou" com outro erro de permissão
    if (await jaDenunciei(publicacaoId)) throw new Error('ja-denunciou');

    const batch = writeBatch(db);
    batch.set(doc(db, 'publicacoes', publicacaoId, 'denuncias', uid), {
        motivo,
        criadaEm: serverTimestamp(),
    });
    batch.update(doc(db, 'publicacoes', publicacaoId), {
        denuncias: increment(1),
    });
    await batch.commit();
}