import { createResource, For, Show } from 'solid-js';
import { apiClient } from '@mono/api-client';
import { formatCurrency } from '@mono/utils';
import { colors } from '@mono/ui';

export default function App() {
  const [productsData] = createResource(() => apiClient.products.list());

  return (
    <div style={{ 'font-family': 'sans-serif', 'max-width': '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ 'border-bottom': `3px solid ${colors.primary}`, 'padding-bottom': '1rem', 'margin-bottom': '2rem' }}>
        <h1 style={{ color: colors.primary }}>Solid.js App</h1>
        <p style={{ color: '#666' }}>Yarn PnP Monorepo — Solid.js + Vite</p>
      </header>

      <Show when={!productsData.loading} fallback={<p>로딩 중...</p>}>
        <div style={{ display: 'grid', 'grid-template-columns': 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          <For each={productsData()?.data}>
            {(product) => (
              <div style={{
                border: '1px solid #e5e7eb',
                'border-radius': '8px',
                padding: '1rem',
                'box-shadow': '0 1px 3px rgba(0,0,0,0.1)',
                background: 'white',
              }}>
                <h3 style={{ margin: '0 0 0.5rem', color: colors.primary }}>{product.name}</h3>
                <p style={{ margin: '0 0 0.5rem', 'font-size': '0.875rem', color: '#6b7280' }}>{product.description}</p>
                <strong style={{ color: colors.success }}>{formatCurrency(product.price)}</strong>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}
