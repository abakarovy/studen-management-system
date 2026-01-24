import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/subjects
 * Получить список дисциплин
 * - Студент: все дисциплины
 * - Преподаватель: только свои дисциплины
 * - Куратор: все дисциплины
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const currentUser = req.user;
    let subjects;

    if (currentUser.role === 'teacher') {
      subjects = db.prepare(`
        SELECT s.*, u.full_name as teacher_name
        FROM subjects s
        JOIN users u ON s.teacher_id = u.id
        WHERE s.teacher_id = ?
        ORDER BY s.name
      `).all(currentUser.id);
    } else {
      subjects = db.prepare(`
        SELECT s.*, u.full_name as teacher_name
        FROM subjects s
        JOIN users u ON s.teacher_id = u.id
        ORDER BY s.name
      `).all();
    }

    res.json(subjects);
  } catch (error) {
    console.error('Ошибка при получении дисциплин:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * GET /api/subjects/:id
 * Получить информацию о дисциплине
 */
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);

    const subject = db.prepare(`
      SELECT s.*, u.full_name as teacher_name
      FROM subjects s
      JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `).get(subjectId);

    if (!subject) {
      return res.status(404).json({ error: 'Дисциплина не найдена' });
    }

    res.json(subject);
  } catch (error) {
    console.error('Ошибка при получении дисциплины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/subjects
 * Создать новую дисциплину (только для куратора)
 */
router.post('/', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const { name, teacher_id } = req.body;

    if (!name || !teacher_id) {
      return res.status(400).json({ error: 'Название и преподаватель обязательны' });
    }

    // Проверка, что преподаватель существует и имеет роль teacher
    const teacher = db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacher_id);
    if (!teacher) {
      return res.status(404).json({ error: 'Преподаватель не найден' });
    }
    if (teacher.role !== 'teacher') {
      return res.status(400).json({ error: 'Пользователь не является преподавателем' });
    }

    const result = db.prepare('INSERT INTO subjects (name, teacher_id) VALUES (?, ?)').run(name, teacher_id);
    const newSubject = db.prepare(`
      SELECT s.*, u.full_name as teacher_name
      FROM subjects s
      JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Дисциплина создана', subject: newSubject });
  } catch (error) {
    console.error('Ошибка при создании дисциплины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PUT /api/subjects/:id
 * Обновить дисциплину (только для куратора)
 */
router.put('/:id', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);
    const { name, teacher_id } = req.body;

    const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Дисциплина не найдена' });
    }

    const updateFields = [];
    const updateValues = [];

    if (name) {
      updateFields.push('name = ?');
      updateValues.push(name);
    }
    if (teacher_id) {
      // Проверка, что преподаватель существует и имеет роль teacher
      const teacher = db.prepare('SELECT id, role FROM users WHERE id = ?').get(teacher_id);
      if (!teacher) {
        return res.status(404).json({ error: 'Преподаватель не найден' });
      }
      if (teacher.role !== 'teacher') {
        return res.status(400).json({ error: 'Пользователь не является преподавателем' });
      }
      updateFields.push('teacher_id = ?');
      updateValues.push(teacher_id);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updateValues.push(subjectId);
    const sql = `UPDATE subjects SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);

    const updatedSubject = db.prepare(`
      SELECT s.*, u.full_name as teacher_name
      FROM subjects s
      JOIN users u ON s.teacher_id = u.id
      WHERE s.id = ?
    `).get(subjectId);

    res.json({ message: 'Дисциплина обновлена', subject: updatedSubject });
  } catch (error) {
    console.error('Ошибка при обновлении дисциплины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/subjects/:id
 * Удалить дисциплину (только для куратора)
 */
router.delete('/:id', authenticateToken, checkRole(['curator']), (req, res) => {
  try {
    const subjectId = parseInt(req.params.id);

    const subject = db.prepare('SELECT id FROM subjects WHERE id = ?').get(subjectId);
    if (!subject) {
      return res.status(404).json({ error: 'Дисциплина не найдена' });
    }

    // Проверка на наличие оценок по дисциплине
    const gradesCount = db.prepare('SELECT COUNT(*) as count FROM grades WHERE subject_id = ?').get(subjectId);
    if (gradesCount.count > 0) {
      return res.status(400).json({ error: 'Нельзя удалить дисциплину, по которой есть оценки' });
    }

    db.prepare('DELETE FROM subjects WHERE id = ?').run(subjectId);

    res.json({ message: 'Дисциплина удалена' });
  } catch (error) {
    console.error('Ошибка при удалении дисциплины:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

