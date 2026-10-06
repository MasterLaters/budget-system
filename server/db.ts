import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
// 数据库文件路径：默认在项目根目录，可用环境变量 DB_PATH 覆盖
const dbPath = process.env.DB_PATH || join(__dirname, '..', 'data.db');

export const db = new DatabaseSync(dbPath);

// 启用 WAL 提升读写性能
db.exec('PRAGMA journal_mode = WAL');
db.exec('PRAGMA foreign_keys = ON');

/** 关闭数据库连接：会触发 WAL 检查点，确保数据落盘到 data.db */
export function closeDb(): void {
  try {
    db.exec('PRAGMA wal_checkpoint(TRUNCATE)');
  } catch {
    // 忽略检查点失败
  }
  try {
    db.close();
  } catch {
    // 已关闭则忽略
  }
}

// 初始化表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 1,
    category TEXT NOT NULL DEFAULT '未分类',
    priority INTEGER NOT NULL DEFAULT 3,
    link TEXT DEFAULT '',
    image TEXT DEFAULT '',
    note TEXT DEFAULT '',
    planned_date TEXT DEFAULT '',
    purchased_at TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT '想买',
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime'))
  )
`);

// 迁移：为旧库补充 purchased_at 字段（已存在则跳过）
const itemCols = db.prepare('PRAGMA table_info(items)').all() as { name: string }[];
if (!itemCols.some((c) => c.name === 'purchased_at')) {
  db.exec(`ALTER TABLE items ADD COLUMN purchased_at TEXT DEFAULT ''`);
}

// 说明：这里刻意不做任何「自动插入示例数据」的逻辑。
// 数据库是持久化的，清空清单后重启不应把示例数据重新塞回来。

export interface Item {
  id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  category: string;
  priority: number;
  link: string;
  image: string;
  note: string;
  planned_date: string;
  purchased_at: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type Priority = 1 | 2 | 3 | 4 | 5;
export type ItemStatus = '想买' | '已买' | '放弃';
