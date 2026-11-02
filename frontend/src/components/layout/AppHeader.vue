<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useTranslate } from 'src/shared/i18n';
import { useAuthStore } from 'src/store/auth';
import { btnGhostClass, navLinkActiveClass, navLinkClass } from 'src/utils/uiClasses';

const translate = useTranslate('common');
const authTranslate = useTranslate('auth');
const authStore = useAuthStore();
const router = useRouter();
const { isAuthenticated, isAdmin, user } = storeToRefs(authStore);

const onLogout = async (): Promise<void> => {
    await authStore.logout();
    await router.push({ name: 'login' });
};
</script>

<template>
  <header class="mb-8 flex animate-rise flex-wrap items-center justify-between gap-4">
    <div class="flex flex-col gap-0.5">
      <div class="font-display text-[clamp(2.4rem,6vw,3.6rem)] leading-[0.9] tracking-[0.08em]">
        {{ translate('brand.nameLeft') }}<span class="text-brass">{{ translate('brand.nameRight') }}</span>
      </div>
      <div class="text-[0.85rem] uppercase tracking-[0.08em] text-muted">
        {{ translate('brand.tagline') }}
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-end gap-3 max-md:w-full max-md:justify-between">
      <nav class="flex flex-wrap items-center gap-2">
        <template v-if="isAuthenticated">
          <router-link
            to="/"
            :class="navLinkClass"
            :active-class="navLinkActiveClass"
          >
            {{ translate('nav.book') }}
          </router-link>
          <router-link
            v-if="isAdmin"
            to="/admin"
            :class="navLinkClass"
            :active-class="navLinkActiveClass"
          >
            {{ translate('nav.admin') }}
          </router-link>
          <router-link
            v-else
            to="/appointments"
            :class="navLinkClass"
            :active-class="navLinkActiveClass"
          >
            {{ translate('nav.appointments') }}
          </router-link>
          <span class="px-2 text-sm text-muted">
            {{ user?.phone || user?.email }}
          </span>
          <button
            type="button"
            :class="btnGhostClass"
            @click="onLogout"
          >
            {{ authTranslate('logout') }}
          </button>
        </template>
        <template v-else>
          <router-link
            to="/login"
            :class="navLinkClass"
            :active-class="navLinkActiveClass"
          >
            {{ authTranslate('login') }}
          </router-link>
          <router-link
            to="/register"
            :class="navLinkClass"
            :active-class="navLinkActiveClass"
          >
            {{ authTranslate('register') }}
          </router-link>
        </template>
      </nav>
    </div>
  </header>
</template>
