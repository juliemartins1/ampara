import 'react-native-gesture-handler';
import ContatosScreen from './src/screens/ContatosScreen';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';
import CadastroUsuariaScreen from './src/screens/CadastroUsuariaScreen';
import CadastroContatoConfiancaScreen from './src/screens/CadastroContatoConfiancaScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InformacoesScreen from './src/screens/InformacoesScreen';
import ArtigoDetalheScreen from './src/screens/ArtigoDetalheScreen';
import MapaServicosScreen from './src/screens/MapaServicosScreen';
import BlocoDeNotasScreen from './src/screens/BlocoDeNotasScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import { getDisguiseModeEnabled } from './src/services/disguiseMode';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  const [rotaInicial, setRotaInicial] = useState<string | null>(null);

  useEffect(() => {
    // O Firebase demora um instante para recuperar a sessão salva no
    // celular. Esperamos a primeira resposta dele para decidir a tela:
    //   disfarce ativo  -> Bloco de Notas
    //   já logada       -> Home
    //   sem login       -> Login
    const pararDeOuvir = onAuthStateChanged(auth, async (usuaria) => {
      pararDeOuvir(); // só precisamos da primeira resposta
      const disfarceAtivo = await getDisguiseModeEnabled();
      if (disfarceAtivo) {
        setRotaInicial('BlocoDeNotas');
      } else {
        setRotaInicial(usuaria ? 'Home' : 'Login');
      }
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
    <NavigationContainer>
      <Stack.Navigator initialRouteName={rotaInicial}>
        <Stack.Screen
          name="BlocoDeNotas"
          component={BlocoDeNotasScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Entrar' }}
        />
        <Stack.Screen
          name="CadastroUsuaria"
          component={CadastroUsuariaScreen}
          options={{ title: 'Criar conta' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Contatos"
          component={ContatosScreen}
          options={{ title: 'Contatos de confiança' }}
        />
        <Stack.Screen
          name="CadastroContatoConfianca"
          component={CadastroContatoConfiancaScreen}
          options={{ title: 'Contato de confiança' }}
        />
        <Stack.Screen
          name="Informacoes"
          component={InformacoesScreen}
          options={{ title: 'Informações' }}
        />
        <Stack.Screen
          name="ArtigoDetalhe"
          component={ArtigoDetalheScreen}
          options={{ title: '' }}
        />
        <Stack.Screen
          name="MapaServicos"
          component={MapaServicosScreen}
          options={{ title: 'Delegacias e Serviços' }}
        />
        <Stack.Screen
          name="Configuracoes"
          component={ConfiguracoesScreen}
          options={{ title: 'Configurações' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}