import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';
import { rotaDaSessao } from './src/services/usuariaService';
import { getDisguiseModeEnabled } from './src/services/disguiseMode';
import { colors } from './src/theme/colors';
import BotaoDisfarce from './src/components/BotaoDisfarce';
import CadastroUsuariaScreen from './src/screens/CadastroUsuariaScreen';
import CadastroContatoConfiancaScreen from './src/screens/CadastroContatoConfiancaScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InformacoesScreen from './src/screens/InformacoesScreen';
import AlterarSenhaScreen from './src/screens/AlterarSenhaScreen';
import ArtigoDetalheScreen from './src/screens/ArtigoDetalheScreen';
import MapaServicosScreen from './src/screens/MapaServicosScreen';
import BlocoDeNotasScreen from './src/screens/BlocoDeNotasScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import ContatosScreen from './src/screens/ContatosScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import VerificarEmailScreen from './src/screens/VerificarEmailScreen';
import ExcluirContaScreen from './src/screens/ExcluirContaScreen';
import NovaPublicacaoScreen from './src/screens/NovaPublicacaoScreen';
import MuralScreen from './src/screens/MuralScreen';
import ModeracaoScreen from './src/screens/ModeracaoScreen';
import EmergenciaScreen from './src/screens/EmergenciaScreen';
import RegistrosScreen from './src/screens/RegistrosScreen';
import RelatoScreen from './src/screens/RelatoScreen';

const Stack = createNativeStackNavigator();
const navegacao = createNavigationContainerRef<any>();
const DISFARCE = 'BlocoDeNotas';

// Botão de saída rápida: troca a pilha inteira pelo Bloco de Notas,
// para que o "voltar" do Android não revele o app.
function irParaDisfarce() {
  if (navegacao.isReady()) navegacao.reset({ index: 0, routes: [{ name: DISFARCE }] });
}

export default function App() {
  const [rotaInicial, setRotaInicial] = useState<string | null>(null);
  const [rotaAtual, setRotaAtual] = useState<string | undefined>();

  useEffect(() => {
    // Espera o Firebase recuperar a sessão salva e decide a primeira tela:
    // disfarce ativo -> Bloco de Notas; senão, a tela da sessão (Login, Verificar e-mail ou Home)
    const pararDeOuvir = onAuthStateChanged(auth, async () => {
      pararDeOuvir(); // só precisamos da primeira resposta
      const rota = (await getDisguiseModeEnabled()) ? DISFARCE : await rotaDaSessao();
      setRotaAtual(rota);
      setRotaInicial(rota);
    });
  }, []);

  if (rotaInicial === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer
        ref={navegacao}
        onStateChange={() => setRotaAtual(navegacao.getCurrentRoute()?.name)}
      >
        <Stack.Navigator initialRouteName={rotaInicial}>
          <Stack.Screen name="BlocoDeNotas" component={BlocoDeNotasScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
          <Stack.Screen name="CadastroUsuaria" component={CadastroUsuariaScreen} options={{ title: 'Criar conta' }} />
          <Stack.Screen name="VerificarEmail" component={VerificarEmailScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CadastroContatoConfianca" component={CadastroContatoConfiancaScreen} options={{ title: 'Contato de confiança' }} />
          <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar meus dados' }} />
          <Stack.Screen name="Informacoes" component={InformacoesScreen} options={{ title: 'Informações' }} />
          <Stack.Screen name="ArtigoDetalhe" component={ArtigoDetalheScreen} options={{ title: '' }} />
          <Stack.Screen name="MapaServicos" component={MapaServicosScreen} options={{ title: 'Delegacias e Serviços' }} />
          <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
          <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} options={{ title: 'Alterar senha' }} />
          <Stack.Screen name="ExcluirConta" component={ExcluirContaScreen} options={{ title: 'Excluir conta' }} />
          <Stack.Screen name="Contatos" component={ContatosScreen} options={{ title: 'Contatos de confiança' }} />
          <Stack.Screen name="NovaPublicacao" component={NovaPublicacaoScreen} options={{ title: 'Nova publicação' }} />
          <Stack.Screen name="Moderacao" component={ModeracaoScreen} options={{ title: 'Moderação' }} />
          <Stack.Screen name="Mural" component={MuralScreen} options={{ title: 'Comunidade' }} />
          <Stack.Screen name="Emergencia" component={EmergenciaScreen} options={{ headerShown: false, gestureEnabled: false }} />
          <Stack.Screen name="Registros" component={RegistrosScreen} options={{ title: 'Meus registros' }} />
          <Stack.Screen name="Relato" component={RelatoScreen} options={{ title: 'Relato de ocorrência' }} />
        </Stack.Navigator>
      </NavigationContainer>
      {rotaAtual !== DISFARCE && <BotaoDisfarce onPress={irParaDisfarce} />}
    </SafeAreaProvider>
  );
}