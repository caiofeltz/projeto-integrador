const express = require('express');
const {
  createDemand,
  listDemands,
  updateDemand,
  deleteDemand,
} = require('../controllers/demandController');
const { authMiddleware, allowRoles } = require('../middlewares/auth');
const { USER_TYPES } = require('../config/constants');

const router = express.Router();

router.get('/', listDemands);
router.post('/', authMiddleware, allowRoles(USER_TYPES.RECEBEDOR), createDemand);
router.patch('/:id', authMiddleware, updateDemand);
router.delete('/:id', authMiddleware, allowRoles(USER_TYPES.ADMIN), deleteDemand);

module.exports = router;
