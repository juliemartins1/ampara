import 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';
import { emailFoiVerificado } from './src/services/verificarEmailService';
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
import PerfilScreen from './src/screens/PerfilScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import VerificarEmailScreen from './src/screens/VerificarEmailScreen';
import { getDisguiseModeEnabled } from './src/services/disguiseMode';
import { colors } from './src/theme/colors';
import ExcluirContaScreen from './src/screens/ExcluirContaScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [rotaInicial, setRotaInicial] = useState<string | null>(null);

  useEffect(() => {
    // Espera o Firebase recuperar a sessão salva e decide a primeira tela:
    //   disfarce ativo                 -> Bloco de Notas
    //   sem login                      -> Login
    //   logada, e-mail NÃO verificado  -> Verificar e-mail
    //   logada e verificada            -> Home
    const pararDeOuvir = onAuthStateChanged(auth, async (usuaria) => {
      pararDeOuvir(); // só precisamos da primeira resposta
      if (await getDisguiseModeEnabled()) {
        setRotaInicial('BlocoDeNotas');
      } else if (!usuaria) {
        setRotaInicial('Login');
      } else {
        const verificado = await emailFoiVerificado().catch(() => false);
        setRotaInicial(verificado ? 'Home' : 'VerificarEmail');
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
        <Stack.Screen name="BlocoDeNotas" component={BlocoDeNotasScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
        <Stack.Screen name="CadastroUsuaria" component={CadastroUsuariaScreen} options={{ title: 'Criar conta' }} />
        <Stack.Screen name="VerificarEmail" component={VerificarEmailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
         <Stack.Screen name="CadastroContatoConfianca" component={CadastroContatoConfiancaScreen} options={{ title: 'Contato de confiança' }} />
        <Stack.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Meu perfil' }} />
        <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar meus dados' }} />
        <Stack.Screen name="Informacoes" component={InformacoesScreen} options={{ title: 'Informações' }} />
        <Stack.Screen name="ArtigoDetalhe" component={ArtigoDetalheScreen} options={{ title: '' }} />
        <Stack.Screen name="MapaServicos" component={MapaServicosScreen} options={{ title: 'Delegacias e Serviços' }} />
        <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
        <Stack.Screen name="AlterarSenha" component={AlterarSenhaScreen} options={{ title: 'Alterar senha' }} />
        <Stack.Screen name="ExcluirConta" component={ExcluirContaScreen} options={{ title: 'Excluir conta' }} />
        <Stack.Screen name="Contatos" component={ContatosScreen} options={{ title: 'Contatos de confiança' }} />
</Stack.Navigator>
    </NavigationContainer>
  );
}