const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const demandRoutes = require('./routes/demandRoutes');
const donationRoutes = require('./routes/donationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const { initializeDatabase } = require('./database/init');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sistema_doacoes_prototipo.html'));
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/institutions', institutionRoutes);
app.use('/requests', requestRoutes);
app.use('/demands', demandRoutes);
app.use('/donations', donationRoutes);
app.use('/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

async function initializeApp() {
  await initializeDatabase();
}

module.exports = {
  app,
  initializeApp,
};
