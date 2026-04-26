const { logErrorEvent } = require('../utils/auditLogger');

function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

function errorHandler(error, req, res, _next) {
  if (error.message && error.message.includes('Not allowed by CORS')) {
    return res.status(403).json({ error: 'Origem não autorizada por CORS.' });
  }

  const status = error.status || 500;
  const message = error.message || 'Erro interno do servidor.';
  if (status >= 500) {
    logErrorEvent('internal_server_error', {
      path: req.path,
      method: req.method,
      message,
      stack: error.stack,
    });
    console.error(error);
  }
  res.status(status).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
