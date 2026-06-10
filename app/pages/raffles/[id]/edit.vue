<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import RaffleForm from '~/components/RaffleForm.vue';
import { ChevronLeftIcon } from '@heroicons/vue/24/outline';
import { getRaffleDetails } from '~/services/raffles';
import type { Raffle } from '~/models';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();

const raffleData = ref<Raffle | null>(null);
const isLoading = ref(true);

const goBack = () => {
  router.push('/raffles');
};

const onSaved = () => {
  router.push('/raffles');
};

onMounted(async () => {
  const id = route.params.id as string;
  try {
    const result = await getRaffleDetails(id);
    if (result) {
      // Cast to Raffle to match initialData type, or use it directly if compatible
      raffleData.value = result as unknown as Raffle;
    } else {
      toast.error('Raffle not found');
      goBack();
    }
  } catch (error) {
    console.error('Error fetching raffle details:', error);
    toast.error('Failed to load raffle details');
    goBack();
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <div class="max-w-4xl mx-auto space-y-6 font-sans py-6">
    <!-- Header Actions -->
    <div class="flex items-center gap-4">
      <button 
        @click="goBack"
        class="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
      >
        <ChevronLeftIcon class="w-6 h-6 stroke-2" />
      </button>
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Edit Raffle</h1>
        <p class="text-slate-500 text-sm font-medium">Update the raffle campaign details.</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-10 flex justify-center">
      <div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>

    <!-- Form Container -->
    <RaffleForm 
      v-else-if="raffleData"
      mode="edit" 
      :initialData="raffleData"
      @cancel="goBack"
      @saved="onSaved"
    />
  </div>
</template>
