<template>
  <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
    <div class="p-8">
      <!-- Status Badge & Actions -->
      <div class="flex justify-between items-start mb-6">
        <div class="h-5 w-20 bg-slate-100 rounded-full"></div>
        <div class="flex gap-2">
          <div class="h-8 w-8 bg-slate-50 rounded-xl"></div>
          <div class="h-8 w-8 bg-slate-50 rounded-xl"></div>
        </div>
      </div>
      
      <!-- Title & Slug -->
      <div class="h-7 w-3/4 bg-slate-100 rounded-lg mb-2"></div>
      <div class="h-3 w-1/4 bg-slate-50 rounded mb-6"></div>
      
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 gap-4 mb-8">
        <div class="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
          <div class="h-2 w-12 bg-slate-100 rounded mb-2"></div>
          <div class="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
        <div class="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
          <div class="h-2 w-12 bg-slate-100 rounded mb-2"></div>
          <div class="h-4 w-16 bg-slate-200 rounded"></div>
        </div>
      </div>

      <!-- Dates Section -->
      <div class="space-y-4">
        <div v-for="i in 3" :key="i" class="flex flex-col gap-2">
          <div class="h-2 w-10 bg-slate-50 rounded"></div>
          <div class="flex gap-3">
             <div class="h-3 w-20 bg-slate-100 rounded"></div>
             <div class="h-3 w-16 bg-slate-100 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-8 py-5 bg-slate-50/50 border-t border-slate-50 flex justify-between items-center">
      <div class="h-3 w-24 bg-slate-100 rounded"></div>
      <div class="h-5 w-5 bg-slate-100 rounded-full"></div>
    </div>
  </div>
</template>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
}
</style>
