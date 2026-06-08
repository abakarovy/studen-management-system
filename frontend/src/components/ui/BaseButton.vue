<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[variants[variant], sizeClasses[size], block && 'w-full']"
    @click="$emit('click', $event)"
  >
    <component v-if="icon" :is="icon" class="h-4 w-4 shrink-0" />
    <slot />
  </button>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  icon: { type: [Object, Function], default: null },
  block: { type: Boolean, default: false },
})

defineEmits(['click'])

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
}

const sizeClasses = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: '',
  lg: 'px-5 py-3 text-base',
}
</script>
