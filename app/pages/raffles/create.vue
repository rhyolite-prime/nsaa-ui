<script setup lang="ts">
import RaffleForm from '~/components/RaffleForm.vue';
import { ChevronLeftIcon } from '@heroicons/vue/24/outline';

const router = useRouter();

const goBack = () => {
  router.push('/raffles');
};

const onSaved = () => {
  router.push('/raffles');
};
</script>

<template>
  <div class="max-w-6xl mx-auto space-y-6 font-sans py-6">
    <!-- Header Actions -->
    <div class="flex items-center gap-4">
      <button 
        @click="goBack"
        class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
      >
        <ChevronLeftIcon class="w-6 h-6 stroke-2" />
      </button>
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">New Raffle</h1>
        <p class="text-slate-500 text-sm font-medium">Create a new raffle campaign.</p>
      </div>
    </div>

    <!-- Form Container -->
    <RaffleForm 
      mode="create" 
      @cancel="goBack"
      @saved="onSaved"
    />
  </div>
</template>
