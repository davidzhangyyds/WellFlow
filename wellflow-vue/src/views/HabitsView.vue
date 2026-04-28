<template>
  <div class="app-shell">
    <NavBar>
      <template #actions>
        <RouterLink to="/habits/new" class="btn btn-ghost btn-sm">+ Add</RouterLink>
      </template>
    </NavBar>

    <main class="content">

      <!-- Header -->
      <div class="page-header anim-1">
        <RouterLink to="/dashboard" class="back-btn">←</RouterLink>
        <div class="page-title">
          All Habits
          <span class="task-count">({{ filteredTasks.length }})</span>
        </div>
      </div>

      <!-- Search -->
      <div class="search-wrap anim-2">
        <span class="search-icon">🔍</span>
        <input v-model="search" type="text" placeholder="Search habits…" />
      </div>

      <!-- Toolbar -->
      <div class="toolbar anim-3">
        <button v-for="f in filters" :key="f.value"
          class="filter-tab" :class="{ active: currentFilter === f.value }"
          @click="currentFilter = f.value">
          {{ f.label }}
        </button>
        <select v-model="sortBy" class="no-icon" style="margin-left:auto;">
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="alpha">A–Z</option>
        </select>
      </div>

      <!-- List -->
      <div class="habits-container anim-4">
        <template v-if="filteredTasks.length > 0">
          <div v-for="task in filteredTasks" :key="task.id" class="habit-item-row">
            <HabitItem :task="task" @cycle="handleCycle">
              <template #actions>
                <button class="action-btn action-edit"   @click.stop="openEdit(task)"   title="Edit">✏️</button>
                <button class="action-btn action-delete" @click.stop="handleDelete(task.id)" title="Delete">🗑</button>
              </template>
            </HabitItem>
          </div>
        </template>
        <div v-else class="empty-state">
          <div class="empty-icon">📭</div>
          <p>No habits match this filter.<br>Try adjusting your search or add a new habit!</p>
        </div>
      </div>

    </main>
    <TabBar />

    <!-- Edit bottom sheet -->
    <Teleport to="body">
      <Transition name="sheet">
        <div v-if="editOverlay" class="edit-overlay" @click.self="closeEdit">
          <div class="edit-sheet">
            <div class="sheet-handle"></div>
            <div class="edit-title">Edit Habit</div>
            <div class="edit-form">
              <div class="form-group">
                <label class="form-label">Title</label>
                <div class="input-wrap">
                  <span class="icon">{{ editForm.icon }}</span>
                  <input v-model="editForm.title" type="text" placeholder="Habit name" />
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <div class="status-toggle">
                  <button v-for="s in statuses" :key="s.value" type="button"
                    class="status-btn" :class="{ ['active-' + s.value]: editForm.status === s.value }"
                    @click="editForm.status = s.value">
                    {{ s.label }}
                  </button>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Time</label>
                <div class="input-wrap">
                  <span class="icon">⏰</span>
                  <input v-model="editForm.time" type="time" />
                </div>
              </div>
              <div style="display:flex;gap:8px;margin-top:4px;">
                <button class="btn btn-ghost" style="flex:1" @click="closeEdit">Cancel</button>
                <button class="btn btn-primary" style="flex:1" @click="saveEdit">Save</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useTasksStore } from '@/stores/tasks'
import { useToastStore } from '@/stores/toast'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'
import HabitItem from '@/components/HabitItem.vue'

const taskStore  = useTasksStore()
const toastStore = useToastStore()

// Load tasks from server on component mount
onMounted(async () => {
  try {
    await taskStore.fetchTasks()
  } catch (error) {
    console.error('Failed to load tasks:', error)
  }
})

const search        = ref('')
const currentFilter = ref('all')
const sortBy        = ref('newest')
const editOverlay   = ref(false)

const editForm = reactive({ id: null, title: '', status: 'todo', time: '08:00', icon: '📌', category: '' })

const filters = [
  { value: 'all',   label: 'All'   },
  { value: 'todo',  label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'done',  label: 'Done'  },
]

const statuses = [
  { value: 'todo',  label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'done',  label: 'Done'  },
]

const filteredTasks = computed(() => {
  let list = [...taskStore.all]

  // Filter by status
  if (currentFilter.value !== 'all') {
    list = list.filter(t => t.status === currentFilter.value)
  }

  // Search
  if (search.value.trim()) {
    list = list.filter(t => t.title.toLowerCase().includes(search.value.toLowerCase()))
  }

  // Sort
  if (sortBy.value === 'oldest') list = list.reverse()
  else if (sortBy.value === 'alpha') list = list.sort((a, b) => a.title.localeCompare(b.title))

  return list
})

