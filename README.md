# WellFlow — Frontend (Vue.js)

> Track · Habit · Thrive 

## Project Structure

```
src/
├── assets/
│   └── main.css              ← Global styles (CSS variables, components)
│
├── composables/
│   ├── useApi.js             ← Axios instance with JWT interceptors
│   └── useGreeting.js        ← Shared utilities (greeting, date, categories)
│
├── components/
│   ├── NavBar.vue            ← Top navigation bar
│   ├── TabBar.vue            ← Bottom tab navigation
│   └── HabitItem.vue         ← Reusable habit/task card
│
├── stores/                   ← Pinia state management
│   ├── auth.js               ← User auth state (login, register, logout)
│   ├── tasks.js              ← Tasks CRUD state
│   └── toast.js              ← Global toast notifications
│
├── views/                    ← One component per page
│   ├── LoginView.vue         ← Sign in / Register (index.html)
│   ├── DashboardView.vue     ← Home dashboard (dashboard.html)
│   ├── HabitsView.vue        ← All habits list (habits.html)
│   ├── NewHabitView.vue      ← Add new habit (new-habit.html)
│   └── ProfileView.vue       ← User profile (profile.html)
│
├── router/
│   └── index.js              ← Vue Router + auth guards
│
├── App.vue                   ← Root component (global toast)
└── main.js                   ← App entry point
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

App runs on: http://localhost:5173

## Connecting to the Backend

All API calls are pre-written as **TODO comments** in the stores.
Replace the demo simulations with real calls once the backend is ready.

Example in `stores/auth.js`:
```js
// TODO: replace demo with real API call
const { data } = await api.post('/auth/login', { email, password })
```

The `useApi.js` composable handles:
- Base URL → `/api` (proxied to `http://localhost:3000` via Vite)
- JWT token attached automatically to every request
- 401 → auto-redirect to login

## Dependencies

| Package | Purpose |
|---------|---------|
| `vue` | UI framework |
| `vue-router` | Client-side routing |
| `pinia` | State management |
| `axios` | HTTP client for API calls |
| `vite` | Build tool & dev server |
