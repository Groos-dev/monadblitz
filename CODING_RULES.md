# TypeScript 编码规范 - MVP 项目

> 本规范面向快速交付的 MVP 项目，追求简洁、直接、易懂，去除 AI 生成代码的典型冗余。合理使用 TypeScript 类型系统提升代码质量，但避免过度类型体操。

## 核心原则

### 1. 简洁至上
- **一切以简洁为先**，可以适度牺牲健壮性
- 代码应直接表达意图，不做过度防御
- 减少不必要的抽象和封装
- 功能优先，优化可以等到真正需要时

### 2. 去 AI 味
避免 AI 生成代码的典型特征：
- ❌ 过度的注释："这个函数用于..."
- ❌ 冗余的变量名：`userDataFromDatabase`（直接用 `user`）
- ❌ 不必要的中间变量
- ❌ 过度的错误处理和边界检查
- ❌ 套路式的代码结构
- ❌ 过于通用的抽象
- ❌ 过度复杂的类型定义（类型体操）
- ❌ 为每个简单对象都定义 interface

### 3. 可读性 > 健壮性
- 逻辑清晰比万无一失更重要
- 代码应该像讲故事一样自然流畅
- 变量名要直观，但不要冗长

---

## 具体规范

### 类型定义原则

**简洁的类型定义：**
```typescript
// ✅ 直接内联简单类型
function getUser(id: string): { twitterId: string; address: string; balance: string } | null {
  return db.prepare('SELECT * FROM users WHERE twitter_id = ?').get(id);
}

// ✅ 复用的类型才定义 interface/type
interface User {
  twitterId: string;
  address: string | null;
  balance: string;
  createdAt: Date;
}

// ✅ 使用类型推导
const tx = await contract.transfer(to, amount); // 让 TS 自动推导类型

// ❌ 过度的类型体操
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};
type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};
```

**类型定义时机：**
- 公共 API 接口、函数参数和返回值 → 需要定义
- 数据库模型、外部 API 响应 → 需要定义
- 一次性使用的简单对象 → 不需要，直接内联
- 能自动推导的 → 不需要显式声明

### 变量命名

**推荐：**
```typescript
// ✅ 简洁直接，利用类型推导
const user = getUser(id);
const tx = await contract.transfer(to, amount);
const balance = await getBalance(address);

// ✅ 有意义但不冗长
const dbPath = join(__dirname, '../data/tipbot.db');

// ✅ 需要时才标注类型
const amount: bigint = ethers.parseEther('1.0');
```

**避免：**
```typescript
// ❌ AI 味过重
const retrievedUserDataFromDatabase: UserDataObjectFromDatabase = getUserFromDatabaseById(userId);
const blockchainTransactionObject: BlockchainTransaction = await smartContract.transferTokens(recipientAddress, transferAmount);

// ❌ 过于简化失去意义
const d = getData();
const r = await f(x);

// ❌ 重复标注能推导出的类型
const user: User = getUser(id); // getUser 返回值已是 User，不需要重复
```

### 判空处理

**只在真正可能为空时判空，用类型系统标记可空性：**
```typescript
// ✅ 必须判空（用户可能不存在），返回类型明确标记 null
export function getUser(twitterId: string): User | null {
  return db.prepare('SELECT * FROM users WHERE twitter_id = ?').get(twitterId);
}

// ✅ 需要用户必须存在时，抛出错误
export function getUserOrThrow(twitterId: string): User {
  const user = getUser(twitterId);
  if (!user) {
    throw new Error(`用户不存在: ${twitterId}`);
  }
  return user;
}

// ✅ 数据库初始化检查（运行时必需）
let db: Database | null = null;

export function getDatabase(): Database {
  if (!db) {
    throw new Error('数据库未初始化');
  }
  return db;
}

// ❌ 不需要判空（provider 初始化时已确保，类型不标记为 null）
let provider: ethers.Provider; // 不是 Provider | null

export async function getBalance(address: string): Promise<string> {
  // 不需要 if (!provider) 因为类型保证了非空
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
```

