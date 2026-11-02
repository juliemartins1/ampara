// src/components/CartaoPublicacao.tsx
// Cartão de uma publicação: categoria, informação à direita (data ou denúncias),
// texto e um rodapé que muda conforme a tela (mural ou moderação).
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Publicacao, ROTULOS_CATEGORIA } from '../types/models';
import { colors, spacing, radius } from '../theme/colors';

interface Props {
    publicacao: Publicacao;
    info: React.ReactNode;
    children: React.ReactNode;
}

export default function CartaoPublicacao({ publicacao, info, children }: Props) {
    return (
        <View style={styles.card}>
            <View style={styles.topo}>
                <Text style={styles.categoria}>{ROTULOS_CATEGORIA[publicacao.categoria]}</Text>
                {info}
            </View>
            <Text style={styles.texto}>{publicacao.texto}</Text>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        padding: 14,
        borderWidth: 1,
        borderColor: colors.border,
    },
    topo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    categoria: {
        color: colors.primaryDark,
        backgroundColor: colors.primarySoft,
        fontWeight: '700',
        fontSize: 12,
        paddingVertical: 3,
        paddingHorizontal: 10,
        borderRadius: radius.pill,
        overflow: 'hidden',
    },
    texto: { fontSize: 15, color: colors.textPrimary, lineHeight: 21 },
});
