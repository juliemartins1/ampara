// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { auth } from '../services/firebaseConfig';
import { Contato, LIMITE_CONTATOS, ouvirContatos } from '../services/contatosService';
import { ouvirUsuaria, sairDaConta } from '../services/usuariaService';
import { abrirLink } from '../utils/abrirLink';
import BotaoSOS from '../components/BotaoSOS';
import { colors, spacing, radius, typography } from '../theme/colors';

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };
const TELEFONES = [
    { numero: '180', rotulo: '180 Mulher' },
    { numero: '190', rotulo: '190 Polícia' },
];
// Cores usadas para os avatares dos contatos, em rotação
const CORES_AVATAR = [colors.primaryLight, colors.emergency, colors.warning, colors.sucess];

interface AcaoRapidaProps {
    titulo: string;
    subtitulo: string;
    icone: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    destaque?: boolean;
}

// Card reutilizável para os módulos da tela inicial
function CardAcao({ titulo, subtitulo, icone, onPress, destaque }: AcaoRapidaProps) {
    return (
        <TouchableOpacity style={[styles.card, destaque && styles.cardDestaque]} onPress={onPress} activeOpacity={0.85}>
            <View style={[styles.cardIcone, destaque && styles.cardIconeDestaque]}>
                <Ionicons name={icone} size={20} color={destaque ? colors.white : colors.primaryDark} />
            </View>
            <View style={styles.cardTextos}>
                <Text style={[styles.cardTitulo, destaque && styles.textoDestaque]}>{titulo}</Text>
                <Text style={[styles.cardSubtitulo, destaque && styles.textoDestaque]}>{subtitulo}</Text>
            </View>
        </TouchableOpacity>
    );
}

function iniciaisDoNome(nome: string) {
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function HomeScreen({ navigation }: any) {
    const [nomeUsuaria, setNomeUsuaria] = useState('');
    const [contatos, setContatos] = useState<Contato[]>([]);

    useEffect(() => {
        if (!auth.currentUser) return;
        // Escutas em tempo real dos serviços; ouvirContatos também atualiza
        // a cópia local que o SOS usa sem internet.
        const pararUsuaria = ouvirUsuaria((dados) => setNomeUsuaria((dados?.nome || '').split(' ')[0]));
        const pararContatos = ouvirContatos(setContatos);
        return () => {
            pararUsuaria();
            pararContatos();
        };
    }, []);

    function handleSair() {
        Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await sairDaConta(); // apaga a cópia local dos contatos antes de sair
                        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch {
                        Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
                    }
                },
            },
        ]);
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.headerBar}>
                    <Text style={styles.headerTitulo}>Ampara</Text>
                    <View style={styles.headerAcoes}>
                        <TouchableOpacity onPress={() => navigation.navigate('Configuracoes')} hitSlop={HIT_SLOP} accessibilityLabel="Configurações">
                            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleSair} hitSlop={HIT_SLOP} accessibilityLabel="Sair">
                            <Ionicons name="log-out-outline" size={22} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Cartão principal roxo escuro */}
                <View style={styles.cartaoPrincipal}>
                    <Text style={styles.saudacao}>Olá{nomeUsuaria ? `, ${nomeUsuaria}` : ''}</Text>
                    <Text style={[styles.textoClaro, styles.subtitulo]}>Você não está sozinha.</Text>

                    <BotaoSOS onAcionar={() => navigation.navigate('Emergencia')} />
                    <Text style={[styles.textoClaro, styles.legendaSOS]}>Segure por 2 segundos para pedir ajuda</Text>

                    <View style={styles.linhaTelefones}>
                        {TELEFONES.map(({ numero, rotulo }) => (
                            <TouchableOpacity
                                key={numero}
                                style={styles.botaoTelefone}
                                onPress={() => abrirLink(`tel:${numero}`, 'discador')}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="call-outline" size={16} color={colors.white} />
                                <Text style={styles.botaoTelefoneTexto}>{rotulo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.textoClaro}>Contatos de confiança</Text>
                    {contatos.length === 0 ? (
                        <Text style={styles.textoClaro}>Nenhum contato cadastrado. O SOS precisa de ao menos um.</Text>
                    ) : null}
                    <View style={styles.linhaContatos}>
                        {contatos.slice(0, LIMITE_CONTATOS).map((contato, index) => (
                            <View key={contato.id} style={[styles.avatar, { backgroundColor: CORES_AVATAR[index % CORES_AVATAR.length] }]}>
                                <Text style={styles.avatarTexto}>{iniciaisDoNome(contato.nome)}</Text>
                            </View>
                        ))}
                        {contatos.length < LIMITE_CONTATOS ? (
                            <TouchableOpacity
                                style={[styles.avatar, styles.avatarAdicionar]}
                                onPress={() => navigation.navigate('CadastroContatoConfianca')}
                                accessibilityLabel="Adicionar contato de confiança"
                            >
                                <Ionicons name="add" size={20} color={colors.white} />
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>

                <Text style={styles.secaoTitulo}>Recursos</Text>
                <CardAcao
                    titulo="Contatos de confiança"
                    subtitulo="Cadastre e gerencie quem deve ser avisado em uma emergência"
                    icone="people-outline"
                    onPress={() => navigation.navigate('Contatos')}
                    destaque
                />
                <CardAcao
                    titulo="Direitos e Lei Maria da Penha"
                    subtitulo="Informações sobre seus direitos e sinais de relacionamento abusivo"
                    icone="book-outline"
                    onPress={() => navigation.navigate('Informacoes')}
                />
                <CardAcao
                    titulo="Delegacias e serviços próximos"
                    subtitulo="Encontre pontos de atendimento especializado perto de você"
                    icone="location-outline"
                    onPress={() => navigation.navigate('MapaServicos')}
                />
                <CardAcao
                    titulo="Comunidade"
                    subtitulo="Leia e compartilhe relatos, apoio e dicas de forma anônima"
                    icone="chatbubbles-outline"
                    onPress={() => navigation.navigate('Mural')}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: 20, paddingBottom: 40 },
    headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    headerTitulo: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
    headerAcoes: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
    cartaoPrincipal: {
        backgroundColor: colors.primaryDeep,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    saudacao: { fontSize: 18, fontWeight: '700', color: colors.white, alignSelf: 'flex-start' },
    // Texto lilás claro sobre o cartão escuro (subtítulo, legendas, avisos)
    textoClaro: { color: colors.primarySoft, fontSize: 12, alignSelf: 'flex-start', marginBottom: spacing.sm },
    subtitulo: { fontSize: 13, marginBottom: spacing.lg },
    legendaSOS: { alignSelf: 'center', marginBottom: spacing.lg },
    linhaTelefones: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, width: '100%' },
    botaoTelefone: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: radius.md,
        paddingVertical: 10,
    },
    botaoTelefoneTexto: { color: colors.white, fontSize: 13, fontWeight: '600' },
    linhaContatos: { flexDirection: 'row', alignSelf: 'flex-start', gap: spacing.sm },
    avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    avatarTexto: { color: colors.white, fontSize: 13, fontWeight: '700' },
    avatarAdicionar: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        borderStyle: 'dashed',
    },
    secaoTitulo: { ...typography.label, marginVertical: spacing.sm },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginBottom: 12,
    },
    cardDestaque: { backgroundColor: colors.primarySoft, borderColor: colors.primaryLight },
    cardIcone: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardIconeDestaque: { backgroundColor: colors.primary },
    cardTextos: { flex: 1 },
    cardTitulo: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 },
    cardSubtitulo: { fontSize: 13, color: colors.placeholder },
    textoDestaque: { color: colors.primaryDark },
});