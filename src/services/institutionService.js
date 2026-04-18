const { all, run } = require('../database/db');
const { HttpError } = require('../utils/httpError');

async function listInstitutions() {
  return all('SELECT id, nome FROM institutions ORDER BY nome ASC');
}

async function createInstitution(payload) {
  const { nome } = payload;
  if (!nome || !nome.trim()) {
    throw new HttpError(400, 'Nome da instituição é obrigatório.');
  }

  const result = await run('INSERT INTO institutions (nome) VALUES (?)', [nome.trim()]);
  return { id: result.id, nome: nome.trim() };
}

module.exports = {
  listInstitutions,
  createInstitution,
};
