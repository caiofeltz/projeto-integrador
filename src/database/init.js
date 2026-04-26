const bcrypt = require('bcryptjs');
const { run, get, all } = require('./db');
const {
  USER_TYPES,
  USER_STATUS,
  DEMAND_STATUS,
} = require('../config/constants');

async function addColumnIfMissing(tableName, columnName, definition) {
  const columns = await all(`PRAGMA table_info(${tableName})`);
  if (!columns.some((column) => column.name === columnName)) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS institutions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      cpf TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      senha TEXT NOT NULL,
      tipo TEXT NOT NULL,
      status TEXT NOT NULL,
      instituicao_id INTEGER,
      notificacao_pendente INTEGER DEFAULT 0,
      FOREIGN KEY (instituicao_id) REFERENCES institutions(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      receiver_id INTEGER NOT NULL,
      instituicao_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (receiver_id) REFERENCES users(id),
      FOREIGN KEY (instituicao_id) REFERENCES institutions(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS demands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      descricao TEXT NOT NULL,
      categoria TEXT NOT NULL,
      quantidade INTEGER NOT NULL,
      status TEXT NOT NULL,
      recebedor_id INTEGER,
      instituicao_id INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (recebedor_id) REFERENCES users(id),
      FOREIGN KEY (instituicao_id) REFERENCES institutions(id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS donations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demanda_id INTEGER NOT NULL,
      doador_id INTEGER NOT NULL,
      data_inicio TEXT NOT NULL,
      prazo_entrega TEXT NOT NULL,
      status TEXT NOT NULL,
      codigo_confirmacao TEXT,
      FOREIGN KEY (demanda_id) REFERENCES demands(id),
      FOREIGN KEY (doador_id) REFERENCES users(id)
    )
  `);

  // Keep schema backward-compatible for existing databases.
  await addColumnIfMissing('demands', 'deleted_at', 'TEXT DEFAULT NULL');
  await addColumnIfMissing('donations', 'deleted_at', 'TEXT DEFAULT NULL');

  await run('CREATE INDEX IF NOT EXISTS idx_users_tipo_status ON users(tipo, status)');
  await run('CREATE INDEX IF NOT EXISTS idx_users_instituicao_id ON users(instituicao_id)');

  await run('CREATE INDEX IF NOT EXISTS idx_requests_instituicao_status ON requests(instituicao_id, status)');
  await run('CREATE INDEX IF NOT EXISTS idx_requests_receiver_id ON requests(receiver_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at)');

  await run('CREATE INDEX IF NOT EXISTS idx_demands_status_categoria ON demands(status, categoria)');
  await run('CREATE INDEX IF NOT EXISTS idx_demands_instituicao_id ON demands(instituicao_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_demands_recebedor_id ON demands(recebedor_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_demands_created_at ON demands(created_at)');
  await run('CREATE INDEX IF NOT EXISTS idx_demands_deleted_at ON demands(deleted_at)');

  await run('CREATE INDEX IF NOT EXISTS idx_donations_status_prazo ON donations(status, prazo_entrega)');
  await run('CREATE INDEX IF NOT EXISTS idx_donations_demanda_id ON donations(demanda_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_donations_doador_id ON donations(doador_id)');
  await run('CREATE INDEX IF NOT EXISTS idx_donations_deleted_at ON donations(deleted_at)');
}

async function seedDefaults() {
  const existingAdmin = await get('SELECT id FROM users WHERE email = ?', ['admin@sistema.local']);
  if (existingAdmin) return;

  const institutionInsert = await run('INSERT INTO institutions (nome) VALUES (?)', ['EMEF Maria do Rosário']);
  const instituicaoId = institutionInsert.id;

  const senhaHash = await bcrypt.hash('123456', 10);

  await run(
    `INSERT INTO users (nome, cpf, email, senha, tipo, status, instituicao_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Administrador do Sistema', '12345678909', 'admin@sistema.local', senhaHash, USER_TYPES.ADMIN, USER_STATUS.ATIVO, null],
  );

  await run(
    `INSERT INTO users (nome, cpf, email, senha, tipo, status, instituicao_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Instituicao EMEF Maria do Rosário', '52998224725', 'instituicao@sistema.local', senhaHash, USER_TYPES.INSTITUICAO, USER_STATUS.ATIVO, instituicaoId],
  );

  const recebedor = await run(
    `INSERT INTO users (nome, cpf, email, senha, tipo, status, instituicao_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Maria Recebedora', '11144477735', 'recebedor@sistema.local', senhaHash, USER_TYPES.RECEBEDOR, USER_STATUS.ATIVO, instituicaoId],
  );

  await run(
    `INSERT INTO users (nome, cpf, email, senha, tipo, status, instituicao_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ['Doador Demo', '93541134780', 'doador@sistema.local', senhaHash, USER_TYPES.DOADOR, USER_STATUS.ATIVO, null],
  );

  const now = new Date().toISOString();
  await run(
    `INSERT INTO demands (titulo, descricao, categoria, quantidade, status, recebedor_id, instituicao_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Material escolar - Turma 3 ano', 'Cadernos, lapis e borrachas para 25 alunos.', 'materiais', 25, DEMAND_STATUS.ABERTA, recebedor.id, instituicaoId, now],
  );

  await run(
    `INSERT INTO demands (titulo, descricao, categoria, quantidade, status, recebedor_id, instituicao_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Cestas basicas - Comunidade Vila Nova', 'Meta de 40 cestas com itens essenciais.', 'alimentos', 40, DEMAND_STATUS.ABERTA, recebedor.id, instituicaoId, now],
  );

  await run(
    `INSERT INTO demands (titulo, descricao, categoria, quantidade, status, recebedor_id, instituicao_id, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ['Roupas infantis - Inverno', 'Roupas de frio de 4 a 10 anos.', 'roupas', 30, DEMAND_STATUS.ABERTA, recebedor.id, instituicaoId, now],
  );
}

async function initializeDatabase() {
  await createTables();
  await seedDefaults();
}

module.exports = {
  initializeDatabase,
};
