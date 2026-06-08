<template>
  <div
    :class="[
      'flex items-center justify-center rounded-full font-semibold text-white shrink-0',
      sizeClasses[size],
      colorClass,
    ]"
  >
    {{ initials }}
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getInitials, getAvatarColor } from '@/utils/avatar'

const props = defineProps({
  name: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const initials = computed(() => getInitials(props.name))
const colorClass = computed(() => getAvatarColor(props.name))
</script>
