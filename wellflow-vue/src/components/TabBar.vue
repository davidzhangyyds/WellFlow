<template>
  <nav class="tab-bar">
    <RouterLink to="/dashboard" class="tab-item" :class="{ active: route.name === 'Dashboard' }">
      <span class="tab-icon">🏠</span>Home
    </RouterLink>
    <RouterLink to="/habits" class="tab-item" :class="{ active: route.name === 'Habits' }">
      <span class="tab-icon">📋</span>Habits
    </RouterLink>
    <RouterLink to="/habits/new" class="tab-item" :class="{ active: route.name === 'NewHabit' }">
      <span class="tab-icon">➕</span>Add
    </RouterLink>
    <RouterLink to="/profile" class="tab-item" :class="{ active: route.name === 'Profile' }">
      <span class="tab-icon">👤</span>Profile
    </RouterLink>
  </nav>
</template>

<script setup>
import { RouterLink, useRoute } from 'vue-router'
const route = useRoute()
</script>
