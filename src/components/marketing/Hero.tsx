import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-texture">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-950/30 via-[#0F1419] to-[#0F1419]" />
      
      {/* Hero Image */}
      <div className="absolute inset-0 opacity-40">
        <img
          src="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1920&q=80"
          alt="Football training"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1419] via-[#0F1419]/80 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white leading-tight">
            Elite Performance,
            <br />
            <span className="text-[#00FF88] glow-green inline-block">Engineered.</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto font-medium">
            Structured training programmes built for footballers who demand more. 
            Gym, mobility, conditioning, and on-field sessions — all tracked, optimized, and data-driven.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button 
                size="lg" 
                className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold text-lg px-8 py-6 animate-pulse-glow group"
              >
                Start Training Now
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Button 
              size="lg" 
              variant="outline"
              className="border-[#00FF88]/30 text-[#00FF88] hover:bg-[#00FF88]/10 font-semibold text-lg px-8 py-6"
              onClick={() => document.getElementById('programmes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <Zap className="mr-2 h-5 w-5" />
              View Programmes
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 pt-16 max-w-2xl mx-auto">
            <div className="space-y-2">
              <div className="font-mono-data text-3xl sm:text-4xl text-[#00FF88]">500+</div>
              <div className="text-sm text-gray-400">Active Athletes</div>
            </div>
            <div className="space-y-2">
              <div className="font-mono-data text-3xl sm:text-4xl text-[#00FF88]">12</div>
              <div className="text-sm text-gray-400">Programmes</div>
            </div>
            <div className="space-y-2">
              <div className="font-mono-data text-3xl sm:text-4xl text-[#00FF88]">98%</div>
              <div className="text-sm text-gray-400">Completion Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-[#00FF88]/50 flex items-start justify-center p-2">
          <div className="w-1.5 h-1.5 rounded-full bg-[#00FF88]" />
        </div>
      </div>
    </section>
  );
}
