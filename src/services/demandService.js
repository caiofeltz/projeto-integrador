const { all, get, run } = require('../database/db');
const { HttpError } = require('../utils/httpError');
const {
  DEMAND_STATUS,
  USER_TYPES,
  USER_STATUS,
} = require('../config/constants');
const { expireOverdueDonations } = require('./donationService');

function validateDemandPayload(payload) {
  const { titulo, descricao, categoria, quantidade } = payload;
  if (!titulo || !descricao || !categoria || quantidade === undefined) {
    throw new HttpError(400, 'Campos obrigatórios da demanda ausentes.');
  }
  if (Number(quantidade) <= 0) {
    throw new HttpError(400, 'Quantidade deve ser maior que zero.');
  }
}

async function createDemand(payload, user) {
  validateDemandPayload(payload);

  const { titulo, descricao, categoria, quantidade } = payload;
  if (user.tipo !== USER_TYPES.RECEBEDOR) {
    throw new HttpError(403, 'Apenas recebedor ativo pode criar solicitação de doação.');
  }

  const requester = await get('SELECT * FROM users WHERE id = ?', [user.id]);
  if (!requester || requester.status !== USER_STATUS.ATIVO) {
    throw new HttpError(403, 'Recebedor precisa estar ativo para criar solicitações.');
  }

  const recebedorId = user.id;
  const instituicaoId = requester.instituicao_id;

  if (!instituicaoId) {
    throw new HttpError(400, 'Recebedor não está vinculado a uma instituição.');
  }

  const institution = await get('SELECT id FROM institutions WHERE id = ?', [instituicaoId]);
  if (!institution) {
    throw new HttpError(404, 'Instituição não encontrada.');
  }

  const createdAt = new Date().toISOString();
  const insertResult = await run(
    `INSERT INTO demands (titulo, descricao, categoria, quantidade, status, recebedor_id, instituicao_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [titulo, descricao, categoria, Number(quantidade), DEMAND_STATUS.ABERTA, recebedorId, instituicaoId, createdAt],
  );

  return {
    id: insertResult.id,
    titulo,
    descricao,
    categoria,
    quantidade: Number(quantidade),
    status: DEMAND_STATUS.ABERTA,
    recebedor_id: recebedorId,
    instituicao_id: instituicaoId,
    created_at: createdAt,
  };
}

async function listDemands(filters = {}) {
  await expireOverdueDonations();

  const where = [];
  const params = [];

  if (filters.status) {
    where.push('d.status = ?');
    params.push(filters.status);
  }

  if (filters.categoria) {
    where.push('d.categoria = ?');
    params.push(filters.categoria);
  }

  if (filters.q) {
    where.push('(LOWER(d.titulo) LIKE ? OR LOWER(d.descricao) LIKE ?)');
    const value = `%${String(filters.q).toLowerCase()}%`;
    params.push(value, value);
  }

  const sql = `
    SELECT d.*, i.nome AS instituicao_nome
    FROM demands d
    JOIN institutions i ON i.id = d.instituicao_id
    ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
    ORDER BY d.id DESC
  `;

  return all(sql, params);
}

async function updateDemand(id, payload, user) {
  const demand = await get('SELECT * FROM demands WHERE id = ?', [id]);
  if (!demand) {
    throw new HttpError(404, 'Demanda não encontrada.');
  }

  const canManageAsReceiver = user.tipo === USER_TYPES.RECEBEDOR && demand.recebedor_id === user.id;
  const canManageAsInstitution = user.tipo === USER_TYPES.INSTITUICAO && demand.instituicao_id === user.instituicao_id;
  const canManageAsAdmin = user.tipo === USER_TYPES.ADMIN;

  if (!canManageAsReceiver && !canManageAsInstitution && !canManageAsAdmin) {
    throw new HttpError(403, 'Você não pode editar esta demanda.');
  }

  const fields = [];
  const params = [];

  ['titulo', 'descricao', 'categoria', 'quantidade', 'status'].forEach((field) => {
    if (payload[field] !== undefined) {
      fields.push(`${field} = ?`);
      params.push(field === 'quantidade' ? Number(payload[field]) : payload[field]);
    }
  });

  if (!fields.length) {
    throw new HttpError(400, 'Nenhum campo enviado para atualização.');
  }

  params.push(id);
  await run(`UPDATE demands SET ${fields.join(', ')} WHERE id = ?`, params);

  return get('SELECT * FROM demands WHERE id = ?', [id]);
}

async function deleteDemand(id) {
  const demand = await get('SELECT id FROM demands WHERE id = ?', [id]);
  if (!demand) {
    throw new HttpError(404, 'Demanda não encontrada.');
  }

  await run('DELETE FROM donations WHERE demanda_id = ?', [id]);
  await run('DELETE FROM demands WHERE id = ?', [id]);

  return { deleted: true, id };
}

module.exports = {
  createDemand,
  listDemands,
  updateDemand,
  deleteDemand,
};
