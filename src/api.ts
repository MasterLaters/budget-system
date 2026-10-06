import type { Item, ItemInput, CategorySummary, Priority } from './types';

function normalizeItem(r: Record<string, unknown>): Item {
  const priority = Number(r.priority) || 3;
  return {
    id: r.id as number,
    name: r.name as string,
    price: r.price as number,
    quantity: r.quantity as number,
    subtotal: (r.price as number) * (r.quantity as number),
    category: r.category as string,
    priority: priority as Priority,
    link: r.link as string,
    image: r.image as string,
    note: r.note as string,
    planned_date: r.planned_date as string,
    purchased_at: r.purchased_at as string,
    status: r.status as Item['status'],
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  };
}

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || '请求失败');
  }
  return res.json();
}

export const api = {
  async getItems(status?: string, category?: string): Promise<Item[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (category && category !== '全部') params.set('category', category);
    const qs = params.toString();
    const items = await request<Record<string, unknown>[]>(`/items${qs ? `?${qs}` : ''}`);
    return items.map(normalizeItem);
  },

  async createItem(input: ItemInput): Promise<Item> {
    const r = await request<Record<string, unknown>>('/items', { method: 'POST', body: JSON.stringify(input) });
    return normalizeItem(r);
  },

  async updateItem(id: number, input: Partial<ItemInput>): Promise<Item> {
    const r = await request<Record<string, unknown>>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(input) });
    return normalizeItem(r);
  },

  deleteItem(id: number): Promise<{ deleted: boolean }> {
    return request(`/items/${id}`, { method: 'DELETE' });
  },

  getCategorySummary(status?: string): Promise<CategorySummary[]> {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    const qs = params.toString();
    return request<CategorySummary[]>(`/summary/categories${qs ? `?${qs}` : ''}`);
  },
};
