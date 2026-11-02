// src/hooks/useGravacaoSOS.ts
// Começa a gravar o áudio assim que a tela de emergência abre e, quando a tela
// vai ser fechada (botão Encerrar, saída rápida para o disfarce...), para a
// gravação e guarda o arquivo na pasta interna ANTES de a tela sumir.
// Se o microfone for negado ou falhar, o SOS continua funcionando normalmente.
import { useEffect, useRef } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
    const navigation = useNavigation();
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

    // Segura a saída da tela até o áudio ser salvo e depois segue com a navegação.
    // Antes, só o botão "Encerrar" salvava; qualquer outra saída perdia o áudio.
    useEffect(
        () =>
            navigation.addListener('beforeRemove', (e) => {
                if (!iniciou.current) return;
                iniciou.current = false;
                e.preventDefault();
                (async () => {
                    await gravador.stop(); // também finaliza se o Android tiver pausado a gravação
                    if (gravador.uri) await guardarRegistro(gravador.uri, 'audio', 'm4a');
                    console.log('Gravação: salva');
                })()
                    .catch((erro) => console.log('Gravação: erro ao salvar', erro))
                    .finally(() => navigation.dispatch(e.data.action));
            }),
        [navigation, gravador]
    );
}