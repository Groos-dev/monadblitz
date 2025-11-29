# MonadFlow 智能合约

## 快速部署

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的私钥：

```
PRIVATE_KEY=你的私钥（不要0x前缀）
```

⚠️ **安全提示**: 使用测试账户的私钥，不要使用主账户！

### 3. 获取测试代币

访问 Monad 测试网水龙头: https://faucet.monad.xyz

### 4. 编译合约

```bash
npm run compile
```

### 5. 部署到 Monad 测试网

```bash
npm run deploy
```

部署成功后会自动：
- ✅ 显示合约地址
- ✅ 保存部署信息到 `frontend/config/deployment.json`
- ✅ 自动更新 `frontend/config/monad.ts` 中的合约地址

## 合约说明

### MonadFlowController.sol

TCC (Try-Confirm-Cancel) 协议核心合约。

**主要功能:**
- `lockFunds()` - 锁定资金 (Try 阶段)
- `confirmTransaction()` - 确认交易 (Confirm 阶段)
- `cancelTransaction()` - 取消交易 (Cancel 阶段)
- `getTransaction()` - 查询交易信息
- `isTransactionTimeout()` - 检查是否超时

**费用:**
- 平台手续费: 1% (可调整)
- Gas 费: 由交易发起方支付

## 验证部署

部署后在浏览器中查看:
```
https://explorer.testnet.monad.xyz/address/<合约地址>
```

## 测试合约

```bash
npm run test
```

## 故障排除

### 问题: 部署失败 - 余额不足
**解决**: 访问水龙头获取测试 MON

### 问题: 私钥错误
**解决**: 确保私钥正确，且不包含 `0x` 前缀

### 问题: 网络连接失败
**解决**: 检查 RPC URL 是否可用
