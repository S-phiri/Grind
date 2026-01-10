import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Calendar, Plus, Dumbbell, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sessionsApi, playersApi } from "@/lib/api";
import { toast } from "sonner";

interface Session {
  id: number;
  title: string;
  type?: string;
  date: string;
  duration?: number;
  player?: number;
  player_name?: string;
  completed?: boolean;
}

interface Player {
  id: number;
  name: string;
}

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    date: "",
    duration: "",
    player: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadSessions();
    loadPlayers();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await sessionsApi.getAll("current");
      setSessions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sessions");
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await playersApi.getAll();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load players for form", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await sessionsApi.create({
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
        player: formData.player ? parseInt(formData.player) : undefined,
      });
      toast.success("Session created successfully");
      setIsDialogOpen(false);
      setFormData({ title: "", type: "", date: "", duration: "", player: "" });
      loadSessions();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create session");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (error && sessions.length === 0) {
    return (
      <div className="min-h-screen pb-24 noise-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading sessions</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadSessions} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
              Try Again
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl text-white mb-2">
              Sessions
            </h1>
            <p className="text-gray-400">This week's training sessions</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </Button>
            </DialogTrigger>
            <DialogContent className="glassy-panel border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-300">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-gray-300">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gym">Gym</SelectItem>
                      <SelectItem value="Field">Field</SelectItem>
                      <SelectItem value="Mobility">Mobility</SelectItem>
                      <SelectItem value="Conditioning">Conditioning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-gray-300">Date *</Label>
                  <Input
                    id="date"
                    type="datetime-local"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="player" className="text-gray-300">Player</Label>
                  <Select
                    value={formData.player}
                    onValueChange={(value) => setFormData({ ...formData, player: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select player" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]"
                >
                  {isSubmitting ? "Creating..." : "Create Session"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Calendar />
              </EmptyMedia>
              <EmptyTitle>No sessions this week</EmptyTitle>
              <EmptyDescription>
                Create a new session to get started
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className="glassy-panel border-white/10 p-5 hover:scale-[1.01] transition-all cursor-pointer group"
                onClick={() => navigate(`/app/session/${session.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center group-hover:bg-[#00FF88]/20 transition-colors">
                      <Dumbbell className="w-6 h-6 text-[#00FF88]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span>{new Date(session.date).toLocaleDateString()}</span>
                        {session.duration && (
                          <>
                            <span>•</span>
                            <span>{session.duration} min</span>
                          </>
                        )}
                        {session.player_name && (
                          <>
                            <span>•</span>
                            <span>{session.player_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {session.type && (
                    <Badge className="bg-[#FF6B35]/20 text-[#FF6B35] border-none">
                      {session.type}
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

