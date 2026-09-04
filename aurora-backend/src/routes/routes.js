import express from "express";
import multer from "multer";
import { analyzeImage } from "../services/service.gemini.js";
import { ChatController } from "../controllers/ChatController.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const perguntaUsuario = req.body.description;
    console.log("Pergunta do usuário:", perguntaUsuario);
    const imagePath = req.file.path;

    console.log("Arquivo recebido:", req.file);

    if (!req.file) {
      return res.status(400).json({ error: "Nenhuma imagem recebida" });
    }
    if (!perguntaUsuario) {
      return res.status(400).json({ error: "Pergunta não enviada." });
    }

    const description = await analyzeImage(imagePath, perguntaUsuario);

    res.json({
      message: "Imagem analisada com sucesso",
      description,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "A api não conseguiu analisar imagem" });
    //não se esquecer de tratar o erro no aqui e front-end para mostrar uma mensagem amigável ao usuário, caso a análise falhe.
  }
});




// Exemplo no seu Backend (Node.js/Express)
router.post("/chat", ChatController.handle);


export default router;
