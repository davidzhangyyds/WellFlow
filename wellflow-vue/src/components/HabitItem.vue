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
      <div class="habit-sub">{{ displaySubtext }}</div>
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

// Extract and format the scheduled time (HH:MM)
const displaySubtext = computed(() => {
  // If there's custom sub text, use that
  if (props.task.sub) return props.task.sub
  
  // If there's a scheduled time, extract HH:MM
  if (props.task.scheduled_time) {
    const time = props.task.scheduled_time.slice(11, 16) // Extract HH:MM from "YYYY-MM-DD HH:MM:SS"
    return time || fmtDate(props.task.createdAt)
  }
  
  // Fallback to creation date
  return fmtDate(props.task.createdAt)
})
</script>
