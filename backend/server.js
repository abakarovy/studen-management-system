import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase, getDatabase } from './config/database.js';
import { assertRequiredEnv } from './config/env.js';

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

initDatabase();

const seedReady = checkAndSeed();

app.use(async (req, res, next) => {
  await seedReady;
  next();
});

async function checkAndSeed() {
  try {
    const db = getDatabase();
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

const [
  { default: authRoutes },
  { default: userRoutes },
  { default: gradeRoutes },
  { default: groupRoutes },
  { default: subjectRoutes },
] = await Promise.all([
  import('./routes/auth.js'),
  import('./routes/users.js'),
  import('./routes/grades.js'),
  import('./routes/groups.js'),
  import('./routes/subjects.js'),
]);

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
