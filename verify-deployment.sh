#!/bin/bash

echo "🔍 验证 MonadFlow 部署状态..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查前端配置
echo "📝 检查前端配置..."
CONTROLLER=$(grep "MonadFlowController:" frontend/config/monad.ts | grep -o "0x[a-fA-F0-9]\{40\}")
NFT=$(grep "MonadFlowNFT:" frontend/config/monad.ts | grep -o "0x[a-fA-F0-9]\{40\}")

if [ -n "$CONTROLLER" ]; then
    echo -e "${GREEN}✅ MonadFlowController: $CONTROLLER${NC}"
else
    echo -e "${RED}❌ MonadFlowController 地址未配置${NC}"
fi

if [ -n "$NFT" ]; then
    echo -e "${GREEN}✅ MonadFlowNFT: $NFT${NC}"
else
    echo -e "${RED}❌ MonadFlowNFT 地址未配置${NC}"
fi

echo ""

# 检查后端配置
echo "📝 检查后端配置..."
if [ -f backend/.env ]; then
    BACKEND_CONTRACT=$(grep "CONTRACT_ADDRESS=" backend/.env | cut -d'=' -f2)
    if [ "$BACKEND_CONTRACT" = "$CONTROLLER" ]; then
        echo -e "${GREEN}✅ 后端合约地址配置正确: $BACKEND_CONTRACT${NC}"
    else
        echo -e "${YELLOW}⚠️  后端合约地址需要更新${NC}"
        echo "   当前: $BACKEND_CONTRACT"
        echo "   应为: $CONTROLLER"
    fi
else
    echo -e "${RED}❌ 后端 .env 文件不存在${NC}"
fi

echo ""

# 检查部署信息
echo "📝 检查部署信息..."
if [ -f frontend/config/deployment.json ]; then
    DEPLOY_CONTROLLER=$(grep "controllerAddress" frontend/config/deployment.json | grep -o "0x[a-fA-F0-9]\{40\}")
    DEPLOY_NFT=$(grep "nftAddress" frontend/config/deployment.json | grep -o "0x[a-fA-F0-9]\{40\}")
    
    echo -e "${GREEN}✅ deployment.json 存在${NC}"
    echo "   Controller: $DEPLOY_CONTROLLER"
    echo "   NFT: $DEPLOY_NFT"
else
    echo -e "${RED}❌ deployment.json 不存在${NC}"
fi

echo ""

# 检查合约文件
echo "📝 检查合约文件..."
if [ -f contracts/contracts/MonadFlowController.sol ]; then
    echo -e "${GREEN}✅ MonadFlowController.sol 存在${NC}"
fi

if [ -f contracts/contracts/MonadFlowNFT.sol ]; then
    echo -e "${GREEN}✅ MonadFlowNFT.sol 存在${NC}"
    
    # 检查是否使用了 Counters（已废弃）
    if grep -q "Counters" contracts/contracts/MonadFlowNFT.sol; then
        echo -e "${RED}❌ NFT 合约仍在使用 Counters（已在 OZ v5 中废弃）${NC}"
    else
        echo -e "${GREEN}✅ NFT 合约已兼容 OpenZeppelin v5${NC}"
    fi
fi

echo ""

# 总结
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 部署摘要"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "区块链浏览器链接："
if [ -n "$CONTROLLER" ]; then
    echo "Controller: https://testnet.monadexplorer.com/address/$CONTROLLER"
fi
if [ -n "$NFT" ]; then
    echo "NFT: https://testnet.monadexplorer.com/address/$NFT"
fi
echo ""
echo "下一步："
echo "1. 启动后端: cd backend && npm run dev"
echo "2. 启动前端: cd frontend && npm run dev"
echo "3. 访问: http://localhost:3000"
echo "4. 测试 AI 生成并查看 NFT 铸造"
echo ""
