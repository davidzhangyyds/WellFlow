<template>
  <div class="app-shell">
    <NavBar>
      <template #actions>
        <RouterLink to="/habits/new" class="btn btn-ghost btn-sm">+ Add</RouterLink>
      </template>
    </NavBar>

    <main class="content">

      <!-- Greeting -->
      <div class="greeting-row anim-1">
        <div>
          <div class="greeting-sub">{{ greetingText }},</div>
          <div class="greeting-name">{{ authStore.username }} <span>✦</span></div>
        </div>
      </div>

      <!-- Progress card -->
      <div class="card progress-card anim-2">
        <div class="progress-ring-wrap">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="var(--cyan)" />
                <stop offset="100%" stop-color="var(--green)" />
              </linearGradient>
            </defs>
            <circle class="progress-ring-track" cx="40" cy="40" r="35" />
            <circle class="progress-ring-fill" cx="40" cy="40" r="35"
              :style="{ strokeDashoffset: ringOffset }" />
          </svg>
          <div class="progress-ring-label">{{ taskStore.stats.pct }}%</div>
        </div>
        <div class="progress-info">
          <div class="progress-title">Today's Progress</div>
          <div class="progress-headline">
            {{ taskStore.stats.total === 0 ? 'No habits yet!' : `${taskStore.stats.done} out of ${taskStore.stats.total} tasks completed` }}
          </div>
          <div class="progress-chips">
            <div class="progress-chip"><span class="chip-dot dot-done"></span>{{ taskStore.stats.done }} Done</div>
            <div class="progress-chip"><span class="chip-dot dot-doing"></span>{{ taskStore.stats.doing }} Doing</div>
            <div class="progress-chip"><span class="chip-dot dot-todo"></span>{{ taskStore.stats.todo }} To Do</div>
          </div>
        </div>
      </div>

      <!-- Habits section -->
      <div class="anim-3">
        <div class="section-header">
          <span class="section-title">My Habits</span>
          <RouterLink to="/habits" class="see-all">See all →</RouterLink>
        </div>

        <!-- Filter tabs -->
        <div class="filter-tabs">
          <button v-for="f in filters" :key="f.value"
            class="filter-tab" :class="{ active: currentFilter === f.value }"
            @click="currentFilter = f.value">
            {{ f.label }}
          </button>
        </div>

        <!-- List -->
        <div class="habits-list">
          <template v-if="filteredTasks.length > 0">
            <HabitItem
              v-for="task in filteredTasks"
              :key="task.id"
              :task="task"
              @cycle="handleCycle"
            />
          </template>
          <div v-else class="empty-state">
            <div class="empty-icon">🌱</div>
            <p>No habits here yet.<br>Tap <strong>+</strong> to add your first one!</p>
          </div>
        </div>
      </div>

    </main>

    <!-- FAB -->
    <RouterLink to="/habits/new" class="fab" title="Add habit">+</RouterLink>

    <TabBar />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useToastStore } from '@/stores/toast'
import { useGreeting } from '@/composables/useGreeting'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'
import HabitItem from '@/components/HabitItem.vue'

const authStore = useAuthStore()
const taskStore = useTasksStore()
const toastStore = useToastStore()
const { greeting } = useGreeting()

// Load tasks from server on component mount
onMounted(async () => {
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    console.error('Failed to load tasks:', error)
    // Fallback to demo if fetch fails
    taskStore.seedDemo()
  }
})

const greetingText  = greeting()
const currentFilter = ref('all')

const filters = [
  { value: 'all',   label: 'All'   },
  { value: 'todo',  label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'done',  label: 'Done'  },
]

const filteredTasks = computed(() => {
  if (currentFilter.value === 'all') return taskStore.all
  return taskStore.all.filter(t => t.status === currentFilter.value)
})

const ringOffset = computed(() => {
  return 220 - (220 * taskStore.stats.pct / 100)
})

function handleCycle(id) {
  taskStore.cycleStatus(id)
  toastStore.show('Status updated!')
}
</script>

<style scoped>
.greeting-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.4rem; }
.greeting-sub { font-size: 0.8rem; color: var(--text-muted); font-weight: 300; }
.greeting-name { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; display: flex; align-items: center; gap: 6px; }

.progress-card { padding: 1.2rem; margin-bottom: 1.4rem; display: flex; align-items: center; gap: 1rem; }
.progress-info { flex: 1; }
.progress-title { font-family: var(--font-display); font-size: 0.78rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text-muted); margin-bottom: 4px; }
.progress-headline { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; }
.progress-chips { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
.progress-chip { display: flex; align-items: center; gap: 5px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 50px; padding: 4px 10px; font-size: 0.75rem; font-weight: 500; }
.chip-dot { width: 8px; height: 8px; border-radius: 50%; }
.dot-done  { background: var(--green); }
.dot-doing { background: var(--cyan); }
.dot-todo  { background: var(--text-faint); }

.habits-list { display: flex; flex-direction: column; gap: 8px; }

.filter-tabs { display: flex; gap: 6px; margin-bottom: 1rem; overflow-x: auto; scrollbar-width: none; padding-bottom: 2px; }
.filter-tabs::-webkit-scrollbar { display: none; }
.filter-tab { white-space: nowrap; padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-body); transition: all 0.18s; }
.filter-tab.active { background: var(--green); color: #03140a; border-color: var(--green); font-weight: 700; }

.fab { position: fixed; bottom: 80px; right: 50%; transform: translateX(180px); width: 54px; height: 54px; border-radius: 50%; background: var(--green); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #03140a; box-shadow: 0 6px 24px rgba(0,230,118,0.4); transition: all 0.2s; text-decoration: none; z-index: 50; }
.fab:hover { transform: translateX(180px) scale(1.08); box-shadow: 0 8px 32px rgba(0,230,118,0.5); }

.empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
.empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { font-size: 0.9rem; line-height: 1.6; }
</style>
