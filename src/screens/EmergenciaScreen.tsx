// src/screens/EmergenciaScreen.tsx
// Aberta pelo botão SOS: pega a localização, abre o SMS para todos os
// contatos de confiança, oferece WhatsApp/Telegram por contato e o 190.
// Enquanto a tela está aberta, o áudio é gravado na pasta interna do app.
import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    BackHandler,
    StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Contato, buscarContatosParaEmergencia } from '../services/contatosService';
import {
    obterLocalizacao,
    montarMensagem,
    enviarSMS,
    linkWhatsApp,
    linkTelegram,
} from '../services/alertaService';
import { useGravacaoSOS } from '../hooks/useGravacaoSOS';
import { abrirLink } from '../utils/abrirLink';
import { colors, spacing, radius } from '../theme/colors';

interface BotaoProps {
    icone: keyof typeof Ionicons.glyphMap;
    texto: string;
    onPress: () => void;
}

function Botao({ icone, texto, onPress }: BotaoProps) {
    return (
        <TouchableOpacity style={styles.botao} onPress={onPress} accessibilityRole="button">
            <Ionicons name={icone} size={22} color={colors.emergency} />
            <Text style={styles.botaoTexto}>{texto}</Text>
        </TouchableOpacity>
    );
}

export default function EmergenciaScreen({ navigation }: any) {
    const encerrarGravacao = useGravacaoSOS();
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [localizacao, setLocalizacao] = useState<string | null>(null); // null = buscando
    const [quando] = useState(() => new Date().toLocaleString('pt-BR').slice(0, 17)); // 15/10/2026, 20:30
    const smsAberto = useRef(false);

    // Contatos (cache local primeiro, funciona offline) e localização
    useEffect(() => {
        buscarContatosParaEmergencia().then(setContatos).catch(() => setContatos([]));
        obterLocalizacao().then(setLocalizacao).catch(() => setLocalizacao(''));
    }, []);

    // O botão voltar do Android não fecha a tela por engano
    useEffect(() => {
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
    }, []);

    const mensagem = localizacao === null ? null : montarMensagem(localizacao, quando);

    // Abre o SMS uma única vez, assim que a mensagem estiver pronta
    useEffect(() => {
        if (mensagem && contatos.length && !smsAberto.current) {
            smsAberto.current = true;
            enviarSMS(contatos, mensagem);
        }
    }, [mensagem, contatos]);

    async function encerrar() {
        try {
            await encerrarGravacao();
        } catch (erro) {
            console.log('Erro ao salvar áudio:', erro);
        }
        navigation.goBack();
    }

    return (
        <SafeAreaView style={styles.tela}>
            <ScrollView contentContainerStyle={styles.conteudo}>
                <Ionicons name="alert-circle" size={64} color={colors.white} style={styles.icone} />
                <Text style={styles.titulo}>Alerta de emergência</Text>

                {!mensagem ? (
                    <View style={styles.carregando}>
                        <ActivityIndicator color={colors.white} />
                        <Text style={styles.texto}>Buscando sua localização...</Text>
                    </View>
                ) : contatos.length === 0 ? (
                    <Text style={styles.texto}>
                        Você ainda não tem contatos de confiança. Ligue para o 190.
                    </Text>
                ) : (
                    <>
                        <Text style={styles.texto}>
                            O SMS foi aberto para seus contatos. Se preferir, envie também por:
                        </Text>
                        {contatos.map((c) => {
                            const nome = c.nome.split(' ')[0];
                            return (
                                <React.Fragment key={c.id}>
                                    <Botao
                                        icone="logo-whatsapp"
                                        texto={`WhatsApp: ${nome}`}
                                        onPress={() => abrirLink(linkWhatsApp(c.telefone, mensagem), 'WhatsApp')}
                                    />
                                    <Botao
                                        icone="paper-plane-outline"
                                        texto={`Telegram: ${nome}`}
                                        onPress={() => abrirLink(linkTelegram(c.telefone, mensagem), 'Telegram')}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </>
                )}

                <Botao icone="call" texto="Ligar 190" onPress={() => abrirLink('tel:190', 'Telefone')} />

                <TouchableOpacity style={styles.encerrar} onPress={encerrar} accessibilityRole="button">
                    <Text style={styles.encerrarTexto}>Encerrar</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: colors.emergency },
    conteudo: { padding: spacing.lg, gap: spacing.sm },
    icone: { alignSelf: 'center' },
    titulo: { fontSize: 24, fontWeight: '700', color: colors.white, textAlign: 'center' },
    texto: { fontSize: 15, color: colors.white, textAlign: 'center', marginVertical: spacing.sm },
    carregando: { alignItems: 'center', marginVertical: spacing.md },
    botao: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
    },
    botaoTexto: { fontSize: 16, fontWeight: '700', color: colors.emergency },
    encerrar: {
        marginTop: spacing.lg,
        borderWidth: 2,
        borderColor: colors.white,
        borderRadius: radius.md,
        padding: spacing.md,
        alignItems: 'center',
    },
    encerrarTexto: { fontSize: 16, fontWeight: '700', color: colors.white },
});