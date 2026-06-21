const db = require('../config/db');
const bcrypt = require('bcryptjs');

class UserService {
  async create({ nome, email, senha, perfil }) {
    if (!nome || !email || !senha || !perfil) {
      throw new Error('Todos os campos (nome, email, senha, perfil) são obrigatórios.');
    }

    if (perfil !== 'ADMIN' && perfil !== 'USUARIO') {
      throw new Error('Perfil deve ser ADMIN ou USUARIO.');
    }

    const emailCheck = await db.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      throw new Error('Este e-mail já está sendo utilizado.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(senha, salt);

    const result = await db.query(
      'INSERT INTO usuarios (nome, email, senha, perfil) VALUES ($1, $2, $3, $4) RETURNING id, nome, email, perfil, data_cadastro',
      [nome, email, hashedPassword, perfil]
    );

    return result.rows[0];
  }

  async getAll() {
    const result = await db.query('SELECT id, nome, email, perfil, data_cadastro FROM usuarios ORDER BY nome ASC');
    return result.rows;
  }

  async getById(id) {
    const result = await db.query('SELECT id, nome, email, perfil, data_cadastro FROM usuarios WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async update(id, { nome, email, senha, perfil }) {
    const existingUser = await this.getById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado.');
    }

    if (email && email !== existingUser.email) {
      const emailCheck = await db.query('SELECT id FROM usuarios WHERE email = $1 AND id != $2', [email, id]);
      if (emailCheck.rows.length > 0) {
        throw new Error('Este e-mail já está sendo utilizado por outro usuário.');
      }
    }

    let queryText = 'UPDATE usuarios SET nome = $1, email = $2, perfil = $3';
    const params = [nome || existingUser.nome, email || existingUser.email, perfil || existingUser.perfil];

    if (senha) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(senha, salt);
      queryText += ', senha = $4 WHERE id = $5 RETURNING id, nome, email, perfil, data_cadastro';
      params.push(hashedPassword, id);
    } else {
      queryText += ' WHERE id = $4 RETURNING id, nome, email, perfil, data_cadastro';
      params.push(id);
    }

    const result = await db.query(queryText, params);
    return result.rows[0];
  }

  async delete(id) {
    const existingUser = await this.getById(id);
    if (!existingUser) {
      throw new Error('Usuário não encontrado.');
    }

    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return { message: 'Usuário excluído com sucesso.' };
  }
}

module.exports = new UserService();
