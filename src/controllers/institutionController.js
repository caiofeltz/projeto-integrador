const institutionService = require('../services/institutionService');

async function listInstitutions(_req, res, next) {
  try {
    const institutions = await institutionService.listInstitutions();
    res.status(200).json(institutions);
  } catch (error) {
    next(error);
  }
}

async function createInstitution(req, res, next) {
  try {
    const institution = await institutionService.createInstitution(req.body);
    res.status(201).json(institution);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listInstitutions,
  createInstitution,
};
