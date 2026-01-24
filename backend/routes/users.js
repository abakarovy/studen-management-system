import express from 'express';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../config/database.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/users
 * Получить список пользователей (только для куратора)
 */
router.get('/', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const users = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.role, u.group_id, u.created_at, g.name as group_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      ORDER BY u.created_at DESC
    `).all();

    res.json(users);
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET /api/users/:id
 * Получить информацию о пользователе
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;

    // Студенты могут видеть только свой профиль
    if (currentUser.role === 'student' && currentUser.id !== userId) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    const user = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.role, u.group_id, u.created_at, g.name as group_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = ?
    `).get(userId);

    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('Ошибка при получении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PUT /api/users/:id
 * Обновить информацию о пользователе
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const currentUser = req.user;
    const { full_name, email, password, group_id } = req.body;

    // Студенты могут обновлять только свой профиль и только имя
    if (currentUser.role === 'student') {
      if (currentUser.id !== userId) {
        return res.status(403).json({ error: 'Недостаточно прав доступа' });
      }
      
      if (password || email || group_id) {
        return res.status(403).json({ error: 'Студенты могут изменять только ФИО' });
      }

      if (full_name) {
        db.prepare('UPDATE users SET full_name = ? WHERE id = ?').run(full_name, userId);
        const updatedUser = db.prepare(`
          SELECT u.id, u.email, u.full_name, u.role, u.group_id, u.created_at, g.name as group_name
          FROM users u
          LEFT JOIN groups g ON u.group_id = g.id
          WHERE u.id = ?
        `).get(userId);
        return res.json({ message: 'Профиль обновлен', user: updatedUser });
      }
    }

    // Куратор может обновлять любые данные
    if (currentUser.role !== 'curator') {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    const updateFields = [];
    const updateValues = [];

    if (full_name) {
      updateFields.push('full_name = ?');
      updateValues.push(full_name);
    }
    if (email) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (group_id !== undefined) {
      updateFields.push('group_id = ?');
      updateValues.push(group_id);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.push('password = ?');
      updateValues.push(hashedPassword);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updateValues.push(userId);
    const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);

    const updatedUser = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.role, u.group_id, u.created_at, g.name as group_name
      FROM users u
      LEFT JOIN groups g ON u.group_id = g.id
      WHERE u.id = ?
    `).get(userId);

    res.json({ message: 'Пользователь обновлен', user: updatedUser });
  } catch (error) {
    console.error('Ошибка при обновлении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/users/:id
 * Удалить пользователя (только для куратора)
 */
router.delete('/:id', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Нельзя удалить самого себя' });
    }

    const result = db.prepare('DELETE FROM users WHERE id = ?').run(userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ message: 'Пользователь удален' });
  } catch (error) {
    console.error('Ошибка при удалении пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

