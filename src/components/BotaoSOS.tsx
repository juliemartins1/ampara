// src/components/BotaoSOS.tsx
// Segurar por 2 s para acionar: evita toque acidental (no bolso, por exemplo).
import React, { useRef } from 'react';
import { Animated, Pressable, Text, StyleSheet, Vibration } from 'react-native';
import { colors, spacing } from '../theme/colors';

const TEMPO_MS = 2000;
const TAMANHO = 140;

export default function BotaoSOS({ onAcionar }: { onAcionar: () => void }) {
    const progresso = useRef(new Animated.Value(0)).current;

    function comecar() {
        Vibration.vibrate(50);
        Animated.timing(progresso, { toValue: 1, duration: TEMPO_MS, useNativeDriver: true }).start(({ finished }) => {
            if (!finished) return; // soltou antes dos 2 s
            Vibration.vibrate(400);
            progresso.setValue(0);
            onAcionar();
        });
    }

    function soltar() {
        // Iniciar outra animação interrompe a anterior (finished = false)
        Animated.timing(progresso, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }

    return (
        <Pressable
            onPressIn={comecar}
            onPressOut={soltar}
            style={styles.botao}
            accessibilityRole="button"
            accessibilityLabel="Botão de emergência. Segure por 2 segundos."
            accessibilityActions={[{ name: 'activate' }]}
            onAccessibilityAction={onAcionar} // leitor de tela: toque duplo aciona direto
        >
            <Animated.View style={[styles.preenchimento, { transform: [{ scale: progresso }] }]} />
            <Text style={styles.texto}>SOS</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    botao: {
        width: TAMANHO,
        height: TAMANHO,
        borderRadius: TAMANHO / 2,
        backgroundColor: colors.emergency,
        borderWidth: 4,
        borderColor: 'rgba(255,255,255,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    preenchimento: {
        ...StyleSheet.absoluteFill,
        borderRadius: TAMANHO / 2,
        backgroundColor: colors.emergencyDark,
    },
    texto: { color: colors.white, fontSize: 30, fontWeight: '800', letterSpacing: 2 },
});