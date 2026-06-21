const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    const queryText = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await db.query(queryText, [email]);
    const user = result.rows[0];

    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const isMatch = await bcrypt.compare(password, user.senha);
    if (!isMatch) {
      throw new Error('E-mail ou senha incorretos.');
    }

    const token = jwt.sign(
      { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil },
      process.env.JWT_SECRET || 'conecta_futuro_secret_token_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil
      }
    };
  }
}

module.exports = new AuthService();
