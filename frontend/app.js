/* =============================================
   WellFlow — Shared Utilities
   ============================================= */

// ── Auth helpers ──
const Auth = {
  save(user) {
    localStorage.setItem('wf_user', JSON.stringify(user));
    localStorage.setItem('wf_token', user.token || 'demo_token_' + Date.now());
  },
  get() {
    try { return JSON.parse(localStorage.getItem('wf_user')); } catch { return null; }
  },
  token() { return localStorage.getItem('wf_token'); },
  logout() { localStorage.removeItem('wf_user'); localStorage.removeItem('wf_token'); },
  isLoggedIn() { return !!this.token(); },
  require() {
    if (!this.isLoggedIn()) { window.location.href = 'index.html'; }
  }
};

// ── Task store (localStorage — replaced by API calls in production) ──
const Tasks = {
  all() {
    try { return JSON.parse(localStorage.getItem('wf_tasks')) || []; } catch { return []; }
  },
  save(tasks) { localStorage.setItem('wf_tasks', JSON.stringify(tasks)); },
  add(task) {
    const tasks = this.all();
    task.id = Date.now();
    task.createdAt = new Date().toISOString();
    task.updatedAt = new Date().toISOString();
    tasks.unshift(task);
    this.save(tasks);
    return task;
  },
  update(id, changes) {
    const tasks = this.all().map(t => t.id === id ? { ...t, ...changes, updatedAt: new Date().toISOString() } : t);
    this.save(tasks);
  },
  delete(id) { this.save(this.all().filter(t => t.id !== id)); },
  byStatus(status) { return this.all().filter(t => t.status === status); },
  todayStats() {
    const tasks = this.all();
    const done   = tasks.filter(t => t.status === 'done').length;
    const doing  = tasks.filter(t => t.status === 'doing').length;
    const todo   = tasks.filter(t => t.status === 'todo').length;
    const pct    = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
    return { total: tasks.length, done, doing, todo, pct };
  }
};

// ── Seed demo data if empty ──
function seedDemoData() {
  if (Tasks.all().length > 0) return;
  const demos = [
    { title: 'Morning Jog', category: 'sport',     icon: '🏃', sub: '06:30 · 30 min',  status: 'done'  },
    { title: 'Drink 2L of water', category: 'hydration', icon: '💧', sub: 'Daily',          status: 'done'  },
    { title: 'Meditation',  category: 'mental',    icon: '🧘', sub: '10:00 · 15 min',  status: 'doing' },
    { title: 'Screen Break',category: 'break',     icon: '📵', sub: '14:00 · 20 min',  status: 'todo'  },
    { title: 'Evening Yoga',category: 'mental',    icon: '🧘', sub: '19:30 · 30 min',  status: 'todo'  },
    { title: 'Healthy Lunch',category: 'nutrition',icon: '🥗', sub: '12:00',            status: 'done'  },
  ];
  demos.forEach(d => Tasks.add(d));
}

// ── Greeting ──
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

// ── Format date ──
function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

// ── Category meta ──
const CAT_META = {
  sport:     { icon: '🏃', label: 'Sport',     cls: 'sport'     },
  mental:    { icon: '🧘', label: 'Mental',    cls: 'mental'    },
  hydration: { icon: '💧', label: 'Hydration', cls: 'hydration' },
  sleep:     { icon: '😴', label: 'Sleep',     cls: 'sleep'     },
  nutrition: { icon: '🥗', label: 'Nutrition', cls: 'nutrition' },
  break:     { icon: '📵', label: 'Break',     cls: 'break-'    },
};

// ── Toast notification ──
function showToast(msg, type = 'success') {
  const existing = document.querySelector('.wf-toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'wf-toast';
  t.style.cssText = `
    position:fixed; bottom:90px; left:50%; transform:translateX(-50%) translateY(20px);
    background:${type === 'success' ? 'var(--green)' : '#ff5252'};
    color:${type === 'success' ? '#03140a' : '#fff'};
    padding:10px 20px; border-radius:50px; font-size:.85rem; font-weight:600;
    box-shadow:0 6px 24px rgba(0,0,0,.4); opacity:0;
    transition:all .3s ease; z-index:9999; white-space:nowrap;
  `;
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)'; });
  setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 2500);
}
