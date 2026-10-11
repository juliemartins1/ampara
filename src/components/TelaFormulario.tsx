
// src/components/TelaFormulario.tsx
// Estrutura comum das telas de formulário: teclado não cobre os campos,
// rolagem, cabeçalho opcional (ícone + título + subtítulo) e cartão opcional.
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
} from 'react-native';
import { colors, spacing, radius, typography } from '../theme/colors';
import { formStyles } from '../theme/formStyle';

interface Props {
    children: React.ReactNode;
    icone?: string;
    titulo?: string;
    subtitulo?: string;
    emCartao?: boolean;
}

export default function TelaFormulario({
    children,
    icone,
    titulo,
    subtitulo,
    emCartao = false,
}: Props) {
    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={formStyles.container}
                contentContainerStyle={formStyles.content}
                keyboardShouldPersistTaps="handled"
            >
                {titulo ? (
                    <View style={styles.cabecalho}>
                        {icone ? (
                            <View style={styles.logoCirculo}>
                                <Text style={styles.logoTexto}>{icone}</Text>
                            </View>
                        ) : null}
                        <Text style={styles.titulo}>{titulo}</Text>
                        {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
                    </View>
                ) : null}

                {emCartao ? <View style={formStyles.cartao}>{children}</View> : children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    cabecalho: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoCirculo: {
        width: 64,
        height: 64,
        borderRadius: radius.pill,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    logoTexto: {
        color: colors.white,
        fontSize: 28,
        fontWeight: '700',
    },
    titulo: {
        ...typography.title,
        marginBottom: spacing.xs,
    },
    subtitulo: {
        ...typography.subtitle,
        textAlign: 'center',
        paddingHorizontal: spacing.md,
    },
});