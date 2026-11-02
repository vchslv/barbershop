<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTranslate } from 'src/shared/i18n';
import { useAuthStore } from 'src/store/auth';
import { useBookingStore } from 'src/store/booking';
import { useLocaleStore } from 'src/store/locale';
import { formatPrice, todayIso } from 'src/utils/format';
import {
    btnClass,
    btnGhostClass,
    choiceActiveClass,
    choiceClass,
    fieldInputClass,
    fieldLabelClass,
    messageClass,
    messageErrorClass,
    messageOkClass,
    sectionTitleClass,
    slotActiveClass,
    slotClass,
} from 'src/utils/uiClasses';

const translate = useTranslate('booking');
const errorTranslate = useTranslate('common.errors');
const bookingStore = useBookingStore();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

const {
    services,
    barbers,
    slots,
    loadingSlots,
    submitting,
    message,
    lastErrorCode,
    lastSuccess,
    form,
    selectedService,
    canSubmit,
} = storeToRefs(bookingStore);

const durationLabel = computed((): string => {
    if (!selectedService.value) {
        return translate('durationEmpty');
    }

    return translate('durationValue', {
        minutes: selectedService.value.duration_minutes,
    });
});

const displayMessage = computed((): string => {
    if (!message.value) {
        return '';
    }

    if (message.value.text === 'NO_SLOTS') {
        return translate('noSlots');
    }

    if (message.value.text === 'SLOTS_LOAD_FAILED') {
        return lastErrorCode.value
            ? errorTranslate(lastErrorCode.value)
            : translate('slotsLoadFailed');
    }

    if (message.value.text === 'CREATE_FAILED') {
        return lastErrorCode.value
            ? errorTranslate(lastErrorCode.value)
            : translate('createFailed');
    }

    if (message.value.text === 'SUCCESS' && lastSuccess.value) {
        return translate('success', lastSuccess.value);
    }

    if (message.value.text === 'CATALOG_LOAD_FAILED') {
        return translate('catalogLoadFailed');
    }

    return message.value.text;
});

watch(
    () => [form.value.service_id, form.value.barber_id, form.value.date],
    () => {
        void bookingStore.loadSlots();
    },
);

onMounted(async (): Promise<void> => {
    form.value.date = todayIso();

    if (authStore.user?.name && !form.value.client_name) {
        form.value.client_name = authStore.user.name;
    }

    if (authStore.user?.phone && !form.value.client_phone) {
        form.value.client_phone = authStore.user.phone;
    }

    try {
        await bookingStore.loadCatalog();
    } catch {
        bookingStore.showMessage('error', 'CATALOG_LOAD_FAILED');
    }
});

const priceLabel = (price: number): string => {
    return formatPrice(price, localeStore.locale);
};
</script>

