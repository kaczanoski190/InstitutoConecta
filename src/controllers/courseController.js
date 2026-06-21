const courseService = require('../services/courseService');

class CourseController {
  async create(req, res) {
    try {
      const course = await courseService.create(req.body);
      return res.status(201).json({
        message: 'Curso criado com sucesso.',
        course
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { search } = req.query;
      const courses = await courseService.getAll(search);
      return res.status(200).json(courses);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const course = await courseService.getById(req.params.id);
      if (!course) {
        return res.status(404).json({ message: 'Curso não encontrado.' });
      }
      return res.status(200).json(course);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const course = await courseService.update(req.params.id, req.body);
      return res.status(200).json({
        message: 'Curso atualizado com sucesso.',
        course
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const response = await courseService.delete(req.params.id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new CourseController();
