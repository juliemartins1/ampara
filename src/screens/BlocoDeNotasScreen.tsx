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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
        carregarNotas();
    }, []);

    const carregarNotas = async () => {
        const salvo = await AsyncStorage.getItem(NOTAS_STORAGE_KEY);
        setNotas(salvo ? JSON.parse(salvo) : []);
    };

    const salvarNotas = async (novaLista: Nota[]) => {
        setNotas(novaLista);
        await AsyncStorage.setItem(NOTAS_STORAGE_KEY, JSON.stringify(novaLista));
    };

    // TEMPORÁRIO: enquanto o fluxo de login não está pronto, o gesto secreto
    // leva para o cadastro de usuária em vez da Home. Reverter para 'Home'
    // quando o fluxo de login/autenticação estiver concluído.
    const sairDoDisfarce = () => {
        navigation.replace('CadastroUsuaria');
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
        const jaExiste = notas.find((n) => n.id === notaSelecionada.id);
        const novaLista = jaExiste
            ? notas.map((n) => (n.id === notaSelecionada.id ? notaSelecionada : n))
            : [notaSelecionada, ...notas];
        salvarNotas(novaLista);
        setNotaSelecionada(null);
    };

    const apagarNota = (id: string) => {
        salvarNotas(notas.filter((n) => n.id !== id));
    };

    // Tela de edição de uma nota individual
    if (notaSelecionada) {
        return (
            <KeyboardAvoidingView
                style={styles.container}
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
        );
    }

    // Tela de lista de notas
    return (
        <View style={styles.container}>
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
                            onLongPress={() => apagarNota(item.id)}
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF9E6',
        padding: spacing.md,
        paddingTop: 32,
    },
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