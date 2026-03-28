<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiClient, type Product } from '@mono/api-client';
import { formatCurrency } from '@mono/utils';
import { colors } from '@mono/ui';

const products = ref<Product[]>([]);
const loading = ref(true);

onMounted(async () => {
  const { data } = await apiClient.products.list();
  products.value = data;
  loading.value = false;
});
</script>

<template>
  <div :style="{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem' }">
    <header :style="{ borderBottom: `3px solid ${colors.primary}`, paddingBottom: '1rem', marginBottom: '2rem' }">
      <h1 :style="{ color: colors.primary }">Vue App</h1>
      <p style="color: #666">Yarn PnP Monorepo — Vue 3 + Vite</p>
    </header>

    <p v-if="loading">로딩 중...</p>
    <div
      v-else
      style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem"
    >
      <div
        v-for="product in products"
        :key="product.id"
        style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1)"
      >
        <h3 :style="{ margin: '0 0 0.5rem', color: colors.primary }">{{ product.name }}</h3>
        <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280">{{ product.description }}</p>
        <strong :style="{ color: colors.success }">{{ formatCurrency(product.price) }}</strong>
      </div>
    </div>
  </div>
</template>
