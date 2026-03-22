<script setup lang="ts">
import { 
  LockClosedIcon, 
  AtSymbolIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/vue/24/outline';

definePageMeta({
  layout: false
});

const showPassword = ref(false);
const email = ref('');
const password = ref('');
const rememberMe = ref(false);

const handleLogin = () => {
  console.log('Logging in...', email.value);
  navigateTo('/');
};
</script>

<template>
  <div class="min-h-screen bg-brand-grey flex flex-col items-center justify-center p-6 font-sans">
    <div class="w-full max-w-[440px] flex flex-col items-center">
      <!-- Main Card -->
      <div class="w-full bg-white rounded-[40px] shadow-[0_20px_50px_rgba(30,64,175,0.05)] p-10 md:p-12 mb-8 border border-slate-100">
        <!-- Branding Icon Box (Blue Mix) -->
        <div class="flex justify-center mb-8">
          <div class="w-20 h-20 bg-brand-blue rounded-[24px] flex items-center justify-center shadow-[0_10px_25px_rgba(30,64,175,0.2)] transform hover:rotate-6 transition-transform duration-500">
            <LockClosedIcon class="w-10 h-10 text-white" />
          </div>
        </div>

        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-[28px] font-black text-brand-dark mb-2 tracking-tight">Chop Money Admin</h1>
          <p class="text-brand-muted text-base font-medium">Sign in to manage your raffles</p>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Email -->
          <div class="space-y-2">
            <label class="text-[13px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Identity</label>
            <div class="relative group">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                 <AtSymbolIcon class="w-5 h-5" />
              </div>
              <input 
                v-model="email"
                type="email" 
                placeholder="admin@chophq.com" 
                class="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue text-[15px] font-bold placeholder:text-slate-300 transition-all"
                required
              />
            </div>
          </div>

          <!-- Password -->
          <div class="space-y-2">
            <label class="text-[13px] font-black uppercase tracking-widest text-slate-400 ml-1">Security Key</label>
            <div class="relative group">
              <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-blue transition-colors">
                 <LockClosedIcon class="w-5 h-5" />
              </div>
              <input 
                v-model="password"
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                class="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-[18px] focus:outline-none focus:ring-4 focus:ring-brand-blue/5 focus:border-brand-blue text-[15px] font-bold placeholder:text-slate-300 transition-all"
                required
              />
              <button 
                type="button" 
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-dark transition-colors"
              >
                 <EyeSlashIcon v-if="!showPassword" class="w-5 h-5" />
                 <EyeIcon v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <!-- Login Button (Red) -->
          <button 
            type="submit" 
            class="w-full bg-brand-red hover:bg-brand-dark text-white font-black uppercase text-[15px] tracking-[0.1em] py-[20px] rounded-[18px] shadow-[0_12px_24px_rgba(200,35,35,0.2)] transition-all hover:-translate-y-0.5 active:scale-[0.98] mt-4"
          >
             Secure Sign In
          </button>

          <!-- Footer Actions (Blue Accents) -->
          <div class="flex items-center justify-between pt-4">
            <label class="flex items-center gap-2.5 cursor-pointer group">
              <div class="relative w-5 h-5">
                <input v-model="rememberMe" type="checkbox" class="peer hidden" />
                <div class="w-full h-full border-2 border-slate-200 rounded-lg peer-checked:bg-brand-blue peer-checked:border-brand-blue transition-all"></div>
                <svg class="absolute inset-0 w-3.5 h-3.5 m-auto text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="4">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span class="text-[14px] font-bold text-slate-500 group-hover:text-brand-blue transition-colors">Stay linked</span>
            </label>
            <button type="button" class="text-[14px] font-black text-brand-blue hover:underline uppercase tracking-wide">Recover Key</button>
          </div>
        </form>
      </div>

      <!-- Copyright -->
      <p class="text-center text-slate-400 text-[12px] font-bold uppercase tracking-[0.2em]">
        © 2026 Chop Money Raffle. All rights reserved.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Explicit Branding Overrides */
.bg-brand-red { background-color: #C82323 !important; }
.bg-brand-blue { background-color: #1E40AF !important; }
.bg-brand-grey { background-color: #F9F9F9 !important; }
.text-brand-red { color: #C82323 !important; }
.text-brand-blue { color: #1E40AF !important; }
.text-brand-dark { color: #1A1A1A !important; }
.text-brand-muted { color: #888888 !important; }
.border-brand-blue { border-color: #1E40AF !important; }
.focus\:border-brand-blue:focus { border-color: #1E40AF !important; }
.focus\:ring-brand-blue\/5:focus { --tw-ring-color: rgba(30, 64, 175, 0.05) !important; }



input::placeholder {
  color: #CBD5E1 !important; /* slate-300 */
}
</style>
