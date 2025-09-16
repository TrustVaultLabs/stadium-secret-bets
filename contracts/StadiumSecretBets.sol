// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";
import { euint32, externalEuint32, euint8, ebool, FHE } from "@fhevm/solidity/lib/FHE.sol";

contract StadiumSecretBets is SepoliaConfig {
    using FHE for *;
    
    struct Match {
        euint32 matchId;
        string homeTeam;
        string awayTeam;
        euint32 homeScore;
        euint32 awayScore;
        MatchStatus status;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    struct Bet {
        euint32 betId;
        euint32 matchId;
        euint32 amount;
        BetType betType;
        address bettor;
        uint256 timestamp;
        bool isSettled;
        bool isWon;
    }
    
    struct Odds {
        euint32 homeOdds;
        euint32 drawOdds;
        euint32 awayOdds;
    }
    
    enum MatchStatus {
        UPCOMING,
        LIVE,
        FINISHED,
        CANCELLED
    }
    
    enum BetType {
        HOME_WIN,
        DRAW,
        AWAY_WIN
    }
    
    mapping(uint256 => Match) public matches;
    mapping(uint256 => Bet) public bets;
    mapping(uint256 => Odds) public matchOdds;
    mapping(address => euint32) public userBalances;
    mapping(address => euint32) public userReputation;
    
    uint256 public matchCounter;
    uint256 public betCounter;
    
    address public owner;
    address public oracle;
    
    event MatchCreated(uint256 indexed matchId, string homeTeam, string awayTeam, uint256 startTime);
    event BetPlaced(uint256 indexed betId, uint256 indexed matchId, address indexed bettor, BetType betType);
    event MatchResultUpdated(uint256 indexed matchId, uint32 homeScore, uint32 awayScore);
    event BetSettled(uint256 indexed betId, bool isWon, uint32 payout);
    event FundsWithdrawn(address indexed user, uint32 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle can call this function");
        _;
    }
    
    constructor(address _oracle) {
        owner = msg.sender;
        oracle = _oracle;
    }
    
    function createMatch(
        string memory _homeTeam,
        string memory _awayTeam,
        uint256 _startTime,
        uint256 _endTime,
        externalEuint32 _homeOdds,
        externalEuint32 _drawOdds,
        externalEuint32 _awayOdds,
        bytes calldata _oddsProof
    ) public onlyOwner returns (uint256) {
        require(bytes(_homeTeam).length > 0, "Home team name cannot be empty");
        require(bytes(_awayTeam).length > 0, "Away team name cannot be empty");
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        uint256 matchId = matchCounter++;
        
        // Convert external encrypted odds to internal encrypted values
        euint32 internalHomeOdds = FHE.fromExternal(_homeOdds, _oddsProof);
        euint32 internalDrawOdds = FHE.fromExternal(_drawOdds, _oddsProof);
        euint32 internalAwayOdds = FHE.fromExternal(_awayOdds, _oddsProof);
        
        matches[matchId] = Match({
            matchId: FHE.asEuint32(0), // Will be set properly later
            homeTeam: _homeTeam,
            awayTeam: _awayTeam,
            homeScore: FHE.asEuint32(0),
            awayScore: FHE.asEuint32(0),
            status: MatchStatus.UPCOMING,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true
        });
        
        matchOdds[matchId] = Odds({
            homeOdds: internalHomeOdds,
            drawOdds: internalDrawOdds,
            awayOdds: internalAwayOdds
        });
        
        emit MatchCreated(matchId, _homeTeam, _awayTeam, _startTime);
        return matchId;
    }
    
    function placeBet(
        uint256 _matchId,
        BetType _betType,
        externalEuint32 _amount,
        bytes calldata _amountProof
    ) public payable returns (uint256) {
        require(matches[_matchId].isActive, "Match does not exist or is inactive");
        require(matches[_matchId].status == MatchStatus.UPCOMING || matches[_matchId].status == MatchStatus.LIVE, "Cannot bet on finished match");
        require(block.timestamp < matches[_matchId].endTime, "Betting period has ended");
        
        uint256 betId = betCounter++;
        
        // Convert external encrypted amount to internal encrypted value
        euint32 internalAmount = FHE.fromExternal(_amount, _amountProof);
        
        bets[betId] = Bet({
            betId: FHE.asEuint32(0), // Will be set properly later
            matchId: FHE.asEuint32(_matchId),
            amount: internalAmount,
            betType: _betType,
            bettor: msg.sender,
            timestamp: block.timestamp,
            isSettled: false,
            isWon: false
        });
        
        // Update user balance (encrypted)
        userBalances[msg.sender] = FHE.add(userBalances[msg.sender], internalAmount);
        
        emit BetPlaced(betId, _matchId, msg.sender, _betType);
        return betId;
    }
    
    function updateMatchResult(
        uint256 _matchId,
        externalEuint32 _homeScore,
        externalEuint32 _awayScore,
        bytes calldata _scoreProof
    ) public onlyOracle {
        require(matches[_matchId].isActive, "Match does not exist or is inactive");
        require(matches[_matchId].status == MatchStatus.LIVE || matches[_matchId].status == MatchStatus.UPCOMING, "Match already finished");
        
        // Convert external encrypted scores to internal encrypted values
        euint32 internalHomeScore = FHE.fromExternal(_homeScore, _scoreProof);
        euint32 internalAwayScore = FHE.fromExternal(_awayScore, _scoreProof);
        
        matches[_matchId].homeScore = internalHomeScore;
        matches[_matchId].awayScore = internalAwayScore;
        matches[_matchId].status = MatchStatus.FINISHED;
        
        emit MatchResultUpdated(_matchId, 0, 0); // Scores will be decrypted off-chain
    }
    
    function settleBet(uint256 _betId) public onlyOracle {
        require(bets[_betId].bettor != address(0), "Bet does not exist");
        require(!bets[_betId].isSettled, "Bet already settled");
        
        uint256 matchId = 0; // FHE.decrypt(bets[_betId].matchId) - will be decrypted off-chain
        require(matches[matchId].status == MatchStatus.FINISHED, "Match not finished yet");
        
        // Determine if bet won (logic will be implemented based on decrypted scores)
        // This is a simplified version - in reality, you'd need to decrypt and compare scores
        bool betWon = false; // Logic to determine if bet won
        
        bets[_betId].isSettled = true;
        bets[_betId].isWon = betWon;
        
        if (betWon) {
            // Calculate payout (encrypted)
            euint32 betAmount = bets[_betId].amount;
            euint32 odds = FHE.asEuint32(0); // Get appropriate odds based on bet type
            euint32 payout = FHE.mul(betAmount, odds);
            
            // Update user balance with winnings
            userBalances[bets[_betId].bettor] = FHE.add(userBalances[bets[_betId].bettor], payout);
        }
        
        emit BetSettled(_betId, betWon, 0); // Payout will be decrypted off-chain
    }
    
    function withdrawFunds(externalEuint32 _amount, bytes calldata _amountProof) public {
        euint32 internalAmount = FHE.fromExternal(_amount, _amountProof);
        
        // Check if user has sufficient balance (encrypted comparison)
        ebool hasSufficientBalance = FHE.le(internalAmount, userBalances[msg.sender]);
        require(FHE.decrypt(hasSufficientBalance), "Insufficient balance");
        
        // Deduct from user balance
        userBalances[msg.sender] = FHE.sub(userBalances[msg.sender], internalAmount);
        
        // Transfer funds (amount will be decrypted off-chain)
        // payable(msg.sender).transfer(decryptedAmount);
        
        emit FundsWithdrawn(msg.sender, 0); // Amount will be decrypted off-chain
    }
    
    function updateUserReputation(address _user, euint32 _reputation) public onlyOracle {
        require(_user != address(0), "Invalid user address");
        userReputation[_user] = _reputation;
    }
    
    function getMatchInfo(uint256 _matchId) public view returns (
        string memory homeTeam,
        string memory awayTeam,
        uint8 homeScore,
        uint8 awayScore,
        MatchStatus status,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        Match storage match_ = matches[_matchId];
        return (
            match_.homeTeam,
            match_.awayTeam,
            0, // FHE.decrypt(match_.homeScore) - will be decrypted off-chain
            0, // FHE.decrypt(match_.awayScore) - will be decrypted off-chain
            match_.status,
            match_.startTime,
            match_.endTime,
            match_.isActive
        );
    }
    
    function getBetInfo(uint256 _betId) public view returns (
        uint8 matchId,
        uint8 amount,
        BetType betType,
        address bettor,
        uint256 timestamp,
        bool isSettled,
        bool isWon
    ) {
        Bet storage bet = bets[_betId];
        return (
            0, // FHE.decrypt(bet.matchId) - will be decrypted off-chain
            0, // FHE.decrypt(bet.amount) - will be decrypted off-chain
            bet.betType,
            bet.bettor,
            bet.timestamp,
            bet.isSettled,
            bet.isWon
        );
    }
    
    function getUserBalance(address _user) public view returns (uint8) {
        return 0; // FHE.decrypt(userBalances[_user]) - will be decrypted off-chain
    }
    
    function getUserReputation(address _user) public view returns (uint8) {
        return 0; // FHE.decrypt(userReputation[_user]) - will be decrypted off-chain
    }
    
    function getMatchOdds(uint256 _matchId) public view returns (
        uint8 homeOdds,
        uint8 drawOdds,
        uint8 awayOdds
    ) {
        Odds storage odds = matchOdds[_matchId];
        return (
            0, // FHE.decrypt(odds.homeOdds) - will be decrypted off-chain
            0, // FHE.decrypt(odds.drawOdds) - will be decrypted off-chain
            0  // FHE.decrypt(odds.awayOdds) - will be decrypted off-chain
        );
    }
    
    function setOracle(address _oracle) public onlyOwner {
        require(_oracle != address(0), "Invalid oracle address");
        oracle = _oracle;
    }
    
    function deactivateMatch(uint256 _matchId) public onlyOwner {
        require(matches[_matchId].isActive, "Match already inactive");
        matches[_matchId].isActive = false;
    }
}
