# MonadFlow Backend Service

基于 Next.js + TypeScript 的后端服务，监听链上事件并处理交易。

## 功能说明

后端服务监听链上的 `FundsLocked` 事件，当用户锁定资金后：

1. **接收事件**：监听 `FundsLocked` 事件
2. **生成图片**：调用 `generateImage` 接口（模拟，sleep 10秒）
3. **随机结果**：70% 成功率，30% 失败率
4. **成功**：调用合约 `confirmTransaction`，服务商收到资金
5. **失败**：调用合约 `cancelTransaction`，用户收到退款

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

创建 `.env.local` 文件：

```bash
# 服务提供商私钥（用于确认/取消交易）
SERVICE_PRIVATE_KEY=你的服务提供商私钥

# Monad 测试网 RPC
MONAD_RPC_URL=https://testnet-rpc.monad.xyz

# 合约地址
CONTRACT_ADDRESS=0x8AA865E227346122E734c7A4df5836Fd2Ab48218
```

### 3. 启动服务

```bash
npm run dev
```

服务将在 `http://localhost:3001` 启动。

## 工作流程

```
用户锁定资金 (Try)
    ↓
链上 FundsLocked 事件
    ↓
后端监听器接收事件
    ↓
调用 generateImage (sleep 10秒)
    ↓
随机成功/失败
    ↓
成功 → confirmTransaction → 服务商收到资金
失败 → cancelTransaction → 用户收到退款
```

## API 端点

- `GET /api/health` - 健康检查
- `GET /api/status` - 服务状态

## 项目结构

```
backend/
├── app/
│   ├── api/              # API Routes
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── lib/
│   ├── config.ts          # 配置管理
│   ├── init.ts            # 初始化脚本
│   ├── listeners/         # 事件监听器
│   └── services/          # 业务服务
└── instrumentation.ts     # Next.js instrumentation hook
```

## 注意事项

1. **私钥安全**：服务提供商私钥必须保密，不要提交到 git
2. **余额充足**：服务提供商账户需要有足够的 MON 用于 Gas
3. **网络连接**：确保 RPC 端点可访问
4. **事件监听**：服务会持续监听链上事件

## 日志说明

- 🔔 收到事件
- 🎨 开始生成图片
- ⏳ 等待 10 秒
- ✅ 成功确认交易
- ❌ 失败取消交易
