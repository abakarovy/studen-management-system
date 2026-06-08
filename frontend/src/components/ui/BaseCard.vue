<template>
  <div :class="['card p-5 sm:p-6', hover && 'card-hover cursor-default', className]">
    <slot />
  </div>
</template>

<script setup>
defineProps({
  hover: { type: Boolean, default: false },
  className: { type: String, default: '' },
})
</script>
