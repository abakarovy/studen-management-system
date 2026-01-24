import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';
import { initDatabase, getDatabase } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import gradeRoutes from './routes/grades.js';
import groupRoutes from './routes/groups.js';
import subjectRoutes from './routes/subjects.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Инициализация базы данных
const db = initDatabase();

// Функция для проверки и запуска seed
async function checkAndSeed() {
  try {
    const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
    
  if (userCount.count === 0) {
      console.log('⚠️  База данных пустая, запускаем seed...');
      
      return new Promise((resolve, reject) => {
        const seedProcess = spawn('node', ['scripts/seed.js'], {
          stdio: 'inherit',
          cwd: __dirname,
          shell: true
        });
        
        seedProcess.on('close', (code) => {
          if (code === 0) {
            console.log('✅ Seed выполнен успешно');
            resolve();
          } else {
            console.error('❌ Seed завершился с ошибкой, код:', code);
            // Не блокируем запуск сервера
            resolve();
          }
        });
        
        seedProcess.on('error', (error) => {
          console.error('❌ Ошибка при запуске seed:', error);
          resolve(); // Не блокируем запуск
        });
      });
    } else {
      console.log(`✅ База данных содержит ${userCount.count} пользователей`);
    }
  } catch (error) {
    console.error('❌ Ошибка при проверке базы данных:', error);
  }
}

// Запускаем проверку seed (не блокируем старт сервера)
checkAndSeed().then(() => {
  console.log('✅ Проверка seed завершена');
}).catch(err => {
  console.error('Ошибка seed:', err);
});

// Роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/subjects', subjectRoutes);

// Базовый роут
app.get('/api', (req, res) => {
  res.json({ message: 'Student Management System API' });
});

// Тестовый роут для проверки базы данных
app.get('/api/debug/users', (req, res) => {
  try {
    const db = getDatabase();
    const users = db.prepare('SELECT id, email, full_name, role FROM users LIMIT 10').all();
    res.json({ count: users.length, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📁 База данных: ${process.env.DB_PATH || './database.sqlite'}`);
});