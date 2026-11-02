// scripts/verificar-perfis.js
// Confere se os perfis seguem as regras novas do Firestore. Só lê, não altera nada.
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
initializeApp({ credential: cert(require('../serviceAccountKey.json')) });

const PERMITIDOS = ['nome', 'email', 'telefone', 'bairro', 'createdAt', 'updatedAt', 'ultimaPublicacao', 'emailVerificado'];
const texto = (v, max) => typeof v === 'string' && v.length > 0 && v.length <= max;

(async () => {
    const perfis = await getFirestore().collection('usuarias').get();
    let comProblema = 0;
    for (const p of perfis.docs) {
        const d = p.data();
        const problemas = [];
        const extras = Object.keys(d).filter((k) => !PERMITIDOS.includes(k));
        if (extras.length) problemas.push(`campos a mais: ${extras.join(', ')}`);
        if (!texto(d.nome, 100)) problemas.push('nome vazio ou muito longo');
        if (!(typeof d.telefone === 'string' && /^55[0-9]{10,11}$/.test(d.telefone))) problemas.push(`telefone inválido: ${JSON.stringify(d.telefone)}`);
        if (!texto(d.bairro, 60)) problemas.push('bairro vazio ou muito longo');
        if (problemas.length) {
            comProblema++;
            console.log(`✗ ${p.id} (${d.email ?? 'sem e-mail'}): ${problemas.join('; ')}`);
        }
    }
    console.log(`\n${perfis.size} perfis conferidos, ${comProblema} com problema.`);
})();
