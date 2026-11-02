// src/components/Chips.tsx
// Botões de seleção em formato de "pílula". Usado na relação do contato,
// na categoria da publicação e nos tipos de violência do relato.
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { formStyles } from '../theme/formStyle';

interface Props<T extends string> {
    opcoes: readonly T[];
    selecionados: readonly (T | null)[];
    aoTocar: (valor: T) => void;
    rotulo?: (valor: T) => string;
}

export default function Chips<T extends string>({
    opcoes,
    selecionados,
    aoTocar,
    rotulo = (valor) => valor,
}: Props<T>) {
    return (
        <View style={formStyles.chips}>
            {opcoes.map((opcao) => {
                const ativo = selecionados.includes(opcao);
                return (
                    <TouchableOpacity
                        key={opcao}
                        style={[formStyles.chip, ativo && formStyles.chipAtivo]}
                        onPress={() => aoTocar(opcao)}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityState={{ selected: ativo }}
                    >
                        <Text style={[formStyles.chipTexto, ativo && formStyles.chipTextoAtivo]}>
                            {rotulo(opcao)}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}
