import { GoogleGenAI } from "@google/genai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

//consultar os modelos disponíveis
const models = await ai.models.list();
console.log(models);

export async function analyzeImage(imagePath, perguntaUsuario) {
  try {
    console.log("Gerando descrição para a imagem...");

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString("base64");

    const result = await ai.models.generateContent({
      model: "models/gemini-2.5-flash", // funciona na API nova
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image,
          },
        },
        {
          text: `
Você é Aurora, uma assistente visual para pessoas cegas.
Sua missão é responder a seguinte pergunta do usuário: "${perguntaUsuario}":
Para respondê-la é importante considerar estas intruções:
 * Comece a resposta sempre direcionado para a pergunta do usuário. Por exemplo, se o usuário perguntar "Aurora, diga-me o 
 ventilador que está na sala é preto?", responda apenas sobre o ventilador (exemplo: "sim, o ventilador é preto"), sem descrever outros detalhes da cena;
 * Se ele perguntar algo que não pode ser respondido com base na imagem, como "Aurora, que horas são?", responda algo como: Desculpa, Não consigo te 
 responder sobre isso, pois sou uma assistente visual e só posso responder perguntas relacionadas à descrição de imagens.


 * Ao analisar a imagem,  elabore o texto de descrição, com frases bem curtas e claras contextualizada sem muitos detalhes irrelevantes para confundir a pessoa cega;
 

 * Priorize descrever: objetos e coisa grandes próximos, textos ou placas visíveis, pessoas visiveis e próximas, e o ambiente 
 geral(ex: dentro de casa, rua, parque, etc);
 * Evite focar em detalhes pequenos ou irrelevantes, como a cor de um objeto pequeno, ou detalhes de roupas, ou coisas que 
 estão muito longe, detalhes do fundo da imagem;

 * Se não tiver certeza de algo, diga que pode estar enganado.

        `,
        },
      ],
    });
    console.log("Descrição gerada:", result.text);

    return result.text;
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    throw error;
  }
}



export async function chatService(historicoDoBanco, mensagemAtual) {
  try {
    // 1. Você NÃO chama generateContent aqui. 
    // Apenas define qual modelo quer usar e as instruções do sistema.
    const modelId = "models/gemini-2.5-flash"; 
    const systemInstruction = "Você é Aurora, uma assistente empática para pessoas cegas. Responda de forma concisa e clara.";

    // 2. No SDK novo (@google/genai), o startChat geralmente é feito 
    // através de ai.chats ou gerenciando o histórico manualmente.
    // Vamos usar a forma compatível com a sua instância 'ai':

    const result = await ai.models.generateContent({
      model: modelId,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [
        ...historicoDoBanco, // Espalha o histórico salvo
        { role: "user", parts: [{ text: mensagemAtual }] } // Adiciona a nova pergunta
      ],
    });

    // O texto da resposta no SDK novo fica em result.text
    return result.text;
    
  } catch (error) {
    console.error("Erro no chatService:", error);
    throw error;
  }
}


//////PARTE TESTE PARA IMAGEM E DOCUMENTO 
const modelName = "models/gemini-2.5-flash";

// Dentro do seu service.gemini.js

export async function chatService2(historicoDoBanco, mensagemAtual, type, file, mimeType) {
  try {
    let contents = [];
    const systemInstruction = "Você é Aurora, uma assistente visual empática para pessoas cegas. Você deve responder de forma clara o máximo concisa e objetiva.";

  if (type === 'image' && file) {
      // Para imagens, ignoramos o histórico momentaneamente para evitar confusão no modelo
      // e enviamos a imagem como a peça central da mensagem.
      contents = [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: file // Aqui vai o Base64 puro
              }
            },
            { 
              text: mensagemAtual || "Descreva esta imagem para uma pessoa cega, focando em objetos principais e texto." 
            }
          ]
        }
      ];
      
    } else {
      // CENÁRIO TEXTO: Enviamos o histórico + a mensagem nova
      contents = [
        ...historicoDoBanco,
        { role: "user", parts: [{ text: mensagemAtual }] }
      ];
    }

    const result = await ai.models.generateContent({
      model: modelName,
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: contents
    });

    return result.text;
  } catch (error) {
    console.error("Erro no chatService:", error);
    throw error;
  }
}


/*

// Função para Texto puro
async function handleText(prompt, history) {
  return await ai.models.generateContent({
    model: modelName,
    systemInstruction: "Você é a Aurora...",
    contents: [...history, { role: "user", parts: [{ text: prompt }] }]
  });
}

// Função para Imagem + Texto
async function handleImage(prompt, base64, img) {
  return await ai.models.generateContent({
    model: modelName,
    contents: [
      { inlineData: { mimeType: img.mimeType, data: base64 } },
      { text: prompt || "Descreva esta imagem para uma pessoa cega." }
    ]
  });
}

// Função para Documentos (PDF/Texto)
async function handleDocument(prompt, fileBuffer) {
  // O Gemini 1.5 Flash aceita texto extraído ou arquivos via File API
  return await ai.models.generateContent({
    model: modelName,
    contents: [{ text: `Resuma o seguinte documento: ${fileBuffer}\n\nPergunta: ${prompt}` }]
  });
}

// O ORQUESTRADOR (A função que você exporta)
export async function auroraOrchestrator(type, payload, history) {
  const providers = {
    'text': () => handleText(payload.message, history),
    'image': () => handleImage(payload.message, payload.file, payload.img),
    'document': () => handleDocument(payload.message, payload.fileText),
  };

  const execute = providers[type] || providers['text'];
  const result = await execute();
  return result.text;
}
  

*/