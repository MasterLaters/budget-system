import type { CategorySummary } from '../types';
import { money } from '../format';

interface Props {
  categories: CategorySummary[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}

const BADGE_COLORS = ['badge-blue', 'badge-green', 'badge-yellow', 'badge-purple', 'badge-red', 'badge-gray'];

export default function CategoryBar({ categories, activeCategory, onSelect }: Props) {
  return (
    <div className="cat-bar">
      {categories.map((c, i) => (
        <button
          key={c.category}
          className={`cat-pill ${activeCategory === c.category ? 'cat-pill-active' : ''}`}
          onClick={() => onSelect(c.category)}
        >
          <span className={`badge ${BADGE_COLORS[i % BADGE_COLORS.length]}`}>{c.category}</span>
          <span className="cat-pill-amount">
            ¥{money(c.total)} · {c.count}件
          </span>
        </button>
      ))}
    </div>
  );
}
