# MonadFlow NFT 铸造功能

## 🎨 功能概述

MonadFlow Protocol 现已支持自动 NFT 铸造功能。当 AI 图片生成成功后，后端服务会自动调用智能合约为用户铸造 NFT，将生成的艺术作品永久上链。

## 📋 合约信息

### 部署地址（Monad Testnet）

- **MonadFlowController**: `0x386DcCcDd27870636848745394A139D44aF96403`
- **MonadFlowNFT**: `0xFCdF7798E0315D02A63306F2545CB8bd67F5BaE1`

### NFT 详情

- **名称**: MonadFlow AI Art
- **符号**: MFAI
- **标准**: ERC-721
- **区块链浏览器**: 
  - Controller: https://testnet.monadexplorer.com/address/0x386DcCcDd27870636848745394A139D44aF96403
  - NFT: https://testnet.monadexplorer.com/address/0xFCdF7798E0315D02A63306F2545CB8bd67F5BaE1

## 🔄 工作流程

### 1. 用户发起请求（Try）
- 用户在前端选择 AI 生成提示词
- 点击"开始生成"按钮
- 前端调用 `lockFunds()` 锁定 0.1 MON

### 2. 资金锁定（Lock）
- 智能合约锁定用户资金
- 触发 `FundsLocked` 事件
- 返回唯一交易 ID（txId）

### 3. 后端处理（Execute）
- 后端监听到 `FundsLocked` 事件
- 模拟 AI 图片生成（实际项目中调用真实 AI API）
- 生成 IPFS hash 作为结果

### 4. 确认并铸造（Confirm + Mint）
- 后端调用 `confirmTransaction(txId, resultHash, tokenURI)`
- 合约自动执行：
  - ✅ 结算资金（扣除 1% 平台费用）
  - ✅ 铸造 NFT 给用户
  - ✅ 记录 NFT Token ID 和交易 ID 的映射

### 5. 前端显示（Complete）
- 前端轮询查询 NFT 铸造状态
- 根据 txId 获取 Token ID
- 显示 NFT 详细信息：
  - Token ID
  - 所有者地址
  - Token URI (IPFS)
  - 区块链浏览器链接

## 💻 前端集成

### 使用 useNFT Hook

```typescript
import { useNFT } from '@/lib/hooks/useNFT';

function MyComponent() {
  const nft = useNFT();
  const [txId, setTxId] = useState<string | null>(null);
  const [nftInfo, setNftInfo] = useState<any>(null);

  // 检查 NFT 是否已铸造
  useEffect(() => {
    if (!txId) return;

    const checkNFT = async () => {
      const tokenId = await nft.getTokenIdByTxId(txId);
      if (tokenId) {
        const info = await nft.getNFTInfo(tokenId);
        setNftInfo(info);
      }
    };

    checkNFT();
  }, [txId]);

  return (
    <div>
      {nftInfo && (
        <div>
          <h3>NFT 铸造成功！</h3>
          <p>Token ID: {nftInfo.tokenId}</p>
          <p>所有者: {nftInfo.owner}</p>
          <p>Token URI: {nftInfo.tokenURI}</p>
        </div>
      )}
    </div>
  );
}
```

### NFT 信息接口

```typescript
interface NFTInfo {
  tokenId: string;      // NFT Token ID
  tokenURI: string;     // IPFS URI
  owner: string;        // 所有者地址
  txId: string;         // 关联的交易 ID
}
```

## 🔧 后端配置

### 环境变量

```bash
# backend/.env
SERVICE_PRIVATE_KEY=你的服务提供商私钥
MONAD_RPC_URL=https://testnet-rpc.monad.xyz
CONTRACT_ADDRESS=0x386DcCcDd27870636848745394A139D44aF96403
PORT=3001
```

### 确认交易并铸造 NFT

