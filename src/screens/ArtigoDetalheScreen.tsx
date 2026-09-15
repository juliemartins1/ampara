// src/screens/ArtigoDetalheScreen.tsx
import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { colors, spacing, typography } from '../theme/colors';

export default function ArtigoDetalheScreen({ route }: any) {
    const { id } = route.params;
    const [conteudo, setConteudo] = useState<string | null>(null);
    const [erro, setErro] = useState<string | null>(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function buscarArtigo() {
            try {
                const snapshot = await getDoc(doc(db, 'artigos', id));
                if (snapshot.exists()) {
                    setConteudo(snapshot.data().conteudo);
                } else {
                    setErro('Artigo não encontrado.');
                }
            } catch (error) {
                console.error('Erro ao buscar artigo:', error);
                setErro('Não foi possível carregar o artigo agora.');
            } finally {
                setCarregando(false);
            }
        }

        buscarArtigo();
    }, [id]);

    if (carregando) {
        return (
            <View style={styles.centralizado}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (erro || !conteudo) {
        return (
            <View style={styles.centralizado}>
                <Text style={styles.mensagemErro}>
                    {erro ?? 'Conteúdo indisponível.'}
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Markdown style={markdownStyles}>{conteudo}</Markdown>
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
    centralizado: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    mensagemErro: {
        ...typography.errorText,
        fontSize: 15,
        textAlign: 'center',
    },
});

const markdownStyles = {
    heading1: {
        color: colors.primaryDark,
        fontSize: 20,
        fontWeight: '700' as const,
        marginBottom: spacing.sm,
    },
    heading2: {
        color: colors.primaryDark,
        fontSize: 17,
        fontWeight: '700' as const,
        marginTop: spacing.md,
        marginBottom: spacing.xs,
    },
    body: {
        fontSize: 14,
        color: colors.textPrimary,
        lineHeight: 21,
    },
    strong: {
        color: colors.primaryDark,
        fontWeight: '700' as const,
    },
    bullet_list: {
        marginBottom: spacing.sm,
    },
    list_item: {
        marginBottom: spacing.xs + 2,
    },
    hr: {
        backgroundColor: colors.border,
        height: 1,
        marginVertical: spacing.md,
    },
};