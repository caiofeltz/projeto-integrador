const express = require('express');
const { listNotifications, clearNotifications } = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authMiddleware, listNotifications);
router.patch('/clear', authMiddleware, clearNotifications);

module.exports = router;
