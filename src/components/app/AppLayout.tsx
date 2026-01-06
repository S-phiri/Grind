import { useState } from "react";
import { Dashboard } from "@/components/app/Dashboard";
import { SessionDetail } from "@/components/app/SessionDetail";
import { ProgressTracker } from "@/components/app/ProgressTracker";
import { Profile } from "@/components/app/Profile";
import { BottomNav } from "@/components/app/BottomNav";
import { ProgrammesGrid } from "@/components/marketing/ProgrammesGrid";

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "programmes":
        return (
          <div className="pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
                Programmes
              </h1>
              <p className="text-gray-400 mb-8">Choose your next training block</p>
            </div>
            <ProgrammesGrid />
          </div>
        );
      case "progress":
        return <ProgressTracker />;
      case "profile":
        return <Profile />;
      case "more":
        return (
          <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
            <div className="text-center">
              <h2 className="font-display text-3xl text-white mb-4">More Options</h2>
              <p className="text-gray-400">Settings and additional features coming soon</p>
            </div>
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen noise-texture">
      {renderContent()}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
