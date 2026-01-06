import { ClipboardCheck, Calendar, Dumbbell, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: ClipboardCheck,
    title: "Assess",
    description: "Complete your performance baseline evaluation and set clear goals.",
  },
  {
    icon: Calendar,
    title: "Plan",
    description: "Get a personalized training roadmap tailored to your position and targets.",
  },
  {
    icon: Dumbbell,
    title: "Train",
    description: "Execute structured sessions with video guides and real-time tracking.",
  },
  {
    icon: TrendingUp,
    title: "Track",
    description: "Monitor progress with detailed metrics and performance analytics.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8 noise-texture relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Four steps to transform your performance. Simple, systematic, results-driven.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="glassy-panel rounded-2xl p-8 hover:scale-105 transition-all duration-300 hover:glow-green group cursor-pointer"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-[#00FF88]/10 flex items-center justify-center group-hover:bg-[#00FF88]/20 transition-colors">
                    <step.icon className="w-8 h-8 text-[#00FF88]" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0F1419] border-2 border-[#00FF88] flex items-center justify-center">
                    <span className="font-mono-data text-sm text-[#00FF88]">
                      {index + 1}
                    </span>
                  </div>
                </div>

                <h3 className="font-display text-2xl text-white">
                  {step.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Connection line */}
        <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00FF88]/20 to-transparent -z-10" />
      </div>
    </section>
  );
}
