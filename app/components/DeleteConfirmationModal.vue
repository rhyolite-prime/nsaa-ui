<script setup lang="ts">
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/vue/24/outline';

defineProps<{
  isOpen: boolean;
  title?: string;
  description?: string;
  isDeleting?: boolean;
}>();

const emit = defineEmits(['close', 'confirm']);
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
    <!-- Backdrop -->
    <div 
      class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
      @click="emit('close')"
    ></div>

    <!-- Modal Content -->
    <div class="relative bg-white rounded-3xl w-full max-w-md p-6 md:p-8 shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
      <div class="flex flex-col items-center text-center">
        <!-- Icon -->
        <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 text-red-600">
          <ExclamationTriangleIcon class="w-8 h-8" />
        </div>

        <h2 class="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">
          {{ title || 'Confirm Deletion' }}
        </h2>
        
        <p class="text-slate-500 text-sm font-medium leading-relaxed mb-8">
          {{ description || 'Are you sure you want to delete this item? This action cannot be undone and all associated data will be permanently removed.' }}
        </p>

        <div class="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <button 
            type="button" 
            @click="emit('close')" 
            class="flex-1 py-3.5 px-6 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 text-sm uppercase tracking-wider"
          >
            Cancel
          </button>
          <button 
            @click="emit('confirm')"
            :disabled="isDeleting"
            class="flex-1 py-3.5 px-6 bg-[#C82323] hover:bg-[#A01D1D] text-white rounded-2xl font-bold shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 text-sm uppercase tracking-wider flex items-center justify-center gap-2"
          >
            <span v-if="isDeleting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            {{ isDeleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>

      <!-- Close Button -->
      <button 
        @click="emit('close')" 
        class="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
      >
        <XMarkIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>
