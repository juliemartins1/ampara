export type CategoriaServico = 'policia' | 'delegacia_mulher' | 'hospital' | 'upa';

export interface ServicoApoio {
    id: string;
    nome: string;
    categoria: CategoriaServico;
    endereco: string;
    telefone: string;
    latitude: number;
    longitude: number;
}

export const servicosApoio: ServicoApoio[] = [
    // Polícia
    {
        id: 'delegacia-cassino',
        nome: 'Delegacia de Polícia - Cassino',
        categoria: 'policia',
        endereco: 'R. Júlio de Castilhos, 1 - Cassino, Rio Grande - RS',
        telefone: '+555332361577',
        latitude: -32.1811577,
        longitude: -52.1614275,
    },
    {
        id: 'dppa-centro',
        nome: 'DPPA - Delegacia de Pronto Atendimento',
        categoria: 'policia',
        endereco: 'R. Benjamin Constant - Centro, Rio Grande - RS',
        telefone: '+555332314107',
        latitude: -32.0337987,
        longitude: -52.0934140,
    },
    {
        id: 'central-policia-civil',
        nome: 'Central de Polícia Civil',
        categoria: 'policia',
        endereco: 'Av. Silva Paes, 249 - Centro, Rio Grande - RS',
        telefone: '+555532374892',
        latitude: -32.0338574,
        longitude: -52.0931671,
    },

    // Delegacia da Mulher
    {
        id: 'deam-rio-grande',
        nome: 'Delegacia Especializada da Mulher (DEAM)',
        categoria: 'delegacia_mulher',
        endereco: 'R. Mal. Andréia, 44 - Centro, Rio Grande - RS',
        telefone: '+555332362016',
        latitude: -32.0316495,
        longitude: -52.0891166,
    },

    // UPAs
    {
        id: 'upa-cassino',
        nome: 'UPA Cassino',
        categoria: 'upa',
        endereco: 'R. Arroio Grande, 171 - Cassino, Rio Grande - RS',
        telefone: '+555332361261',
        latitude: -32.1800285,
        longitude: -52.1565737,
    },
    {
        id: 'upa-juncao',
        nome: 'UPA Junção',
        categoria: 'upa',
        endereco: 'R. 6, 1090 - Vila Junção, Rio Grande - RS',
        telefone: '+555532321016',
        latitude: -32.0609025,
        longitude: -52.1489165,
    },

    // Hospitais
    {
        id: 'hospital-monporto',
        nome: 'Hospital Monporto',
        categoria: 'hospital',
        endereco: 'Av. Pres. Vargas, 503 - Vila Junção, Rio Grande - RS',
        telefone: '+555331999031',
        latitude: -32.0492504,
        longitude: -52.1135333,
    },
    {
        id: 'hospital-hu-furg',
        nome: 'Hospital Universitário Dr. Miguel Riet Corrêa Jr. (HU-FURG)',
        categoria: 'hospital',
        endereco: 'R. Visc. de Paranaguá, 102 - Centro, Rio Grande - RS',
        telefone: '+555532338800',
        latitude: -32.0293141,
        longitude: -52.1027444,
    },
    {
        id: 'santa-casa',
        nome: 'Santa Casa do Rio Grande',
        categoria: 'hospital',
        endereco: 'R. Gen. Osório, 625 - Centro, Rio Grande - RS',
        telefone: '+555532337100',
        latitude: -32.030259,
        longitude: -52.1021254,
    },
];

const regiaoInicial = {
    latitude: -32.10,
    longitude: -52.12,
    latitudeDelta: 0.28,
    longitudeDelta: 0.16,
};