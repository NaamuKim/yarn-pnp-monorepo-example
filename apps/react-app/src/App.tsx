import { useEffect, useState } from 'react';
import { apiClient, type Product } from '@mono/api-client';
import { formatCurrency } from '@mono/utils';
import { colors } from '@mono/ui';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.products.list().then(({ data }) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ borderBottom: `3px solid ${colors.primary}`, paddingBottom: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: colors.primary }}>React App</h1>
        <p style={{ color: '#666' }}>Yarn PnP Monorepo — React 18 + Vite</p>
      </header>

      {loading ? (
        <p>로딩 중...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                border: `1px solid #e5e7eb`,
                borderRadius: '8px',
                padding: '1rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <h3 style={{ margin: '0 0 0.5rem', color: colors.primary }}>{product.name}</h3>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{product.description}</p>
              <strong style={{ color: colors.success }}>{formatCurrency(product.price)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