**使用可选链和空值合并：**
```typescript
// ✅ 简洁的可选处理
const username = user?.twitterUsername ?? 'Unknown';
const balance = user?.balance ?? '0';

// ❌ 冗长的判空
let username: string;
if (user && user.twitterUsername) {
  username = user.twitterUsername;
} else {
  username = 'Unknown';
}
```

### 错误处理

**原则：让错误自然向上抛出，只在必要时捕获。类型系统已经做了参数检查。**

```typescript
interface TransactionResult {
  txHash: string;
  blockNumber: number;
}

// ✅ 简洁的错误处理，类型确保参数正确
export async function sendToken(
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<TransactionResult> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
  const decimals = await contract.decimals();
  const amountInWei = ethers.parseUnits(amount, decimals);

  const tx = await contract.transfer(toAddress, amountInWei);
  console.info(`交易已发送: ${tx.hash}`);

  const receipt = await tx.wait();
  return { txHash: receipt.hash, blockNumber: receipt.blockNumber };
}

// ❌ 过度的错误处理（类型已经做了这些检查）
export async function sendToken(
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<TransactionResult> {
  try {
    // ❌ TypeScript 已经确保这些参数是 string 类型
    if (!tokenAddress) throw new Error('tokenAddress is required');
    if (!toAddress) throw new Error('toAddress is required');
    if (!amount) throw new Error('amount is required');
    if (typeof amount !== 'string') throw new Error('amount must be a string');

    let contract: ethers.Contract;
    try {
      contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      throw new Error('Contract initialization failed');
    }

    // ... 更多冗余检查
  } catch (error) {
    console.error('Error in sendToken:', error);
    throw error; // 重复抛出没有意义
  }
}
```

### 日志规范

**只记录有价值的信息：**

```typescript
// ✅ 关键操作和潜在问题点
console.info(`区块链已连接 - 机器人地址: ${wallet.address}`);
console.info(`交易已发送: ${tx.hash}`);
console.error(`发送代币失败:`, error);

// ❌ 过度日志
console.log('Entering function sendToken');
console.log('Validating parameters...');
console.log('Parameters validated successfully');
console.debug('Creating contract instance...');
console.log('Contract instance created');
// ...
```

**日志级别：**
- `console.info()`: 关键操作、状态变化、重要信息
- `console.error()`: 错误和异常（直接传 error 对象，不要只传 message）
- ❌ 不使用 `console.log()` 和 `console.debug()`

### 函数设计

**直接、简洁、单一职责，类型清晰：**

```typescript
// ✅ 简洁的函数，参数类型清晰
export function createUser(
  twitterId: string,
  username: string,
  address: string | null = null
) {
  return db.prepare(`
    INSERT INTO users (twitter_id, twitter_username, monad_address)
    VALUES (?, ?, ?)
    ON CONFLICT(twitter_id) DO UPDATE SET
      twitter_username = excluded.twitter_username,
      updated_at = CURRENT_TIMESTAMP
  `).run(twitterId, username, address);
}

// ✅ 返回值类型明确
export async function getTokenBalance(
  tokenAddress: string,
  userAddress: string
): Promise<string> {
  const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  const decimals = await contract.decimals();
  return ethers.formatUnits(balance, decimals);
}

// ❌ 过度抽象
interface UserCreationParams {
  twitterId: string;
  username: string;
  address?: string | null;
}

interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
}

export async function performUserCreationOperation(
  userCreationParams: UserCreationParams
): Promise<void> {
  const validationResult: ValidationResult = validateUserCreationParams(userCreationParams);
  if (!validationResult.isValid) {
    throw new Error(validationResult.errorMessage);
  }

  const preparedData = prepareUserDataForInsertion(userCreationParams);
  const dbOperation = createDatabaseInsertOperation('users', preparedData);
  return await executeDatabaseOperation(dbOperation);
}
```

### 注释规范

**只在必要时注释，类型已经是最好的文档：**

