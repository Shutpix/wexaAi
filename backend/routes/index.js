const express = require('express');
const userRoutes = require('./userRoutes');
const companyRoutes = require('./companyRoutes');
const jobRoutes = require('./jobRoutes');
const skillRoutes = require('./skillRoutes');
const graphRoutes = require('./graphRoutes');

const router = express.Router();

router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/jobs', jobRoutes);
router.use('/skills', skillRoutes);
router.use('/graph', graphRoutes);

module.exports = router;
