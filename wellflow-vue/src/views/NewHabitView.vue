<template>
  <div class="app-shell">
    <NavBar />
    <main class="content">

      <div class="page-header anim-1">
        <RouterLink to="/dashboard" class="back-btn">←</RouterLink>
        <div class="page-title">New Habit</div>
      </div>

      <form @submit.prevent="submitHabit" novalidate>

        <!-- Task name -->
        <div class="form-section anim-2">
          <div class="form-section-title">Task Name</div>
          <div class="task-name-wrap">
            <span class="task-emoji-preview">{{ selectedIcon }}</span>
            <input v-model="form.title" type="text" class="task-name-input"
              placeholder="e.g. Evening Yoga" autocomplete="off" />
          </div>
          <div v-if="errors.title" class="error-msg">{{ errors.title }}</div>
        </div>

        <!-- Category -->
        <div class="form-section anim-3">
          <div class="form-section-title">Category</div>
          <div class="category-grid">
            <div v-for="cat in categories" :key="cat.value"
              class="cat-chip" :class="{ selected: form.category === cat.value }"
              @click="selectCat(cat)">
              <span class="cat-emoji">{{ cat.icon }}</span>{{ cat.label }}
            </div>
          </div>
        </div>

        <!-- Time -->
        <div class="form-section anim-4">
          <div class="form-section-title">Scheduled Time</div>
          <div class="input-wrap">
            <span class="icon">⏰</span>
            <input v-model="form.time" type="time" />
          </div>
        </div>

        <!-- Description -->
        <div class="form-section anim-4">
          <div class="form-section-title">
            Description <span style="color:var(--text-faint);font-size:.7rem;letter-spacing:0">(optional)</span>
          </div>
          <div class="input-wrap">
            <span class="icon" style="top:14px;align-self:flex-start;">📝</span>
            <textarea v-model="form.description" class="no-icon" style="padding-left:42px;"
              placeholder="Notes, duration, frequency…"></textarea>
          </div>
        </div>

        <!-- Initial status -->
        <div class="form-section anim-5">
          <div class="form-section-title">Initial Status</div>
          <div class="status-toggle">
            <button v-for="s in statuses" :key="s.value" type="button"
              class="status-btn" :class="{ ['active-' + s.value]: form.status === s.value }"
              @click="form.status = s.value">
              {{ s.label }}
            </button>
          </div>
        </div>

        <!-- Live preview -->
        <div class="form-section anim-5">
          <div class="form-section-title">Preview</div>
          <div class="preview-card">
            <div class="preview-icon">{{ selectedIcon }}</div>
            <div class="preview-details">
              <div class="preview-title">{{ form.title || 'Your habit name' }}</div>
              <div class="preview-sub">
                {{ form.description ? `${form.time} · ${form.description.substring(0,30)}` : form.time }}
              </div>
            </div>
            <span class="badge" :class="'badge-' + form.status">
              {{ form.status === 'done' ? '✓ Done' : form.status === 'doing' ? '↻ Doing' : 'To Do' }}
            </span>
          </div>
        </div>

        <!-- Submit -->
        <div class="submit-area anim-6">
          <button type="submit" class="btn btn-primary btn-full">+ Add Habit</button>
        </div>

      </form>
    </main>
    <TabBar />
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useToastStore } from '@/stores/toast'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'

const router     = useRouter()
const taskStore  = useTasksStore()
const toastStore = useToastStore()

const form = reactive({
  title:       '',
  category:    'sport',
  time:        '08:00',
  description: '',
  status:      'todo',
})

const errors = reactive({ title: '' })

const categories = [
  { value: 'sport',     icon: '🏃', label: 'Sport'     },
  { value: 'mental',    icon: '🧘', label: 'Mental'    },
  { value: 'hydration', icon: '💧', label: 'Hydration' },
  { value: 'sleep',     icon: '😴', label: 'Sleep'     },
  { value: 'nutrition', icon: '🥗', label: 'Nutrition' },
  { value: 'break',     icon: '📵', label: 'Break'     },
]

const statuses = [
  { value: 'todo',  label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'done',  label: 'Done'  },
]

const selectedIcon = computed(() =>
  categories.find(c => c.value === form.category)?.icon || '📌'
)

function selectCat(cat) {
  form.category = cat.value
}

async function submitHabit() {
  errors.title = ''
  if (!form.title.trim()) { errors.title = 'Please enter a task name.'; return }

  try {
    await taskStore.addTask({
      title:           form.title.trim(),
      description:     form.description,
      status:          form.status,
      scheduled_time:  form.time,
    })

    toastStore.show('Habit added! 🌱')
    setTimeout(() => router.push('/dashboard'), 700)
  } catch (error) {
    console.error('Error creating task:', error)
    toastStore.show('❌ Failed to add habit')
  }
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.8rem; }
.back-btn { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; text-decoration: none; flex-shrink: 0; }
.back-btn:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
.page-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; }

.form-section { margin-bottom: 1.6rem; }
.form-section-title { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 10px; }

.task-name-wrap { position: relative; display: flex; align-items: center; }
.task-emoji-preview { position: absolute; left: 14px; font-size: 1.1rem; pointer-events: none; z-index: 1; }
.task-name-input { padding-left: 42px !important; width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-body); font-size: 0.95rem; padding: 12px 14px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
.task-name-input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(0,230,118,0.08); }

input[type="time"] { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-body); font-size: 0.95rem; padding: 12px 14px 12px 42px; outline: none; transition: border-color 0.2s; }
input[type="time"]:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(0,230,118,0.08); }
input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); cursor: pointer; }
textarea { resize: vertical; min-height: 80px; padding: 12px 14px !important; }

.preview-card { background: rgba(0,230,118,0.04); border: 1px solid rgba(0,230,118,0.15); border-radius: var(--radius-md); padding: 1rem 1.2rem; display: flex; align-items: center; gap: 12px; margin-bottom: 1rem; }
.preview-icon { font-size: 1.8rem; }
.preview-details { flex: 1; }
.preview-title { font-weight: 600; font-size: 0.95rem; }
.preview-sub { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }

.submit-area { margin-top: 2rem; }
.error-msg { color: #ff8080; font-size: 0.82rem; margin-top: 6px; }
</style>
