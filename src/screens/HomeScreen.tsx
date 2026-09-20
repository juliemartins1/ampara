// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Linking,
    Alert,
} from 'react-native';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';

interface ContatoConfianca {
    id: string;
    nome: string;
}

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
    const [contatos, setContatos] = useState<ContatoConfianca[]>([]);

    useEffect(() => {
        async function carregarDadosUsuaria() {
            const usuariaId = auth.currentUser?.uid;
            if (!usuariaId) return;

            try {
                const snapshot = await getDoc(doc(db, 'usuarias', usuariaId));
                if (snapshot.exists()) {
                    const primeiroNome = (snapshot.data().nome || '').split(' ')[0];
                    setNomeUsuaria(primeiroNome);
                }
            } catch (error) {
                console.error('Erro ao carregar dados da usuária:', error);
            }
        }

        async function carregarContatosConfianca() {
            const usuariaId = auth.currentUser?.uid;
            if (!usuariaId) return;

            try {
                const snapshot = await getDocs(
                    collection(db, 'usuarias', usuariaId, 'contatosConfianca')
                );
                const lista = snapshot.docs.map((docSnap) => ({
                    id: docSnap.id,
                    nome: docSnap.data().nome || '',
                }));
                setContatos(lista);
            } catch (error) {
                console.error('Erro ao carregar contatos de confiança:', error);
            }
        }

        carregarDadosUsuaria();
        carregarContatosConfianca();
    }, []);

    function handleLigar(numero: string) {
        Linking.openURL(`tel:${numero}`).catch((error) => {
            console.error('Erro ao iniciar chamada:', error);
            Alert.alert('Erro', 'Não foi possível abrir o discador.');
        });
    }

    function handleEmergencia() {
        // TODO: implementar o acionamento real do botão de emergência —
        // enviar localização + mensagem de alerta via deep link (WhatsApp/SMS)
        // para os contatos de confiança cadastrados.
        Alert.alert(
            'Botão de emergência',
            'Essa funcionalidade ainda está sendo implementada. Em caso de emergência real, ligue para 190 (Polícia) ou 180 (Central de Atendimento à Mulher).'
        );
    }

    async function handleSair() {
        try {
            await signOut(auth);
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Erro ao sair:', error);
            Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
        }
    }

    return (
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
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel="Configurações"
                    >
                        <Ionicons name="settings-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleSair}
                        style={styles.iconeHeader}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
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

                <TouchableOpacity
                    style={styles.botaoEmergencia}
                    onPress={handleEmergencia}
                    activeOpacity={0.85}
                >
                    <Text style={styles.botaoEmergenciaTexto}>SOS</Text>
                </TouchableOpacity>
                <Text style={styles.botaoEmergenciaLegenda}>
                    Toque para acionar ajuda
                </Text>

                <View style={styles.linhaTelefones}>
                    <TouchableOpacity
                        style={styles.botaoTelefone}
                        onPress={() => handleLigar('180')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="call-outline" size={16} color={colors.white} />
                        <Text style={styles.botaoTelefoneTexto}>180 Mulher</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.botaoTelefone}
                        onPress={() => handleLigar('190')}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="call-outline" size={16} color={colors.white} />
                        <Text style={styles.botaoTelefoneTexto}>190 Polícia</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.contatosLabel}>Contatos de confiança</Text>
                <View style={styles.linhaContatos}>
                    {contatos.slice(0, 4).map((contato, index) => (
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
                    <TouchableOpacity
                        style={styles.avatarAdicionar}
                        onPress={() => navigation.navigate('CadastroContatoConfianca')}
                    >
                        <Ionicons name="add" size={20} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </View>

            <Text style={styles.secaoTitulo}>Recursos</Text>

            <CardAcao
                titulo="Contatos de confiança"
                subtitulo="Cadastre e gerencie quem deve ser avisado em uma emergência"
                icone="people-outline"
                onPress={() => navigation.navigate('CadastroContatoConfianca')}
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
        </ScrollView>
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
    botaoEmergencia: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: colors.emergency,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    botaoEmergenciaTexto: {
        color: colors.white,
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: 2,
    },
    botaoEmergenciaLegenda: {
        color: colors.primarySoft,
        fontSize: 12,
        marginBottom: spacing.lg,
    },
    linhaTelefones: {
        flexDirection: 'row',
        gap: spacing.sm,
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