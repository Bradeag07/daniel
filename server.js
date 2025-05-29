// server.js - Arquivo principal do backend (Focado 100% em API)
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
// 'path' foi completamente removido pois não é mais necessário.

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Permite que o React acesse a API
app.use(express.json()); // Permite que a API entenda JSON vindo do React

// Configuração da conexão com o banco de dados
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'risca_folha',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool; // Pool de conexões

// Função para inicializar o banco de dados (está ótima!)
async function initDb() {
  try {
    console.log('Tentando conectar ao MySQL...');
    const tempConnection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password
    });
    console.log('Conexão inicial com MySQL estabelecida com sucesso!');
    await tempConnection.query('CREATE DATABASE IF NOT EXISTS risca_folha');
    await tempConnection.query('USE risca_folha');
    
    // Criação das tabelas... (seu código aqui está correto)
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_user CHAR(36) NOT NULL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        tag CHAR(10)
      )
    `);
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS artistas (
        id_artista INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        regiao VARCHAR(100),
        batalha VARCHAR(100)
      )
    `);
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS pontos (
        id_artista INT NOT NULL,
        pontuacao INT DEFAULT 0,
        vitorias INT DEFAULT 0,
        derrotas INT DEFAULT 0,
        twolala INT DEFAULT 0,
        colocacao INT DEFAULT 0,
        PRIMARY KEY (id_artista),
        FOREIGN KEY (id_artista) REFERENCES artistas(id_artista) ON DELETE CASCADE
      )
    `);
    await tempConnection.query(`
      CREATE TABLE IF NOT EXISTS gritometro (
        id_artista INT NOT NULL,
        grito VARCHAR(100) DEFAULT '',
        aprovacao INT DEFAULT 0,
        desaprovacao INT DEFAULT 0,
        PRIMARY KEY (id_artista),
        FOREIGN KEY (id_artista) REFERENCES artistas(id_artista) ON DELETE CASCADE
      )
    `);

    console.log('Tabelas criadas ou verificadas com sucesso');
    await tempConnection.end();
    pool = mysql.createPool(dbConfig);
    const connection = await pool.getConnection();
    console.log('Pool de conexões estabelecido com sucesso');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão inicial com MySQL:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('🚨 O servidor MySQL não está rodando ou não está acessível! Verifique se o serviço do MySQL está iniciado.');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('🚨 Acesso negado! Verifique seu nome de usuário e senha para o MySQL.');
    } else {
      console.error('❌ Erro específico:', error.message);
    }
    return false;
  }
}

// ==========================================================
// Rotas para as páginas HTML - TODAS REMOVIDAS
// ==========================================================
// Nenhuma rota app.get(...) que usa res.sendFile deve existir aqui.

// ==========================================================
// API Endpoints - TUDO AQUI ESTÁ CORRETO E FOI MANTIDO
// ==========================================================

// Rota de Teste Simples
app.get('/api', (req, res) => {
    res.json({ message: 'API Risca Folha está no ar!' });
});

// Obter todos os artistas
app.get('/api/artistas', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             IFNULL(p.pontuacao, 0) as pontuacao,
             IFNULL(p.vitorias, 0) as vitorias,
             IFNULL(p.derrotas, 0) as derrotas,
             IFNULL(p.twolala, 0) as twolala,
             IFNULL(p.colocacao, 0) as colocacao,
             IFNULL(g.grito, '') as grito,
             IFNULL(g.aprovacao, 0) as aprovacao,
             IFNULL(g.desaprovacao, 0) as desaprovacao
      FROM artistas a
      LEFT JOIN pontos p ON a.id_artista = p.id_artista
      LEFT JOIN gritometro g ON a.id_artista = g.id_artista
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar artistas:', error);
    res.status(500).json({ error: 'Erro ao buscar artistas', details: error.message });
  }
});

// ... (TODAS AS SUAS OUTRAS ROTAS /api/artistas/:id, /api/login, /api/ranking, /api/artistas (POST), PUT, DELETE, /api/gritometro)
// ... Elas estavam corretas no seu código, então pode mantê-las exatamente como estavam ...

// Obter um artista específico por ID
app.get('/api/artistas/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, 
             IFNULL(p.pontuacao, 0) as pontuacao,
             IFNULL(p.vitorias, 0) as vitorias,
             IFNULL(p.derrotas, 0) as derrotas,
             IFNULL(p.twolala, 0) as twolala,
             IFNULL(p.colocacao, 0) as colocacao,
             IFNULL(g.grito, '') as grito,
             IFNULL(g.aprovacao, 0) as aprovacao,
             IFNULL(g.desaprovacao, 0) as desaprovacao
      FROM artistas a
      LEFT JOIN pontos p ON a.id_artista = p.id_artista
      LEFT JOIN gritometro g ON a.id_artista = g.id_artista
      WHERE a.id_artista = ?
    `, [req.params.id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Artista não encontrado' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar artista:', error);
    res.status(500).json({ error: 'Erro ao buscar artista', details: error.message });
  }
});

// Login de usuário
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.query('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.json({ success: false, error: 'Usuário não encontrado' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ success: false, error: 'Erro no servidor', details: error.message });
  }
});

