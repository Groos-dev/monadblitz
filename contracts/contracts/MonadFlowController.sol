// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IMonadFlow.sol";
import "./MonadFlowNFT.sol";

/**
 * @title MonadFlowController
 * @notice MonadFlow TCC 协议主合约
 * @dev 实现 Try-Confirm-Cancel 原子化交易流程
 *
 * 核心流程:
 * 1. Try: 用户调用 lockFunds 锁定资金
 * 2. Execute: 链下服务监听事件并执行
 * 3. Confirm: 服务完成后调用 confirmTransaction 结算并铸造 NFT
 * 4. Cancel: 失败或超时时调用 cancelTransaction 退款
 */
contract MonadFlowController is IMonadFlow {
    /// @notice 所有交易记录
    mapping(bytes32 => Transaction) public transactions;

    /// @notice 服务提供商余额
    mapping(address => uint256) public serviceBalances;

    /// @notice 平台手续费率 (basis points, 100 = 1%)
    uint256 public constant FEE_RATE = 100; // 1%

    /// @notice 平台手续费累计
    uint256 public platformFees;

    /// @notice 合约拥有者
    address public owner;

    /// @notice NFT 合约地址
    MonadFlowNFT public nftContract;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyUser(bytes32 txId) {
        require(transactions[txId].user == msg.sender, "Not transaction user");
        _;
    }

    modifier onlyService(bytes32 txId) {
        require(transactions[txId].service == msg.sender, "Not service provider");
        _;
    }

    modifier inState(bytes32 txId, TransactionState expectedState) {
        require(transactions[txId].state == expectedState, "Invalid state");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice 锁定资金 (TCC Try 阶段)
     * @param service 服务提供商地址
     * @param timeout 超时时间（秒）
     * @return txId 交易ID
     */
    function lockFunds(
        address service,
        uint256 timeout
    ) external payable returns (bytes32 txId) {
        require(msg.value > 0, "Amount must be greater than 0");
        require(service != address(0), "Invalid service address");
        require(timeout > 0 && timeout <= 86400, "Timeout must be 1-86400 seconds");

        // 生成交易ID
        txId = keccak256(abi.encodePacked(
            msg.sender,
            service,
            msg.value,
            block.timestamp,
            block.number
        ));

        require(transactions[txId].state == TransactionState.NONE, "Transaction already exists");

        // 创建交易记录
        transactions[txId] = Transaction({
            user: msg.sender,
            service: service,
            amount: msg.value,
            state: TransactionState.LOCKED,
            lockTime: block.timestamp,
            timeout: timeout,
            resultHash: bytes32(0)
        });

        emit FundsLocked(txId, msg.sender, service, msg.value, timeout);

        return txId;
    }

    /**
     * @notice 确认交易 (TCC Confirm 阶段)
     * @param txId 交易ID
     * @param resultHash 结果哈希 (IPFS/proof)
     * @param tokenURI NFT 元数据 URI（空字符串则不铸造 NFT）
     */
    function confirmTransaction(
        bytes32 txId,
        bytes32 resultHash,
        string memory tokenURI
    ) external onlyService(txId) inState(txId, TransactionState.LOCKED) {
        Transaction storage txn = transactions[txId];

        // 检查是否超时
        require(block.timestamp <= txn.lockTime + txn.timeout, "Transaction timeout");

        // 更新状态
        txn.state = TransactionState.CONFIRMED;
        txn.resultHash = resultHash;

        // 计算手续费
        uint256 fee = (txn.amount * FEE_RATE) / 10000;
        uint256 serviceAmount = txn.amount - fee;

        // 累计手续费
        platformFees += fee;

        // 转账给服务提供商
        serviceBalances[txn.service] += serviceAmount;

        // 如果提供了 tokenURI 且 NFT 合约已设置，则铸造 NFT
        if (bytes(tokenURI).length > 0 && address(nftContract) != address(0)) {
            try nftContract.mint(txn.user, txId, tokenURI) returns (uint256 tokenId) {
                // NFT 铸造成功
            } catch {
                // NFT 铸造失败不影响交易确认
            }
        }

        emit TransactionConfirmed(txId, resultHash, block.timestamp);
    }

    /**
     * @notice 取消交易 (TCC Cancel 阶段)
     * @param txId 交易ID
     * @param reason 取消原因
     */
    function cancelTransaction(
        bytes32 txId,
        string calldata reason
    ) external {
        Transaction storage txn = transactions[txId];

        require(
            txn.state == TransactionState.LOCKED,
            "Can only cancel locked transactions"
        );

        // 只有用户或服务商可以取消
        require(
            msg.sender == txn.user || msg.sender == txn.service,
            "Not authorized"
        );

        // 如果是服务商取消，检查是否超时
        if (msg.sender == txn.service) {
            require(block.timestamp > txn.lockTime + txn.timeout, "Not timeout yet");
        }

        // 更新状态
        txn.state = TransactionState.CANCELLED;

        // 退款给用户
        (bool success, ) = txn.user.call{value: txn.amount}("");
        require(success, "Refund failed");

        emit TransactionCancelled(txId, reason, block.timestamp);
    }

    /**
     * @notice 服务商提现
     */
    function withdrawServiceBalance() external {
        uint256 balance = serviceBalances[msg.sender];
        require(balance > 0, "No balance");

        serviceBalances[msg.sender] = 0;

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "Withdraw failed");
    }

    /**
     * @notice 提取平台手续费（仅owner）
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 fees = platformFees;
        require(fees > 0, "No fees");

        platformFees = 0;

        (bool success, ) = owner.call{value: fees}("");
        require(success, "Withdraw failed");
    }

    /**
     * @notice 获取交易信息
     */
    function getTransaction(bytes32 txId) external view returns (Transaction memory) {
        return transactions[txId];
    }

    /**
     * @notice 检查交易是否超时
     */
    function isTransactionTimeout(bytes32 txId) external view returns (bool) {
        Transaction memory txn = transactions[txId];
        if (txn.state != TransactionState.LOCKED) {
            return false;
        }
        return block.timestamp > txn.lockTime + txn.timeout;
    }

    /**
     * @notice 批量查询交易状态
     * @param txIds 交易ID数组
     * @return states 状态数组
     */
    function batchGetStates(bytes32[] calldata txIds) external view returns (TransactionState[] memory states) {
        states = new TransactionState[](txIds.length);
        for (uint256 i = 0; i < txIds.length; i++) {
            states[i] = transactions[txIds[i]].state;
        }
        return states;
    }

    /**
     * @notice 设置 NFT 合约地址（仅 owner）
     * @param _nftContract NFT 合约地址
     */
    function setNFTContract(address _nftContract) external onlyOwner {
        require(_nftContract != address(0), "Invalid address");
        nftContract = MonadFlowNFT(_nftContract);
    }
}
