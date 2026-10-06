import { useState, useEffect } from 'react';
import type { Item, ItemInput, Priority, ItemStatus } from '../types';
import { PRIORITY_LABELS } from '../types';
import { money } from '../format';

interface Props {
  item: Item | null;
  onSave: (input: ItemInput) => void;
  onClose: () => void;
}

const CATEGORIES = ['数码', '家居', '服饰', '食品', '美妆', '运动', '书籍', '其他'];
const PRIORITIES: Priority[] = [1, 2, 3, 4, 5];
const STATUSES: ItemStatus[] = ['想买', '已买', '放弃'];

export default function ItemModal({ item, onSave, onClose }: Props) {
  const [form, setForm] = useState<ItemInput>({
    name: '',
    price: 0,
    quantity: 1,
    category: '数码',
    priority: 3,
    link: '',
    image: '',
    note: '',
    planned_date: '',
    purchased_at: '',
    status: '想买',
  });

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        priority: item.priority,
        link: item.link,
        image: item.image,
        note: item.note,
        planned_date: item.planned_date,
        purchased_at: item.purchased_at,
        status: item.status,
      });
    }
  }, [item]);

  const subtotal = form.price * form.quantity;

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    onSave(form);
  };

  const update = (field: keyof ItemInput, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <div className="dialog-header">
          <h2 className="dialog-title">{item ? '编辑物品' : '添加物品'}</h2>
          <button className="dialog-close" onClick={onClose}>✕</button>
        </div>

        <div className="dialog-body">
          {item && (
            <div className="form-group">
              <span className="label-text">状态</span>
              <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.375rem' }}>
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    className={`btn btn-sm ${form.status === s ? 'btn-active' : 'btn-outline'}`}
                    onClick={() => update('status', s as ItemStatus)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="label-text">名称</label>
            <input
              className="input"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="物品名称"
              autoFocus
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label-text">单价 (¥)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update('price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="form-group">
              <label className="label-text">数量</label>
              <input
                className="input"
                type="number"
                min="1"
                step="1"
                value={form.quantity}
                onChange={(e) => update('quantity', parseInt(e.target.value) || 1)}
              />
            </div>
          </div>

          <div className="subtotal-preview">
            小计：¥{money(subtotal)}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label-text">分类</label>
              <select className="select" value={form.category} onChange={(e) => update('category', e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
                {!CATEGORIES.includes(form.category) && (
                  <option value={form.category}>{form.category}</option>
                )}
              </select>
            </div>
            <div className="form-group">
              <label className="label-text">优先级</label>
              <div className="priority-selector" style={{ marginTop: '0.25rem' }}>
                {PRIORITIES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-star-btn ${form.priority >= p ? 'priority-star-btn-active' : ''}`}
                    onClick={() => update('priority', p as Priority)}
                    title={PRIORITY_LABELS[p]}
                  >
                    ★
                  </button>
                ))}
                <span className="priority-label">{PRIORITY_LABELS[form.priority]}</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label-text">商品链接</label>
            <input
              className="input"
              type="url"
              value={form.link}
              onChange={(e) => update('link', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label className="label-text">图片 URL</label>
            <input
              className="input"
              type="url"
              value={form.image}
              onChange={(e) => update('image', e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="form-group">
            <label className="label-text">计划购买日期</label>
            <input
              className="input"
              type="date"
              value={form.planned_date}
              onChange={(e) => update('planned_date', e.target.value)}
            />
          </div>

          {form.status === '已买' && (
            <div className="form-group">
              <label className="label-text">购买日期</label>
              <input
                className="input"
                type="date"
                value={form.purchased_at.slice(0, 10)}
                onChange={(e) => {
                  // 保留原有的时分秒
                  const time = form.purchased_at.length > 10 ? form.purchased_at.slice(11) : '00:00:00';
                  update('purchased_at', e.target.value ? `${e.target.value} ${time}` : '');
                }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="label-text">备注</label>
            <textarea
              className="textarea"
              rows={2}
              value={form.note}
              onChange={(e) => update('note', e.target.value)}
              placeholder="备注信息..."
            />
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn btn-active" onClick={handleSubmit}>
            {item ? '保存' : '添加'}
          </button>
          <button className="btn btn-outline" onClick={onClose}>取消</button>
        </div>
      </div>
    </div>
  );
}
