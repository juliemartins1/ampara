// src/components/Campo.tsx
// Rótulo + campo de texto + mensagem de erro (ou de ajuda).
// Aceita todas as props normais do TextInput.
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { colors, typography } from '../theme/colors';
import { formStyles } from '../theme/formStyle';

interface Props extends TextInputProps {
    label: string;
    erro?: string;
    ajuda?: string;
}

export default function Campo({ label, erro, ajuda, style, ...inputProps }: Props) {
    const desativado = inputProps.editable === false;

    return (
        <View style={formStyles.campo}>
            <Text style={typography.label}>{label}</Text>
            <TextInput
                style={[
                    formStyles.input,
                    erro ? formStyles.inputErro : null,
                    desativado ? formStyles.inputDesativado : null,
                    style,
                ]}
                placeholderTextColor={colors.placeholder}
                {...inputProps}
            />
            {erro ? (
                <Text style={typography.errorText}>{erro}</Text>
            ) : ajuda ? (
                <Text style={typography.helper}>{ajuda}</Text>
            ) : null}
        </View>
    );
}