import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, CheckCircle2, X, Plus, Calendar, AlertTriangle } from "lucide-react";
import { programmesApi } from "@/lib/api";
import { toast } from "sonner";

interface SuggestedProgramme {
  id: number;
  name: string;
  description: string;
  primary_focus: string;
  difficulty: string;
  duration_weeks: number;
  structure: any;
}

interface PlayerProgramme {
  id: number;
  title: string;
  start_date: string;
  status: string;
  plan: any;
  warnings: string[];
  substitutions_applied: any[];
  coach_approved_at: string | null;
  athlete_approved_at: string | null;
  total_sessions?: number;
  completed_sessions?: number;
  progress_percent?: number;
}

export function PlayerProgramme() {
  const { id } = useParams<{ id: string }>();
  const [step, setStep] = useState<'intake' | 'select' | 'review' | 'approval'>('intake');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Intake form state
  const [intakeData, setIntakeData] = useState({
    sport: "",
    primary_goal: "",
    training_level: "",
    training_days_per_week: "",
    equipment_access: "",
    injuries: [] as Array<{area: string; severity: string; notes: string}>,
  });
  
  // Intake response
  const [archetype, setArchetype] = useState<string | null>(null);
  const [suggestedProgrammes, setSuggestedProgrammes] = useState<SuggestedProgramme[]>([]);
  
  // Programme creation
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState("");
  const [edits, setEdits] = useState({
    focus: "",
    remove_day: "",
    low_impact_week1: false,
  });
  const [draftProgramme, setDraftProgramme] = useState<PlayerProgramme | null>(null);
  
  // Existing programmes
  const [programmes, setProgrammes] = useState<PlayerProgramme[]>([]);

  useEffect(() => {
    if (id && step === 'approval') {
      loadProgrammes();
    }
  }, [id, step]);

  useEffect(() => {
    if (id) {
      loadProgrammes(); // Load programmes when component mounts or id changes
    }
  }, [id]);

  const loadProgrammes = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await programmesApi.getPlayerProgrammes(parseInt(id));
      setProgrammes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading programmes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        sport: intakeData.sport,
        primary_goal: intakeData.primary_goal,
        training_level: intakeData.training_level,
        training_days_per_week: parseInt(intakeData.training_days_per_week),
        equipment_access: intakeData.equipment_access,
        injuries: intakeData.injuries,
      };
      
      const response = await programmesApi.submitIntake(parseInt(id), payload);
      setArchetype(response.archetype);
      setSuggestedProgrammes(response.suggested_programmes);
      setStep('select');
      toast.success("Intake submitted successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit intake");
      toast.error("Failed to submit intake");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplateId(templateId);
    setStep('review');
  };

  const handleCreateDraft = async () => {
    if (!id || !selectedTemplateId || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const payload = {
        programme_template_id: selectedTemplateId,
        start_date: startDate,
        edits: {
          focus: edits.focus || undefined,
          remove_day: edits.remove_day || undefined,
          low_impact_week1: edits.low_impact_week1,
        },
      };
      
      const programme = await programmesApi.createDraft(parseInt(id), payload);
      setDraftProgramme(programme);
      setStep('approval');
      toast.success("Programme draft created!");
      loadProgrammes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create draft");
      toast.error("Failed to create draft");
    } finally {
      setLoading(false);
    }
  };

  const handleCoachApprove = async (programmeId: number) => {
    try {
      setLoading(true);
      await programmesApi.coachApprove(programmeId);
      toast.success("Programme approved by coach!");
      loadProgrammes();
    } catch (err) {
      toast.error("Failed to approve programme");
    } finally {
      setLoading(false);
    }
  };

  const handleAthleteApprove = async (programmeId: number) => {
    try {
      setLoading(true);
      await programmesApi.athleteApprove(programmeId);
      toast.success("Programme approved!");
      loadProgrammes();
    } catch (err) {
      toast.error("Failed to approve programme");
    } finally {
      setLoading(false);
    }
  };

  const addInjury = () => {
    setIntakeData({
      ...intakeData,
      injuries: [...intakeData.injuries, { area: "", severity: "", notes: "" }],
    });
  };

  const updateInjury = (index: number, field: string, value: string) => {
    const updated = [...intakeData.injuries];
    updated[index] = { ...updated[index], [field]: value };
    setIntakeData({ ...intakeData, injuries: updated });
  };

  const removeInjury = (index: number) => {
    setIntakeData({
      ...intakeData,
      injuries: intakeData.injuries.filter((_, i) => i !== index),
    });
  };

  const selectedTemplate = suggestedProgrammes.find(t => t.id === selectedTemplateId);
  const week1Plan = selectedTemplate?.structure?.weeks?.[0];

  if (step === 'intake') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl text-white mb-2">Programme Intake</h2>
          <p className="text-gray-400">Tell us about your training goals and availability</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form onSubmit={handleIntakeSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sport" className="text-gray-300">Sport</Label>
            <Select
              value={intakeData.sport}
              onValueChange={(value) => setIntakeData({ ...intakeData, sport: value })}
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select sport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="soccer">Soccer</SelectItem>
                <SelectItem value="boxing">Boxing</SelectItem>
                <SelectItem value="rugby">Rugby</SelectItem>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="primary_goal" className="text-gray-300">Primary Goal *</Label>
            <Select
              value={intakeData.primary_goal}
              onValueChange={(value) => setIntakeData({ ...intakeData, primary_goal: value })}
              required
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select primary goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="base">Base</SelectItem>
                <SelectItem value="speed">Speed</SelectItem>
                <SelectItem value="power">Power</SelectItem>
                <SelectItem value="strength">Strength</SelectItem>
                <SelectItem value="hypertrophy">Hypertrophy</SelectItem>
                <SelectItem value="conditioning">Conditioning</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training_level" className="text-gray-300">Training Level *</Label>
            <Select
              value={intakeData.training_level}
              onValueChange={(value) => setIntakeData({ ...intakeData, training_level: value })}
              required
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="training_days_per_week" className="text-gray-300">Days per Week *</Label>
            <Input
              id="training_days_per_week"
              type="number"
              min="1"
              max="7"
              value={intakeData.training_days_per_week}
              onChange={(e) => setIntakeData({ ...intakeData, training_days_per_week: e.target.value })}
              className="bg-white/5 border-white/20 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="equipment_access" className="text-gray-300">Equipment Access *</Label>
            <Select
              value={intakeData.equipment_access}
              onValueChange={(value) => setIntakeData({ ...intakeData, equipment_access: value })}
              required
            >
              <SelectTrigger className="bg-white/5 border-white/20 text-white">
                <SelectValue placeholder="Select equipment access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gym">Gym</SelectItem>
                <SelectItem value="home">Home</SelectItem>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-gray-300">Injuries (optional)</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addInjury}
                className="border-white/20 text-white hover:bg-white/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Injury
              </Button>
            </div>
            {intakeData.injuries.map((injury, index) => (
              <div key={index} className="flex gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                <Input
                  placeholder="Area (e.g., shoulder)"
                  value={injury.area}
                  onChange={(e) => updateInjury(index, 'area', e.target.value)}
                  className="bg-white/5 border-white/20 text-white flex-1"
                />
                <Input
                  placeholder="Severity"
                  value={injury.severity}
                  onChange={(e) => updateInjury(index, 'severity', e.target.value)}
                  className="bg-white/5 border-white/20 text-white flex-1"
                />
                <Input
                  placeholder="Notes"
                  value={injury.notes}
                  onChange={(e) => updateInjury(index, 'notes', e.target.value)}
                  className="bg-white/5 border-white/20 text-white flex-1"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeInjury(index)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Intake"
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (step === 'select') {
    return (
      <div className="space-y-6">
        {archetype && (
          <div className="bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
              <div>
                <p className="text-sm text-gray-400">Your Archetype</p>
                <p className="font-semibold text-white text-lg">{archetype}</p>
              </div>
            </div>
          </div>
        )}

        <div>
          <h2 className="font-display text-2xl text-white mb-2">Suggested Programmes</h2>
          <p className="text-gray-400">Choose a programme template to customize</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestedProgrammes.map((programme) => (
            <Card
              key={programme.id}
              className="glassy-panel border-white/10 p-5 hover:scale-[1.02] transition-all cursor-pointer"
              onClick={() => handleTemplateSelect(programme.id)}
            >
              <h3 className="font-semibold text-white mb-2">{programme.name}</h3>
              <p className="text-sm text-gray-400 mb-3">{programme.description}</p>
              <div className="flex gap-2">
                <Badge className="bg-[#00FF88]/20 text-[#00FF88] border-none capitalize">
                  {programme.primary_focus}
                </Badge>
                <Badge className="bg-white/10 text-gray-300 border-none capitalize">
                  {programme.difficulty}
                </Badge>
                <Badge className="bg-white/10 text-gray-300 border-none">
                  {programme.duration_weeks} weeks
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'review') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-2xl text-white mb-2">Review & Customize</h2>
          <p className="text-gray-400">Review the programme and make adjustments</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="start_date" className="text-gray-300">Start Date *</Label>
            <Input
              id="start_date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-white/5 border-white/20 text-white"
              required
            />
          </div>

          {week1Plan && (
            <Card className="glassy-panel border-white/10 p-5">
              <h3 className="font-semibold text-white mb-4">Week 1 Preview</h3>
              <div className="space-y-4">
                {week1Plan.days?.map((day: any, dayIndex: number) => (
                  <div key={dayIndex} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-[#00FF88]" />
                      <span className="font-semibold text-white capitalize">{day.day}</span>
                      <Badge className="bg-white/10 text-gray-300 border-none text-xs">
                        {day.type} • {day.duration} min
                      </Badge>
                    </div>
                    <div className="space-y-2 ml-6">
                      {day.exercises?.map((ex: any, exIndex: number) => (
                        <div key={exIndex} className="text-sm text-gray-400">
                          {ex.name} - {ex.sets} sets × {ex.reps} ({ex.rest} rest)
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="glassy-panel border-white/10 p-5">
            <h3 className="font-semibold text-white mb-4">Simple Edits</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Focus Adjustment (optional)</Label>
                <Select
                  value={edits.focus}
                  onValueChange={(value) => setEdits({ ...edits, focus: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Keep default" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="speed">Speed</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="endurance">Endurance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300">Remove Day (optional)</Label>
                <Select
                  value={edits.remove_day}
                  onValueChange={(value) => setEdits({ ...edits, remove_day: value })}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Keep all days" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="low_impact"
                  checked={edits.low_impact_week1}
                  onChange={(e) => setEdits({ ...edits, low_impact_week1: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5"
                />
                <Label htmlFor="low_impact" className="text-gray-300 cursor-pointer">
                  Low impact week 1
                </Label>
              </div>
            </div>
          </Card>

          <Button
            onClick={handleCreateDraft}
            disabled={loading || !startDate}
            className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
          >
            {loading ? (
              <>
                <Spinner className="w-4 h-4 mr-2" />
                Creating Draft...
              </>
            ) : (
              "Create Draft Programme"
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Approval step
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white mb-2">Programme Approvals</h2>
        <p className="text-gray-400">Review and approve programmes</p>
      </div>

      {loading && programmes.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="w-8 h-8 text-[#00FF88]" />
        </div>
      ) : programmes.length === 0 ? (
        <Card className="glassy-panel border-white/10 p-8 text-center">
          <p className="text-gray-400">No programmes yet. Create one from the intake form.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {programmes.map((programme) => (
            <Card key={programme.id} className="glassy-panel border-white/10 p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-white mb-1">{programme.title}</h3>
                  <p className="text-sm text-gray-400">
                    Starts: {new Date(programme.start_date).toLocaleDateString()}
                  </p>
                </div>
                <Badge
                  className={
                    programme.status === 'ACTIVE'
                      ? 'bg-[#00FF88]/20 text-[#00FF88] border-none'
                      : programme.status === 'PENDING_COACH'
                      ? 'bg-yellow-500/20 text-yellow-400 border-none'
                      : programme.status === 'PENDING_ATHLETE'
                      ? 'bg-blue-500/20 text-blue-400 border-none'
                      : 'bg-white/10 text-gray-300 border-none'
                  }
                >
                  {programme.status.replace('_', ' ')}
                </Badge>
              </div>

              {programme.warnings && programme.warnings.length > 0 && (
                <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-yellow-400 mb-1">Warnings</p>
                      <ul className="text-xs text-yellow-300 space-y-1">
                        {programme.warnings.map((warning, idx) => (
                          <li key={idx}>• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {programme.status === 'PENDING_COACH' && (
                <Button
                  onClick={() => handleCoachApprove(programme.id)}
                  disabled={loading}
                  className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] mb-2"
                >
                  {loading ? "Approving..." : "Coach Approve"}
                </Button>
              )}

              {programme.status === 'PENDING_ATHLETE' && (
                <Button
                  onClick={() => handleAthleteApprove(programme.id)}
                  disabled={loading}
                  className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] mb-2"
                >
                  {loading ? "Approving..." : "Athlete Approve"}
                </Button>
              )}

              {programme.status === 'ACTIVE' && (
                <div className="space-y-3">
                  <div className="bg-[#00FF88]/10 border border-[#00FF88]/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                      <p className="text-sm text-white">
                        Programme starts on {new Date(programme.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {(!programme.total_sessions || programme.total_sessions === 0) && (
                    <Button
                      onClick={async () => {
                        try {
                          setLoading(true);
                          const response = await programmesApi.commence(programme.id);
                          toast.success(`Programme commenced! ${response.sessions_created} sessions created.`);
                          loadProgrammes();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Failed to commence programme");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading}
                      className="w-full bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
                    >
                      {loading ? (
                        <>
                          <Spinner className="w-4 h-4 mr-2" />
                          Commencing...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Commence Programme
                        </>
                      )}
                    </Button>
                  )}
                  {programme.total_sessions && programme.total_sessions > 0 && (
                    <div className="text-sm text-gray-400">
                      {programme.completed_sessions || 0} of {programme.total_sessions} sessions completed
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

