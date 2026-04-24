<template>
  <div>
    <RouterView />
    <!-- Global Toast -->
    <Teleport to="body">
      <Transition name="toast">
        <div v-if="toast.visible" class="wf-toast" :class="'toast-' + toast.type">
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
  
</template>

<script setup>
import { RouterView } from 'vue-router'
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'

const { toast } = storeToRefs(useToastStore())

import { onMounted, ref } from 'vue'

const message = ref('Chargement...')

onMounted(async () => {
  try {
    // Le proxy de vite.config.js transformera ceci 
    // en http://localhost:3000/api/hello
    const response = await fetch('/api/hello') 
    const data = await response.json()
    message.value = data.text
  } catch (error) {
    console.error("Erreur lors de l'appel API :", error)
    message.value = "Erreur de connexion au serveur"
  }
})

</script>

<style>
.wf-toast {
  position: fixed;
  bottom: 90px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 20px;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
  box-shadow: 0 6px 24px rgba(0,0,0,.4);
  z-index: 9999;
  white-space: nowrap;
  font-family: var(--font-body);
}
.toast-success { background: var(--green); color: #03140a; }
.toast-error   { background: #ff5252; color: white; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { opacity: 0; transform: translateX(-50%) translateY(20px); }
.toast-leave-to   { opacity: 0; transform: translateX(-50%) translateY(20px); }
</style>
