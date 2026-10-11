// src/theme/formStyles.ts
// Estilos compartilhados pelas telas de formulário (login, cadastro,
// contatos, perfil, senha). Antes cada tela tinha sua própria cópia.
import { StyleSheet } from 'react-native';
import { colors, spacing, radius, typography } from './colors';

export const formStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xl,
    },
    cartao: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.border,
    },
    campo: {
        marginBottom: spacing.md,
    },
    input: {
        ...typography.input,
        backgroundColor: colors.primarySoft,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        marginTop: spacing.xs,
    },
    inputErro: {
        borderColor: colors.error,
    },
    inputDesativado: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
    },
    placeholder: {
        ...typography.input,
        color: colors.placeholder,
    },
    linkBotao: {
        marginTop: spacing.md,
        alignItems: 'center',
    },
    linkTexto: {
        color: colors.primaryDark,
        fontWeight: '600',
        fontSize: 14,
    },
});