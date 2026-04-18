const { all, run } = require('../database/db');
const { USER_TYPES } = require('../config/constants');

async function getNotifications(user) {
  if (user.tipo === USER_TYPES.ADMIN) {
    return all(
      `SELECT id, nome, email, notificacao_pendente
       FROM users
       WHERE notificacao_pendente = 1
       ORDER BY id DESC`,
    );
  }

  const rows = await all(
    `SELECT id, notificacao_pendente
     FROM users
     WHERE id = ?`,
    [user.id],
  );

  return rows;
}

async function clearNotifications(user) {
  await run('UPDATE users SET notificacao_pendente = 0 WHERE id = ?', [user.id]);
  return { cleared: true };
}

module.exports = {
  getNotifications,
  clearNotifications,
};
