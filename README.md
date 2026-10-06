# 预算系统 (Budget System)

一个本地单机使用的购物清单 / 预算管理程序。

React + Vite + TypeScript（前端）· Node.js + Express（后端）· SQLite（存储）· systemd（开机自启）

## 功能

### 清单管理
- 物品增删改查：名称 / 单价 / 数量 / 分类 / 优先级 / 商品链接 / 图片 URL / 备注 / 计划购买日期
- 三档清单切换：**想买 / 已买 / 放弃**
- 卡片右下角一键流转到其他两档，三个按钮均带二次确认
- 优先级 1–5 星

### 日期
- **计划购买日期**：所有物品可填
- **购买日期**：点「已买」时自动记录当前时间，可在编辑弹窗中修改
- 已买卡片上两个日期并排显示：📅 计划（灰）+ 🛒 购于（绿）

### 统计
- 分类占比环形图，跟随当前清单切换，常显示（无数据时显示占位）
- 分类标签汇总（金额 + 件数），点击可筛选
- 排序：添加时间 / 优先级 / 金额 / 计划日期，支持升降序

### 体验细节
- 图片按原始比例完整显示，不裁剪
- 金额保留两位小数，不做取整
- 编辑弹窗点击外部不会关闭，避免误丢填写内容
- 切换清单时自动清空分类筛选

## 技术栈

| 层 | 技术 |
|------|------|
| 前端 | React 19 + Vite + TypeScript |
| 后端 | Node.js 24 + Express |
| 数据库 | SQLite（`node:sqlite`，零编译依赖） |
| 部署 | systemd 开机自启 |

## 快速开始

### 环境要求
- Node.js >= 24（使用内置 `node:sqlite`）

### 安装与运行

```bash
# 安装依赖
npm install

# 构建前端
npm run build

# 生产模式（单进程，访问 http://127.0.0.1:3030）
npm start
```

### 开发模式（带热更新）

```bash
npm run dev
```

前端 http://127.0.0.1:3030 ，后端 API http://127.0.0.1:3001 （Vite 自动代理）

## 数据说明

- 数据库文件为 `data.db`，首次启动自动创建
- 程序**不会**自动写入示例数据，清空清单后重启也不会恢复示例
- 建议定期备份 `data.db`

## 接口一览

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/items` | GET | 列表，支持 `?status=` `?category=` 筛选 |
| `/api/items` | POST | 新增 |
| `/api/items/:id` | PUT | 更新（支持部分字段，含 `purchased_at`） |
| `/api/items/:id` | DELETE | 删除 |
| `/api/summary/categories` | GET | 分类汇总，支持 `?status=`，默认「想买」 |

## 版本历史

| 版本 | 说明 |
|------|------|
| v1.1.0 | 清单流转、分类统计、购买日期 |
| v1.0.0 | 首个正式版本 |

## 目录结构

```
.
├── server/              # 后端（Express + SQLite）
│   ├── index.ts
│   └── db.ts
├── src/                 # 前端（React + TypeScript）
│   ├── components/      # 组件
│   ├── App.tsx
│   ├── api.ts
│   ├── format.ts
│   ├── types.ts
│   ├── main.tsx
│   └── styles.css
├── index.html
├── vite.config.ts
└── package.json
```