<template>
  <section class="animate-rise-slow border border-ink/10 bg-paper/78 shadow-[0_24px_60px_rgba(18,16,14,0.18)] backdrop-blur">
    <div class="grid min-h-[280px] grid-cols-[1.2fr_0.8fr] overflow-hidden border-b border-ink/10 max-md:grid-cols-1">
      <div class="flex flex-col justify-end gap-3 bg-gradient-to-br from-ink/95 to-ink-soft/90 p-[clamp(1.5rem,4vw,2.75rem)] text-paper">
        <h1 class="m-0 max-w-[10ch] font-display text-[clamp(2.8rem,7vw,4.6rem)] leading-[0.92] tracking-[0.04em]">
          {{ translate('heroTitle') }}
        </h1>
        <p class="m-0 max-w-[34ch] leading-relaxed text-paper/80">
          {{ translate('heroText') }}
        </p>
      </div>
      <div
        class="relative bg-[repeating-linear-gradient(-12deg,#1c1814_0_12px,#241f1a_12px_24px)] max-md:min-h-40"
        aria-hidden="true"
      >
        <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-brass/35 to-transparent" />
        <div class="absolute inset-0 grid place-items-center text-[clamp(4rem,12vw,7rem)] text-brass-bright/55 animate-float">
          ✂
        </div>
      </div>
    </div>

    <div class="p-[clamp(1.25rem,3vw,2rem)]">
      <h2 :class="sectionTitleClass">
        {{ translate('service') }}
      </h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <button
          v-for="service in services"
          :key="service.id"
          type="button"
          :class="[choiceClass, form.service_id === service.id ? choiceActiveClass : '']"
          @click="form.service_id = service.id"
        >
          <strong class="mb-1 block text-base">
            {{ service.name }}
          </strong>
          <span class="block text-[0.85rem] opacity-80">
            {{
              translate('serviceMeta', {
                minutes: service.duration_minutes,
                price: priceLabel(service.price),
              })
            }}
          </span>
        </button>
      </div>

      <h2 :class="[sectionTitleClass, 'mt-7']">
        {{ translate('barber') }}
      </h2>
      <div class="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3">
        <button
          v-for="barber in barbers"
          :key="barber.id"
          type="button"
          :class="[choiceClass, form.barber_id === barber.id ? choiceActiveClass : '']"
          @click="form.barber_id = barber.id"
        >
          <strong class="mb-1 block text-base">
            {{ barber.name }}
          </strong>
          <span class="block text-[0.85rem] opacity-80">
            {{ barber.specialty }}
          </span>
        </button>
      </div>

      <div class="mt-7 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div class="flex flex-col gap-2">
          <label
            for="date"
            :class="fieldLabelClass"
          >
            {{ translate('date') }}
          </label>
          <input
            id="date"
            v-model="form.date"
            type="date"
            :min="todayIso()"
            :class="fieldInputClass"
          >
        </div>
        <div class="flex flex-col gap-2">
          <label :class="fieldLabelClass">
            {{ translate('duration') }}
          </label>
          <input
            type="text"
            :value="durationLabel"
            readonly
            :class="fieldInputClass"
          >
        </div>
      </div>

      <h2 :class="[sectionTitleClass, 'mt-7']">
        {{ translate('availableTimes') }}
      </h2>
      <p
        v-if="loadingSlots"
        class="text-muted"
      >
        {{ translate('loadingSlots') }}
      </p>
      <div
        v-else-if="slots.length"
        class="flex flex-wrap gap-2"
      >
        <button
          v-for="slot in slots"
          :key="slot"
          type="button"
          :class="[slotClass, form.start_time === slot ? slotActiveClass : '']"
          @click="form.start_time = slot"
        >
          {{ slot }}
        </button>
      </div>
      <p
        v-else
        class="text-muted"
      >
        {{ translate('pickServiceBarberDate') }}
      </p>

      <div class="mt-7 grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div class="flex flex-col gap-2">
          <label
            for="client_name"
            :class="fieldLabelClass"
          >
            {{ translate('yourName') }}
          </label>
          <input
            id="client_name"
            v-model="form.client_name"
            type="text"
            :placeholder="translate('namePlaceholder')"
            maxlength="100"
            :class="fieldInputClass"
          >
        </div>
        <div class="flex flex-col gap-2">
          <label
            for="client_phone"
            :class="fieldLabelClass"
          >
            {{ translate('phone') }}
          </label>
          <input
            id="client_phone"
            v-model="form.client_phone"
            type="tel"
            :placeholder="translate('phonePlaceholder')"
            maxlength="30"
            :class="fieldInputClass"
          >
        </div>
      </div>

      <div class="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          :class="btnClass"
          :disabled="!canSubmit"
          @click="bookingStore.submit()"
        >
          {{ submitting ? translate('submitting') : translate('submit') }}
        </button>
        <router-link
          to="/appointments"
          :class="btnGhostClass"
        >
          {{ translate('viewAppointments') }}
        </router-link>
      </div>

      <div
        v-if="message"
        :class="[
          messageClass,
          message.type === 'error' ? messageErrorClass : '',
          message.type === 'ok' ? messageOkClass : '',
        ]"
      >
        {{ displayMessage }}
      </div>
    </div>
  </section>
</template>
