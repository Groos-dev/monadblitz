# Monad Blitz 开发者速查手册

> 本文档包含 Monad Blitz 黑客松的核心开发信息，帮助你快速构建创新项目并赢得比赛。

---

## 🎯 比赛核心规则

### 必须遵守的规则

1. **原创性要求**
   - 必须是全新项目，不能提交已有项目或分叉现有代码库
   - 所有开发必须在比赛时间内开始（GitHub 提交时间会被检查）
   - 可以使用标准库/样板代码（如 Scaffold-ETH）

2. **部署要求**
   - 智能合约必须部署在 **Monad Testnet** 上
   - 前端必须部署在公网上（推荐使用 Vercel）
   - GitHub 仓库必须公开
   - 部署需要长期有效以供审查

3. **团队要求**
   - 最多 3 人
   - 只有队长可以提交项目
   - 项目提交后无法更换队伍

4. **创新而非复制**
   - 不要简单复制现有应用
   - 必须引入重大创新或独特的 Monad 特性
   - 问自己："我在 Monad 上解决了什么新问题？"

5. **MOJO 平台**
   - 必须在 https://mojo.monad.xyz/ 上注册并提交项目
   - 确保能成功登录（不要等到最后一刻）

---

## 🏆 评审标准（如何获得高分）

投票评分标准（0-10 分）：

### 优先考虑的因素

1. **新颖性和原创性** (最重要)
   - 真正新颖的构想
   - 独特的技术应用
   - 针对现有问题的新解决方案

2. **创新程度**
   - 巧妙的机制设计
   - 独特的智能合约架构
   - **充分利用 Monad 的特性**（高性能、并行执行）

3. **解决实际问题**
   - 针对真实用例
   - 有趣或实用的挑战解决方案

4. **学习与实验精神**
   - 勇于尝试新技术
   - 突破界限的创新

### 评审精神
- 不是选最完善的作品，而是最有**启发性和创新性**的想法
- 展示你对 Monad 独特优势的理解和应用

---

## ⚡ Monad 核心优势（利用这些特性加分）

### Monad 的技术特点

- **10,000 TPS** - 超高吞吐
- 量
- **~0.4 秒出块时间** - 接近实时
- **单槽终结** - 即时确认
- **并行执行** - EVM 并行处理
- **极低费用** - 适合小额支付和高频交易

### 适合 Monad 的应用场景

利用这些特性构建创新应用：

1. **高频交易/游戏**
   - 链上游戏逻辑
   - 实时竞技游戏
   - 高频 DeFi 策略

2. **小额支付/订阅**
   - 按使用付费的 API
   - 内容订阅
   - x402 协议应用

3. **AI 代理经济**
   - 机器对机器支付
   - 自主 AI 代理交易
   - 链上 AI 推理市场

4. **社交/内容应用**
   - 实时社交互动
   - 链上内容创作
   - 去中心化社交网络

5. **DeFi 创新**
   - 高频做市
   - 复杂衍生品
   - 实时清算系统

---

## 🚀 快速开发流程

### 推荐技术栈

#### 使用 Scaffold-ETH 2（强烈推荐）

**安装：**
```bash
npx create-eth@latest
```

**技术栈：**
- 前端：NextJS + Tailwind + DaisyUI + RainbowKit + Wagmi/Viem
- 合约：Hardhat 或 Foundry（选一个）

**本地开发：**
```bash
# 启动本地区块链
yarn chain

# 部署合约到本地
yarn deploy

# 启动前端
yarn start
```

**部署到 Monad Testnet：**
```bash
# 部署合约
yarn deploy --network monad_testnet

# 验证合约
yarn verify --network monad_testnet

# 部署前端到 Vercel
yarn vercel
yarn vercel --prod  # 生产环境
```

### AI 辅助开发技巧

#### 推荐工具
- **Cursor** - AI 代码编辑器（学生免费一年：https://www.cursor.com/students）
- **Claude 3.5/3.7** - 最佳 AI 模型
- Scaffold-ETH 内置 Cursor 规则文件

