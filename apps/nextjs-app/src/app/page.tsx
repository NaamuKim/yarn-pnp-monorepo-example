import { apiClient } from '@mono/api-client';
import { formatCurrency } from '@mono/utils';
import { colors } from '@mono/ui';

export default async function Home() {
  const { data: products } = await apiClient.products.list();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ borderBottom: `3px solid ${colors.primary}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: colors.primary }}>Next.js App</h1>
        <p style={{ color: '#666' }}>Yarn PnP Monorepo — Next.js 14 (App Router, SSR)</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {products.map((product) => (
          <div
            key={product.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              background: 'white',
            }}
          >
            <h3 style={{ margin: '0 0 0.5rem', color: colors.primary }}>{product.name}</h3>
            <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{product.description}</p>
            <strong style={{ color: colors.success }}>{formatCurrency(product.price)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
