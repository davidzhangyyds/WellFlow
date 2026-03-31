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
