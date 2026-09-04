//Config rotas
//#AB00D6

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Camera from "../pages/Camera";
import Gallery from "../pages/Gallery";
import FileAdapter from "../pages/FileAdapter";
import Instructions from "../pages/Instructions";
import AIassistant from "../pages/AIassistant";
//import CustomTabBarButton from './CustomTabBarButton';
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import TabButton from "../components/TabButton/index.js";
import * as Animatable from "react-native-animatable";
import { StyleSheet } from "react-native";




const Tab = createBottomTabNavigator();


const iconUp = {
  0: { transform: [{ translateY: 0 }, { scale: 1 }] },
  1: { transform: [{ translateY: -3 }, { scale: 1.1 }] },
};

const iconDown = {
  0: { transform: [{ translateY: -3 }, { scale: 1.1 }] },
  1: { transform: [{ translateY: 0 }, { scale: 1 }] },
};

export default function Routes() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor:  "#d200fc",  //"#15ace7", // Cor do ícone/texto ativo (opcional)
        tabBarInactiveTintColor: "#000000", // Cor do ícone/texto inativo (opcional)
        

        tabBarStyle: {
          backgroundColor: "#ffffff", // A cor de fundo
          borderTopColor: "transparent", // Remove a borda superior padrão

        //  borderColor: "#f5d3fc", // Cor da borda
       
         // borderStyle: "solid", 
          //borderWidth: 0.5, // Largura e cor da borda
          height: 60, // Altura da barra (opcional)

         // toolbarHeight: 0,
          
          width: "92%",
          
          shadowColor: "#b902f1",
          shadowOffset: {
            width: 0,
            height: 18,
          },
          shadowOpacity:  0.25,
          shadowRadius: 20.00,
          elevation: 24,
          alignItems: "center",
       
          alignSelf: "center",
          bottom: 60,
         
          borderRadius: 8,
          overflow: "visible",
        },
        tabBarShowLabel: true,
        
      }}
    >
      <Tab.Screen
        name="Câmera"
        component={Camera}
        options={{
          title: 'Câmera',
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused, color, size }) => (
            <Animatable.View
              animation={focused ? iconUp : iconDown}
              duration={300}
            >
              <MaterialCommunityIcons
                name="camera-plus-outline"
                color={color}
                size={size}
              />
            </Animatable.View>
          ),
        }}
      />

      <Tab.Screen
        name="Galeria"
        component={Gallery}
        
        options={{
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused, color, size }) => (
            <Animatable.View
              animation={focused ? iconUp : iconDown}
              duration={100}
              
            
         
            >
              <Ionicons name="images-outline" color={color} size={size} />
            </Animatable.View>
          ),
        }}
      />

      <Tab.Screen
        name="Assistente Aurora"
        component={AIassistant}
        options={{
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused, color, size }) => (
            <Animatable.View
              animation={focused ? iconUp : iconDown}
              duration={100}
             
            >
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />

      <Tab.Screen
        name="Adaptador de Arquivos"
        component={FileAdapter}
        options={{
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused, color, size }) => (
            <Animatable.View
              animation={focused ? iconUp : iconDown}
              duration={100}
            >
              <Ionicons name="documents-outline" size={size} color={color} />
            </Animatable.View>
          ),
        }}
      />

      <Tab.Screen
        name="Instruções"
        component={Instructions}
        options={{
          tabBarButton: (props) => <TabButton {...props} />,
          tabBarIcon: ({ focused, color, size }) => (
             <Animatable.View
              animation={focused ? iconUp : iconDown}
              duration={100}
            >

              <Ionicons
                name="information-circle-outline"
                size={size}
                color={color}

              />
            </Animatable.View>
          
              
            
          ),
        }}
      />
    </Tab.Navigator>
  );


}

const styles = StyleSheet.create({
     
   
      teste: {
     
        borderBottomColor: '#d200fc',
        borderBottomWidth: 1,
      }
   
     });
