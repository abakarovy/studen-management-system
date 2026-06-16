import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, getDatabase } from './config/database.js';
import { assertRequiredEnv } from './config/env.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import gradeRoutes from './routes/grades.js';
import groupRoutes from './routes/groups.js';
import subjectRoutes from './routes/subjects.js';

dotenv.config();

assertRequiredEnv();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = initDatabase();

async function checkAndSeed() {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();

    if (userCount.count === 0) {
      console.log('⚠️  База данных пустая, запускаем seed...');
      const { runSeed } = await import('./scripts/seed.js');
      await runSeed({ closeAfter: false });
      console.log('✅ Seed выполнен успешно');
    } else {
      console.log(`✅ База данных содержит ${userCount.count} пользователей`);
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке/заполнении базы данных:', error);
  }
}

checkAndSeed().catch((err) => {
  console.error('Ошибка seed:', err);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/subjects', subjectRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'Student Management System API' });
});

app.get('/api/health', (req, res) => {
  try {
    const users = getDatabase().prepare('SELECT COUNT(*) as count FROM users').get();
    res.json({
      ok: true,
      vercel: Boolean(process.env.VERCEL),
      jwtConfigured: Boolean(process.env.JWT_SECRET?.trim()),
      users: users.count,
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get('/api/debug/users', (req, res) => {
  try {
    const users = getDatabase().prepare('SELECT id, email, full_name, role FROM users LIMIT 10').all();
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

export default app;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📁 База данных: ${process.env.DB_PATH || './database.sqlite'}`);
  });
}
