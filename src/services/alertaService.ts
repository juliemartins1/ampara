// src/services/alertaService.ts
// Localização, mensagem e canais do alerta SOS (SMS, WhatsApp, Telegram).
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Contato } from './contatosService';

const ESPERA_ENDERECO_MS = 4000;

/** Texto com endereço aproximado + link do mapa ('' se não houver permissão ou GPS). */
export async function obterLocalizacao() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return '';
    const posicao = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High })
        .catch(() => Location.getLastKnownPositionAsync()); // se o GPS falhar, usa a última conhecida
    if (!posicao) return '';

    const { latitude, longitude } = posicao.coords;
    const link = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;

    // O endereço precisa de internet: espera no máximo 4 s para não atrasar o alerta
    const semEndereco = new Promise<[]>((resolver) => setTimeout(() => resolver([]), ESPERA_ENDERECO_MS));
    const [end] = await Promise.race([
        Location.reverseGeocodeAsync({ latitude, longitude }).catch(() => []),
        semEndereco,
    ]);
    const endereco = end?.formattedAddress
        ?? [end?.street, end?.streetNumber, end?.district, end?.city].filter(Boolean).join(', ');

    return (endereco ? `\nEndereço aproximado: ${endereco}` : '') + `\nMapa: ${link}`;
}

export function montarMensagem(localizacao: string, quando: string) {
    return `SOS - Preciso de ajuda! Enviado pelo app Ampara em ${quando}.${localizacao}`;
}

/** SMS: um único envio para todos os contatos de confiança. */
export async function enviarSMS(contatos: Contato[], mensagem: string) {
    if (!(await SMS.isAvailableAsync())) throw new Error('Este aparelho não consegue enviar SMS.');
    await SMS.sendSMSAsync(contatos.map((c) => `+${c.telefone}`), mensagem);
}

/** WhatsApp: abre a conversa com o contato, mensagem já escrita (telefone = 55 + DDD + número). */
export const linkWhatsApp = (telefone: string, mensagem: string) =>
    `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

/** Telegram: abre a conversa com o contato, mensagem já escrita (telefone = 55 + DDD + número). */
export const linkTelegram = (telefone: string, mensagem: string) =>
    `tg://resolve?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;