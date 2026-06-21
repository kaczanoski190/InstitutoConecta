const enrollmentService = require('../services/enrollmentService');

class EnrollmentController {
  async create(req, res) {
    try {
      const enrollment = await enrollmentService.create(req.body);
      return res.status(201).json({
        message: 'Inscrição realizada com sucesso.',
        enrollment
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async cancel(req, res) {
    try {
      const enrollment = await enrollmentService.cancel(req.params.id);
      return res.status(200).json({
        message: 'Inscrição cancelada com sucesso.',
        enrollment
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const enrollments = await enrollmentService.getAll();
      return res.status(200).json(enrollments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async listByCourse(req, res) {
    try {
      const enrollments = await enrollmentService.listByCourse(req.params.cursoId);
      return res.status(200).json(enrollments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async listByParticipant(req, res) {
    try {
      const enrollments = await enrollmentService.listByParticipant(req.params.participanteId);
      return res.status(200).json(enrollments);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new EnrollmentController();
