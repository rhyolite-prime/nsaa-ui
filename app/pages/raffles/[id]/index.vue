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
import type { RaffleDrawResponse, Raffle, RaffleDetails, TopTicketHolder } from "~/models";

useHead({
  title: 'Raffle Draw | NSAA BO'
})

const route = useRoute();
const raffleId = route.params.id as string;

// Mock Raffle Data
const raffle = ref({
  id: raffleId,
  title: 'Valentine Special Raffle',
  status: 'Active',
  pool: 45000,
  ticketPrice: 50,
  soldTickets: 9200,
  totalTickets: 10000,
  drawDate: '2026-02-14T18:00:00Z',
  description: 'A special celebratory raffle for the season of love. Every ticket contributes to the grand community prize pool.',
  tiers: [
    { name: 'Grand Prize', winners: 1, amount: 25000 },
    { name: 'Gold Tier', winners: 5, amount: 2000 },
    { name: 'Silver Tier', winners: 10, amount: 1000 }
  ]
});

const rngLogs = ref([
  {
    id: '7b2a-4f1c-9de2',
    rng_type: 'Quantum-PRNG',
    seed_value: '0x8f2d9k2l...e4a1',
    generated_value: '9,201',
    metadata: { entropy: '256-bit', protocol: 'v2.4' },
    generated_at: '2026-02-14 18:00:05',
    created_by: 'SYSTEM'
  },
  {
    id: '9d1e-2b5a-7c3d',
    rng_type: 'Entropy-Source',
    seed_value: '0x3a1b...c9f2',
    generated_value: 'HASH_00912',
    metadata: { source: 'Hardware TRNG' },
    generated_at: '2026-02-14 17:59:58',
    created_by: 'SECURE_NODE'
  }
]);

const isDrawing = ref(false);
const drawComplete = ref(false);
const raffleDrawResponse = ref<RaffleDrawResponse | null>(null);
const raffleDetails = ref<RaffleDetails | null>(null);
  const topTicketHolderList = ref<TopTicketHolder[]>([]);

const startDraw = () => {
  isDrawing.value = true;
    // Simulate heavy draw animation

  setTimeout(() => {
    isDrawing.value = false;
    drawComplete.value = true;
    // selectedWinner.value = {
    //   name: 'Emmanuel Addo',
    //   ticket: '#CHOP-992-881',
    //   phone: '+233 24 ••• ••88'
    // };
  }, 3000);


};

const getTopRaffleTicketHolders = async () => {
    try {
      const result = await getTopTicketHolders(raffleId);
      topTicketHolderList.value = result;
        
    } catch (error) {
        console.error('Unable to fetch top ticket holders.');
    }
}

const getRaffleInfo = async () => {
    try {
      const result = await getRaffleDetails(raffleId);
      raffleDetails.value = result
        
    } catch (error) {
        console.error('Unable to fetch raffle details.');
    }
}

//const getProgress = computed(() => (raffle.value.soldTickets / raffle.value.totalTickets) * 100);
const revenue = computed(() => raffle.value.soldTickets * raffle.value.ticketPrice);

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(val);
};

const drawStatusDetails = computed(() => {
  const status = raffleDetails.value?.status?.toUpperCase();
  
  if (status === 'COMPLETED') {
    return {
      title: 'Draw Status',
      value: 'COMPLETED',
      footer: `Ended on ${standardDateFormat(raffleDetails.value?.drawTime)}`,
      color: 'text-emerald-500'
    }
  }
  
  if (status === 'ACTIVE') {
    return {
      title: 'Drawing Scheduled',
      value: rawTimeFormat(raffleDetails.value?.drawTime) || '--:--',
      footer: 'Processing entries...',
      color: 'text-blue-500'
    }
  }

  return {
    title: 'Drawing In',
    value: rawTimeFormat(raffleDetails.value?.drawTime) || '--:--',
    footer: `Scheduled: ${standardDateFormat(raffleDetails.value?.drawTime)}`,
    color: 'text-slate-400'
  }
})

