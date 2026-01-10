import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Trophy, Zap, Dumbbell, CheckCircle2, AlertCircle } from "lucide-react";
import { leaderboardsApi } from "@/lib/api";
import { toast } from "sonner";

interface LeaderboardEntry {
  id: number;
  player_name: string;
  player_id: number;
  value: number;
  unit?: string;
  rank: number;
}

export function Leaders() {
  const [speedLeaders, setSpeedLeaders] = useState<LeaderboardEntry[]>([]);
  const [strengthLeaders, setStrengthLeaders] = useState<LeaderboardEntry[]>([]);
  const [complianceLeaders, setComplianceLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      setLoading(true);
      setError(null);
      const [speed, strength, compliance] = await Promise.all([
        leaderboardsApi.getByType("speed"),
        leaderboardsApi.getByType("strength"),
        leaderboardsApi.getByType("compliance"),
      ]);
      setSpeedLeaders(Array.isArray(speed) ? speed : []);
      setStrengthLeaders(Array.isArray(strength) ? strength : []);
      setComplianceLeaders(Array.isArray(compliance) ? compliance : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboards");
      toast.error("Failed to load leaderboards");
    } finally {
      setLoading(false);
    }
  };

  const renderLeaderboard = (entries: LeaderboardEntry[], icon: React.ReactNode) => {
    if (entries.length === 0) {
      return (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Trophy />
            </EmptyMedia>
            <EmptyTitle>No data yet</EmptyTitle>
            <EmptyDescription>
              Leaderboard will populate as players log metrics
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map((entry) => (
          <Card
            key={entry.id}
            className={`glassy-panel border-white/10 p-5 ${
              entry.rank <= 3 ? "border-[#00FF88]/50 bg-[#00FF88]/5" : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center font-mono-data text-xl font-bold ${
                    entry.rank === 1
                      ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/50"
                      : entry.rank === 2
                      ? "bg-gray-400/20 text-gray-300 border-2 border-gray-400/50"
                      : entry.rank === 3
                      ? "bg-orange-500/20 text-orange-400 border-2 border-orange-500/50"
                      : "bg-white/5 text-gray-400"
                  }`}
                >
                  {entry.rank}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{entry.player_name}</h3>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm text-gray-400">Rank #{entry.rank}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono-data text-2xl text-[#00FF88]">
                  {entry.value}
                  {entry.unit && <span className="text-sm text-gray-400 ml-1">{entry.unit}</span>}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pb-24 noise-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading leaderboards</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={loadLeaderboards}
              className="px-4 py-2 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] rounded-lg font-semibold"
            >
              Try Again
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
            Leaderboards
          </h1>
          <p className="text-gray-400">Top performers across key metrics</p>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="speed" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="speed"
              className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
            >
              <Zap className="w-4 h-4 mr-2" />
              Speed
            </TabsTrigger>
            <TabsTrigger
              value="strength"
              className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Strength
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Compliance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="speed" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-[#00FF88]" />
              <h2 className="font-display text-2xl text-white">Speed Leaders</h2>
            </div>
            {renderLeaderboard(speedLeaders, <Zap className="w-4 h-4 text-[#FF6B35]" />)}
          </TabsContent>

          <TabsContent value="strength" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Dumbbell className="w-6 h-6 text-[#00FF88]" />
              <h2 className="font-display text-2xl text-white">Strength Leaders</h2>
            </div>
            {renderLeaderboard(strengthLeaders, <Dumbbell className="w-4 h-4 text-[#00FF88]" />)}
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-[#00FF88]" />
              <h2 className="font-display text-2xl text-white">Compliance Leaders</h2>
            </div>
            {renderLeaderboard(complianceLeaders, <CheckCircle2 className="w-4 h-4 text-blue-400" />)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

