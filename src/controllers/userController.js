const userService = require('../services/userService');

class UserController {
  async create(req, res) {
    try {
      const user = await userService.create(req.body);
      return res.status(201).json({
        message: 'Usuário cadastrado com sucesso.',
        user
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const users = await userService.getAll();
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      return res.status(200).json(user);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  async update(req, res) {
    try {
      const user = await userService.update(req.params.id, req.body);
      return res.status(200).json({
        message: 'Usuário atualizado com sucesso.',
        user
      });
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const response = await userService.delete(req.params.id);
      return res.status(200).json(response);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
}

module.exports = new UserController();
