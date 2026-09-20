// src/services/disguiseMode.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const DISGUISE_MODE_KEY = '@ampara_disguise_mode';

export async function getDisguiseModeEnabled(): Promise<boolean> {
    const value = await AsyncStorage.getItem(DISGUISE_MODE_KEY);
    // padrão: true (mais seguro por default, usuária opta por desativar)
    return value === null ? true : value === 'true';
}

export async function setDisguiseModeEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(DISGUISE_MODE_KEY, String(enabled));
}