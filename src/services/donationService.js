const crypto = require('crypto');

const { all, get, run } = require('../database/db');
const { HttpError } = require('../utils/httpError');
const {
  DONATION_STATUS,
  DEMAND_STATUS,
  USER_TYPES,
} = require('../config/constants');

function calculateDeadline(startDate) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 10);
  return date.toISOString();
}

function remainingSeconds(deadline) {
  const diff = Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : 0;
}

async function expireOverdueDonations() {
  const overdue = await all(
    `SELECT id, demanda_id
     FROM donations
     WHERE status = ? AND prazo_entrega < ? AND deleted_at IS NULL`,
    [DONATION_STATUS.RESERVADA, new Date().toISOString()],
  );

  for (const donation of overdue) {
    await run('UPDATE donations SET status = ?, codigo_confirmacao = NULL WHERE id = ?', [DONATION_STATUS.EXPIRADA, donation.id]);
    await run('UPDATE demands SET status = ? WHERE id = ? AND deleted_at IS NULL', [DEMAND_STATUS.ABERTA, donation.demanda_id]);
  }
}

async function createDonation(payload, user) {
  if (user.tipo !== USER_TYPES.DOADOR) {
    throw new HttpError(403, 'Apenas doadores podem reservar demandas.');
  }

  const { demanda_id: demandaId } = payload;
  if (!demandaId) {
    throw new HttpError(400, 'ID da demanda é obrigatório.');
  }

  await expireOverdueDonations();

  const demand = await get(
    'SELECT id, status FROM demands WHERE id = ? AND deleted_at IS NULL',
    [demandaId],
  );
  if (!demand) {
    throw new HttpError(404, 'Demanda não encontrada.');
  }

  if (demand.status !== DEMAND_STATUS.ABERTA) {
    throw new HttpError(409, 'Demanda não está aberta para doação.');
  }

  const dataInicio = new Date().toISOString();
  const prazoEntrega = calculateDeadline(dataInicio);

  const insertResult = await run(
    `INSERT INTO donations (demanda_id, doador_id, data_inicio, prazo_entrega, status, codigo_confirmacao)
     VALUES (?, ?, ?, ?, ?, NULL)`,
    [demandaId, user.id, dataInicio, prazoEntrega, DONATION_STATUS.RESERVADA],
  );

  await run('UPDATE demands SET status = ? WHERE id = ? AND deleted_at IS NULL', [DEMAND_STATUS.RESERVADA, demandaId]);

  return {
    id: insertResult.id,
    demanda_id: demandaId,
    doador_id: user.id,
    data_inicio: dataInicio,
    prazo_entrega: prazoEntrega,
    status: DONATION_STATUS.RESERVADA,
  };
}

async function listDonations(user) {
  await expireOverdueDonations();

  let query = `
    SELECT d.id, d.demanda_id, d.doador_id, d.data_inicio, d.prazo_entrega, d.status, d.codigo_confirmacao,
           dm.titulo AS demanda_titulo, dm.descricao AS demanda_descricao, dm.categoria, dm.quantidade,
           dm.instituicao_id, dm.recebedor_id
    FROM donations d
    JOIN demands dm ON dm.id = d.demanda_id
  `;
  const where = ['d.deleted_at IS NULL', 'dm.deleted_at IS NULL'];
  const params = [];

  if (user.tipo === USER_TYPES.DOADOR) {
    where.push('d.doador_id = ?');
    params.push(user.id);
  } else if (user.tipo === USER_TYPES.INSTITUICAO) {
    where.push('dm.instituicao_id = ?');
    params.push(user.instituicao_id);
  } else if (user.tipo === USER_TYPES.RECEBEDOR) {
    where.push('dm.recebedor_id = ?');
    params.push(user.id);
  }

  query += ` WHERE ${where.join(' AND ')}`;

  query += ' ORDER BY d.id DESC';

  const rows = await all(query, params);
  return rows.map((row) => ({
    ...row,
    tempo_restante_segundos: remainingSeconds(row.prazo_entrega),
  }));
}

async function confirmDonation(id, payload, user) {
  await expireOverdueDonations();

  const donation = await get(
    `SELECT d.id, d.demanda_id, d.doador_id, d.status, d.codigo_confirmacao,
            dm.recebedor_id, dm.instituicao_id
     FROM donations d
     JOIN demands dm ON dm.id = d.demanda_id
     WHERE d.id = ? AND d.deleted_at IS NULL AND dm.deleted_at IS NULL`,
    [id],
  );

  if (!donation) {
    throw new HttpError(404, 'Doação não encontrada.');
  }

  if (donation.status !== DONATION_STATUS.RESERVADA) {
    throw new HttpError(409, 'Doação não está disponível para confirmação.');
  }

  if (user.tipo === USER_TYPES.INSTITUICAO) {
    if (user.instituicao_id !== donation.instituicao_id) {
      throw new HttpError(403, 'Instituição não pode operar esta doação.');
    }

    const code = crypto.randomUUID().split('-')[0].toUpperCase();
    await run('UPDATE donations SET codigo_confirmacao = ? WHERE id = ?', [code, id]);

    return {
      donation_id: donation.id,
      codigo_confirmacao: code,
      message: 'Código de confirmação gerado com sucesso.',
    };
  }

  const { codigo } = payload;
  if (!codigo) {
    throw new HttpError(400, 'Código de confirmação é obrigatório.');
  }

  if (donation.codigo_confirmacao !== String(codigo).toUpperCase()) {
    throw new HttpError(400, 'Código de confirmação inválido.');
  }

  if (![USER_TYPES.DOADOR, USER_TYPES.ADMIN].includes(user.tipo)) {
    throw new HttpError(403, 'Somente doador ou admin podem concluir a entrega com código.');
  }

  if (user.tipo === USER_TYPES.DOADOR && user.id !== donation.doador_id) {
    throw new HttpError(403, 'Você só pode confirmar suas próprias doações.');
  }

  await run('UPDATE donations SET status = ? WHERE id = ?', [DONATION_STATUS.CONCLUIDA, id]);
  await run('UPDATE demands SET status = ? WHERE id = ? AND deleted_at IS NULL', [DEMAND_STATUS.CONCLUIDA, donation.demanda_id]);
  await run('UPDATE users SET notificacao_pendente = 1 WHERE id = ?', [donation.recebedor_id]);

  return {
    donation_id: donation.id,
    status: DONATION_STATUS.CONCLUIDA,
    receiver_notified: true,
  };
}

module.exports = {
  createDonation,
  listDonations,
  confirmDonation,
  expireOverdueDonations,
};
