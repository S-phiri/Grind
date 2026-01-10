import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { ArrowLeft, User, TrendingUp, Calendar, AlertCircle, Plus } from "lucide-react";
import { playersApi, metricsApi } from "@/lib/api";
import { toast } from "sonner";
import { PlayerProgramme } from "./PlayerProgramme";

interface Player {
  id: number;
  name: string;
  email?: string;
  position?: string;
  team?: string;
}

interface Metric {
  id: number;
  player: number;
  metric_type: string;
  value: number;
  unit?: string;
  date: string;
  notes?: string;
}

interface Session {
  id: number;
  player: number;
  title: string;
  type?: string;
  date: string;
  duration?: number;
  completed?: boolean;
}

export function PlayerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMetricDialogOpen, setIsMetricDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metricFormData, setMetricFormData] = useState({
    metric_type: "",
    value: "",
    unit: "",
    notes: "",
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [playerData, metricsData, sessionsData] = await Promise.all([
        playersApi.getById(id!),
        playersApi.getMetrics(id!),
        playersApi.getSessions(id!),
      ]);
      setPlayer(playerData);
      setMetrics(Array.isArray(metricsData) ? metricsData : []);
      setSessions(Array.isArray(sessionsData) ? sessionsData : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load player data");
      toast.error("Failed to load player data");
    } finally {
      setLoading(false);
    }
  };

  const handleMetricSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await metricsApi.create({
        player: id,
        ...metricFormData,
        value: parseFloat(metricFormData.value),
      });
      toast.success("Metric logged successfully");
      setIsMetricDialogOpen(false);
      setMetricFormData({ metric_type: "", value: "", unit: "", notes: "" });
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to log metric");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="min-h-screen pb-24 noise-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/app/players")}
            className="text-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/10 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Players
          </Button>
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading player</h3>
            <p className="text-gray-400 mb-4">{error || "Player not found"}</p>
            <Button onClick={loadData} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <Button
          variant="ghost"
          onClick={() => navigate("/app/players")}
          className="text-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/10 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Button>

        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
            {player.name}
          </h1>
          <div className="flex items-center gap-3">
            {player.position && (
              <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none">
                {player.position}
              </Badge>
            )}
            {player.team && (
              <Badge className="bg-white/10 text-gray-300 border-none">
                {player.team}
              </Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="metrics" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger
              value="metrics"
              className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
            >
              Metrics
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
            >
              Sessions
            </TabsTrigger>
            <TabsTrigger
              value="programme"
              className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
            >
              Intake & Programme
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl text-white">Performance Metrics</h2>
              <Dialog open={isMetricDialogOpen} onOpenChange={setIsMetricDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Metric
                  </Button>
                </DialogTrigger>
                <DialogContent className="glassy-panel border-white/10">
                  <DialogHeader>
                    <DialogTitle className="text-white">Log New Metric</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleMetricSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metric_type" className="text-gray-300">Metric Type *</Label>
                      <Input
                        id="metric_type"
                        value={metricFormData.metric_type}
                        onChange={(e) => setMetricFormData({ ...metricFormData, metric_type: e.target.value })}
                        placeholder="e.g., Sprint 10m, Bench Press, Body Weight"
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="value" className="text-gray-300">Value *</Label>
                      <Input
                        id="value"
                        type="number"
                        step="0.01"
                        value={metricFormData.value}
                        onChange={(e) => setMetricFormData({ ...metricFormData, value: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-gray-300">Unit</Label>
                      <Input
                        id="unit"
                        value={metricFormData.unit}
                        onChange={(e) => setMetricFormData({ ...metricFormData, unit: e.target.value })}
                        placeholder="e.g., kg, s, cm"
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes" className="text-gray-300">Notes</Label>
                      <Input
                        id="notes"
                        value={metricFormData.notes}
                        onChange={(e) => setMetricFormData({ ...metricFormData, notes: e.target.value })}
                        className="bg-white/5 border-white/20 text-white"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]"
                    >
                      {isSubmitting ? "Logging..." : "Log Metric"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {metrics.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <TrendingUp />
                  </EmptyMedia>
                  <EmptyTitle>No metrics yet</EmptyTitle>
                  <EmptyDescription>
                    Start tracking performance by logging your first metric
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-3">
                {metrics.map((metric) => (
                  <Card key={metric.id} className="glassy-panel border-white/10 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{metric.metric_type}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(metric.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono-data text-2xl text-[#00FF88]">
                          {metric.value}
                          {metric.unit && <span className="text-sm text-gray-400 ml-1">{metric.unit}</span>}
                        </div>
                        {metric.notes && (
                          <p className="text-xs text-gray-500 mt-1">{metric.notes}</p>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sessions" className="space-y-4">
            <h2 className="font-display text-2xl text-white">Training Sessions</h2>
            {sessions.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Calendar />
                  </EmptyMedia>
                  <EmptyTitle>No sessions yet</EmptyTitle>
                  <EmptyDescription>
                    Sessions will appear here once they're scheduled
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Card
                    key={session.id}
                    className="glassy-panel border-white/10 p-5 hover:scale-[1.01] transition-all cursor-pointer"
                    onClick={() => navigate(`/app/session/${session.id}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-white mb-1">{session.title}</h3>
                        <p className="text-sm text-gray-400">
                          {new Date(session.date).toLocaleDateString()}
                          {session.duration && ` • ${session.duration} min`}
                        </p>
                      </div>
                      {session.type && (
                        <Badge className="bg-[#FF6B35]/20 text-[#FF6B35] border-none">
                          {session.type}
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="programme" className="space-y-4">
            <PlayerProgramme />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

