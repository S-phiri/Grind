import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Zap, Play, RefreshCw, AlertCircle } from "lucide-react";
import { workoutsApi } from "@/lib/api";
import { toast } from "sonner";

interface Workout {
  title: string;
  type: string;
  duration: number;
  exercises: Array<{
    name: string;
    sets: number;
    reps: string;
    rest: string;
    notes?: string;
  }>;
}

export function WorkoutRecommendation() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workoutsApi.recommend();
      setWorkout(data);
      toast.success("Workout recommendation ready!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get workout recommendation");
      toast.error("Failed to get workout recommendation");
    } finally {
      setLoading(false);
    }
  };

  const handleStartWorkout = async () => {
    if (!workout) return;
    
    try {
      setGenerating(true);
      await workoutsApi.generate(workout);
      toast.success("Workout session created! Check your sessions.");
      setWorkout(null); // Clear after generating
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create workout session");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="glassy-panel border-white/10 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-6 h-6 text-[#00FF88]" />
        <h3 className="font-display text-2xl text-white">Recommended Workout</h3>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {!workout ? (
        <div className="text-center py-8">
          <p className="text-gray-400 mb-4">
            Get a personalized workout recommendation based on your goals and profile
          </p>
          <Button
            onClick={fetchRecommendation}
            disabled={loading}
            className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Get Recommended Workout
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-white text-lg">{workout.title}</h4>
              <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none">
                {workout.type}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span>{workout.duration} min</span>
              <span>{workout.exercises.length} exercises</span>
            </div>
          </div>

          <div className="border-t border-white/10 pt-4">
            <h5 className="font-semibold text-white mb-3">Exercises</h5>
            <div className="space-y-3">
              {workout.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex-1">
                    <div className="font-semibold text-white">{exercise.name}</div>
                    <div className="text-sm text-gray-400">
                      {exercise.sets} sets × {exercise.reps}
                      {exercise.rest && ` • ${exercise.rest} rest`}
                    </div>
                    {exercise.notes && (
                      <div className="text-xs text-gray-500 mt-1">{exercise.notes}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleStartWorkout}
              disabled={generating}
              className="flex-1 bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
            >
              {generating ? (
                <>
                  <Spinner className="w-4 h-4 mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start This Workout
                </>
              )}
            </Button>
            <Button
              onClick={fetchRecommendation}
              disabled={loading}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Get Another
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

