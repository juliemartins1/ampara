// src/screens/RegistrosScreen.tsx
// Lista os áudios do SOS, as fotos e os relatos em PDF guardados na pasta interna.
// Permite ouvir, enviar e apagar. Nada aqui fica na galeria do celular.
import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAudioPlayer } from 'expo-audio';
import BotaoPrimario from '../components/BotaoPrimario';
import {
    listarRegistros,
    tipoDoRegistro,
    descreverRegistro,
    compartilharRegistro,
    apagarRegistro,
} from '../services/registrosService';
import { colors, spacing, radius, typography } from '../theme/colors';

const ICONES = { audio: 'mic', foto: 'image', relato: 'document-text' } as const;

export default function RegistrosScreen({ navigation }: any) {
    const [registros, setRegistros] = useState<string[]>([]);
    const player = useAudioPlayer(null);

    // Recarrega ao voltar da tela de relato
    useFocusEffect(
        useCallback(() => {
            listarRegistros().then(setRegistros);
        }, [])
    );

    function ouvir(uri: string) {
        player.replace({ uri });
        player.play();
    }

    function enviar(uri: string) {
        compartilharRegistro(uri).catch((erro) => {
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
                        <Ionicons name={ICONES[tipo]} size={22} color={colors.primary} />
                        <Text style={styles.nome}>{descreverRegistro(item)}</Text>
                        {tipo === 'audio' && (
                            <TouchableOpacity onPress={() => ouvir(item)} accessibilityLabel="Ouvir">
                                <Ionicons name="play" size={22} color={colors.primaryDark} />
                            </TouchableOpacity>
                        )}
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    lista: { padding: spacing.lg },
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
});