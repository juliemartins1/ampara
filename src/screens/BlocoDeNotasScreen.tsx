// src/screens/BlocoDeNotasScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    TextInput,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { rotaDaSessao } from '../services/usuariaService';
import { spacing, radius } from '../theme/colors';

type Nota = {
    id: string;
    titulo: string;
    conteudo: string;
    data: string;
};

const NOTAS_STORAGE_KEY = '@ampara_notas_disfarce';
const TEMPO_TOQUE_LONGO_MS = 2500;

export default function BlocoDeNotasScreen() {
    const navigation = useNavigation<any>();
    const [notas, setNotas] = useState<Nota[]>([]);
    const [notaSelecionada, setNotaSelecionada] = useState<Nota | null>(null);

    useEffect(() => {
        AsyncStorage.getItem(NOTAS_STORAGE_KEY)
            .then((salvo) => setNotas(salvo ? JSON.parse(salvo) : []))
            .catch(() => setNotas([]));
    }, []);

    // Com uma nota aberta, o "voltar" do Android fecha a nota (e não o app)
    useEffect(() => {
        if (!notaSelecionada) return;
        const sub = BackHandler.addEventListener('hardwareBackPress', () => {
            setNotaSelecionada(null);
            return true;
        });
        return () => sub.remove();
    }, [notaSelecionada]);

    const salvarNotas = async (novaLista: Nota[]) => {
        setNotas(novaLista);
        await AsyncStorage.setItem(NOTAS_STORAGE_KEY, JSON.stringify(novaLista));
    };
    // Gesto secreto: sai do disfarce para a tela da sessão
    // (Login, Verificar e-mail ou Home — a mesma regra de quando o app abre)
    const sairDoDisfarce = async () => {
        navigation.reset({ index: 0, routes: [{ name: await rotaDaSessao() }] });
    };

    const criarNovaNota = () => {
        const novaNota: Nota = {
            id: Date.now().toString(),
            titulo: '',
            conteudo: '',
            data: new Date().toLocaleDateString('pt-BR'),
        };
        setNotaSelecionada(novaNota);
    };

    const salvarNotaAtual = () => {
        if (!notaSelecionada) return;
        // Nota em branco não vira um cartão vazio na lista
        if (!notaSelecionada.titulo.trim() && !notaSelecionada.conteudo.trim()) {
            setNotaSelecionada(null);
            return;
        }
        const jaExiste = notas.find((n) => n.id === notaSelecionada.id);
        const novaLista = jaExiste
            ? notas.map((n) => (n.id === notaSelecionada.id ? notaSelecionada : n))
            : [notaSelecionada, ...notas];
        salvarNotas(novaLista);
        setNotaSelecionada(null);
    };

    // Pede confirmação: antes um toque longo sem querer apagava a nota
    const apagarNota = (nota: Nota) => {
        Alert.alert('Apagar nota', `Apagar "${nota.titulo || 'Sem título'}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Apagar',
                style: 'destructive',
                onPress: () => salvarNotas(notas.filter((n) => n.id !== nota.id)),
            },
        ]);
    };

    // Tela de edição de uma nota individual
    if (notaSelecionada) {
        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <TextInput
                        style={styles.inputTitulo}
                        placeholder="Título"
                        value={notaSelecionada.titulo}
                        onChangeText={(texto) =>
                            setNotaSelecionada({ ...notaSelecionada, titulo: texto })
                        }
                    />
                    <TextInput
                        style={styles.inputConteudo}
                        placeholder="Escreva sua nota..."
                        multiline
                        value={notaSelecionada.conteudo}
                        onChangeText={(texto) =>
                            setNotaSelecionada({ ...notaSelecionada, conteudo: texto })
                        }
                    />
                    <View style={styles.linhaBotoes}>
                        <TouchableOpacity
                            style={styles.botaoCancelar}
                            onPress={() => setNotaSelecionada(null)}
                        >
                            <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.botaoSalvar} onPress={salvarNotaAtual}>
                            <Text style={styles.botaoSalvarTexto}>Salvar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Tela de lista de notas
    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity
                onLongPress={sairDoDisfarce}
                delayLongPress={TEMPO_TOQUE_LONGO_MS}
                activeOpacity={1}
            >
                <Text style={styles.titulo}>Minhas Notas</Text>
            </TouchableOpacity>

            {notas.length === 0 ? (
                <View style={styles.vazio}>
                    <Text style={styles.vazioTexto}>Nenhuma nota ainda</Text>
                </View>
            ) : (
                <FlatList
                    data={notas}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.lista}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.notaCard}
                            onPress={() => setNotaSelecionada(item)}
                            onLongPress={() => apagarNota(item)}
                        >
                            <Text style={styles.notaTitulo}>
                                {item.titulo || 'Sem título'}
                            </Text>
                            <Text style={styles.notaData}>{item.data}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            <TouchableOpacity style={styles.botaoNova} onPress={criarNovaNota}>
                <Text style={styles.botaoNovaTexto}>+</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9E6',
        padding: spacing.md,
    },
    flex: { flex: 1 },
    titulo: {
        fontSize: 22,
        fontWeight: '600',
        color: '#3A3A3A',
        marginBottom: spacing.md,
    },
    lista: { gap: spacing.sm },
    vazio: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    vazioTexto: { color: '#999', fontSize: 16 },
    notaCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: radius.sm,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: '#EEE',
    },
    notaTitulo: { fontSize: 16, color: '#3A3A3A', fontWeight: '500' },
    notaData: { fontSize: 12, color: '#999', marginTop: 4 },
    botaoNova: {
        position: 'absolute',
        right: spacing.md,
        bottom: spacing.md,
        backgroundColor: '#3A3A3A',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
    },
    botaoNovaTexto: { color: '#FFF', fontSize: 28, lineHeight: 30 },
    inputTitulo: {
        fontSize: 20,
        fontWeight: '600',
        color: '#3A3A3A',
        marginBottom: spacing.sm,
    },
    inputConteudo: {
        flex: 1,
        fontSize: 16,
        color: '#3A3A3A',
        textAlignVertical: 'top',
    },
    linhaBotoes: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: spacing.sm,
        marginTop: spacing.md,
        paddingBottom: spacing.md,
    },
    botaoCancelar: { padding: spacing.sm },
    botaoCancelarTexto: { color: '#999' },
    botaoSalvar: {
        backgroundColor: '#3A3A3A',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: radius.sm,
    },
    botaoSalvarTexto: { color: '#FFF', fontWeight: '600' },
});