```typescript
// ✅ TypeScript 类型即文档，不需要额外注释
export async function sendToken(
  tokenAddress: string,
  toAddress: string,
  amount: string
): Promise<TransactionResult> {
  // 实现...
}

// ✅ 解释业务逻辑或特殊要求
// Monad 测试网要求最低 50 gwei
const gasPrice = ethers.parseUnits("50", "gwei");

// ✅ 复杂类型可以加简短说明
interface User {
  twitterId: string;
  address: string | null; // 用户可能未绑定地址
  balance: string; // 以 wei 为单位的字符串
}

// ❌ 冗余注释（类型已经说明了一切）
// 创建一个新的 ethers Contract 实例用于与 ERC20 代币合约交互
const contract: ethers.Contract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);

// 调用合约的 decimals 函数获取代币的小数位数
const decimals: number = await contract.decimals();
```

### 异步处理

**使用 async/await，类型自动推导 Promise：**

```typescript
// ✅ 直接使用 async/await，返回类型自动推导为 Promise<string>
export async function getBalance(address: string) {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// ✅ 也可以显式标注（但通常不需要）
export async function getBalance(address: string): Promise<string> {
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}

// ❌ 不必要的 Promise 包装
export function getBalance(address: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const balance = await provider.getBalance(address);
      resolve(ethers.formatEther(balance));
    } catch (error) {
      reject(error);
    }
  });
}
```

### 代码结构

**扁平化优于嵌套，类型保证数据正确性：**

```typescript
// ✅ 扁平的逻辑
export async function processTransfer(
  from: string,
  to: string,
  amount: number
): Promise<TransactionResult> {
  const sender = getUserOrThrow(from); // 不存在会抛错

  if (parseFloat(sender.balance) < amount) {
    throw new Error('余额不足');
  }

  const tx = await sendToken(TOKEN_ADDRESS, to, amount.toString());
  updateUserBalance(from, (parseFloat(sender.balance) - amount).toString());

  return tx;
}

// ❌ 过度嵌套
export async function processTransfer(
  from: string,
  to: string,
  amount: number
): Promise<TransactionResult | null> {
  const sender = getUser(from);
  if (sender) {
    const balance = parseFloat(sender.balance);
    if (balance >= amount) {
      try {
        const tx = await sendToken(TOKEN_ADDRESS, to, amount.toString());
        if (tx) {
          const newBalance = balance - amount;
          updateUserBalance(from, newBalance.toString());
          return tx;
        } else {
          throw new Error('Transfer failed');
        }
      } catch (error) {
        throw error;
      }
    } else {
      throw new Error('Insufficient balance');
    }
  } else {
    throw new Error('User not found');
  }
  return null;
}
```

### 模块导入

**清晰的导入顺序，使用类型导入：**

```typescript
// 1. 类型导入（使用 type 关键字）
import type { Request, Response } from 'express';
import type { Database } from 'better-sqlite3';
import type { ethers } from 'ethers';

// 2. Node 内置模块
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// 3. 第三方库
import express from 'express';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

// 4. 项目内部模块（类型）
import type { User, Transaction } from './types';

// 5. 项目内部模块（值）
import { initDatabase } from './database';
import { startBot } from './bot';
```

**类型导入原则：**
```typescript
// ✅ 只用于类型时使用 type import
import type { User } from './types';

// ✅ 既有类型又有值时，分开导入
import { getUser } from './database';
import type { User } from './types';

// ❌ 不需要的时候不要用 type import（混淆）
import type { ethers } from 'ethers'; // ethers 是值，不是纯类型
```

---

## 实战示例对比

### 示例 1: 区块链初始化

**✅ 推荐风格：**
```typescript
let provider: ethers.JsonRpcProvider;
let wallet: ethers.Wallet | null = null;

export function initBlockchain() {
  const rpcUrl = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
  provider = new ethers.JsonRpcProvider(rpcUrl);

  if (process.env.BOT_PRIVATE_KEY) {
    wallet = new ethers.Wallet(process.env.BOT_PRIVATE_KEY, provider);
    console.info(`区块链已连接 - ${wallet.address}`);
  }

  return { provider, wallet };
}
```

