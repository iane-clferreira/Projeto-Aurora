
import { PrismaClient } from '@prisma/client';
import { chatService, chatService2 } from '../services/service.gemini.js';

const prisma = new PrismaClient();

export const ChatController = {
  async handle(req, res) {
    const {type, sessionId, message, file, img } = req.body;

    if (!sessionId || !message) {
      return res.status(400).json({ error: "Sessão ou mensagem não informada." });
    }

    try {
      // 1. Busca histórico (últimas 5 mensagens) ANTES de salvar a nova
      // Isso evita que a IA receba a mensagem atual duplicada no histórico
      const historicoBruto = await prisma.message.findMany({
        where: { sessionId },
        orderBy: { createdAt: 'desc' },
        take: 5,
      });

      // 2. Formata o histórico para o formato do Gemini
      // .reverse() é necessário porque pegamos 'desc' (mais novas), mas a IA lê na ordem cronológica
      const historicoFormatado = historicoBruto.reverse().map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      // 3. Chama o serviço da IA enviando o histórico e a mensagem atual
      //const respostaAurora = await chatService(historicoFormatado, message);
      const resposta = await chatService2(historicoFormatado, message, type, file, img);

      // 4. Salva AMBAS no banco de dados (a pergunta do usuário e a resposta da IA)
      await prisma.message.createMany({
        data: [
          { sessionId, role: 'user', content: message },
          { sessionId, role: 'model', content: resposta}
        ]
      });

      // 5. Retorna a resposta para o Mobile
      return res.json({ response: resposta });

    } catch (error) {
      console.error("Erro no ChatController:", error);
      return res.status(500).json({ error: "Erro interno no servidor." });
    }
  }
};