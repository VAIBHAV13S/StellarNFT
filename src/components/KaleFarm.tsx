import { useState } from "react";
import { Play, Pause, TrendingUp, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface KaleFarmProps {
  className?: string;
}

export function KaleFarm({ className }: KaleFarmProps) {
  const [isFarming, setIsFarming] = useState(false);
  const [farmProgress, setFarmProgress] = useState(65);
  const [kaleEarned, setKaleEarned] = useState(2.4);
  const [teamMembers, setTeamMembers] = useState(12);

  const handleToggleFarming = () => {
    setIsFarming(!isFarming);
    if (!isFarming) {
      // Simulate farming progress
      const interval = setInterval(() => {
        setFarmProgress(prev => {
          const newProgress = prev + Math.random() * 2;
          if (newProgress >= 100) {
            setKaleEarned(prev => prev + 0.1);
            return 0;
          }
          return newProgress;
        });
      }, 1000);

      // Clean up interval when component unmounts or farming stops
      return () => clearInterval(interval);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Star className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">KALE Farm</h3>
          <Badge variant="secondary">Proof-of-Teamwork</Badge>
        </div>
        <Button
          onClick={handleToggleFarming}
          variant={isFarming ? "destructive" : "default"}
          size="sm"
        >
          {isFarming ? (
            <>
              <Pause className="h-4 w-4 mr-2" />
              Stop Farming
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Start Farming
            </>
          )}
        </Button>
      </div>

      <div className="space-y-4">
        {/* Farm Progress */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span>Farm Progress</span>
            <span>{farmProgress.toFixed(1)}%</span>
          </div>
          <Progress value={farmProgress} className="h-2" />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium">KALE Earned</span>
            </div>
            <div className="text-lg font-bold text-primary">{kaleEarned.toFixed(2)}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Users className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-sm font-medium">Team Size</span>
            </div>
            <div className="text-lg font-bold">{teamMembers}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              <span className="text-sm font-medium">Your Share</span>
            </div>
            <div className="text-lg font-bold">{(kaleEarned / teamMembers * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* Farm Status */}
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="text-sm text-muted-foreground mb-2">
            {isFarming ? "🧑‍🌾 Actively farming with the team..." : "🚜 Ready to join the farming team!"}
          </div>
          <div className="text-xs text-muted-foreground">
            Rewards are distributed fairly based on your contribution to the team's work
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            View Team
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Farm Stats
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            Claim Rewards
          </Button>
        </div>
      </div>
    </Card>
  );
}
