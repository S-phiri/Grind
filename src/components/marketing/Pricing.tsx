import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";

const tiers = [
  {
    name: "Foundation",
    price: "29",
    description: "Perfect for players starting their structured training journey.",
    features: [
      "Access to 4 core programmes",
      "Video exercise library",
      "Basic progress tracking",
      "Mobile app access",
      "Email support",
    ],
    cta: "Start Foundation",
    highlighted: false,
  },
  {
    name: "Performance",
    price: "59",
    description: "For serious athletes committed to elite-level development.",
    features: [
      "All Foundation features",
      "Access to all 12 programmes",
      "Advanced analytics dashboard",
      "Personalized programme recommendations",
      "Priority support",
      "Weekly check-in calls",
    ],
    cta: "Start Performance",
    highlighted: true,
  },
  {
    name: "Elite",
    price: "99",
    description: "Maximum support for professional and semi-pro footballers.",
    features: [
      "All Performance features",
      "1-on-1 coaching sessions",
      "Custom programme design",
      "Nutrition guidance",
      "Biomechanics analysis",
      "24/7 support access",
    ],
    cta: "Start Elite",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 noise-texture relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            Choose Your Level
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Flexible pricing for every stage of your football career. Cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {tiers.map((tier, index) => (
            <div
              key={tier.name}
              className={`relative glassy-panel rounded-2xl p-8 transition-all duration-300 ${
                tier.highlighted
                  ? "scale-105 border-[#00FF88] border-2 glow-green"
                  : "hover:scale-[1.02] border-white/10"
              }`}
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-[#00FF88] text-[#0F1419] px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Zap className="w-4 h-4" />
                    Recommended
                  </div>
                </div>
              )}

              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h3 className="font-display text-2xl text-white mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="py-6 border-y border-white/10">
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono-data text-5xl text-white">
                      £{tier.price}
                    </span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        <Check className="w-5 h-5 text-[#00FF88]" />
                      </div>
                      <span className="text-gray-300 text-sm leading-relaxed">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  className={`w-full py-6 font-semibold ${
                    tier.highlighted
                      ? "bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/20"
                  }`}
                >
                  {tier.cta}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-16 text-center space-y-4">
          <p className="text-sm text-gray-400">
            14-day money-back guarantee • No contracts • Cancel anytime
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-gray-500">
            <span>🔒 Secure payments</span>
            <span>•</span>
            <span>📱 iOS & Android</span>
            <span>•</span>
            <span>🌍 Available worldwide</span>
          </div>
        </div>
      </div>
    </section>
  );
}
