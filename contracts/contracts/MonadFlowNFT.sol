// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title MonadFlowNFT
 * @notice AI 生成图片的 NFT 合约
 * @dev 基于 ERC721 标准，支持 URI 存储
 */
contract MonadFlowNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    
    /// @notice Token ID 计数器
    Counters.Counter private _tokenIds;
    
    /// @notice MonadFlowController 合约地址（只有这个合约可以铸造）
    address public monadFlowController;
    
    /// @notice Token ID 到交易 ID 的映射
    mapping(uint256 => bytes32) public tokenToTxId;
    
    /// @notice 交易 ID 到 Token ID 的映射
    mapping(bytes32 => uint256) public txIdToToken;
    
    /// @notice 事件: NFT 铸造
    event NFTMinted(
        uint256 indexed tokenId,
        bytes32 indexed txId,
        address indexed to,
        string tokenURI
    );
    
    modifier onlyMonadFlow() {
        require(msg.sender == monadFlowController, "Only MonadFlowController can mint");
        _;
    }
    
    constructor(address initialOwner) ERC721("MonadFlow AI Art", "MFAI") Ownable(initialOwner) {
        // 构造函数中设置 owner
    }
    
    /**
     * @notice 设置 MonadFlowController 地址
     * @param _controller MonadFlowController 合约地址
     */
    function setMonadFlowController(address _controller) external onlyOwner {
        require(_controller != address(0), "Invalid address");
        monadFlowController = _controller;
    }
    
    /**
     * @notice 铸造 NFT（仅 MonadFlowController 可调用）
     * @param to 接收者地址
     * @param txId 交易 ID
     * @param tokenURI NFT 元数据 URI（IPFS hash）
     * @return tokenId 铸造的 Token ID
     */
    function mint(
        address to,
        bytes32 txId,
        string memory tokenURI
    ) external onlyMonadFlow returns (uint256) {
        require(to != address(0), "Cannot mint to zero address");
        require(txIdToToken[txId] == 0, "NFT already minted for this transaction");
        
        _tokenIds.increment();
        uint256 tokenId = _tokenIds.current();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        
        tokenToTxId[tokenId] = txId;
        txIdToToken[txId] = tokenId;
        
        emit NFTMinted(tokenId, txId, to, tokenURI);
        
        return tokenId;
    }
    
    /**
     * @notice 获取总供应量
     * @return 总供应量
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds.current();
    }
    
    /**
     * @notice 根据交易 ID 获取 Token ID
     * @param txId 交易 ID
     * @return tokenId Token ID（如果不存在返回 0）
     */
    function getTokenIdByTxId(bytes32 txId) external view returns (uint256) {
        return txIdToToken[txId];
    }
}

