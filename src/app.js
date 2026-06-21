const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '../public')));

app.use('/api', routes);

app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'Endpoint da API não encontrado.' });
});

app.use((err, req, res, next) => {
  console.error('Erro Capturado:', err.stack || err.message || err);
  
  const statusCode = err.status || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';
  
  res.status(statusCode).json({
    message,
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse localmente em: http://localhost:${PORT}`);
});

module.exports = app;
