import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { apiClient, type Product } from '@mono/api-client';
import { colors as uiColors } from '@mono/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem">
      <header style="border-bottom: 3px solid #3B82F6; padding-bottom: 1rem; margin-bottom: 2rem">
        <h1 style="color: #3B82F6">Angular App</h1>
        <p style="color: #666">Yarn PnP Monorepo — Angular 18</p>
      </header>

      <p *ngIf="loading()">로딩 중...</p>
      <div *ngIf="!loading()" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem">
        <div
          *ngFor="let product of products()"
          style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1)"
        >
          <h3 style="margin: 0 0 0.5rem; color: #3B82F6">{{ product.name }}</h3>
          <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: #6b7280">{{ product.description }}</p>
          <strong style="color: #10B981">{{ format(product.price) }}</strong>
        </div>
      </div>
    </div>
  `,
})
export class AppComponent implements OnInit {
  products = signal<Product[]>([]);
  loading = signal(true);

  format = (price: number) => new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);

  async ngOnInit() {
    const { data } = await apiClient.products.list();
    this.products.set(data);
    this.loading.set(false);
  }
}
