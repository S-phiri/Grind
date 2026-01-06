import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Calendar, TrendingUp, Flame, CheckCircle2 } from "lucide-react";

const upcomingSessions = [
  {
    id: 1,
    title: "Upper Body Strength",
    type: "Gym",
    time: "Today, 6:00 PM",
    duration: "60 min",
    completed: false,
  },
  {
    id: 2,
    title: "Speed & Agility",
    type: "Field",
    time: "Tomorrow, 10:00 AM",
    duration: "45 min",
    completed: false,
  },
  {
    id: 3,
    title: "Recovery & Mobility",
    type: "Mobility",
    time: "Tomorrow, 7:00 PM",
    duration: "30 min",
    completed: false,
  },
];

const stats = [
  { label: "Sessions Completed", value: "24", change: "+12%", icon: CheckCircle2 },
  { label: "Current Streak", value: "7", unit: "days", icon: Flame },
  { label: "Total Hours", value: "18.5", unit: "hrs", icon: TrendingUp },
];

export function Dashboard() {
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
                {stat.change && (
                  <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none">
                    {stat.change}
                  </Badge>
                )}
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

        {/* Weekly Progress */}
        <Card className="glassy-panel border-white/10 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-white mb-1">
                Weekly Progress
              </h2>
              <p className="text-sm text-gray-400">5 of 6 sessions completed</p>
            </div>
            <div className="text-right">
              <div className="font-mono-data text-3xl text-[#00FF88]">83%</div>
              <div className="text-xs text-gray-400">Completion</div>
            </div>
          </div>
          <Progress value={83} className="h-3 mb-4" />
          
          {/* Week Calendar */}
          <div className="grid grid-cols-7 gap-2 mt-6">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
              <div
                key={day}
                className={`text-center p-3 rounded-lg transition-all ${
                  index < 5
                    ? 'bg-[#00FF88]/20 border border-[#00FF88]/50'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                <div className="text-xs text-gray-400 mb-1">{day}</div>
                <div className="font-mono-data text-sm text-white">
                  {index + 9}
                </div>
                {index < 5 && (
                  <CheckCircle2 className="w-4 h-4 text-[#00FF88] mx-auto mt-1" />
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Sessions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl text-white">Upcoming Sessions</h2>
            <Calendar className="w-5 h-5 text-[#00FF88]" />
          </div>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <Card
                key={session.id}
                className="glassy-panel border-white/10 p-5 hover:scale-[1.01] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center group-hover:bg-[#00FF88]/20 transition-colors">
                      <Dumbbell className="w-6 h-6 text-[#00FF88]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{session.time}</span>
                        <span>•</span>
                        <span>{session.duration}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-[#FF6B35]/20 text-[#FF6B35] border-none">
                    {session.type}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
