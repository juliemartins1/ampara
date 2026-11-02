import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { collection, doc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { colors, spacing, radius, typography } from '../theme/colors';
import { auth, db } from '../services/firebaseConfig';
import Chips from '../components/Chips';
import { Categoria, CATEGORIAS, ROTULOS_CATEGORIA } from '../types/models';

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
            // A publicação não guarda quem escreveu. A autoria fica em
            // publicacoes/{id}/privado/autoria, que só as moderadoras leem.
            // As duas gravações vão juntas: ou ambas acontecem, ou nenhuma.
            const ref = doc(collection(db, 'publicacoes'));
            const batch = writeBatch(db);
            batch.set(ref, {
                texto: conteudo,
                categoria,
                status: 'pendente',
                criadaEm: serverTimestamp(),
                denuncias: 0,
            });
            batch.set(doc(db, 'publicacoes', ref.id, 'privado', 'autoria'), { uid: usuaria.uid });
            // Hora da publicação: as regras só aceitam uma a cada 5 minutos
            batch.update(doc(db, 'usuarias', usuaria.uid), { ultimaPublicacao: serverTimestamp() });
            await batch.commit();
            Alert.alert('Publicação enviada', 'Ela será revisada antes de aparecer no mural.');
            navigation.goBack();
        } catch (erro) {
            console.error(erro);
            Alert.alert('Erro', 'Não foi possível enviar. Se você publicou há pouco, aguarde 5 minutos e tente de novo.');
        } finally {
            setEnviando(false);
        }
    }

    return (
        <View style={styles.container}>
            <Text style={styles.aviso}>
                Sua publicação aparece de forma anônima. Evite nomes, endereços e telefones.
            </Text>

            <Chips
                opcoes={CATEGORIAS}
                selecionados={[categoria]}
                aoTocar={setCategoria}
                rotulo={(c) => ROTULOS_CATEGORIA[c]}
            />

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