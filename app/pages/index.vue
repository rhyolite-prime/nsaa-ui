<script setup lang="ts">
import { 
  UsersIcon, 
  TicketIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  ArrowUpRightIcon,
  ArrowDownRightIcon,
  TrophyIcon,
  ClockIcon
} from '@heroicons/vue/24/outline';

// Stats data
const stats = [
  { name: 'Total Revenue', value: 'GHS 245,000', change: '+12.5%', trend: 'up', icon: BanknotesIcon },
  { name: 'Active Entries', value: '49,230', change: '+3.2%', trend: 'up', icon: TicketIcon },
  { name: 'Total Winners', value: '1,284', change: '+18.4%', trend: 'up', icon: TrophyIcon },
  { name: 'Pending Payouts', value: 'GHS 15,400', change: '-4.1%', trend: 'down', icon: BanknotesIcon },
];

// Entry breakdown by color
const colorBreakdown = [
  { name: 'Red', count: 12450, color: 'bg-raffle-red', text: 'text-raffle-red' },
  { name: 'Gold', count: 15320, color: 'bg-raffle-gold', text: 'text-raffle-gold' },
  { name: 'Green', count: 11460, color: 'bg-raffle-green', text: 'text-raffle-green' },
  { name: 'Black Star', count: 10000, color: 'bg-raffle-black', text: 'text-raffle-black' },
];

const totalEntries = computed(() => colorBreakdown.reduce((acc, curr) => acc + curr.count, 0));

// Advanced Draw Statistics (based on public.draw_statistics view)
const drawStats = ref([
  {
    id: 'DRW-FEB-001',
    draw_code: 'VAL-2026-X',
    draw_date: '2026-02-14 18:00',
    status: 'Completed',
    winning_colour: 'Gold',
    total_entries: 48200,
    total_revenue: 241000,
    total_liability: 185000,
    unique_participants: 12450,
    winning_option_entries: 15320,
    total_winners: 3,
    ultimate_winners: 1,
     
  },
  {
    id: 'DRW-FEB-002',
    draw_code: 'WKD-2026-Y',
    draw_date: '2026-02-07 18:00',
    status: 'Completed',
    winning_colour: 'Red',
    total_entries: 42100,
    total_revenue: 210500,
    total_liability: 162000,
    unique_participants: 10800,
    winning_option_entries: 12450,
    total_winners: 3,
    ultimate_winners: 1,
     
  }
]);

// Customer Participation Data (based on public.customer_participation view)
const customerStats = ref([
  {
    id: 'CUST-001',
    msisdn: '233541112233',
    customer_name: 'Emmanuel Addo',
    draws_participated: 45,
    total_tickets: 120,
    total_spent: 600,
    times_won: 4,
    total_won: 5000,
    cashbacks_received: 12,
    total_cashback: 60
  },
  {
    id: 'CUST-002',
    msisdn: '233204445566',
    customer_name: 'Kwame Mensah',
    draws_participated: 38,
    total_tickets: 95,
    total_spent: 475,
    times_won: 2,
    total_won: 1500,
    cashbacks_received: 8,
    total_cashback: 47.5
  },
  {
    id: 'CUST-003',
    msisdn: '233247778899',
    customer_name: 'Abena Mansa',
    draws_participated: 30,
    total_tickets: 80,
    total_spent: 400,
    times_won: 1,
    total_won: 500,
    cashbacks_received: 5,
    total_cashback: 40
  }
]);
</script>

