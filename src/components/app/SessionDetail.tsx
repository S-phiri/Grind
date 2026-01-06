import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Play, ArrowLeft, Clock, Target } from "lucide-react";

const exercises = [
  {
    id: 1,
    name: "Barbell Back Squat",
    sets: "4",
    reps: "6-8",
    tempo: "3010",
    rest: "3 min",
    video: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80",
    completed: false,
  },
  {
    id: 2,
    name: "Romanian Deadlift",
    sets: "3",
    reps: "8-10",
    tempo: "3110",
    rest: "2.5 min",
    video: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400&q=80",
    completed: false,
  },
  {
    id: 3,
    name: "Bulgarian Split Squat",
    sets: "3",
    reps: "10-12",
    tempo: "2010",
    rest: "90 sec",
    video: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80",
    completed: false,
  },
  {
    id: 4,
    name: "Nordic Hamstring Curls",
    sets: "3",
    reps: "5-8",
    tempo: "5010",
    rest: "2 min",
    video: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400&q=80",
    completed: false,
  },
];

export function SessionDetail() {
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [timerActive, setTimerActive] = useState(false);

  const toggleExercise = (id: number) => {
    const newCompleted = new Set(completedExercises);
    if (newCompleted.has(id)) {
      newCompleted.delete(id);
    } else {
      newCompleted.add(id);
    }
    setCompletedExercises(newCompleted);
  };

  const progress = (completedExercises.size / exercises.length) * 100;

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            className="text-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/10 mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-white mb-2">
                Lower Body Strength
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  60 min
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Week 2, Day 1
                </span>
              </div>
            </div>
            <Badge className="bg-[#FF6B35]/20 text-[#FF6B35] border-none">
              Gym
            </Badge>
          </div>

          {/* Progress Bar */}
          <Card className="glassy-panel border-white/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Session Progress</span>
              <span className="font-mono-data text-[#00FF88]">
                {completedExercises.size}/{exercises.length}
              </span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <div
                className="bg-[#00FF88] h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          {exercises.map((exercise, index) => (
            <Card
              key={exercise.id}
              className={`glassy-panel border-white/10 p-5 transition-all ${
                completedExercises.has(exercise.id)
                  ? 'opacity-60'
                  : 'hover:scale-[1.01]'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Video Thumbnail */}
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer group">
                  <img
                    src={exercise.video}
                    alt={exercise.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Exercise Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-[#00FF88]/20 flex items-center justify-center text-xs font-mono-data text-[#00FF88]">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold text-white">
                          {exercise.name}
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mt-2">
                        <div>
                          <span className="text-gray-500 text-xs">Sets</span>
                          <div className="font-mono-data text-white">{exercise.sets}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Reps</span>
                          <div className="font-mono-data text-white">{exercise.reps}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Tempo</span>
                          <div className="font-mono-data text-white">{exercise.tempo}</div>
                        </div>
                        <div>
                          <span className="text-gray-500 text-xs">Rest</span>
                          <div className="font-mono-data text-white">{exercise.rest}</div>
                        </div>
                      </div>
                    </div>

                    <Checkbox
                      checked={completedExercises.has(exercise.id)}
                      onCheckedChange={() => toggleExercise(exercise.id)}
                      className="data-[state=checked]:bg-[#00FF88] data-[state=checked]:border-[#00FF88]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Timer Card */}
        <Card className="glassy-panel border-white/10 p-6 mt-6">
          <div className="text-center space-y-4">
            <div className="font-mono-data text-5xl text-white">
              {timerActive ? "01:30" : "00:00"}
            </div>
            <div className="text-sm text-gray-400">Rest Timer</div>
            <Button
              onClick={() => setTimerActive(!timerActive)}
              className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
            >
              {timerActive ? "Pause" : "Start Rest Timer"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
