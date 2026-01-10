import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Users, Plus, Search, User, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { playersApi } from "@/lib/api";
import { toast } from "sonner";

interface Player {
  id: number;
  name: string;
  email?: string;
  position?: string;
  team?: string;
  status?: string;
}

export function Players() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    position: "",
    team: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await playersApi.getAll();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load players");
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await playersApi.create(formData);
      toast.success("Player added successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", email: "", position: "", team: "" });
      loadPlayers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to add player");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlayers = players.filter((player) =>
    player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    player.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen pb-24 noise-texture flex items-center justify-center">
        <Spinner className="w-8 h-8 text-[#00FF88]" />
      </div>
    );
  }

  if (error && players.length === 0) {
    return (
      <div className="min-h-screen pb-24 noise-texture">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="glassy-panel border-white/10 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="font-display text-xl text-white mb-2">Error loading players</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={loadPlayers} className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
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
              Players
            </h1>
            <p className="text-gray-400">Manage your training roster</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]">
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </DialogTrigger>
            <DialogContent className="glassy-panel border-white/10">
              <DialogHeader>
                <DialogTitle className="text-white">Add New Player</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-gray-300">Position</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="team" className="text-gray-300">Team</Label>
                  <Input
                    id="team"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419]"
                >
                  {isSubmitting ? "Adding..." : "Add Player"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/5 border-white/20 text-white"
            />
          </div>
        </div>

        {/* Players List */}
        {filteredPlayers.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Users />
              </EmptyMedia>
              <EmptyTitle>No players found</EmptyTitle>
              <EmptyDescription>
                {searchQuery ? "Try adjusting your search" : "Get started by adding your first player"}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <Card
                key={player.id}
                className="glassy-panel border-white/10 p-5 hover:scale-[1.01] transition-all cursor-pointer group"
                onClick={() => navigate(`/app/players/${player.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#00FF88]/10 flex items-center justify-center group-hover:bg-[#00FF88]/20 transition-colors">
                    <User className="w-6 h-6 text-[#00FF88]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1 truncate">
                      {player.name}
                    </h3>
                    {player.email && (
                      <p className="text-sm text-gray-400 truncate">{player.email}</p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {player.position && (
                        <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none text-xs">
                          {player.position}
                        </Badge>
                      )}
                      {player.team && (
                        <Badge className="bg-white/10 text-gray-300 border-none text-xs">
                          {player.team}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

