# MonadFlow 合约部署指南

## 快速部署步骤

### 1. 安装 Hardhat

```bash
cd /Users/groos/repo/monadblitz/contracts
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npx hardhat init
```

选择 "Create a TypeScript project"

### 2. 配置 Hardhat

编辑 `hardhat.config.ts`:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    monadTestnet: {
      url: "https://testnet.monad.xyz",
      chainId: 10143,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
};

export default config;
```

### 3. 创建 .env 文件

```bash
PRIVATE_KEY=你的私钥（不要包含0x前缀）
```

⚠️ **注意**: 永远不要提交 `.env` 文件到 git！

### 4. 编译合约

```bash
npx hardhat compile
```

### 5. 部署到 Monad 测试网

创建 `scripts/deploy.ts`:

```typescript
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying MonadFlowController...");

  const MonadFlowController = await ethers.getContractFactory("MonadFlowController");
  const contract = await MonadFlowController.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`MonadFlowController deployed to: ${address}`);

  // 保存地址到文件
  const fs = require('fs');
  const deploymentInfo = {
    address,
    deployer: (await ethers.getSigners())[0].address,
    timestamp: new Date().toISOString(),
    network: 'monadTestnet',
  };

  fs.writeFileSync(
    '../frontend/config/deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("Deployment info saved to frontend/config/deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

运行部署:

```bash
npx hardhat run scripts/deploy.ts --network monadTestnet
```

### 6. 验证合约（可选）

```bash
npx hardhat verify --network monadTestnet <合约地址>
```

### 7. 更新前端配置

部署成功后，将合约地址更新到 `frontend/config/monad.ts`:

```typescript
export const CONTRACTS = {
  MonadFlowController: '0x你的合约地址',
};
```

## 简化版部署（如果 Hardhat 有问题）

### 使用 Remix IDE

1. 打开 https://remix.ethereum.org/
2. 创建新文件，复制 `MonadFlowController.sol` 和 `interfaces/IMonadFlow.sol`
3. 编译合约
4. 在 Deploy 标签：
   - Environment: Injected Provider - MetaMask
   - 确保 MetaMask 连接到 Monad 测试网
   - 点击 Deploy
5. 复制部署的合约地址
6. 更新 `frontend/config/monad.ts`

## 测试合约功能

部署后，在 Remix 或 Hardhat console 中测试:

```javascript
// 锁定资金
await contract.lockFunds(
  "0x服务商地址",
  300, // 5分钟超时
  { value: ethers.parseEther("0.1") }
);

// 查询交易
const tx = await contract.getTransaction(txId);
console.log(tx);
```

## 故障排除

### 问题 1: Gas 估算失败
→ 确保钱包有足够的 MON 代币

### 问题 2: 网络连接失败
→ 检查 Monad 测试网 RPC 是否可用
→ 尝试使用备用 RPC: https://testnet-rpc.monad.xyz

### 问题 3: 合约部署成功但无法交互
→ 检查合约地址是否正确
→ 检查 ABI 是否匹配

## 获取测试代币

访问 Monad 测试网水龙头:
https://faucet.monad.xyz

---

**注意**: 如果时间紧急，可以暂时使用 Mock 模式演示，不需要真实部署合约。
在演示时展示合约代码即可证明技术可行性。
