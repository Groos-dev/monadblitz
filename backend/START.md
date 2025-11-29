# 后端服务启动指南

## 快速开始

### 1. 配置环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，设置服务提供商的私钥：

```bash
SERVICE_PRIVATE_KEY=你的服务提供商私钥
```

### 2. 启动服务

```bash
npm run dev
```

## 工作流程

1. **监听事件**：后端持续监听链上的 `FundsLocked` 事件
2. **生成图片**：收到事件后，调用 `generateImage`（模拟，sleep 10秒）
3. **随机结果**：70% 成功率，30% 失败率
4. **成功**：调用合约 `confirmTransaction`，服务商收到资金
5. **失败**：等待超时后调用合约 `cancelTransaction`，用户收到退款

## 注意事项

- 服务提供商账户需要有足够的 MON 用于 Gas
- 确保 RPC 端点可访问
- 服务会持续运行，监听链上事件

## 测试

1. 确保后端服务正在运行
2. 在前端锁定资金
3. 观察后端日志，查看处理流程
