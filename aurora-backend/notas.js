//import vision from '@google-cloud/vision';
import tts from '@google-cloud/text-to-speech';
import { VertexAI } from "@google-cloud/vertexai"; 

 const PROJECT_ID = process.env.PROJECT_ID;
 const LOCATION = process.env.LOCATION;
 
 const CREDENCIAL_JSON = process.env.GOOGLE_CREDENTIALS_JSON; 
 const CREDENCIAL_LOCAL = process.env.GOOGLE_APPLICATION_CREDENTIALS; 
 
 let authConfig = {};
 let ttsAuthConfig = {};
 let ttsClient, vertex_ai;
 

 if (CREDENCIAL_JSON) {
    
     try {
         const credentials = JSON.parse(CREDENCIAL_JSON);
         authConfig = { credentials };
         ttsAuthConfig = { credentials };
        
     } catch (e) {
         console.error("ERRO: Falha ao processar GOOGLE_CREDENTIALS_JSON.", e);
     }
 } else if (CREDENCIAL_LOCAL) {

     authConfig = { 
         keyFilename: CREDENCIAL_LOCAL
     };
     ttsAuthConfig = {
        keyFilename: CREDENCIAL_LOCAL
    };
    
 } else {
 
     console.log("Nenhuma credencial encontrada. Usando credenciais padrão do ambiente.");
 }
 
 try {

     vertex_ai = new VertexAI({
         project: PROJECT_ID,
         location: LOCATION,
         googleAuthOptions: authConfig 
     });
 

     ttsClient = new tts.TextToSpeechClient({
         project: PROJECT_ID,
         ...ttsAuthConfig
     });
 } catch (error) {
     console.error("Erro fatal ao inicializar clientes Google Cloud:", error.message);
     throw new Error("Falha na inicialização dos serviços de IA. Verifique as credenciais.");
 }


const model = "gemini-2.5-flash"; 
const generativeModel = vertex_ai.getGenerativeModel({ model });

//https://cloud.google.com/nodejs/docs/reference/vertexai/latest
// Função auxiliar para formatar o Buffer em um formato aceito pelo Gemini
function ConverterParaEntradaGenerativa(imagemBuffer, mimeType) {
    return {
        inlineData: {
            data: imagemBuffer.toString("base64"),
            mimeType,
        },
    };
}

async function gerarDescricao(imageBuffer) {

   // const teste = imageBuffer
   // console.log("TESTANDO Buffer: ", teste) 
    const imageFormatada = ConverterParaEntradaGenerativa(imageBuffer, 'image/jpeg'); 
   // console.log("formato GEMINI:", imagePart)
    const prompt =  `Você é um assistente que descreve imagem para pessoas cegas.
    Descreva a imagem com uma linguagem descritiva, objetiva, apropriada, e não longa, evitando termos visuais complexos desnecessários, 
    palavras simbolos, ou detalhes pequenos e irrelevantes que aparecerem na imagem. Seguindo o principio da hastag pra cego ver.
    Se for uma selfie, mencione que é uma selfie, descreva a pessoa suas caracteristicas(como cor dos olho, cabelo, formato 
    de rosto, etc), cor da roupa se aparecer na foto, evite falar detalhes de fundo.
    Se for foto de pessoas, descreva a pessoa suas caracteristicas cor de roupa, se tiver um fundo visível descreva de forma breve sem 
    considerar detalhes minúsculos que tiver.
    Se for cards convites folders, comece dizendo o que é o material: convite? card? banner de evento?, O que ele informa(identifique a
    ideia central)? Se houver leia o texto na ordem : título subtítulo informações .
    evite detalhes minúsculos, evite falar simbolos, decoração que não muda o sentido, fale somente o texto, 
    sem falar icones, ou caracteres especiais. E se tiver  fundo mencione a cor.
    Se o convite tiver elementos gráficos importantes para o contexto ou estética, e descreva-os brevemente. Não é necessário descrever 
    cada pequeno detalhe, mas sim o que é relevante para a compreensão do convite. Priorize a informação textual, o mais importante é 
    garantir que todas as informações textuais do convite (data, hora, local, tipo de evento, anfitriões, instruções) sejam comunicadas 
    claramente. Não use o "*" para definir tópicos.
    `
            
    

    const request = {
        contents: [
            { 
                role: "user", 
                parts: [
                    imageFormatada,
                    { text: prompt } 
                ] 
            }
        ],
    };

    let descricaoTexto = "";

    try {
     
        console.log("Chamando Vertex AI para descrição da imagem...");
        
        const response = await generativeModel.generateContent(request);

        descricaoTexto = response.response.candidates[0].content.parts[0].text;
        
        console.log(`Descrição: ${descricaoTexto}`);
        //console.log(response.response.candidates[0].content.parts[0])
        
        return descricaoTexto
        
    } catch (error) {
        console.error("Erro na Gemini API:", error?.message || error);
        throw new Error("Erro ao gerar descrição.");
    }    
}

async function gerarAudioDescricao(descricaoTexto){
        
    try {
        const textoDeEntrada = { text: descricaoTexto };
        
        const [ttsResponse] = await ttsClient.synthesizeSpeech({
            input: textoDeEntrada,
            voice: { languageCode: 'pt-BR', ssmlGender: 'FEMALE' },
            audioConfig: { audioEncoding: 'MP3' }
        });

        return ttsResponse.audioContent;


    } catch (error) {
        console.error("Erro na TTS API:", error);
        throw new Error(`Erro na API de Text-to-Speech: ${error.message}`);
    }
}

export { gerarDescricao, gerarAudioDescricao };






























