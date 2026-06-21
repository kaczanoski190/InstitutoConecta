const db = require('../config/db');

class EnrollmentService {
  async create({ participante_id, curso_id }) {
    if (!participante_id || !curso_id) {
      throw new Error('Identificadores de participante e curso são obrigatórios.');
    }

    const partResult = await db.query('SELECT nome FROM participantes WHERE id = $1', [participante_id]);
    if (partResult.rows.length === 0) {
      throw new Error('Participante não encontrado.');
    }

    const courseResult = await db.query('SELECT titulo, vagas, status FROM cursos WHERE id = $1', [curso_id]);
    if (courseResult.rows.length === 0) {
      throw new Error('Curso não encontrado.');
    }
    const curso = courseResult.rows[0];

    if (curso.status === 'Cancelado' || curso.status === 'Concluído') {
      throw new Error(`Não é possível realizar inscrições em um curso com status "${curso.status}".`);
    }

    const duplicateCheck = await db.query(
      'SELECT id, status FROM inscricoes WHERE participante_id = $1 AND curso_id = $2',
      [participante_id, curso_id]
    );

    if (duplicateCheck.rows.length > 0) {
      const existing = duplicateCheck.rows[0];
      if (existing.status === 'Ativo') {
        throw new Error('O participante já está ativamente inscrito neste curso.');
      } else {
        const activeCountResult = await db.query(
          "SELECT COUNT(*)::int FROM inscricoes WHERE curso_id = $1 AND status = 'Ativo'",
          [curso_id]
        );
        const activeEnrollments = activeCountResult.rows[0].count;
        if (activeEnrollments >= curso.vagas) {
          throw new Error('Não há vagas disponíveis neste curso no momento.');
        }

        const reactivated = await db.query(
          "UPDATE inscricoes SET status = 'Ativo', data_inscricao = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
          [existing.id]
        );
        return reactivated.rows[0];
      }
    }

    const activeCountResult = await db.query(
      "SELECT COUNT(*)::int FROM inscricoes WHERE curso_id = $1 AND status = 'Ativo'",
      [curso_id]
    );
    const activeEnrollments = activeCountResult.rows[0].count;

    if (activeEnrollments >= curso.vagas) {
      throw new Error('Não há vagas disponíveis neste curso.');
    }

    const result = await db.query(
      `INSERT INTO inscricoes (participante_id, curso_id, status)
       VALUES ($1, $2, 'Ativo')
       RETURNING *`,
      [participante_id, curso_id]
    );

    return result.rows[0];
  }

  async cancel(id) {
    const existing = await db.query('SELECT * FROM inscricoes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      throw new Error('Inscrição não encontrada.');
    }

    const enrollment = existing.rows[0];
    if (enrollment.status === 'Cancelado') {
      throw new Error('Esta inscrição já está cancelada.');
    }

    const result = await db.query(
      "UPDATE inscricoes SET status = 'Cancelado' WHERE id = $1 RETURNING *",
      [id]
    );

    return result.rows[0];
  }

  async getAll() {
    const queryText = `
      SELECT 
        i.id, 
        i.participante_id, 
        p.nome AS participante_nome, 
        p.email AS participante_email,
        i.curso_id, 
        c.titulo AS curso_titulo, 
        i.data_inscricao, 
        i.status
      FROM inscricoes i
      JOIN participantes p ON i.participante_id = p.id
      JOIN cursos c ON i.curso_id = c.id
      ORDER BY i.id DESC
    `;
    const result = await db.query(queryText);
    return result.rows;
  }

  async listByCourse(curso_id) {
    const queryText = `
      SELECT 
        i.id AS inscricao_id, 
        p.id AS participante_id, 
        p.nome, 
        p.cpf, 
        p.email, 
        p.telefone, 
        i.data_inscricao, 
        i.status AS inscricao_status
      FROM inscricoes i
      JOIN participantes p ON i.participante_id = p.id
      WHERE i.curso_id = $1
      ORDER BY p.nome ASC
    `;
    const result = await db.query(queryText, [curso_id]);
    return result.rows;
  }

  async listByParticipant(participante_id) {
    const queryText = `
      SELECT 
        i.id AS inscricao_id, 
        c.id AS curso_id, 
        c.titulo, 
        c.carga_horaria, 
        c.modalidade, 
        i.data_inscricao, 
        i.status AS inscricao_status
      FROM inscricoes i
      JOIN cursos c ON i.curso_id = c.id
      WHERE i.participante_id = $1
      ORDER BY c.titulo ASC
    `;
    const result = await db.query(queryText, [participante_id]);
    return result.rows;
  }
}

module.exports = new EnrollmentService();
