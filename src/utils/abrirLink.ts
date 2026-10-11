// Abre um link externo (telefone, WhatsApp, Telegram) e avisa se o app não abrir.
import { Alert, Linking } from 'react-native';

export function abrirLink(url: string, app: string) {
    Linking.openURL(url).catch(() => Alert.alert(app, `Não foi possível abrir o ${app}. Ele está instalado?`));
}