<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTranslate } from 'src/shared/i18n';
import { useAuthStore } from 'src/store/auth';
import {
    btnClass,
    fieldInputClass,
    fieldLabelClass,
    messageClass,
    messageErrorClass,
    sectionTitleClass,
} from 'src/utils/uiClasses';

const translate = useTranslate('auth');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const phone = ref('');
const password = ref('');
const error = ref('');

const onSubmit = async (): Promise<void> => {
    error.value = '';

    try {
        await authStore.loginWithPhone(phone.value.trim(), password.value);
        const redirect = typeof route.query.redirect === 'string'
            ? route.query.redirect
            : '/';
        await router.replace(redirect);
    } catch {
        error.value = translate('failed');
    }
};
</script>

<template>
  <section class="mx-auto max-w-md animate-rise-slow border border-ink/10 bg-paper/78 p-[clamp(1.25rem,3vw,2rem)] shadow-[0_24px_60px_rgba(18,16,14,0.18)] backdrop-blur">
    <h2 :class="sectionTitleClass">
      {{ translate('loginTitle') }}
    </h2>
    <p class="mb-6 mt-0 text-muted">
      {{ translate('loginSubtitle') }}
    </p>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="onSubmit"
    >
      <div class="flex flex-col gap-2">
        <label
          for="login-phone"
          :class="fieldLabelClass"
        >
          {{ translate('phone') }}
        </label>
        <input
          id="login-phone"
          v-model="phone"
          type="tel"
          required
          autocomplete="tel"
          :class="fieldInputClass"
        >
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="login-password"
          :class="fieldLabelClass"
        >
          {{ translate('password') }}
        </label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          :class="fieldInputClass"
        >
      </div>

      <button
        type="submit"
        :class="btnClass"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? translate('submitting') : translate('submitLogin') }}
      </button>
    </form>

    <div class="mt-4 flex flex-col gap-2 text-sm">
      <router-link
        class="text-ink underline"
        to="/register"
      >
        {{ translate('toRegister') }}
      </router-link>
      <router-link
        class="text-muted underline"
        to="/admin/login"
      >
        {{ translate('adminLink') }}
      </router-link>
    </div>

    <div
      v-if="error"
      :class="[messageClass, messageErrorClass]"
    >
      {{ error }}
    </div>
  </section>
</template>
