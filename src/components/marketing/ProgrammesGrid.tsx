import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Flame, Wind, Target } from "lucide-react";

const programmes = [
  {
    icon: Zap,
    title: "Explosive Power",
    duration: "8 weeks",
    intensity: "High",
    sessions: "4x per week",
    description: "Build explosive strength and acceleration for dominant performance on the pitch.",
    features: ["Olympic lifts", "Plyometrics", "Sprint mechanics"],
    color: "from-[#00FF88]/20 to-transparent",
  },
  {
    icon: Flame,
    title: "Elite Conditioning",
    duration: "12 weeks",
    intensity: "High",
    sessions: "5x per week",
    description: "Develop elite-level endurance and match fitness for 90-minute performances.",
    features: ["HIIT protocols", "Threshold runs", "Recovery systems"],
    color: "from-[#FF6B35]/20 to-transparent",
  },
  {
    icon: Wind,
    title: "Speed & Agility",
    duration: "6 weeks",
    intensity: "Medium",
    sessions: "3x per week",
    description: "Enhance acceleration, top speed, and change of direction capabilities.",
    features: ["Sprint training", "Agility drills", "Movement quality"],
    color: "from-blue-500/20 to-transparent",
  },
  {
    icon: Target,
    title: "Mobility & Prehab",
    duration: "Ongoing",
    intensity: "Low",
    sessions: "Daily",
    description: "Optimize movement quality and injury prevention through targeted mobility work.",
    features: ["Joint mobility", "Tissue quality", "Movement prep"],
    color: "from-purple-500/20 to-transparent",
  },
];

const intensityColors = {
  High: "bg-[#FF6B35] text-white",
  Medium: "bg-[#00FF88] text-[#0F1419]",
  Low: "bg-blue-500 text-white",
};

export function ProgrammesGrid() {
  return (
    <section id="programmes" className="py-24 px-4 sm:px-6 lg:px-8 noise-texture">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            Training Programmes
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Scientifically designed training blocks targeting every aspect of football performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {programmes.map((programme, index) => (
            <div
              key={programme.title}
              className="group relative glassy-panel rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${programme.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

              <div className="relative z-10 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="w-14 h-14 rounded-xl bg-[#00FF88]/10 flex items-center justify-center group-hover:bg-[#00FF88]/20 transition-colors">
                    <programme.icon className="w-7 h-7 text-[#00FF88]" />
                  </div>
                  <Badge className={`${intensityColors[programme.intensity as keyof typeof intensityColors]} font-semibold`}>
                    {programme.intensity}
                  </Badge>
                </div>

                {/* Title & Meta */}
                <div>
                  <h3 className="font-display text-2xl sm:text-3xl text-white mb-3">
                    {programme.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-400 font-mono-data">
                    <span>{programme.duration}</span>
                    <span>•</span>
                    <span>{programme.sessions}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 leading-relaxed">
                  {programme.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {programme.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  variant="ghost"
                  className="w-full justify-between text-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/10 group/btn"
                >
                  Learn More
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(0,255,136,0.1)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