#### 最佳实践
1. **清晰的提示词** - 一次解决一个问题
2. **一问一答** - 不要在同一对话中偏离主题
3. **及时止损** - 如果 AI 尝试 5-10 次仍失败，换方法或手动处理
4. **迭代开发** - 一个对话对应一个功能

---

## 🔧 Monad Testnet 配置

### 网络信息

```javascript
{
  rpcUrl: "https://testnet-rpc.monad.xyz",
  chainId: 10143,
  chainIdHex: "0x279F",
  currency: "MON",
  explorerUrl: "https://testnet.monadexplorer.com/",
  faucet: "https://testnet.monad.xyz"
}
```

### 测试代币地址

| 代币 | 地址 |
|------|------|
| WMON | `0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701` |
| USDC | `0xf817257fed379853cDe0fa4F97AB987181B1E5Ea` |
| USDT | `0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D` |
| WBTC | `0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d` |
| WETH | `0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37` |

### 重要合约

| 合约 | 地址 |
|------|------|
| Multicall3 | `0xcA11bde05977b3631167028862bE2a173976CA11` |
| UniswapV2Router02 | `0xfb8e1c3b833f9e67a71c859a132cf783b645e436` |
| UniswapV3Factory | `0x961235a9020b05c44df1026d956d1f4d78014276` |
| UniversalRouter | `0x3aE6D8A282D67893e17AA70ebFFb33EE5aa65893` |

**获取测试代币：** 私信 Monad 团队成员

### Gas 设置

⛽ **重要：Gas 价格必须设置为最低 50 gwei**

```javascript
const tx = {
  // ...
  gasPrice: ethers.utils.parseUnits("50", "gwei")
}
```

---

## 📝 合约验证

### Foundry 验证（推荐 Foundry 1.0.0）

```bash
forge verify-contract \
  --rpc-url https://testnet-rpc.monad.xyz \
  --verifier sourcify \
  --verifier-url 'https://sourcify-api-monad.blockvision.org' \
  [合约地址] \
  [合约文件]:[合约名称]
```

### Hardhat 验证

**hardhat.config.ts：**
```typescript
const config: HardhatUserConfig = {
  solidity: "0.8.25",
  networks: {
    'monad': {
      url: 'https://testnet-rpc.monad.xyz',
      chainId: 10143
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: "https://sourcify-api-monad.blockvision.org/",
    browserUrl: "https://testnet.monadexplorer.com/"
  },
  etherscan: {
    enabled: false,
  }
};
```

**验证命令：**
```bash
npx hardhat verify \
  --network monad \
  [合约地址] \
  [...构造函数参数]
```

---

## 🛠️ 关键技术资源

### 账户抽象 / 社交登录

**Privy（推荐）**
- 社交登录集成
- 嵌入式钱包
- 无 Gas 交易支持
- 文档：https://docs.privy.io/

**Pimlico**
- ERC-4337 账户抽象
- 与 Privy 集成
- 文档：https://docs.pimlico.io/

### 跨链桥

**Chainlink CCIP**
- 文档：https://docs.chain.link/ccip/directory/testnet/chain/monad-testnet

**LayerZero**
- 文档：https://docs.layerzero.network/v2/deployments/deployed-contracts

### 索引器

**Envio HyperIndex**
- 高性能事件索引
- 文档：https://docs.monad.xyz/guides/indexers/tg-bot-using-envio

**QuickNode Streams**
- 实时数据流
- 文档：https://docs.monad.xyz/guides/indexers/quicknode-streams

### API 服务

**Alchemy**
- NFT API：https://www.alchemy.com/docs/reference/nft-api-quickstart
- Portfolio API：https://www.alchemy.com/docs/reference/portfolio-apis
- Token API：https://www.alchemy.com/docs/reference/token-api-quickstart
- Webhooks：https://www.alchemy.com/docs/reference/notify-api-quickstart

**Codex（NFT）**
- NFT Holders：https://docs.codex.io/reference/nftholders
- Wallet Collections：https://docs.codex.io/reference/walletnftcollections

