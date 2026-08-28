<script setup lang="ts">
import { 
  ChevronLeftIcon,
  TrophyIcon,
  UsersIcon,
  BanknotesIcon,
  ClockIcon,
  PlayIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  TicketIcon,
  ShareIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  FingerPrintIcon,
  CommandLineIcon
} from '@heroicons/vue/24/outline';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';
import type { RaffleDrawResponse, Raffle, RaffleDetails, TopTicketHolder, RngLog } from "~/models";
import { getRaffleStatusConfig } from '~/utils/statusConfig';

useHead({
  title: 'Raffle Draw | NSAA BO'
})

const route = useRoute();
const raffleId = route.params.id as string;

// Data structure based on the payload schema
interface DrawPayload {
  actualRevenue: number;
  raffle: {
    createdAt: string;
    drawTime: string;
    endsAt: string;
    expectedRevenue: string;
    id: string;
    liability: string;
    name: string;
    options: any[];
    prizeConfiguration: any[];
    slug: string;
    startsAt: string;
    status: number;
    totalEntries: number;
  };
  topTicketHolders: any[];
  winners: any[];
}

const drawData = ref<DrawPayload | null>(null);
const isDrawing = ref(false);
const isShimmerLoading = ref(true);

const getRaffleInfo = async () => {
    isShimmerLoading.value = true;
    try {
      const result = await getRaffleDrawDetails(raffleId);
      drawData.value = result as any;
    } catch (error) {
        console.error('Unable to fetch raffle details.', error);
    } finally {
      isShimmerLoading.value = false;
    }
}

const executeRaffleDraw = async () => {
  isDrawing.value = true;
  try {
      // Depending on how backend is set up, might need to pass raffleId 
      // but raffles.ts does not currently take an ID for executeDraw().
      // Assuming it uses active raffle or something else.
      await executeDraw();
      
      // Refresh to get winners
      setTimeout(() => {
        getRaffleInfo();
      }, 1000);
    } catch (error) {
      console.error('Unable to execute raffle draw.');
    } finally {
      isDrawing.value = false;
    }
}

const isCopying = ref(false);

const sharePublicLink = async () => {
  if (!drawData.value?.raffle?.slug) {
    toast.error('Raffle details not loaded yet');
    return;
  }
  
  const publicUrl = `${window.location.origin}/participate/${drawData.value.raffle.slug}`;
  
  try {
    isCopying.value = true;
    await navigator.clipboard.writeText(publicUrl);
    toast.success('Public link copied to clipboard!');
  } catch (err) {
    console.error('Failed to copy:', err);
    toast.error('Unable to copy link to clipboard');
  } finally {
    setTimeout(() => {
      isCopying.value = false;
    }, 2000);
  }
};

const formatCurrency = (val: number | string) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(Number(val));
};

const drawStatusDetails = computed(() => {
  const status = drawData.value?.raffle?.status;
  
  if (status === 2) {
    return {
      title: 'Draw Status',
      value: 'COMPLETED',
      footer: `Ended on ${drawData.value?.raffle?.drawTime ? new Date(drawData.value.raffle.drawTime).toLocaleDateString() : ''}`,
      color: 'text-emerald-500'
    }
  }
  
  if (status === 1) {
    return {
      title: 'Drawing Scheduled',
      value: drawData.value?.raffle?.drawTime ? new Date(drawData.value.raffle.drawTime).toLocaleTimeString() : '--:--',
      footer: 'Processing entries...',
      color: 'text-blue-500'
    }
  }

  return {
    title: 'Drawing In',
    value: drawData.value?.raffle?.drawTime ? new Date(drawData.value.raffle.drawTime).toLocaleTimeString() : '--:--',
    footer: `Scheduled: ${drawData.value?.raffle?.drawTime ? new Date(drawData.value.raffle.drawTime).toLocaleDateString() : ''}`,
    color: 'text-slate-400'
  }
});

const graphData = computed(() => {
  if (!drawData.value) return [];
  const liability = parseFloat(drawData.value.raffle.liability || '0');
  const expected = parseFloat(drawData.value.raffle.expectedRevenue || '0');
  const actual = drawData.value.actualRevenue || 0;
  
  const max = Math.max(liability, expected, actual, 1);
  return [
    { label: 'Expected Revenue', value: expected, percent: (expected / max) * 100, color: 'bg-blue-500' },
    { label: 'Actual Revenue', value: actual, percent: (actual / max) * 100, color: 'bg-emerald-500' },
    { label: 'Liability', value: liability, percent: (liability / max) * 100, color: 'bg-amber-500' }
  ];
});

