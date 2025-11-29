import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 开始部署 MonadFlowController...\n");

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

  // 部署合约
  console.log("📝 编译并部署合约...");
  const MonadFlowController = await ethers.getContractFactory("MonadFlowController");
  const contract = await MonadFlowController.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ MonadFlowController 部署成功!");
  console.log("📍 合约地址:", contractAddress);
  console.log("🔗 浏览器:", `https://testnet.monadexplorer.com/address/${contractAddress}\n`);

  // 保存部署信息
  const deploymentInfo = {
    contractAddress,
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
    `MonadFlowController: '${contractAddress}'`
  );

  fs.writeFileSync(configPath, configContent);
  console.log("✅ 前端配置已自动更新\n");

  // 验证合约功能
  console.log("🧪 验证合约基础功能...");
  const owner = await contract.owner();
  const feeRate = await contract.FEE_RATE();
  console.log("   Owner:", owner);
  console.log("   Fee Rate:", feeRate.toString(), "basis points (", Number(feeRate) / 100, "%)");

  console.log("\n✨ 部署完成！");
  console.log("\n📌 下一步:");
  console.log("1. 检查合约地址: https://explorer.testnet.monad.xyz/address/" + contractAddress);
  console.log("2. 启动前端: cd frontend && npm run dev");
  console.log("3. 开始测试演示");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
