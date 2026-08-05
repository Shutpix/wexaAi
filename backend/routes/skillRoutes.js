const express = require('express');
const skillController = require('../controllers/skillController');

const router = express.Router();

router.post('/', skillController.createSkill);
router.get('/', skillController.listSkills);

module.exports = router;
