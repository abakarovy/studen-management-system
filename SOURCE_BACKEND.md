# Исходный код — Backend

Полный дамп исходного кода бэкенда (Express + SQLite). Файл `package-lock.json` не включён.

## Список файлов

- `backend/config/database.js`
- `backend/middleware/auth.js`
- `backend/package.json`
- `backend/routes/auth.js`
- `backend/routes/grades.js`
- `backend/routes/groups.js`
- `backend/routes/subjects.js`
- `backend/routes/users.js`
- `backend/scripts/seed.js`
- `backend/server.js`

---

## `backend/config/database.js`

```javascript
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DB_PATH || join(__dirname, '../database.sqlite');
let db = null;

/**
 * Инициализация базы данных и создание таблиц
 */
export function initDatabase() {
  db = new Database(dbPath);
  
  // Включаем foreign keys
  db.pragma('foreign_keys = ON');

  // Создание таблиц
  createTables();
  
  console.log('База данных инициализирована:', dbPath);
  return db;
}

/**
 * Получить экземпляр базы данных
 */
export function getDatabase() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

/**
 * Создание всех необходимых таблиц
 */
function createTables() {
  // Таблица пользователей
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'curator')),
      group_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
    )
  `);

  // Таблица групп
  db.exec(`
    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Таблица дисциплин
  db.exec(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Таблица оценок
  db.exec(`
    CREATE TABLE IF NOT EXISTS grades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      subject_id INTEGER NOT NULL,
      grade INTEGER NOT NULL CHECK(grade >= 1 AND grade <= 5),
      work_type TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  // Индексы для оптимизации
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_group ON users(group_id);
    CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
    CREATE INDEX IF NOT EXISTS idx_grades_subject ON grades(subject_id);
    CREATE INDEX IF NOT EXISTS idx_subjects_teacher ON subjects(teacher_id);
  `);
}

```

## `backend/middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';

/**
 * Middleware для проверки JWT токена
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа отсутствует' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
}

/**
 * Middleware для проверки роли пользователя
 * @param {string[]} allowedRoles - Массив разрешенных ролей
 */
export function checkRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Пользователь не аутентифицирован' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав доступа' });
    }

    next();
  };
}

```

## `backend/package.json`

```json
{
  "name": "student-management-backend",
  "version": "1.0.0",
  "description": "Backend для системы учета студентов",
  "main": "server.js",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node scripts/seed.js",
    "postinstall": "npm run seed || true"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.2.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}

```

## `backend/routes/auth.js`

```javascript
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

```

## `backend/routes/grades.js`

```javascript
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

```

## `backend/routes/groups.js`

```javascript
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

```

## `backend/routes/subjects.js`

```javascript
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

```

## `backend/routes/users.js`

```javascript
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

```

## `backend/scripts/seed.js`

```javascript
import bcrypt from 'bcryptjs';
import { initDatabase, getDatabase } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Скрипт для заполнения базы данных тестовыми данными
 */