**❌ AI 味过重：**
```typescript
interface BlockchainInitializationResult {
  provider: ethers.JsonRpcProvider;
  wallet: ethers.Wallet | null;
}

/**
 * 初始化区块链连接
 * @description 此函数用于初始化与 Monad 区块链的连接，并创建机器人钱包实例
 * @returns {BlockchainInitializationResult} 返回包含 provider 和 wallet 的对象
 * @throws {Error} 如果初始化失败则抛出错误
 */
export async function initializeBlockchainConnection(): Promise<BlockchainInitializationResult> {
  try {
    console.log('Starting blockchain initialization process...');

    // 从环境变量获取 RPC URL，如果未设置则使用默认值
    const rpcUrlFromEnvironment: string | undefined = process.env.MONAD_RPC_URL;
    const defaultRpcUrl: string = 'https://testnet-rpc.monad.xyz';
    const finalRpcUrl: string = rpcUrlFromEnvironment || defaultRpcUrl;

    console.log(`Connecting to RPC URL: ${finalRpcUrl}`);

    // 创建 provider 实例
    let blockchainProvider: ethers.JsonRpcProvider;
    try {
      blockchainProvider = new ethers.JsonRpcProvider(finalRpcUrl);
      console.log('Provider instance created successfully');
    } catch (providerError: any) {
      console.error('Failed to create provider:', providerError);
      throw new Error('Provider initialization failed');
    }

    // 检查是否配置了私钥
    const privateKeyFromEnvironment: string | undefined = process.env.BOT_PRIVATE_KEY;
    if (privateKeyFromEnvironment && privateKeyFromEnvironment.length > 0) {
      try {
        // 创建钱包实例
        const walletInstance: ethers.Wallet = new ethers.Wallet(
          privateKeyFromEnvironment,
          blockchainProvider
        );
        console.log('Wallet instance created successfully');
        console.log('Wallet address:', walletInstance.address);

        return {
          provider: blockchainProvider,
          wallet: walletInstance
        };
      } catch (walletError: any) {
        console.error('Failed to create wallet:', walletError);
        throw new Error('Wallet initialization failed');
      }
    } else {
      console.warn('Private key not configured in environment variables');
      return {
        provider: blockchainProvider,
        wallet: null
      };
    }
  } catch (error: unknown) {
    console.error('Blockchain initialization error:', error);
    throw error;
  }
}
```

### 示例 2: 数据库查询

**✅ 推荐风格：**
```typescript
interface User {
  id: number;
  twitterId: string;
  twitterUsername: string;
  monadAddress: string | null;
  balance: string;
  createdAt: Date;
}

interface Transaction {
  id: number;
  fromTwitterId: string;
  toTwitterId: string;
  amount: string;
  token: string;
  status: string;
  createdAt: Date;
}

export function getUser(twitterId: string): User | null {
  return db.prepare('SELECT * FROM users WHERE twitter_id = ?').get(twitterId) as User | null;
}

export function getTransactions(twitterId: string, limit = 50): Transaction[] {
  return db.prepare(`
    SELECT * FROM transactions
    WHERE from_twitter_id = ? OR to_twitter_id = ?
    ORDER BY created_at DESC
    LIMIT ?
  `).all(twitterId, twitterId, limit) as Transaction[];
}
```

**❌ AI 味过重：**
```typescript
interface User {
  id: number;
  twitterId: string;
  twitterUsername: string;
  monadAddress: string | null;
  balance: string;
  createdAt: Date;
}

interface DatabaseQueryError extends Error {
  code?: string;
  errno?: number;
}

/**
 * 从数据库中检索用户信息
 * @param {string} twitterId - 用户的 Twitter ID
 * @returns {User|null} 用户对象，如果未找到则返回 null
 * @throws {Error} 如果数据库查询失败
 */
export function getUserByTwitterId(twitterId: string): User | null {
  // 验证参数
  if (!twitterId) {
    throw new Error('Twitter ID is required');
  }

  if (typeof twitterId !== 'string') {
    throw new Error('Twitter ID must be a string');
  }

  try {
    const preparedStatement: Statement = db.prepare('SELECT * FROM users WHERE twitter_id = ?');
    const userDataFromDatabase: unknown = preparedStatement.get(twitterId);

    if (userDataFromDatabase) {
      console.log(`User found in database: ${twitterId}`);
      return userDataFromDatabase as User;
    } else {
      console.log(`User not found in database: ${twitterId}`);
      return null;
    }
  } catch (databaseError: unknown) {
    const error = databaseError as DatabaseQueryError;
    console.error('Database query error:', error);
    throw new Error('Failed to retrieve user from database');
  }
}
```

