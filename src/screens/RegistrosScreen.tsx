// src/screens/RegistrosScreen.tsx
// Lista os áudios do SOS, as fotos e os relatos em PDF guardados na pasta interna.
// Permite abrir (ouvir o áudio, ver a foto, ler o PDF), enviar e apagar.
// Nada aqui fica na galeria do celular.
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, Modal, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import BotaoPrimario from '../components/BotaoPrimario';
import {
    listarRegistros,
    tipoDoRegistro,
    descreverRegistro,
    compartilharRegistros,
    abrirRelato,
    apagarRegistro,
} from '../services/registrosService';
import { colors, spacing, radius, typography } from '../theme/colors';

const ICONES = { audio: 'mic', foto: 'image', relato: 'document-text' } as const;
// Ícone do botão "abrir" de cada tipo
const ICONES_ABRIR = { audio: 'play', foto: 'expand', relato: 'eye' } as const;

export default function RegistrosScreen({ navigation }: any) {
    const [registros, setRegistros] = useState<string[]>([]);
    const [fotoAberta, setFotoAberta] = useState<string | null>(null);
    const player = useAudioPlayer(null);

    // Recarrega ao voltar da tela de relato
    useFocusEffect(
        useCallback(() => {
            listarRegistros().then(setRegistros);
        }, [])
    );

    // Áudio: toca aqui mesmo | Foto: tela cheia | Relato: visualização do PDF
    function abrir(uri: string) {
        const tipo = tipoDoRegistro(uri);
        if (tipo === 'audio') {
            player.replace({ uri });
            player.play();
        } else if (tipo === 'foto') {
            setFotoAberta(uri);
        } else {
            abrirRelato(uri).catch((erro) => {
                console.log('Erro ao abrir o PDF:', erro);
                Alert.alert('Relato', 'Não foi possível abrir o PDF agora.');
            });
        }
    }

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
                        <Text style={[typography.helper, styles.aviso]}>
                            Estes arquivos ficam só dentro do Ampara. Ao enviar, escolha direto quem pode ajudar
                            (contato de confiança, delegacia ou advogada) para não deixar cópia no celular.
                        </Text>
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
                                <Ionicons name={ICONES_ABRIR[tipo]} size={22} color={colors.primaryDark} />
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

            {/* Foto em tela cheia, sem passar pela galeria */}
            <Modal visible={fotoAberta !== null} animationType="fade" onRequestClose={() => setFotoAberta(null)}>
                <SafeAreaView style={styles.fundoFoto}>
                    {fotoAberta && <Image source={{ uri: fotoAberta }} style={styles.fotoCheia} resizeMode="contain" />}
                    <TouchableOpacity
                        style={styles.fecharFoto}
                        onPress={() => setFotoAberta(null)}
                        accessibilityLabel="Fechar foto"
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
    aviso: { marginVertical: spacing.md },
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
    fecharFoto: { position: 'absolute', top: spacing.xl, right: spacing.md, padding: spacing.sm },
});