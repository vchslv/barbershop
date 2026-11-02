<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useTranslate } from 'src/shared/i18n';
import { useAppointmentsStore } from 'src/store/appointments';
import { useLocaleStore } from 'src/store/locale';
import type { Appointment } from 'src/services/types';
import { formatDate, formatPrice, formatTime } from 'src/utils/format';
import {
    btnClass,
    btnDangerClass,
    btnGhostClass,
    fieldInputClass,
    fieldLabelClass,
    messageClass,
    messageErrorClass,
    messageOkClass,
    sectionTitleClass,
} from 'src/utils/uiClasses';

const translate = useTranslate('appointments');
const errorTranslate = useTranslate('common.errors');
const appointmentsStore = useAppointmentsStore();
const localeStore = useLocaleStore();

const {
    appointments,
    loading,
    filterDate,
    message,
    lastErrorCode,
} = storeToRefs(appointmentsStore);

const canCancel = (item: Appointment): boolean => {
    if (item.status === 'cancelled') {
        return false;
    }

    const start = new Date(`${String(item.date).slice(0, 10)}T${formatTime(item.start_time)}:00`);

    return start.getTime() > Date.now();
};

const displayMessage = computed((): string => {
    if (!message.value) {
        return '';
    }

    if (message.value.text === 'LOAD_FAILED') {
        return translate('loadFailed');
    }

    if (message.value.text === 'CANCELLED_OK') {
        return translate('cancelledOk');
    }

    if (message.value.text === 'CANCEL_FAILED') {
        return lastErrorCode.value
            ? errorTranslate(lastErrorCode.value)
            : translate('cancelFailed');
    }

    return message.value.text;
});

const onCancel = async (id: number): Promise<void> => {
    if (!confirm(translate('confirmCancel'))) {
        return;
    }

    await appointmentsStore.cancel(id);
};

onMounted(async (): Promise<void> => {
    await appointmentsStore.loadAppointments();
});
</script>

<template>
  <section class="animate-rise-slow border border-ink/10 bg-paper/78 shadow-[0_24px_60px_rgba(18,16,14,0.18)] backdrop-blur">
    <div class="p-[clamp(1.25rem,3vw,2rem)]">
      <h2 :class="sectionTitleClass">
        {{ translate('title') }}
      </h2>

      <div class="mb-5 flex flex-wrap items-end gap-4">
        <div class="flex min-w-[220px] flex-col gap-2">
          <label
            for="filter-date"
            :class="fieldLabelClass"
          >
            {{ translate('filterDate') }}
          </label>
          <input
            id="filter-date"
            v-model="filterDate"
            type="date"
            :class="fieldInputClass"
            @change="appointmentsStore.loadAppointments()"
          >
        </div>
        <button
          type="button"
          :class="btnGhostClass"
          @click="appointmentsStore.resetFilter()"
        >
          {{ translate('reset') }}
        </button>
        <router-link
          to="/"
          :class="btnClass"
        >
          {{ translate('new') }}
        </router-link>
      </div>

      <p
        v-if="loading"
        class="text-muted"
      >
        {{ translate('loading') }}
      </p>

      <div
        v-else-if="appointments.length"
        class="flex flex-col gap-3"
      >
        <article
          v-for="item in appointments"
          :key="item.id"
          class="grid animate-rise grid-cols-[1fr_auto] items-center gap-4 border border-ink/10 bg-white/42 px-[1.1rem] py-4 max-md:grid-cols-1"
        >
          <div>
            <h3 class="mb-1 mt-0 text-[1.05rem]">
              {{ item.client_name }} · {{ formatDate(item.date, localeStore.locale) }} · {{ formatTime(item.start_time) }}
            </h3>
            <p class="m-0 text-[0.92rem] text-muted">
              {{ item.service?.name }} · {{ item.barber?.name }} ·
              {{ formatTime(item.start_time) }}–{{ formatTime(item.end_time) }}
              <template v-if="item.service">
                · {{ formatPrice(item.service.price, localeStore.locale) }}
              </template>
            </p>
            <p class="m-0 text-[0.92rem] text-muted">
              {{ item.client_phone }}
            </p>
            <span
              class="mt-2 inline-block border border-current px-[0.45rem] py-0.5 text-[0.7rem] uppercase tracking-[0.06em]"
              :class="item.status === 'cancelled' ? 'text-danger' : 'text-ok'"
            >
              {{
                item.status === 'cancelled'
                  ? translate('statusCancelled')
                  : translate('statusConfirmed')
              }}
            </span>
          </div>
          <button
            v-if="canCancel(item)"
            type="button"
            :class="btnDangerClass"
            @click="onCancel(item.id)"
          >
            {{ translate('cancel') }}
          </button>
        </article>
      </div>

      <p
        v-else
        class="text-muted"
      >
        {{ translate('empty') }}
      </p>

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
