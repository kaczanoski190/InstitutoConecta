const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/metrics', verifyToken, authorizeRoles('ADMIN', 'USUARIO'), dashboardController.getMetrics);

module.exports = router;
