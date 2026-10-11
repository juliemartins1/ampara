import React from 'react';
import {
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    StyleProp,
    ViewStyle,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';

interface Props {
    titulo: string;
    onPress: () => void;
    carregando?: boolean;
    cor?: string;
    style?: StyleProp<ViewStyle>;
}

export default function BotaoPrimario({
    titulo,
    onPress,
    carregando = false,
    cor = colors.primary,
    style,
}: Props) {
    return (
        <TouchableOpacity
            style={[styles.botao, { backgroundColor: cor }, carregando && styles.desativado, style]}
            onPress={onPress}
            disabled={carregando}
            activeOpacity={0.85}
            accessibilityRole="button"
        >
            {carregando ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <Text style={typography.button}>{titulo}</Text>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    botao: {
        borderRadius: radius.md,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: spacing.sm,
    },
    desativado: {
        opacity: 0.7,
    },
});