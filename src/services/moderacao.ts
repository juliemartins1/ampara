import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebaseConfig';

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