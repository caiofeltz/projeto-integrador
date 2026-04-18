const demandService = require('../services/demandService');

async function createDemand(req, res, next) {
  try {
    const demand = await demandService.createDemand(req.body, req.user);
    res.status(201).json(demand);
  } catch (error) {
    next(error);
  }
}

async function listDemands(req, res, next) {
  try {
    const demands = await demandService.listDemands(req.query);
    res.status(200).json(demands);
  } catch (error) {
    next(error);
  }
}

async function updateDemand(req, res, next) {
  try {
    const demand = await demandService.updateDemand(Number(req.params.id), req.body, req.user);
    res.status(200).json(demand);
  } catch (error) {
    next(error);
  }
}

async function deleteDemand(req, res, next) {
  try {
    const result = await demandService.deleteDemand(Number(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDemand,
  listDemands,
  updateDemand,
  deleteDemand,
};
