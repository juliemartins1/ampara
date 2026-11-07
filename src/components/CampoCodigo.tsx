// src/components/CampoCodigo.tsx
// Janela simples para digitar um código numérico (4 a 6 dígitos).
// Visual neutro, para combinar tanto com o bloco de notas quanto com o app.
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, radius } from '../theme/colors';

export const TAMANHO_MIN_CODIGO = 4;

interface Props {
    visivel: boolean;
    titulo: string;
    aoConfirmar: (codigo: string) => void;
    aoCancelar: () => void;
}

export default function CampoCodigo({ visivel, titulo, aoConfirmar, aoCancelar }: Props) {
    const [codigo, setCodigo] = useState('');

    useEffect(() => {
        if (visivel) setCodigo(''); // sempre começa vazio
    }, [visivel, titulo]);

    return (
        <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoCancelar}>
            <View style={styles.fundo}>
                <View style={styles.caixa}>
                    <Text style={styles.titulo}>{titulo}</Text>
                    <TextInput
                        style={styles.input}
                        value={codigo}
                        onChangeText={(t) => setCodigo(t.replace(/\D/g, '').slice(0, 6))}
                        keyboardType="number-pad"
                        secureTextEntry
                        selectionColor="#3A3A3A"
                        cursorColor="#3A3A3A"
                        autoFocus
                        maxLength={6}
                    />
                    <View style={styles.botoes}>
                        <TouchableOpacity onPress={aoCancelar} style={styles.botao}>
                            <Text style={styles.cancelar}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => aoConfirmar(codigo)}
                            disabled={codigo.length < TAMANHO_MIN_CODIGO}
                            style={styles.botao}
                        >
                            <Text style={[styles.ok, codigo.length < TAMANHO_MIN_CODIGO && styles.desativado]}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    fundo: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: spacing.lg },
    caixa: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg },
    titulo: { fontSize: 16, fontWeight: '600', color: '#3A3A3A', marginBottom: spacing.md },
    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#CCC',
        fontSize: 22,
        color: '#3A3A3A', // sem cor explícita, o Android em tema escuro desenha os pontos em branco
        letterSpacing: 8,
        paddingVertical: spacing.sm,
        textAlign: 'center',
    },
    botoes: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.lg },
    botao: { padding: spacing.sm },
    cancelar: { color: '#999', fontWeight: '600' },
    ok: { color: '#3A3A3A', fontWeight: '700' },
    desativado: { opacity: 0.3 },
});
