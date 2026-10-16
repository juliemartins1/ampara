// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme/colors';
import { Contato, LIMITE_CONTATOS, ouvirContatos } from '../services/contatosService';
import { ouvirUsuaria, sairDaConta } from '../services/usuariaService';
import { aquecerLocalizacao } from '../services/alertaService';
import { pedirPermissoesGravacao } from '../hooks/useGravacaoSOS';
import { abrirLink } from '../utils/abrirLink';
import BotaoSOS from '../components/BotaoSOS';

const HIT_SLOP = { top: 12, bottom: 12, left: 12, right: 12 };
const TELEFONES = [
    { numero: '180', rotulo: '180 Mulher' },
    { numero: '190', rotulo: '190 Polícia' },
];

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
        <TouchableOpacity
            style={[styles.card, destaque && styles.cardDestaque]}
            onPress={onPress}
            activeOpacity={0.85}
        >
            <View
                style={[
                    styles.cardIconeContainer,
                    destaque && styles.cardIconeContainerDestaque,
                ]}
            >
                <Ionicons
                    name={icone}
                    size={20}
                    color={destaque ? colors.white : colors.primaryDark}
                />
            </View>
            <View style={styles.cardTextos}>
                <Text
                    style={[styles.cardTitulo, destaque && styles.cardTituloDestaque]}
                >
                    {titulo}
                </Text>
                <Text
                    style={[styles.cardSubtitulo, destaque && styles.cardSubtituloDestaque]}
                >
                    {subtitulo}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

// Cores usadas para os avatares dos contatos, em rotação
const CORES_AVATAR = [colors.primaryLight, colors.emergency, colors.warning, colors.sucess];

function iniciaisDoNome(nome: string) {
    const partes = nome.trim().split(' ').filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].substring(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function HomeScreen({ navigation }: any) {
    const [nomeUsuaria, setNomeUsuaria] = useState('');
    const [contatos, setContatos] = useState<Contato[]>([]);

    // Tempo real: se a usuária editar o nome ou um contato, a Home já aparece
    // atualizada. O contatosService também atualiza o cache usado pelo SOS.
    useEffect(() => {
        const pararUsuaria = ouvirUsuaria((dados) => setNomeUsuaria((dados?.nome || '').split(' ')[0]));
        const pararContatos = ouvirContatos(setContatos);
        return () => {
            pararUsuaria();
            pararContatos();
        };
    }, []);

    // Pede as permissões antes de uma emergência e deixa a localização pronta,
    // para o SOS não esperar o GPS nem mostrar pedidos de permissão
    useEffect(() => {
        (async () => {
            await aquecerLocalizacao();
            await pedirPermissoesGravacao();
        })().catch(() => { });
    }, []);

    function handleSair() {
        Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await sairDaConta(); // também apaga o cache dos contatos
                        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                    } catch (error) {
                        console.error('Erro ao sair:', error);
                        Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
                    }
                },
            },
        ]);
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
            >
                <View style={styles.headerBar}>
                    <Text style={styles.headerTitulo}>Ampara</Text>
                    <View style={styles.headerAcoes}>
                        <TouchableOpacity
                            onPress={() => navigation.navigate('Configuracoes')}
                            style={styles.iconeHeader}
                            hitSlop={HIT_SLOP}
                            accessibilityLabel="Configurações"
                        >
                            <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSair}
                            style={styles.iconeHeader}
                            hitSlop={HIT_SLOP}
                            accessibilityLabel="Sair"
                        >
                            <Ionicons name="log-out-outline" size={22} color={colors.textPrimary} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Cartão principal roxo escuro */}
                <View style={styles.cartaoPrincipal}>
                    <Text style={styles.saudacao}>
                        Olá{nomeUsuaria ? `, ${nomeUsuaria}` : ''}
                    </Text>
                    <Text style={styles.subtitle}>Você não está sozinha.</Text>

                    <BotaoSOS onAcionar={() => navigation.navigate('Emergencia')} />

                    <View style={styles.linhaTelefones}>
                        {TELEFONES.map((t) => (
                            <TouchableOpacity
                                key={t.numero}
                                style={styles.botaoTelefone}
                                onPress={() => abrirLink(`tel:${t.numero}`, 'Telefone')}
                                activeOpacity={0.85}
                            >
                                <Ionicons name="call-outline" size={16} color={colors.white} />
                                <Text style={styles.botaoTelefoneTexto}>{t.rotulo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.contatosLabel}>Contatos de confiança</Text>
                    {contatos.length === 0 ? (
                        <Text style={styles.avisoSemContatos}>
                            Nenhum contato cadastrado. O SOS precisa de ao menos um.
                        </Text>
                    ) : null}
                    <View style={styles.linhaContatos}>
                        {contatos.slice(0, LIMITE_CONTATOS).map((contato, index) => (
                            <View
                                key={contato.id}
                                style={[
                                    styles.avatarContato,
                                    { backgroundColor: CORES_AVATAR[index % CORES_AVATAR.length] },
                                ]}
                            >
                                <Text style={styles.avatarContatoTexto}>
                                    {iniciaisDoNome(contato.nome)}
                                </Text>
                            </View>
                        ))}
                        {contatos.length < LIMITE_CONTATOS ? (
                            <TouchableOpacity
                                style={styles.avatarAdicionar}
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
                    titulo="Meus registros"
                    subtitulo="Áudios do SOS, fotos e relatos de ocorrência em PDF"
                    icone="folder-open-outline"
                    onPress={() => navigation.navigate('Registros')}
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
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerTitulo: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    headerAcoes: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    iconeHeader: {
        padding: 4,
    },
    cartaoPrincipal: {
        backgroundColor: colors.primaryDeep,
        borderRadius: radius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    saudacao: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.white,
        alignSelf: 'flex-start',
    },
    subtitle: {
        fontSize: 13,
        color: colors.primarySoft,
        alignSelf: 'flex-start',
        marginBottom: spacing.lg,
    },
    avisoSemContatos: {
        color: colors.primarySoft,
        fontSize: 12,
        alignSelf: 'flex-start',
        marginBottom: spacing.sm,
    },
    linhaTelefones: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginTop: spacing.md,
        marginBottom: spacing.lg,
        width: '100%',
    },
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
    botaoTelefoneTexto: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '600',
    },
    contatosLabel: {
        color: colors.primarySoft,
        fontSize: 12,
        alignSelf: 'flex-start',
        marginBottom: spacing.sm,
    },
    linhaContatos: {
        flexDirection: 'row',
        alignSelf: 'flex-start',
        gap: spacing.sm,
    },
    avatarContato: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarContatoTexto: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '700',
    },
    avatarAdicionar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.4)',
        borderStyle: 'dashed',
    },
    secaoTitulo: {
        ...typography.label,
        marginBottom: 8,
        marginTop: 8,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 16,
        marginBottom: 12,
    },
    cardDestaque: {
        backgroundColor: colors.primarySoft,
        borderColor: colors.primaryLight,
    },
    cardIconeContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardIconeContainerDestaque: {
        backgroundColor: colors.primary,
    },
    cardTextos: {
        flex: 1,
    },
    cardTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    cardTituloDestaque: {
        color: colors.primaryDark,
    },
    cardSubtitulo: {
        fontSize: 13,
        color: colors.placeholder,
    },
    cardSubtituloDestaque: {
        color: colors.primaryDark,
        opacity: 0.8,
    },
});