**Zerion（Portfolio）**
- Wallet Portfolio：https://developers.zerion.io/reference/getwalletportfolio
- Transactions：https://developers.zerion.io/reference/listwallettransactions

### 预言机

**Chainlink**
- Data Streams：https://docs.chain.link/data-streams

**Pyth**
- Price Feeds：https://www.pyth.network/developers/price-feed-ids
- 合约地址：https://docs.pyth.network/price-feeds/contract-addresses/evm

### 钱包连接

**Reown（WalletConnect）**
- 文档：https://docs.monad.xyz/guides/reown-guide

---

## 💰 x402 小额支付协议（创新方向）

### 什么是 x402？

HTTP 402 "需要付款" 协议 - 互联网原生小额支付的最小协议

**核心流程：**
1. 客户端请求资源
2. 服务器返回 402 支付要求
3. 客户端签名交易付款
4. 服务器验证并提供内容

### 为什么适合 Monad？

- 即时结算（~0.4 秒）
- 极低费用（适合小额支付）
- 高吞吐量（支持大规模使用）
- 完美支持 AI 代理经济

### 快速集成 Thirdweb Facilitator

**安装：**
```bash
npm install thirdweb dotenv express cors
```

**环境变量（.env）：**
```bash
THIRDWEB_CLIENT_ID=your_client_id
THIRDWEB_SECRET_KEY=your_secret_key
RECIPIENT_WALLET=0xYourWallet
```

**服务器端（Express）：**
```javascript
require("dotenv").config();
const express = require("express");
const { createThirdwebClient } = require("thirdweb");
const { facilitator, settlePayment } = require("thirdweb/x402");
const { defineChain } = require("thirdweb/chains");

const app = express();
app.use(express.json());
app.use(require("cors")());

const monadTestnet = defineChain(10143);
const client = createThirdwebClient({
  secretKey: process.env.THIRDWEB_SECRET_KEY
});

const twFacilitator = facilitator({
  client,
  serverWalletAddress: process.env.RECIPIENT_WALLET,
});

app.get("/premium", async (req, res) => {
  const result = await settlePayment({
    resourceUrl: "http://localhost:3000/premium",
    method: "GET",
    paymentData: req.headers["x-payment"],
    network: monadTestnet,
    price: "$0.0001",
    payTo: process.env.RECIPIENT_WALLET,
    facilitator: twFacilitator,
  });

  if (result.status === 200) {
    res.json({
      message: "支付成功！⚡",
      tx: result.transactionHash
    });
  } else {
    res.status(result.status)
       .set(result.responseHeaders || {})
       .json(result.responseBody);
  }
});

app.listen(3000);
```

**客户端（React）：**
```typescript
import { createThirdwebClient } from "thirdweb";
import { wrapFetchWithPayment } from "thirdweb/x402";
import { createWallet } from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: "YOUR_PUBLIC_CLIENT_ID",
});

const payAndFetch = async () => {
  const wallet = createWallet("io.metamask");
  await wallet.connect({ client });

  const fetchPay = wrapFetchWithPayment(fetch, client, wallet);
  const res = await fetchPay("/premium");
  const data = await res.json();
  console.log(data);
};
```

**测试 USDC 水龙头：**
- Circle USDC: `0x534b2f3A21130d7a60830c2Df862319e593943A3`
- 水龙头：https://faucet.circle.com/

---

## 🎨 UI/UX 快速开发工具

### AI 设计工具

1. **v0.dev** - Vercel AI 设计工具
   - https://v0.dev

2. **Lovable** - AI 生成 Web 应用
   - https://lovable.dev

3. **Stitch by Google** - AI UI 生成
   - https://stitch.google

### 视觉资源

- 先尝试 ChatGPT 生成
- 使用 Claude 生成代码
- AI 图像生成工具推荐：https://x.com/kvncnls/status/1899474210042355780

---

## 📚 学习资源（快速提升）

### Solidity 速成

- **CryptoZombies** - 游戏化学习：https://cryptozombies.io/
- **Solidity by Example** - 代码示例：https://solidity-by-example.org/
- **Cyfrin Updraft** - 免费课程：https://updraft.cyfrin.io/
- **OpenZeppelin Contracts** - 最佳实践库

