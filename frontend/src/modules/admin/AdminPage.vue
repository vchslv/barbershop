<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useTranslate } from 'src/shared/i18n';
import { useAdminStore } from 'src/store/admin';
import { useLocaleStore } from 'src/store/locale';
import type { Appointment } from 'src/services/types';
import { formatDate, formatPrice, formatTime } from 'src/utils/format';
import {
    btnClass,
    btnGhostClass,
    fieldInputClass,
    fieldLabelClass,
    messageClass,
    messageErrorClass,
    messageOkClass,
    sectionTitleClass,
    slotActiveClass,
    slotClass,
} from 'src/utils/uiClasses';

const translate = useTranslate('admin');
const errorTranslate = useTranslate('common.errors');
const adminStore = useAdminStore();
const localeStore = useLocaleStore();

const {
    appointments,
    services,
    barbers,
    slots,
    loading,
    loadingSlots,
    saving,
    filterDate,
    filterStatus,
    message,
    lastErrorCode,
    form,
    isEditing,
    canSave,
} = storeToRefs(adminStore);

const selectClass = fieldInputClass;

const displayMessage = computed((): string => {
    if (!message.value) {
        return '';
    }

    if (message.value.text === 'LOAD_FAILED') {
        return translate('loadFailed');
    }

    if (message.value.text === 'SAVED') {
        return translate('saved');
    }

    if (message.value.text === 'SAVE_FAILED') {
        return lastErrorCode.value
            ? errorTranslate(lastErrorCode.value)
            : translate('saveFailed');
    }

    return message.value.text;
});

watch(
    () => [form.value.service_id, form.value.barber_id, form.value.date, form.value.id],
    () => {
        if (isEditing.value) {
            void adminStore.loadSlots();
        }
    },
);

const resetFilters = async (): Promise<void> => {
    filterDate.value = '';
    filterStatus.value = '';
    await adminStore.loadAppointments();
};

const onEdit = async (appointment: Appointment): Promise<void> => {
    await adminStore.startEdit(appointment);
};

onMounted(async (): Promise<void> => {
    try {
        await adminStore.loadCatalog();
        await adminStore.loadAppointments();
    } catch {
        adminStore.message = { type: 'error', text: 'LOAD_FAILED' };
    }
});
</script>

