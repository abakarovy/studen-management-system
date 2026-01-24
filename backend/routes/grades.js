import express from 'express';
import { getDatabase } from '../config/database.js';
import { authenticateToken, checkRole } from '../middleware/auth.js';

const router = express.Router();
const db = getDatabase();

/**
 * GET /api/grades
 * Получить список оценок
 * - Студент: только свои оценки
 * - Преподаватель/Куратор: оценки студентов своей группы или выбранной группы
 */
router.get('/', authenticateToken, (req, res) => {
  try {
    const { student_id, group_id, subject_id } = req.query;
    const currentUser = req.user;

    let grades;

    if (currentUser.role === 'student') {
      // Студент видит только свои оценки
      grades = db.prepare(`
        SELECT g.*, s.name as subject_name, u.full_name as student_name, sub.teacher_id
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        JOIN users u ON g.student_id = u.id
        JOIN subjects sub ON g.subject_id = sub.id
        WHERE g.student_id = ?
        ORDER BY g.date DESC, g.created_at DESC
      `).all(currentUser.id);
    } else if (currentUser.role === 'teacher') {
      // Преподаватель видит оценки по своим дисциплинам
      if (group_id) {
        grades = db.prepare(`
          SELECT g.*, s.name as subject_name, u.full_name as student_name, sub.teacher_id
          FROM grades g
          JOIN subjects s ON g.subject_id = s.id
          JOIN users u ON g.student_id = u.id
          JOIN subjects sub ON g.subject_id = sub.id
          WHERE sub.teacher_id = ? AND u.group_id = ?
          ORDER BY g.date DESC, g.created_at DESC
        `).all(currentUser.id, group_id);
      } else {
        grades = db.prepare(`
          SELECT g.*, s.name as subject_name, u.full_name as student_name, sub.teacher_id
          FROM grades g
          JOIN subjects s ON g.subject_id = s.id
          JOIN users u ON g.student_id = u.id
          JOIN subjects sub ON g.subject_id = sub.id
          WHERE sub.teacher_id = ?
          ORDER BY g.date DESC, g.created_at DESC
        `).all(currentUser.id);
      }
    } else {
      // Куратор видит все оценки
      let query = `
        SELECT g.*, s.name as subject_name, u.full_name as student_name, sub.teacher_id
        FROM grades g
        JOIN subjects s ON g.subject_id = s.id
        JOIN users u ON g.student_id = u.id
        JOIN subjects sub ON g.subject_id = sub.id
        WHERE 1=1
      `;
      const params = [];

      if (student_id) {
        query += ' AND g.student_id = ?';
        params.push(student_id);
      }
      if (group_id) {
        query += ' AND u.group_id = ?';
        params.push(group_id);
      }
      if (subject_id) {
        query += ' AND g.subject_id = ?';
        params.push(subject_id);
      }

      query += ' ORDER BY g.date DESC, g.created_at DESC';
      grades = db.prepare(query).all(...params);
    }

    res.json(grades);
  } catch (error) {
    console.error('Ошибка при получении оценок:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * POST /api/grades
 * Добавить оценку (преподаватель и куратор)
 */
router.post('/', authenticateToken, checkRole(['teacher', 'curator']), (req, res) => {
  try {
    const { student_id, subject_id, grade, work_type, date } = req.body;
    const currentUser = req.user;

    if (!student_id || !subject_id || !grade || !work_type || !date) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (grade < 1 || grade > 5) {
      return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' });
    }

    // Проверка, что студент существует
    const student = db.prepare('SELECT id, group_id FROM users WHERE id = ? AND role = ?').get(student_id, 'student');
    if (!student) {
      return res.status(404).json({ error: 'Студент не найден' });
    }

    // Проверка, что дисциплина существует
    const subject = db.prepare('SELECT id, teacher_id FROM subjects WHERE id = ?').get(subject_id);
    if (!subject) {
      return res.status(404).json({ error: 'Дисциплина не найдена' });
    }

    // Преподаватель может добавлять оценки только по своим дисциплинам
    if (currentUser.role === 'teacher' && subject.teacher_id !== currentUser.id) {
      return res.status(403).json({ error: 'Вы не можете добавлять оценки по этой дисциплине' });
    }

    const result = db.prepare(`
      INSERT INTO grades (student_id, subject_id, grade, work_type, date)
      VALUES (?, ?, ?, ?, ?)
    `).run(student_id, subject_id, grade, work_type, date);

    const newGrade = db.prepare(`
      SELECT g.*, s.name as subject_name, u.full_name as student_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN users u ON g.student_id = u.id
      WHERE g.id = ?
    `).get(result.lastInsertRowid);

    res.status(201).json({ message: 'Оценка добавлена', grade: newGrade });
  } catch (error) {
    console.error('Ошибка при добавлении оценки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * PUT /api/grades/:id
 * Обновить оценку (преподаватель и куратор)
 */
router.put('/:id', authenticateToken, checkRole(['teacher', 'curator']), (req, res) => {
  try {
    const gradeId = parseInt(req.params.id);
    const { grade, work_type, date } = req.body;
    const currentUser = req.user;

    // Получаем текущую оценку
    const currentGrade = db.prepare(`
      SELECT g.*, s.teacher_id
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `).get(gradeId);

    if (!currentGrade) {
      return res.status(404).json({ error: 'Оценка не найдена' });
    }

    // Преподаватель может обновлять только оценки по своим дисциплинам
    if (currentUser.role === 'teacher' && currentGrade.teacher_id !== currentUser.id) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    const updateFields = [];
    const updateValues = [];

    if (grade !== undefined) {
      if (grade < 1 || grade > 5) {
        return res.status(400).json({ error: 'Оценка должна быть от 1 до 5' });
      }
      updateFields.push('grade = ?');
      updateValues.push(grade);
    }
    if (work_type) {
      updateFields.push('work_type = ?');
      updateValues.push(work_type);
    }
    if (date) {
      updateFields.push('date = ?');
      updateValues.push(date);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }

    updateValues.push(gradeId);
    const sql = `UPDATE grades SET ${updateFields.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...updateValues);

    const updatedGrade = db.prepare(`
      SELECT g.*, s.name as subject_name, u.full_name as student_name
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      JOIN users u ON g.student_id = u.id
      WHERE g.id = ?
    `).get(gradeId);

    res.json({ message: 'Оценка обновлена', grade: updatedGrade });
  } catch (error) {
    console.error('Ошибка при обновлении оценки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

/**
 * DELETE /api/grades/:id
 * Удалить оценку (преподаватель и куратор)
 */
router.delete('/:id', authenticateToken, checkRole(['teacher', 'curator']), (req, res) => {
  try {
    const gradeId = parseInt(req.params.id);
    const currentUser = req.user;

    // Получаем текущую оценку
    const currentGrade = db.prepare(`
      SELECT g.*, s.teacher_id
      FROM grades g
      JOIN subjects s ON g.subject_id = s.id
      WHERE g.id = ?
    `).get(gradeId);

    if (!currentGrade) {
      return res.status(404).json({ error: 'Оценка не найдена' });
    }

    // Преподаватель может удалять только оценки по своим дисциплинам
    if (currentUser.role === 'teacher' && currentGrade.teacher_id !== currentUser.id) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    db.prepare('DELETE FROM grades WHERE id = ?').run(gradeId);

    res.json({ message: 'Оценка удалена' });
  } catch (error) {
    console.error('Ошибка при удалении оценки:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

export default router;

