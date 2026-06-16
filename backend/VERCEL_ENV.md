# Переменные окружения для Vercel (backend)

**Root Directory** в Vercel должен быть `backend` (или проект развёрнут только из папки backend).

В [Vercel Dashboard](https://vercel.com) → ваш проект → **Settings** → **Environment Variables** добавьте:

| Переменная   | Значение |
|--------------|----------|
| `JWT_SECRET` | Случайная строка **не короче 32 символов** (например: `studen-mgmt-jwt-secret-2026-change-me-xyz`) |
| `DB_PATH`    | `/tmp/database.sqlite` |
| `NODE_ENV`   | `production` (обычно выставляется Vercel автоматически) |

После добавления переменных нажмите **Redeploy** (Deployments → … → Redeploy).

Проверка после деплоя: `GET https://ваш-домен.vercel.app/api/health` — должен вернуть `{"ok":true,...}`.

## Ошибка `500 FUNCTION_INVOCATION_FAILED`

1. Убедитесь, что задан `JWT_SECRET` (см. выше).
2. Убедитесь, что **Root Directory** = `backend`.
3. После пуша в git сделайте **Redeploy**.
4. Откройте **Logs** в Vercel → Runtime Logs для деталей.

## Генерация JWT_SECRET (PowerShell)

```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 48 | ForEach-Object {[char]$_})
```

## Локальная разработка

Скопируйте `backend/.env.example` в `backend/.env` — там уже есть пример `JWT_SECRET`.

## Ошибка `secretOrPrivateKey must have a value`

Означает, что `JWT_SECRET` **не задан** в окружении Vercel. Добавьте переменную и перезапустите деплой.
