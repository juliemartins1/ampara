// src/hooks/useGravacaoSOS.ts
// Começa a gravar o áudio assim que a tela de emergência abre.
// Retorna a função que para a gravação e guarda o arquivo na pasta interna.
// Se o microfone for negado ou falhar, o SOS continua funcionando normalmente.
import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import {
    RecordingPresets,
    requestRecordingPermissionsAsync,
    setAudioModeAsync,
    useAudioRecorder,
} from 'expo-audio';
import { guardarRegistro } from '../services/registrosService';

// Pede microfone e notificação. Chamar também na Home, para que os pedidos
// não apareçam pela primeira vez no meio de uma emergência.
export async function pedirPermissoesGravacao() {
    const microfone = await requestRecordingPermissionsAsync();
    // A notificação é exigida pelo Android para gravar em segundo plano
    const notificacao =
        Platform.OS === 'android'
            ? await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).catch(() => null)
            : null;
    return { microfone: microfone.granted, segundoPlano: notificacao === PermissionsAndroid.RESULTS.GRANTED };
}

export function useGravacaoSOS() {
    const gravador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
    const iniciou = useRef(false);

    async function prepararGravacao(segundoPlano: boolean) {
        await setAudioModeAsync({
            allowsRecording: true,
            allowsBackgroundRecording: segundoPlano,
            playsInSilentMode: true,
            interruptionMode: 'mixWithOthers',
            shouldPlayInBackground: false,
            shouldRouteThroughEarpiece: false,
        });
        await gravador.prepareToRecordAsync();
    }

    useEffect(() => {
        (async () => {
            const { microfone, segundoPlano } = await pedirPermissoesGravacao();
            if (!microfone) return console.log('Gravação: microfone não permitido');
            try {
                await prepararGravacao(segundoPlano);
            } catch {
                // No Expo Go o serviço de segundo plano não existe: grava só com o app aberto
                await prepararGravacao(false);
            }
            gravador.record();
            iniciou.current = true;
            console.log('Gravação: iniciada');
        })().catch((erro) => console.log('Gravação: erro ao iniciar', erro));
    }, [gravador]);

    return async function encerrarGravacao() {
        if (!iniciou.current) return;
        iniciou.current = false;
        await gravador.stop(); // também finaliza se o Android tiver pausado a gravação
        if (gravador.uri) await guardarRegistro(gravador.uri, 'audio', 'm4a');
        console.log('Gravação: salva');
    };
}