onMounted(async () => {
    
    
    await getTopRaffleTicketHolders();
    await getRaffleInfo()

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
            <h1 class="text-2xl font-black text-slate-900 tracking-tight">{{ raffleDetails?.name }}</h1>
            <span class="px-2.5 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
               {{ raffleDetails?.status }}
            </span>
          </div>
          <p class="text-slate-400 text-sm font-medium flex items-center gap-2">
            Alias: <span class="font-bold text-slate-600 tracking-wider">{{ raffleDetails?.slug }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button class="flex items-center gap-2 px-5 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-all">
          <ShareIcon class="w-4 h-4 text-slate-400" />
          Share Public Link
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <BanknotesIcon class="w-24 h-24 text-primary" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Prize Pool</p>
        <h3 class="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{{ _currency(raffleDetails?.prizePool) }}</h3>
      </div>

      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <TicketIcon class="w-24 h-24 text-secondary" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Tickets Sold</p>
        <h3 class="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{{ raffleDetails?.totalEntries }}</h3>
        <!-- <div class="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
          <div class="bg-secondary h-full rounded-full transition-all duration-1000" :style="{ width: `${getProgress}%` }"></div>
        </div> -->
      </div>

      <div class="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group">
        <div class="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
          <ChartBarIcon class="w-24 h-24 text-amber-500" />
        </div>
        <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Revenue</p>
        <h3 class="text-3xl font-black text-slate-900 mb-1 tracking-tighter">{{ formatCurrency(revenue) }}</h3>
        <p class="text-slate-400 text-xs font-bold">Price: {{ formatCurrency(raffle.ticketPrice) }} / ticket</p>
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
        <div 
            class="rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden min-h-[400px] flex flex-col items-center justify-center text-center shadow-[0_30px_60px_rgba(0,0,0,0.3)]"
            style="background-color: #1A1A1A;"
        >
            <!-- Background Animation Layer -->
            <div class="absolute inset-0 opacity-20 pointer-events-none">
                <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1E40AF]/40 via-transparent to-transparent"></div>
            </div>

            <div v-if="!isDrawing && !drawComplete" class="relative z-10 space-y-8 max-w-md">
                <div class="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center mx-auto border border-white/20 shadow-2xl">
                    <TrophyIcon class="w-12 h-12" style="color: #FBBF24;" />
                </div>
                <div>
                   <h2 class="text-3xl font-black mb-3 tracking-tight" style="color: #FBBF24;">Ready to roll?</h2>
                   <p class="text-slate-400 font-medium">Click to initiate the high-security random draw protocol. Once started, this action cannot be undone.</p>
                </div>
                <button 
                    @click="startDraw"
                    class="w-full bg-secondary hover:bg-secondary-dark text-white py-5 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-red-900/50 transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                >
                    <PlayIcon class="w-6 h-6" />
                    Initiate Final Draw
                </button>
            </div>

            <div v-else-if="isDrawing" class="relative z-10 space-y-8">
                <div class="w-32 h-32 relative mx-auto">
                    <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <ArrowPathIcon class="w-20 h-20 text-blue-400 animate-spin" />
                    </div>
                </div>
                <div>
                    <h2 class="text-3xl font-black mb-2 tracking-tight">Selecting Winner...</h2>
                    <p class="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Sifting through 9,200 valid entries</p>
                </div>
            </div>

            <div v-else-if="drawComplete" class="relative z-10 space-y-8 animate-in fade-in zoom-in duration-1000">
                <div class="w-28 h-28 bg-emerald-500 rounded-[32px] flex items-center justify-center mx-auto shadow-[0_20px_50px_rgba(16,185,129,0.3)] border-4 border-white/20">
                    <CheckCircleIcon class="w-16 h-16 text-white" />
                </div>
                <div>
                   <p class="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em] mb-4">We have a winner!</p>
                   <h2 class="text-5xl font-black mb-2 tracking-tighter">{{ raffleDrawResponse?.ultimateWinnerCustomer.name }}</h2>
                   <p class="text-2xl font-black text-slate-300 tracking-tight">{{ raffleDrawResponse?.winningColourTicketNumber }}</p>
                </div>
                <div class="flex flex-col items-center gap-2 text-slate-400 text-sm font-bold uppercase tracking-widest py-4 border-y border-white/10 px-8">
                   <span>Phone: {{ raffleDrawResponse?.ultimateWinnerCustomer.msisdn }}</span>
                </div>
                <button class="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest transition-all hover:bg-slate-100">
                    Process Prize Distribution
                </button>
            </div>
        </div>

        <!-- Participants Summary -->
        <div class="bg-white rounded-[40px] border border-slate-100 overflow-hidden shadow-sm">
            <div class="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 class="text-lg font-black text-slate-900 tracking-tight">Top Ticket Holders</h3>
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
                        <tr v-for="topTicketHolder in topTicketHolderList" :key="topTicketHolder.msisdn" class="hover:bg-slate-50/30 transition-colors">
                            <td class="px-8 py-5">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs">N/A</div>
                                    <div>
                                        <p class="font-bold text-slate-800 text-sm">N/A</p>
                                        <p class="text-[11px] text-slate-400 font-medium">{{ topTicketHolder.msisdn }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-5 font-mono text-xs font-bold text-slate-500">#{{ topTicketHolder.ticketNumber }}</td>
                            <td class="px-8 py-5">
                                <span class="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest rounded-lg">{{ topTicketHolder.totalTickets }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- RNG Fairness Logs -->
        <div v-if="drawComplete" 
             class="rounded-[40px] border border-white/5 overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom duration-1000"
             style="background-color: #1A1A1A;"
        >
            <div class="p-8 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-sm">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                        <ShieldCheckIcon class="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                        <h3 class="text-lg font-black text-white tracking-tight">RNG Fairness Audit Logs</h3>
                        <p class="text-xs text-slate-500 font-bold uppercase tracking-widest">Protocol Integrity Verification</p>
                    </div>
                </div>
                <button class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Verify Proof
                </button>
            </div>
            <div class="p-0 overflow-x-auto">
                <table class="w-full text-left">
                    <thead>
                        <tr class="bg-white/5">
                            <th class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Log ID / Type</th>
                            <th class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Seed Value</th>
                            <th class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Generated</th>
                            <th class="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-white/5">
                        <tr v-for="log in rngLogs" :key="log.id" class="hover:bg-white/[0.02] transition-colors group">
                            <td class="px-8 py-5">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                        <FingerPrintIcon class="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <p class="font-bold text-slate-200 text-xs">{{ log.id }}</p>
                                        <p class="text-[9px] text-primary-400 font-black uppercase tracking-widest">{{ log.rng_type }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-8 py-5">
                                <div class="flex items-center gap-2">
                                    <CommandLineIcon class="w-3.5 h-3.5 text-slate-600" />
                                    <span class="font-mono text-[10px] font-bold text-slate-400 truncate max-w-[120px]">{{ log.seed_value }}</span>
                                </div>
                            </td>
                            <td class="px-8 py-5">
                                <span class="px-2.5 py-1 bg-amber-500/10 text-amber-500 text-[10px] font-black font-mono border border-amber-500/20 rounded-lg">
                                    {{ log.generated_value }}
                                </span>
                            </td>
                            <td class="px-8 py-5">
                                <div class="text-right flex flex-col items-end">
                                    <p class="text-[11px] text-slate-300 font-bold">{{ log.generated_at }}</p>
                                    <p class="text-[9px] text-slate-600 font-black uppercase tracking-widest">{{ log.created_by }}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
      </div>

      <!-- Raffle Sidebar Info -->
      <div class="space-y-8">
          <!-- Prize Tiers -->
          <div class="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 class="text-lg font-black text-slate-900 tracking-tight mb-6"> Winners </h3>
              <div class="space-y-6">
                  <div v-if="!raffleDetails?.prizeWinnerTiers?.length" class="text-center py-8">
                      <p class="text-slate-400 text-sm font-medium">No prize tiers defined.</p>
                  </div>
                  <div v-else v-for="tier in raffleDetails.prizeWinnerTiers" :key="tier.name" class="flex items-start gap-4 p-4 rounded-3xl bg-slate-50 border border-slate-100">
                      <div class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm">
                          <TrophyIcon class="w-5 h-5" />
                      </div>
                      <div class="flex-1">
                          <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{{ tier.name }}</p>
                          <p class="text-lg font-black text-slate-900 tracking-tight">{{ formatCurrency(tier.amount) }}</p>
                          <p class="text-[11px] text-slate-500 font-bold mt-1">{{ tier.winners }} Winner Seat{{ tier.winners > 1 ? 's' : '' }}</p>
                      </div>
                  </div>
              </div>
          </div>

          <!-- Quick Actions -->
          <div class="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm">
              <h3 class="text-lg font-black text-slate-900 tracking-tight mb-6">Quick Actions</h3>
              <div class="grid grid-cols-1 gap-3">
                  <button class="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-primary hover:text-white transition-all group">
                      <div class="flex items-center gap-3">
                        <UsersIcon class="w-5 h-5 text-slate-400 group-hover:text-white" />
                        <span class="text-sm font-black uppercase tracking-widest text-[11px]">Download CRM List</span>
                      </div>
                  </button>
                  <button class="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-primary hover:text-white transition-all group">
                      <div class="flex items-center gap-3">
                        <ChartBarIcon class="w-5 h-5 text-slate-400 group-hover:text-white" />
                        <span class="text-sm font-black uppercase tracking-widest text-[11px]">Sales Analytics</span>
                      </div>
                  </button>
                  <button class="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-secondary hover:text-white transition-all group">
                      <div class="flex items-center gap-3">
                        <ClockIcon class="w-5 h-5 text-slate-400 group-hover:text-white" />
                        <span class="text-sm font-black uppercase tracking-widest text-[11px]">Extend Deadline</span>
                      </div>
                  </button>
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
