import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Calendar, MapPin, Trophy, Settings, LogOut } from "lucide-react";

const achievements = [
  { id: 1, title: "First Session", icon: "🎯", earned: true },
  { id: 2, title: "7-Day Streak", icon: "🔥", earned: true },
  { id: 3, title: "30-Day Streak", icon: "💪", earned: true },
  { id: 4, title: "50 Sessions", icon: "⚡", earned: false },
  { id: 5, title: "Strength Master", icon: "🏋️", earned: false },
  { id: 6, title: "Speed Demon", icon: "⚡", earned: false },
];

const stats = [
  { label: "Total Sessions", value: "24" },
  { label: "Training Hours", value: "18.5" },
  { label: "Current Streak", value: "7 days" },
  { label: "Member Since", value: "Jan 2024" },
];

export function Profile() {
  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
            Profile
          </h1>
          <p className="text-gray-400">Manage your account and view your achievements</p>
        </div>

        {/* Profile Card */}
        <Card className="glassy-panel border-white/10 p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="w-24 h-24 border-4 border-[#00FF88]/30">
              <AvatarImage src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&q=80" />
              <AvatarFallback className="bg-[#00FF88]/20 text-[#00FF88] text-3xl font-display">
                JD
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div>
                <h2 className="font-display text-2xl text-white mb-1">
                  John Doe
                </h2>
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none">
                  Performance Tier
                </Badge>
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="w-4 h-4" />
                  john.doe@example.com
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <MapPin className="w-4 h-4" />
                  London, UK
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Calendar className="w-4 h-4" />
                  Joined January 2024
                </div>
              </div>

              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                <Button className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold">
                  <User className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <Card key={stat.label} className="glassy-panel border-white/10 p-5 text-center">
              <div className="font-mono-data text-3xl text-[#00FF88] mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </Card>
          ))}
        </div>

        {/* Achievements */}
        <Card className="glassy-panel border-white/10 p-6 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-[#00FF88]" />
            <h3 className="font-display text-2xl text-white">Achievements</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`rounded-xl p-4 text-center transition-all ${
                  achievement.earned
                    ? 'bg-[#00FF88]/20 border border-[#00FF88]/50'
                    : 'bg-white/5 border border-white/10 opacity-50'
                }`}
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className={`text-sm font-semibold ${
                  achievement.earned ? 'text-white' : 'text-gray-500'
                }`}>
                  {achievement.title}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Training History */}
        <Card className="glassy-panel border-white/10 p-6 mb-6">
          <h3 className="font-display text-2xl text-white mb-4">Recent Activity</h3>
          
          <div className="space-y-3">
            {[
              { date: "Today", session: "Upper Body Strength", duration: "60 min" },
              { date: "Yesterday", session: "Speed & Agility", duration: "45 min" },
              { date: "2 days ago", session: "Lower Body Strength", duration: "60 min" },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div>
                  <div className="font-semibold text-white">{activity.session}</div>
                  <div className="text-sm text-gray-400">{activity.date}</div>
                </div>
                <div className="text-sm font-mono-data text-[#00FF88]">
                  {activity.duration}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
