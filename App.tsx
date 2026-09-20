import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

// Rota que o app usaria se o modo disfarçado estivesse desativado —
// mantém o fluxo de demo linear já existente como padrão.
const ROTA_INICIAL_SEM_DISFARCE = 'CadastroUsuaria';

export default function App() {
  const [rotaInicial, setRotaInicial] = useState<string | null>(null);

  useEffect(() => {
    getDisguiseModeEnabled().then((disfarceAtivo) => {
      setRotaInicial(disfarceAtivo ? 'BlocoDeNotas' : ROTA_INICIAL_SEM_DISFARCE);
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
          name="CadastroUsuaria"
          component={CadastroUsuariaScreen}
          options={{ title: 'Criar conta' }}
        />
        <Stack.Screen
          name="CadastroContatoConfianca"
          component={CadastroContatoConfiancaScreen}
          options={{ title: 'Contato de confiança' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Entrar' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Ampara', headerShown: false }}
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