function handleCycle(id) {
  taskStore.cycleStatus(id)
  toastStore.show('Status updated!')
}

function handleDelete(id) {
  // TODO: DELETE /api/tasks/:id
  taskStore.deleteTask(id)
  toastStore.show('Habit deleted.', 'error')
}

function openEdit(task) {
  editForm.id       = task.id
  editForm.title    = task.title
  editForm.status   = task.status
  editForm.category = task.category || 'sport'
  editForm.time     = task.scheduled_time?.slice(11, 16) || '08:00' // Extract HH:MM from DATETIME
  editForm.icon     = task.icon || '📌'
  editOverlay.value = true
}

function closeEdit() {
  editOverlay.value = false
}

async function saveEdit() {
  if (!editForm.title.trim()) { toastStore.show('Title cannot be empty.', 'error'); return }

  // TODO: PUT /api/tasks/:id
  await taskStore.updateTask(editForm.id, {
    title:           editForm.title.trim(),
    status:          editForm.status,
    category:        editForm.category,
    scheduled_time:  editForm.time,
  })

  closeEdit()
  toastStore.show('Habit updated! ✓')
}
</script>

<style scoped>
.page-header { display: flex; align-items: center; gap: 12px; margin-bottom: 1.4rem; }
.back-btn { width: 38px; height: 38px; border-radius: 50%; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.18s; text-decoration: none; flex-shrink: 0; }
.back-btn:hover { background: rgba(255,255,255,0.06); color: var(--text-primary); }
.page-title { font-family: var(--font-display); font-size: 1.4rem; font-weight: 800; flex: 1; }
.task-count { font-size: 0.8rem; color: var(--text-muted); font-weight: 400; margin-left: 6px; }

.search-wrap { position: relative; margin-bottom: 1rem; }
.search-wrap .search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none; }
.search-wrap input { padding-left: 42px; border-radius: 50px; width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-body); font-size: 0.95rem; padding: 12px 14px 12px 42px; outline: none; transition: border-color 0.2s; }
.search-wrap input:focus { border-color: var(--border-focus); box-shadow: 0 0 0 3px rgba(0,230,118,0.08); }

.toolbar { display: flex; gap: 6px; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; }
.filter-tab { white-space: nowrap; padding: 6px 14px; border-radius: 50px; font-size: 0.8rem; font-weight: 500; cursor: pointer; border: 1px solid var(--border); background: transparent; color: var(--text-muted); font-family: var(--font-body); transition: all 0.18s; flex-shrink: 0; }
.filter-tab.active { background: var(--green); color: #03140a; border-color: var(--green); font-weight: 700; }
select { padding: 7px 12px; border-radius: 50px; font-size: 0.8rem; cursor: pointer; background: rgba(255,255,255,0.04); border: 1px solid var(--border); color: var(--text-primary); font-family: var(--font-body); outline: none; }

.habit-item-row { position: relative; border-radius: var(--radius-md); overflow: hidden; margin-bottom: 8px; display: flex; }
.action-btn { width: 50px; border: none; cursor: pointer; font-size: 1rem; display: flex; align-items: center; justify-content: center; transition: opacity 0.18s; flex-shrink: 0; }
.action-btn:hover { opacity: 0.8; }
.action-edit   { background: var(--cyan-dim); }
.action-delete { background: #c0392b; }

.habits-container { display: flex; flex-direction: column; }
.empty-state { text-align: center; padding: 3rem 1rem; color: var(--text-muted); }
.empty-state .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
.empty-state p { font-size: 0.9rem; line-height: 1.6; }

/* Edit bottom sheet */
.edit-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; z-index: 200; padding: 0; }
.edit-sheet { background: var(--navy-card); border: 1px solid var(--border); border-radius: var(--radius-lg) var(--radius-lg) 0 0; padding: 1.6rem 1.4rem 2rem; width: 100%; max-width: 480px; }
.sheet-handle { width: 40px; height: 4px; background: var(--border); border-radius: 2px; margin: 0 auto 1.4rem; }
.edit-form { display: flex; flex-direction: column; gap: 1rem; }
.edit-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; margin-bottom: 0.6rem; }

input[type="time"] { width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: var(--radius-sm); color: var(--text-primary); font-family: var(--font-body); font-size: 0.95rem; padding: 12px 14px 12px 42px; outline: none; }
input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(0.5); }

.sheet-enter-active, .sheet-leave-active { transition: opacity 0.25s ease; }
.sheet-enter-active .edit-sheet, .sheet-leave-active .edit-sheet { transition: transform 0.3s ease; }
.sheet-enter-from, .sheet-leave-to { opacity: 0; }
.sheet-enter-from .edit-sheet, .sheet-leave-to .edit-sheet { transform: translateY(100%); }
</style>
