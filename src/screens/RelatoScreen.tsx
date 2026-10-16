// src/screens/RelatoScreen.tsx
// Relato de ocorrência: a usuária descreve o fato, tira fotos com a câmera
// do próprio app (não vão para a galeria) e gera um PDF guardado na pasta interna.
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, Modal, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Print from 'expo-print';
import TelaFormulario from '../components/TelaFormulario';
import Campo from '../components/Campo';
import BotaoPrimario from '../components/BotaoPrimario';
import {
    guardarRegistro,
    guardarRegistroBase64,
    compartilharRegistros,
    lerEmBase64,
    listarRegistros,
    tipoDoRegistro,
    descreverRegistro,
} from '../services/registrosService';
import { colors, spacing, radius, typography } from '../theme/colors';

const escapar = (texto: string) =>
    texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');

async function montarHtml(quando: string, onde: string, descricao: string, fotos: string[], audios: string[]) {
    const imagens = await Promise.all(
        fotos.map(async (uri) => `<img src="data:image/jpeg;base64,${await lerEmBase64(uri)}">`)
    );
    return `<html><head><meta charset="utf-8"><style>
        body { font-family: sans-serif; padding: 24px; color: #2e2033; }
        h1 { font-size: 20px; } h2 { font-size: 15px; margin: 18px 0 4px; }
        p { font-size: 13px; line-height: 1.5; margin: 0; }
        img { width: 100%; margin-top: 12px; page-break-inside: avoid; }
        small { color: #6e5c76; }
    </style></head><body>
        <h1>Relato de ocorrência</h1>
        <small>Gerado pelo app Ampara em ${new Date().toLocaleString('pt-BR')}</small>
        <h2>Data e hora do fato</h2><p>${escapar(quando)}</p>
        <h2>Local</h2><p>${escapar(onde) || 'Não informado'}</p>
        <h2>O que aconteceu</h2><p>${escapar(descricao)}</p>
        ${audios.length ? `<h2>Áudios anexos (${audios.length})</h2>
            <p>${audios.map(descreverRegistro).join('<br>')}</p>
            <small>Os arquivos de áudio são enviados junto com este relato.</small>` : ''}
        ${imagens.length ? `<h2>Fotos (${imagens.length})</h2>${imagens.join('')}` : ''}
    </body></html>`;
}

