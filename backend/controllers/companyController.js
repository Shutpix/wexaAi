const companyService = require('../services/companyService');

const createCompany = async (req, res, next) => {
  try {
    const company = await companyService.createCompany(req.body);
    res.status(201).json(company);
  } catch (error) {
    next(error);
  }
};

const listCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.listCompanies();
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCompany,
  listCompanies
};
