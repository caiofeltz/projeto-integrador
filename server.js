const { app, initializeApp } = require('./src/app');

const PORT = process.env.PORT || 3000;

initializeApp()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`API rodando em http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Falha ao inicializar a aplicação:', error);
    process.exit(1);
  });
