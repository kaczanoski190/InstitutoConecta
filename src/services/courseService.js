const db = require('../config/db');

class CourseService {
  async create({ titulo, descricao, carga_horaria, modalidade, vagas, data_inicio, data_fim, status }) {
    if (!titulo || !carga_horaria || !modalidade || !vagas || !data_inicio || !data_fim) {
      throw new Error('Preencha todos os campos obrigatórios (título, carga horária, modalidade, vagas, datas de início e fim).');
    }

    if (new Date(data_inicio) > new Date(data_fim)) {
      throw new Error('A data de início não pode ser posterior à data de término.');
    }

    const result = await db.query(
      `INSERT INTO cursos (titulo, descricao, carga_horaria, modalidade, vagas, data_inicio, data_fim, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [titulo, descricao || '', carga_horaria, modalidade, vagas, data_inicio, data_fim, status || 'Ativo']
    );

    return result.rows[0];
  }

  async getAll(search = '') {
    let queryText = 'SELECT * FROM cursos';
    const params = [];

    if (search) {
      queryText += ' WHERE titulo ILIKE $1 OR descricao ILIKE $1';
      params.push(`%${search}%`);
    }

    queryText += ' ORDER BY id DESC';
    const result = await db.query(queryText, params);
    return result.rows;
  }

  async getById(id) {
    const result = await db.query('SELECT * FROM cursos WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  async update(id, { titulo, descricao, carga_horaria, modalidade, vagas, data_inicio, data_fim, status }) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Curso não encontrado.');
    }

    if (data_inicio && data_fim && new Date(data_inicio) > new Date(data_fim)) {
      throw new Error('A data de início não pode ser posterior à data de término.');
    }

    const result = await db.query(
      `UPDATE cursos 
       SET titulo = $1, descricao = $2, carga_horaria = $3, modalidade = $4, vagas = $5, data_inicio = $6, data_fim = $7, status = $8
       WHERE id = $9
       RETURNING *`,
      [
        titulo || existing.titulo,
        descricao !== undefined ? descricao : existing.descricao,
        carga_horaria || existing.carga_horaria,
        modalidade || existing.modalidade,
        vagas !== undefined ? vagas : existing.vagas,
        data_inicio || existing.data_inicio,
        data_fim || existing.data_fim,
        status || existing.status,
        id
      ]
    );

    return result.rows[0];
  }

  async delete(id) {
    const existing = await this.getById(id);
    if (!existing) {
      throw new Error('Curso não encontrado.');
    }

    await db.query('DELETE FROM cursos WHERE id = $1', [id]);
    return { message: 'Curso excluído com sucesso.' };
  }
}

module.exports = new CourseService();
