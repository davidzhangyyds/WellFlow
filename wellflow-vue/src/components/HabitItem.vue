<template>
  <div class="habit-item" @click="$emit('cycle', task.id)">
    <div class="check-circle" :class="{ done: task.status === 'done' }">
      {{ task.status === 'done' ? '✓' : '' }}
    </div>
    <div class="habit-icon" :class="catMeta.cls">
      {{ task.icon || catMeta.icon }}
    </div>
    <div class="habit-info">
      <div class="habit-title" :style="task.status === 'done' ? 'text-decoration:line-through;opacity:.6' : ''">
        {{ task.title }}
      </div>
      <div class="habit-sub">{{ task.sub || fmtDate(task.createdAt) }}</div>
    </div>
    <span class="badge" :class="badgeClass">{{ badgeLabel }}</span>
    <slot name="actions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useGreeting } from '@/composables/useGreeting'

const props = defineProps({
  task: { type: Object, required: true }
})

defineEmits(['cycle'])

const { fmtDate, CAT_META } = useGreeting()

const catMeta   = computed(() => CAT_META[props.task.category] || { icon: '📌', cls: '' })
const badgeClass = computed(() => ({
  done:  'badge-done',
  doing: 'badge-doing',
  todo:  'badge-todo'
}[props.task.status]))
const badgeLabel = computed(() => ({
  done:  '✓ Done',
  doing: '↻ Doing',
  todo:  'To Do'
}[props.task.status]))
</script>
