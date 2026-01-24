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
          const date = new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
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

