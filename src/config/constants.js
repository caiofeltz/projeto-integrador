const jwtSecret = process.env.JWT_SECRET;

if (process.env.NODE_ENV === 'production' && !jwtSecret) {
  throw new Error('JWT_SECRET precisa estar definido em ambiente de producao.');
}

module.exports = {
  JWT_SECRET: jwtSecret || 'dev_secret_change_me_local_only',
  API_VERSION_PREFIX: '/v1',
  USER_TYPES: {
    DOADOR: 'doador',
    RECEBEDOR: 'recebedor',
    INSTITUICAO: 'instituicao',
    ADMIN: 'admin',
  },
  USER_STATUS: {
    PENDENTE_APROVACAO: 'pendente_aprovacao',
    ATIVO: 'ativo',
    REJEITADO: 'rejeitado',
  },
  DEMAND_STATUS: {
    ABERTA: 'aberta',
    RESERVADA: 'reservada',
    EXPIRADA: 'expirada',
    CONCLUIDA: 'concluida',
  },
  DONATION_STATUS: {
    RESERVADA: 'reservada',
    EXPIRADA: 'expirada',
    CONCLUIDA: 'concluida',
  },
  REQUEST_STATUS: {
    PENDENTE: 'pendente',
    APROVADA: 'aprovada',
    REJEITADA: 'rejeitada',
  },
};
