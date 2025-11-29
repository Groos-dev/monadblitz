import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 开始部署 MonadFlow 合约...\n");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("📍 部署账户:", deployer.address);

  // 获取账户余额
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", ethers.formatEther(balance), "MON\n");

  if (balance === 0n) {
    console.error("❌ 账户余额不足，请先获取测试代币");
    console.log("💡 访问: https://faucet.monad.xyz");
    process.exit(1);
  }

  // 1. 部署 MonadFlowController
  console.log("📝 部署 MonadFlowController...");
  const MonadFlowController = await ethers.getContractFactory("MonadFlowController");
  const controller = await MonadFlowController.deploy();
  await controller.waitForDeployment();
  const controllerAddress = await controller.getAddress();
  console.log("✅ MonadFlowController 部署成功!");
  console.log("📍 合约地址:", controllerAddress);
  console.log("🔗 浏览器:", `https://testnet.monadexplorer.com/address/${controllerAddress}\n`);

  // 2. 部署 MonadFlowNFT
  console.log("📝 部署 MonadFlowNFT...");
  const MonadFlowNFT = await ethers.getContractFactory("MonadFlowNFT");
  const nft = await MonadFlowNFT.deploy(deployer.address);
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ MonadFlowNFT 部署成功!");
  console.log("📍 合约地址:", nftAddress);
  console.log("🔗 浏览器:", `https://testnet.monadexplorer.com/address/${nftAddress}\n`);

  // 3. 配置 NFT 合约到 Controller
  console.log("🔗 配置 NFT 合约到 Controller...");
  const setNFTTx = await nft.setMonadFlowController(controllerAddress);
  await setNFTTx.wait();
  console.log("✅ NFT 合约已授权 Controller\n");

  // 4. 配置 Controller 的 NFT 合约地址
  console.log("🔗 配置 Controller 的 NFT 合约地址...");
  const setControllerTx = await controller.setNFTContract(nftAddress);
  await setControllerTx.wait();
  console.log("✅ Controller 已配置 NFT 合约\n");

  // 保存部署信息
  const deploymentInfo = {
    controllerAddress,
    nftAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    network: "monadTestnet",
    chainId: 10143,
    blockNumber: await ethers.provider.getBlockNumber(),
  };

  const deploymentPath = path.join(__dirname, "../../frontend/config/deployment.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 部署信息已保存到:", deploymentPath);

  // 更新前端配置文件
  const configPath = path.join(__dirname, "../../frontend/config/monad.ts");
  let configContent = fs.readFileSync(configPath, "utf-8");

  // 替换合约地址
  configContent = configContent.replace(
    /MonadFlowController: ['"]0x[0-9a-fA-F]{40}['"]/,
    `MonadFlowController: '${controllerAddress}'`
  );

  // 添加 NFT 合约地址（如果不存在）
  if (!configContent.includes('MonadFlowNFT')) {
    configContent = configContent.replace(
      /export const CONTRACTS = \{([^}]+)\};/,
      `export const CONTRACTS = {$1  MonadFlowNFT: '${nftAddress}',\n};`
    );
  } else {
    configContent = configContent.replace(
      /MonadFlowNFT: ['"]0x[0-9a-fA-F]{40}['"]/,
      `MonadFlowNFT: '${nftAddress}'`
    );
  }

  fs.writeFileSync(configPath, configContent);
  console.log("✅ 前端配置已自动更新\n");

  // 验证合约功能
  console.log("🧪 验证合约基础功能...");
  const owner = await controller.owner();
  const feeRate = await controller.FEE_RATE();
  const nftName = await nft.name();
  const nftSymbol = await nft.symbol();
  console.log("   Controller Owner:", owner);
  console.log("   Fee Rate:", feeRate.toString(), "basis points (", Number(feeRate) / 100, "%)");
  console.log("   NFT Name:", nftName);
  console.log("   NFT Symbol:", nftSymbol);

  console.log("\n✨ 部署完成！");
  console.log("\n📌 下一步:");
  console.log("1. 检查 Controller: https://testnet.monadexplorer.com/address/" + controllerAddress);
  console.log("2. 检查 NFT: https://testnet.monadexplorer.com/address/" + nftAddress);
  console.log("3. 启动前端: cd frontend && npm run dev");
  console.log("4. 启动后端: cd backend && npm run dev");
  console.log("5. 开始测试演示");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
