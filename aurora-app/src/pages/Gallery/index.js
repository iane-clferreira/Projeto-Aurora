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
          "Não estou conseguindo me conectar agora, verifique sua conexão com a internet.", true
          
        );
        console.log(error.message)
        return;
      }

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        speakDescription(
          "Houve uma demora na resposta. Pode repetir a pergunta ou tentar novamente mais tarde?", true
        );
        return;
      }

      speakDescription(
        "Me desculpe pelo inconveniente, houve um erro na comunicação com o servidor. Tente novamente." , true
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
      
  
      onDone: () => {
        setAudioStatus(false);
        console.log("Esta trecho de fala terminou");
       
    
        if(listeningMode){
          setTimeout(() => ligarMic(), 800);
        }
      },

      onError: (error) => {
        console.error("Erro ao reproduzir fala:", error);
        setAudioStatus(false);
      }
      
    });
  }

  const ligarMic = async () => {
  // Se estivermos processando uma foto ou falando, não liga o mic agora
  if (isProcessing.current) return;

  try {
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) return;

    ExpoSpeechRecognitionModule.start({
      lang: "pt-BR",
      interimResults: false,
      continuous: true,
    });
  } catch (e) {
    console.error("Erro ao iniciar microfone:", e);
  }
};




  //USANDO
 

  const [recognizing, setRecognizing] = useState(false);
 
  const isProcessing = useRef(false);

  // 1. ESCUTAR EVENTOS
  useSpeechRecognitionEvent("start", () => setRecognizing(true));
  useSpeechRecognitionEvent("end", () => {
    setRecognizing(false);
    // AUTO-RESTART: Se o microfone desligar por inatividade e você ainda estiver na aba
    if (isProcessing.current === false) { // se tiver ocupado(true), se não eliga o mic
      console.log("Reiniciando escuta por inatividade...");
      ligarMic();
      
    } else {
      console.log(
        "Microfone parado porque você saiu da aba ou está tirando foto.",
      );
    }
  });

  useSpeechRecognitionEvent("result", (ev) => {
    const text = ev.results[0]?.transcript.toLowerCase().trim();
 
    console.log("Usuário disse:", text);

    if (isProcessing.current) return;

    //const regexGatilho = /aurora[, ]*(?:descrev[ra]|escreva|diga(?:\s*-me)?),?\s*(.*)/i;
    const regexGatilho = /aurora[, ]*(?:descreva|escreva|diga(?:\s*-me)?|fale),?\s*(.*)/i;

   

    //testar a outra forma de regex sugerrida:
    if (regexGatilho.test(text)) {
      handleCaptureFlow(text);
    }


  });



const handleCaptureFlow = async (perguntaUsuario) => {
  isProcessing.current = true; // TRAVA a escuta
  ExpoSpeechRecognitionModule.stop(); // PARA o reconhecimento para não ouvir a si mesma

  speakDescription("Entendido. Verificando imagem.");

  try {
    const photoUri = await takePhoto();
    
    if (photoUri) {
      // Envia para o backend (ajuste para enviar o TEXTO da pergunta junto)
      const resultadoDescricao = await describeEnvironment(photoUri, perguntaUsuario);
      
      // Fala o resultado e, ao terminar, REATIVA o microfone (true)
      speakDescription(resultadoDescricao, true);
      isProcessing.current = false; // Destrava para permitir o onDone do speak
    }
  } catch (error) {
    console.error("Erro no fluxo:", error);
    speakDescription("Desculpe, tive um problema com a câmera.", true);
    isProcessing.current = false;
  }
};



  // 5. CONTROLE DA ABA (Focar/Sair)
useFocusEffect(
  useCallback(() => {
    isProcessing.current = false;
    console.log("Aba Aurora focada - ligando microfone");
    
    speakDescription("Estou ouvindo.", true); // Já inicia o ciclo de escuta

    return () => {
      isProcessing.current = true; // Bloqueia reinicializações

      console.log("Saindo da aba - desligando microfone");
      ExpoSpeechRecognitionModule.stop();
      Speech.stop();
    };
  }, [])
);


















  //TRECHO DE TESTE, COMENTAR DEPOIS : teste em 09/03 - depois descomentar a funcionalidade acima
  //parei na parte de detectar a intenção sem IA, executar o código baseado em palavras-chave, tipo "descreve a imagem" ou "o que tem na foto?"

  //enviar audio já convertido em texto para o backend para Ia saber qual a intenção do usuário, tipo "o que tem na foto?" ou "tem pessoas?" e a IA responder com base na última descrição, sem precisar analisar a imagem de novo
  /*


  async function sendAudioToBackend(text) {

  console.log("Enviando texto:", text);

  const response = await fetch('http://192.168.1.9:3000/api/comandos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: text }),
  });

  const data = await response.json();

  console.log('Resposta da API:', data);

  return data;

}

//INICIAR_CONVERSA


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
  } else {
      console.log("Microfone parado porque você saiu da aba ou está tirando foto.");
  }
  });

useSpeechRecognitionEvent("result", async (ev) => {

  console.log("Evento:", ev);

  const text = ev.results?.[0]?.transcript 
   .toLowerCase()
   .replace(/[.,]/g,"")
   .trim();;

 if(!text){
   console.log("Nenhum texto reconhecido");
   return;
 }
 const command = text.replace("aurora","").trim();

 // só ativa se falar aurora
 if(!text.includes("aurora descreva")) return;

 const data = await sendAudioToBackend(text);

 console.log("Resposta backend:", data);

 // fala resposta
 if(data.answer){
  Speech.speak(data.answer);
 }

 // executa ação
 if(data.action === "DESCREVER_IMAGENS"){

   console.log("Capturando imagem...");

   const photoUri = await takePhoto();

   const descricao = await describeEnvironment(photoUri);

   Speech.speak(descricao);
 }

 if(data.action === "RESPONDER_PERGUNTAS"){
   console.log("Iniciando chat");
 }

});

const ligarMic = async () => {
    try {
      const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!result.granted) return;

      ExpoSpeechRecognitionModule.start({
        lang: "pt-BR",
        interimResults: false,
        continuous: true, // Importante para não parar na primeira frase
      });
    } catch (e) {
      console.error("Erro ao iniciar microfone:", e);
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
    }, [])
  );


*/

  if (!permission?.granted) {
    return (
      <View style={styles.center}>
        <Text onPress={requestPermission}>Permitir câmera</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        isActive={true}
        mode="picture"
      />

      <TouchableOpacity style={styles.button}>
        <Text style={styles.text}>teste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#16ada6",
    padding: 20,
    marginBottom: 20,
    borderRadius: 50,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

/*Speech.speak(
  'Câmera aberta. Aponte para o objeto e toque no botão para tirar a foto.',
  { language: 'pt-BR' }
);*/
