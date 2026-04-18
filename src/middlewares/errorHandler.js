function notFoundHandler(_req, res) {
  res.status(404).json({ error: 'Rota não encontrada.' });
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const message = error.message || 'Erro interno do servidor.';
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({ error: message });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
