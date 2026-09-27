// src/components/SeletorBairro.tsx
// Campo "Bairro" com lista pesquisável (mesmo comportamento do cadastro).
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { BAIRROS_RIO_GRANDE } from '../constants/bairrosRioGrande';
import { colors, spacing, radius, typography } from '../theme/colors';

interface Props {
    valor: string;
    aoSelecionar: (bairro: string) => void;
    erro?: string;
}

export default function SeletorBairro({ valor, aoSelecionar, erro }: Props) {
    const [aberto, setAberto] = useState(false);
    const [busca, setBusca] = useState('');

    const filtrados = BAIRROS_RIO_GRANDE.filter((b) =>
        b.toLowerCase().includes(busca.trim().toLowerCase())
    );

    function fechar() {
        setBusca('');
        setAberto(false);
    }

    return (
        <View style={styles.campo}>
            <Text style={typography.label}>Bairro</Text>
            <TouchableOpacity
                style={[styles.input, erro ? styles.inputErro : null]}
                onPress={() => setAberto(true)}
                activeOpacity={0.7}
            >
                <Text style={valor ? typography.input : styles.placeholder}>
                    {valor || 'Selecione seu bairro em Rio Grande'}
                </Text>
            </TouchableOpacity>
            {erro ? <Text style={typography.errorText}>{erro}</Text> : null}

            <Modal visible={aberto} animationType="slide" transparent onRequestClose={fechar}>
                <View style={styles.overlay}>
                    <View style={styles.modal}>
                        <Text style={styles.modalTitulo}>Selecione seu bairro</Text>
                        <TextInput
                            style={[styles.input, { marginBottom: spacing.sm }]}
                            placeholder="Buscar bairro..."
                            placeholderTextColor={colors.placeholder}
                            value={busca}
                            onChangeText={setBusca}
                        />
                        <FlatList
                            data={filtrados}
                            keyExtractor={(item) => item}
                            keyboardShouldPersistTaps="handled"
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => {
                                        aoSelecionar(item);
                                        fechar();
                                    }}
                                >
                                    <Text
                                        style={[
                                            typography.input,
                                            item === valor && { color: colors.primary, fontWeight: '700' },
                                        ]}
                                    >
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={[typography.helper, { padding: spacing.md }]}>
                                    Nenhum bairro encontrado.
                                </Text>
                            }
                        />
                        <TouchableOpacity style={styles.cancelar} onPress={fechar}>
                            <Text style={{ color: colors.primary, fontWeight: '600' }}>Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    campo: { gap: spacing.xs, marginBottom: spacing.md },
    input: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        ...typography.input,
    },
    inputErro: { borderColor: colors.error },
    placeholder: { ...typography.input, color: colors.placeholder },
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
    modal: {
        backgroundColor: colors.background,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        padding: spacing.lg,
        maxHeight: '80%',
    },
    modalTitulo: { ...typography.label, fontSize: 18, marginBottom: spacing.md },
    item: {
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cancelar: { alignItems: 'center', paddingTop: spacing.md },
});