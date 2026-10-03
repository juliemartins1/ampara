import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { colors, spacing, radius, typography } from '../theme/colors';
import { auth, db } from '../services/firebaseConfig'; // ajuste se os nomes exportados forem outros

type Categoria = 'relato' | 'apoio' | 'dica';

const CATEGORIAS: { valor: Categoria; rotulo: string }[] = [
    { valor: 'relato', rotulo: 'Relato' },
    { valor: 'apoio', rotulo: 'Apoio' },
    { valor: 'dica', rotulo: 'Dica' },
];

const LIMITE = 1000;
// Detecta algo parecido com telefone (com ou sem DDD) para proteger a identidade
const REGEX_TELEFONE = /\(?\d{2}\)?\s?9?\d{4}[-\s]?\d{4}/;

export default function NovaPublicacaoScreen() {
    const navigation = useNavigation<any>();
    const [texto, setTexto] = useState('');
    const [categoria, setCategoria] = useState<Categoria | null>(null);
    const [enviando, setEnviando] = useState(false);

    async function publicar() {
        const usuaria = auth.currentUser;
        const conteudo = texto.trim();

        if (!usuaria) {
            Alert.alert('Sessão expirada', 'Entre novamente para publicar.');
            return;
        }
        if (!categoria) {
            Alert.alert('Escolha uma categoria', 'Selecione Relato, Apoio ou Dica.');
            return;
        }
        if (conteudo.length === 0) {
            Alert.alert('Texto vazio', 'Escreva algo antes de publicar.');
            return;
        }
        if (REGEX_TELEFONE.test(conteudo)) {
            Alert.alert('Proteja sua identidade', 'Não inclua números de telefone na publicação.');
            return;
        }

        setEnviando(true);
        try {
            await addDoc(collection(db, 'publicacoes'), {
                texto: conteudo,
                categoria,
                status: 'pendente',
                autoraUid: usuaria.uid,
                criadaEm: serverTimestamp(),
                denuncias: 0,
            });
            Alert.alert('Publicação enviada', 'Ela será revisada antes de aparecer no mural.');
            navigation.goBack();
        } catch (erro) {
            console.error(erro);
            Alert.alert('Erro', 'Não foi possível enviar. Tente novamente.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.aviso}>
                Sua publicação aparece de forma anônima. Evite nomes, endereços e telefones.
            </Text>

            <View style={styles.categorias}>
                {CATEGORIAS.map(c => (
                    <TouchableOpacity
                        key={c.valor}
                        style={[styles.chip, categoria === c.valor && styles.chipAtivo]}
                        onPress={() => setCategoria(c.valor)}
                    >
                        <Text style={[styles.textoChip, categoria === c.valor && styles.textoChipAtivo]}>{c.rotulo}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TextInput
                style={styles.campo}
                multiline
                maxLength={LIMITE}
                placeholder="Escreva aqui..."
                value={texto}
                onChangeText={setTexto}
                textAlignVertical="top"
            />
            <Text style={styles.contador}>{texto.length}/{LIMITE}</Text>

            <TouchableOpacity style={styles.botao} onPress={publicar} disabled={enviando}>
                {enviando ? <ActivityIndicator color="#FFF" /> : <Text style={styles.textoBotao}>Enviar para revisão</Text>}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: spacing.md, backgroundColor: colors.background },
    aviso: {
        backgroundColor: colors.primarySoft,
        padding: 12,
        borderRadius: radius.sm,
        color: colors.primaryDark,
        marginBottom: spacing.md,
        fontSize: 13,
    },
    categorias: { flexDirection: 'row', gap: spacing.sm, marginBottom: 12 },
    chip: {
        borderWidth: 1,
        borderColor: colors.primary,
        borderRadius: radius.pill,
        paddingVertical: 6,
        paddingHorizontal: 14,
    },
    chipAtivo: { backgroundColor: colors.primary },
    textoChip: { color: colors.primary, fontWeight: '600' },
    textoChipAtivo: { color: colors.white },
    campo: {
        ...typography.input,
        minHeight: 180,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radius.md,
        padding: 12,
    },
    contador: { ...typography.helper, alignSelf: 'flex-end', marginTop: spacing.xs },
    botao: {
        backgroundColor: colors.primary,
        borderRadius: radius.pill,
        paddingVertical: 14,
        marginTop: spacing.md,
        alignItems: 'center',
    },
    textoBotao: { ...typography.button },
});