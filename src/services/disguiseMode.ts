// src/services/disguiseMode.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const DISGUISE_MODE_KEY = '@ampara_disguise_mode';

export async function getDisguiseModeEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(DISGUISE_MODE_KEY);
    // padrão: true (mais seguro por default, usuária opta por desativar)
    return value === null ? true : value === 'true';
}

export async function setDisguiseModeEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(DISGUISE_MODE_KEY, String(enabled));
}

// Código opcional para sair do disfarce (A2 da auditoria). Fica no SecureStore,
// que no Android é criptografado pelo Keystore do aparelho. É separado do PIN do
// celular porque o agressor muitas vezes sabe (ou obriga a contar) o PIN do aparelho.
const CHAVE_CODIGO = 'ampara_codigo_disfarce';

export const lerCodigoDisfarce = () => SecureStore.getItemAsync(CHAVE_CODIGO);
export const salvarCodigoDisfarce = (codigo: string) => SecureStore.setItemAsync(CHAVE_CODIGO, codigo);
export const removerCodigoDisfarce = () => SecureStore.deleteItemAsync(CHAVE_CODIGO);