onMounted(() => {
    getRaffleInfo();
});
</script>

<template>
  <div class="space-y-8 font-sans pb-12">
    <!-- Navigation & Title -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <NuxtLink to="/raffles" class="p-3 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-primary-600 transition-all shadow-sm">
          <ChevronLeftIcon class="w-6 h-6" />
        </NuxtLink>
        <div>
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ drawData?.raffle?.name }}</h1>
            <span
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
              :class="getRaffleStatusConfig(drawData?.raffle?.status).pill"
            >
              <span
                class="w-1.5 h-1.5 rounded-full shrink-0"
                :class="[
                  getRaffleStatusConfig(drawData?.raffle?.status).dot,
                  getRaffleStatusConfig(drawData?.raffle?.status).pulse ? 'animate-pulse' : ''
                ]"
              />
              {{ getRaffleStatusConfig(drawData?.raffle?.status).label }}
            </span>
          </div>
          <p class="text-slate-400 text-sm font-medium flex items-center gap-2">
            Alias: <span class="font-bold text-slate-600 tracking-wider">{{ drawData?.raffle?.slug }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button 
          @click="sharePublicLink"
          class="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
          :disabled="isCopying"
        >
          <ShareIcon v-if="!isCopying" class="w-4 h-4 text-slate-400" />
          <CheckCircleIcon v-else class="w-4 h-4 text-emerald-500" />
          {{ isCopying ? 'Link Copied!' : 'Share Public Link' }}
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <BanknotesIcon class="w-24 h-24 text-amber-500" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Total Liability</p>
        <h3 class="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{{ formatCurrency(drawData?.raffle?.liability || 0) }}</h3>
      </div>

      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <TicketIcon class="w-24 h-24 text-secondary" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tickets Sold</p>
        <h3 class="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{{ drawData?.raffle?.totalEntries || 0 }}</h3>
      </div>

      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <ChartBarIcon class="w-24 h-24 text-emerald-500" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Actual Revenue</p>
        <h3 class="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{{ formatCurrency(drawData?.actualRevenue || 0) }}</h3>
      </div>

      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <ClockIcon class="w-24 h-24 text-blue-500" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{{ drawStatusDetails.title }}</p>
        <h3 class="text-3xl font-black mb-1 tracking-tighter" :class="drawStatusDetails.color">{{ drawStatusDetails.value }}</h3>
        <p class="text-slate-400 text-xs font-bold">{{ drawStatusDetails.footer }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Draw Management Section -->
      <div class="lg:col-span-2 space-y-8">
        
        <!-- Financial Graph -->
        <div class="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm p-8">
            <h3 class="text-lg font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                <ChartBarIcon class="w-6 h-6 text-slate-400" />
                Financial Overview
            </h3>
            <div class="space-y-6">
                <div v-for="item in graphData" :key="item.label">
                    <div class="flex justify-between text-sm font-bold text-slate-700 mb-2">
                        <span>{{ item.label }}</span>
                        <span>{{ formatCurrency(item.value) }}</span>
                    </div>
                    <div class="w-full bg-slate-100 h-4 rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-1000" :class="item.color" :style="{ width: `${item.percent}%` }"></div>
                    </div>
                </div>
            </div>
        </div>

        <div 
            v-if="!isShimmerLoading && drawData?.raffle?.status !== 2"
            class="rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden min-h-[300px] flex flex-col items-center justify-center text-center shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            style="background-color: #1A1A1A;"
        >
            <div class="absolute inset-0 opacity-20 pointer-events-none">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E40AF]/40 via-transparent to-transparent"></div>
            </div>

            <div v-if="!isDrawing" class="relative z-10 space-y-8 max-w-md">
                <div class="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
                    <TrophyIcon class="w-12 h-12" style="color: #FBBF24;" />
                </div>
                <div>
                   <h2 class="text-3xl font-black mb-3 tracking-tight" style="color: #FBBF24;">Ready to roll?</h2>
                   <p class="text-slate-400 font-medium">Click to initiate the high-security random draw protocol. Once started, this action cannot be undone.</p>
                </div>
                <button 
                    @click="executeRaffleDraw"
                    class="w-full bg-secondary hover:bg-secondary-dark text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-red-900/50 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                    <PlayIcon class="w-6 h-6" />
                    Initiate Final Draw
                </button>
            </div>

            <div v-else class="relative z-10 space-y-8">
                <div class="w-32 h-32 relative mx-auto">
                    <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <ArrowPathIcon class="w-20 h-20 text-blue-400 animate-spin" />
                    </div>
                </div>
                <div>
                    <h2 class="text-3xl font-black mb-2 tracking-tight">Selecting Winners...</h2>
                    <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sifting through {{ drawData?.raffle?.totalEntries || 0 }} valid entries</p>
                </div>
            </div>
        </div>

        <div 
            v-if="!isShimmerLoading && drawData?.raffle?.status === 2"
            class="rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden min-h-[250px] flex flex-col items-center justify-center text-center shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            style="background-color: #064e3b;"
        >
            <div class="absolute inset-0 opacity-20 pointer-events-none">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#10b981]/40 via-transparent to-transparent"></div>
            </div>
            
            <div class="relative z-10 space-y-6 animate-in fade-in zoom-in duration-1000">
                <div class="w-24 h-24 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(16,185,129,0.3)] border-4 border-white/20">
                    <CheckCircleIcon class="w-12 h-12 text-white" />
                </div>
                <div>
                   <p class="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-2">Draw Completed Successfully</p>
                   <h2 class="text-4xl font-black mb-2 tracking-tighter text-white">Winners Selected!</h2>
                </div>
            </div>
        </div>

        <!-- Participants Summary -->
        <div class="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
            <div class="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 class="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <UsersIcon class="w-6 h-6 text-slate-400" />
                    Top Ticket Holders
                </h3>
                <NuxtLink :to="`/raffles/${raffleId}/tickets`" class="text-sm font-bold text-primary-600 hover:underline">View All Tickets</NuxtLink>
            </div>
            <div class="p-0">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-slate-50/50">
                            <th class="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Customer</th>
                            <th class="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Ticket No.</th>
                            <th class="px-8 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Quantity</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-50">
                        <tr v-if="!drawData?.topTicketHolders?.length">
                            <td colspan="3" class="px-8 py-8 text-center text-slate-400 text-sm font-medium">No ticket holders found.</td>
                        </tr>
                        <tr v-for="topTicketHolder in drawData?.topTicketHolders" :key="topTicketHolder.msisdn" class="hover:bg-slate-50/30 transition-colors">
                            <td class="px-8 py-5">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">
                                        {{ topTicketHolder.firstName ? topTicketHolder.firstName.charAt(0) : 'U' }}
                                    </div>
                                    <div>
                                        <p class="font-bold text-slate-800 text-sm">{{ topTicketHolder.firstName || 'Unknown' }} {{ topTicketHolder.lastName || '' }}</p>
                                        <p class="text-[11px] text-slate-400 font-medium">{{ topTicketHolder.msisdn }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-5 font-mono text-xs font-bold text-slate-500">#{{ topTicketHolder.ticketNumber }}</td>
                            <td class="px-8 py-5">
                                <span class="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black tracking-widest rounded-lg">{{ topTicketHolder.totalTickets }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <!-- Raffle Sidebar Info -->
      <div class="space-y-8">
          <!-- Prize Winners -->
          <div class="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 class="text-lg font-black text-slate-900 tracking-tight mb-6 flex items-center gap-2">
                 <TrophyIcon class="w-6 h-6 text-amber-500" />
                 Winners
              </h3>
              <div class="space-y-4">
                  <div v-if="!drawData?.winners?.length" class="text-center py-8">
                      <p class="text-slate-400 text-sm font-medium">No winners selected yet.</p>
                  </div>
                  <div v-else v-for="winner in drawData.winners" :key="winner.id" class="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                      <div class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                          <TrophyIcon class="w-5 h-5" />
                      </div>
                      <div class="flex-1 min-w-0">
                          <p class="text-xs font-black text-slate-900 truncate">{{ winner.prizeDescription }}</p>
                          <p class="text-[11px] text-slate-500 font-bold mt-1">Phone: {{ winner.phoneNumber }}</p>
                          <div class="flex items-center gap-2 mt-2 flex-wrap">
                            <span class="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 text-[9px] font-bold rounded">Opt: {{ winner.selectedOptionLabel }}</span>
                            <span class="px-2 py-0.5 bg-white border border-slate-200 text-slate-500 text-[9px] font-mono rounded truncate max-w-[120px]">#{{ winner.ticketAlias }}</span>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes zoom-in {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.animate-in {
  animation: fade-in 1s ease-out;
}

.zoom-in {
  animation: zoom-in 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}
</style>
