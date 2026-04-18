const { all, get, run } = require('../database/db');
const { HttpError } = require('../utils/httpError');
const { REQUEST_STATUS, USER_STATUS, USER_TYPES } = require('../config/constants');

async function listRequests(user) {
  if (user.tipo === USER_TYPES.ADMIN) {
    return all(
      `SELECT r.id, r.status, r.created_at, u.nome AS recebedor_nome, u.email AS recebedor_email,
              i.nome AS instituicao_nome, r.receiver_id, r.instituicao_id
       FROM requests r
       JOIN users u ON u.id = r.receiver_id
       JOIN institutions i ON i.id = r.instituicao_id
       ORDER BY r.created_at DESC`,
    );
  }

  return all(
    `SELECT r.id, r.status, r.created_at, u.nome AS recebedor_nome, u.email AS recebedor_email,
            i.nome AS instituicao_nome, r.receiver_id, r.instituicao_id
     FROM requests r
     JOIN users u ON u.id = r.receiver_id
     JOIN institutions i ON i.id = r.instituicao_id
     WHERE r.instituicao_id = ?
     ORDER BY r.created_at DESC`,
    [user.instituicao_id],
  );
}

async function updateRequestStatus(id, action, user) {
  if (!['aprovar', 'rejeitar'].includes(action)) {
    throw new HttpError(400, 'Ação inválida. Use aprovar ou rejeitar.');
  }

  const request = await get('SELECT * FROM requests WHERE id = ?', [id]);
  if (!request) {
    throw new HttpError(404, 'Pedido de vínculo não encontrado.');
  }

  if (user.tipo !== USER_TYPES.ADMIN && request.instituicao_id !== user.instituicao_id) {
    throw new HttpError(403, 'Você não pode alterar este pedido.');
  }

  if (request.status !== REQUEST_STATUS.PENDENTE) {
    throw new HttpError(409, 'Pedido já foi processado.');
  }

  const requestStatus = action === 'aprovar' ? REQUEST_STATUS.APROVADA : REQUEST_STATUS.REJEITADA;
  const userStatus = action === 'aprovar' ? USER_STATUS.ATIVO : USER_STATUS.REJEITADO;
  const institutionId = action === 'aprovar' ? request.instituicao_id : null;

  await run('UPDATE requests SET status = ? WHERE id = ?', [requestStatus, id]);
  await run('UPDATE users SET status = ?, instituicao_id = ? WHERE id = ?', [userStatus, institutionId, request.receiver_id]);

  return {
    id: request.id,
    status: requestStatus,
    receiver_id: request.receiver_id,
  };
}

module.exports = {
  listRequests,
  updateRequestStatus,
};