// Obter ranking dos artistas
app.get('/api/ranking', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.id_artista, a.nome, a.regiao, 
             IFNULL(p.pontuacao, 0) as pontuacao,
             IFNULL(p.vitorias, 0) as vitorias,
             IFNULL(p.derrotas, 0) as derrotas,
             IFNULL(p.twolala, 0) as twolala,
             IFNULL(p.colocacao, 0) as colocacao
      FROM artistas a
      LEFT JOIN pontos p ON a.id_artista = p.id_artista
      ORDER BY p.pontuacao DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ error: 'Erro ao buscar ranking', details: error.message });
  }
});

// API para cadastrar novos MCs
app.post('/api/artistas', async (req, res) => {
  const { nome, regiao, batalha, vitorias = 0, derrotas = 0, twolala = 0 } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome do artista é obrigatório' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const [artistaResult] = await connection.query(
        'INSERT INTO artistas (nome, regiao, batalha) VALUES (?, ?, ?)',
        [nome, regiao || null, batalha || null]
      );
      
      const id_artista = artistaResult.insertId;
      
      await connection.query(
        'INSERT INTO pontos (id_artista, pontuacao, vitorias, derrotas, twolala, colocacao) VALUES (?, ?, ?, ?, ?, ?)',
        [id_artista, 0, parseInt(vitorias), parseInt(derrotas), parseInt(twolala), 0]
      );
      
      await connection.query(
        'INSERT INTO gritometro (id_artista, grito, aprovacao, desaprovacao) VALUES (?, ?, ?, ?)',
        [id_artista, '', 0, 0]
      );
      
      await connection.commit();
      connection.release();
      
      res.status(201).json({ 
        success: true, 
        message: 'Novo MC cadastrado com sucesso',
        id_artista 
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao cadastrar artista:', error);
    res.status(500).json({ error: 'Erro ao cadastrar artista', details: error.message });
  }
});

// API para atualizar artista existente
app.put('/api/artistas/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, regiao, batalha, vitorias = 0, derrotas = 0, twolala = 0 } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'Nome do artista é obrigatório' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      await connection.query(
        'UPDATE artistas SET nome = ?, regiao = ?, batalha = ? WHERE id_artista = ?',
        [nome, regiao || null, batalha || null, id]
      );
      
      await connection.query(
        'UPDATE pontos SET vitorias = ?, derrotas = ?, twolala = ? WHERE id_artista = ?',
        [parseInt(vitorias), parseInt(derrotas), parseInt(twolala), id]
      );
      
      await connection.commit();
      connection.release();
      
      res.json({ 
        success: true, 
        message: 'MC atualizado com sucesso',
        id_artista: id
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar artista:', error);
    res.status(500).json({ error: 'Erro ao atualizar artista', details: error.message });
  }
});

// API para excluir artista
app.delete('/api/artistas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      await connection.query('DELETE FROM artistas WHERE id_artista = ?', [id]);
      await connection.commit();
      connection.release();
      res.json({ 
        success: true, 
        message: 'MC excluído com sucesso'
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao excluir artista:', error);
    res.status(500).json({ error: 'Erro ao excluir artista', details: error.message });
  }
});

// API para atualizar votos do gritômetro
app.post('/api/gritometro/:id_artista', async (req, res) => {
  const { id_artista } = req.params;
  const { tipo } = req.body;

  if (!tipo || (tipo !== 'aprovacao' && tipo !== 'desaprovacao')) {
    return res.status(400).json({ error: 'Tipo de voto inválido' });
  }

  try {
    const connection = await pool.getConnection();
    
    try {
      const [artistas] = await connection.query(
        'SELECT * FROM artistas WHERE id_artista = ?', 
        [id_artista]
      );

      if (artistas.length === 0) {
        connection.release();
        return res.status(404).json({ error: 'Artista não encontrado' });
      }

      const [grito] = await connection.query(
        'SELECT * FROM gritometro WHERE id_artista = ?', 
        [id_artista]
      );

      if (grito.length === 0) {
        await connection.query(
          'INSERT INTO gritometro (id_artista, grito, aprovacao, desaprovacao) VALUES (?, ?, ?, ?)',
          [id_artista, '', tipo === 'aprovacao' ? 1 : 0, tipo === 'desaprovacao' ? 1 : 0]
        );
      } else {
        await connection.query(
          `UPDATE gritometro SET ${tipo} = ${tipo} + 1 WHERE id_artista = ?`,
          [id_artista]
        );
      }

      const [novoGrito] = await connection.query(
        'SELECT aprovacao, desaprovacao FROM gritometro WHERE id_artista = ?',
        [id_artista]
      );

      connection.release();
      
      res.json({ 
        success: true, 
        message: 'Voto registrado',
        ...novoGrito[0]
      });
    } catch (error) {
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Erro ao atualizar gritômetro:', error);
    res.status(500).json({ error: 'Erro ao atualizar gritômetro', details: error.message });
  }
});


// Iniciar o servidor
async function startServer() {
  const dbInitialized = await initDb();
  
  if (dbInitialized) {
    app.listen(PORT, () => {
      console.log(`✅ Servidor API rodando na porta ${PORT}`);
    });
  } else {
    console.error('❌ Não foi possível iniciar o servidor devido a falhas na inicialização do banco de dados.');
    process.exit(1);
  }
}

startServer();