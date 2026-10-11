// src/screens/EmergenciaScreen.tsx
// Aberta pelo SOS: obtém a localização, abre o SMS sozinho e oferece WhatsApp,
// Telegram (por contato) e 190 para a usuária avisar também pelos outros canais.
import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, Alert, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { buscarContatosParaEmergencia, Contato } from '../services/contatosService';
import { enviarSMS, linkTelegram, linkWhatsApp, montarMensagem, obterLocalizacao } from '../services/alertaService';
import { abrirLink } from '../utils/abrirLink';
import { colors, spacing, radius } from '../theme/colors';

interface BotaoProps {
    icone: keyof typeof Ionicons.glyphMap;
    texto: string;
    onPress: () => void;
}

function Botao({ icone, texto, onPress }: BotaoProps) {
    return (
        <TouchableOpacity style={styles.botao} onPress={onPress} activeOpacity={0.85}>
            <Ionicons name={icone} size={20} color={colors.emergency} />
            <Text style={styles.botaoTexto}>{texto}</Text>
        </TouchableOpacity>
    );
}

export default function EmergenciaScreen({ navigation }: any) {
    const [quando] = useState(() => new Date().toLocaleString('pt-BR'));
    const [contatos, setContatos] = useState<Contato[]>([]);
    const [localizacao, setLocalizacao] = useState<string | null>(null); // null = ainda buscando
    const smsAberto = useRef(false);
    const mensagem = montarMensagem(localizacao ?? '', quando);

    useEffect(() => {
        buscarContatosParaEmergencia().then(setContatos).catch(() => setContatos([]));
        obterLocalizacao().then(setLocalizacao).catch(() => setLocalizacao(''));
        // Bloqueia o "voltar" do Android: só sai pelo botão Encerrar
        const sub = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => sub.remove();
    }, []);

    // Assim que a localização e os contatos estiverem prontos, abre o SMS uma única vez
    useEffect(() => {
        if (localizacao === null || contatos.length === 0 || smsAberto.current) return;
        smsAberto.current = true;
        avisarPorSMS();
    }, [localizacao, contatos]);

    function avisarPorSMS() {
        enviarSMS(contatos, mensagem).catch((erro) => Alert.alert('SMS', erro.message));
    }

    return (
        <SafeAreaView style={styles.tela}>
            <ScrollView contentContainerStyle={styles.container}>
                <Ionicons name="alert-circle" size={56} color={colors.white} />
                <Text style={styles.titulo}>Emergência acionada</Text>
                <Text style={styles.status}>
                    {localizacao === null ? 'Obtendo sua localização...' : localizacao ? 'Localização pronta' : 'Localização indisponível'}
                </Text>

                {contatos.length === 0 ? (
                    <Text style={styles.status}>Nenhum contato de confiança cadastrado. Ligue 190.</Text>
                ) : (
                    <>
                        <Botao icone="chatbox-outline" texto={`SMS para todos (${contatos.length})`} onPress={avisarPorSMS} />
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
                <Botao icone="call-outline" texto="Ligar 190" onPress={() => abrirLink('tel:190', 'discador')} />

                <TouchableOpacity style={styles.encerrar} onPress={() => navigation.goBack()}>
                    <Text style={styles.encerrarTexto}>Encerrar</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tela: { flex: 1, backgroundColor: colors.emergency },
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, gap: spacing.sm },
    titulo: { color: colors.white, fontSize: 24, fontWeight: '800' },
    status: { color: colors.white, fontSize: 14, marginBottom: spacing.sm, textAlign: 'center' },
    botao: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: radius.md,
        paddingVertical: 14,
    },
    botaoTexto: { color: colors.emergency, fontSize: 16, fontWeight: '700' },
    encerrar: { marginTop: spacing.lg, padding: spacing.sm },
    encerrarTexto: { color: colors.white, fontSize: 15, textDecorationLine: 'underline' },
});