import { useState } from "react";
import { Dashboard } from "@/components/app/Dashboard";
import { SessionDetail } from "@/components/app/SessionDetail";
import { ProgressTracker } from "@/components/app/ProgressTracker";
import { Profile } from "@/components/app/Profile";
import { BottomNav } from "@/components/app/BottomNav";
import { MyProgrammes } from "@/components/app/MyProgrammes";

export default function AppLayout() {
  const [activeTab, setActiveTab] = useState("home");

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Dashboard />;
      case "programmes":
        return <MyProgrammes />;
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
