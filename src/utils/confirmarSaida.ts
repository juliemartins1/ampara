// Pergunta antes de sair da conta e volta para o Login sem histórico.
// Antes essa mesma função estava copiada na Home, nas Configurações e no Perfil.
import { Alert } from 'react-native';
import { sairDaConta } from '../services/usuariaService';

export function confirmarSaida(
    navigation: any,
    titulo = 'Sair da conta',
    mensagem = 'Tem certeza que deseja sair?'
) {
    Alert.alert(titulo, mensagem, [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Sair',
            style: 'destructive',
            onPress: async () => {
                try {
                    await sairDaConta(); // também apaga os dados locais
                    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                } catch (erro) {
                    console.error('Erro ao sair:', erro);
                    Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
                }
            },
        },
    ]);
}
