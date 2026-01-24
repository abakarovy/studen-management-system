import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/groups
 * Получить список групп
 * - Преподаватель: только группы, где есть его дисциплины
 * - Куратор: все группы
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const currentUser = req.user;
    let groups;

    if (currentUser.role === 'teacher') {
      // Преподаватель видит только группы, где есть его дисциплины
      groups = db.prepare(`
        SELECT DISTINCT g.id, g.name, g.created_at,
               COUNT(DISTINCT u.id) as student_count
        FROM groups g
        JOIN users u ON u.group_id = g.id
        JOIN subjects s ON s.teacher_id = ?
        WHERE u.role = 'student'
        GROUP BY g.id, g.name, g.created_at
        ORDER BY g.name
      `).all(currentUser.id);
    } else if (currentUser.role === 'curator') {
      // Куратор видит все группы
      groups = db.prepare(`
        SELECT g.id, g.name, g.created_at,
               COUNT(DISTINCT u.id) as student_count
        FROM groups g
        LEFT JOIN users u ON u.group_id = g.id AND u.role = 'student'
        GROUP BY g.id, g.name, g.created_at
        ORDER BY g.name
      `).all();
    } else {
      // Студент видит только свою группу
      const user = db.prepare('SELECT group_id FROM users WHERE id = ?').get(currentUser.id);
      if (user && user.group_id) {
        groups = db.prepare(`
          SELECT g.id, g.name, g.created_at,
                 COUNT(DISTINCT u.id) as student_count
          FROM groups g
          LEFT JOIN users u ON u.group_id = g.id AND u.role = 'student'
          WHERE g.id = ?
          GROUP BY g.id, g.name, g.created_at
        `).all(user.group_id);
      } else {
        groups = [];
      }
    }

    res.json(groups);
  } catch (error) {
    console.error('Ошибка при получении групп:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET /api/groups/:id
 * Получить информацию о группе и список студентов
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const currentUser = req.user;

    // Проверка доступа для студентов
    if (currentUser.role === 'student') {
      const user = db.prepare('SELECT group_id FROM users WHERE id = ?').get(currentUser.id);
      if (!user || user.group_id !== groupId) {
        return res.status(403).json({ error: 'Недостаточно прав доступа' });
      }
    }

    const group = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    const students = db.prepare(`
      SELECT id, email, full_name, role, group_id, created_at
      FROM users
      WHERE group_id = ? AND role = 'student'
      ORDER BY full_name
    `).all(groupId);

    res.json({ ...group, students });
  } catch (error) {
    console.error('Ошибка при получении группы:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/groups
 * Создать новую группу (только для куратора)
 */
router.post('/', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    // Проверка на существующую группу
    const existing = db.prepare('SELECT id FROM groups WHERE name = ?').get(name);
    if (existing) {
      return res.status(400).json({ error: 'Группа с таким названием уже существует' });
    }

    const result = db.prepare('INSERT INTO groups (name) VALUES (?)').run(name);
    const newGroup = db.prepare('SELECT * FROM groups WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({ message: 'Группа создана', group: newGroup });
  } catch (error) {
    console.error('Ошибка при создании группы:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PUT /api/groups/:id
 * Обновить группу (только для куратора)
 */
router.put('/:id', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const groupId = parseInt(req.params.id);
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Название группы обязательно' });
    }

    const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Проверка на существующую группу с таким же именем
    const existing = db.prepare('SELECT id FROM groups WHERE name = ? AND id != ?').get(name, groupId);
    if (existing) {
      return res.status(400).json({ error: 'Группа с таким названием уже существует' });
    }

    db.prepare('UPDATE groups SET name = ? WHERE id = ?').run(name, groupId);
    const updatedGroup = db.prepare('SELECT * FROM groups WHERE id = ?').get(groupId);

    res.json({ message: 'Группа обновлена', group: updatedGroup });
  } catch (error) {
    console.error('Ошибка при обновлении группы:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/groups/:id
 * Удалить группу (только для куратора)
 */
router.delete('/:id', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const groupId = parseInt(req.params.id);

    const group = db.prepare('SELECT id FROM groups WHERE id = ?').get(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Группа не найдена' });
    }

    // Проверка на наличие студентов в группе
    const studentsCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE group_id = ?').get(groupId);
    if (studentsCount.count > 0) {
      return res.status(400).json({ error: 'Нельзя удалить группу, в которой есть студенты' });
    }

    db.prepare('DELETE FROM groups WHERE id = ?').run(groupId);

    res.json({ message: 'Группа удалена' });
  } catch (error) {
    console.error('Ошибка при удалении группы:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

