<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto"
        @click.self="close"
      >
        <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" @click="close" />
        <div
          class="relative w-full animate-fade-in card shadow-2xl"
          :class="sizeClasses[size]"
          role="dialog"
        >
          <div v-if="title" class="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white">{{ title }}</h3>
            <button type="button" class="btn-ghost p-2 rounded-lg" @click="close">
              <X class="h-4 w-4" />
            </button>
          </div>
          <div class="p-6">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { X } from 'lucide-vue-next'

defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  size: { type: String, default: 'md' },
})

const emit = defineEmits(['update:modelValue'])

const sizeClasses = {
  sm: 'max-w-md mt-16',
  md: 'max-w-lg mt-16',
  lg: 'max-w-2xl mt-12',
  xl: 'max-w-4xl mt-8',
}

function close() {
  emit('update:modelValue', false)
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
