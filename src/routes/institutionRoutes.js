const express = require('express');
const { listInstitutions, createInstitution } = require('../controllers/institutionController');
const { authMiddleware, allowRoles } = require('../middlewares/auth');
const { USER_TYPES } = require('../config/constants');

const router = express.Router();

router.get('/', listInstitutions);
router.post('/', authMiddleware, allowRoles(USER_TYPES.ADMIN), createInstitution);

module.exports = router;
