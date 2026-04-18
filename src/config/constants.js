module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret_change_me',
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
