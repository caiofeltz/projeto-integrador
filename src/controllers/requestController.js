const requestService = require('../services/requestService');

async function listRequests(req, res, next) {
  try {
    const requests = await requestService.listRequests(req.user);
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
}

async function processRequest(req, res, next) {
  try {
    const { acao } = req.body;
    const result = await requestService.updateRequestStatus(Number(req.params.id), acao, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listRequests,
  processRequest,
};
