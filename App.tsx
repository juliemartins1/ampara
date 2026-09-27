import 'react-native-gesture-handler';
import { useEffect, useMemo, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from './src/services/firebaseConfig';
import { getDisguiseModeEnabled } from './src/services/disguiseMode';
import { estaExcluindoConta } from './src/services/usuariaService';
import { DisfarceContext } from './src/contexts/DisfarceContext';
import AbasPrincipais from './src/navigation/AbasPrincipais';
import CadastroUsuariaScreen from './src/screens/CadastroUsuariaScreen';
import CadastroContatoConfiancaScreen from './src/screens/CadastroContatoConfiancaScreen';
import LoginScreen from './src/screens/LoginScreen';
import ArtigoDetalheScreen from './src/screens/ArtigoDetalheScreen';
import BlocoDeNotasScreen from './src/screens/BlocoDeNotasScreen';
import ConfiguracoesScreen from './src/screens/ConfiguracoesScreen';
import EditarPerfilScreen from './src/screens/EditarPerfilScreen';
import ExcluirContaScreen from './src/screens/ExcluirContaScreen';
import VerificarEmailScreen from './src/screens/VerificarEmailScreen';
import { colors } from './src/theme/colors';

const Stack = createNativeStackNavigator();

export default function App() {
  // undefined = ainda verificando; null = deslogada; User = logada
  const [usuaria, setUsuaria] = useState<User | null | undefined>(undefined);
  // null = ainda lendo a preferência salva
  const [disfarcado, setDisfarcado] = useState<boolean | null>(null);
  // undefined = ainda lendo o Firestore
  const [emailVerificado, setEmailVerificado] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    getDisguiseModeEnabled().then(setDisfarcado);
    // O Firebase avisa sempre que a usuária entra, sai ou exclui a conta.
    // Como a sessão fica salva no AsyncStorage, ela continua logada
    // ao reabrir o app (login automático).
    return onAuthStateChanged(auth, setUsuaria);
  }, []);

  // Sempre que houver usuária logada, escuta o campo emailVerificado.
  // Quando a tela de código marca true, o app vai para a Home sozinho.
  useEffect(() => {
    if (!usuaria) {
      setEmailVerificado(undefined);
      return;
    }
    return onSnapshot(
      doc(db, 'usuarias', usuaria.uid),
      (snap) => {
        // Durante a exclusão da conta o documento some; ignora
        if (estaExcluindoConta()) return;
        setEmailVerificado(snap.data()?.emailVerificado === true);
      },
      () => setEmailVerificado(false)
    );
  }, [usuaria]);

  const controleDisfarce = useMemo(
    () => ({
      entrarNoDisfarce: () => setDisfarcado(true),
      sairDoDisfarce: () => setDisfarcado(false),
    }),
    []
  );

  const carregando =
    usuaria === undefined ||
    disfarcado === null ||
    (!!usuaria && emailVerificado === undefined);

  if (carregando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  // As telas disponíveis dependem do estado. Quando o estado muda
  // (login, logout, saída rápida), o React Navigation troca de tela
  // sozinho e apaga o histórico — não dá para "voltar" para uma tela
  // que não deveria ser vista.
  return (
    <SafeAreaProvider>
      <DisfarceContext.Provider value={controleDisfarce}>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.primary,
              headerTitleStyle: { color: colors.textPrimary },
              headerShadowVisible: false,
            }}
          >
            {disfarcado ? (
              // 1) Disfarce: só o bloco de notas existe
              <Stack.Screen
                name="BlocoDeNotas"
                component={BlocoDeNotasScreen}
                options={{ headerShown: false }}
              />
            ) : !usuaria ? (
              // 2) Deslogada: entrar ou criar conta
              <>
                <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
                <Stack.Screen name="CadastroUsuaria" component={CadastroUsuariaScreen} options={{ title: 'Criar conta' }} />
              </>
            ) : !emailVerificado ? (
              // 3) Logada, mas ainda não confirmou o código do e-mail
              <Stack.Screen
                name="VerificarEmail"
                component={VerificarEmailScreen}
                options={{ headerShown: false }}
              />
            ) : (
              // 4) Logada e verificada: abas + telas que abrem por cima delas
              <>
                <Stack.Screen name="Principal" component={AbasPrincipais} options={{ headerShown: false }} />
                <Stack.Screen name="CadastroContatoConfianca" component={CadastroContatoConfiancaScreen} options={{ title: 'Contato de confiança' }} />
                <Stack.Screen name="EditarPerfil" component={EditarPerfilScreen} options={{ title: 'Editar meus dados' }} />
                <Stack.Screen name="ExcluirConta" component={ExcluirContaScreen} options={{ title: 'Excluir conta' }} />
                <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ title: 'Configurações' }} />
                <Stack.Screen name="ArtigoDetalhe" component={ArtigoDetalheScreen} options={{ title: '' }} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </DisfarceContext.Provider>
    </SafeAreaProvider>
  );
}