// MonadFlowController ABI (从合约编译后提取)
export const MONAD_FLOW_ABI = [
  // Events
  "event FundsLocked(bytes32 indexed txId, address indexed user, address indexed service, uint256 amount, uint256 timeout)",
  "event TransactionConfirmed(bytes32 indexed txId, bytes32 resultHash, uint256 timestamp)",
  "event TransactionCancelled(bytes32 indexed txId, string reason, uint256 timestamp)",

  // Functions
  "function lockFunds(address service, uint256 timeout) external payable returns (bytes32 txId)",
  "function confirmTransaction(bytes32 txId, bytes32 resultHash, string memory tokenURI) external",
  "function cancelTransaction(bytes32 txId, string calldata reason) external",
  "function getTransaction(bytes32 txId) external view returns (tuple(address user, address service, uint256 amount, uint8 state, uint256 lockTime, uint256 timeout, bytes32 resultHash))",
  "function isTransactionTimeout(bytes32 txId) external view returns (bool)",
  "function batchGetStates(bytes32[] calldata txIds) external view returns (uint8[] memory)",
  "function withdrawServiceBalance() external",
  "function serviceBalances(address) external view returns (uint256)",
  "function platformFees() external view returns (uint256)",
  "function setNFTContract(address _nftContract) external",
  "function nftContract() external view returns (address)",
] as const;

// MonadFlowNFT ABI
export const MONAD_FLOW_NFT_ABI = [
  // Events
  "event NFTMinted(uint256 indexed tokenId, bytes32 indexed txId, address indexed to, string tokenURI)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",

  // Functions
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
  "function totalSupply() external view returns (uint256)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function balanceOf(address owner) external view returns (uint256)",
  "function getTokenIdByTxId(bytes32 txId) external view returns (uint256)",
  "function tokenToTxId(uint256 tokenId) external view returns (bytes32)",
  "function txIdToToken(bytes32 txId) external view returns (uint256)",
] as const;
