const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/authController');

const router = express.Router();

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 8,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: 'Muitas tentativas de login. Aguarde e tente novamente.' },
});

router.post('/register', authLimiter, register);
router.post('/login', loginLimiter, login);

module.exports = router;
