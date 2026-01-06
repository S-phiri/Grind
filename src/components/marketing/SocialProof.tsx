import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcus Johnson",
    role: "Professional Midfielder",
    club: "Premier League",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    quote: "Grind transformed my approach to fitness. The structured programmes gave me the edge I needed to compete at the highest level.",
    rating: 5,
  },
  {
    name: "Sofia Ramirez",
    role: "Youth Academy Player",
    club: "La Liga Youth",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    quote: "The mobility and conditioning work has been game-changing. I feel faster, stronger, and more resilient than ever before.",
    rating: 5,
  },
  {
    name: "David Chen",
    role: "Semi-Pro Striker",
    club: "National League",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
    quote: "Data-driven training that actually works. I've seen measurable improvements in every metric that matters on the pitch.",
    rating: 5,
  },
];

export function SocialProof() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 noise-texture relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white mb-4">
            Trusted by Athletes
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Join hundreds of footballers already training smarter, not harder.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.name}
              className="glassy-panel border-white/10 p-8 hover:scale-[1.02] transition-all duration-300 cursor-pointer group"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              <div className="space-y-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-[#00FF88]/50 group-hover:text-[#00FF88] transition-colors" />

                {/* Quote */}
                <p className="text-gray-300 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>

                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-[#00FF88]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 border-2 border-[#00FF88]/30">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-[#00FF88]/10 text-[#00FF88]">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {testimonial.role}
                    </div>
                    <div className="text-xs text-[#00FF88] font-mono-data">
                      {testimonial.club}
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover effect */}
              <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                <div className="absolute inset-0 rounded-lg shadow-[inset_0_0_15px_rgba(0,255,136,0.1)]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
