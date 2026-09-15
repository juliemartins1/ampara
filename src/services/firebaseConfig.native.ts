// Versão da configuração do Firebase usada em Android e iOS.
// O Metro bundler escolhe este arquivo automaticamente nessas plataformas
// por causa do sufixo ".native.ts" — não é necessário importar com esse
// sufixo em nenhum outro lugar do app, basta importar de "./firebaseConfig".

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth } from "firebase/auth";
// @ts-ignore — bug conhecido nas declarações de tipo do firebase/auth:
// getReactNativePersistence existe e funciona normalmente em tempo de
// execução no bundle nativo, mas o TypeScript não o enxerga porque o
// editor carrega os tipos da versão genérica do pacote.
// Ref.: https://github.com/firebase/firebase-js-sdk/issues/9316
import { getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebaseConfig } from "./firebaseConfig.shared";

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

export default app;