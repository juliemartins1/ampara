// src/screens/RegistrosScreen.tsx
// Lista os áudios do SOS, as fotos e os relatos em PDF guardados na pasta interna.
// Permite abrir (ouvir o áudio, ver a foto, ler o PDF), enviar e apagar.
// Nada aqui fica na galeria do celular.
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import BotaoPrimario from '../components/BotaoPrimario';
import {
    listarRegistros,
    tipoDoRegistro,
    descreverRegistro,
    compartilharRegistros,
    lerVisualizacao,
    apagarRegistro,
} from '../services/registrosService';
import { colors, spacing, radius, typography } from '../theme/colors';

const ICONES = { audio: 'mic', foto: 'image', relato: 'document-text' } as const;
// Ícone do botão "abrir" de cada tipo
const ICONES_ABRIR = { audio: 'play', foto: 'expand', relato: 'eye' } as const;

// O que está aberto em tela cheia: uma foto ou o HTML de um relato
type Aberto = { foto: string } | { html: string } | null;

export default function RegistrosScreen({ navigation, route }: any) {
    const [registros, setRegistros] = useState<string[]>([]);
    const [aberto, setAberto] = useState<Aberto>(null);
    const player = useAudioPlayer(null);
    const status = useAudioPlayerStatus(player);
    const [audioAtual, setAudioAtual] = useState<string | null>(null);
    const tocando = (uri: string) => audioAtual === uri && status.playing;

    // Recarrega ao voltar da tela de relato
    useFocusEffect(
        useCallback(() => {
            listarRegistros().then(setRegistros).catch(() => setRegistros([]));
        }, [])
    );

    // Áudio: toca aqui mesmo | Foto e relato: tela cheia dentro do app
    async function abrir(uri: string) {
        const tipo = tipoDoRegistro(uri);
        if (tipo === 'audio') {
            // Tocar no mesmo áudio pausa; tocar de novo continua (ou recomeça, se tinha acabado)
            if (tocando(uri)) return player.pause();
            if (audioAtual !== uri) {
                player.replace({ uri });
                setAudioAtual(uri);
            } else if (status.currentTime >= status.duration) {
                await player.seekTo(0);
            }
            player.play();
        } else if (tipo === 'foto') {
            setAberto({ foto: uri });
        } else {
            const html = await lerVisualizacao(uri).catch(() => null);
            if (html) setAberto({ html });
            else Alert.alert('Relato', 'Este relato foi criado antes da visualização no app. Ele ainda pode ser enviado.');
        }
    }

    // Vindo da tela de relato com "Abrir": abre o relato recém-criado
    useEffect(() => {
        if (route.params?.abrir) {
            abrir(route.params.abrir);
            navigation.setParams({ abrir: undefined });
        }
    }, [route.params?.abrir]);

    function enviar(uri: string) {
        compartilharRegistros([uri]).catch((erro) => {
            console.log('Erro ao enviar:', erro);
            Alert.alert('Envio', 'Não foi possível enviar agora. Tente novamente.');
        });
    }

    function apagar(uri: string) {
        Alert.alert('Apagar registro', 'O arquivo será apagado para sempre. Deseja continuar?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Apagar',
                style: 'destructive',
                onPress: async () => {
                    player.pause();
                    await apagarRegistro(uri);
                    setRegistros(await listarRegistros());
                },
            },
        ]);
    }

    return (
        <>
            <FlatList
                style={styles.container}
                contentContainerStyle={styles.lista}
                data={registros}
                keyExtractor={(uri) => uri}
                ListHeaderComponent={
                    <>
                        <BotaoPrimario titulo="Escrever relato" onPress={() => navigation.navigate('Relato')} />
                        <View style={styles.aviso}>
                            <Ionicons name="shield-checkmark-outline" size={20} color={colors.primaryDark} />
                            <Text style={styles.avisoTexto}>
                                Estes arquivos ficam só dentro do Ampara e não aparecem na galeria.{'\n'}
                                Ao enviar, escolha direto quem pode ajudar (contato de confiança, delegacia ou
                                advogada).{'\n'}
                                <Text style={styles.avisoDestaque}>
                                    Depois de enviar, apague a conversa ou o arquivo no app usado (WhatsApp,
                                    Telegram, e-mail): eles podem guardar uma cópia que aparece na galeria.
                                </Text>
                            </Text>
                        </View>
                    </>
                }
                ListEmptyComponent={
                    <Text style={styles.vazio}>
                        Nenhum registro ainda. Os áudios gravados no SOS aparecem aqui.
                    </Text>
                }
                renderItem={({ item }) => {
                    const tipo = tipoDoRegistro(item);
                    return (
                        <View style={styles.item}>
                            {tipo === 'foto' ? (
                                <Image source={{ uri: item }} style={styles.miniatura} />
                            ) : (
                                <Ionicons name={ICONES[tipo]} size={22} color={colors.primary} />
                            )}
                            {/* Tocar no nome também abre */}
                            <Text style={styles.nome} onPress={() => abrir(item)}>
                                {descreverRegistro(item)}
                            </Text>
                            <TouchableOpacity onPress={() => abrir(item)} accessibilityLabel="Abrir">
                                <Ionicons
                                    name={tocando(item) ? 'pause' : ICONES_ABRIR[tipo]}
                                    size={22}
                                    color={colors.primaryDark}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => enviar(item)} accessibilityLabel="Enviar">
                                <Ionicons name="share-social" size={22} color={colors.primaryDark} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => apagar(item)} accessibilityLabel="Apagar">
                                <Ionicons name="trash" size={22} color={colors.error} />
                            </TouchableOpacity>
                        </View>
                    );
                }}
            />

            {/* Foto ou relato em tela cheia, sem passar pela galeria nem por outro app */}
            <Modal visible={aberto !== null} animationType="fade" onRequestClose={() => setAberto(null)}>
                <SafeAreaView style={styles.fundoFoto}>
                    {aberto && 'foto' in aberto && (
                        <Image source={{ uri: aberto.foto }} style={styles.fotoCheia} resizeMode="contain" />
                    )}
                    {aberto && 'html' in aberto && (
                        <WebView
                            source={{ html: aberto.html }}
                            originWhitelist={['*']}
                            javaScriptEnabled={false} // o relato é só texto e imagens
                            style={styles.fotoCheia}
                        />
                    )}
                    <TouchableOpacity
                        style={styles.fecharFoto}
                        onPress={() => setAberto(null)}
                        accessibilityLabel="Fechar"
                    >
                        <Ionicons name="close" size={32} color={colors.white} />
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    lista: { padding: spacing.lg, paddingBottom: 88 },
    aviso: {
        flexDirection: 'row',
        gap: spacing.sm,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        padding: spacing.md,
        marginVertical: spacing.md,
    },
    avisoTexto: { ...typography.helper, flex: 1, fontSize: 13, lineHeight: 19, color: colors.primaryDark },
    avisoDestaque: { fontWeight: '700' },
    vazio: { ...typography.subtitle, textAlign: 'center', marginTop: spacing.xl },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: spacing.sm,
    },
    nome: { ...typography.label, flex: 1 },
    miniatura: { width: 40, height: 40, borderRadius: radius.sm },
    fundoFoto: { flex: 1, backgroundColor: colors.black },
    fotoCheia: { flex: 1 },
    // Fundo escuro: o X precisa aparecer tanto sobre a foto quanto sobre o relato (fundo branco)
    fecharFoto: {
        position: 'absolute',
        top: spacing.xl,
        right: spacing.md,
        padding: spacing.xs,
        borderRadius: radius.pill,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
});