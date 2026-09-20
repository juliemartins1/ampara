// src/screens/ConfiguracoesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    Switch,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { colors, spacing, radius, typography } from '../theme/colors';
import {
    getDisguiseModeEnabled,
    setDisguiseModeEnabled,
} from '../services/disguiseMode';

interface SecaoProps {
    titulo: string;
    children: React.ReactNode;
}

function Secao({ titulo, children }: SecaoProps) {
    return (
        <View style={styles.secao}>
            <Text style={styles.secaoTitulo}>{titulo}</Text>
            <View style={styles.card}>{children}</View>
        </View>
    );
}

interface ItemNavegavelProps {
    label: string;
    descricao?: string;
    onPress: () => void;
    destrutivo?: boolean;
}

function ItemNavegavel({ label, descricao, onPress, destrutivo }: ItemNavegavelProps) {
    return (
        <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.itemTexto}>
                <Text style={[styles.itemLabel, destrutivo && styles.itemLabelDestrutivo]}>
                    {label}
                </Text>
                {descricao ? <Text style={styles.itemDescricao}>{descricao}</Text> : null}
            </View>
            <Text style={styles.itemSeta}>›</Text>
        </TouchableOpacity>
    );
}

export default function ConfiguracoesScreen() {
    const navigation = useNavigation<any>();
    const [disfarceAtivo, setDisfarceAtivo] = useState(true);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        getDisguiseModeEnabled().then((valor) => {
            setDisfarceAtivo(valor);
            setCarregando(false);
        });
    }, []);

    const alternarDisfarce = async (novoValor: boolean) => {
        setDisfarceAtivo(novoValor);
        await setDisguiseModeEnabled(novoValor);
    };

    async function handleSair() {
        Alert.alert('Sair da conta', 'Tem certeza que deseja sair?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await signOut(auth);
                        navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        });
                    } catch (error) {
                        console.error('Erro ao sair:', error);
                        Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
                    }
                },
            },
        ]);
    }

    if (carregando) {
        return (
            <View style={styles.containerCentralizado}>
                <ActivityIndicator color={colors.primary} />
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
        >
            <Text style={styles.titulo}>Configurações</Text>

            <Secao titulo="Segurança">
                <View style={styles.item}>
                    <View style={styles.itemTexto}>
                        <Text style={styles.itemLabel}>Modo disfarçado</Text>
                        <Text style={styles.itemDescricao}>
                            Quando ativado, o aplicativo abre com uma interface
                            alternativa. Você pode desativar essa opção a qualquer
                            momento.
                        </Text>
                    </View>
                    <Switch
                        value={disfarceAtivo}
                        onValueChange={alternarDisfarce}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={colors.white}
                    />
                </View>

                <View style={styles.divisor} />

                <ItemNavegavel
                    label="Contatos de confiança"
                    descricao="Gerencie quem deve ser avisado em uma emergência"
                    onPress={() => navigation.navigate('CadastroContatoConfianca')}
                />
            </Secao>

            <Secao titulo="Conta">
                <ItemNavegavel
                    label="Sair da conta"
                    onPress={handleSair}
                    destrutivo
                />
            </Secao>

            <Secao titulo="Sobre">
                <ItemNavegavel
                    label="Sobre o Ampara"
                    descricao="Versão 1.0.0 · Projeto de código aberto"
                    onPress={() =>
                        Alert.alert(
                            'Sobre o Ampara',
                            'Ampara é um aplicativo de apoio a mulheres em situação de violência, desenvolvido como Trabalho de Conclusão de Curso no IFRS - Campus Rio Grande.\n\nCódigo aberto disponível em github.com/juliemartins1/ampara.'
                        )
                    }
                />
            </Secao>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    containerCentralizado: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingBottom: 40,
    },
    titulo: {
        ...typography.title,
        marginBottom: 24,
    },
    secao: {
        marginBottom: 24,
    },
    secaoTitulo: {
        ...typography.label,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    item: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: spacing.md,
    },
    itemTexto: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    itemLabelDestrutivo: {
        color: colors.error,
    },
    itemDescricao: {
        fontSize: 13,
        color: colors.placeholder,
    },
    itemSeta: {
        fontSize: 20,
        color: colors.placeholder,
    },
    divisor: {
        height: 1,
        backgroundColor: colors.border,
        marginLeft: 16,
    },
});