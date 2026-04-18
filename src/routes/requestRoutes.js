const express = require('express');
const { listRequests, processRequest } = require('../controllers/requestController');
const { authMiddleware, allowRoles } = require('../middlewares/auth');
const { USER_TYPES } = require('../config/constants');

const router = express.Router();

router.get('/', authMiddleware, allowRoles(USER_TYPES.INSTITUICAO, USER_TYPES.ADMIN), listRequests);
router.patch('/:id', authMiddleware, allowRoles(USER_TYPES.INSTITUICAO, USER_TYPES.ADMIN), processRequest);

module.exports = router;
