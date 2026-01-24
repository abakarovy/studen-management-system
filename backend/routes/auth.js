import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../config/database.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

/**
 * POST /api/auth/login
 * Вход в систему
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

    if (!user) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Убираем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/auth/register
 * Регистрация (только для куратора)
 */
router.post('/register', authenticateToken, checkRole(['curator']), async (req, res) => {
  try {
    const { email, password, full_name, role, group_id } = req.body;

    if (!email || !password || !full_name || !role) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (!['student', 'teacher', 'curator'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }

    // Проверка существующего пользователя
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Вставка пользователя
    const result = db.prepare(`
      INSERT INTO users (email, password, full_name, role, group_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(email, hashedPassword, full_name, role, group_id || null);

    const newUser = db.prepare('SELECT id, email, full_name, role, group_id, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Пользователь создан', user: newUser });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET /api/auth/me
 * Получить информацию о текущем пользователе
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.role, u.group_id, u.created_at, g.name as group_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = ?
    `).get(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

