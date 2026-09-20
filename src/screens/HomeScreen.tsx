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
import { doc, getDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';

interface AcaoRapidaProps {
    titulo: string;
    subtitulo: string;
    onPress: () => void;
    destaque?: boolean;
}

// Card reutilizável para os módulos da tela inicial
function CardAcao({ titulo, subtitulo, onPress, destaque }: AcaoRapidaProps) {
    return (
        <TouchableOpacity
            style={[styles.card, destaque && styles.cardDestaque]}
            onPress={onPress}
            activeOpacity={0.85}
        >
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
        </TouchableOpacity>
    );
}

function funcionalidadeEmDesenvolvimento() {
    Alert.alert(
        'Em desenvolvimento',
        'Essa funcionalidade ainda está sendo implementada.'
    );
}

export default function HomeScreen({ navigation }: any) {
    const [nomeUsuaria, setNomeUsuaria] = useState('');

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

        carregarDadosUsuaria();
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
                <View>
                    <Text style={styles.saudacao}>
                        Olá{nomeUsuaria ? `, ${nomeUsuaria}` : ''}
                    </Text>
                    <Text style={styles.subtitle}>
                        Estamos aqui para te apoiar.
                    </Text>
                </View>
                <TouchableOpacity onPress={handleSair} style={styles.sairButton}>
                    <Text style={styles.sairTexto}>Sair</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={styles.botaoEmergencia}
                onPress={handleEmergencia}
                activeOpacity={0.85}
            >
                <Text style={styles.botaoEmergenciaTexto}>SOS</Text>
                <Text style={styles.botaoEmergenciaSubtexto}>
                    Toque para acionar ajuda
                </Text>
            </TouchableOpacity>

            <View style={styles.linhaTelefones}>
                <TouchableOpacity
                    style={styles.botaoTelefone}
                    onPress={() => handleLigar('180')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.botaoTelefoneNumero}>180</Text>
                    <Text style={styles.botaoTelefoneLabel}>
                        Central de Atendimento à Mulher
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.botaoTelefone}
                    onPress={() => handleLigar('190')}
                    activeOpacity={0.85}
                >
                    <Text style={styles.botaoTelefoneNumero}>190</Text>
                    <Text style={styles.botaoTelefoneLabel}>
                        Emergência policial
                    </Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.secaoTitulo}>Recursos</Text>

            <CardAcao
                titulo="Contatos de confiança"
                subtitulo="Cadastre e gerencie quem deve ser avisado em uma emergência"
                onPress={() => navigation.navigate('CadastroContatoConfianca')}
                destaque
            />

            <CardAcao
                titulo="Direitos e Lei Maria da Penha"
                subtitulo="Informações sobre seus direitos e sinais de relacionamento abusivo"
                onPress={() => navigation.navigate('Informacoes')}
            />

            <CardAcao
                titulo="Delegacias e serviços próximos"
                subtitulo="Encontre pontos de atendimento especializado perto de você"
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
        padding: 24,
        paddingBottom: 40,
    },
    headerBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    saudacao: {
        ...typography.title,
        marginBottom: 2,
    },
    subtitle: {
        ...typography.subtitle,
    },
    sairButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
    },
    sairTexto: {
        color: colors.primaryDark,
        fontWeight: '600',
        fontSize: 14,
    },
    botaoEmergencia: {
        backgroundColor: colors.error,
        borderRadius: radius.lg,
        paddingVertical: 28,
        alignItems: 'center',
        marginBottom: 16,
    },
    botaoEmergenciaTexto: {
        color: colors.white,
        fontSize: 32,
        fontWeight: '800',
        letterSpacing: 2,
    },
    botaoEmergenciaSubtexto: {
        color: colors.white,
        fontSize: 13,
        marginTop: 4,
        opacity: 0.9,
    },
    linhaTelefones: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: 24,
    },
    botaoTelefone: {
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingVertical: 14,
        alignItems: 'center',
    },
    botaoTelefoneNumero: {
        fontSize: 22,
        fontWeight: '700',
        color: colors.primaryDark,
    },
    botaoTelefoneLabel: {
        fontSize: 11,
        color: colors.textPrimary,
        textAlign: 'center',
        marginTop: 4,
        paddingHorizontal: 4,
    },
    secaoTitulo: {
        ...typography.label,
        marginBottom: 8,
        marginTop: 8,
    },
    card: {
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