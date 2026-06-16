/**
 * JWT secret — обязателен в production (Vercel, Render и т.д.)
 */
export function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim()

  if (secret) {
    return secret
  }

  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    throw new Error(
      'JWT_SECRET не задан. Добавьте переменную окружения JWT_SECRET в настройках Vercel (минимум 32 символа).'
    )
  }

  return 'dev-only-jwt-secret-min-32-characters!!'
}

export function assertRequiredEnv() {
  try {
    getJwtSecret()
  } catch (error) {
    console.error('❌', error.message)
  }
}