<template>
  <div class="space-y-12 font-sans pb-16 text-slate-900">
    <!-- Page Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-slate-900">Executive Dashboard</h1>
        <p class="text-slate-400 font-bold text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Real-time Raffle Analytics & Ops
        </p>
      </div>
      <div class="flex items-center gap-4">
        <button class="flex items-center gap-3 px-6 py-3 bg-white border border-slate-100 rounded-[20px] text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all shadow-sm hover:shadow-md active:scale-95">
           <ChartBarIcon class="w-4 h-4 text-primary" />
           Export Analytics
        </button>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-slate-900">
      <div v-for="stat in stats" :key="stat.name" class="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group">
        <div class="flex items-center justify-between mb-4">
          <div class="p-4 rounded-2xl bg-slate-50 text-slate-600 group-hover:bg-primary group-hover:text-white transition-all duration-500">
            <component :is="stat.icon" class="w-6 h-6" />
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black" :class="stat.trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
            <ArrowUpRightIcon v-if="stat.trend === 'up'" class="w-3.5 h-3.5" />
            <ArrowDownRightIcon v-else class="w-3.5 h-3.5" />
            <span>{{ stat.change }}</span>
          </div>
        </div>
        <div>
          <p class="text-[10px] uppercase font-black text-slate-400 tracking-widest ml-1">{{ stat.name }}</p>
          <h3 class="text-2xl font-black mt-1 tracking-tight">{{ stat.value }}</h3>
        </div>
      </div>
    </div>

    <!-- Advanced Analytics Row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <!-- Participation Engagement (Draw Statistics Insight) -->
      <div class="xl:col-span-2 bg-white rounded-[40px] shadow-sm border border-slate-100/80 p-10 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-64 h-64 bg-slate-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
        
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 relative z-10">
          <div>
            <h3 class="text-xl font-black tracking-tight">Participation & Winner Efficiency</h3>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Metrics from draw_statistics view</p>
          </div>
          <div class="flex gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
             <button class="px-4 py-1.5 bg-white shadow-sm rounded-xl text-[10px] font-black uppercase tracking-widest text-primary">Unique Players</button>
             <button class="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400">Yield</button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          <div v-for="idx in [0, 1]" :key="drawStats[idx].id" class="p-6 bg-slate-50/50 border border-slate-100 rounded-3xl group hover:bg-white hover:shadow-lg transition-all">
             <div class="flex items-center justify-between mb-4">
                <span class="text-[10px] font-black uppercase tracking-widest text-slate-400">{{ drawStats[idx].draw_code }}</span>
                <span class="w-2.5 h-2.5 rounded-full" :class="drawStats[idx].winning_colour === 'Gold' ? 'bg-raffle-gold' : 'bg-raffle-red'"></span>
             </div>
             <div class="space-y-4">
                <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yield %</p>
                   <p class="text-xl font-black">{{ ((drawStats[idx].winning_colour_entries / drawStats[idx].total_entries) * 100).toFixed(1) }}%</p>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                   <div class="h-full bg-primary transition-all duration-1000" :style="{ width: `${(drawStats[idx].winning_colour_entries / drawStats[idx].total_entries) * 100}%` }"></div>
                </div>
                <div class="flex justify-between items-center text-[10px] font-bold text-slate-500 uppercase">
                   <span>{{ (drawStats[idx]?.unique_participants || 0).toLocaleString() }} Unique</span>
                   <span class="text-slate-900">{{ drawStats[idx]?.cashback_recipients || 0 }} CB</span>
                </div>
             </div>
          </div>
          
          <!-- Winner Tier Breakdown -->
          <div class="bg-primary-900 rounded-3xl p-6 text-white relative flex flex-col justify-between overflow-hidden shadow-2xl">
              <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
              <div>
                <p class="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-4">Tier Distribution</p>
                <div class="space-y-3">
                   <div class="flex items-center justify-between group cursor-help">
                      <div class="flex items-center gap-2">
                         <div class="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                         <span class="text-[11px] font-black uppercase tracking-widest text-primary-100">Ultimate</span>
                      </div>
                      <span class="text-sm font-black">{{ drawStats[0]?.ultimate_winners || 0 }}</span>
                   </div>
                   <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                         <div class="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                         <span class="text-[11px] font-black uppercase tracking-widest text-primary-100">Tier 2</span>
                      </div>
                      <span class="text-sm font-black">{{ drawStats[0]?.tier2_winners || 0 }}</span>
                   </div>
                   <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                         <div class="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                         <span class="text-[11px] font-black uppercase tracking-widest text-primary-100">Tier 3</span>
                      </div>
                      <span class="text-sm font-black">{{ drawStats[0]?.tier3_winners || 0 }}</span>
                   </div>
                </div>
              </div>
              <div class="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                 <p class="text-[10px] font-bold text-primary-300 uppercase">Total Prize Pool</p>
                 <span class="text-xs font-black tracking-tight">GHS {{ ((drawStats[0]?.total_pool || 0) / 1000).toFixed(0) }}K</span>
              </div>
          </div>
        </div>
      </div>

      <!-- Entry Breakdown by Color -->
      <div class="bg-white rounded-[40px] shadow-sm border border-slate-100/80 p-10 flex flex-col">
        <div class="flex justify-between items-center mb-10">
          <div>
            <h3 class="text-xl font-black tracking-tight">Sale Volumes</h3>
            <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Ticket Distribution</p>
          </div>
          <button class="w-10 h-10 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-primary transition-all">
             <ArrowUpRightIcon class="w-4 h-4" />
          </button>
        </div>
        
        <div class="space-y-8 flex-1">
          <div v-for="color in colorBreakdown" :key="color.name">
            <div class="flex justify-between items-center mb-3">
              <span class="text-[11px] font-black uppercase tracking-widest flex items-center gap-2.5">
                <span class="w-2 h-2 rounded-full" :class="color.color"></span>
                {{ color.name }}
              </span>
              <span class="text-[10px] text-slate-400 font-black">
                {{ (color.count || 0).toLocaleString() }}
              </span>
            </div>
            <div class="w-full bg-slate-50 border border-slate-100 rounded-full h-3 p-0.5">
              <div 
                class="rounded-full h-full transition-all duration-1000 shadow-sm shadow-black/5" 
                :class="color.color"
                :style="{ width: `${(color.count / totalEntries) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>

        <div class="mt-10 p-5 bg-slate-900 rounded-[24px] text-white flex items-center justify-between">
           <div>
              <p class="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] mb-1">Total Entries</p>
              <p class="text-xl font-black tracking-tight">{{ (totalEntries || 0).toLocaleString() }}</p>
           </div>
           <div class="text-right">
              <p class="text-[9px] font-black uppercase text-emerald-400 tracking-[0.2em] mb-1">Growth</p>
              <p class="text-xs font-black tracking-tight">+14.2%</p>
           </div>
        </div>
      </div>
    </div>

    <!-- Customer Engagement Analytics (based on public.customer_participation view) -->
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-2xl font-black tracking-tight">Customer Engagement Analysis</h3>
          <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">Metrics from customer_participation view</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Quick Insight Cards -->
        <div class="lg:col-span-1 space-y-6">
          <div class="bg-indigo-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
             <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
             <TrophyIcon class="w-8 h-8 text-indigo-400 mb-6" />
             <p class="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1">Total Prizes Won</p>
             <h4 class="text-3xl font-black tracking-tighter">GHS {{ (customerStats.reduce((acc, c) => acc + (c.total_won || 0), 0) / 1000).toFixed(1) }}K+</h4>
             <p class="text-[9px] text-indigo-200/60 mt-4 font-bold uppercase tracking-widest italic">Top 3 Players Contribution</p>
          </div>
          
          <div class="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
             <div class="flex items-center gap-4 mb-6">
                <div class="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500">
                   <BanknotesIcon class="w-5 h-5" />
                </div>
                <div>
                   <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Ticket Spend</p>
                   <p class="text-lg font-black tracking-tight text-slate-900">GHS {{ (customerStats.reduce((acc, c) => acc + (c.total_spent || 0), 0) / customerStats.reduce((acc, c) => acc + (c.total_tickets || 1), 0)).toFixed(2) }}</p>
                </div>
             </div>
             <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500 transition-all duration-1000" style="width: 72%"></div>
             </div>
          </div>
        </div>

        <!-- Top Participants Ledger -->
        <div class="lg:col-span-3 bg-white rounded-[40px] shadow-sm border border-slate-100/80 overflow-hidden">
          <div class="px-10 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
            <h3 class="text-lg font-black text-slate-800 tracking-tight">Player Participation Ledger</h3>
            <span class="px-4 py-1.5 bg-slate-50 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">Sorted by Total Tickets</span>
          </div>
          <div class="overflow-x-auto bg-white">
            <table class="w-full text-left">
              <thead>
                <tr class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
                  <th class="px-10 py-5">Customer Name & MSISDN</th>
                  <th class="px-10 py-5">Draws</th>
                  <th class="px-10 py-5">Tickets / Spent</th>
                  <th class="px-10 py-5">Wins / ROI</th>
                  <th class="px-10 py-5 text-right">Cashbacks</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50 text-xs">
                <tr v-for="customer in customerStats" :key="customer.id" class="hover:bg-slate-50/50 transition-colors group">
                  <td class="px-10 py-6">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                        {{ customer.customer_name.charAt(0) }}
                      </div>
                      <div class="flex flex-col">
                        <span class="font-black text-slate-800">{{ customer.customer_name }}</span>
                        <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ customer.msisdn }}</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-10 py-6 font-black text-slate-700 tracking-tight">{{ customer.draws_participated }} <span class="text-[9px] text-slate-400 uppercase">Draws</span></td>
                  <td class="px-10 py-6">
                    <div class="flex flex-col">
                      <span class="font-bold text-slate-800">{{ customer.total_tickets }} Tix</span>
                      <span class="text-[10px] text-slate-400 font-bold">GHS {{ customer.total_spent }}</span>
                    </div>
                  </td>
                  <td class="px-10 py-6">
                    <div class="flex flex-col">
                      <span class="font-bold text-emerald-600">{{ customer.times_won }} Wins</span>
                      <span class="text-[10px] text-slate-400 font-bold">ROI: {{ ((customer.total_won / (customer.total_spent || 1)) * 100).toFixed(0) }}%</span>
                    </div>
                  </td>
                  <td class="px-10 py-6 text-right">
                    <div class="inline-flex flex-col items-end">
                      <span class="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-[9px] font-black uppercase border border-amber-100">{{ customer.cashbacks_received }} Recvd</span>
                      <span class="text-[9px] text-slate-400 font-bold mt-1">GHS {{ customer.total_cashback }} Total</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Logs / Recent Activity -->
    <div class="bg-white rounded-[40px] shadow-sm border border-slate-100/80 overflow-hidden text-slate-900">
      <div class="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-white">
        <div>
          <h3 class="text-xl font-black text-slate-800 tracking-tight">Recent Draw Ledger</h3>
          <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Historical Draw Statistics View</p>
        </div>
        <button class="p-3 bg-slate-50 border border-slate-100 hover:bg-slate-100 rounded-2xl text-slate-400 transition-all">
           <ClockIcon class="w-5 h-5" />
        </button>
      </div>
      <div class="overflow-x-auto bg-white">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
              <th class="px-10 py-5">Draw Code</th>
              <th class="px-10 py-5">Date & Time</th>
              <th class="px-10 py-5">Winning Color</th>
              <th class="px-10 py-5">Participants</th>
              <th class="px-10 py-5">Winners</th>
              <th class="px-10 py-5">Total Prizes</th>
              <th class="px-10 py-5 text-right">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50 text-xs">
            <tr v-for="draw in drawStats" :key="draw.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-10 py-6 font-black text-slate-700 tracking-tight">{{ draw.draw_code }}</td>
              <td class="px-10 py-6 text-slate-500 font-bold uppercase tracking-tighter">{{ draw.draw_date }}</td>
              <td class="px-10 py-6">
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border border-slate-100 shadow-sm"
                  :class="[
                    draw.winning_colour === 'Red' ? 'bg-red-50 text-red-700' : 
                    draw.winning_colour === 'Gold' ? 'bg-amber-50 text-amber-700' :
                    'bg-emerald-50 text-emerald-700'
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full animate-pulse" 
                    :class="[
                      draw.winning_colour === 'Red' ? 'bg-red-500' : 
                      draw.winning_colour === 'Gold' ? 'bg-amber-500' :
                      'bg-emerald-500'
                    ]"
                  ></span>
                  {{ draw.winning_colour }}
                </span>
              </td>
              <td class="px-10 py-6 font-bold text-slate-600">
                <div class="flex flex-col">
                  <span>{{ (draw.unique_participants || 0).toLocaleString() }} Unique</span>
                  <span class="text-[9px] text-slate-400">{{ (draw.total_entries || 0).toLocaleString() }} Entries</span>
                </div>
              </td>
              <td class="px-10 py-6 font-bold text-slate-900">
                 <div class="flex flex-col">
                    <span>{{ draw.total_winners }} Winners</span>
                    <span class="text-[9px] text-emerald-500 uppercase font-black">{{ draw.ultimate_winners }} Ultimate</span>
                 </div>
              </td>
              <td class="px-10 py-6 font-black text-slate-900 tracking-tight">GHS {{ (draw.total_prizes / 1000).toFixed(0) }}K</td>
              <td class="px-10 py-6 text-right">
                <span class="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-200">
                  {{ draw.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>


.bg-raffle-red { background-color: #DC2626; }
.bg-raffle-gold { background-color: #FBBF24; }
.bg-raffle-green { background-color: #10B981; }
.bg-raffle-black { background-color: #000000; }

.text-raffle-red { color: #DC2626; }
.text-raffle-gold { color: #FBBF24; }
.text-raffle-green { color: #10B981; }

/* Scrollbar styling for tables */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}
.overflow-x-auto::-webkit-scrollbar-track {
  background: #f8fafc;
}
.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}
</style>
