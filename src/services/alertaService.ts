// src/services/alertaService.ts
// Localização e mensagem do alerta SOS, e envio por SMS, WhatsApp e Telegram.
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Contato } from './contatosService';

const LIMITE_GPS_MS = 10000; // tempo máximo esperando a posição atual
const LIMITE_ENDERECO_MS = 3000; // tempo máximo esperando o endereço por escrito
const POSICAO_RECENTE_MS = 2 * 60 * 1000; // posição de até 2 min atrás serve
const DISTANCIA_MAXIMA_M = 200; // endereço guardado só vale se ela estiver perto dele

// Última localização obtida (e o endereço, quando havia internet).
// Fica no AsyncStorage, que é privado do app, e é apagada ao sair da conta.
export const CHAVE_ULTIMA_LOCALIZACAO = '@ampara_ultima_localizacao';

interface LocalizacaoGuardada {
    latitude: number;
    longitude: number;
    endereco: string;
    horario: string; // "15/10/2026, 22:56"
}

// Resolve com null se a promessa demorar mais que o limite
function comLimite<T>(promessa: Promise<T>, ms: number): Promise<T | null> {
    return Promise.race([promessa.catch(() => null), new Promise<null>((r) => setTimeout(() => r(null), ms))]);
}

// Distância em metros entre dois pontos (fórmula de Haversine)
function distanciaMetros(lat1: number, lon1: number, lat2: number, lon2: number) {
    const rad = (g: number) => (g * Math.PI) / 180;
    const a =
        Math.sin(rad(lat2 - lat1) / 2) ** 2 +
        Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.sqrt(a));
}

async function lerGuardada(): Promise<LocalizacaoGuardada | null> {
    const salvo = await AsyncStorage.getItem(CHAVE_ULTIMA_LOCALIZACAO).catch(() => null);
    return salvo ? JSON.parse(salvo) : null;
}

// Endereço por escrito: com internet, busca o atual; sem internet, usa o
// guardado se ela estiver a menos de 200 m dele. Guarda sempre a posição nova.
async function enderecoDe(latitude: number, longitude: number): Promise<string> {
    const lugares = await comLimite(Location.reverseGeocodeAsync({ latitude, longitude }), LIMITE_ENDERECO_MS);
    const l = lugares?.[0];
    let endereco = l
        ? [l.street && `${l.street}${l.streetNumber ? `, ${l.streetNumber}` : ''}`, l.district, l.city]
            .filter(Boolean)
            .join(' - ')
        : '';

    const anterior = await lerGuardada();
    if (!endereco && anterior && distanciaMetros(latitude, longitude, anterior.latitude, anterior.longitude) <= DISTANCIA_MAXIMA_M) {
        endereco = anterior.endereco;
    }

    const nova: LocalizacaoGuardada = {
        latitude,
        longitude,
        endereco,
        horario: new Date().toLocaleString('pt-BR').slice(0, 17),
    };
    AsyncStorage.setItem(CHAVE_ULTIMA_LOCALIZACAO, JSON.stringify(nova)).catch(() => { });
    return endereco;
}

// Chamar na Home: pede a permissão antes da emergência e já guarda a
// localização e o endereço, para o SOS ter algo a mandar mesmo sem internet.
export async function aquecerLocalizacao() {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return;
    const posicao = await comLimite(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        LIMITE_GPS_MS
    );
    if (posicao) await enderecoDe(posicao.coords.latitude, posicao.coords.longitude);
}

// A primeira das duas que responder: a equilibrada (rede/Wi-Fi, rápida com internet)
// ou a alta (GPS por satélite, que é a que funciona sem internet).
function posicaoAtual() {
    return new Promise<Location.LocationObject | null>((resolve) => {
        let pendentes = 2;
        const terminar = (p: Location.LocationObject | null) => {
            if (p) resolve(p);
            else if (--pendentes === 0) resolve(null);
        };
        [Location.Accuracy.Balanced, Location.Accuracy.High].forEach((accuracy) =>
            Location.getCurrentPositionAsync({ accuracy }).then(terminar, () => terminar(null))
        );
    });
}

async function obterPosicao() {
    // 1. Posição recente já guardada pelo Android: resposta imediata
    const recente = await Location.getLastKnownPositionAsync({ maxAge: POSICAO_RECENTE_MS }).catch(() => null);
    if (recente) return recente;
    // 2. Posição atual (rede ou GPS), com limite de tempo
    const atual = await comLimite(posicaoAtual(), LIMITE_GPS_MS);
    if (atual) return atual;
    // 3. Última posição conhecida pelo Android, mesmo antiga
    return Location.getLastKnownPositionAsync().catch(() => null);
}

const linkMapa = (lat: number, lon: number) =>
    `\nMapa: https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;

// Texto da localização para a mensagem ('' se não houver nenhuma localização)
export async function obterLocalizacao(): Promise<string> {
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) return '';

    const posicao = await obterPosicao();
    if (posicao) {
        const { latitude, longitude } = posicao.coords;
        const endereco = await enderecoDe(latitude, longitude);
        return (endereco ? `\nEndereço aproximado: ${endereco}` : '') + linkMapa(latitude, longitude);
    }

    // 4. Nem o GPS respondeu: manda a última localização que o Ampara guardou,
    //    avisando que pode não ser a atual
    const g = await lerGuardada();
    if (!g) return '';
    return (
        `\nÚltima localização conhecida (${g.horario}):` +
        (g.endereco ? `\nEndereço aproximado: ${g.endereco}` : '') +
        linkMapa(g.latitude, g.longitude)
    );
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