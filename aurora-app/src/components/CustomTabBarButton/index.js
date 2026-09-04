/*
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CustomTabBarButton = ({ children, onPress, accessibilityState }) => {
  const focused = accessibilityState?.selected;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.buttonContainer}
    >
      <View style={[
        styles.innerButton,
        focused && styles.activeButtonBackground // Aplica o estilo de fundo ativo aqui
      ]}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1, // Faz o TouchableOpacity ocupar toda a largura disponível
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerButton: {
    flexDirection: 'row', // Alinha ícone e texto lado a lado, como na imagem
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20, // Ajuste o raio para o formato de pílula
    margin: 4,
  },
  activeButtonBackground: {
    backgroundColor: '#10ff4c', // Cor de fundo da pílula (azul da imagem)
  },
});
export default CustomTabBarButton;
*/
/*

Atualize seu Routes.js:Importe o novo componente e use a propriedade
 tabBarButton dentro de screenOptions para aplicá-lo a todas as abas, 
 ou em options para uma aba específica.

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Camera from '../pages/Camera';
import Gallery from '../pages/Gallery';
import FileAdapter from '../pages/FileAdapter';
import Instructions from '../pages/Instructions';
import AIassistant from '../pages/AIassistant';
// Importe o novo componente
import CustomTabBarButton from './CustomTabBarButton'; 

const Tab = createBottomTabNavigator();

export default function Routes() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#000000' }, // Fundo da barra preto
        tabBarActiveTintColor: '#FFFFFF',          // Cor do ícone/texto ativo (branco)
        tabBarInactiveTintColor: '#CCCCCC',        // Cor do ícone/texto inativo
        tabBarShowLabel: true,                     // Mostra o texto do label
        tabBarButton: (props) => <CustomTabBarButton {...props} />, // Usa o botão personalizado
      }}
    >
      <Tab.Screen name="Camera" component={Camera} />
      <Tab.Screen name="Gallery" component={Gallery} />
      <Tab.Screen name="AI Assistant" component={AIassistant} />
      <Tab.Screen name="File Adapter" component={FileAdapter} />
      <Tab.Screen name="Instructions" component={Instructions} />
    </Tab.Navigator>
  );
}


*/