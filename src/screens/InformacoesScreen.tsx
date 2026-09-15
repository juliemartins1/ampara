import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';

type SecaoId = 'direitos' | 'lei' | 'sinais' | 'saida';

interface SecaoAcordeao {
    id: SecaoId;
    titulo: string;
    itens: string[];
}

interface Artigo {
    id: string;
    titulo: string;
    subtitulo: string;
}

const SECOES_ACORDEAO: SecaoAcordeao[] = [
    {
        id: 'direitos',
        titulo: 'Direitos das Mulheres',
        itens: [
            'Toda mulher tem direito a uma vida sem violência, seja ela física, psicológica, sexual, patrimonial ou moral.',
            'A denúncia pode ser feita em qualquer Delegacia, na Delegacia Especializada de Atendimento à Mulher (DEAM) ou pelos canais 180 e 190.',
            'É possível solicitar medida protetiva de urgência mesmo sem Boletim de Ocorrência registrado antes.',
            'O atendimento nas delegacias e nos serviços de saúde deve ser gratuito e sigiloso.',
        ],
    },
    {
        id: 'lei',
        titulo: 'Lei Maria da Penha (Lei nº 11.340/2006)',
        itens: [
            'Cria mecanismos para coibir e prevenir a violência doméstica e familiar contra a mulher.',
            'Reconhece cinco formas de violência: física, psicológica, sexual, patrimonial e moral.',
            'A medida protetiva de urgência pode ser solicitada mesmo sem processo criminal em andamento.',
            'Desde agosto de 2026, o STF decidiu que as medidas protetivas também se aplicam a violência de gênero fora do contexto doméstico ou afetivo.',
        ],
    },
    {
        id: 'sinais',
        titulo: 'Sinais de Relacionamento Abusivo',
        itens: [
            'Controle excessivo sobre roupas, horários, amizades ou redes sociais.',
            'Isolamento progressivo da família e dos amigos.',
            'Ciúmes excessivo apresentado como "prova de amor".',
            'Humilhações, xingamentos ou críticas constantes, em público ou em privado.',
            'Ameaças de machucar você, os filhos, animais de estimação, ou de se machucar caso você termine.',
            'Controle financeiro, impedindo acesso a dinheiro próprio ou emprego.',
            'Alternância entre agressão e arrependimento intenso — o ciclo da violência.',
        ],
    },
    {
        id: 'saida',
        titulo: 'Como Sair de um Relacionamento Abusivo',
        itens: [
            'Busque apoio com pessoas de confiança antes de agir.',
            'Guarde documentos importantes e uma cópia de chaves em local seguro.',
            'Registre boletim de ocorrência sempre que possível.',
            'Planeje a saída com antecedência, evitando avisar o agressor antes de estar segura.',
            'Em risco imediato, ligue 190.',
            'Depois de sair, mantenha contatos de confiança informados sobre sua rotina.',
        ],
    },
];

export default function InformacoesScreen({ navigation }: any) {
    const [secaoAberta, setSecaoAberta] = useState<SecaoId | null>(null);
    const [artigos, setArtigos] = useState<Artigo[]>([]);
    const [carregandoArtigos, setCarregandoArtigos] = useState(true);
    const [erroArtigos, setErroArtigos] = useState<string | null>(null);

    useEffect(() => {
        async function buscarArtigos() {
            try {
                const q = query(collection(db, 'artigos'), orderBy('ordem'));
                const snapshot = await getDocs(q);
                setArtigos(
                    snapshot.docs.map((doc) => ({
                        id: doc.id,
                        titulo: doc.data().titulo,
                        subtitulo: doc.data().subtitulo,
                    }))
                );
            } catch (error) {
                console.error('Erro ao buscar artigos:', error);
                setErroArtigos('Não foi possível carregar os artigos agora.');
            } finally {
                setCarregandoArtigos(false);
            }
        }

        buscarArtigos();
    }, []);

    function alternarSecao(id: SecaoId) {
        setSecaoAberta((atual) => (atual === id ? null : id));
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.titulo}>Informações e Direitos</Text>
            <Text style={styles.subtitle}>
                Referência rápida sobre seus direitos e leituras completas para se aprofundar.
            </Text>

            {SECOES_ACORDEAO.map((secao) => {
                const aberta = secaoAberta === secao.id;
                return (
                    <View key={secao.id} style={styles.card}>
                        <TouchableOpacity
                            onPress={() => alternarSecao(secao.id)}
                            style={styles.cardHeader}
                            activeOpacity={0.85}
                            accessibilityRole="button"
                            accessibilityState={{ expanded: aberta }}
                        >
                            <Text style={styles.cardTitulo}>{secao.titulo}</Text>
                            <Text style={styles.cardIcone}>{aberta ? '−' : '+'}</Text>
                        </TouchableOpacity>

                        {aberta && (
                            <View style={styles.cardBody}>
                                {secao.itens.map((item, index) => (
                                    <Text key={index} style={styles.cardItem}>
                                        • {item}
                                    </Text>
                                ))}
                            </View>
                        )}
                    </View>
                );
            })}

            <Text style={styles.secaoTitulo}>Para ler com calma</Text>

            {carregandoArtigos ? (
                <ActivityIndicator color={colors.primary} style={styles.carregando} />
            ) : erroArtigos ? (
                <Text style={styles.mensagemErro}>{erroArtigos}</Text>
            ) : (
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.carrosselContent}
                >
                    {artigos.map((artigo) => (
                        <TouchableOpacity
                            key={artigo.id}
                            style={styles.cardArtigo}
                            activeOpacity={0.85}
                            onPress={() =>
                                navigation.navigate('ArtigoDetalhe', { id: artigo.id })
                            }
                        >
                            <Text style={styles.cardArtigoTitulo} numberOfLines={2}>
                                {artigo.titulo}
                            </Text>
                            <Text style={styles.cardArtigoSubtitulo} numberOfLines={3}>
                                {artigo.subtitulo}
                            </Text>
                            <Text style={styles.cardArtigoLink}>Ler artigo →</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            )}
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
    titulo: {
        ...typography.title,
        marginBottom: 2,
    },
    subtitle: {
        ...typography.subtitle,
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        backgroundColor: colors.primarySoft,
    },
    cardTitulo: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.primaryDark,
        flex: 1,
    },
    cardIcone: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.primaryDark,
    },
    cardBody: {
        padding: spacing.md,
    },
    cardItem: {
        fontSize: 13,
        color: colors.textPrimary,
        lineHeight: 19,
        marginBottom: spacing.xs + 2,
    },
    secaoTitulo: {
        ...typography.label,
        marginTop: spacing.md,
        marginBottom: spacing.sm,
    },
    carregando: {
        marginVertical: spacing.sm,
    },
    mensagemErro: {
        ...typography.errorText,
        marginBottom: spacing.sm,
    },
    carrosselContent: {
        paddingRight: spacing.xs,
        paddingBottom: spacing.xs,
    },
    cardArtigo: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: spacing.md,
        marginRight: spacing.sm,
        width: 200,
    },
    cardArtigoTitulo: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primaryDark,
        marginBottom: spacing.xs,
    },
    cardArtigoSubtitulo: {
        fontSize: 12,
        color: colors.textSecondary,
        lineHeight: 17,
        marginBottom: spacing.sm,
    },
    cardArtigoLink: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
});