<template>
  <section class="animate-rise-slow border border-ink/10 bg-paper/78 shadow-[0_24px_60px_rgba(18,16,14,0.18)] backdrop-blur">
    <div class="p-[clamp(1.25rem,3vw,2rem)]">
      <h2 :class="sectionTitleClass">
        {{ translate('title') }}
      </h2>
      <p class="mb-5 mt-0 text-muted">
        {{ translate('subtitle') }}
      </p>

      <div class="mb-5 flex flex-wrap items-end gap-4">
        <div class="flex min-w-[180px] flex-col gap-2">
          <label
            for="admin-filter-date"
            :class="fieldLabelClass"
          >
            {{ translate('filterDate') }}
          </label>
          <input
            id="admin-filter-date"
            v-model="filterDate"
            type="date"
            :class="fieldInputClass"
            @change="adminStore.loadAppointments()"
          >
        </div>
        <div class="flex min-w-[180px] flex-col gap-2">
          <label
            for="admin-filter-status"
            :class="fieldLabelClass"
          >
            {{ translate('filterStatus') }}
          </label>
          <select
            id="admin-filter-status"
            v-model="filterStatus"
            :class="selectClass"
            @change="adminStore.loadAppointments()"
          >
            <option value="">
              {{ translate('statusAll') }}
            </option>
            <option value="confirmed">
              {{ translate('statusConfirmed') }}
            </option>
            <option value="cancelled">
              {{ translate('statusCancelled') }}
            </option>
          </select>
        </div>
        <button
          type="button"
          :class="btnGhostClass"
          @click="resetFilters"
        >
          {{ translate('reset') }}
        </button>
      </div>

      <div
        v-if="message"
        :class="[
          messageClass,
          'mb-5',
          message.type === 'error' ? messageErrorClass : '',
          message.type === 'ok' ? messageOkClass : '',
        ]"
      >
        {{ displayMessage }}
      </div>

      <div class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div>
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
              :class="{ 'border-ink bg-ink/5': form.id === item.id }"
            >
              <div>
                <h3 class="mb-1 mt-0 text-[1.05rem]">
                  #{{ item.id }} · {{ item.client_name }} · {{ formatDate(String(item.date).slice(0, 10), localeStore.locale) }} · {{ formatTime(item.start_time) }}
                </h3>
                <p class="m-0 text-[0.92rem] text-muted">
                  {{ item.service?.name }} · {{ item.barber?.name }}
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
                type="button"
                :class="btnGhostClass"
                @click="onEdit(item)"
              >
                {{ translate('edit') }}
              </button>
            </article>
          </div>

          <p
            v-else
            class="text-muted"
          >
            {{ translate('empty') }}
          </p>
        </div>

        <div class="border border-ink/10 bg-white/35 p-4">
          <template v-if="isEditing">
            <h3 class="mb-4 mt-0 font-display text-2xl tracking-[0.06em]">
              {{ translate('editing', { id: form.id }) }}
            </h3>

            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-2">
                <label
                  for="admin-client-name"
                  :class="fieldLabelClass"
                >
                  {{ translate('clientName') }}
                </label>
                <input
                  id="admin-client-name"
                  v-model="form.client_name"
                  type="text"
                  maxlength="100"
                  :class="fieldInputClass"
                >
              </div>

              <div class="flex flex-col gap-2">
                <label
                  for="admin-client-phone"
                  :class="fieldLabelClass"
                >
                  {{ translate('clientPhone') }}
                </label>
                <input
                  id="admin-client-phone"
                  v-model="form.client_phone"
                  type="tel"
                  maxlength="30"
                  :class="fieldInputClass"
                >
              </div>

              <div class="flex flex-col gap-2">
                <label
                  for="admin-service"
                  :class="fieldLabelClass"
                >
                  {{ translate('service') }}
                </label>
                <select
                  id="admin-service"
                  v-model.number="form.service_id"
                  :class="selectClass"
                >
                  <option
                    v-for="service in services"
                    :key="service.id"
                    :value="service.id"
                  >
                    {{ service.name }}
                  </option>
                </select>
              </div>

              <div class="flex flex-col gap-2">
                <label
                  for="admin-barber"
                  :class="fieldLabelClass"
                >
                  {{ translate('barber') }}
                </label>
                <select
                  id="admin-barber"
                  v-model.number="form.barber_id"
                  :class="selectClass"
                >
                  <option
                    v-for="barber in barbers"
                    :key="barber.id"
                    :value="barber.id"
                  >
                    {{ barber.name }}
                  </option>
                </select>
              </div>

              <div class="flex flex-col gap-2">
                <label
                  for="admin-date"
                  :class="fieldLabelClass"
                >
                  {{ translate('date') }}
                </label>
                <input
                  id="admin-date"
                  v-model="form.date"
                  type="date"
                  :class="fieldInputClass"
                >
              </div>

              <div class="flex flex-col gap-2">
                <span :class="fieldLabelClass">
                  {{ translate('time') }}
                </span>
                <p
                  v-if="loadingSlots"
                  class="m-0 text-sm text-muted"
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
                  class="m-0 text-sm text-muted"
                >
                  {{ translate('noSlots') }}
                </p>
              </div>

              <div class="flex flex-col gap-2">
                <label
                  for="admin-status"
                  :class="fieldLabelClass"
                >
                  {{ translate('status') }}
                </label>
                <select
                  id="admin-status"
                  v-model="form.status"
                  :class="selectClass"
                >
                  <option value="confirmed">
                    {{ translate('statusConfirmed') }}
                  </option>
                  <option value="cancelled">
                    {{ translate('statusCancelled') }}
                  </option>
                </select>
              </div>

              <div class="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  :class="btnClass"
                  :disabled="!canSave"
                  @click="adminStore.save()"
                >
                  {{ saving ? translate('saving') : translate('save') }}
                </button>
                <button
                  type="button"
                  :class="btnGhostClass"
                  @click="adminStore.cancelEdit()"
                >
                  {{ translate('cancelEdit') }}
                </button>
              </div>
            </div>
          </template>

          <p
            v-else
            class="m-0 text-muted"
          >
            {{ translate('selectAppointment') }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
