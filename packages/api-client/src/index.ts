// Hole 4: 타입/값 혼합 import – verbatimModuleSyntax 활성화 시
// "import type이어야 하는 것을 일반 import로" 쓰는 패턴을 코드모드가 잡지 않음
import { sleep, HttpStatus } from '@mono/utils';

export interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

export interface ApiResponse<T> {
  data: T;
  total: number;
  page: number;
  status?: HttpStatus;  // const enum cross-file import (hole demo – see ts6-holes-app)
}

// Mock data
const mockProducts: Product[] = [
  { id: 1, name: '노트북 Pro', price: 1500000, category: 'electronics', description: '고성능 개발자용 노트북' },
  { id: 2, name: '기계식 키보드', price: 150000, category: 'accessories', description: '청축 기계식 키보드' },
  { id: 3, name: '4K 모니터', price: 600000, category: 'electronics', description: '27인치 4K UHD 모니터' },
  { id: 4, name: '무선 마우스', price: 80000, category: 'accessories', description: '인체공학 무선 마우스' },
  { id: 5, name: '웹캠', price: 120000, category: 'accessories', description: 'Full HD 웹캠' },
];

const mockUsers: User[] = [
  { id: 1, name: '김지원', email: 'jiwon@mono.dev', role: 'admin' },
  { id: 2, name: '이민준', email: 'minjun@mono.dev', role: 'user' },
  { id: 3, name: '박서연', email: 'seoyeon@mono.dev', role: 'user' },
];

export const apiClient = {
  products: {
    list: async (page = 1, limit = 10): Promise<ApiResponse<Product[]>> => {
      await sleep(300);
      const start = (page - 1) * limit;
      return {
        data: mockProducts.slice(start, start + limit),
        total: mockProducts.length,
        page,
      };
    },
    get: async (id: number): Promise<Product | undefined> => {
      await sleep(200);
      return mockProducts.find((p) => p.id === id);
    },
  },
  users: {
    list: async (): Promise<User[]> => {
      await sleep(250);
      return mockUsers;
    },
    me: async (): Promise<User> => {
      await sleep(150);
      return mockUsers[0];
    },
  },
};
