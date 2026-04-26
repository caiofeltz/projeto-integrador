const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/authRoutes');
const institutionRoutes = require('./routes/institutionRoutes');
const requestRoutes = require('./routes/requestRoutes');
const demandRoutes = require('./routes/demandRoutes');
const donationRoutes = require('./routes/donationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const openApiSpec = require('./docs/openapi.json');

const { initializeDatabase } = require('./database/init');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { API_VERSION_PREFIX } = require('./config/constants');

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};

function registerApiRoutes(prefix = '') {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/institutions`, institutionRoutes);
  app.use(`${prefix}/requests`, requestRoutes);
  app.use(`${prefix}/demands`, demandRoutes);
  app.use(`${prefix}/donations`, donationRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
}

app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'sistema_doacoes_prototipo.html'));
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec, { explorer: true }));
app.get('/openapi.json', (_req, res) => {
  res.status(200).json(openApiSpec);
});

registerApiRoutes(API_VERSION_PREFIX);
// Legacy routes are kept for backward compatibility while clients migrate to /v1.
registerApiRoutes('');

app.use(notFoundHandler);
app.use(errorHandler);

async function initializeApp() {
  await initializeDatabase();
}

module.exports = {
  app,
  initializeApp,
};
