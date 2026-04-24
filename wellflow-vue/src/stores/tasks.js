import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/composables/useApi'

export const useTasksStore = defineStore('tasks', () => {
  // ── State ──────────────────────────────────────
  // Normalize tasks: ensure all tasks have an 'id' field
  const rawTasks = JSON.parse(localStorage.getItem('wf_tasks')) || []
  const normalizedTasks = rawTasks.map(t => ({
    ...t,
    id: t.id || t.task_id || Date.now() + Math.random()
  }))
  const tasks = ref(normalizedTasks)

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
    try {
      const { data } = await api.get('/tasks')
      // Normalize task_id to id for frontend compatibility
      tasks.value = data.map(t => ({ ...t, id: t.task_id }))
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw error
    }
  }

  async function addTask(payload) {
    try {
      const { data } = await api.post('/tasks', payload)
      // After creating, fetch the new task with the returned ID
      const { data: newTask } = await api.get(`/tasks/${data.task_id}`)
      // Normalize task_id to id for frontend compatibility
      const normalizedTask = { ...newTask, id: newTask.task_id }
      tasks.value.unshift(normalizedTask)
      return normalizedTask
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }

  async function updateTask(id, changes) {
    try {
      await api.put(`/tasks/${id}`, changes)
      // Refetch the updated task to sync with server
      const { data: updatedTask } = await api.get(`/tasks/${id}`)
      const normalizedTask = { ...updatedTask, id: updatedTask.task_id }
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        tasks.value[idx] = normalizedTask
      }
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  async function updateStatus(id, status) {
    try {
      await api.patch(`/tasks/${id}/status`, { status })
      // Update local state
      const idx = tasks.value.findIndex(t => t.id === id)
      if (idx !== -1) {
        tasks.value[idx].status = status
      }
    } catch (error) {
      console.error('Error updating status:', error)
      throw error
    }
  }

  async function deleteTask(id) {
    try {
      await api.delete(`/tasks/${id}`)
      tasks.value = tasks.value.filter(t => t.id !== id)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
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
