<template>
  <div class="page-wrapper">
    <div class="login-card card anim-1">

      <!-- Logo -->
      <div class="logo-wrap anim-2">
        <div class="logo-icon">🌱</div>
        <div class="brand-name">Well<span>Flow</span></div>
        <div class="brand-tagline">Track · Habit · Thrive</div>
      </div>

      <!-- Tabs -->
      <div class="tabs-row anim-3">
        <button class="tab-btn" :class="{ active: activeTab === 'signin' }" @click="activeTab = 'signin'">Sign In</button>
        <button class="tab-btn" :class="{ active: activeTab === 'register' }" @click="activeTab = 'register'">Register</button>
      </div>

      <!-- Sign In Panel -->
      <Transition name="fade" mode="out-in">
        <div v-if="activeTab === 'signin'" key="signin">
          <div v-if="signinError" class="alert alert-error" style="margin-bottom:1rem;">
            ⚠ {{ signinError }}
          </div>
          <div class="form-stack anim-4">
            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="input-wrap">
                <span class="icon">✉️</span>
                <input v-model="signin.email" type="email" placeholder="you@example.com"
                  autocomplete="email" @keyup.enter="handleSignIn" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap">
                <span class="icon">🔒</span>
                <input v-model="signin.password" type="password" placeholder="••••••••"
                  autocomplete="current-password" @keyup.enter="handleSignIn" />
              </div>
            </div>
            <button class="btn btn-primary btn-full anim-5" @click="handleSignIn" :disabled="loading">
              {{ loading ? 'Signing in…' : 'Sign In' }}
            </button>
            <p class="forgot-link anim-5">
              Forgot your password? <span @click="showForgot">Reset</span>
            </p>
          </div>
        </div>

        <!-- Register Panel -->
        <div v-else key="register">
          <div v-if="registerError" class="alert alert-error" style="margin-bottom:1rem;">
            ⚠ {{ registerError }}
          </div>
          <div class="form-stack">
            <div class="form-group">
              <label class="form-label">Username</label>
              <div class="input-wrap">
                <span class="icon">👤</span>
                <input v-model="reg.username" type="text" placeholder="yourname" autocomplete="username" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <div class="input-wrap">
                <span class="icon">✉️</span>
                <input v-model="reg.email" type="email" placeholder="you@example.com" autocomplete="email" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <div class="input-wrap">
                <span class="icon">🔒</span>
                <input v-model="reg.password" type="password" placeholder="Min. 8 characters" autocomplete="new-password" />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <div class="input-wrap">
                <span class="icon">🔒</span>
                <input v-model="reg.confirm" type="password" placeholder="Repeat password" autocomplete="new-password" @keyup.enter="handleRegister" />
              </div>
            </div>
            <button class="btn btn-primary btn-full" @click="handleRegister" :disabled="loading">
              {{ loading ? 'Creating account…' : 'Create Account' }}
            </button>
            <p class="terms">
              By registering you agree to our <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </Transition>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTasksStore } from '@/stores/tasks'

const router    = useRouter()
const authStore = useAuthStore()
const taskStore = useTasksStore()

const activeTab     = ref('signin')
const loading       = ref(false)
const signinError   = ref('')
const registerError = ref('')

const signin = reactive({ email: '', password: '' })
const reg    = reactive({ username: '', email: '', password: '', confirm: '' })

async function handleSignIn() {
  signinError.value = ''
  if (!signin.email || !signin.password) { signinError.value = 'Please fill in all fields.'; return }
  if (!signin.email.includes('@'))        { signinError.value = 'Enter a valid email address.'; return }

  loading.value = true
  try {
    await authStore.login(signin.email, signin.password)
    taskStore.seedDemo()
    router.push('/dashboard')
  } catch (e) {
    signinError.value = e.response?.data?.error || 'Invalid credentials.'
  } finally {
    loading.value = false
  }
}

async function handleRegister() {
  registerError.value = ''
  if (!reg.username || !reg.email || !reg.password || !reg.confirm) { registerError.value = 'Please fill in all fields.'; return }
  if (!reg.email.includes('@'))   { registerError.value = 'Enter a valid email address.'; return }
  if (reg.password.length < 8)    { registerError.value = 'Password must be at least 8 characters.'; return }
  if (reg.password !== reg.confirm) { registerError.value = 'Passwords do not match.'; return }

  loading.value = true
  try {
    await authStore.register(reg.username, reg.email, reg.password)
    taskStore.seedDemo()
    router.push('/dashboard')
  } catch (e) {
    registerError.value = e.response?.data?.error || 'Registration failed.'
  } finally {
    loading.value = false
  }
}

function showForgot() {
  alert('Password reset — connect this to POST /api/auth/forgot-password')
}
</script>

<style scoped>
.login-card { width: 100%; max-width: 400px; padding: 2.4rem 2rem; }

.logo-wrap {
  display: flex; flex-direction: column; align-items: center;
  gap: 6px; margin-bottom: 2.4rem;
}
.logo-icon {
  width: 72px; height: 72px; border-radius: 20px;
  background: linear-gradient(145deg, #0d1a3a, #162045);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 0 1px rgba(0,188,212,0.2), 0 0 40px rgba(0,230,118,0.1);
  margin-bottom: 8px; font-size: 2rem;
}

.tabs-row {
  display: flex; background: rgba(255,255,255,0.04);
  border-radius: var(--radius-sm); padding: 4px;
  margin-bottom: 1.8rem; border: 1px solid var(--border);
}
.tab-btn {
  flex: 1; padding: 9px; border: none; border-radius: 7px;
  background: transparent; color: var(--text-muted);
  font-family: var(--font-body); font-size: 0.88rem;
  font-weight: 500; cursor: pointer; transition: all 0.2s;
}
.tab-btn.active {
  background: var(--navy-deep); color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}

.form-stack { display: flex; flex-direction: column; gap: 1.1rem; }

.forgot-link { text-align: center; font-size: 0.8rem; color: var(--text-muted); }
.forgot-link span { color: var(--green); font-weight: 500; cursor: pointer; }
.forgot-link span:hover { text-decoration: underline; }

.terms { text-align: center; font-size: 0.75rem; color: var(--text-faint); margin-top: 0.6rem; }
.terms a { color: var(--cyan); text-decoration: none; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none !important; }
</style>
