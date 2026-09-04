import { CameraView, useCameraPermissions } from "expo-camera";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRef } from "react";
import * as Speech from "expo-speech";
import { Audio } from "expo-av";

import { useState, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  useSpeechRecognitionEvent,
  ExpoSpeechRecognitionModule,
} from "expo-speech-recognition";

import * as ImageManipulator from "expo-image-manipulator";

export default function App() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();


  async function takePhoto() {
    if (!cameraRef.current) return null;

    await cameraRef.current.resumePreview();
    const photo = await cameraRef.current.takePictureAsync({
      skipProcessing: true,
      base64: false,
    });

    const imagemReduzida = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 640 } }],
      {
        compress: 0.6,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );

    return imagemReduzida.uri;
  }


  async function describeEnvironment(imageUri, perguntaUsuario) {
    const formData = new FormData();

    // 1. Adicionando a Imagem
    formData.append("image", {
      uri: imageUri,
      name: "photo.jpg",
      type: "image/jpeg",
    });

    // 2. Adicionando o Texto (Ex: uma legenda ou ID)
    formData.append("description", perguntaUsuario);
    console.log("Pergunta do usuário:", perguntaUsuario);

    try {
      const response = await fetch("http://192.168.1.9:3000/api/upload", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await response.json();
      console.log("Resposta da API:", data);

      if (!response.ok) throw new Error("Erro na API");

      return data.description;

    } catch (error) {
      
      if (error.message.includes('Network request failed')) {
        speakDescription(
          "Não estou conseguindo me conectar agora, verifique sua conexão com a internet."
        );
        return;
      }

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        speakDescription(
          "Houve uma demora na resposta. Pode repetir a pergunta ou tentar novamente mais tarde?"
        );
        return;
      }

      speakDescription(
        "Me desculpe pelo inconveniente, houve um erro na comunicação com o servidor. Tente novamente.",
      );
    }
  }

  const [audioStatus, setAudioStatus] = useState(false);
  function speakDescription(text, listeningMode = false ) {
    setAudioStatus(true);
  
    if (!text) return;

    Speech.stop(); // para qualquer fala anterior
    Speech.speak(text, {
      language: "pt-BR",
    //  rate: 0.9,
    //  pitch: 1.0,
      onDone: () => {
        console.log("A fala terminou completamente!");
        setAudioStatus(false);
        
        if(listeningMode){
          setTimeout(() => startListening(), 600);
        }
      },
      onError: (error) => {
        console.error("Erro ao reproduzir fala:", error);
        setAudioStatus(false);
      }
      
    });
  }

  //USANDO
  async function startListening() {

    Speech.speak("Estou ouvindo"); 

    await Audio.requestPermissionsAsync();

    //delay para a frase "Estou ouvindo" terminar antes de abrir o modo escuta(micofone)
     setTimeout(async () => {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    let recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    setTimeout(async () => {
      await recording.stopAndUnloadAsync();
      const audioUri = recording.getURI();
      sendAudioToBackend(audioUri);
    }, 4000);
  }, 1200); // Esse tempo deve ser suficiente para o "Estou ouvindo" acabar
}

  const [recognizing, setRecognizing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const isProcessing = useRef(false);

  // 1. ESCUTAR EVENTOS
  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    // AUTO-RESTART: Se o microfone desligar por inatividade e você ainda estiver na aba
    if (isProcessing.current === false) {
      console.log("Reiniciando escuta por inatividade...");
      startListening();
      //ligarMic();
      s
    } else {
      console.log(
        "Microfone parado porque você saiu da aba ou está tirando foto.",
      );
    }
  });

  useSpeechRecognitionEvent("result", (ev) => {
    const text = ev.results[0]?.transcript.toLowerCase().trim();
    setTranscript(text);
    console.log("Usuário disse:", text);

    if (isProcessing.current) return;

    //const regexGatilho = /aurora[, ]*(?:descrev[ra]|escreva|diga(?:\s*-me)?),?\s*(.*)/i;
    const regexGatilho = /aurora[, ]*(?:descreva|escreva|diga(?:\s*-me)?|fale),?\s*(.*)/i;

    console.log("Texto para regex:", text);

    if (regexGatilho.test(text)) {
      handleCaptureFlow(text);
    }
  });

  // Função para ligar o microfone
  const ligarMic = async () => {
    try {
      const result =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) return;

      ExpoSpeechRecognitionModule.start({
        lang: "pt-BR",
        interimResults: false,
        continuous: true, // Importante para não parar na primeira frase
      });
    } catch (e) {
      console.error("Erro ao iniciar microfone:", e);
    }

    setTimeout(async () => {
      await recording.stopAndUnloadAsync();

      const audioUri = recording.getURI();
      console.log("Áudio:", audioUri);

      sendAudioToBackend(audioUri);
    }, 4000);
  }
  };

  // 2. MONITORAR A ABA (useFocusEffect)
  useFocusEffect(
    useCallback(() => {
      console.log("Aba Aurora focada - ligando microfone");
      isProcessing.current = false;
      ligarMic();

      return () => {
        console.log("Saindo da aba - desligando microfone");
        isProcessing.current = true; // Bloqueia o auto-restart
        ExpoSpeechRecognitionModule.stop(); // Para o motor de voz
        setRecognizing(false);
      };
    }, []),
  );

  const handleCaptureFlow = async (perguntaUsuario) => {
    if (isProcessing.current) return;
    isProcessing.current = true;

    console.log("Iniciando fluxo de captura...");

    // 1. Para o reconhecimento para liberar o hardware
    ExpoSpeechRecognitionModule.stop();
    setRecognizing(false);
    

    setTimeout(async () => {
      try {
        Speech.speak("Entendido. Verificando imagem.");
        const photoUri = await takePhoto();

        console.log("Pergunta do usuário extraída:", perguntaUsuario);

        if (photoUri) {
          console.log("Sucesso! Foto:", photoUri);

          const resultadoDescricao = await describeEnvironment(photoUri, perguntaUsuario);
          //criar uma estratégia para interroper o modo ouvir da Aurora durante a descrição da imagem para não se auto-ouvir, desligar o mic durante a descrição e ligar de novo depois
          //talvez seja bom reproduzir a desrição aqui
          // Speech.speak(description);]

          Speech.speak(resultadoDescricao, {
            onStart: () => console.log("Começou a falar..."),
            onDone: () => {
              console.log("Terminou de falar. Liberando mic...");
              isProcessing.current = false; // LIBERA O BLOQUEIO
              ligarMic(); // CHAMA A FUNÇÃO DE LIGAR
            },
            onError: (e) => {
              console.error("Erro na fala:", e);
              isProcessing.current = false;
              ligarMic();
            }
          });

        } else {
          throw new Error("Câmera retornou vazio");
        }

      } catch (error) {
        console.error("Erro na captura:", error);
        Speech.speak("Desculpe, não consegui acionar a câmera.");
        isProcessing.current = false;
        ligarMic();
   
      } 
    }, 3000);
  };

  