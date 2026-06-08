import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const stored = localStorage.getItem('theme')
  const isDark = ref(stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches))

  function applyTheme() {
    document.documentElement.classList.toggle('dark', isDark.value)
  }

  function toggle() {
    isDark.value = !isDark.value
  }

  function setDark(value) {
    isDark.value = value
  }

  watch(isDark, (val) => {
    localStorage.setItem('theme', val ? 'dark' : 'light')
    applyTheme()
  }, { immediate: true })

  return { isDark, toggle, setDark, applyTheme }
})