export default function RelatoScreen({ navigation }: any) {
    const [quando, setQuando] = useState(new Date().toLocaleString('pt-BR').slice(0, 17));
    const [onde, setOnde] = useState('');
    const [descricao, setDescricao] = useState('');
    const [fotos, setFotos] = useState<string[]>([]);
    const [audios, setAudios] = useState<string[]>([]); // áudios do SOS disponíveis
    const [anexos, setAnexos] = useState<string[]>([]); // áudios marcados para este relato
    const [cameraAberta, setCameraAberta] = useState(false);
    const [lado, setLado] = useState<CameraType>('back');
    const [gerando, setGerando] = useState(false);
    const [permissao, pedirPermissao] = useCameraPermissions();
    const camera = useRef<CameraView>(null);

    useEffect(() => {
        listarRegistros().then((lista) => setAudios(lista.filter((uri) => tipoDoRegistro(uri) === 'audio')));
    }, []);

    function alternarAnexo(uri: string) {
        setAnexos((atuais) => (atuais.includes(uri) ? atuais.filter((x) => x !== uri) : [...atuais, uri]));
    }

    // Envia o PDF e os áudios marcados juntos, para a mesma pessoa
    async function enviar(pdf: string) {
        try {
            await compartilharRegistros([pdf, ...anexos]);
        } catch (erro) {
            console.log('Erro ao enviar:', erro);
            Alert.alert('Envio', 'Não foi possível enviar agora. O relato continua em Meus registros.');
        }
        navigation.goBack();
    }

    async function abrirCamera() {
        if (permissao?.granted || (await pedirPermissao()).granted) setCameraAberta(true);
        else Alert.alert('Câmera', 'Permita o uso da câmera nas configurações do celular.');
    }

    async function tirarFoto() {
        const foto = await camera.current?.takePictureAsync({ quality: 0.5, shutterSound: false });
        if (foto) {
            const uri = await guardarRegistro(foto.uri, 'foto', 'jpg');
            setFotos((atuais) => [...atuais, uri]);
        }
        setCameraAberta(false);
    }

    async function gerarPdf() {
        if (!descricao.trim()) {
            Alert.alert('Relato', 'Descreva o que aconteceu antes de gerar o PDF.');
            return;
        }
        setGerando(true);
        try {
            // O PDF volta em base64 e é gravado direto na pasta interna
            const { base64 } = await Print.printToFileAsync({
                html: await montarHtml(quando, onde, descricao, fotos, anexos),
                base64: true,
            });
            const pdf = await guardarRegistroBase64(base64!, 'relato', 'pdf');
            Alert.alert('Relato salvo', 'O PDF está em Meus registros.', [
                { text: 'OK', onPress: () => navigation.goBack() },
                { text: 'Enviar agora', onPress: () => enviar(pdf) },
            ]);
        } catch (erro) {
            console.log('Erro ao gerar PDF:', erro);
            Alert.alert('Erro', `Não foi possível gerar o PDF.\n\n${String(erro)}`);
        } finally {
            setGerando(false);
        }
    }

    return (
        <TelaFormulario emCartao>
            <Campo label="Data e hora do fato" value={quando} onChangeText={setQuando} />
            <Campo label="Local" value={onde} onChangeText={setOnde} placeholder="Endereço ou referência" />
            <Campo
                label="O que aconteceu"
                value={descricao}
                onChangeText={setDescricao}
                multiline
                style={styles.descricao}
                ajuda="Inclua o que for lembrado: quem, o que foi dito ou feito, testemunhas."
            />

            <Text style={typography.label}>Fotos ({fotos.length})</Text>
            <View style={styles.fotos}>
                {fotos.map((uri) => (
                    <TouchableOpacity
                        key={uri}
                        onPress={() => setFotos((atuais) => atuais.filter((x) => x !== uri))}
                        accessibilityLabel="Remover foto do relato"
                    >
                        <Image source={{ uri }} style={styles.miniatura} />
                    </TouchableOpacity>
                ))}
                <TouchableOpacity style={[styles.miniatura, styles.adicionar]} onPress={abrirCamera} accessibilityLabel="Tirar foto">
                    <Ionicons name="camera" size={28} color={colors.primary} />
                </TouchableOpacity>
            </View>
            <Text style={typography.helper}>Toque numa foto para tirá-la do relato. Ela continua em Meus registros.</Text>

            <Text style={[typography.label, styles.secao]}>Áudios do SOS ({anexos.length} marcados)</Text>
            {audios.length === 0 ? (
                <Text style={typography.helper}>Nenhum áudio gravado ainda.</Text>
            ) : (
                audios.map((uri) => (
                    <TouchableOpacity
                        key={uri}
                        style={styles.audio}
                        onPress={() => alternarAnexo(uri)}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: anexos.includes(uri) }}
                    >
                        <Ionicons
                            name={anexos.includes(uri) ? 'checkbox' : 'square-outline'}
                            size={22}
                            color={colors.primary}
                        />
                        <Text style={typography.input}>{descreverRegistro(uri)}</Text>
                    </TouchableOpacity>
                ))
            )}

            <BotaoPrimario titulo="Gerar PDF" onPress={gerarPdf} carregando={gerando} style={{ marginTop: spacing.lg }} />

            <Modal visible={cameraAberta} animationType="slide" onRequestClose={() => setCameraAberta(false)}>
                <CameraView ref={camera} style={{ flex: 1 }} facing={lado} />
                <View style={styles.barraCamera}>
                    <TouchableOpacity onPress={() => setCameraAberta(false)} accessibilityLabel="Fechar câmera">
                        <Ionicons name="close" size={32} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.disparador} onPress={tirarFoto} accessibilityLabel="Fotografar" />
                    <TouchableOpacity
                        onPress={() => setLado((atual) => (atual === 'back' ? 'front' : 'back'))}
                        accessibilityLabel="Virar a câmera"
                    >
                        <Ionicons name="camera-reverse" size={32} color={colors.white} />
                    </TouchableOpacity>
                </View>
            </Modal>
        </TelaFormulario>
    );
}

const styles = StyleSheet.create({
    descricao: { minHeight: 140, textAlignVertical: 'top' },
    fotos: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginVertical: spacing.sm },
    miniatura: { width: 72, height: 72, borderRadius: radius.sm },
    secao: { marginTop: spacing.lg },
    audio: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
    adicionar: {
        backgroundColor: colors.primarySoft,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    barraCamera: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.black,
    },
    disparador: {
        width: 72,
        height: 72,
        borderRadius: radius.pill,
        borderWidth: 5,
        borderColor: colors.white,
        backgroundColor: colors.primary,
    },
});