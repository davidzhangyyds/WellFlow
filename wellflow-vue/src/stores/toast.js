import { defineStore } from 'pinia'
import { reactive } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toast = reactive({ visible: false, message: '', type: 'success' })
  let timer = null

  function show(message, type = 'success') {
    if (timer) clearTimeout(timer)
    toast.message = message
    toast.type    = type
    toast.visible = true
    timer = setTimeout(() => { toast.visible = false }, 2500)
  }

  return { toast, show }
})
