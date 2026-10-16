// src/services/registrosService.ts
// Guarda áudios, fotos e relatos na pasta interna do app.
// Essa pasta não aparece na galeria nem no gerenciador de arquivos:
// só o Ampara consegue abrir. Nada disso vai para o Firebase.
import * as FileSystem from 'expo-file-system/legacy';

export type TipoRegistro = 'audio' | 'foto' | 'relato';

const PASTA = `${FileSystem.documentDirectory}registros/`;

const ROTULOS: Record<TipoRegistro, string> = {
    audio: 'Áudio',
    foto: 'Foto',
    relato: 'Relato (PDF)',
};

const doisDigitos = (n: number) => String(n).padStart(2, '0');
const nomeDoArquivo = (uri: string) => uri.split('/').pop() ?? '';

// Endereço novo na pasta interna. Nome: tipo_AAAA-MM-DD_HH-MM-SS.ext
async function novoEndereco(tipo: TipoRegistro, extensao: string) {
    await FileSystem.makeDirectoryAsync(PASTA, { intermediates: true });
    const d = new Date();
    const carimbo =
        `${d.getFullYear()}-${doisDigitos(d.getMonth() + 1)}-${doisDigitos(d.getDate())}_` +
        `${doisDigitos(d.getHours())}-${doisDigitos(d.getMinutes())}-${doisDigitos(d.getSeconds())}`;
    return `${PASTA}${tipo}_${carimbo}.${extensao}`;
}

// Move um arquivo temporário (foto ou áudio) para a pasta interna
export async function guardarRegistro(uriTemporaria: string, tipo: TipoRegistro, extensao: string) {
    const destino = await novoEndereco(tipo, extensao);
    await FileSystem.moveAsync({ from: uriTemporaria, to: destino });
    return destino;
}

// Grava um conteúdo em base64 (o PDF) direto na pasta interna
export async function guardarRegistroBase64(base64: string, tipo: TipoRegistro, extensao: string) {
    const destino = await novoEndereco(tipo, extensao);
    await FileSystem.writeAsStringAsync(destino, base64, { encoding: FileSystem.EncodingType.Base64 });
    return destino;
}

// Endereços dos arquivos, mais recentes primeiro
export async function listarRegistros(): Promise<string[]> {
    const { exists } = await FileSystem.getInfoAsync(PASTA);
    if (!exists) return [];
    const nomes = await FileSystem.readDirectoryAsync(PASTA);
    return nomes.sort().reverse().map((nome) => PASTA + nome);
}

export function tipoDoRegistro(uri: string): TipoRegistro {
    return nomeDoArquivo(uri).split('_')[0] as TipoRegistro;
}

// ".../audio_2026-10-15_19-41-03.m4a" -> "Áudio · 15/10/2026 às 19:41"
export function descreverRegistro(uri: string): string {
    const [tipo, data, hora] = nomeDoArquivo(uri).split('.')[0].split('_');
    const [ano, mes, dia] = data.split('-');
    const [h, m] = hora.split('-');
    return `${ROTULOS[tipo as TipoRegistro]} · ${dia}/${mes}/${ano} às ${h}:${m}`;
}

export function lerEmBase64(uri: string) {
    return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
}

export function apagarRegistro(uri: string) {
    return FileSystem.deleteAsync(uri, { idempotent: true });
}

// Envia vários arquivos de uma vez: ela escolhe a pessoa uma vez só.
// Os arquivos são copiados para o cache do app (também privado) porque é a pasta
// que a react-native-share consegue compartilhar; a cópia mantém o nome e a
// extensão (.pdf, .m4a), para o celular de quem recebe saber abrir.
// A biblioteca só existe no APK; o import fica aqui dentro para o resto do app
// (inclusive o SOS) continuar abrindo no Expo Go.
const PASTA_ENVIO = `${FileSystem.cacheDirectory}envio/`;

export async function compartilharRegistros(uris: string[]) {
    const { default: Share } = await import('react-native-share');

    // Apaga as cópias do envio anterior e prepara as novas
    await FileSystem.deleteAsync(PASTA_ENVIO, { idempotent: true });
    await FileSystem.makeDirectoryAsync(PASTA_ENVIO, { intermediates: true });
    const copias = await Promise.all(
        uris.map(async (uri) => {
            const copia = PASTA_ENVIO + nomeDoArquivo(uri);
            await FileSystem.copyAsync({ from: uri, to: copia });
            return copia;
        })
    );

    await Share.open({
        title: 'Enviar para quem pode ajudar',
        urls: copias,
        failOnCancel: false,
    });
}

export function compartilharRegistro(uri: string) {
    return compartilharRegistros([uri]);
}