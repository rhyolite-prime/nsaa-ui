<template>
  <div class="min-h-screen bg-slate-50 font-sans">
    <Sidebar />
   
    
    <div class="pl-64 flex flex-col min-h-screen">
      <!-- Topbar -->
      <header class="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30">
        <div>
           <h2 class="text-xl font-black text-slate-800 tracking-tight">{{ pageTitle }}</h2>
        </div>
        
        <div class="flex items-center gap-6">
          <div class="relative">
             <button 
               @click="toggleNotifications"
               class="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer transition-colors focus:outline-none"
             >
                <BellIcon class="w-6 h-6" />
                <span v-if="unreadCount > 0" class="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full border-2 border-white"></span>
             </button>

             <!-- Notifications Dropdown -->
             <div 
               v-if="isNotificationsOpen" 
               class="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden"
             >
               <div class="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                 <h3 class="font-black text-slate-800 text-sm italic">Notifications</h3>
                 <button 
                   @click="markAllAsRead"
                   class="text-[10px] font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 transition-colors"
                 >
                   Mark all as read
                 </button>
               </div>
               
               <div class="max-h-96 overflow-y-auto">
                 <div v-if="notifications.length === 0" class="p-8 text-center">
                   <p class="text-slate-400 text-sm">No notifications yet</p>
                 </div>
                 <div 
                   v-for="notification in notifications" 
                   :key="notification.id"
                   @click="markAsRead(notification.id)"
                   class="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer relative group"
                 >
                   <div class="flex gap-3">
                     <div 
                       class="w-2 h-2 rounded-full mt-1.5 shrink-0 transition-opacity"
                       :class="notification.isRead ? 'opacity-0' : 'bg-primary-500 shadow-sm shadow-primary-500/50 animate-pulse'"
                     ></div>
                     <div class="flex-1">
                       <p class="text-xs font-bold text-slate-800 leading-tight">{{ notification.title }}</p>
                       <p class="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{{ notification.message }}</p>
                       <div class="flex items-center gap-1.5 mt-2">
                         <ClockIcon class="w-3 h-3 text-slate-300" />
                         <span class="text-[9px] font-black uppercase tracking-widest text-slate-300">{{ notification.time }}</span>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
               
               <div class="p-3 bg-slate-50 border-t border-slate-100">
                 <button class="w-full py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors text-center">
                   View all activity
                 </button>
               </div>
             </div>
          </div>
          
          <div class="flex items-center gap-3 pl-6 border-l border-slate-200">
            <div class="text-right">
              <p class="text-sm font-black text-slate-800">Emmanuel Addo</p>
              <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Super Admin</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-primary-900 flex items-center justify-center text-white font-bold border-2 border-primary-800 shadow-lg">
              EA
            </div>
          </div>
        </div>
      </header>
      
      <!-- Main Content -->
      <main class="p-8 flex-1">
        <slot />
      </main>
      
      <!-- Footer -->
      <footer class="px-8 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 border-t border-slate-100 bg-white">
        &copy; 2026 NSAA Play Limited Company. Empowering Games.
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BellIcon, CheckCircleIcon, ClockIcon } from '@heroicons/vue/24/outline';

const route = useRoute()

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/': 'Dashboard Overview',
    '/raffles': 'Raffle Management',
    '/tickets': 'Ticket Explorer',
    '/winners': 'Winner Circle',
    '/disbursements': 'Payout Tracking',
    '/users': 'User Management',
    '/users/roles': 'Role Management',
    '/settings': 'System Settings'
  }
  return titles[route.path] || 'Chop Money'
})

const isNotificationsOpen = ref(false)
const notifications = ref([
  {
    id: 1,
    title: 'New Raffle Winner!',
    message: 'The Daily Chop raffle has been drawn.',
    time: '2 mins ago',
    isRead: false,
    type: 'success'
  },
  {
    id: 2,
    title: 'Payout Successful',
    message: 'Disbursement of GHS 500.00 to EA.',
    time: '1 hour ago',
    isRead: true,
    type: 'info'
  },
  {
    id: 3,
    title: 'System Update',
    message: 'New security features have been deployed.',
    time: '5 hours ago',
    isRead: false,
    type: 'update'
  }
])

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value
}

const markAllAsRead = () => {
  notifications.value.forEach(n => n.isRead = true)
}

const markAsRead = (id: number) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) notification.isRead = true
}
</script>
