// scripts/migrar-autoria.js
// Uso único: tira o campo autoraUid das publicações antigas e grava a autoria
// em publicacoes/{id}/privado/autoria (o formato novo, que só a moderação lê).
// Rodar na raiz do projeto:  node scripts/migrar-autoria.js
// Precisa do serviceAccountKey.json na raiz (não vai para o GitHub).
const admin = require('firebase-admin');

admin.initializeApp({ credential: admin.credential.cert(require('../serviceAccountKey.json')) });
const db = admin.firestore();

(async () => {
    const antigas = await db.collection('publicacoes').where('autoraUid', '!=', null).get();
    for (const pub of antigas.docs) {
        const batch = db.batch();
        batch.set(pub.ref.collection('privado').doc('autoria'), { uid: pub.get('autoraUid') });
        batch.update(pub.ref, { autoraUid: admin.firestore.FieldValue.delete() });
        await batch.commit();
    }
    console.log(`Publicações migradas: ${antigas.size}`);
})();
