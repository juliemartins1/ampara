// Versão da configuração do Firebase usada no navegador (Expo Web).
// O Metro bundler escolhe este arquivo automaticamente ao rodar com "w"
// (expo start --web), por causa do sufixo ".web.ts".
//
// getReactNativePersistence não existe no bundle web do firebase/auth,
// por isso essa função usa getAuth normal, que no navegador já usa
// IndexedDB/localStorage por padrão para manter a sessão.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebaseConfig.shared";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;