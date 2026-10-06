import express from 'express';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { db, closeDb, type Item } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

// 生产模式：由 Express 直接托管打包后的前端，只跑一个进程（端口 3030）
// 开发模式：Express 只提供 API（端口 3001），前端由 Vite dev server 提供
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || (isProd ? 3030 : 3001);

app.use(express.json({ limit: '10mb' }));

// ───────── 物品 CRUD ─────────

// 获取物品列表（可按 status 筛选）
app.get('/api/items', (req, res) => {
  const status = req.query.status as string | undefined;
  const category = req.query.category as string | undefined;

  let sql = 'SELECT * FROM items WHERE 1=1';
  const params: string[] = [];

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (category && category !== '全部') {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY created_at DESC';

  const rows = db.prepare(sql).all(...params) as Record<string, unknown>[];
  const items: Item[] = rows.map((r) => ({
    id: r.id as number,
    name: r.name as string,
    price: r.price as number,
    quantity: r.quantity as number,
    subtotal: (r.price as number) * (r.quantity as number),
    category: r.category as string,
    priority: Number(r.priority) || 3,
    link: r.link as string,
    image: r.image as string,
    note: r.note as string,
    planned_date: r.planned_date as string,
    status: r.status as string,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  }));

  res.json(items);
});

// ───────── 字段清洗工具 ─────────

/** 字符串字段统一 trim，避免粘贴时带上空格/制表符 */
function s(v: unknown, fallback = ''): string {
  if (v === undefined || v === null) return fallback;
  return String(v).trim();
}

/** 数值字段兜底 */
function n(v: unknown, fallback: number): number {
  if (v === undefined || v === null || v === '') return fallback;
  const num = Number(v);
  return Number.isFinite(num) ? num : fallback;
}

// 添加物品
app.post('/api/items', (req, res) => {
  const { name, price, quantity, category, priority, link, image, note, planned_date } = req.body;

  if (!s(name)) {
    res.status(400).json({ error: '名称必填' });
    return;
  }

  const result = db
    .prepare(
      `INSERT INTO items (name, price, quantity, category, priority, link, image, note, planned_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      s(name),
      n(price, 0),
      n(quantity, 1),
      s(category) || '未分类',
      n(priority, 3),
      s(link),
      s(image),
      s(note),
      s(planned_date)
    );

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>;
  res.json(rowToItem(item));
});

// 更新物品
app.put('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, price, quantity, category, priority, link, image, note, planned_date, status } = req.body;

  const existing = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: '物品不存在' });
    return;
  }

  db.prepare(
    `UPDATE items
     SET name = ?, price = ?, quantity = ?, category = ?, priority = ?, link = ?, image = ?, note = ?, planned_date = ?, status = ?, updated_at = datetime('now', 'localtime')
     WHERE id = ?`
  ).run(
    s(name, existing.name as string),
    n(price, existing.price as number),
    n(quantity, existing.quantity as number),
    s(category, existing.category as string),
    n(priority, existing.priority as number),
    s(link, existing.link as string),
    s(image, existing.image as string),
    s(note, existing.note as string),
    s(planned_date, existing.planned_date as string),
    s(status, existing.status as string),
    id
  );

  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as Record<string, unknown>;
  res.json(rowToItem(item));
});

// 删除物品
app.delete('/api/items/:id', (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  res.json({ deleted: result.changes > 0 });
});

// ───────── 统计接口 ─────────

// 分类汇总（可按 status 筛选，默认「想买」）
app.get('/api/summary/categories', (req, res) => {
  const raw = req.query.status;
  const status = typeof raw === 'string' && raw.trim() ? raw.trim() : '想买';

  const rows = db
    .prepare(
      `SELECT category, COUNT(*) as count, SUM(price * quantity) as total
       FROM items
       WHERE status = ?
       GROUP BY category
       ORDER BY total DESC`
    )
    .all(status) as { category: string; count: number; total: number }[];

  res.json(rows);
});

// ───────── 工具 ─────────

function rowToItem(r: Record<string, unknown>): Item {
  const priority = Number(r.priority) || 3;
  return {
    id: r.id as number,
    name: r.name as string,
    price: r.price as number,
    quantity: r.quantity as number,
    subtotal: (r.price as number) * (r.quantity as number),
    category: r.category as string,
    priority,
    link: r.link as string,
    image: r.image as string,
    note: r.note as string,
    planned_date: r.planned_date as string,
    status: r.status as string,
    created_at: r.created_at as string,
    updated_at: r.updated_at as string,
  };
}

// ───────── 生产模式：托管前端静态文件 ─────────

const distDir = join(__dirname, '..', 'dist');

if (isProd) {
  if (!existsSync(join(distDir, 'index.html'))) {
    console.error('❌ 未找到 dist/index.html，请先执行 npm run build');
    process.exit(1);
  }

  // 静态资源
  app.use(express.static(distDir));

  // SPA 兜底：非 /api 的请求一律返回 index.html
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(join(distDir, 'index.html'));
  });
}

// ───────── 启动与优雅退出 ─────────

// 显式绑定 IPv4 (0.0.0.0)。
// 原因：WSL2 的 localhost 转发只为 IPv4 监听创建 Windows 侧的 127.0.0.1 映射。
// 如果只绑定 IPv6(::)，Windows 上只有 [::1]:PORT 能访问，浏览器访问
// http://127.0.0.1:PORT 会被拒绝连接。
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 后端已启动: http://127.0.0.1:${PORT}${isProd ? ' (生产模式，已托管前端)' : ''}`);
});

function shutdown(signal: string): void {
  console.log(`\n收到 ${signal}，正在关闭...`);
  server.close(() => {
    closeDb();
    console.log('✅ 数据库已安全关闭');
    process.exit(0);
  });
  // 兜底：5 秒内没关完就强制退出
  setTimeout(() => {
    closeDb();
    process.exit(0);
  }, 5000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
