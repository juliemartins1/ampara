import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Linking,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';

import {
    servicosApoio,
    CategoriaServico,
    ServicoApoio,
} from '../data/servicosApoio';

import {
    colors,
    spacing,
    typography,
    radius,
} from '../theme/colors';

type Coordenada = {
    latitude: number;
    longitude: number;
};

type Rota = {
    coordinates: Coordenada[];
    distanceKm: number;
    durationMin: number;
};

const corPorCategoria: Record<CategoriaServico, string> = {
    policia: '#1E88E5',
    delegacia_mulher: '#D81B60',
    hospital: '#43A047',
    upa: '#FB8C00',
};

const labelPorCategoria: Record<CategoriaServico, string> = {
    policia: 'Delegacia',
    delegacia_mulher: 'Delegacia da Mulher',
    hospital: 'Hospital',
    upa: 'UPA',
};

/**
 * Calcula uma rota usando o OSRM.
 *
 * O OSRM recebe:
 * longitude,latitude;longitude,latitude
 *
 * e devolve a geometria da rota.
 */
async function calcularRota(
    origem: Coordenada,
    destino: Coordenada
): Promise<Rota> {

    const url =
        'https://router.project-osrm.org/route/v1/driving/' +
        `${origem.longitude},${origem.latitude};` +
        `${destino.longitude},${destino.latitude}` +
        '?overview=full&geometries=geojson';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(
            `Erro ao consultar o OSRM: ${response.status}`
        );
    }

    const data = await response.json();

    if (
        data.code !== 'Ok' ||
        !data.routes ||
        data.routes.length === 0
    ) {
        throw new Error('Nenhuma rota encontrada.');
    }

    const rota = data.routes[0];

    const coordinates: Coordenada[] =
        rota.geometry.coordinates.map(
            ([longitude, latitude]: [number, number]) => ({
                latitude,
                longitude,
            })
        );

    return {
        coordinates,
        distanceKm: rota.distance / 1000,
        durationMin: rota.duration / 60,
    };
}

/**
 * Monta a página HTML que será exibida dentro do WebView.
 *
 * O mapa é Leaflet.
 * Os mapas são OpenStreetMap.
 */
