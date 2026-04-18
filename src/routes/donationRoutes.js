const express = require('express');
const {
  createDonation,
  listDonations,
  confirmDonation,
} = require('../controllers/donationController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.post('/', authMiddleware, createDonation);
router.get('/', authMiddleware, listDonations);
router.patch('/:id/confirm', authMiddleware, confirmDonation);

module.exports = router;
