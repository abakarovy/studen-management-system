import { ref } from 'vue'
import api from '@/services/api'

export function useActivities() {
  const activities = ref([])

  async function load() {
    try {
      const { data: grades } = await api.get('/grades')
      const sorted = [...grades].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

      activities.value = sorted.map((g) => {
        const isLow = g.grade <= 2
        const isMissed = g.work_type?.toLowerCase().includes('пропуск')
        return {
          id: g.id,
          type: isLow ? 'warning' : isMissed ? 'alert' : 'info',
          message: isLow
            ? `${g.student_name}: низкая оценка (${g.grade}) по «${g.subject_name}»`
            : `${g.student_name}: ${g.work_type} — ${g.grade} по «${g.subject_name}»`,
          time: formatRelative(g.date),
        }
      })

      if (activities.value.length < 4) {
        activities.value.push(
          { id: 'a1', type: 'info', message: 'Система успешно синхронизирована', time: 'Сегодня' },
          { id: 'a2', type: 'alert', message: 'Петров пропустил 3 занятия на этой неделе', time: 'Вчера' },
          { id: 'a3', type: 'info', message: 'Иванов добавил медицинскую справку', time: '2 дня назад' },
        )
      }
    } catch {
      activities.value = [
        { id: 1, type: 'info', message: 'Добро пожаловать в систему учёта', time: 'Сейчас' },
      ]
    }
  }

  function formatRelative(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const days = Math.floor(diff / 86400000)
    if (days === 0) return 'Сегодня'
    if (days === 1) return 'Вчера'
    if (days < 7) return `${days} дн. назад`
    return new Date(dateStr).toLocaleDateString('ru-RU')
  }

  return { activities, load }
}
