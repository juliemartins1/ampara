export type CategoriaServico =
    | 'policia'
    | 'delegacia_mulher'
    | 'hospital'
    | 'upa'
    | 'CRAS'
    | 'bombeiros';

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
        nome: 'Delegacia de Polícia - Cassino (3ª DP / DPCA)',
        categoria: 'policia',
        endereco: 'R. Vereador Athaydes Rodrigues, 662 - Cassino, Rio Grande - RS',
        telefone: '+555332361544',
        latitude: -32.18387244881838,
        longitude: -52.171774191579956,
    },
    {
        id: 'dppa-centro',
        nome: 'DPPA - Delegacia de Pronto Atendimento (Plantão 24h)',
        categoria: 'policia',
        endereco: 'Av. Silva Paes, 249 (Esquina R. Benjamin Constant) - Centro, Rio Grande - RS',
        telefone: '+555332314107',
        latitude: -32.0338574,
        longitude: -52.0931671,
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
    {
        id: 'brigada-militar-cassino',
        nome: 'Brigada Militar - Cassino',
        categoria: 'policia',
        endereco: 'R. Júlio de Castilhos, 1 - Cassino, Rio Grande - RS',
        telefone: '+555332361190',
        latitude: -32.1811577,
        longitude: -52.1614275,
    },

    // Delegacia da Mulher
    {
        id: 'deam-rio-grande',
        nome: 'Delegacia Especializada de Atendimento à Mulher (DEAM) / DPPGV',
        categoria: 'delegacia_mulher',
        endereco: 'Av. Silva Paes, 249, 3º andar - Centro, Rio Grande - RS',
        telefone: '+555332374917',
        latitude: -32.0338574,
        longitude: -52.0931671,
    },
    {
        id: 'cram-rio-grande',
        nome: 'CRAM - Centro de Referência de Atendimento à Mulher',
        categoria: 'delegacia_mulher',
        endereco: 'Av. Silva Paes, 191, 5º e 6º andares - Centro, Rio Grande - RS',
        telefone: '+555332374242',
        latitude: -32.033716260019865,
        longitude: -52.092885722196534,
    },
    {
        id: 'sala-lilas-rio-grande',
        nome: 'Sala Lilás Rio Grande (Hospital Santa Casa)',
        categoria: 'delegacia_mulher',
        endereco: 'R. Gen. Osório, 625 - Centro, Rio Grande - RS',
        telefone: '+555332332266',
        latitude: -32.030259,
        longitude: -52.1021254,
    },

    // CRAS
    {
        id: 'cras-cidade-de-agueda',
        nome: 'CRAS - Cidade de Águeda',
        categoria: 'CRAS',
        endereco: 'Av. E, Antônio Uslengue Dante Dapuzzo, 343 - Cidade de Águeda, Rio Grande - RS',
        telefone: '+555332321366',
        latitude: -32.083918,
        longitude: -52.181995,
    },
    {
        id: 'cras-hidraulica',
        nome: 'CRAS - Hidráulica (atende também Cassino e Querência)',
        categoria: 'CRAS',
        endereco: 'R. Altamir de Lacerda Nascimento, 904 - Hidráulica, Rio Grande - RS',
        telefone: '+555332314379',
        latitude: -32.050028502126125,
        longitude: -52.124337960898295,
    },
    {
        id: 'cras-lucia-nader',
        nome: 'CRAS - Dra. Lúcia Nader',
        categoria: 'CRAS',
        endereco: 'Rua Seis, s/n - Profilurb, Rio Grande - RS',
        telefone: '+555332304140',
        latitude: -32.065093519177466,
        longitude: -52.17336030693229,
        
    },
    {
        id: 'cras-zona-portuaria',
        nome: 'CRAS - Zona Portuária (atendendo temporariamente no Centro Integrado da Família)',
        categoria: 'CRAS',
        // Endereço original: Av. Dom Pedro II, 318 - Getúlio Vargas. Mudança temporária:
        endereco: 'Av. Silva Paes, 191 - Centro Integrado da Família, Centro, Rio Grande - RS',
        telefone: '+555332331370',
        latitude: -32.03375264101041,
        longitude: -52.09287499158915,
        
    },

    // Bombeiros
    {
        id: 'corpo-bombeiros-cassino',
        nome: 'Corpo de Bombeiros Militar - Cassino',
        categoria: 'bombeiros',
        endereco: 'Bairro Cassino, Rio Grande - RS',
        telefone: '+555332362371',
        latitude: -32.184320809028286,
        longitude: -52.166074918562565,
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
        telefone: '+555332338800',
        latitude: -32.0293141,
        longitude: -52.1027444,
    },
    {
        id: 'santa-casa',
        nome: 'Santa Casa do Rio Grande',
        categoria: 'hospital',
        endereco: 'R. Gen. Osório, 625 - Centro, Rio Grande - RS',
        telefone: '+555332337100',
        latitude: -32.030259,
        longitude: -52.1021254,
    },
];

export const regiaoInicial = {
    latitude: -32.10,
    longitude: -52.12,
    latitudeDelta: 0.28,
    longitudeDelta: 0.16,
};