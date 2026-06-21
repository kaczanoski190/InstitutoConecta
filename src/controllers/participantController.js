const participantService = require('../services/participantService');

class ParticipantController {
  async create(req, res) {
    try {
      const participant = await participantService.create(req.body);
      return res.status(201).json({
        message: 'Participante cadastrado com sucesso.',
        participant
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const { search } = req.query;
      const participants = await participantService.getAll(search);
      return res.status(200).json(participants);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const participant = await participantService.getById(req.params.id);
      if (!participant) {
        return res.status(404).json({ message: 'Participante não encontrado.' });
      }
      return res.status(200).json(participant);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const participant = await participantService.update(req.params.id, req.body);
      return res.status(200).json({
        message: 'Participante atualizado com sucesso.',
        participant
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const response = await participantService.delete(req.params.id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new ParticipantController();
