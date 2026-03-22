<script setup lang="ts">
import { 
  TrophyIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  UserPlusIcon, 
  CreditCardIcon,
  MagnifyingGlassIcon,
  FunnelIcon, 
  ArrowRightIcon,
  ClockIcon
} from '@heroicons/vue/24/outline';

const winners = [
  { id: 'WIN-001', name: 'Kofi Mensah', phone: '024 445 1293', prize: 'GHS 5,000', tier: 'Ultimate Winner', idStatus: 'Verified', payoutStatus: 'Paid', date: '2026-02-15' },
  { id: 'WIN-002', name: 'Ama Serwaa', phone: '055 112 3940', prize: 'GHS 1,000', tier: 'Tier 2', idStatus: 'Verified', payoutStatus: 'Processing', date: '2026-02-15' },
  { id: 'WIN-003', name: 'John Doe', phone: '020 998 7765', prize: 'GHS 1,000', tier: 'Tier 2', idStatus: 'Pending', payoutStatus: 'Pending', date: '2026-02-15' },
  { id: 'WIN-004', name: 'Sika Ba', phone: '024 445 1111', prize: 'GHS 500', tier: 'Tier 3', idStatus: 'Rejected', payoutStatus: 'Blocked', date: '2026-02-15' },
];

const getTierClass = (tier: string) => {
  switch (tier) {
    case 'Ultimate Winner': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Tier 2': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'Tier 3': return 'bg-slate-100 text-slate-700 border-slate-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};
</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Winner Circle</h1>
        <p class="text-slate-500 text-sm font-medium">Verify IDs and track payouts.</p>
      </div>
      <div class="flex gap-2">
         <button class="bg-primary-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-950 transition-all flex items-center gap-2 shadow-lg active:scale-95">
            <UserPlusIcon class="w-4 h-4 stroke-2" />
            Bulk Verify
         </button>
      </div>
    </div>

    <!-- Featured Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div class="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden group">
          <TrophyIcon class="absolute -right-6 -bottom-6 w-40 h-40 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
          <h4 class="text-[10px] font-black opacity-70 uppercase tracking-widest mb-4">Ultimate Winner</h4>
          <p class="text-3xl font-black mb-1 tracking-tight">Kofi Mensah</p>
          <p class="text-amber-100 text-sm font-bold opacity-90">Prize: GHS 5,000</p>
          <button class="mt-8 bg-white/20 hover:bg-white/30 text-white text-[10px] font-black uppercase tracking-widest py-3 px-6 rounded-xl backdrop-blur-md transition-all flex items-center gap-2 w-fit">
             Release Payout <ArrowRightIcon class="w-4 h-4" />
          </button>
       </div>
       <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pending ID Check</h4>
            <p class="text-4xl font-black text-slate-900 tracking-tight">12</p>
          </div>
          <div class="h-2.5 w-full bg-slate-50 rounded-full mt-8 overflow-hidden">
             <div class="h-full bg-blue-500 rounded-full shadow-sm shadow-blue-200" style="width: 45%"></div>
          </div>
       </div>
       <div class="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div>
            <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Disbursed</h4>
            <p class="text-4xl font-black text-slate-900 tracking-tight">GHS 12.5k</p>
          </div>
          <p class="text-[10px] text-emerald-600 font-black uppercase tracking-widest flex items-center gap-2 mt-8">
             <CheckCircleIcon class="w-4 h-4" /> 85% Completed
          </p>
       </div>
    </div>

    <!-- Winners Table -->
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="p-6 border-b border-slate-50 bg-slate-50/20 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
         <div class="flex gap-1 overflow-x-auto pb-1 lg:pb-0">
            <button class="px-5 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">All</button>
            <button class="px-5 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary-600 transition-colors">Pending</button>
            <button class="px-5 py-2 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-primary-600 transition-colors">Ready</button>
         </div>
         <div class="relative lg:w-72">
            <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search winners..." class="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/10" />
         </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th class="px-8 py-5">Winner ID</th>
              <th class="px-8 py-5">Recipient</th>
              <th class="px-8 py-5 text-center">Tier</th>
              <th class="px-8 py-5 text-right">Prize</th>
              <th class="px-8 py-5">ID Status</th>
              <th class="px-8 py-5">Payout</th>
              <th class="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="text-xs divide-y divide-slate-50 text-slate-600">
            <tr v-for="winner in winners" :key="winner.id" class="hover:bg-slate-50/50 transition-colors group">
              <td class="px-8 py-6 font-black text-slate-400 text-[10px] uppercase tracking-wider">{{ winner.id }}</td>
              <td class="px-8 py-6">
                <div class="font-black text-slate-800 tracking-tight text-sm">{{ winner.name }}</div>
                <div class="text-[10px] font-bold text-slate-400 mt-0.5 tracking-wider">{{ winner.phone }}</div>
              </td>
              <td class="px-8 py-6 text-center">
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border" :class="getTierClass(winner.tier)">
                   {{ winner.tier }}
                </span>
              </td>
              <td class="px-8 py-6 font-black text-slate-900 text-sm text-right tracking-tight">{{ winner.prize }}</td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <CheckCircleIcon v-if="winner.idStatus === 'Verified'" class="w-4 h-4 text-emerald-500" />
                  <ClockIcon v-else-if="winner.idStatus === 'Pending'" class="w-4 h-4 text-amber-500" />
                  <XCircleIcon v-else class="w-4 h-4 text-rose-500" />
                  <span class="font-black uppercase text-[9px] tracking-widest" :class="[
                    winner.idStatus === 'Verified' ? 'text-emerald-600' :
                    winner.idStatus === 'Pending' ? 'text-amber-600' : 'text-rose-600'
                  ]">{{ winner.idStatus }}</span>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full" :class="[
                    winner.payoutStatus === 'Paid' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                    winner.payoutStatus === 'Processing' ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' :
                    winner.payoutStatus === 'Blocked' ? 'bg-rose-500' : 'bg-slate-300'
                  ]"></span>
                  <span class="font-black uppercase text-[9px] tracking-widest text-slate-700">{{ winner.payoutStatus }}</span>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <button class="text-primary-600 hover:text-primary-800 font-black uppercase text-[10px] tracking-widest">Detail</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
