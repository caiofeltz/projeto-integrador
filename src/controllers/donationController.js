const donationService = require('../services/donationService');

async function createDonation(req, res, next) {
  try {
    const donation = await donationService.createDonation(req.body, req.user);
    res.status(201).json(donation);
  } catch (error) {
    next(error);
  }
}

async function listDonations(req, res, next) {
  try {
    const donations = await donationService.listDonations(req.user);
    res.status(200).json(donations);
  } catch (error) {
    next(error);
  }
}

async function confirmDonation(req, res, next) {
  try {
    const result = await donationService.confirmDonation(Number(req.params.id), req.body, req.user);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createDonation,
  listDonations,
  confirmDonation,
};
