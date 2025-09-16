import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Wallet, Shield, Trophy, Clock } from "lucide-react";
import { useAccount } from 'wagmi';
import ScoreboardCard from "@/components/ScoreboardCard";
import WalletConnect from "@/components/WalletConnect";
import BettingInterface from "@/components/BettingInterface";
import BetHistory from "@/components/BetHistory";

const Index = () => {
  const { isConnected } = useAccount();
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  const matches = [
    {
      id: 1,
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      homeScore: 2,
      awayScore: 1,
      status: "LIVE",
      time: "78'",
      odds: { home: 2.1, draw: 3.2, away: 2.8 },
    },
    {
      id: 2,
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      homeScore: 0,
      awayScore: 0,
      status: "UPCOMING",
      time: "19:45",
      odds: { home: 1.8, draw: 3.5, away: 4.2 },
    },
    {
      id: 3,
      homeTeam: "Bayern Munich",
      awayTeam: "PSG",
      homeScore: 3,
      awayScore: 2,
      status: "FT",
      time: "90'",
      odds: { home: 1.9, draw: 3.1, away: 3.8 },
    },
  ];

  return (
    <div className="min-h-screen gradient-stadium">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 animate-glow-pulse"></div>
        <div className="container mx-auto text-center relative z-10">
          <div className="mb-8">
            <Trophy className="h-16 w-16 mx-auto mb-4 text-primary stadium-glow" />
            <h1 className="text-6xl font-bold mb-4 text-glow scoreboard-text">
              Your Bets, Your Secret
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience the future of sports betting with encrypted wagers that prevent odds manipulation. 
              Your strategy stays hidden until the final whistle.
            </p>
          </div>
          
          {!isConnected ? (
            <WalletConnect onConnect={() => {}} />
          ) : (
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg card-shadow">
                <Wallet className="h-5 w-5 text-accent" />
                <span className="scoreboard-text">Wallet Connected</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-6 card-shadow gradient-scoreboard border-border">
              <Shield className="h-12 w-12 text-primary mb-4 stadium-glow" />
              <h3 className="text-xl font-bold mb-2 scoreboard-text">Encrypted Bets</h3>
              <p className="text-muted-foreground">
                Your wagers are encrypted and hidden from manipulation until match completion.
              </p>
            </Card>
            
            <Card className="p-6 card-shadow gradient-scoreboard border-border">
              <Trophy className="h-12 w-12 text-accent mb-4 win-glow" />
              <h3 className="text-xl font-bold mb-2 scoreboard-text">Fair Odds</h3>
              <p className="text-muted-foreground">
                True market odds without interference from bookmakers or insider information.
              </p>
            </Card>
            
            <Card className="p-6 card-shadow gradient-scoreboard border-border">
              <Clock className="h-12 w-12 text-primary mb-4 animate-stadium-pulse" />
              <h3 className="text-xl font-bold mb-2 scoreboard-text">Live Betting</h3>
              <p className="text-muted-foreground">
                Place encrypted bets on live matches with real-time odds and statistics.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Live Matches */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 scoreboard-text text-glow">
            Live Stadium
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              {matches.map((match) => (
                <ScoreboardCard
                  key={match.id}
                  match={match}
                  onClick={() => setSelectedMatch(match)}
                  isSelected={selectedMatch?.id === match.id}
                />
              ))}
            </div>
            
            {selectedMatch && isConnected && (
              <div className="lg:sticky lg:top-8">
                <BettingInterface
                  match={selectedMatch}
                  onClose={() => setSelectedMatch(null)}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bet History Section */}
      {isConnected && (
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 scoreboard-text text-glow">
              Your Bet History
            </h2>
            <BetHistory />
          </div>
        </section>
      )}
    </div>
  );
};

export default Index;