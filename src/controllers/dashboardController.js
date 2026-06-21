const db = require('../config/db');

class DashboardController {
  async getMetrics(req, res) {
    try {
      const partCountRes = await db.query('SELECT COUNT(*)::int AS total FROM participantes');
      const totalParticipantes = partCountRes.rows[0].total;

      const courseCountRes = await db.query('SELECT COUNT(*)::int AS total FROM cursos');
      const totalCursos = courseCountRes.rows[0].total;

      const enrollCountRes = await db.query("SELECT COUNT(*)::int AS total FROM inscricoes WHERE status = 'Ativo'");
      const totalInscricoes = enrollCountRes.rows[0].total;

      const popularCoursesRes = await db.query(`
        SELECT 
          c.id, 
          c.titulo, 
          c.modalidade, 
          c.vagas, 
          COUNT(i.id)::int AS total_inscritos
        FROM cursos c
        LEFT JOIN inscricoes i ON c.id = i.curso_id AND i.status = 'Ativo'
        GROUP BY c.id, c.titulo, c.modalidade, c.vagas
        ORDER BY total_inscritos DESC, c.titulo ASC
        LIMIT 5
      `);
      const cursosPopulares = popularCoursesRes.rows;

      return res.status(200).json({
        totalParticipantes,
        totalCursos,
        totalInscricoes,
        cursosPopulares
      });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new DashboardController();
