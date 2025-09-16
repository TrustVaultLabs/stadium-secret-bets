// Contract ABI for StadiumSecretBets
export const STADIUM_SECRET_BETS_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_homeTeam", "type": "string"},
      {"internalType": "string", "name": "_awayTeam", "type": "string"},
      {"internalType": "uint256", "name": "_startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "_endTime", "type": "uint256"},
      {"internalType": "bytes", "name": "_homeOdds", "type": "bytes"},
      {"internalType": "bytes", "name": "_drawOdds", "type": "bytes"},
      {"internalType": "bytes", "name": "_awayOdds", "type": "bytes"},
      {"internalType": "bytes", "name": "_oddsProof", "type": "bytes"}
    ],
    "name": "createMatch",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_matchId", "type": "uint256"},
      {"internalType": "uint8", "name": "_betType", "type": "uint8"},
      {"internalType": "bytes", "name": "_amount", "type": "bytes"},
      {"internalType": "bytes", "name": "_amountProof", "type": "bytes"}
    ],
    "name": "placeBet",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256", "name": "_matchId", "type": "uint256"},
      {"internalType": "bytes", "name": "_homeScore", "type": "bytes"},
      {"internalType": "bytes", "name": "_awayScore", "type": "bytes"},
      {"internalType": "bytes", "name": "_scoreProof", "type": "bytes"}
    ],
    "name": "updateMatchResult",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_betId", "type": "uint256"}],
    "name": "settleBet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "bytes", "name": "_amount", "type": "bytes"},
      {"internalType": "bytes", "name": "_amountProof", "type": "bytes"}
    ],
    "name": "withdrawFunds",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_matchId", "type": "uint256"}],
    "name": "getMatchInfo",
    "outputs": [
      {"internalType": "string", "name": "homeTeam", "type": "string"},
      {"internalType": "string", "name": "awayTeam", "type": "string"},
      {"internalType": "uint8", "name": "homeScore", "type": "uint8"},
      {"internalType": "uint8", "name": "awayScore", "type": "uint8"},
      {"internalType": "uint8", "name": "status", "type": "uint8"},
      {"internalType": "uint256", "name": "startTime", "type": "uint256"},
      {"internalType": "uint256", "name": "endTime", "type": "uint256"},
      {"internalType": "bool", "name": "isActive", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_betId", "type": "uint256"}],
    "name": "getBetInfo",
    "outputs": [
      {"internalType": "uint8", "name": "matchId", "type": "uint8"},
      {"internalType": "uint8", "name": "amount", "type": "uint8"},
      {"internalType": "uint8", "name": "betType", "type": "uint8"},
      {"internalType": "address", "name": "bettor", "type": "address"},
      {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
      {"internalType": "bool", "name": "isSettled", "type": "bool"},
      {"internalType": "bool", "name": "isWon", "type": "bool"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserBalance",
    "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "_matchId", "type": "uint256"}],
    "name": "getMatchOdds",
    "outputs": [
      {"internalType": "uint8", "name": "homeOdds", "type": "uint8"},
      {"internalType": "uint8", "name": "drawOdds", "type": "uint8"},
      {"internalType": "uint8", "name": "awayOdds", "type": "uint8"}
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  sepolia: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
  mainnet: "0x0000000000000000000000000000000000000000", // Replace with actual deployed address
} as const;

// Get contract address for current network
export const getContractAddress = (chainId: number): `0x${string}` => {
  switch (chainId) {
    case 11155111: // Sepolia
      return CONTRACT_ADDRESSES.sepolia as `0x${string}`;
    case 1: // Mainnet
      return CONTRACT_ADDRESSES.mainnet as `0x${string}`;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
};

// Bet types enum
export enum BetType {
  HOME_WIN = 0,
  DRAW = 1,
  AWAY_WIN = 2,
}

// Match status enum
export enum MatchStatus {
  UPCOMING = 0,
  LIVE = 1,
  FINISHED = 2,
  CANCELLED = 3,
}
