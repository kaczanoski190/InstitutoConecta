const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const courseRoutes = require('./courseRoutes');
const participantRoutes = require('./participantRoutes');
const enrollmentRoutes = require('./enrollmentRoutes');
const dashboardRoutes = require('./dashboardRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/courses', courseRoutes);
router.use('/participants', participantRoutes);
router.use('/enrollments', enrollmentRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
