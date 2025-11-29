// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IMonadFlow
 * @notice MonadFlow TCC 协议核心接口
 * @dev 定义 Try-Confirm-Cancel 流程的标准接口
 */
interface IMonadFlow {
    /// @notice 交易状态枚举
    enum TransactionState {
        NONE,       // 不存在
        TRYING,     // 尝试中
        LOCKED,     // 已锁定
        EXECUTING,  // 执行中
        CONFIRMED,  // 已确认
        CANCELLED,  // 已取消
        TIMEOUT     // 已超时
    }

    /// @notice 交易信息结构
    struct Transaction {
        address user;           // 用户地址
        address service;        // 服务提供商地址
        uint256 amount;         // 锁定金额
        TransactionState state; // 当前状态
        uint256 lockTime;       // 锁定时间
        uint256 timeout;        // 超时时间（秒）
        bytes32 resultHash;     // 结果哈希（IPFS/proof）
    }

    /// @notice 事件: 资金锁定
    event FundsLocked(
        bytes32 indexed txId,
        address indexed user,
        address indexed service,
        uint256 amount,
        uint256 timeout
    );

    /// @notice 事件: 交易确认
    event TransactionConfirmed(
        bytes32 indexed txId,
        bytes32 resultHash,
        uint256 timestamp
    );

    /// @notice 事件: 交易取消
    event TransactionCancelled(
        bytes32 indexed txId,
        string reason,
        uint256 timestamp
    );

    /// @notice 锁定资金 (Try)
    /// @param service 服务提供商地址
    /// @param timeout 超时时间（秒）
    /// @return txId 交易ID
    function lockFunds(address service, uint256 timeout) external payable returns (bytes32 txId);

    /// @notice 确认交易 (Confirm)
    /// @param txId 交易ID
    /// @param resultHash 结果哈希
    function confirmTransaction(bytes32 txId, bytes32 resultHash) external;

    /// @notice 取消交易 (Cancel)
    /// @param txId 交易ID
    /// @param reason 取消原因
    function cancelTransaction(bytes32 txId, string calldata reason) external;

    /// @notice 获取交易信息
    /// @param txId 交易ID
    /// @return transaction 交易信息
    function getTransaction(bytes32 txId) external view returns (Transaction memory transaction);

    /// @notice 检查是否超时
    /// @param txId 交易ID
    /// @return isTimeout 是否超时
    function isTransactionTimeout(bytes32 txId) external view returns (bool isTimeout);
}
