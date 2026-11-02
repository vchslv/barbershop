<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
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

const email = ref('admin@barbershop.test');
const password = ref('');
const error = ref('');

const onSubmit = async (): Promise<void> => {
    error.value = '';

    try {
        await authStore.loginAdmin(email.value.trim(), password.value);
        await router.replace('/admin');
    } catch {
        error.value = translate('adminFailed');
    }
};
</script>

<template>
  <section class="mx-auto max-w-md animate-rise-slow border border-ink/10 bg-paper/78 p-[clamp(1.25rem,3vw,2rem)] shadow-[0_24px_60px_rgba(18,16,14,0.18)] backdrop-blur">
    <h2 :class="sectionTitleClass">
      {{ translate('adminTitle') }}
    </h2>
    <p class="mb-6 mt-0 text-muted">
      {{ translate('adminSubtitle') }}
    </p>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="onSubmit"
    >
      <div class="flex flex-col gap-2">
        <label
          for="admin-email"
          :class="fieldLabelClass"
        >
          {{ translate('email') }}
        </label>
        <input
          id="admin-email"
          v-model="email"
          type="email"
          required
          autocomplete="username"
          :class="fieldInputClass"
        >
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="admin-password"
          :class="fieldLabelClass"
        >
          {{ translate('password') }}
        </label>
        <input
          id="admin-password"
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

    <div
      v-if="error"
      :class="[messageClass, messageErrorClass]"
    >
      {{ error }}
    </div>
  </section>
</template>
