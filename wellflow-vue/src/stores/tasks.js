import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

export const useTasksStore = defineStore('tasks', () => {
  // ── State ──────────────────────────────────────
  const tasks = ref(JSON.parse(localStorage.getItem('wf_tasks')) || [])

  // ── Getters ────────────────────────────────────
  const all   = computed(() => tasks.value)
  const total = computed(() => tasks.value.length)

  const byStatus = (status) => computed(() =>
    tasks.value.filter(t => t.status === status)
  )

  const stats = computed(() => {
    const done  = tasks.value.filter(t => t.status === 'done').length
    const doing = tasks.value.filter(t => t.status === 'doing').length
    const todo  = tasks.value.filter(t => t.status === 'todo').length
    const pct   = tasks.value.length ? Math.round((done / tasks.value.length) * 100) : 0
    return { total: tasks.value.length, done, doing, todo, pct }
  })

  // ── Actions ────────────────────────────────────
  async function fetchTasks() {
    // TODO: replace with real API call
    // const { data } = await api.get('/tasks')
    // tasks.value = data
    // For now tasks come from localStorage (seeded below)
  }

  async function addTask(payload) {
    // TODO: replace with real API call
    // const { data } = await api.post('/tasks', payload)
    // tasks.value.unshift(data)

    // Demo simulation
    const task = {
      ...payload,
      id:        Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.value.unshift(task)
    persist()
    return task
  }

  async function updateTask(id, changes) {
    // TODO: PUT /api/tasks/:id
    // await api.put(`/tasks/${id}`, changes)

    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) {
      tasks.value[idx] = { ...tasks.value[idx], ...changes, updatedAt: new Date().toISOString() }
      persist()
    }
  }

  async function updateStatus(id, status) {
    // TODO: PATCH /api/tasks/:id/status
    // await api.patch(`/tasks/${id}/status`, { status })
    await updateTask(id, { status })
  }

  async function deleteTask(id) {
    // TODO: DELETE /api/tasks/:id
    // await api.delete(`/tasks/${id}`)
    tasks.value = tasks.value.filter(t => t.id !== id)
    persist()
  }

  function cycleStatus(id) {
    const task = tasks.value.find(t => t.id === id)
    if (!task) return
    const cycle = { todo: 'doing', doing: 'done', done: 'todo' }
    updateStatus(id, cycle[task.status])
  }

  function seedDemo() {
    if (tasks.value.length > 0) return
    const demos = [
      { title: 'Morning Jog',     category: 'sport',     icon: '🏃', sub: '06:30 · 30 min', status: 'done'  },
      { title: 'Drink 2L of water', category: 'hydration', icon: '💧', sub: 'Daily',          status: 'done'  },
      { title: 'Meditation',      category: 'mental',    icon: '🧘', sub: '10:00 · 15 min',  status: 'doing' },
      { title: 'Screen Break',    category: 'break',     icon: '📵', sub: '14:00 · 20 min',  status: 'todo'  },
      { title: 'Evening Yoga',    category: 'mental',    icon: '🧘', sub: '19:30 · 30 min',  status: 'todo'  },
      { title: 'Healthy Lunch',   category: 'nutrition', icon: '🥗', sub: '12:00',            status: 'done'  },
    ]
    demos.forEach(d => {
      const t = { ...d, id: Date.now() + Math.random(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      tasks.value.push(t)
    })
    persist()
  }

  function persist() {
    localStorage.setItem('wf_tasks', JSON.stringify(tasks.value))
  }

  return {
    tasks, all, total, byStatus, stats,
    fetchTasks, addTask, updateTask, updateStatus, deleteTask, cycleStatus, seedDemo
  }
})
