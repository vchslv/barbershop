<script setup lang="ts">
import AppHeader from 'src/components/layout/AppHeader.vue';
</script>

<template>
  <div class="relative z-10 mx-auto w-[min(1120px,calc(100%-2rem))] px-0 pb-12 pt-5">
    <AppHeader />
    <router-view />
  </div>
</template>