```typescript
// backend/lib/listeners/transactionProcessor.ts
async function confirmTransaction(txId: string, ipfsHash: string) {
  const hashBytes = ethers.id(ipfsHash);
  const tokenURI = `ipfs://${ipfsHash}`;

  // 调用合约的 confirmTransaction 函数（带 tokenURI 参数）
  const tx = await contract.confirmTransaction(txId, hashBytes, tokenURI);
  await tx.wait();

  console.log('✅ 交易已确认');
  console.log('🎨 NFT 已铸造给用户');
}
```

## 📊 合约函数

### MonadFlowNFT 合约

#### mint（仅 Controller 可调用）
```solidity
function mint(
    address to,
    bytes32 txId,
    string memory tokenURI
) external onlyMonadFlow returns (uint256)
```
- 铸造 NFT 给指定地址
- 建立 txId 和 tokenId 的映射关系
- 触发 `NFTMinted` 事件

#### getTokenIdByTxId
```solidity
function getTokenIdByTxId(bytes32 txId) external view returns (uint256)
```
- 根据交易 ID 查询 Token ID
- 返回 0 表示该交易还未铸造 NFT

#### tokenURI
```solidity
function tokenURI(uint256 tokenId) external view returns (string)
```
- 获取 NFT 的元数据 URI

#### ownerOf
```solidity
function ownerOf(uint256 tokenId) external view returns (address)
```
- 获取 NFT 的所有者

### MonadFlowController 合约

#### confirmTransaction（铸造 NFT 版本）
```solidity
function confirmTransaction(
    bytes32 txId,
    bytes32 resultHash,
    string memory tokenURI
) external
```
- 确认交易并铸造 NFT
- 只能由服务提供商调用
- 自动结算资金并铸造 NFT

#### confirmTransaction（不铸造 NFT 版本）
```solidity
function confirmTransaction(
    bytes32 txId,
    bytes32 resultHash
) external
```
- 仅确认交易，不铸造 NFT
- 适用于不需要 NFT 的场景

## 🎯 演示流程

### 准备工作

1. ✅ 合约已部署到 Monad Testnet
2. ✅ 前端配置已更新（包含两个合约地址）
3. ✅ 后端服务提供商私钥已配置
4. ✅ MetaMask 连接到 Monad Testnet
5. ✅ 钱包有足够的测试 MON

### 演示步骤

1. **启动服务**
   ```bash
   # 终端 1: 启动后端
   cd backend && npm run dev
   
   # 终端 2: 启动前端
   cd frontend && npm run dev
   ```

2. **连接钱包**
   - 打开 http://localhost:3000
   - 点击"连接钱包"
   - 确保在 Monad Testnet 网络

3. **生成 AI 图片**
   - 进入"AI 图片生成演示"
   - 选择提示词
   - 点击"开始生成"
   - 等待交易确认

4. **查看 NFT**
   - 后端自动确认交易并铸造 NFT
   - 前端轮询检查 NFT 状态
   - 显示 NFT 铸造成功信息
   - 可点击链接在区块链浏览器中查看

## 🔍 调试技巧

### 查看后端日志

```bash
cd backend && npm run dev
```

关键日志：
- `🔔 收到 FundsLocked 事件` - 监听到用户锁定资金
- `📸 开始生成图片...` - 开始模拟 AI 生成
- `✅ 图片生成成功，确认交易...` - 准备确认交易
- `🎨 NFT 已自动铸造给用户` - NFT 铸造成功

### 查看前端控制台

关键日志：
- `🔍 检查 NFT (1/60)...` - 轮询检查 NFT
- `✅ 找到 NFT Token ID: 1` - 找到铸造的 NFT
- `✅ NFT 信息: {...}` - 获取到 NFT 详细信息

### 常见问题

#### NFT 一直显示"等待铸造"
- 检查后端是否正常运行
- 检查后端服务提供商地址是否有足够的 MON
- 查看后端日志是否有错误
- 确认合约地址配置正确

#### NFT 合约未部署提示
- 检查 `frontend/config/monad.ts` 中 `MonadFlowNFT` 地址是否为空
- 如果为空，需要重新部署合约：
  ```bash
  cd contracts
  npx hardhat run scripts/deploy.ts --network monadTestnet
  ```

## 🚀 下一步

- [ ] 集成真实的 AI 图片生成 API（替换 Mock 数据）
- [ ] 实现真实的 IPFS 存储（当前使用模拟 hash）
- [ ] 添加 NFT 画廊页面（展示用户拥有的所有 NFT）
- [ ] 实现 NFT 转移功能
- [ ] 添加 NFT 元数据生成（包含图片、属性等）

## 📚 参考资源

- [ERC-721 标准](https://eips.ethereum.org/EIPS/eip-721)
- [OpenZeppelin ERC721](https://docs.openzeppelin.com/contracts/5.x/erc721)
- [Monad 文档](https://docs.monad.xyz)
- [IPFS 文档](https://docs.ipfs.tech)
