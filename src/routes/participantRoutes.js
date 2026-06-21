const express = require('express');
const router = express.Router();
const participantController = require('../controllers/participantController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRoles('ADMIN', 'USUARIO'));

router.post('/', participantController.create);
router.get('/', participantController.getAll);
router.get('/:id', participantController.getById);
router.put('/:id', participantController.update);
router.delete('/:id', participantController.delete);

module.exports = router;