### DeFi 知识

- **Awesome DeFi** - DeFi 资源合集：https://github.com/ong/awesome-decentralized-finance
- **DeFi MOOC** - 顶级 DeFi 课程：https://defi-learning.org/

### EVM 深入理解

- **EVM.codes** - 操作码详解：https://www.evm.codes/
- **EVM Illustrated** - 图解 EVM：https://takenobu-hs.github.io/downloads/ethereum_evm_illustrated.pdf

### Monad 架构

- **共识机制：** https://docs.monad.xyz/monad-arch/consensus/monad-bft
- **并行执行：** https://docs.monad.xyz/monad-arch/execution/parallel-execution
- **MonadDB：** https://docs.monad.xyz/monad-arch/execution/monaddb

---

## ✅ 提交检查清单

在提交前确保：

- [ ] GitHub 仓库公开
- [ ] 所有提交时间都在比赛期间内
- [ ] 智能合约已部署到 Monad Testnet
- [ ] 智能合约已验证
- [ ] 前端已部署到公网（Vercel/Netlify）
- [ ] README 包含项目说明和部署地址
- [ ] 在 MOJO 平台提交项目（只有队长可以）
- [ ] 测试所有核心功能正常工作
- [ ] 准备 5 分钟演示（重点是实机演示）

---

## 🎤 演示准备（5 分钟）

### 演示重点

1. **实机演示**（70% 时间）
   - 展示在 Monad Testnet 上运行的项目
   - 演示核心功能

2. **技术亮点**（20% 时间）
   - 如何利用 Monad 特性
   - 克服的技术挑战

3. **创新点**（10% 时间）
   - 为什么这个想法新颖
   - 解决了什么问题

### 演示技巧

- **练习计时** - 5 分钟很短，反复排练
- **聚焦核心** - 只展示最独特的部分
- **准备备选方案** - 截图/视频以防演示失败
- **热情表达** - 让评委感受到你的激情
- **快速切入** - 减少开场白，直接展示

### 备选方案

准备以下内容以防万一：
- 核心功能截图
- 项目运行视频
- 确保测试网部署稳定

---

## 💡 创新方向建议

基于 Monad 特性，这些方向可能获得高分：

### 高频/实时应用
- 链上游戏（利用低延迟）
- 实时竞价/拍卖系统
- 高频交易策略

### 小额支付经济
- 内容订阅平台
- 按使用付费 API
- AI 代理支付网络

### DeFi 创新
- 高频做市商
- 实时清算引擎
- 链上衍生品交易

### 社交/内容
- 去中心化社交网络
- 实时内容创作平台
- 链上游戏直播

### AI + Web3
- AI 代理自主交易
- 链上 AI 推理市场
- 去中心化 AI 训练

---

## 🚨 常见错误避免

1. **不要等到最后才部署** - 提前测试部署流程
2. **不要忘记验证合约** - 影响评审查看代码
3. **不要超时提交** - 可能影响参赛资格
4. **不要自己给自己投票** - 会被删除
5. **不要忽略 GitHub 提交时间** - 必须在比赛期间
6. **不要忘记测试 MOJO 登录** - 提前确认能登录
7. **不要做过于复杂的项目** - 专注核心创新点

---

## 📞 获取帮助

- **Monad 团队** - 现场导师指导
- **开发者门户：** https://developers.monad.xyz/
- **官方文档：** https://docs.monad.xyz/
- **MOJO 平台：** https://mojo.monad.xyz/

---

## 🎯 成功策略总结

1. **专注创新而非完美** - 评审看重新颖想法
2. **充分利用 Monad 特性** - 展示对平台的理解
3. **简化 MVP** - 核心功能完善即可
4. **提前准备** - 头脑风暴和技术方案提前规划
5. **使用 AI 工具加速开发** - Cursor + Scaffold-ETH
6. **测试再测试** - 确保演示时不出错
7. **清晰表达** - 让评委理解你的创新点

---

**祝你在 Monad Blitz 中取得好成绩！⚡**
