export type Priority = 1 | 2 | 3 | 4 | 5;
export type ItemStatus = '想买' | '已买' | '放弃';

export interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  category: string;
  priority: Priority;
  link: string;
  image: string;
  note: string;
  planned_date: string;
  purchased_at: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface ItemInput {
  name: string;
  price: number;
  quantity: number;
  category: string;
  priority: Priority;
  link: string;
  image: string;
  note: string;
  planned_date: string;
  purchased_at?: string;
  status?: ItemStatus;
}

export interface CategorySummary {
  category: string;
  count: number;
  total: number;
}

export type SortField = 'priority' | 'subtotal' | 'planned_date' | 'created_at';
export type SortDir = 'asc' | 'desc';

export const PRIORITY_LABELS: Record<number, string> = {
  1: '无所谓',
  2: '可买可不买',
  3: '一般',
  4: '比较想要',
  5: '非常想要',
};
