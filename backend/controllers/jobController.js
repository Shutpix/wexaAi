const jobService = require('../services/jobService');

const createJob = async (req, res, next) => {
  try {
    const job = await jobService.createJob(req.body);
    res.status(201).json(job);
  } catch (error) {
    next(error);
  }
};

const listJobs = async (req, res, next) => {
  try {
    const jobs = await jobService.listJobs();
    res.json(jobs);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createJob,
  listJobs
};