function gerarHTMLMapa(
    localizacao: Coordenada | null,
    rota: Rota | null
): string {

    const servicosJSON =
        JSON.stringify(servicosApoio);

    const localizacaoJSON =
        JSON.stringify(localizacao);

    const rotaJSON =
        JSON.stringify(rota);

    const coresJSON =
        JSON.stringify(corPorCategoria);

    const labelsJSON =
        JSON.stringify(labelPorCategoria);

    return `
<!DOCTYPE html>

<html>

<head>

<meta
    name="viewport"
    content="width=device-width,
    initial-scale=1.0,
    maximum-scale=1.0,
    user-scalable=no"
/>

<link
    rel="stylesheet"
    href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<style>

html,
body,
#map {

    width: 100%;
    height: 100%;

    margin: 0;
    padding: 0;
}

body {
    overflow: hidden;
}

.popup-titulo {

    font-size: 16px;
    font-weight: bold;

    margin-bottom: 5px;
}

.popup-categoria {

    font-size: 13px;

    margin-bottom: 5px;
}

.popup-endereco {

    font-size: 12px;

    margin-bottom: 10px;
}

.botao-rota {

    background: #8810b7;

    color: white;

    border: none;

    padding: 9px 12px;

    border-radius: 7px;

    font-size: 13px;

    font-weight: bold;
}

</style>

</head>

<body>

<div id="map"></div>

<script
    src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<script>

const servicos = ${servicosJSON};

const localizacaoAtual = ${localizacaoJSON};

const rotaAtual = ${rotaJSON};

const cores = ${coresJSON};

const labels = ${labelsJSON};


/*
 * Cria o mapa.
 *
 * A posição inicial é Rio Grande/RS.
 */
const mapa = L.map('map').setView(
    [-32.10, -52.12],
    12
);


/*
 * OpenStreetMap
 */
L.tileLayer(
    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
        maxZoom: 19,

        attribution:
            '&copy; OpenStreetMap contributors'
    }
).addTo(mapa);


/*
 * Envia mensagens do JavaScript
 * para o React Native.
 */
function enviarParaReactNative(dados) {

    window.ReactNativeWebView.postMessage(
        JSON.stringify(dados)
    );
}


/*
 * Adiciona os serviços no mapa.
 */
servicos.forEach(function(servico) {

    const cor =
        cores[servico.categoria] ||
        '#8810b7';


    /*
     * Cria um marcador circular.
     */
    const icone =
        L.divIcon({

            className: '',

            html:
                '<div style="' +

                'background:' +
                cor +
                ';' +

                'width:22px;' +

                'height:22px;' +

                'border-radius:50%;' +

                'border:3px solid white;' +

                'box-shadow:0 1px 5px #555;' +

                '"></div>',

            iconSize: [22, 22],

            iconAnchor: [11, 11]
        });


    const marcador =
        L.marker(
            [
                servico.latitude,
                servico.longitude
            ],
            {
                icon: icone
            }
        );


    /*
     * Conteúdo que aparece ao tocar
     * no marcador.
     */
    const popup =

        '<div>' +

        '<div class="popup-titulo">' +
        servico.nome +
        '</div>' +

        '<div class="popup-categoria">' +
        labels[servico.categoria] +
        '</div>' +

        '<div class="popup-endereco">' +
        servico.endereco +
        '</div>' +

        '<button ' +

        'class="botao-rota" ' +

        'onclick="pedirRota(\\'' +
        servico.id +
        '\\')">' +

        'Como chegar' +

        '</button>' +

        '</div>';


    marcador.bindPopup(popup);

    marcador.addTo(mapa);
});


/*
 * Quando a usuária toca em
 * "Como chegar".
 */
function pedirRota(id) {

    enviarParaReactNative({

        tipo: 'ROTA',

        servicoId: id
    });
}


/*
 * Mostra a localização da usuária.
 */
if (localizacaoAtual) {

    const iconeUsuario =
        L.divIcon({

            className: '',

            html:
                '<div style="' +

                'background:#8810b7;' +

                'width:18px;' +

                'height:18px;' +

                'border-radius:50%;' +

                'border:4px solid white;' +

                'box-shadow:0 1px 5px #555;' +

                '"></div>',

            iconSize: [26, 26],

            iconAnchor: [13, 13]
        });


    L.marker(
        [
            localizacaoAtual.latitude,
            localizacaoAtual.longitude
        ],
        {
            icon: iconeUsuario
        }
    )
        .addTo(mapa)
        .bindPopup('Sua localização');


    /*
     * Centraliza o mapa na usuária.
     */
    mapa.setView(
        [
            localizacaoAtual.latitude,
            localizacaoAtual.longitude
        ],
        14
    );
}


/*
 * Desenha a rota recebida do OSRM.
 */
if (
    rotaAtual &&
    rotaAtual.coordinates
) {

    const pontos =
        rotaAtual.coordinates.map(
            function(ponto) {

                return [
                    ponto.latitude,
                    ponto.longitude
                ];
            }
        );


    const linha =
        L.polyline(
            pontos,
            {
                weight: 5
            }
        ).addTo(mapa);


    /*
     * Ajusta o zoom para mostrar
     * toda a rota.
     */
    mapa.fitBounds(
        linha.getBounds(),
        {
            padding: [40, 40]
        }
    );
}

</script>

</body>

</html>
`;
}


