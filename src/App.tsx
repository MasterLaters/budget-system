import { useState, useEffect, useCallback } from 'react';
import type { Item, ItemInput, CategorySummary, SortField, SortDir, ItemStatus } from './types';
import { api } from './api';
import Navbar from './components/Navbar';
import CategoryBar from './components/CategorySummary';
import CategoryChart from './components/CategoryChart';
import ItemCard from './components/ItemCard';
import ItemModal from './components/ItemModal';

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [statusTab, setStatusTab] = useState<ItemStatus>('想买');
  const [sortBy, setSortBy] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [itemsData, catData] = await Promise.all([
        api.getItems(statusTab, activeCategory),
        api.getCategorySummary(statusTab),
      ]);
      setItems(itemsData);
      setCategories(catData);
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      setLoading(false);
    }
  }, [statusTab, activeCategory]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const sortedItems = [...items].sort((a, b) => {
    let cmp = 0;
    switch (sortBy) {
      case 'priority': cmp = a.priority - b.priority; break;
      case 'subtotal': cmp = a.subtotal - b.subtotal; break;
      case 'planned_date': cmp = a.planned_date.localeCompare(b.planned_date); break;
      case 'created_at':
      default: cmp = a.created_at.localeCompare(b.created_at); break;
    }
    return sortDir === 'desc' ? -cmp : cmp;
  });

  const handleSave = async (input: ItemInput) => {
    if (editingItem) { await api.updateItem(editingItem.id, input); }
    else { await api.createItem(input); }
    setModalOpen(false); setEditingItem(null); await fetchData();
  };
  const handleEdit = (item: Item) => { setEditingItem(item); setModalOpen(true); };
  const handleDelete = async (id: number) => { if (!confirm('确定删除？')) return; await api.deleteItem(id); await fetchData(); };
  const handleAdd = () => { setEditingItem(null); setModalOpen(true); };
  const handleStatusChange = async (id: number, status: ItemStatus, name: string) => {
    if (!confirm(`确定把「${name}」标记为「${status}」吗？`)) return;
    await api.updateItem(id, { status });
    await fetchData();
  };

  return (
    <>
      <Navbar />
      <div className="app">
        <CategoryChart categories={categories} status={statusTab} />

        {categories.length > 0 && (
          <CategoryBar categories={categories} activeCategory={activeCategory} onSelect={(cat) => setActiveCategory(activeCategory === cat ? '' : cat)} />
        )}

        <div className="toolbar">
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {(['想买', '已买', '放弃'] as ItemStatus[]).map((s) => (
              <button key={s} className={`btn btn-sm ${statusTab === s ? 'btn-active' : 'btn-outline'}`} onClick={() => { setStatusTab(s); setActiveCategory(''); }}>{s}</button>
            ))}
          </div>
          <div className="toolbar-spacer" />
          <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortField)}>
            <option value="created_at">按添加时间</option>
            <option value="priority">按优先级</option>
            <option value="subtotal">按金额</option>
            <option value="planned_date">按计划日期</option>
          </select>
          <button className="btn btn-sm btn-outline" onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}>
            {sortDir === 'desc' ? '↓ 降序' : '↑ 升序'}
          </button>
        </div>

        {loading ? (
          <div className="empty-state"><div className="empty-state-icon">⏳</div><div className="empty-state-text">加载中...</div></div>
        ) : sortedItems.length === 0 ? (
          <div className="empty-state animate-fade-in-up">
            <div className="empty-state-icon">{statusTab === '想买' ? '🛒' : statusTab === '已买' ? '✅' : '🗑️'}</div>
            <div className="empty-state-text">{statusTab === '想买' ? '还没有想买的东西' : `暂无${statusTab}的物品`}</div>
            {statusTab === '想买' && <button className="btn btn-gradient" onClick={handleAdd}>+ 添加第一个物品</button>}
          </div>
        ) : (
          <div className="item-grid">
            {sortedItems.map((item) => (<ItemCard key={item.id} item={item} onEdit={handleEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />))}
          </div>
        )}

        {statusTab === '想买' && <button className="fab" onClick={handleAdd} title="添加物品">+</button>}
        {modalOpen && <ItemModal item={editingItem} onSave={handleSave} onClose={() => { setModalOpen(false); setEditingItem(null); }} />}
      </div>
    </>
  );
}
