<script setup lang="ts">
import { 
  CreditCardIcon, 
  ArrowUpRightIcon, 
  ArrowDownRightIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline';

const disbursements = [
  { id: 'PAY-88201', recipient: 'Kofi Mensah', method: 'MTN Mobile Money', amount: 'GHS 5,000.00', status: 'Completed', date: '2026-02-15 14:20' },
  { id: 'PAY-88202', recipient: 'Ama Serwaa', method: 'Vodafone Cash', amount: 'GHS 1,000.00', status: 'Pending', date: '2026-02-15 15:45' },
  { id: 'PAY-88203', recipient: 'Kwame Appiah', method: 'GCB Bank', amount: 'GHS 2,500.00', status: 'Failed', date: '2026-02-14 11:30' },
  { id: 'PAY-88204', recipient: 'Yaaba Koom', method: 'AirtelTigo Money', amount: 'GHS 500.00', status: 'Completed', date: '2026-02-14 09:15' },
];

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-700';
    case 'Pending': return 'bg-amber-100 text-amber-700';
    case 'Failed': return 'bg-rose-100 text-rose-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};
</script>

<template>
  <div class="space-y-6 font-sans">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight">Financial Tracking</h1>
        <p class="text-slate-500 text-sm font-medium">Monitor payouts and transfers.</p>
      </div>
      <button class="bg-secondary hover:bg-secondary-dark text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95">
        Batch Payout
      </button>
    </div>

    <!-- Payout Channels Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
       <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div class="p-4 bg-yellow-50 text-yellow-600 rounded-2xl group-hover:scale-110 transition-transform">
            <DevicePhoneMobileIcon class="w-6 h-6 stroke-2" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Money</p>
            <p class="text-2xl font-black text-slate-900 tracking-tight">GHS 85,420</p>
          </div>
       </div>
       <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div class="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
            <BanknotesIcon class="w-6 h-6 stroke-2" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bank Transfer</p>
            <p class="text-2xl font-black text-slate-900 tracking-tight">GHS 12,500</p>
          </div>
       </div>
       <div class="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 hover:shadow-md transition-shadow group">
          <div class="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
            <ExclamationCircleIcon class="w-6 h-6 stroke-2" />
          </div>
          <div>
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Failed Retries</p>
            <p class="text-2xl font-black text-slate-900 tracking-tight">14 Items</p>
          </div>
       </div>
    </div>

    <!-- Payout Table -->
    <div class="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="px-8 py-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/20 gap-4">
         <h3 class="font-black text-slate-800 tracking-tight uppercase text-xs tracking-widest">Latest Transfers</h3>
         <div class="flex gap-3 w-full md:w-auto">
            <div class="relative flex-1 md:w-64">
               <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
               <input type="text" placeholder="Search..." class="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/10 font-medium" />
            </div>
            <button class="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-slate-400 border border-slate-100 shadow-sm"><FunnelIcon class="w-4 h-4" /></button>
            <button class="p-2.5 bg-white hover:bg-slate-50 rounded-xl text-primary-600 border border-slate-100 shadow-sm"><ArrowDownTrayIcon class="w-4 h-4" /></button>
         </div>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-black">
            <tr>
              <th class="px-8 py-5">Transfer ID</th>
              <th class="px-8 py-5">Recipient</th>
              <th class="px-8 py-5">Method</th>
              <th class="px-8 py-5 text-right">Amount</th>
              <th class="px-8 py-5">Timestamp</th>
              <th class="px-8 py-5 text-center">Status</th>
              <th class="px-8 py-5 text-right">Invoice</th>
            </tr>
          </thead>
          <tbody class="text-xs divide-y divide-slate-50">
            <tr v-for="pay in disbursements" :key="pay.id" class="hover:bg-slate-50/30 transition-colors">
              <td class="px-8 py-6 font-mono text-slate-400 text-[9px] uppercase tracking-wider">{{ pay.id }}</td>
              <td class="px-8 py-6 font-black text-slate-900 tracking-tight text-sm">{{ pay.recipient }}</td>
              <td class="px-8 py-6">
                <div class="flex items-center gap-3">
                   <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                      <CreditCardIcon class="w-4 h-4 text-slate-500" />
                   </div>
                   <span class="text-[10px] font-bold text-slate-600">{{ pay.method }}</span>
                </div>
              </td>
              <td class="px-8 py-6 font-black text-slate-900 text-sm text-right tracking-tight">{{ pay.amount }}</td>
              <td class="px-8 py-6 text-[10px] text-slate-400 font-medium">{{ pay.date }}</td>
              <td class="px-8 py-6 text-center">
                <span class="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest" :class="getStatusStyles(pay.status)">
                   {{ pay.status }}
                </span>
              </td>
              <td class="px-8 py-6 text-right">
                 <button class="text-primary-600 hover:text-primary-800 text-[10px] font-black uppercase tracking-widest">Get PDF</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
