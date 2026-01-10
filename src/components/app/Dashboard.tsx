import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Dumbbell, Calendar, TrendingUp, Flame, CheckCircle2, Target, AlertCircle, ArrowRight } from "lucide-react";
import { dashboardApi } from "@/lib/api";
import { toast } from "sonner";

interface DashboardSummary {
  total_sessions_completed: number;
  my_compliance: number;
  current_streak: number;
  my_progress: Array<{
    metric_type: 'strength' | 'speed';
    start_value: number;
    end_value: number;
    pct_change: number;
  }>;
}

export function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="min-h-screen pb-24 noise-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading dashboard</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    { 
      label: "Sessions Completed", 
      value: summary?.total_sessions_completed.toString() || "0", 
      icon: CheckCircle2 
    },
    { 
      label: "Current Streak", 
      value: summary?.current_streak.toString() || "0", 
      unit: "days", 
      icon: Flame 
    },
    { 
      label: "My Compliance", 
      value: summary?.my_compliance.toFixed(1) || "0", 
      unit: "%", 
      icon: Target 
    },
  ];

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-400">Let's crush today's session</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="glassy-panel border-white/10 p-6 hover:scale-[1.02] transition-all">
              <div className="flex items-center justify-between mb-4">
                <stat.icon className="w-8 h-8 text-[#00FF88]" />
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-data text-4xl text-white">
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className="text-gray-400 text-sm">{stat.unit}</span>
                  )}
                </div>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Navigation Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button
            onClick={() => navigate("/app/sessions")}
            className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold h-auto p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5" />
              <span>View Sessions</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => navigate("/app/leaders")}
            className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold h-auto p-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <TrendingUp className="w-5 h-5" />
              <span>Leaderboards</span>
            </div>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Weekly Progress */}
        <Card className="glassy-panel border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-white mb-1">
                Weekly Progress
              </h2>
              <p className="text-sm text-gray-400">
                My compliance: {summary?.my_compliance.toFixed(1) || "0"}%
              </p>
            </div>
            <div className="text-right">
              <div className="font-mono-data text-3xl text-[#00FF88]">
                {summary?.my_compliance.toFixed(0) || "0"}%
              </div>
              <div className="text-xs text-gray-400">Completion</div>
            </div>
          </div>
          <Progress value={summary?.my_compliance || 0} className="h-3 mb-4" />
        </Card>

        {/* My Progress */}
        {summary && summary.my_progress.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-white">My Progress</h2>
              <TrendingUp className="w-5 h-5 text-[#00FF88]" />
            </div>
            <div className="space-y-3">
              {summary.my_progress.map((progress, index) => (
                <Card
                  key={`${progress.metric_type}-${index}`}
                  className="glassy-panel border-white/10 p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center">
                        {progress.metric_type === 'strength' ? (
                          <Dumbbell className="w-6 h-6 text-[#00FF88]" />
                        ) : (
                          <TrendingUp className="w-6 h-6 text-[#00FF88]" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1 capitalize">
                          {progress.metric_type} Performance
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>
                            {progress.start_value.toFixed(1)} → {progress.end_value.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-mono-data text-2xl ${
                        progress.pct_change >= 0 ? 'text-[#00FF88]' : 'text-[#FF6B35]'
                      }`}>
                        {progress.pct_change >= 0 ? '+' : ''}{progress.pct_change.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">improvement</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
