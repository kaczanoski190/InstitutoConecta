const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.use(verifyToken);
router.use(authorizeRoles('ADMIN', 'USUARIO'));

router.post('/', enrollmentController.create);
router.get('/', enrollmentController.getAll);
router.put('/:id/cancelar', enrollmentController.cancel);
router.get('/curso/:cursoId', enrollmentController.listByCourse);
router.get('/participante/:participanteId', enrollmentController.listByParticipant);

module.exports = router;
