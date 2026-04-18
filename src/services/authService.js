const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { run, get } = require('../database/db');
const { HttpError } = require('../utils/httpError');
const { isValidEmail, isValidCpf, normalizeCpf } = require('../utils/validators');
const { JWT_SECRET, USER_TYPES, USER_STATUS, REQUEST_STATUS } = require('../config/constants');

function validUserType(tipo) {
  return Object.values(USER_TYPES).includes(tipo);
}

async function register(payload) {
  const { nome, cpf, email, senha, tipo, instituicao_id: instituicaoId } = payload;

  if (!nome || !cpf || !email || !senha || !tipo) {
    throw new HttpError(400, 'Campos obrigatórios ausentes no cadastro.');
  }

  if (!validUserType(tipo)) {
    throw new HttpError(400, 'Tipo de usuário inválido.');
  }

  if (!isValidCpf(cpf)) {
    throw new HttpError(400, 'CPF inválido.');
  }

  if (!isValidEmail(email)) {
    throw new HttpError(400, 'Email inválido.');
  }

  const existingEmail = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (existingEmail) {
    throw new HttpError(409, 'Email já cadastrado.');
  }

  const hashedPassword = await bcrypt.hash(senha, 10);
  let status = USER_STATUS.ATIVO;
  let linkedInstitutionId = instituicaoId || null;

  if (tipo === USER_TYPES.RECEBEDOR) {
    if (!instituicaoId) {
      throw new HttpError(400, 'Recebedor deve escolher uma instituição no cadastro.');
    }

    const institution = await get('SELECT id FROM institutions WHERE id = ?', [instituicaoId]);
    if (!institution) {
      throw new HttpError(404, 'Instituição informada não existe.');
    }

    status = USER_STATUS.PENDENTE_APROVACAO;
  }

  if (tipo === USER_TYPES.DOADOR || tipo === USER_TYPES.ADMIN) {
    linkedInstitutionId = null;
  }

  if (tipo === USER_TYPES.INSTITUICAO) {
    const createdInstitution = await run('INSERT INTO institutions (nome) VALUES (?)', [nome]);
    linkedInstitutionId = createdInstitution.id;
  }

  const insertResult = await run(
    `INSERT INTO users (nome, cpf, email, senha, tipo, status, instituicao_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [nome, normalizeCpf(cpf), email, hashedPassword, tipo, status, linkedInstitutionId],
  );

  if (tipo === USER_TYPES.RECEBEDOR) {
    await run(
      `INSERT INTO requests (receiver_id, instituicao_id, status, created_at)
       VALUES (?, ?, ?, ?)`,
      [insertResult.id, linkedInstitutionId, REQUEST_STATUS.PENDENTE, new Date().toISOString()],
    );
  }

  return {
    id: insertResult.id,
    nome,
    email,
    tipo,
    status,
    instituicao_id: linkedInstitutionId,
  };
}

async function login(payload) {
  const { email, senha } = payload;

  if (!email || !senha) {
    throw new HttpError(400, 'Email e senha são obrigatórios.');
  }

  const user = await get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  const isPasswordValid = await bcrypt.compare(senha, user.senha);
  if (!isPasswordValid) {
    throw new HttpError(401, 'Credenciais inválidas.');
  }

  if (user.status !== USER_STATUS.ATIVO) {
    throw new HttpError(403, 'Usuário não está ativo no sistema.');
  }

  const token = jwt.sign(
    {
      id: user.id,
      nome: user.nome,
      tipo: user.tipo,
      status: user.status,
      instituicao_id: user.instituicao_id,
    },
    JWT_SECRET,
    { expiresIn: '8h' },
  );

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      tipo: user.tipo,
      status: user.status,
      instituicao_id: user.instituicao_id,
    },
  };
}

module.exports = {
  register,
  login,
};
