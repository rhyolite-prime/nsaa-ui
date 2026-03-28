<template>
  <div class="flex items-center justify-center gap-1.5">
    <!-- Previous page button -->
    <button 
      class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-200 transition-all active:scale-90 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed group"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
      title="Previous Page"
    >
      <ChevronLeftIcon class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </button>
    
    <!-- First page -->
    <button 
      class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all active:scale-95"
      :class="currentPage === 1 
        ? 'bg-[#C82323] text-white shadow-lg shadow-red-100' 
        : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'"
      @click="changePage(1)"
    >
      1
    </button>
    
    <!-- Ellipsis if needed -->
    <span v-if="startPage > 2" class="w-8 flex justify-center text-slate-300 font-black tracking-widest">...</span>
    
    <!-- Page numbers -->
    <button 
      v-for="page in displayedPages"
      :key="page"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all active:scale-95"
      :class="currentPage === page 
        ? 'bg-[#C82323] text-white shadow-lg shadow-red-100' 
        : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'"
      @click="changePage(page)"
    >
      {{ page }}
    </button>
    
    <!-- Ellipsis if needed -->
    <span v-if="endPage < totalPages - 1" class="w-8 flex justify-center text-slate-300 font-black tracking-widest">...</span>
    
    <!-- Last page -->
    <button 
      v-if="totalPages > 1"
      class="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-black transition-all active:scale-95"
      :class="currentPage === totalPages 
        ? 'bg-[#C82323] text-white shadow-lg shadow-red-100' 
        : 'text-slate-500 hover:bg-slate-50 border border-transparent hover:border-slate-200'"
      @click="changePage(totalPages)"
    >
      {{ totalPages }}
    </button>
    
    <!-- Next page button -->
    <button 
      class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-50 hover:text-slate-600 border border-transparent hover:border-slate-200 transition-all active:scale-90 disabled:opacity-30 disabled:scale-100 disabled:cursor-not-allowed group"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
      title="Next Page"
    >
      <ChevronRightIcon class="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
    </button>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const props = defineProps({
  currentPage: {
    type: Number,
    required: true
  },
  totalPages: {
    type: Number,
    required: true
  },
  maxVisibleButtons: {
    type: Number,
    default: 3
  }
})

const emit = defineEmits(['page-change'])

// Calculate the range of pages to show
const startPage = computed(() => {
  // Show maxVisibleButtons pages centered around current page
  let start = Math.max(2, props.currentPage - Math.floor(props.maxVisibleButtons / 2))
  
  // Adjust start if we're near the end
  const end = Math.min(props.totalPages - 1, start + props.maxVisibleButtons - 1)
  
  // Adjust start if we don't have enough pages
  start = Math.max(2, Math.min(start, props.totalPages - props.maxVisibleButtons))
  
  return start
})

const endPage = computed(() => {
  return Math.min(props.totalPages - 1, startPage.value + props.maxVisibleButtons - 1)
})

const displayedPages = computed(() => {
  const pages = []
  for (let i = startPage.value; i <= endPage.value; i++) {
    pages.push(i)
  }
  return pages
})

function changePage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('page-change', page)
  }
}
</script>
