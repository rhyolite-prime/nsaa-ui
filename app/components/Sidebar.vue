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
  BuildingOfficeIcon,
  UserPlusIcon,
  CheckBadgeIcon,
  DocumentTextIcon,
  PhotoIcon,
  RectangleGroupIcon,
  GiftIcon,
  QuestionMarkCircleIcon,
  FolderIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon
} from '@heroicons/vue/24/outline';


const navigation = [
  { name: 'Dashboard', href: '/', icon: Squares2X2Icon },
  { name: 'Prizes', href: '/prizes', icon: QueueListIcon },
  { name: 'Raffles', href: '/raffles', icon: TrophyIcon },
  { 
    name: 'Tickets', 
    icon: TicketIcon,
    children: [
      { name: 'Ticket Explorer', href: '/tickets/explorer', icon: MagnifyingGlassIcon },
      { name: 'Groups', href: '/tickets/groups', icon: CheckBadgeIcon },
    ]
  },
  { name: 'Customers', href: '/customers', icon: UsersIcon },
  { 
    name: 'Affiliate Partners', 
    icon: BuildingOfficeIcon,
    children: [
      { name: 'Applicants', href: '/partners/applicants', icon: UserPlusIcon },
      { name: 'Approved Partners', href: '/partners', icon: CheckBadgeIcon },
    ]
  },
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
  { 
    name: 'CMS', 
    icon: DocumentTextIcon,
    children: [
      { name: 'Sliders', href: '/cms/sliders', icon: PhotoIcon },
      { name: 'Banners', href: '/cms/banners', icon: RectangleGroupIcon },
      //{ name: 'Prizes', href: '/cms/prizes', icon: GiftIcon },
      { name: 'FAQs', href: '/cms/faqs', icon: QuestionMarkCircleIcon },
      { name: 'Media Library', href: '/cms/media-library', icon: FolderIcon },
      { name: 'Support Tickets', href: '/cms/support-tickets', icon: ChatBubbleLeftIcon },
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
      <div class="flex flex-col items-center gap-1">
        <!-- Added overflow-hidden to ensure any image overflow gets clipped perfectly -->
        <div class="bg-white rounded-full p-2 inline-flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Chop Money Logo" 
            class="w-12 h-12 rounded-full object-cover" 
          />
        </div>
        <p class="text-[10px] uppercase font-bold text-primary-300 opacity-70 mt-1">Admin Panel</p>
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
