# Ampara

> Aplicativo móvel open-source de apoio a mulheres em situação de violência, com foco no município de Rio Grande/RS.

O **Ampara** reúne, em um único aplicativo, acesso rápido aos canais oficiais de atendimento (Ligue 180 e 190), cadastro de contatos de confiança, conteúdo informativo sobre a Lei Maria da Penha e os direitos das mulheres, localização de serviços especializados e um modo de interface disfarçada para uso discreto quando o celular pode estar sendo vigiado.

Projeto desenvolvido como Trabalho de Conclusão de Curso do **Tecnólogo em Análise e Desenvolvimento de Sistemas** do **IFRS – Campus Rio Grande**.

> ⚠️ **Projeto em desenvolvimento.** Algumas funcionalidades ainda estão sendo implementadas (veja [Status](#status)).

---

## Funcionalidades

- 📞 **Acesso rápido ao 180 e 190** direto da tela inicial
- 👥 **Contatos de confiança** — cadastro e edição de pessoas que podem ser acionadas em emergência
- 🆘 **Botão de emergência (SOS)** — envio de alerta com localização aos contatos de confiança via WhatsApp, Telegram ou SMS *(em desenvolvimento)*
- 📚 **Informações** — conteúdo sobre a Lei Maria da Penha, tipos de violência e sinais de relacionamento abusivo, com parte disponível offline e artigos atualizados pelo Firestore
- 🗺️ **Mapa de serviços** — delegacias especializadas e rede de atendimento de Rio Grande/RS, usando OpenStreetMap (sem dependência de Google Maps)
- 📝 **Modo disfarçado** — o app se apresenta como um bloco de notas funcional; a saída para o modo real é feita por um gesto secreto
- 💬 **Mural de publicações** — usuárias publicam relatos, mensagens de apoio e dicas de forma anônima; as publicações passam por moderação antes de aparecer e podem ser denunciadas
- 🔐 **Conta e verificação de e-mail** — autenticação com Firebase Auth e verificação obrigatória do e-mail por código de 6 dígitos após o cadastro

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| Linguagem | [TypeScript](https://www.typescriptlang.org/) |
| Backend | [Firebase](https://firebase.google.com/) (Authentication + Cloud Firestore) |
| Verificação de e-mail | [EmailJS](https://www.emailjs.com/) (código de 6 dígitos) |
| Navegação | [React Navigation](https://reactnavigation.org/) (Native Stack) |
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

A configuração é separada por plataforma (`firebaseConfig.native.ts` e `firebaseConfig.web.ts`) e resolvida automaticamente via `moduleSuffixes` no `tsconfig.json`.

### Rodando

```bash
npx expo start
```

Depois, escaneie o QR code com o Expo Go ou pressione `a` para abrir no emulador Android.

> 💡 Se o app ficar travado na splash screen no celular físico, confira se a versão do Expo Go é compatível com o SDK do projeto.

### Gerando um APK

```bash
eas build --platform android --profile preview
```

---

## Estrutura do projeto

```
ampara/
├── App.tsx
├── src/
│   ├── screens/        # Telas do aplicativo
│   ├── services/       # Configuração do Firebase
│   ├── theme/          # Cores, espaçamentos e tipografia
│   └── utils/          # Funções utilitárias (ex.: validação de telefone)
└── scripts/            # Scripts de apoio (consultas ao Firestore)
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
- [x] Modo disfarçado (bloco de notas) e tela de configurações
- [ ] Botão de emergência com envio de localização

---

## Precisa de ajuda agora?

Se você está em situação de violência:

- **Ligue 180** — Central de Atendimento à Mulher (gratuito, 24h)
- **Ligue 190** — Polícia Militar, em caso de emergência

---

## Autoria

**Julie Martins Monteiro** — desenvolvimento
**Prof. Dr. Igor Avila Pereira** — orientação

Instituto Federal do Rio Grande do Sul (IFRS) – Campus Rio Grande

## Licença

Distribuído sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.