async function seed() {
  console.log('Начало заполнения базы данных...');
  
  const db = initDatabase();

  try {
    // Очистка существующих данных (опционально, закомментируйте если нужно сохранить данные)
    // db.exec('DELETE FROM grades');
    // db.exec('DELETE FROM subjects');
    // db.exec('DELETE FROM users WHERE role != "curator"');
    // db.exec('DELETE FROM groups');

    // 1. Создание куратора
    const curatorPassword = await bcrypt.hash('curator123', 10);
    let curator = db.prepare('SELECT id FROM users WHERE email = ?').get('curator@example.com');
    
    if (!curator) {
      const curatorResult = db.prepare(`
        INSERT INTO users (email, password, full_name, role)
        VALUES (?, ?, ?, ?)
      `).run('curator@example.com', curatorPassword, 'Иванов Иван Иванович', 'curator');
      curator = { id: curatorResult.lastInsertRowid };
      console.log('✓ Куратор создан');
    } else {
      console.log('✓ Куратор уже существует');
    }

    // 2. Создание групп
    const groups = [];
    const groupNames = ['ИТ-21', 'ИТ-22'];
    
    for (const name of groupNames) {
      let group = db.prepare('SELECT id FROM groups WHERE name = ?').get(name);
      if (!group) {
        const result = db.prepare('INSERT INTO groups (name) VALUES (?)').run(name);
        groups.push({ id: result.lastInsertRowid, name });
        console.log(`✓ Группа ${name} создана`);
      } else {
        groups.push(group);
        console.log(`✓ Группа ${name} уже существует`);
      }
    }

    // 3. Создание преподавателей
    const teachers = [];
    const teacherData = [
      { email: 'teacher1@example.com', name: 'Петров Петр Петрович' },
      { email: 'teacher2@example.com', name: 'Сидорова Сидора Сидоровна' }
    ];

    for (const teacher of teacherData) {
      let existingTeacher = db.prepare('SELECT id FROM users WHERE email = ?').get(teacher.email);
      if (!existingTeacher) {
        const password = await bcrypt.hash('teacher123', 10);
        const result = db.prepare(`
          INSERT INTO users (email, password, full_name, role)
          VALUES (?, ?, ?, ?)
        `).run(teacher.email, password, teacher.name, 'teacher');
        teachers.push({ id: result.lastInsertRowid, ...teacher });
        console.log(`✓ Преподаватель ${teacher.name} создан`);
      } else {
        teachers.push({ id: existingTeacher.id, ...teacher });
        console.log(`✓ Преподаватель ${teacher.name} уже существует`);
      }
    }

    // 4. Создание студентов
    const students = [];
    const studentData = [
      { email: 'student1@example.com', name: 'Студентова Анна Сергеевна', group: groups[0] },
      { email: 'student2@example.com', name: 'Учеников Дмитрий Владимирович', group: groups[0] },
      { email: 'student3@example.com', name: 'Оценкин Максим Александрович', group: groups[0] },
      { email: 'student4@example.com', name: 'Умнов Игорь Петрович', group: groups[0] },
      { email: 'student5@example.com', name: 'Отличников Павел Дмитриевич', group: groups[0] },
      { email: 'student6@example.com', name: 'Хорошилова Елена Викторовна', group: groups[1] },
      { email: 'student7@example.com', name: 'Средняков Андрей Игоревич', group: groups[1] },
      { email: 'student8@example.com', name: 'Троечников Сергей Николаевич', group: groups[1] },
      { email: 'student9@example.com', name: 'Двоечников Олег Олегович', group: groups[1] },
      { email: 'student10@example.com', name: 'Пятерочкина Мария Сергеевна', group: groups[1] }
    ];

    for (const student of studentData) {
      let existingStudent = db.prepare('SELECT id FROM users WHERE email = ?').get(student.email);
      if (!existingStudent) {
        const password = await bcrypt.hash('student123', 10);
        const result = db.prepare(`
          INSERT INTO users (email, password, full_name, role, group_id)
          VALUES (?, ?, ?, ?, ?)
        `).run(student.email, password, student.name, 'student', student.group.id);
        students.push({ id: result.lastInsertRowid, ...student });
        console.log(`✓ Студент ${student.name} создан`);
      } else {
        students.push({ id: existingStudent.id, ...student });
        console.log(`✓ Студент ${student.name} уже существует`);
      }
    }

    // 5. Создание дисциплин
    const subjects = [];
    const subjectData = [
      { name: 'Математика', teacher: teachers[0] },
      { name: 'Программирование', teacher: teachers[0] },
      { name: 'Базы данных', teacher: teachers[1] },
      { name: 'Веб-разработка', teacher: teachers[1] }
    ];

    for (const subject of subjectData) {
      let existingSubject = db.prepare('SELECT id FROM subjects WHERE name = ? AND teacher_id = ?').get(subject.name, subject.teacher.id);
      if (!existingSubject) {
        const result = db.prepare('INSERT INTO subjects (name, teacher_id) VALUES (?, ?)').run(subject.name, subject.teacher.id);
        subjects.push({ id: result.lastInsertRowid, ...subject });
        console.log(`✓ Дисциплина ${subject.name} создана`);
      } else {
        subjects.push({ id: existingSubject.id, ...subject });
        console.log(`✓ Дисциплина ${subject.name} уже существует`);
      }
    }

    // 6. Создание оценок
    const workTypes = ['Лекция', 'Практика', 'Лабораторная', 'Экзамен', 'Зачет'];
    let gradesCount = 0;

    for (const student of students) {
      // Для каждого студента создаем по 2-3 оценки по каждой дисциплине
      for (const subject of subjects) {
        const numGrades = Math.floor(Math.random() * 2) + 2; // 2-3 оценки
        
        for (let i = 0; i < numGrades; i++) {
          const grade = Math.floor(Math.random() * 3) + 3; // Оценки от 3 до 5
          const workType = workTypes[Math.floor(Math.random() * workTypes.length)];
          const date = new Date(2026, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
            .toISOString().split('T')[0];

          try {
            db.prepare(`
              INSERT INTO grades (student_id, subject_id, grade, work_type, date)
              VALUES (?, ?, ?, ?, ?)
            `).run(student.id, subject.id, grade, workType, date);
            gradesCount++;
          } catch (error) {
            // Игнорируем ошибки дублирования
          }
        }
      }
    }

    console.log(`✓ Создано ${gradesCount} оценок`);

    console.log('\n✅ База данных успешно заполнена!');
    console.log('\nТестовые учетные данные:');
    console.log('Куратор: curator@example.com / curator123');
    console.log('Преподаватель 1: teacher1@example.com / teacher123');
    console.log('Преподаватель 2: teacher2@example.com / teacher123');
    console.log('Студент 1: student1@example.com / student123');
    console.log('Студент 2: student2@example.com / student123');
    console.log('... и так далее для всех студентов');

  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1);
  } finally {
    db.close();
  }
}

seed();

```

## `backend/server.js`

```javascript
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
```

