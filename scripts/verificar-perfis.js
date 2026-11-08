// scripts/verificar-perfis.js
// Confere contas do login e perfis do Firestore. Só lê, não altera nada.
const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({ credential: cert(require('../serviceAccountKey.json')) });

const PERMITIDOS = ['nome', 'email', 'telefone', 'bairro', 'createdAt', 'updatedAt', 'ultimaPublicacao', 'emailVerificado'];
const texto = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;

(async () => {
    const { users } = await getAuth().listUsers(1000);
    for (const u of users) {
        const p = await getFirestore().doc(`usuarias/${u.uid}`).get();
        const problemas = [];
        if (!u.emailVerified) problemas.push('e-mail não verificado');
        if (!p.exists) problemas.push('sem perfil em usuarias');
        else {
            const d = p.data();
            const extras = Object.keys(d).filter((k) => !PERMITIDOS.includes(k));
            if (extras.length) problemas.push(`campos a mais: ${extras.join(', ')}`);
            if (!texto(d.nome, 100)) problemas.push('nome inválido');
            if (!/^55[0-9]{10,11}$/.test(d.telefone ?? '')) problemas.push(`telefone inválido: ${JSON.stringify(d.telefone)}`);
            if (!texto(d.bairro, 60)) problemas.push('bairro inválido');
            if (d.ultimaPublicacao) problemas.push(`última publicação: ${d.ultimaPublicacao.toDate().toLocaleString('pt-BR')}`);
        }
        console.log(`${problemas.length ? '✗' : '✓'} ${u.email}${problemas.length ? ': ' + problemas.join('; ') : ''}`);
    }
})();