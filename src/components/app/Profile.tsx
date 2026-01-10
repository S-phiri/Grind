import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { User, Mail, Calendar, Trophy, Settings, LogOut, AlertCircle } from "lucide-react";
import { authApi, dashboardApi, playersApi } from "@/lib/api";
import { toast } from "sonner";

interface UserData {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined?: string;
}

interface PlayerData {
  id: number;
  name: string;
  email?: string;
  archetype?: string;
  created_at: string;
}

export function Profile() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load user data
      const user = await authApi.getMe();
      setUserData(user);
      
      // Load dashboard data for stats
      try {
        const dashboard = await dashboardApi.getSummary();
        setDashboardData(dashboard);
      } catch (err) {
        console.warn("Could not load dashboard data:", err);
      }
      
      // Try to find player associated with user
      try {
        const players = await playersApi.getAll();
        const playerArray = Array.isArray(players) ? players : [];
        const player = playerArray.find(
          (p: any) => p.email === user.email || p.name.toLowerCase().includes(user.username.toLowerCase())
        );
        if (player) {
          setPlayerData(player);
          
          // Load recent sessions for this player
          try {
            const sessions = await playersApi.getSessions(player.id);
            setRecentSessions(Array.isArray(sessions) ? sessions.slice(0, 3) : []);
          } catch (err) {
            console.warn("Could not load sessions:", err);
          }
        }
      } catch (err) {
        console.warn("Could not load player data:", err);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile data");
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authApi.logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (err) {
      // Best-effort logout - clear token even if API call fails
      authApi.logout();
      toast.success("Logged out successfully");
      navigate("/");
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Calculate stats from real data
  const getStats = () => {
    const totalSessions = dashboardData?.total_sessions_completed || 0;
    const currentStreak = dashboardData?.current_streak || 0;
    
    // Calculate member since date
    let memberSince = 'N/A';
    if (userData?.date_joined) {
      memberSince = new Date(userData.date_joined).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (playerData?.created_at) {
      memberSince = new Date(playerData.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    
    // Estimate training hours (assuming average 60 min per session)
    const trainingHours = totalSessions; // Already in hours equivalent (sessions * 1 hour avg)
    
    return [
      { label: "Sessions Completed", value: totalSessions.toString() },
      { label: "Training Hours", value: trainingHours.toFixed(1) },
      { label: "Current Streak", value: `${currentStreak} ${currentStreak === 1 ? 'day' : 'days'}` },
      { label: "Member Since", value: memberSince },
    ];
  };

  // Calculate achievements from real data
  const getAchievements = () => {
    const totalSessions = dashboardData?.total_sessions_completed || 0;
    const currentStreak = dashboardData?.current_streak || 0;
    
    return [
      { id: 1, title: "First Session", icon: "🎯", earned: totalSessions >= 1 },
      { id: 2, title: "7-Day Streak", icon: "🔥", earned: currentStreak >= 7 },
      { id: 3, title: "30-Day Streak", icon: "💪", earned: currentStreak >= 30 },
      { id: 4, title: "50 Sessions", icon: "⚡", earned: totalSessions >= 50 },
      { id: 5, title: "Strength Master", icon: "🏋️", earned: false }, // Future: check metrics
      { id: 6, title: "Speed Demon", icon: "⚡", earned: false }, // Future: check metrics
    ];
  };

  // Get display name
  const getDisplayName = () => {
    if (playerData?.name) return playerData.name;
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name} ${userData.last_name}`;
    }
    return userData?.username || 'User';
  };

  // Get initials for avatar
  const getInitials = () => {
    if (playerData?.name) {
      const parts = playerData.name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return playerData.name.substring(0, 2).toUpperCase();
    }
    if (userData?.first_name && userData?.last_name) {
      return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
    }
    return (userData?.username || 'U').substring(0, 2).toUpperCase();
  };

  // Get joined date
  const getJoinedDate = () => {
    if (userData?.date_joined) {
      return new Date(userData.date_joined).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    if (playerData?.created_at) {
      return new Date(playerData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (error && !userData) {
    return (
      <div className="min-h-screen pb-24 noise-texture">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading profile</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadProfileData} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const achievements = getAchievements();
  const displayName = getDisplayName();
  const initials = getInitials();

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
              <AvatarFallback className="bg-[#00FF88]/20 text-[#00FF88] text-3xl font-display">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left space-y-4">
              <div>
                <h2 className="font-display text-2xl text-white mb-1">
                  {displayName}
                </h2>
                {playerData?.archetype && (
                  <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none">
                    {playerData.archetype}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm text-gray-400">
                {userData?.email && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Mail className="w-4 h-4" />
                    {userData.email}
                  </div>
                )}
                {playerData?.email && playerData.email !== userData?.email && (
                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <Mail className="w-4 h-4" />
                    {playerData.email}
                  </div>
                )}
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Calendar className="w-4 h-4" />
                  Joined {getJoinedDate()}
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
          
          {recentSessions.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No recent sessions yet</p>
              <p className="text-sm mt-2">Complete your first session to see it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => {
                const sessionDate = new Date(session.date);
                const now = new Date();
                const diffTime = Math.abs(now.getTime() - sessionDate.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                let dateLabel = '';
                if (diffDays === 0) dateLabel = 'Today';
                else if (diffDays === 1) dateLabel = 'Yesterday';
                else if (diffDays < 7) dateLabel = `${diffDays} days ago`;
                else dateLabel = sessionDate.toLocaleDateString();
                
                return (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <div className="font-semibold text-white">{session.title}</div>
                      <div className="text-sm text-gray-400">{dateLabel}</div>
                    </div>
                    <div className="text-sm font-mono-data text-[#00FF88]">
                      {session.duration ? `${session.duration} min` : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Logout Button */}
        <Button
          variant="outline"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? "Logging out..." : "Log Out"}
        </Button>
      </div>
    </div>
  );
}
