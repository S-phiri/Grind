import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Zap, Target, Activity } from "lucide-react";

const strengthData = [
  { week: "W1", squat: 100, bench: 80, deadlift: 120 },
  { week: "W2", squat: 105, bench: 82, deadlift: 125 },
  { week: "W3", squat: 110, bench: 85, deadlift: 130 },
  { week: "W4", squat: 112, bench: 87, deadlift: 135 },
  { week: "W5", squat: 115, bench: 90, deadlift: 140 },
  { week: "W6", squat: 120, bench: 92, deadlift: 145 },
];

const speedData = [
  { week: "W1", sprint10: 1.85, sprint30: 4.2 },
  { week: "W2", sprint10: 1.82, sprint30: 4.15 },
  { week: "W3", sprint10: 1.80, sprint30: 4.1 },
  { week: "W4", sprint10: 1.78, sprint30: 4.05 },
  { week: "W5", sprint10: 1.75, sprint30: 4.0 },
  { week: "W6", sprint10: 1.73, sprint30: 3.95 },
];

const metrics = [
  {
    label: "Strength Gain",
    value: "+15%",
    change: "vs. baseline",
    icon: TrendingUp,
    color: "text-[#00FF88]",
  },
  {
    label: "Speed Improvement",
    value: "6.5%",
    change: "faster 10m",
    icon: Zap,
    color: "text-[#FF6B35]",
  },
  {
    label: "Training Load",
    value: "High",
    change: "optimal range",
    icon: Activity,
    color: "text-blue-400",
  },
  {
    label: "Recovery Score",
    value: "92/100",
    change: "excellent",
    icon: Target,
    color: "text-purple-400",
  },
];

export function ProgressTracker() {
  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
            Progress Tracker
          </h1>
          <p className="text-gray-400">Data-driven insights into your performance</p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metrics.map((metric) => (
            <Card key={metric.label} className="glassy-panel border-white/10 p-5">
              <div className="flex items-center justify-between mb-3">
                <metric.icon className={`w-6 h-6 ${metric.color}`} />
              </div>
              <div className="space-y-1">
                <div className={`font-mono-data text-3xl ${metric.color}`}>
                  {metric.value}
                </div>
                <p className="text-xs text-gray-500">{metric.change}</p>
                <p className="text-sm text-gray-400 font-medium">{metric.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <Card className="glassy-panel border-white/10 p-6">
          <Tabs defaultValue="strength" className="space-y-6">
            <TabsList className="bg-white/5 border border-white/10">
              <TabsTrigger
                value="strength"
                className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
              >
                Strength
              </TabsTrigger>
              <TabsTrigger
                value="speed"
                className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
              >
                Speed
              </TabsTrigger>
              <TabsTrigger
                value="body"
                className="data-[state=active]:bg-[#00FF88] data-[state=active]:text-[#0F1419]"
              >
                Body Comp
              </TabsTrigger>
            </TabsList>

            <TabsContent value="strength" className="space-y-4">
              <div>
                <h3 className="font-display text-2xl text-white mb-2">
                  Strength Progression
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  1RM estimates based on training loads (kg)
                </p>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="week"
                      stroke="#6B7280"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26, 31, 38, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(20px)',
                      }}
                      labelStyle={{ color: '#fff', fontFamily: 'JetBrains Mono' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="squat"
                      stroke="#00FF88"
                      strokeWidth={3}
                      dot={{ fill: '#00FF88', r: 5 }}
                      name="Back Squat"
                    />
                    <Line
                      type="monotone"
                      dataKey="bench"
                      stroke="#FF6B35"
                      strokeWidth={3}
                      dot={{ fill: '#FF6B35', r: 5 }}
                      name="Bench Press"
                    />
                    <Line
                      type="monotone"
                      dataKey="deadlift"
                      stroke="#60A5FA"
                      strokeWidth={3}
                      dot={{ fill: '#60A5FA', r: 5 }}
                      name="Deadlift"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-[#00FF88] mx-auto mb-2" />
                  <div className="text-xs text-gray-400">Back Squat</div>
                  <div className="font-mono-data text-white">120kg</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B35] mx-auto mb-2" />
                  <div className="text-xs text-gray-400">Bench Press</div>
                  <div className="font-mono-data text-white">92kg</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-[#60A5FA] mx-auto mb-2" />
                  <div className="text-xs text-gray-400">Deadlift</div>
                  <div className="font-mono-data text-white">145kg</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="speed" className="space-y-4">
              <div>
                <h3 className="font-display text-2xl text-white mb-2">
                  Sprint Performance
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Sprint times in seconds (lower is better)
                </p>
              </div>
              
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={speedData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                      dataKey="week"
                      stroke="#6B7280"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      style={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'rgba(26, 31, 38, 0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        backdropFilter: 'blur(20px)',
                      }}
                      labelStyle={{ color: '#fff', fontFamily: 'JetBrains Mono' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="sprint10"
                      stroke="#00FF88"
                      strokeWidth={3}
                      dot={{ fill: '#00FF88', r: 5 }}
                      name="10m Sprint"
                    />
                    <Line
                      type="monotone"
                      dataKey="sprint30"
                      stroke="#FF6B35"
                      strokeWidth={3}
                      dot={{ fill: '#FF6B35', r: 5 }}
                      name="30m Sprint"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-[#00FF88] mx-auto mb-2" />
                  <div className="text-xs text-gray-400">10m Sprint</div>
                  <div className="font-mono-data text-white">1.73s</div>
                  <div className="text-xs text-[#00FF88]">-6.5% improvement</div>
                </div>
                <div className="text-center">
                  <div className="w-3 h-3 rounded-full bg-[#FF6B35] mx-auto mb-2" />
                  <div className="text-xs text-gray-400">30m Sprint</div>
                  <div className="font-mono-data text-white">3.95s</div>
                  <div className="text-xs text-[#00FF88]">-6.0% improvement</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="body" className="space-y-4">
              <div>
                <h3 className="font-display text-2xl text-white mb-2">
                  Body Composition
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  Track physical changes over time
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-400">Body Weight</div>
                    <div className="font-mono-data text-4xl text-white">78.5kg</div>
                    <div className="text-xs text-[#00FF88]">+2.3kg lean mass</div>
                  </div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-400">Body Fat</div>
                    <div className="font-mono-data text-4xl text-white">12.4%</div>
                    <div className="text-xs text-[#00FF88]">-1.8% reduction</div>
                  </div>
                </Card>
                <Card className="bg-white/5 border-white/10 p-6">
                  <div className="text-center space-y-2">
                    <div className="text-sm text-gray-400">Muscle Mass</div>
                    <div className="font-mono-data text-4xl text-white">68.7kg</div>
                    <div className="text-xs text-[#00FF88]">+4.2kg gained</div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
