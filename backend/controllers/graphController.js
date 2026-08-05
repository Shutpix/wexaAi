const graphService = require('../services/graphService');

const getFirstDegreeConnections = async (req, res, next) => {
  try {
    const connections = await graphService.getFirstDegreeConnections(req.params.userId);
    res.json(connections);
  } catch (error) {
    next(error);
  }
};

const getNetwork = async (req, res, next) => {
  try {
    const network = await graphService.getNetwork(req.params.userId);
    res.json(network);
  } catch (error) {
    next(error);
  }
};

const getReferrals = async (req, res, next) => {
  try {
    const referrals = await graphService.getReferrals(req.params.userId);
    res.json(referrals);
  } catch (error) {
    next(error);
  }
};

const getRecommendations = async (req, res, next) => {
  try {
    const recommendations = await graphService.getRecommendations(req.params.userId);
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

const getMutualConnections = async (req, res, next) => {
  try {
    const { user1, user2 } = req.params;
    const mutuals = await graphService.getMutualConnections(user1, user2);
    res.json(mutuals);
  } catch (error) {
    next(error);
  }
};

const getSimilarSkills = async (req, res, next) => {
  try {
    const users = await graphService.getSimilarSkills(req.params.userId);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFirstDegreeConnections,
  getNetwork,
  getReferrals,
  getRecommendations,
  getMutualConnections,
  getSimilarSkills
};
