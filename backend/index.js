const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());

app.get('/api/cnpj/:cnpj', async (req, res) => {
  const { cnpj } = req.params;
  try {
    const response = await axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar CNPJ' });
  }
});

app.listen(3000, () => {
  console.log('Backend rodando na porta 3000');
});