export default function MapaServicosScreen() {

    const [localizacaoAtual, setLocalizacaoAtual] =
        useState<Coordenada | null>(null);


    const [servicoSelecionado, setServicoSelecionado] =
        useState<ServicoApoio | null>(null);


    const [rota, setRota] =
        useState<Rota | null>(null);


    const [calculandoRota, setCalculandoRota] =
        useState(false);


    /*
     * Obtém a localização da usuária
     * quando a tela é aberta.
     */
    useEffect(() => {

        obterLocalizacao();

    }, []);


    async function obterLocalizacao() {

        try {

            const {
                status
            } =
                await Location.requestForegroundPermissionsAsync();


            if (
                status !==
                Location.PermissionStatus.GRANTED
            ) {

                Alert.alert(
                    'Localização',
                    'Permita o acesso à localização para mostrar sua posição no mapa.'
                );

                return;
            }


            const posicao =
                await Location.getCurrentPositionAsync({
                    accuracy:
                        Location.Accuracy.Balanced,
                });


            setLocalizacaoAtual({

                latitude:
                    posicao.coords.latitude,

                longitude:
                    posicao.coords.longitude,
            });

        } catch (erro) {

            console.warn(
                'Não foi possível obter a localização:',
                erro
            );

        }
    }


    /**
     * Solicita ao OSRM a rota entre
     * a localização atual e o serviço.
     */
    async function tracarRota(
        servico: ServicoApoio
    ) {

        if (!localizacaoAtual) {

            Alert.alert(
                'Localização necessária',
                'Não foi possível obter sua localização. Verifique se a localização do celular está ativada.'
            );

            return;
        }


        try {

            setCalculandoRota(true);

            setServicoSelecionado(servico);

            setRota(null);


            const novaRota =
                await calcularRota(
                    localizacaoAtual,
                    {
                        latitude:
                            servico.latitude,

                        longitude:
                            servico.longitude,
                    }
                );


            setRota(novaRota);

        } catch (erro) {

            console.error(
                'Erro ao calcular rota:',
                erro
            );


            Alert.alert(
                'Erro',
                'Não foi possível calcular a rota. Verifique sua conexão com a internet e tente novamente.'
            );

        } finally {

            setCalculandoRota(false);
        }
    }


    /**
     * Recebe mensagens enviadas
     * pelo Leaflet.
     */
    function processarMensagem(
        event: WebViewMessageEvent
    ) {

        try {

            const mensagem =
                JSON.parse(
                    event.nativeEvent.data
                );


            if (
                mensagem.tipo === 'ROTA'
            ) {

                const servico =
                    servicosApoio.find(
                        item =>
                            item.id ===
                            mensagem.servicoId
                    );


                if (servico) {

                    tracarRota(servico);
                }
            }

        } catch (erro) {

            console.warn(
                'Mensagem inválida recebida do mapa:',
                erro
            );
        }
    }


    /**
     * Abre o discador do celular.
     */
    function ligarPara(
        telefone: string
    ) {

        Linking.openURL(
            `tel:${telefone}`
        ).catch(() => {

            Alert.alert(
                'Erro',
                'Não foi possível abrir o discador.'
            );

        });
    }


    /**
     * Remove a rota da tela.
     */
    function limparRota() {

        setRota(null);

        setServicoSelecionado(null);
    }


    /*
     * Sempre que a localização ou a rota
     * mudar, o HTML do mapa é atualizado.
     */
    const htmlMapa =
        useMemo(
            () =>
                gerarHTMLMapa(
                    localizacaoAtual,
                    rota
                ),

            [
                localizacaoAtual,
                rota
            ]
        );


    return (

        <View style={styles.container}>

            {/* MAPA */}

            <WebView
                source={{
                    html: htmlMapa
                }}

                style={styles.map}

                originWhitelist={['*']}

                javaScriptEnabled={true}

                domStorageEnabled={true}

                onMessage={
                    processarMensagem
                }

                startInLoadingState={true}

                renderLoading={() => (

                    <View
                        style={
                            styles.loading
                        }
                    >

                        <ActivityIndicator
                            size="large"
                        />

                        <Text
                            style={
                                styles.loadingTexto
                            }
                        >
                            Carregando mapa...
                        </Text>

                    </View>

                )}
            />


            {/* CABEÇALHO */}

            <View style={styles.header}>

                <Text
                    style={
                        styles.headerTitulo
                    }
                >
                    Serviços próximos
                </Text>


                <Text
                    style={
                        styles.headerSubtitulo
                    }
                >
                    Encontre delegacias, hospitais e UPAs
                </Text>

            </View>


            {/* CARD DA ROTA */}

            {servicoSelecionado && (

                <View
                    style={
                        styles.rotaCard
                    }
                >

                    <View
                        style={
                            styles.rotaConteudo
                        }
                    >

                        <Text
                            style={
                                styles.rotaTitulo
                            }
                        >
                            Destino
                        </Text>


                        <Text
                            style={
                                styles.rotaNome
                            }
                            numberOfLines={1}
                        >
                            {servicoSelecionado.nome}
                        </Text>


                        {calculandoRota ? (

                            <View
                                style={
                                    styles.rotaLoading
                                }
                            >

                                <ActivityIndicator
                                    size="small"
                                />

                                <Text
                                    style={
                                        styles.rotaLoadingTexto
                                    }
                                >
                                    Calculando rota...
                                </Text>

                            </View>

                        ) : rota ? (

                            <Text
                                style={
                                    styles.rotaResumo
                                }
                            >
                                {rota.distanceKm.toFixed(1)}
                                {' km • aproximadamente '}
                                {Math.max(
                                    1,
                                    Math.round(
                                        rota.durationMin
                                    )
                                )}
                                {' min'}
                            </Text>

                        ) : (

                            <Text
                                style={
                                    styles.rotaEndereco
                                }
                                numberOfLines={2}
                            >
                                {servicoSelecionado.endereco}
                            </Text>

                        )}


                        {/* BOTÃO LIGAR */}

                        {!calculandoRota && (

                            <TouchableOpacity
                                style={
                                    styles.ligarBotao
                                }
                                onPress={() =>
                                    ligarPara(
                                        servicoSelecionado.telefone
                                    )
                                }
                            >

                                <Text
                                    style={
                                        styles.ligarTexto
                                    }
                                >
                                    Ligar
                                </Text>

                            </TouchableOpacity>

                        )}

                    </View>


                    {/* FECHAR */}

                    <TouchableOpacity
                        style={
                            styles.fecharRota
                        }
                        onPress={
                            limparRota
                        }
                    >

                        <Text
                            style={
                                styles.fecharRotaTexto
                            }
                        >
                            ×
                        </Text>

                    </TouchableOpacity>

                </View>

            )}

        </View>
    );
}


