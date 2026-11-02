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
import { confirmarSaida } from '../utils/confirmarSaida';
import { colors, spacing, radius, typography } from '../theme/colors';
import {
    getDisguiseModeEnabled,
    setDisguiseModeEnabled,
    lerCodigoDisfarce,
    salvarCodigoDisfarce,
    removerCodigoDisfarce,
} from '../services/disguiseMode';
import CampoCodigo from '../components/CampoCodigo';

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
    const [temCodigo, setTemCodigo] = useState(false);
    // Definindo o código: primeiro digita, depois repete para confirmar
    const [etapaCodigo, setEtapaCodigo] = useState<'novo' | 'repetir' | null>(null);
    const [codigoNovo, setCodigoNovo] = useState('');

    useEffect(() => {
        Promise.all([getDisguiseModeEnabled(), lerCodigoDisfarce().catch(() => null)])
            .then(([disfarce, codigo]) => {
                setDisfarceAtivo(disfarce);
                setTemCodigo(!!codigo);
            })
            .finally(() => setCarregando(false));
    }, []);

    function configurarCodigo() {
        if (!temCodigo) return setEtapaCodigo('novo');
        Alert.alert('Código do disfarce', 'O que deseja fazer?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Remover',
                style: 'destructive',
                onPress: () => removerCodigoDisfarce().then(() => setTemCodigo(false)),
            },
            { text: 'Trocar', onPress: () => setEtapaCodigo('novo') },
        ]);
    }

    async function receberCodigo(codigo: string) {
        if (etapaCodigo === 'novo') {
            setCodigoNovo(codigo);
            return setEtapaCodigo('repetir');
        }
        setEtapaCodigo(null);
        if (codigo !== codigoNovo) {
            return Alert.alert('Código', 'Os códigos não conferem. Tente de novo.');
        }
        await salvarCodigoDisfarce(codigo);
        setTemCodigo(true);
        Alert.alert(
            'Código salvo',
            'Ele será pedido depois do toque longo no bloco de notas. Guarde bem: sem ele, só reinstalando o app (e os registros deste celular se perdem).'
        );
    }

    const alternarDisfarce = async (novoValor: boolean) => {
        setDisfarceAtivo(novoValor);
        await setDisguiseModeEnabled(novoValor);
    };

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
                    label="Código para sair do disfarce"
                    descricao={
                        temCodigo
                            ? 'Ativado: é pedido depois do toque longo no bloco de notas'
                            : 'Desativado: recomendado se alguém conhece o PIN do seu celular'
                    }
                    onPress={configurarCodigo}
                />

                <View style={styles.divisor} />

                <ItemNavegavel
                    label="Contatos de confiança"
                    descricao="Gerencie quem deve ser avisado em uma emergência"
                    onPress={() => navigation.navigate('Contatos')}
                />
            </Secao>

            <Secao titulo="Minha conta">
                <ItemNavegavel
                    label="Editar meus dados"
                    descricao="Nome, telefone e bairro"
                    onPress={() => navigation.navigate('EditarPerfil')}
                />

                <View style={styles.divisor} />

                <ItemNavegavel
                    label="Alterar senha"
                    descricao="Informe a senha atual e a nova"
                    onPress={() => navigation.navigate('AlterarSenha')}
                />

                <View style={styles.divisor} />

                <ItemNavegavel
                    label="Sair da conta"
                    onPress={() => confirmarSaida(navigation)}
                    destrutivo
                />

                <View style={styles.divisor} />

                <ItemNavegavel
                    label="Excluir minha conta"
                    descricao="Apaga seu cadastro e seus contatos de confiança"
                    onPress={() => navigation.navigate('ExcluirConta')}
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

            <CampoCodigo
                visivel={etapaCodigo !== null}
                titulo={etapaCodigo === 'novo' ? 'Crie um código de 4 a 6 números' : 'Repita o código'}
                aoConfirmar={receberCodigo}
                aoCancelar={() => setEtapaCodigo(null)}
            />
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
        paddingBottom: 88, // espaço para o botão de saída rápida
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