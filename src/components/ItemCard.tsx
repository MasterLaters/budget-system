import type { Item, ItemStatus } from '../types';
import { money } from '../format';

interface Props {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number, status: ItemStatus, name: string) => void;
}

const CATEGORY_BADGE: Record<string, string> = {
  数码: 'badge-blue',
  家居: 'badge-green',
  服饰: 'badge-purple',
  食品: 'badge-yellow',
  美妆: 'badge-red',
  运动: 'badge-green',
  书籍: 'badge-blue',
  其他: 'badge-gray',
};

// 各个清单里可以切换到的目标状态（不含当前状态）
const STATUS_ACTIONS: Record<ItemStatus, ItemStatus[]> = {
  想买: ['已买', '放弃'],
  已买: ['想买', '放弃'],
  放弃: ['想买', '已买'],
};

// 目标状态对应的按钮配色
const STATUS_BTN_CLASS: Record<ItemStatus, string> = {
  想买: 'status-btn status-btn-buy',
  已买: 'status-btn status-btn-bought',
  放弃: 'status-btn status-btn-drop',
};

export default function ItemCard({ item, onEdit, onDelete, onStatusChange }: Props) {
  const stars = '★'.repeat(item.priority) + '☆'.repeat(5 - item.priority);
  const priorityLabel = ['', '无所谓', '可买可不买', '一般', '比较想要', '非常想要'][item.priority];
  const badgeClass = CATEGORY_BADGE[item.category] || 'badge-gray';

  return (
    <div className="item-card">
      {item.image ? (
        <img className="item-card-image" src={item.image} alt={item.name} loading="lazy" />
      ) : (
        <div className="item-card-image-placeholder">🛍️</div>
      )}

      <div className="item-card-body">
        <div className="item-card-top">
          <span className="item-card-name" title={item.name}>{item.name}</span>
          <div className="item-card-actions">
            <button className="icon-btn" title="编辑" onClick={() => onEdit(item)}>✏️</button>
            <button className="icon-btn" title="删除" onClick={() => onDelete(item.id)}>🗑️</button>
          </div>
        </div>

        <div className="item-card-price">
          ¥{money(item.subtotal)}
          {item.quantity > 1 && (
            <span className="unit"> · ¥{money(item.price)} × {item.quantity}</span>
          )}
        </div>

        <div className="item-card-meta">
          <span className={`badge ${badgeClass}`}>{item.category}</span>
          <span className="badge badge-yellow" title={priorityLabel}>{stars}</span>
        </div>

        {item.note && (
          <p className="item-card-note">{item.note}</p>
        )}

        {(item.planned_date || (item.status === '已买' && item.purchased_at)) && (
          <div className="item-card-meta" style={{ marginTop: '0.25rem' }}>
            {item.planned_date && (
              <span className="badge badge-gray">📅 {item.planned_date}</span>
            )}
            {item.status === '已买' && item.purchased_at && (
              <span className="badge badge-green">🛒 购于 {item.purchased_at.slice(0, 10)}</span>
            )}
          </div>
        )}

        {item.link && (
          <div style={{ marginTop: '0.5rem' }}>
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="link-tag">
              🔗 商品链接
            </a>
          </div>
        )}

        {/* 右下角状态切换按钮 */}
        <div className="item-card-footer">
          {STATUS_ACTIONS[item.status].map((target) => (
            <button
              key={target}
              className={STATUS_BTN_CLASS[target]}
              onClick={() => onStatusChange(item.id, target, item.name)}
            >
              {target}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