const styles = StyleSheet.create({

    container: {

        flex: 1,
    },


    map: {

        flex: 1,
    },


    loading: {

        flex: 1,

        alignItems: 'center',

        justifyContent: 'center',

        backgroundColor:
            colors.background,
    },


    loadingTexto: {

        marginTop: spacing.sm,

        color:
            colors.textSecondary,
    },


    header: {

        position: 'absolute',

        top: 16,

        left: 16,

        right: 16,

        backgroundColor:
            colors.surface,

        borderRadius:
            radius.lg,

        paddingHorizontal:
            spacing.md,

        paddingVertical: 14,

        elevation: 5,

        shadowOpacity: 0.15,

        shadowRadius: 8,

        shadowOffset: {
            width: 0,
            height: 3,
        },
    },


    headerTitulo: {

        ...typography.title,

        fontSize: 18,
    },


    headerSubtitulo: {

        ...typography.subtitle,

        fontSize: 13,

        marginTop: 2,
    },


    rotaCard: {

        position: 'absolute',

        left: 16,

        right: 16,

        bottom: 24,

        backgroundColor:
            colors.surface,

        borderRadius:
            radius.lg,

        padding: spacing.md,

        paddingRight: 48,

        flexDirection: 'row',

        elevation: 7,

        shadowOpacity: 0.2,

        shadowRadius: 8,

        shadowOffset: {
            width: 0,
            height: 3,
        },
    },


    rotaConteudo: {

        flex: 1,
    },


    rotaTitulo: {

        fontSize: 12,

        color:
            colors.textSecondary,
    },


    rotaNome: {

        fontSize: 16,

        fontWeight: '700',

        color:
            colors.textPrimary,

        marginTop: 2,
    },


    rotaResumo: {

        fontSize: 13,

        color:
            colors.primaryDark,

        fontWeight: '600',

        marginTop: 5,
    },


    rotaEndereco: {

        fontSize: 12,

        color:
            colors.textSecondary,

        marginTop: 5,
    },


    rotaLoading: {

        flexDirection: 'row',

        alignItems: 'center',

        marginTop: 7,
    },


    rotaLoadingTexto: {

        fontSize: 12,

        color:
            colors.textSecondary,

        marginLeft: 8,
    },


    ligarBotao: {

        marginTop: 8,
    },


    ligarTexto: {

        color:
            colors.primary,

        fontWeight: '700',
    },


    fecharRota: {

        position: 'absolute',

        top: 10,

        right: 10,

        width: 32,

        height: 32,

        alignItems: 'center',

        justifyContent: 'center',
    },


    fecharRotaTexto: {

        fontSize: 28,

        color:
            colors.textSecondary,
    },

});