const skillService = require('../services/skillService');

const createSkill = async (req, res, next) => {
  try {
    const skill = await skillService.createSkill(req.body);
    res.status(201).json(skill);
  } catch (error) {
    next(error);
  }
};

const listSkills = async (req, res, next) => {
  try {
    const skills = await skillService.listSkills();
    res.json(skills);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSkill,
  listSkills
};
