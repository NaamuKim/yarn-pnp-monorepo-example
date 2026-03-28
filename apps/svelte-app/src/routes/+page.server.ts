import { apiClient } from '@mono/api-client';

export async function load() {
  const { data: products } = await apiClient.products.list();
  return { products };
}
