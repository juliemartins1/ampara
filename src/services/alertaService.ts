// src/services/alertaService.ts
// Localização e mensagem do alerta SOS, e envio por SMS, WhatsApp e Telegram.
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import { Contato } from './contatosService';

const LIMITE_GPS_MS = 8000; // tempo máximo esperando o GPS
const LIMITE_ENDERECO_MS = 3000; // tempo máximo esperando o endereço por escrito
const POSICAO_RECENTE_MS = 2 * 60 * 1000; // posição de até 2 min atrás serve

// Resolve com null se a promessa demorar mais que o limite
function comLimite<T>(promessa: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([promessa, new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

// Chamar na Home: pede a permissão antes da emergência e deixa uma posição
// recente guardada pelo Android, para o SOS não esperar o GPS "acordar".
export async function aquecerLocalizacao() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (granted) Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }).catch(() => { });
}

async function obterPosicao() {
    // 1. Posição recente já guardada pelo Android: resposta imediata
    const recente = await Location.getLastKnownPositionAsync({ maxAge: POSICAO_RECENTE_MS });
    if (recente) return recente;

    // 2. Posição atual, com limite de tempo
    const atual = await comLimite(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        LIMITE_GPS_MS
    ).catch(() => null);
    if (atual) return atual;

    // 3. Última posição conhecida, mesmo antiga
    return Location.getLastKnownPositionAsync();
}

// Texto da localização para a mensagem ('' se não for possível obter)
export async function obterLocalizacao(): Promise<string> {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return '';

    const posicao = await obterPosicao().catch(() => null);
    if (!posicao) return '';

    const { latitude, longitude } = posicao.coords;
    const mapa = `\nMapa: https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=18/${latitude}/${longitude}`;

    // Endereço por escrito depende de internet: se demorar, vai só o link
    const lugares = await comLimite(Location.reverseGeocodeAsync({ latitude, longitude }), LIMITE_ENDERECO_MS).catch(
        () => null
    );
    const l = lugares?.[0];
    const endereco = l
        ? [l.street && `${l.street}${l.streetNumber ? `, ${l.streetNumber}` : ''}`, l.district, l.city]
            .filter(Boolean)
            .join(' - ')
        : '';

    return (endereco ? `\nEndereço aproximado: ${endereco}` : '') + mapa;
}

export function montarMensagem(localizacao: string, quando: string) {
    return `SOS - Preciso de ajuda! Enviado pelo app Ampara em ${quando}.${localizacao}`;
}

export async function enviarSMS(contatos: Contato[], mensagem: string) {
    if (!(await SMS.isAvailableAsync())) return;
    await SMS.sendSMSAsync(
        contatos.map((c) => `+${c.telefone}`),
        mensagem
    );
}

export function linkWhatsApp(telefone: string, mensagem: string) {
    return `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;
}

export function linkTelegram(telefone: string, mensagem: string) {
    return `tg://resolve?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
}