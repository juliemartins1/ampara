// src/components/BotaoDisfarce.tsx
// Saída rápida: um toque leva ao Bloco de Notas, de qualquer tela.
// Fica no canto inferior esquerdo para não cobrir os botões "+" das listas.
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/colors';

const TAMANHO = 48;

export default function BotaoDisfarce({ onPress }: { onPress: () => void }) {
    const { bottom } = useSafeAreaInsets();
    return (
        <TouchableOpacity
            style={[styles.botao, { bottom: bottom + spacing.md }]}
            onPress={onPress}
            activeOpacity={0.8}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Saída rápida: abrir o bloco de notas"
        >
            <Ionicons name="eye-off-outline" size={22} color={colors.white} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botao: {
        position: 'absolute',
        left: spacing.md,
        width: TAMANHO,
        height: TAMANHO,
        borderRadius: radius.pill,
        backgroundColor: colors.primaryDeep,
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 6,
        shadowColor: colors.black,
        shadowOpacity: 0.25,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
});
