import 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CadastroUsuariaScreen from './src/screens/CadastroUsuariaScreen';
import CadastroContatoConfiancaScreen from './src/screens/CadastroContatoConfiancaScreen';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import InformacoesScreen from './src/screens/InformacoesScreen';
import ArtigoDetalheScreen from './src/screens/ArtigoDetalheScreen';
import MapaServicosScreen from './src/screens/MapaServicosScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="CadastroUsuaria">
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
      </Stack.Navigator>
    </NavigationContainer>
  );
}