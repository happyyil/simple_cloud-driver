# Cloud Driver - 网盘系统

一个基于 Web 的个人网盘应用，支持文件上传、下载、文件夹管理和文件分享功能。

## 功能特性

### 用户系统
- 用户注册与登录
- JWT 认证机制
- 个人信息管理

### 文件管理
- 文件上传、下载、删除
- 文件重命名
- 文件列表展示（列表/网格视图）

### 文件夹管理
- 创建、删除、重命名文件夹
- 层级目录结构
- 面包屑导航

### 文件分享
- 将文件分享给其他用户
- 查看收到的分享
- 分享消息通知

### 受信任用户
- 添加/移除受信任用户
- 快速分享给信任用户

## 技术栈

### 前端 (client)
- **框架**: React 19
- **构建工具**: Vite 8
- **UI 组件库**: Ant Design 6
- **HTTP 客户端**: Axios
- **路由**: React Router DOM 7

### 后端 (server)
- **运行时**: Node.js
- **框架**: Express 5
- **数据库**: SQLite
- **ORM**: Prisma
- **认证**: JWT + bcrypt
- **文件上传**: Multer

## 项目结构

```
cloud-driver_app/
├── client/                    # 前端项目
│   ├── src/
│   │   ├── components/        # 通用组件
│   │   ├── context/           # React Context
│   │   ├── pages/             # 页面组件
│   │   ├── services/          # API 服务
│   │   └── assets/            # 静态资源
│   └── package.json
│
├── server/                    # 后端项目
│   ├── src/
│   │   ├── controllers/       # 控制器
│   │   ├── routes/            # 路由定义
│   │   ├── services/          # 业务逻辑
│   │   ├── middlewares/       # 中间件
│   │   └── config/            # 配置文件
│   ├── prisma/
│   │   └── schema.prisma      # 数据库模型
│   └── package.json
│
└── README.md
```

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
# 安装前端依赖
cd client
npm install

# 安装后端依赖
cd ../server
npm install
```

### 配置环境变量

在 `server` 目录下创建 `.env` 文件：

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-jwt-secret-key"
PORT=3000
```

### 初始化数据库

```bash
cd server
npx prisma generate
npx prisma migrate dev
```

### 启动开发服务器

```bash
# 启动后端 (在 server 目录)
npm run dev

# 启动前端 (在 client 目录，新终端窗口)
npm run dev
```

- 前端默认运行在: http://localhost:5173
- 后端默认运行在: http://localhost:3000

## API 接口

### 认证
| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/register | 用户注册 |
| POST | /api/auth/login | 用户登录 |

### 文件管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/files | 获取文件列表 |
| POST | /api/files | 创建文件夹 |
| POST | /api/files/upload | 上传文件 |
| GET | /api/files/:id/download | 下载文件 |
| PATCH | /api/files/:id | 重命名文件 |
| DELETE | /api/files/:id | 删除文件 |

### 分享管理
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/share/received | 获取收到的分享 |
| POST | /api/share | 分享文件 |
| DELETE | /api/share/:id | 取消分享 |

### 受信任用户
| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/trusted | 获取信任列表 |
| POST | /api/trusted | 添加信任用户 |
| DELETE | /api/trusted/:id | 移除信任用户 |

## 开发指南

### 数据库管理
```bash
# 打开 Prisma Studio 可视化管理数据库
npm run prisma:studio
```

### 构建生产版本
```bash
# 前端构建
cd client
npm run build
```

## 许可证

ISC
