# Ampara

> Aplicativo móvel open-source de apoio a mulheres em situação de violência, com foco no município de Rio Grande/RS.

O **Ampara** reúne, em um único aplicativo, um botão de emergência que avisa pessoas de confiança com a localização, gravação de áudio e relato de ocorrência em PDF, acesso rápido aos canais oficiais (Ligue 180 e 190), conteúdo sobre a Lei Maria da Penha, mapa da rede de atendimento e um modo disfarçado para uso discreto quando o celular pode estar sendo vigiado.

Projeto desenvolvido como Trabalho de Conclusão de Curso do **Tecnólogo em Análise e Desenvolvimento de Sistemas** do **IFRS – Campus Rio Grande**.

---

## Funcionalidades

-  **Botão de emergência (SOS)**: segurado por 2 segundos, pega a localização (GPS ou rede, mesmo sem internet), abre o SMS para todos os contatos de confiança com o endereço aproximado e o link do mapa, e oferece envio por WhatsApp e Telegram
-  **Gravação de áudio no SOS**: começa sozinha quando a tela de emergência abre e continua com o SMS ou o WhatsApp aberto
-  **Relato de ocorrência em PDF**: data, local, descrição, fotos tiradas pela câmera do próprio app e áudios do SOS anexos
-  **Meus registros**: ler o relato e ver as fotos dentro do app, ouvir (e pausar) os áudios, enviar para quem pode ajudar ou apagar; cada conta vê só os próprios registros
-  **Contatos de confiança**: até 5 pessoas, com cópia no celular para o SOS funcionar sem internet
-  **Acesso rápido ao 180 e 190** direto da tela inicial
-  **Informações**: Lei Maria da Penha, tipos de violência e sinais de relacionamento abusivo (parte offline e artigos do Firestore)
-  **Mapa de serviços**: delegacias e rede de atendimento de Rio Grande/RS com OpenStreetMap, sem Google Maps
-  **Modo disfarçado**: instalado, o app aparece como **"Notas"**, com ícone de bloco de notas, e abre como um bloco de notas funcional; a interface real abre por um gesto secreto e, opcionalmente, um código próprio
-  **Saída rápida**: um botão discreto, em todas as telas, volta na hora para o bloco de notas (o áudio do SOS é salvo antes)
-  **Comunidade**: publicações anônimas de relatos, apoio e dicas, com moderação prévia e denúncia
-  **Conta segura**: Firebase Auth, verificação obrigatória do e-mail por link, senha de no mínimo 8 caracteres e "Esqueci minha senha"

---

## Privacidade e segurança

- **Áudios, fotos e relatos** ficam só na pasta interna do app, separados por conta: não aparecem na galeria nem no gerenciador de arquivos e não vão para a nuvem.
- **Tela protegida**: capturas de tela são bloqueadas e a miniatura em "Apps recentes" fica em branco, para não revelar o app por trás do disfarce.
- **Código do disfarce** (opcional), guardado criptografado no celular (`expo-secure-store`) e separado do PIN do aparelho.
- **Backup do Android desligado** (`allowBackup: false`), para os registros não serem copiados para o Google Drive.
- **O alerta SOS não é salvo** no Firestore: nenhuma localização da usuária fica no servidor. O SMS não cita o nome do app.
- **Verificação de e-mail feita pelo servidor do Google**: o status vem no token de login (`email_verified`) e as regras exigem conta verificada para publicar e denunciar.
- **Regras de segurança do Firestore**: cada usuária só lê e altera os próprios dados, com campos e tamanhos validados; no máximo uma publicação a cada 5 minutos.
- **Publicações anônimas de verdade**: o documento da publicação não guarda quem escreveu; a autoria fica numa subcoleção que só a moderação lê.
- **Cadastro não revela** se um e-mail já tem conta no app.
- **Mapa**: o Leaflet só carrega se for idêntico ao arquivo oficial (Subresource Integrity).
- **Ao sair da conta**, a cópia dos contatos e a última localização são apagadas do celular. **Ao excluir a conta**, também os registros guardados no celular.
- **Arquivos só saem do celular** quando a usuária escolhe para quem enviar.

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) (SDK 57) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Backend | [Firebase](https://firebase.google.com/) (Authentication + Cloud Firestore) |
| Verificação de e-mail | Firebase Authentication (link enviado por e-mail) |
| Navegação | [React Navigation](https://reactnavigation.org/) (Native Stack) |
| Localização e SMS | `expo-location`, `expo-sms` |
| Áudio, câmera e PDF | `expo-audio`, `expo-camera`, `expo-print` |
| Arquivos e envio | `expo-file-system`, `react-native-share` |
| Mapa | [Leaflet](https://leafletjs.com/) + [OpenStreetMap](https://www.openstreetmap.org/) via `react-native-webview` |
| Armazenamento local | `@react-native-async-storage/async-storage`, `expo-secure-store` |
| Proteção de tela | `expo-screen-capture` |
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

A configuração é separada por plataforma (`firebaseConfig.native.ts` e `firebaseConfig.web.ts`) e resolvida automaticamente via `moduleSuffixes` no `tsconfig.json`.

No console do Firebase:

1. **Firestore → Regras**: publique o conteúdo de `firestore.rules`.
2. **Authentication → Configurações**: ative a política de senha (mínimo de 8 caracteres) e a proteção contra enumeração de e-mail.
3. **Firestore → `moderadoras`**: crie um documento com o UID de cada moderadora (o app não cria moderadoras).
4. **Firestore → `artigos`**: cadastre os artigos da tela de Informações (campos `titulo`, `subtitulo`, `conteudo` em Markdown e `ordem`).

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
| Nome "Notas" e ícone de bloco de notas | ❌ | ✅ |

### Gerando um APK

```bash
eas build --platform android --profile preview
```

---

## Estrutura do projeto

```
ampara/
├── App.tsx              # Navegação, rota inicial e botão de saída rápida
├── app.json             # Configuração do Expo (nome e ícone de disfarce, plugins, backup desligado)
├── firestore.rules      # Regras de segurança do Firestore
├── src/
│   ├── components/      # BotaoSOS, BotaoDisfarce, Chips, CampoCodigo e outros reutilizáveis
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
- [x] Verificação de e-mail por link do Firebase
- [x] Cadastro de contatos de confiança
- [x] Tela inicial com acesso ao 180/190
- [x] Módulo informativo (offline + artigos do Firestore)
- [x] Mapa de serviços com OpenStreetMap
- [x] Mural de publicações com moderação e denúncia
- [x] Modo disfarçado (bloco de notas), saída rápida e configurações
- [x] Botão de emergência com envio de localização por SMS, WhatsApp e Telegram
- [x] Gravação de áudio ao acionar o SOS
- [x] Relato de ocorrência em PDF com fotos e áudios anexos
- [x] Auditoria de segurança (tela protegida, código do disfarce, regras validadas, autoria privada)
- [ ] App Check (Play Integrity) e restrição da chave de API
- [ ] Testes de caixa-preta documentados

### Limitações conhecidas

- O cadastro de um e-mail já usado continua falhando, então alguém insistente ainda pode deduzir que existe uma conta (só se resolve com cadastro feito por servidor).
- O limite de 5 contatos de confiança é garantido pelo app, não pelas regras (as regras do Firestore não contam documentos).
- A rota do mapa ("Como chegar") consulta o servidor público do OSRM, que recebe a origem e o destino.
- Quem esquecer o código do disfarce precisa reinstalar o app, o que apaga os registros do celular.

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