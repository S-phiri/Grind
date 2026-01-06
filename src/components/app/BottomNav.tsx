import { useState } from "react";
import { Home, Calendar, TrendingUp, User, MoreHorizontal } from "lucide-react";

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "home", label: "Home", icon: Home },
  { id: "programmes", label: "Programmes", icon: Calendar },
  { id: "progress", label: "Progress", icon: TrendingUp },
  { id: "profile", label: "Profile", icon: User },
  { id: "more", label: "More", icon: MoreHorizontal },
];

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="glassy-panel border-t border-white/10 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-300 ${
                  isActive
                    ? "scale-110"
                    : "hover:bg-white/5"
                }`}
              >
                <tab.icon
                  className={`w-6 h-6 transition-colors ${
                    isActive ? "text-[#00FF88]" : "text-gray-400"
                  }`}
                  style={{
                    filter: isActive ? "drop-shadow(0 0 8px rgba(0, 255, 136, 0.5))" : "none",
                  }}
                />
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-[#00FF88]" : "text-gray-400"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
