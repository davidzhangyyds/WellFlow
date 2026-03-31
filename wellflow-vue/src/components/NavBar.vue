<template>
  <nav class="nav-bar">
    <div class="brand-name" style="font-size:1.3rem;">Well<span>Flow</span></div>
    <div class="nav-actions">
      <slot name="actions" />
      <RouterLink to="/profile">
        <div class="avatar">{{ authStore.initial }}</div>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
const authStore = useAuthStore()
</script>
