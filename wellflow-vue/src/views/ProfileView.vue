<template>
  <div class="app-shell">
    <NavBar />

    <main class="content">

      <!-- Profile hero -->
      <div class="profile-hero anim-1">
        <div class="avatar-large">{{ authStore.initial }}</div>
        <div class="profile-name">{{ capitalizedName }}</div>
        <div class="profile-email">{{ authStore.user?.email || '—' }}</div>
        <div class="streak-badge">🔥 <span>12</span>-day Streak</div>
      </div>

      <!-- Stats -->
      <div class="stats-row anim-2">
        <div class="stat-tile">
          <div class="stat-num green">{{ taskStore.stats.done }}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-tile">
          <div class="stat-num cyan">{{ taskStore.stats.doing }}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-tile">
          <div class="stat-num muted">{{ taskStore.stats.todo }}</div>
          <div class="stat-label">To Do</div>
        </div>
      </div>

      <!-- Menu: Account -->
      <div class="menu-section-label anim-3">Account</div>
      <div class="menu-list anim-3">
        <div class="menu-item" @click="openModal('notif')">
          <div class="menu-icon mi-purple">🔔</div>
          <div style="flex:1">
            <div class="menu-label">Notifications</div>
            <div class="menu-sub">Daily reminders &amp; alerts</div>
          </div>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="openModal('security')">
          <div class="menu-icon mi-blue">🔒</div>
          <div style="flex:1">
            <div class="menu-label">Security &amp; Password</div>
            <div class="menu-sub">Change password, 2FA</div>
          </div>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <!-- Menu: Data -->
      <div class="menu-section-label anim-4">Data</div>
      <div class="menu-list anim-4">
        <div class="menu-item" @click="openModal('stats')">
          <div class="menu-icon mi-green">📊</div>
          <div style="flex:1">
            <div class="menu-label">My Statistics</div>
            <div class="menu-sub">View detailed progress charts</div>
          </div>
          <span class="menu-arrow">›</span>
        </div>
        <div class="menu-item" @click="doExport">
          <div class="menu-icon mi-orange">📤</div>
          <div style="flex:1">
            <div class="menu-label">Export Data</div>
            <div class="menu-sub">Download your habits as CSV</div>
          </div>
          <span class="menu-arrow">›</span>
        </div>
      </div>

      <!-- Menu: Session -->
      <div class="menu-section-label anim-5">Session</div>
      <div class="menu-list anim-5">
        <div class="menu-item danger" @click="openModal('logout')">
          <div class="menu-icon mi-red">🚪</div>
          <div style="flex:1">
            <div class="menu-label menu-danger-label">Sign Out</div>
            <div class="menu-sub">End your current session</div>
          </div>
          <span class="menu-arrow">›</span>
        </div>
      </div>

    </main>
    <TabBar />

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="activeModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-box">
            <div class="modal-title">{{ currentModal.title }}</div>
            <div class="modal-body">{{ currentModal.body }}</div>
            <div class="modal-actions">
              <template v-if="activeModal === 'logout'">
                <button class="btn btn-ghost" style="flex:1" @click="closeModal">Cancel</button>
                <button class="btn btn-primary" style="flex:1;background:#ff5252;box-shadow:none;" @click="doLogout">Sign Out</button>
              </template>
              <template v-else>
                <button class="btn btn-ghost btn-full" @click="closeModal">Close</button>
              </template>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'
import { useToastStore } from '@/stores/toast'
import NavBar from '@/components/NavBar.vue'
import TabBar from '@/components/TabBar.vue'

const router     = useRouter()
const authStore  = useAuthStore()
const taskStore  = useTasksStore()
const toastStore = useToastStore()

taskStore.seedDemo()

const activeModal = ref(null)

const capitalizedName = computed(() => {
  const n = authStore.username || 'User'
  return n.charAt(0).toUpperCase() + n.slice(1)
})

