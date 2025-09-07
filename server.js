const express = require('express');
const cors = require('cors');
const pg = require('pg');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// publicフォルダの中の静的ファイルを提供する設定
app.use(express.static(path.join(__dirname, 'public')));

// データベース接続設定
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// 上位10件のスコアを取得するAPIルート
app.get('/api/scores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM scores ORDER BY score DESC LIMIT 10');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

// 新しいスコアを追加するAPIルート
app.post('/api/scores', async (req, res) => {
  try {
    const { name, score } = req.body;
    // スコアが数値であることを確認
    if (typeof score !== 'number' || !name) {
      return res.status(400).send('名前とスコアが無効です。');
    }
    await pool.query('INSERT INTO scores (name, score) VALUES ($1, $2)', [name, score]);
    res.status(201).send('スコアが追加されました');
  } catch (err) {
    console.error(err.message);
    res.status(500).send('サーバーエラー');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`サーバーがポート${PORT}で起動しました`));