const db = require('../config/db');

class ParticipantService {
  async create({ nome, cpf, email, telefone, municipio, escolaridade }) {
    if (!nome || !cpf || !email || !telefone || !municipio || !escolaridade) {
      throw new Error('Todos os campos do participante (nome, cpf, e-mail, telefone, município, escolaridade) são obrigatórios.');
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('CPF deve possuir 11 dígitos.');
    }

    const cpfCheck = await db.query('SELECT id FROM participantes WHERE cpf = $1', [cleanCpf]);
    if (cpfCheck.rows.length > 0) {
      throw new Error('Um participante com este CPF já está cadastrado.');
    }

    const result = await db.query(
      `INSERT INTO participantes (nome, cpf, email, telefone, municipio, escolaridade)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [nome, cleanCpf, email, telefone, municipio, escolaridade]
    );

    return result.rows[0];
  }

  async getAll(search = '') {
    let queryText = 'SELECT * FROM participantes';
    const params = [];

    if (search) {
      queryText += ' WHERE nome ILIKE $1 OR cpf ILIKE $1 OR email ILIKE $1';
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY nome ASC';
    const result = await db.query(queryText, params);
    return result.rows;
  }

  async getById(id) {
    const result = await db.query('SELECT * FROM participantes WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async update(id, { nome, cpf, email, telefone, municipio, escolaridade }) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Participante não encontrado.');
    }

    let cleanCpf = existing.cpf;
    if (cpf) {
      cleanCpf = cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        throw new Error('CPF deve possuir 11 dígitos.');
      }
      
      const cpfCheck = await db.query('SELECT id FROM participantes WHERE cpf = $1 AND id != $2', [cleanCpf, id]);
      if (cpfCheck.rows.length > 0) {
        throw new Error('Um participante com este CPF já está cadastrado.');
      }
    }

    const result = await db.query(
      `UPDATE participantes 
       SET nome = $1, cpf = $2, email = $3, telefone = $4, municipio = $5, escolaridade = $6
       WHERE id = $7
       RETURNING *`,
      [
        nome || existing.nome,
        cleanCpf,
        email || existing.email,
        telefone || existing.telefone,
        municipio || existing.municipio,
        escolaridade || existing.escolaridade,
        id
      ]
    );

    return result.rows[0];
  }

  async delete(id) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Participante não encontrado.');
    }

    await db.query('DELETE FROM participantes WHERE id = $1', [id]);
    return { message: 'Participante excluído com sucesso.' };
  }
}

module.exports = new ParticipantService();
