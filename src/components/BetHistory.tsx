import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Eye, EyeOff, Trophy, Clock, CheckCircle } from "lucide-react";
import { useAccount, useReadContract } from 'wagmi';
import { STADIUM_SECRET_BETS_ABI, getContractAddress, BetType, MatchStatus } from '@/lib/contracts';
import { useToast } from "@/hooks/use-toast";

interface BetHistoryProps {
  className?: string;
}

interface BetInfo {
  betId: number;
  matchId: number;
  amount: number;
  betType: number;
  bettor: string;
  timestamp: number;
  isSettled: boolean;
  isWon: boolean;
}

interface MatchInfo {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: number;
  startTime: number;
  endTime: number;
  isActive: boolean;
}

const BetHistory = ({ className }: BetHistoryProps) => {
  const { address } = useAccount();
  const { toast } = useToast();
  const [bets, setBets] = useState<BetInfo[]>([]);
  const [matches, setMatches] = useState<Map<number, MatchInfo>>(new Map());
  const [showEncrypted, setShowEncrypted] = useState(false);

  // Mock data for demonstration - in production, this would come from contract calls
  useEffect(() => {
    if (address) {
      // Simulate loading bet history
      const mockBets: BetInfo[] = [
        {
          betId: 1,
          matchId: 1,
          amount: 100,
          betType: BetType.HOME_WIN,
          bettor: address,
          timestamp: Date.now() - 86400000, // 1 day ago
          isSettled: false,
          isWon: false,
        },
        {
          betId: 2,
          matchId: 2,
          amount: 50,
          betType: BetType.DRAW,
          bettor: address,
          timestamp: Date.now() - 172800000, // 2 days ago
          isSettled: true,
          isWon: true,
        },
      ];

      const mockMatches: Map<number, MatchInfo> = new Map([
        [1, {
          homeTeam: "Manchester United",
          awayTeam: "Liverpool",
          homeScore: 0, // Encrypted - will show as 0 until decrypted
          awayScore: 0, // Encrypted - will show as 0 until decrypted
          status: MatchStatus.LIVE,
          startTime: Date.now() - 3600000, // 1 hour ago
          endTime: Date.now() + 3600000, // 1 hour from now
          isActive: true,
        }],
        [2, {
          homeTeam: "Barcelona",
          awayTeam: "Real Madrid",
          homeScore: 0, // Encrypted - will show as 0 until decrypted
          awayScore: 0, // Encrypted - will show as 0 until decrypted
          status: MatchStatus.FINISHED,
          startTime: Date.now() - 172800000, // 2 days ago
          endTime: Date.now() - 86400000, // 1 day ago
          isActive: false,
        }],
      ]);

      setBets(mockBets);
      setMatches(mockMatches);
    }
  }, [address]);

  const getBetTypeLabel = (betType: number): string => {
    switch (betType) {
      case BetType.HOME_WIN:
        return "Home Win";
      case BetType.DRAW:
        return "Draw";
      case BetType.AWAY_WIN:
        return "Away Win";
      default:
        return "Unknown";
    }
  };

  const getMatchStatusLabel = (status: number): string => {
    switch (status) {
      case MatchStatus.UPCOMING:
        return "Upcoming";
      case MatchStatus.LIVE:
        return "Live";
      case MatchStatus.FINISHED:
        return "Finished";
      case MatchStatus.CANCELLED:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const getMatchStatusColor = (status: number): string => {
    switch (status) {
      case MatchStatus.UPCOMING:
        return "bg-blue-500";
      case MatchStatus.LIVE:
        return "bg-green-500";
      case MatchStatus.FINISHED:
        return "bg-gray-500";
      case MatchStatus.CANCELLED:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  const handleViewEncryptedData = () => {
    setShowEncrypted(!showEncrypted);
    toast({
      title: showEncrypted ? "Data Hidden" : "Data Revealed",
      description: showEncrypted 
        ? "Encrypted data is now hidden for privacy protection."
        : "Encrypted data is revealed (admin/oracle view only).",
    });
  };

  if (!address) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-muted-foreground">
          <History className="h-12 w-12 mx-auto mb-4" />
          <p>Connect your wallet to view bet history</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <History className="h-6 w-6 text-primary" />
          <h3 className="text-xl font-bold scoreboard-text">Bet History</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleViewEncryptedData}
          className="flex items-center gap-2"
        >
          {showEncrypted ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          {showEncrypted ? "Hide Data" : "Show Encrypted"}
        </Button>
      </div>

      <div className="space-y-4">
        {bets.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Trophy className="h-12 w-12 mx-auto mb-4" />
            <p>No bets placed yet</p>
            <p className="text-sm">Start betting to see your history here</p>
          </div>
        ) : (
          bets.map((bet) => {
            const match = matches.get(bet.matchId);
            if (!match) return null;

            return (
              <div
                key={bet.betId}
                className="p-4 border rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getMatchStatusColor(match.status)}>
                      {getMatchStatusLabel(match.status)}
                    </Badge>
                    {bet.isSettled && (
                      <Badge variant={bet.isWon ? "default" : "secondary"}>
                        {bet.isWon ? "Won" : "Lost"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {bet.isSettled ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                    {formatTimestamp(bet.timestamp)}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Match</p>
                    <p className="font-semibold scoreboard-text">
                      {match.homeTeam} vs {match.awayTeam}
                    </p>
                    {showEncrypted && match.status === MatchStatus.FINISHED && (
                      <p className="text-sm text-muted-foreground">
                        Score: {match.homeScore} - {match.awayScore}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Bet</p>
                    <p className="font-semibold scoreboard-text">
                      {getBetTypeLabel(bet.betType)}
                    </p>
                    {showEncrypted && (
                      <p className="text-sm text-muted-foreground">
                        Amount: ${bet.amount}
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-semibold scoreboard-text">
                      {bet.isSettled 
                        ? bet.isWon 
                          ? "Won" 
                          : "Lost"
                        : "Pending"
                      }
                    </p>
                    {showEncrypted && bet.isSettled && (
                      <p className="text-sm text-muted-foreground">
                        Payout: ${bet.isWon ? bet.amount * 2 : 0}
                      </p>
                    )}
                  </div>
                </div>

                {!showEncrypted && (
                  <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/30">
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <EyeOff className="h-4 w-4" />
                      <span>Data encrypted for privacy protection</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default BetHistory;
