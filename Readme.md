# Ampara

> Aplicativo móvel open-source de apoio a mulheres em situação de violência, com foco no município de Rio Grande/RS.

O **Ampara** reúne, em um único aplicativo, um botão de emergência que avisa pessoas de confiança com a localização, gravação de áudio e relato de ocorrência em PDF, acesso rápido aos canais oficiais (Ligue 180 e 190), conteúdo sobre a Lei Maria da Penha, mapa da rede de atendimento e um modo disfarçado para uso discreto quando o celular pode estar sendo vigiado.

Projeto desenvolvido como Trabalho de Conclusão de Curso do **Tecnólogo em Análise e Desenvolvimento de Sistemas** do **IFRS – Campus Rio Grande**.

---

## Funcionalidades

-  **Botão de emergência (SOS)**: segurado por 2 segundos, pega a localização (GPS ou rede, mesmo sem internet), abre o SMS para todos os contatos de confiança com o endereço aproximado e o link do mapa, e oferece envio por WhatsApp e Telegram
-  **Gravação de áudio no SOS**: começa sozinha quando a tela de emergência abre e continua com o SMS ou o WhatsApp aberto
-  **Relato de ocorrência em PDF**: data, local, descrição, fotos tiradas pela câmera do próprio app e áudios do SOS anexos
-  **Meus registros**: ver o relato e as fotos dentro do app, ouvir os áudios, enviar para quem pode ajudar ou apagar
-  **Contatos de confiança**: até 5 pessoas, com cópia no celular para o SOS funcionar sem internet
-  **Acesso rápido ao 180 e 190** direto da tela inicial
-  **Informações**: Lei Maria da Penha, tipos de violência e sinais de relacionamento abusivo (parte offline e artigos do Firestore)
-  **Mapa de serviços**: delegacias e rede de atendimento de Rio Grande/RS com OpenStreetMap, sem Google Maps
-  **Modo disfarçado**: o app abre como um bloco de notas funcional; a interface real abre por um gesto secreto
-  **Saída rápida**: um botão discreto, em todas as telas, volta na hora para o bloco de notas
-  **Comunidade**: publicações anônimas de relatos, apoio e dicas, com moderação prévia e denúncia
-  **Conta segura**: Firebase Auth e verificação obrigatória do e-mail por código de 6 dígitos

---

## Privacidade e segurança

- **Áudios, fotos e relatos** ficam só na pasta interna do app: não aparecem na galeria nem no gerenciador de arquivos e não vão para a nuvem.
- **Backup do Android desligado** (`allowBackup: false`), para os registros não serem copiados para o Google Drive.
- **O alerta SOS não é salvo** no Firestore: nenhuma localização da usuária fica no servidor.
- **Regras de segurança do Firestore**: cada usuária só lê e altera os próprios dados; o código de verificação é guardado apenas como hash SHA-256.
- **Ao sair da conta**, a cópia dos contatos e a última localização são apagadas do celular.
- **Arquivos só saem do celular** quando a usuária escolhe para quem enviar.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 57) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Backend | [Firebase](https://firebase.google.com/) (Authentication + Cloud Firestore) |
| Verificação de e-mail | [EmailJS](https://www.emailjs.com/) (código de 6 dígitos) |
| Navegação | [React Navigation](https://reactnavigation.org/) (Native Stack) |
| Localização e SMS | `expo-location`, `expo-sms` |
| Áudio, câmera e PDF | `expo-audio`, `expo-camera`, `expo-print` |
| Arquivos e envio | `expo-file-system`, `react-native-share` |
| Mapa | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) via `react-native-webview` |
| Armazenamento local | `@react-native-async-storage/async-storage` |
| Conteúdo | `react-native-markdown-display` |
| Build | [EAS Build](https://docs.expo.dev/build/introduction/) |

---

## Como executar

### Pré-requisitos

- [Node.js](https://nodejs.org/) (LTS)
- [Expo Go](https://expo.dev/go) no celular **ou** um emulador Android configurado
- Um projeto no [Firebase](https://console.firebase.google.com/) com Authentication (e-mail/senha) e Firestore habilitados

### Instalação

```bash
git clone https://github.com/juliemartins1/ampara.git
cd ampara
npm install
```

### Configuração do Firebase

Preencha as credenciais do seu projeto Firebase em:

```
src/services/firebaseConfig.shared.ts
```

A configuração é separada por plataforma (`firebaseConfig.native.ts` e `firebaseConfig.web.ts`) e resolvida automaticamente via `moduleSuffixes` no `tsconfig.json`. As regras de segurança estão em `firestore.rules`.

### Rodando

```bash
npx expo start
```

Depois, escaneie o QR code com o Expo Go ou pressione `a` para abrir no emulador Android.

>  Se o app ficar travado na splash screen no celular físico, confira se a versão do Expo Go é compatível com o SDK do projeto.

### Expo Go x APK

Algumas funções dependem de configurações do `app.json` ou de bibliotecas nativas e **só funcionam no APK**:

| Função | Expo Go | APK |
|---|---|---|
| SOS, localização e SMS | ✅ | ✅ |
| Gravação de áudio com o app aberto | ✅ | ✅ |
| Gravação em segundo plano (com o SMS aberto) | ❌ | ✅ |
| Relato em PDF e visualização no app | ✅ | ✅ |
| Envio dos registros (`react-native-share`) | ❌ | ✅ |

### Gerando um APK

```bash
eas build --platform android --profile preview
```

---

## Estrutura do projeto

```
ampara/
├── App.tsx              # Navegação, rota inicial e botão de saída rápida
├── app.json             # Configuração do Expo (plugins de áudio e câmera, backup desligado)
├── firestore.rules      # Regras de segurança do Firestore
├── src/
│   ├── components/      # BotaoSOS, BotaoDisfarce, campos e botões reutilizáveis
│   ├── hooks/           # useGravacaoSOS (gravação de áudio no SOS)
│   ├── screens/         # Telas do aplicativo
│   ├── services/        # Firebase, contatos, alerta SOS, registros e moderação
│   ├── data/            # Serviços de apoio de Rio Grande (mapa)
│   ├── theme/           # Cores, espaçamentos e tipografia
│   └── utils/           # Funções utilitárias (links, telefone, validação)
└── scripts/             # Scripts de apoio (consultas ao Firestore)
```

> O arquivo `serviceAccountKey.json`, usado pelos scripts administrativos, **não** é versionado.

---

## Status

- [x] Cadastro e login de usuária
- [x] Verificação de e-mail por código de 6 dígitos
- [x] Cadastro de contatos de confiança
- [x] Tela inicial com acesso ao 180/190
- [x] Módulo informativo (offline + artigos do Firestore)
- [x] Mapa de serviços com OpenStreetMap
- [x] Mural de publicações com moderação e denúncia
- [x] Modo disfarçado (bloco de notas), saída rápida e configurações
- [x] Botão de emergência com envio de localização por SMS, WhatsApp e Telegram
- [x] Gravação de áudio ao acionar o SOS
- [x] Relato de ocorrência em PDF com fotos e áudios anexos
- [ ] Testes de caixa-preta documentados

---

## Precisa de ajuda agora?

Se você está em situação de violência:

- **Ligue 180**: Central de Atendimento à Mulher (gratuito, 24h)
- **Ligue 190**: Polícia Militar, em caso de emergência

---

## Autoria

**Julie Martins Monteiro**: desenvolvimento
**Prof. Dr. Igor Avila Pereira**: orientação

Instituto Federal do Rio Grande do Sul (IFRS) – Campus Rio Grande

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.
