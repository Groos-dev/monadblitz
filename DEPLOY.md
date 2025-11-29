# MonadFlow Protocol - 部署指南

## 🚀 快速部署流程

### Step 1: 部署智能合约

```bash
cd contracts
npm install
cp .env.example .env
# 编辑 .env 填入私钥
npm run deploy
```

### Step 2: 启动前端

```bash
cd ../frontend
npm install
npm run dev
```

访问: http://localhost:3000

---

## 📝 详细步骤

### 1. 准备工作

#### 1.1 安装依赖
```bash
# 合约
cd contracts && npm install

# 前端
cd ../frontend && npm install
```

#### 1.2 配置私钥
```bash
cd contracts
cp .env.example .env
```

编辑 `.env`:
```
PRIVATE_KEY=你的私钥
```

⚠️ 使用测试账户私钥，不要使用真实资产账户！

#### 1.3 获取测试代币
- 访问: https://faucet.monad.xyz
- 输入钱包地址
- 领取测试 MON

### 2. 部署合约

```bash
cd contracts
npm run deploy
```

**成功标志:**
```
✅ MonadFlowController 部署成功!
📍 合约地址: 0x...
✅ MonadFlowNFT 部署成功!
📍 合约地址: 0x...
✅ NFT 合约已授权 Controller
✅ Controller 已配置 NFT 合约
✅ 前端配置已自动更新
```

**注意**: 最新版本会同时部署 `MonadFlowController` 和 `MonadFlowNFT` 两个合约，并自动完成相互配置。

### 3. 验证部署

访问区块浏览器:
```
https://explorer.testnet.monad.xyz/address/<合约地址>
```

### 4. 启动应用

```bash
cd ../frontend
npm run dev
```

### 5. 测试演示

1. 打开 http://localhost:3000
2. 点击"连接钱包"
3. 选择"查看实时演示"
4. 体验 AI 生成场景

---

## 🔧 配置说明

### Monad 测试网配置

- **Network Name**: Monad Testnet
- **RPC URL**: https://testnet.monad.xyz
- **Chain ID**: 10143
- **Symbol**: MON
- **Explorer**: https://explorer.testnet.monad.xyz

### 合约配置

文件: `frontend/config/monad.ts`

```typescript
export const CONTRACTS = {
  MonadFlowController: '0x...', // 部署后自动更新
  MonadFlowNFT: '0x...', // NFT 合约地址（部署后自动更新）
};
```

**NFT 功能**: 当 AI 图片生成成功后，后端服务会自动调用合约铸造 NFT 给用户。前端会轮询检查 NFT 铸造状态并显示。

---

## 🎯 演示检查清单

- [ ] MonadFlowController 合约部署成功
- [ ] MonadFlowNFT 合约部署成功
- [ ] NFT 合约已授权给 Controller
- [ ] 前端配置已更新（包括两个合约地址）
- [ ] 后端服务提供商私钥已配置
- [ ] MetaMask 连接到 Monad 测试网
- [ ] 钱包有测试 MON
- [ ] 前端可以正常访问
- [ ] 可以连接钱包
- [ ] 可以触发 TCC 流程
- [ ] 后端服务监听到 FundsLocked 事件
- [ ] NFT 自动铸造成功并显示在前端

---

## ❗ 常见问题

### Q1: 部署失败 - 余额不足
```
Error: insufficient funds
```
**解决**: 访问水龙头获取测试代币

### Q2: 前端连接失败
```
Error: Please install MetaMask
```
**解决**:
1. 安装 MetaMask
2. 添加 Monad 测试网
3. 刷新页面

### Q3: 合约交互失败
```
Error: contract not deployed
```
**解决**:
1. 检查 `frontend/config/monad.ts` 中的合约地址
2. 确认合约已成功部署
3. 检查网络是否正确

### Q4: Gas 估算失败
```
Error: cannot estimate gas
```
**解决**:
1. 确保钱包有足够 MON
2. 检查合约函数参数是否正确
3. 查看浏览器控制台详细错误

---

## 📊 性能测试

部署后可以测试:

1. **锁定速度**: 观察 Try 阶段确认时间
2. **Gas 消耗**: 记录每个操作的 gas
3. **TPS**: Monad 的高吞吐量

---

## 🔐 安全提示

1. ✅ 使用专用测试账户
2. ✅ 不要提交 `.env` 文件
3. ✅ 定期检查合约权限
4. ✅ 测试网代币无价值，但仍需妥善保管私钥

---

## 📞 需要帮助?

- 合约问题: 查看 `contracts/README.md`
- 前端问题: 查看浏览器控制台
- Monad 文档: https://docs.monad.xyz
- Discord: Monad 官方 Discord
