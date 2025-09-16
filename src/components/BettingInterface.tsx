import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Lock, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi';
import { parseEther } from 'viem';
import { STADIUM_SECRET_BETS_ABI, getContractAddress, BetType } from '@/lib/contracts';
import { prepareEncryptedBetData } from '@/lib/fhe';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: string;
  time: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

interface BettingInterfaceProps {
  match: Match;
  onClose: () => void;
}

const BettingInterface = ({ match, onClose }: BettingInterfaceProps) => {
  const [selectedBet, setSelectedBet] = useState<"home" | "draw" | "away" | null>(null);
  const [betAmount, setBetAmount] = useState("");
  const { toast } = useToast();
  const { address } = useAccount();
  const chainId = useChainId();
  
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  const handlePlaceBet = async () => {
    if (!selectedBet || !betAmount || !address) return;

    try {
      // Convert bet type to contract enum
      const betType = selectedBet === "home" ? BetType.HOME_WIN : 
                     selectedBet === "draw" ? BetType.DRAW : BetType.AWAY_WIN;
      
      // Prepare encrypted bet data
      const encryptedBetData = await prepareEncryptedBetData(
        match.id,
        betType,
        parseFloat(betAmount)
      );

      // Get contract address for current network
      const contractAddress = getContractAddress(chainId);

      // Call the smart contract with encrypted data
      writeContract({
        address: contractAddress,
        abi: STADIUM_SECRET_BETS_ABI,
        functionName: 'placeBet',
        args: [
          BigInt(match.id),
          betType,
          encryptedBetData.encryptedAmount.data,
          encryptedBetData.encryptedAmount.proof
        ],
        value: parseEther(betAmount),
      });

      toast({
        title: "Encrypted Bet Submitted",
        description: `Your ${selectedBet} bet of $${betAmount} is being encrypted and submitted to the blockchain.`,
      });
      
    } catch (err) {
      console.error('Error placing bet:', err);
      toast({
        title: "Error",
        description: "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle successful transaction
  React.useEffect(() => {
    if (isConfirmed && hash) {
      toast({
        title: "Bet Successfully Placed",
        description: `Your encrypted bet has been confirmed on the blockchain. Transaction: ${hash.slice(0, 10)}...`,
      });
      setSelectedBet(null);
      setBetAmount("");
    }
  }, [isConfirmed, hash, toast]);

  // Handle transaction error
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to place bet. Please try again.",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getBetOptions = () => [
    { type: "home" as const, label: match.homeTeam, odds: match.odds.home },
    { type: "draw" as const, label: "Draw", odds: match.odds.draw },
    { type: "away" as const, label: match.awayTeam, odds: match.odds.away },
  ];

  const potentialWin = betAmount && selectedBet 
    ? (parseFloat(betAmount) * match.odds[selectedBet]).toFixed(2)
    : "0.00";

  return (
    <Card className="p-6 card-shadow gradient-scoreboard border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold scoreboard-text text-glow">Place Encrypted Bet</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Match Info */}
      <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <Badge className="bg-accent text-accent-foreground animate-stadium-pulse">
            {match.status}
          </Badge>
          <span className="scoreboard-text text-sm">{match.time}</span>
        </div>
        <div className="text-center scoreboard-text">
          <div className="text-lg font-semibold">
            {match.homeTeam} vs {match.awayTeam}
          </div>
          <div className="text-2xl font-bold text-glow">
            {match.homeScore} - {match.awayScore}
          </div>
        </div>
      </div>

      {/* Bet Selection */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 scoreboard-text">Select Your Bet</h4>
        <div className="grid grid-cols-1 gap-2">
          {getBetOptions().map((option) => (
            <button
              key={option.type}
              onClick={() => setSelectedBet(option.type)}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                selectedBet === option.type
                  ? "border-primary bg-primary/20 stadium-glow"
                  : "border-border bg-secondary/20 hover:border-primary/50"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold scoreboard-text">{option.label}</span>
                <span className="text-primary font-bold scoreboard-text">{option.odds}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Bet Amount */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2 scoreboard-text">
          Bet Amount ($)
        </label>
        <Input
          type="number"
          placeholder="0.00"
          value={betAmount}
          onChange={(e) => setBetAmount(e.target.value)}
          className="scoreboard-text bg-secondary/20 border-border"
        />
      </div>

      {/* Potential Win */}
      {selectedBet && betAmount && (
        <div className="mb-6 p-4 bg-accent/10 rounded-lg border border-accent/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="font-semibold scoreboard-text">Potential Win</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" />
            <span className="text-xl font-bold text-accent scoreboard-text">{potentialWin}</span>
          </div>
        </div>
      )}

      {/* Encryption Notice */}
      <div className="mb-6 p-4 bg-primary/10 rounded-lg border border-primary/30">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-primary animate-glow-pulse" />
          <span className="font-semibold scoreboard-text text-primary">Encryption Active</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Your bet will be encrypted and hidden from manipulation until match completion.
        </p>
      </div>

      {/* Place Bet Button */}
      <Button
        onClick={handlePlaceBet}
        disabled={!selectedBet || !betAmount || isPending || isConfirming}
        className="w-full gradient-primary text-primary-foreground stadium-glow scoreboard-text font-semibold"
        size="lg"
      >
        {isPending || isConfirming ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
            {isPending ? "Encrypting Bet..." : "Confirming..."}
          </>
        ) : (
          <>
            <Lock className="h-5 w-5 mr-2" />
            Place Encrypted Bet
          </>
        )}
      </Button>
    </Card>
  );
};

export default BettingInterface;