# Инструкция по деплою на Vercel

## Важные настройки при деплое:

### 1. Root Directory
При подключении репозитория в Vercel, обязательно укажите:
- **Root Directory:** `frontend`

### 2. Build Settings
Vercel должен автоматически определить:
- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Environment Variables
Добавьте в настройках проекта Vercel:
- `VITE_API_URL` = `https://ваш-backend-url.railway.app/api` (или другой URL вашего backend)

### 4. Если возникают ошибки:

#### Ошибка: "Cannot find module"
Убедитесь, что все зависимости в `package.json` указаны правильно.

#### Ошибка: "Build failed"
Проверьте, что:
- Node.js версия 18+ (в Vercel настройках)
- Все devDependencies установлены (Vite должен быть в devDependencies)

#### Ошибка: "404 на всех страницах кроме главной"
Убедитесь, что `vercel.json` содержит правильные rewrites для SPA.

#### Ошибка: "API requests fail"
Проверьте переменную окружения `VITE_API_URL` и убедитесь, что backend доступен и CORS настроен правильно.

## Быстрый деплой через CLI:

```bash
cd frontend
npm i -g vercel
vercel
```

Следуйте инструкциям в терминале.

