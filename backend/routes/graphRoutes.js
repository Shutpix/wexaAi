const express = require('express');
const graphController = require('../controllers/graphController');

const router = express.Router();

router.get('/connections/:userId', graphController.getFirstDegreeConnections);
router.get('/network/:userId', graphController.getNetwork);
router.get('/referrals/:userId', graphController.getReferrals);
router.get('/recommendations/:userId', graphController.getRecommendations);
router.get('/mutual/:user1/:user2', graphController.getMutualConnections);
router.get('/skills/:userId', graphController.getSimilarSkills);

module.exports = router;
