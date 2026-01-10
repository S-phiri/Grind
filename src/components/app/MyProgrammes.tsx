import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { Calendar, Play, CheckCircle2, Clock, AlertCircle, Plus, ArrowRight } from "lucide-react";
import { programmesApi, workoutsApi } from "@/lib/api";
import { toast } from "sonner";
import { WorkoutRecommendation } from "./WorkoutRecommendation";

interface Programme {
  id: number;
  title: string;
  start_date: string;
  status: string;
  total_sessions?: number;
  completed_sessions?: number;
  progress_percent?: number;
  plan?: any;
}

export function MyProgrammes() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [commencingId, setCommencingId] = useState<number | null>(null);

  useEffect(() => {
    loadProgrammes();
  }, []);

  const loadProgrammes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await programmesApi.getMyProgrammes();
      setProgrammes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load programmes");
      toast.error("Failed to load programmes");
    } finally {
      setLoading(false);
    }
  };

  const handleCommence = async (programmeId: number) => {
    try {
      setCommencingId(programmeId);
      const response = await programmesApi.commence(programmeId);
      toast.success(`Programme commenced! ${response.sessions_created} sessions created.`);
      loadProgrammes();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to commence programme");
    } finally {
      setCommencingId(null);
    }
  };

  const activeProgrammes = programmes.filter(p => p.status === 'ACTIVE');
  const pendingProgrammes = programmes.filter(p => ['DRAFT', 'PENDING_COACH', 'PENDING_ATHLETE'].includes(p.status));
  const completedProgrammes = programmes.filter(p => p.status === 'COMPLETED');

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
            My Programmes
          </h1>
          <p className="text-gray-400">Manage your training programmes and workouts</p>
        </div>

        {error && !programmes.length && (
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading programmes</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadProgrammes} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
              Try Again
            </Button>
          </Card>
        )}

        {/* Active Programmes */}
        {activeProgrammes.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl text-white mb-4">Active Programmes</h2>
            <div className="space-y-4">
              {activeProgrammes.map((programme) => {
                const hasSessions = (programme.total_sessions || 0) > 0;
                const progress = programme.progress_percent || 0;
                
                return (
                  <Card key={programme.id} className="glassy-panel border-white/10 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-white text-xl">{programme.title}</h3>
                          <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none">
                            ACTIVE
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Starts: {new Date(programme.start_date).toLocaleDateString()}
                          </span>
                          {hasSessions && (
                            <span>
                              {programme.completed_sessions || 0} / {programme.total_sessions} sessions
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {hasSessions ? (
                      <>
                        <Progress value={progress} className="h-2 mb-4" />
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <span>{progress.toFixed(0)}% complete</span>
                        </div>
                      </>
                    ) : (
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-4">
                          Programme is ready to start. Commence to generate all workout sessions.
                        </p>
                        <Button
                          onClick={() => handleCommence(programme.id)}
                          disabled={commencingId === programme.id}
                          className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
                        >
                          {commencingId === programme.id ? (
                            <>
                              <Spinner className="w-4 h-4 mr-2" />
                              Commencing...
                            </>
                          ) : (
                            <>
                              <Play className="w-4 h-4 mr-2" />
                              Commence Programme
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Pending Programmes */}
        {pendingProgrammes.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl text-white mb-4">Pending Approval</h2>
            <div className="space-y-4">
              {pendingProgrammes.map((programme) => (
                <Card key={programme.id} className="glassy-panel border-white/10 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white mb-1">{programme.title}</h3>
                      <div className="flex items-center gap-3">
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-none">
                          {programme.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-400">
                          {new Date(programme.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Navigate to player detail page with programme tab
                        // For now, just show a message
                        toast.info("Programme details view coming soon");
                      }}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      View Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Completed Programmes */}
        {completedProgrammes.length > 0 && (
          <div className="mb-8">
            <h2 className="font-display text-2xl text-white mb-4">Completed Programmes</h2>
            <div className="space-y-4">
              {completedProgrammes.map((programme) => (
                <Card key={programme.id} className="glassy-panel border-white/10 p-6 opacity-75">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-white">{programme.title}</h3>
                        <Badge className="bg-green-500/20 text-green-400 border-none">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          COMPLETED
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{new Date(programme.start_date).toLocaleDateString()}</span>
                        {programme.total_sessions && (
                          <span>{programme.total_sessions} sessions completed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {programmes.length === 0 && !error && (
          <Card className="glassy-panel border-white/10 p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">No Programmes Yet</h3>
            <p className="text-gray-400 mb-6">
              Start by completing an intake form to get programme recommendations
            </p>
            <Button
              onClick={() => navigate("/app/intake")}
              className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Programme
            </Button>
          </Card>
        )}

        {/* Workout Recommendations Section */}
        <div className="mt-12">
          <WorkoutRecommendation />
        </div>
      </div>
    </div>
  );
}

