import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";

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

interface ScoreboardCardProps {
  match: Match;
  onClick: () => void;
  isSelected: boolean;
}

const ScoreboardCard = ({ match, onClick, isSelected }: ScoreboardCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "LIVE":
        return "bg-accent text-accent-foreground animate-stadium-pulse";
      case "FT":
        return "bg-muted text-muted-foreground";
      case "UPCOMING":
        return "bg-primary text-primary-foreground stadium-glow";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Card 
      className={`p-6 cursor-pointer transition-all duration-300 card-shadow gradient-scoreboard border-border hover:scale-105 ${
        isSelected ? "ring-2 ring-primary stadium-glow" : ""
      }`}
      onClick={onClick}
    >
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge className={`${getStatusColor(match.status)} scoreboard-text`}>
          {match.status}
        </Badge>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="scoreboard-text">{match.time}</span>
        </div>
      </div>

      {/* Teams and Score */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold scoreboard-text">{match.homeTeam}</span>
          </div>
          <span className="text-2xl font-bold scoreboard-text text-glow">
            {match.homeScore}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold scoreboard-text">{match.awayTeam}</span>
          </div>
          <span className="text-2xl font-bold scoreboard-text text-glow">
            {match.awayScore}
          </span>
        </div>
      </div>

      {/* Odds */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="text-center p-2 bg-secondary/50 rounded scoreboard-text">
            <div className="font-semibold">Home</div>
            <div className="text-primary">{match.odds.home}</div>
          </div>
          <div className="text-center p-2 bg-secondary/50 rounded scoreboard-text">
            <div className="font-semibold">Draw</div>
            <div className="text-primary">{match.odds.draw}</div>
          </div>
          <div className="text-center p-2 bg-secondary/50 rounded scoreboard-text">
            <div className="font-semibold">Away</div>
            <div className="text-primary">{match.odds.away}</div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ScoreboardCard;