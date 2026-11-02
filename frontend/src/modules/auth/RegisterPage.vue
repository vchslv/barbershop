<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useTranslate } from 'src/shared/i18n';
import { useAuthStore } from 'src/store/auth';
import { getFieldErrorCode } from 'src/utils/apiError';
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

const name = ref('');
const phone = ref('');
const password = ref('');
const error = ref('');

const onSubmit = async (): Promise<void> => {
    error.value = '';

    try {
        await authStore.register({
            name: name.value.trim(),
            phone: phone.value.trim(),
            password: password.value,
        });
        await router.replace('/');
    } catch (err: unknown) {
        const phoneError = getFieldErrorCode(err, 'phone');

        if (phoneError === 'phone_taken') {
            error.value = translate('phoneTaken');
        } else if (phoneError === 'phone_invalid') {
            error.value = translate('phoneInvalid');
        } else {
            error.value = translate('registerFailed');
        }
    }
};
</script>

<template>
  <section class="mx-auto max-w-md animate-rise-slow border border-ink/10 bg-paper/78 p-[clamp(1.25rem,3vw,2rem)] shadow-[0_24px_60px_rgba(18,16,14,0.18)] backdrop-blur">
    <h2 :class="sectionTitleClass">
      {{ translate('registerTitle') }}
    </h2>
    <p class="mb-6 mt-0 text-muted">
      {{ translate('registerSubtitle') }}
    </p>

    <form
      class="flex flex-col gap-4"
      @submit.prevent="onSubmit"
    >
      <div class="flex flex-col gap-2">
        <label
          for="register-name"
          :class="fieldLabelClass"
        >
          {{ translate('name') }}
        </label>
        <input
          id="register-name"
          v-model="name"
          type="text"
          required
          maxlength="100"
          autocomplete="name"
          :class="fieldInputClass"
        >
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="register-phone"
          :class="fieldLabelClass"
        >
          {{ translate('phone') }}
        </label>
        <input
          id="register-phone"
          v-model="phone"
          type="tel"
          required
          maxlength="30"
          autocomplete="tel"
          :class="fieldInputClass"
        >
      </div>

      <div class="flex flex-col gap-2">
        <label
          for="register-password"
          :class="fieldLabelClass"
        >
          {{ translate('password') }}
        </label>
        <input
          id="register-password"
          v-model="password"
          type="password"
          required
          minlength="6"
          autocomplete="new-password"
          :class="fieldInputClass"
        >
      </div>

      <button
        type="submit"
        :class="btnClass"
        :disabled="authStore.loading"
      >
        {{ authStore.loading ? translate('submitting') : translate('submitRegister') }}
      </button>
    </form>

    <div class="mt-4 text-sm">
      <router-link
        class="text-ink underline"
        to="/login"
      >
        {{ translate('toLogin') }}
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
