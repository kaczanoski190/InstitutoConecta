const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', courseController.getAll);
router.get('/:id', courseController.getById);

router.post('/', verifyToken, authorizeRoles('ADMIN', 'USUARIO'), courseController.create);
router.put('/:id', verifyToken, authorizeRoles('ADMIN', 'USUARIO'), courseController.update);
router.delete('/:id', verifyToken, authorizeRoles('ADMIN', 'USUARIO'), courseController.delete);

module.exports = router;
