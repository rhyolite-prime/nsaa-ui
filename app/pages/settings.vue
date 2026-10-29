<script setup lang="ts">
import { 
  Cog6ToothIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  CpuChipIcon,
  GlobeAltIcon,
  FingerPrintIcon,
  PercentBadgeIcon,
  PuzzlePieceIcon,
  KeyIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline';

const activeTab = ref('general');

const tabs = [
  { id: 'general', name: 'General', icon: Cog6ToothIcon },
  { id: 'protocol', name: 'Draw Protocol', icon: CpuChipIcon },
  { id: 'security', name: 'Governance', icon: ShieldCheckIcon },
  { id: 'notifications', name: 'Notifications', icon: BellIcon }
];

const generalSettings = ref({
  portalName: 'Chop Money Raffle Admin',
  supportEmail: 'support@chopmoney.com',
  supportPhone: '+233 24 000 0000',
  timezone: 'GMT (UTC+0)',
  currency: 'GHS'
});

const protocolSettings = ref({
  rngSource: 'Quantum-PRNG',
  autoDrawEnabled: false,
  bufferTime: 15, // minutes
  retryAttempts: 3
});

const securitySettings = ref({
  sessionTimeout: 60, // minutes
  twoFactorAuth: true,
  ipWhitelisting: false,
  auditLogRetention: 90 // days
});

const notificationSettings = ref({
  smtpHost: 'smtp.mailgun.org',
  smtpPort: 587,
  smtpUser: 'postmaster@example.com',
  smtpPassword: 'secret_password',
  emailAlerts: true,
  systemLogs: true
});

const saveSettings = () => {
  // Simulate API call
  const toast = useNuxtApp().$toast;
  if (toast) {
    toast.success('Settings updated successfully');
  } else {
    alert('Settings updated successfully');
  }
};
</script>

<template>
  <div class="space-y-8 font-sans pb-12">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-black text-slate-900 tracking-tight mb-1">Backoffice Settings</h1>
        <p class="text-slate-400 font-medium text-sm">Configure portal behavior, security protocols, and system integrations.</p>
      </div>
      <button 
        @click="saveSettings"
        class="px-8 py-3 bg-primary hover:bg-primary-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg hover:-translate-y-1 active:scale-95"
      >
        Save Changes
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <!-- Sidebar Navigation -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-[40px] p-4 border border-slate-100 shadow-sm space-y-2 sticky top-8">
          <button 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black text-sm uppercase tracking-widest transition-all group',
              activeTab === tab.id 
                ? 'bg-blue-50 text-primary' 
                : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
            ]"
          >
            <component :is="tab.icon" :class="['w-6 h-6', activeTab === tab.id ? 'text-primary' : 'text-slate-300 group-hover:text-slate-400']" />
            {{ tab.name }}
          </button>
        </div>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-8">
        
        <!-- General Section -->
        <div v-if="activeTab === 'general'" class="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-right duration-500">
          <div class="flex items-center gap-4 border-b border-slate-50 pb-8">
             <div class="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-primary">
                <GlobeAltIcon class="w-8 h-8" />
             </div>
             <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">General Configuration</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Brand Identity & Support</p>
             </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-2">
              <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Portal Branding Name</label>
              <div class="relative group">
                <input v-model="generalSettings.portalName" type="text" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all group-hover:bg-white" />
              </div>
            </div>
            <div class="space-y-2">
               <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Default Multi-Currency</label>
               <select v-model="generalSettings.currency" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 focus:outline-none focus:border-primary appearance-none">
                  <option value="GHS">GHS - Ghana Cedi</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="NGN">NGN - Nigerian Naira</option>
               </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
             <div class="space-y-4">
               <div>
                 <h4 class="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                    <EnvelopeIcon class="w-4 h-4 text-blue-500" />
                    Support Email
                 </h4>
                 <input v-model="generalSettings.supportEmail" type="email" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700" />
               </div>
               <div>
                  <h4 class="text-sm font-black text-slate-900 flex items-center gap-2 mb-4">
                     <DevicePhoneMobileIcon class="w-4 h-4 text-emerald-500" />
                     Support Phone
                  </h4>
                  <input v-model="generalSettings.supportPhone" type="text" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700" />
               </div>
             </div>
             <div class="bg-blue-50/50 rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-blue-100 border-dashed group cursor-pointer hover:bg-blue-50 transition-all">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <PhotoIcon class="w-8 h-8 text-blue-400" />
                </div>
                <p class="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Click to Replace Logo</p>
                <p class="text-[10px] text-slate-400 font-medium">SVG, PNG, or WEBP (Max 2MB)</p>
             </div>
          </div>
        </div>

        <!-- Protocol Section -->
        <div v-if="activeTab === 'protocol'" class="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-right duration-500">
          <div class="flex items-center gap-4 border-b border-slate-50 pb-8">
             <div class="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500">
                <CpuChipIcon class="w-8 h-8" />
             </div>
             <div>
                <h3 class="text-xl font-black text-slate-900 tracking-tight">Draw & RNG Protocols</h3>
                <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Quantum Execution & Integrity</p>
             </div>
          </div>

          <div class="space-y-8">
            <div class="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                   <PuzzlePieceIcon class="w-6 h-6 text-slate-400" />
                </div>
                <div>
                   <p class="text-sm font-black text-slate-900">RNG Generation Source</p>
                   <p class="text-xs text-slate-500 font-bold">Standard: {{ protocolSettings.rngSource }}</p>
                </div>
              </div>
              <button class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-100 transition-all">
                 Configure Nodes
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div class="space-y-4">
                  <div class="flex items-center justify-between">
                     <p class="text-sm font-black text-slate-900">Automated Draw Initiation</p>
                     <button 
                        @click="protocolSettings.autoDrawEnabled = !protocolSettings.autoDrawEnabled"
                        :class="['w-14 h-7 rounded-full transition-all relative', protocolSettings.autoDrawEnabled ? 'bg-secondary' : 'bg-slate-200']"
                     >
                        <div :class="['absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm', protocolSettings.autoDrawEnabled ? 'right-1' : 'left-1']"></div>
                     </button>
                  </div>
                  <p class="text-[11px] text-slate-400 font-medium leading-relaxed">When enabled, the system will trigger the RNG draw protocol automatically at the scheduled time without manual admin intervention.</p>
               </div>
               <div class="space-y-4">
                  <div class="flex items-center justify-between">
                     <p class="text-sm font-black text-slate-900">Draw Buffer Time</p>
                     <span class="text-xs font-black text-secondary">{{ protocolSettings.bufferTime }} Mins</span>
                  </div>
                  <input v-model="protocolSettings.bufferTime" type="range" min="5" max="60" class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-secondary" />
                  <p class="text-[11px] text-slate-400 font-medium leading-relaxed">The quiet period before a draw where ticket sales are locked to ensure snapshot data integrity.</p>
               </div>
            </div>
          </div>
        </div>

        <!-- Security Section -->
        <div v-if="activeTab === 'security'" class="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-right duration-500">
           <div class="flex items-center gap-4 border-b border-slate-50 pb-8">
              <div class="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-secondary">
                 <ShieldCheckIcon class="w-8 h-8" />
              </div>
              <div>
                 <h3 class="text-xl font-black text-slate-900 tracking-tight">Access & Governance</h3>
                 <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Identity, Session, & Audit Logs</p>
              </div>
           </div>

           <div class="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div class="space-y-6">
                 <div>
                    <h4 class="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                       <KeyIcon class="w-4 h-4 text-blue-500" />
                       2-Step Verification
                    </h4>
                    <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Mandatory for High-Value Payouts</p>
                    <button 
                       @click="securitySettings.twoFactorAuth = !securitySettings.twoFactorAuth"
                       :class="['w-14 h-7 rounded-full transition-all relative', securitySettings.twoFactorAuth ? 'bg-primary' : 'bg-slate-200']"
                    >
                       <div :class="['absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm', securitySettings.twoFactorAuth ? 'right-1' : 'left-1']"></div>
                    </button>
                 </div>

                 <div>
                    <h4 class="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                       <KeyIcon class="w-4 h-4 text-blue-500" />
                       2-Factor Authentication
                    </h4>
                    <p class="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-4">Require Portal Admins to Use 2FA when signing in</p>
                    <button 
                       @click="securitySettings.twoFactorAuth = !securitySettings.twoFactorAuth"
                       :class="['w-14 h-7 rounded-full transition-all relative', securitySettings.twoFactorAuth ? 'bg-primary' : 'bg-slate-200']"
                    >
                       <div :class="['absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm', securitySettings.twoFactorAuth ? 'right-1' : 'left-1']"></div>
                    </button>
                 </div>

                 <div>
                    <h4 class="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                       <FingerPrintIcon class="w-4 h-4 text-emerald-500" />
                       Session Persistence
                    </h4>
                    <select v-model="securitySettings.sessionTimeout" class="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 mt-2">
                       <option :value="15">15 Minutes</option>
                       <option :value="30">30 Minutes</option>
                       <option :value="60">1 Hour</option>
                       <option :value="240">4 Hours</option>
                    </select>
                 </div>

                 <div>
                    <h4 class="text-sm font-black text-slate-900 mb-2 flex items-center gap-2">
                       <PercentBadgeIcon class="w-4 h-4 text-emerald-500" />
                       Prize Pool Percentage
                    </h4>
                    <input type="text" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-slate-500" placeholder="e.g. 70" />
                    <p class="mt-2 text-[11px] text-slate-400 font-medium leading-relaxed">
                       Percentage of total ticket sales allocated to the prize pool for each raffle draw. 
                       For example, if set to 70%, then 70% of all ticket revenue goes to the winning prize pool 
                       while the remaining percentage can be used for operational costs, commissions, or platform fees.
                    </p>
                 </div>





              </div>
              <div class="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
                 <div class="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:scale-125 transition-transform"></div>
                 <h4 class="text-sm font-black mb-4 tracking-tight flex items-center gap-2">
                    <ShieldCheckIcon class="w-5 h-5 text-blue-400" />
                    Security Baseline
                 </h4>
                 <div class="space-y-4">
                    <div class="flex items-center justify-between py-2 border-b border-white/10 text-[11px] font-bold text-slate-400">
                       <span>Last Audit Report</span>
                       <span class="text-white">2026-02-15</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-white/10 text-[11px] font-bold text-slate-400">
                       <span>RNG Cert Status</span>
                       <span class="text-emerald-400 font-black tracking-widest uppercase">Verified</span>
                    </div>
                    <div class="flex items-center justify-between py-2 pb-0 text-[11px] font-bold text-slate-400">
                       <span>Failed Logins (24h)</span>
                       <span class="text-white font-black">0</span>
                    </div>
                 </div>
                 <button class="w-full mt-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                    Generate Security PDF
                 </button>
              </div>
           </div>
        </div>

        <!-- Notifications Section -->
        <div v-if="activeTab === 'notifications'" class="bg-white rounded-[40px] p-8 md:p-12 border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-right duration-500">
          <div class="flex items-center gap-4 border-b border-slate-50 pb-8">
              <div class="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-500">
                 <BellIcon class="w-8 h-8" />
              </div>
              <div>
                 <h3 class="text-xl font-black text-slate-900 tracking-tight">System Notifications</h3>
                 <p class="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">Webhooks & Alert Logic</p>
              </div>
           </div>

           <div class="space-y-8">
              <div class="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                <div class="flex items-center justify-between">
                   <div class="flex items-center gap-4">
                      <div class="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                         <EnvelopeIcon class="w-6 h-6 text-indigo-400" />
                      </div>
                      <div>
                         <p class="text-sm font-black text-slate-900">SMTP Credentials</p>
                         <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">System Email Dispatch Services</p>
                      </div>
                   </div>
                   <button class="px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Connected</button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Host</label>
                       <input v-model="notificationSettings.smtpHost" type="text" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-slate-500" placeholder="smtp.example.com" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Port</label>
                       <input v-model="notificationSettings.smtpPort" type="number" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-slate-500" placeholder="587" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Username</label>
                       <input v-model="notificationSettings.smtpUser" type="text" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-slate-500" placeholder="postmaster@domain.com" />
                   </div>
                   <div class="space-y-2">
                       <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SMTP Password</label>
                       <div class="relative">
                          <input v-model="notificationSettings.smtpPassword" type="password" class="w-full bg-white border border-slate-200 rounded-2xl px-6 py-3 font-mono text-xs font-bold text-slate-500" placeholder="••••••••" />
                          <button class="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase tracking-widest text-primary">Edit</button>
                       </div>
                   </div>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="flex items-start gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                   <div class="p-3 bg-white rounded-xl shadow-sm text-secondary">
                      <BellIcon class="w-5 h-5" />
                   </div>
                   <div>
                      <p class="text-sm font-black text-slate-900 mb-1">Email Dispatch Rules</p>
                      <p class="text-[11px] text-slate-400 font-medium mb-4">Notify admins of every successful draw and high-value payout request.</p>
                      <button class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">Configure Alerts</button>
                   </div>
                </div>
                <div class="flex items-start gap-4 p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                   <div class="p-3 bg-white rounded-xl shadow-sm text-blue-500">
                      <Cog6ToothIcon class="w-5 h-5" />
                   </div>
                   <div>
                      <p class="text-sm font-black text-slate-900 mb-1">System Audit Pushes</p>
                      <p class="text-[11px] text-slate-400 font-medium mb-4">Daily summary of system health and RNG log snapshots to external storage.</p>
                      <button class="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600">Manage Endpoints</button>
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

@keyframes slide-in-right {
  from { transform: translateX(20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

.animate-in {
  animation: fade-in 0.5s ease-out;
}

.slide-in-from-right {
  animation: slide-in-right 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Custom Toggle Styles */
button:focus {
  outline: none;
}
</style>
