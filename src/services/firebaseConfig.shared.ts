// Configuração compartilhada do Firebase (credenciais do projeto).
// Não contém lógica de inicialização de Auth — isso fica em
// firebaseConfig.native.ts (Android/iOS) e firebaseConfig.web.ts (navegador),
// já que cada plataforma exige uma forma diferente de configurar a
// persistência do Firebase Auth.

export const firebaseConfig = {
    apiKey: "AIzaSyAYxQgYd60OCTHEk3ksXu0iWTEzrzk5AT0",
    authDomain: "ampara-7b0f5.firebaseapp.com",
    projectId: "ampara-7b0f5",
    storageBucket: "ampara-7b0f5.firebasestorage.app",
    messagingSenderId: "862370250340",
    appId: "1:862370250340:web:a038e38784477c4221a971",
    measurementId: "G-9C6YQJFCE9"
};