---

## TypeScript 配置建议

推荐的 `tsconfig.json` 配置（MVP 项目）：

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022"],

    // 类型检查
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,

    // 输出
    "outDir": "./dist",
    "rootDir": "./src",
    "sourceMap": true,

    // 互操作性
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,

    // 跳过库检查加快编译
    "skipLibCheck": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**关键配置说明：**
- `strict: true` - 启用严格模式，但不会过度繁琐
- `noUncheckedIndexedAccess: true` - 数组/对象访问更安全
- `skipLibCheck: true` - 加快编译速度

---

## TypeScript 特定建议

### any vs unknown
```typescript
// ✅ 使用 unknown 而不是 any
function handleError(error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}

// ❌ 避免使用 any
function handleError(error: any) {
  console.error(error.message); // 没有类型检查
}
```

### 类型断言
```typescript
// ✅ 确定类型时使用 as
const user = getUser(id) as User;

// ✅ 数据库查询结果
const users = db.prepare('SELECT * FROM users').all() as User[];

// ❌ 过度使用类型断言
const data = response as any as User; // 双重断言是代码异味
```

### 联合类型 vs 可选属性
```typescript
// ✅ 值真的可能为 null/undefined 时使用联合类型
function getUser(id: string): User | null { }

// ✅ 对象属性可能不存在时使用可选
interface User {
  id: string;
  email?: string; // 邮箱可能未设置
}

// ❌ 不要过度使用可选
interface User {
  id?: string; // id 应该必需
  name?: string;
  email?: string;
}
```

### 泛型使用
```typescript
// ✅ 实用的泛型
async function fetchData<T>(url: string): Promise<T> {
  const res = await fetch(url);
  return res.json();
}

const user = await fetchData<User>('/api/user/123');

// ❌ 过度使用泛型
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
// 除非真的需要，否则这是过度设计
```

---

## 检查清单

在提交代码前自查：

- [ ] 变量名简洁且有意义（不冗长不过简）
- [ ] 类型定义清晰，公共 API 有明确类型
- [ ] 只在真正必要时判空，类型系统已标记可空性
- [ ] 没有过度的 try-catch 包装
- [ ] 日志只包含 info 和 error 级别
- [ ] 没有冗余的注释（类型即文档）
- [ ] 函数职责单一且直接
- [ ] 代码扁平化，避免深层嵌套
- [ ] 没有不必要的中间变量
- [ ] 错误处理简洁有效
- [ ] 没有过度的类型体操
- [ ] 避免使用 any，用 unknown 替代
- [ ] 代码读起来自然流畅

---

## 给 AI 的提示词模板

当使用 AI 辅助编码时，可以使用以下提示：

```
你是一个有 20 年经验的资深 TypeScript 开发者。我需要你帮我写简洁、直接的代码，遵循以下原则：

1. 使用 TypeScript，但避免过度的类型体操
2. 代码要简洁易懂，这是 MVP 项目，可以适度牺牲健壮性
3. 去除 AI 生成代码的典型特征：
   - 不要过度注释（类型即文档）
   - 不要冗长的变量名
   - 不要为每个简单对象都定义 interface
   - 不要过度的错误处理（TypeScript 类型已经做了参数检查）
   - 不要不必要的抽象
4. 类型使用原则：
   - 公共 API、函数参数和返回值需要明确类型
   - 能自动推导的不要显式标注
   - 避免使用 any，用 unknown 替代
   - 只在真正可能为 null 时使用联合类型
5. 只在上下文中真正可能为空时才判空，用类型系统标记可空性
6. 日志只使用 console.info 和 console.error，且只记录关键信息
7. 代码要像人写的一样自然，不要有套路感
8. 使用 async/await，保持代码扁平化
9. 变量名要直观但不冗长（例如用 tx 而不是 blockchainTransactionObject）

请直接给出代码，不要解释每一步在做什么。
```

---

**记住：简洁、直接、易懂。代码应该像讲故事，而不是写说明书。**
