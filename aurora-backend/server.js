import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import describeRoutes from './src/routes/routes.js';
import imageRoutes from './src/routes/routes.js';
import router from './src/routes/routes.js';

const app = express();

app.use(cors());


// Permite receber JSONs grandes (como as imagens em Base64 da Aurora)
app.use(express.json({ limit: '50mb' })); 

// Permite receber dados de formulários grandes, se necessário
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', router);


app.use('/describe', describeRoutes);

app.use('/api', imageRoutes);


app.get('/teste', (req, res) => {
  res.json({ status: 'API funcionando ' });
});




const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