const modals = {
  notif: {
    title: '🔔 Notifications',
    body: 'Notification settings will be configurable in the final version. Connects to PUT /api/user/profile.',
  },
  security: {
    title: '🔒 Security & Password',
    body: 'Change your password or enable two-factor authentication. Connects to PUT /api/user/password.',
  },
  stats: {
    title: '📊 My Statistics',
    body: 'Detailed charts and history will be shown here. Connects to GET /api/tasks/stats.',
  },
  logout: {
    title: '🚪 Sign Out',
    body: 'Are you sure you want to sign out? Your habits will be saved.',
  },
}

const currentModal = computed(() => modals[activeModal.value] || {})

function openModal(key) { activeModal.value = key }
function closeModal()   { activeModal.value = null }

async function doLogout() {
  // TODO: POST /api/auth/logout (revoke server-side session)
  await authStore.logout()
  router.push('/')
}

function doExport() {
  const tasks  = taskStore.all
  const header = 'id,title,category,status,scheduledTime,description,createdAt\n'
  const rows   = tasks.map(t =>
    [t.id, `"${t.title}"`, t.category, t.status, t.scheduledTime || '', `"${t.description || ''}"`, t.createdAt].join(',')
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv' })
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = 'wellflow-habits.csv'
  a.click()
  toastStore.show('Data exported! 📤')
}
</script>

<style scoped>
.profile-hero { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 2rem 1rem 1.4rem; text-align: center; margin-bottom: 1.2rem; }
.avatar-large { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--cyan), var(--green)); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 800; font-size: 2rem; color: #03140a; box-shadow: 0 0 0 4px rgba(0,230,118,0.2), var(--shadow-glow); }
.profile-name  { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; }
.profile-email { font-size: 0.82rem; color: var(--text-muted); }
.streak-badge  { display: inline-flex; align-items: center; gap: 5px; background: rgba(0,230,118,0.1); border: 1px solid rgba(0,230,118,0.25); border-radius: 50px; padding: 5px 14px; font-size: 0.8rem; font-weight: 600; color: var(--green); }

.stats-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 1.4rem; }
.stat-num.green { color: var(--green); }
.stat-num.cyan  { color: var(--cyan);  }
.stat-num.muted { color: var(--text-muted); }

.menu-section-label { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--text-faint); padding: 0 4px; margin-bottom: 6px; margin-top: 4px; }
.menu-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 1.4rem; }
.menu-item { display: flex; align-items: center; gap: 14px; padding: 14px 16px; border-radius: var(--radius-md); border: 1px solid var(--border); background: rgba(255,255,255,0.025); cursor: pointer; transition: background 0.18s, border-color 0.18s; }
.menu-item:hover { background: var(--navy-hover); border-color: rgba(255,255,255,0.1); }
.menu-item.danger { border-color: rgba(255,80,80,0.15); }
.menu-item.danger:hover { background: rgba(255,80,80,0.06); border-color: rgba(255,80,80,0.3); }
.menu-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0; }
.mi-purple { background: rgba(180,130,255,0.12); }
.mi-blue   { background: rgba(0,188,212,0.12); }
.mi-green  { background: rgba(0,230,118,0.12); }
.mi-orange { background: rgba(255,160,80,0.12); }
.mi-red    { background: rgba(255,80,80,0.12); }
.menu-label { flex: 1; font-weight: 500; font-size: 0.93rem; }
.menu-sub   { font-size: 0.76rem; color: var(--text-muted); margin-top: 1px; }
.menu-arrow { color: var(--text-faint); font-size: 0.85rem; }
.menu-danger-label { color: #ff6b6b; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 200; padding: 1rem; }
.modal-box { background: var(--navy-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.8rem; max-width: 340px; width: 100%; }
.modal-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; margin-bottom: 0.6rem; }
.modal-body  { font-size: 0.88rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1.4rem; }
.modal-actions { display: flex; gap: 8px; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
