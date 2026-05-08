<script setup lang="ts">
import { 
  Squares2X2Icon, 
  TicketIcon, 
  TrophyIcon, 
  ClockIcon, 
  Cog6ToothIcon, 
  UsersIcon,
  CreditCardIcon,
  ArrowRightOnRectangleIcon,
  SwatchIcon,
  QueueListIcon,
  ChevronDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon
} from '@heroicons/vue/24/outline';


const navigation = [
  { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
  { name: 'Colors', href: '/colors', icon: SwatchIcon },
  { name: 'Price Tiers', href: '/price-tiers', icon: QueueListIcon },
  { name: 'Raffles', href: '/raffles', icon: TrophyIcon },
  { name: 'Tickets', href: '/tickets', icon: TicketIcon },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { name: 'Affiliate Partners', href: '/partners', icon: BuildingOfficeIcon },

  { name: 'Winners', href: '/winners', icon: TrophyIcon },
  { name: 'Disbursements', href: '/disbursements', icon: CreditCardIcon },
  { 
    name: 'User Management', 
    icon: UsersIcon,
    children: [
      { name: 'Roles', href: '/users/roles', icon: UserGroupIcon },
      { name: 'Users', href: '/users', icon: UsersIcon },
    ]
  },
  { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

const route = useRoute();
const openMenus = ref<string[]>([]);

const toggleMenu = (name: string) => {
  if (openMenus.value.includes(name)) {
    openMenus.value = openMenus.value.filter(n => n !== name);
  } else {
    openMenus.value.push(name);
  }
};

const isMenuOpen = (name: string) => openMenus.value.includes(name);
const isChildActive = (item: any) => {
  return item.children?.some((child: any) => route.path === child.href);
};

// Auto-expand menu if a child is active
onMounted(() => {
  navigation.forEach(item => {
    if (isChildActive(item)) {
      openMenus.value.push(item.name);
    }
  });
});
</script>

<template>
  <aside class="w-64 bg-primary-900 text-white flex flex-col h-screen fixed left-0 top-0 z-40">
    <div class="p-6">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center flex-shrink-0 animate-pulse font-bold text-xl">
           C
        </div>
        <div>
          <h1 class="font-bold text-lg leading-tight uppercase tracking-tight">Chop Money</h1>
          <p class="text-[10px] uppercase font-bold text-primary-300 opacity-70">Admin Panel</p>
        </div>
      </div>
    </div>

    <nav class="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
      <div v-for="item in navigation" :key="item.name">
        <template v-if="!item.children">
          <NuxtLink
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group"
            :class="[
              route.path === item.href 
                ? 'bg-secondary text-white shadow-lg active-nav' 
                : 'text-primary-100 hover:bg-white/10 hover:text-white'
            ]"
          >
            <component :is="item.icon" class="w-5 h-5 opacity-70 group-hover:opacity-100" />
            <span class="font-bold text-sm">{{ item.name }}</span>
          </NuxtLink>
        </template>

        <template v-else>
          <button
            @click="toggleMenu(item.name)"
            class="flex items-center justify-between w-full gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group text-primary-100 hover:bg-white/10 hover:text-white"
            :class="{ 'text-white': isChildActive(item) }"
          >
            <div class="flex items-center gap-3">
              <component :is="item.icon" class="w-5 h-5 opacity-70 group-hover:opacity-100" />
              <span class="font-bold text-sm">{{ item.name }}</span>
            </div>
            <ChevronDownIcon 
              class="w-4 h-4 transition-transform duration-200"
              :class="{ 'rotate-180': isMenuOpen(item.name) }"
            />
          </button>
          
          <div v-show="isMenuOpen(item.name)" class="mt-1 ml-4 space-y-1 border-l border-white/10 pl-2">
            <NuxtLink
              v-for="child in item.children"
              :key="child.name"
              :to="child.href"
              class="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group"
              :class="[
                route.path === child.href 
                  ? 'bg-white/10 text-white' 
                  : 'text-primary-200 hover:bg-white/5 hover:text-white'
              ]"
            >
              <component :is="child.icon" class="w-4 h-4 opacity-60 group-hover:opacity-100" />
              <span class="font-medium text-xs">{{ child.name }}</span>
            </NuxtLink>
          </div>
        </template>
      </div>
    </nav>

    <div class="p-4 border-t border-white/10">
      <button class="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-primary-100 hover:bg-white/10 hover:text-white transition-all group">
        <ArrowRightOnRectangleIcon class="w-5 h-5 opacity-70 group-hover:opacity-100" />
        <span class="font-bold text-sm">Sign Out</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.active-nav {
  transform: translateX(4px);
}
</style>
