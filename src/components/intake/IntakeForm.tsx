import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { intakeApi, playersApi } from "@/lib/api";
import { toast } from "sonner";

interface Player {
  id: number;
  name: string;
  email?: string;
}

const TOTAL_STEPS = 10;

export function IntakeForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingIntake, setExistingIntake] = useState<any>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isCoachMode, setIsCoachMode] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [createNewPlayer, setCreateNewPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");

  const [formData, setFormData] = useState({
    // Step 0: Player Selection (coach only)
    player: null as number | null,
    
    // Step 1: Athlete Profile
    full_name: "",
    age: "",
    height: "",
    weight: "",
    primary_activity: "",
    training_experience: "",
    
    // Step 2: Performance Goals
    primary_focus: "",
    secondary_focus: [] as string[],
    goals_why: "",
    target_timeline: "",
    
    // Step 3: Sport / Activity Context
    sport_or_activity: "",
    position_or_role: "",
    level: "",
    sessions_per_week_sport: "",
    competition_days: "",
    upcoming_events: "",
    
    // Step 4: Training Availability & Environment
    total_training_days_per_week: "",
    preferred_session_length: "",
    where_you_train: [] as string[],
    equipment_access: "",
    
    // Step 5: Physical Benchmarks
    strength_level: "",
    conditioning_level: "",
    speed_explosiveness: "",
    pushups_max: "",
    pullups_max: "",
    squat_approx: "",
    deadlift_approx: "",
    bench_approx: "",
    
    // Step 6: Injury & Movement Screen
    current_pain_injuries: "",
    past_injuries_surgeries: "",
    limited_movements: "",
    areas_needing_care: [] as string[],
    
    // Step 7: Recovery & Lifestyle
    sleep_hours_per_night: "",
    stress_level: "",
    daily_activity_level: "",
    job_school_load: "",
    
    // Step 8: Nutrition Snapshot
    meals_per_day: "",
    protein_intake: "",
    hydration: "",
    willing_nutrition_guidance: false,
    
    // Step 9: Preferences & Mentality
    training_enjoy: "",
    training_dislike: "",
    intensity_preference: "",
    motivation_commitment: "",
    
    // Step 10: Commitment & Notes
    realistic_training_days: "",
    important_notes: "",
  });

  useEffect(() => {
    checkIntakeStatus();
    loadPlayers();
  }, []);

  const checkIntakeStatus = async () => {
    try {
      const status = await intakeApi.checkComplete();
      if (status.has_intake && status.is_complete) {
        // Intake already complete, redirect to dashboard
        navigate("/app");
        return;
      }
      if (status.has_intake && !status.is_complete) {
        // Load existing intake to continue
        try {
          const intake = await intakeApi.getMyIntake();
          setExistingIntake(intake);
          // Populate form with existing data
          Object.keys(intake).forEach((key) => {
            if (key in formData && intake[key] !== null && intake[key] !== undefined) {
              setFormData((prev) => ({ ...prev, [key]: intake[key] }));
            }
          });
        } catch (err) {
          // Intake not found, continue with new form
        }
      }
      // Check if user has multiple players (coach mode)
      const playersList = await playersApi.getAll();
      if (Array.isArray(playersList) && playersList.length > 1) {
        setIsCoachMode(true);
        setCurrentStep(0); // Start with player selection
      }
    } catch (err) {
      console.error("Error checking intake status:", err);
    }
  };

  const loadPlayers = async () => {
    try {
      const data = await playersApi.getAll();
      setPlayers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading players:", err);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckboxChange = (field: string, value: string, checked: boolean) => {
    setFormData((prev) => {
      const current = prev[field as keyof typeof prev] as string[];
      if (checked) {
        return { ...prev, [field]: [...current, value] };
      } else {
        return { ...prev, [field]: current.filter((item) => item !== value) };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      let playerId = selectedPlayerId;
      
      // If coach mode and creating new player
      if (isCoachMode && createNewPlayer && newPlayerName) {
        const newPlayer = await playersApi.create({
          name: newPlayerName,
          email: newPlayerEmail || undefined,
        }) as Player;
        playerId = newPlayer.id;
        setSelectedPlayerId(playerId);
      }
      
      // If not coach mode, get player for current user
      if (!playerId) {
        const status = await intakeApi.checkComplete();
        if (status.player_id) {
          playerId = status.player_id;
        }
      }
      
      if (!playerId) {
        throw new Error("Player ID is required");
      }
      
      // Clean and convert form data for API (same as submit)
      const cleanPayload: any = {
        player: playerId,
        is_complete: false,
        full_name: formData.full_name || null,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        primary_activity: formData.primary_activity || null,
        training_experience: formData.training_experience || null,
        primary_focus: formData.primary_focus || null,
        secondary_focus: formData.secondary_focus || [],
        goals_why: formData.goals_why || null,
        target_timeline: formData.target_timeline || null,
        sport_or_activity: formData.sport_or_activity || null,
        position_or_role: formData.position_or_role || null,
        level: formData.level || null,
        sessions_per_week_sport: formData.sessions_per_week_sport ? parseInt(formData.sessions_per_week_sport) : null,
        competition_days: formData.competition_days || null,
        upcoming_events: formData.upcoming_events || null,
        total_training_days_per_week: formData.total_training_days_per_week ? parseInt(formData.total_training_days_per_week) : null,
        preferred_session_length: formData.preferred_session_length ? parseInt(formData.preferred_session_length.toString()) : null,
        where_you_train: formData.where_you_train || [],
        equipment_access: formData.equipment_access || null,
        strength_level: formData.strength_level || null,
        conditioning_level: formData.conditioning_level || null,
        speed_explosiveness: formData.speed_explosiveness || null,
        pushups_max: formData.pushups_max ? parseInt(formData.pushups_max) : null,
        pullups_max: formData.pullups_max ? parseInt(formData.pullups_max) : null,
        squat_approx: formData.squat_approx ? parseFloat(formData.squat_approx) : null,
        deadlift_approx: formData.deadlift_approx ? parseFloat(formData.deadlift_approx) : null,
        bench_approx: formData.bench_approx ? parseFloat(formData.bench_approx) : null,
        current_pain_injuries: formData.current_pain_injuries || null,
        past_injuries_surgeries: formData.past_injuries_surgeries || null,
        limited_movements: formData.limited_movements || null,
        areas_needing_care: formData.areas_needing_care || [],
        sleep_hours_per_night: formData.sleep_hours_per_night ? parseFloat(formData.sleep_hours_per_night) : null,
        stress_level: formData.stress_level || null,
        daily_activity_level: formData.daily_activity_level || null,
        job_school_load: formData.job_school_load || null,
        meals_per_day: formData.meals_per_day ? parseInt(formData.meals_per_day) : null,
        protein_intake: formData.protein_intake || null,
        hydration: formData.hydration || null,
        willing_nutrition_guidance: formData.willing_nutrition_guidance || false,
        training_enjoy: formData.training_enjoy || null,
        training_dislike: formData.training_dislike || null,
        intensity_preference: formData.intensity_preference || null,
        motivation_commitment: formData.motivation_commitment ? parseInt(formData.motivation_commitment) : null,
        realistic_training_days: formData.realistic_training_days ? parseInt(formData.realistic_training_days) : null,
        important_notes: formData.important_notes || null,
      };
      
      if (existingIntake?.id) {
        await intakeApi.update(existingIntake.id, cleanPayload);
        toast.success("Draft saved");
      } else {
        await intakeApi.create(cleanPayload);
        toast.success("Draft saved");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save draft");
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      let playerId = selectedPlayerId;
      
      // If coach mode and creating new player
      if (isCoachMode && createNewPlayer && newPlayerName) {
        const newPlayer = await playersApi.create({
          name: newPlayerName,
          email: newPlayerEmail || undefined,
        }) as Player;
        playerId = newPlayer.id;
      }
      
      // If not coach mode, get player for current user
      if (!playerId) {
        const status = await intakeApi.checkComplete();
        if (status.player_id) {
          playerId = status.player_id;
        }
      }
      
      if (!playerId) {
        throw new Error("Player ID is required");
      }
      
      // Clean and convert form data for API
      const cleanPayload: any = {
        player: playerId,
        is_complete: true,
        full_name: formData.full_name || null,
        age: formData.age ? parseInt(formData.age) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        primary_activity: formData.primary_activity || null,
        training_experience: formData.training_experience || null,
        primary_focus: formData.primary_focus || null,
        secondary_focus: formData.secondary_focus || [],
        goals_why: formData.goals_why || null,
        target_timeline: formData.target_timeline || null,
        sport_or_activity: formData.sport_or_activity || null,
        position_or_role: formData.position_or_role || null,
        level: formData.level || null,
        sessions_per_week_sport: formData.sessions_per_week_sport ? parseInt(formData.sessions_per_week_sport) : null,
        competition_days: formData.competition_days || null,
        upcoming_events: formData.upcoming_events || null,
        total_training_days_per_week: formData.total_training_days_per_week ? parseInt(formData.total_training_days_per_week) : null,
        preferred_session_length: formData.preferred_session_length ? parseInt(formData.preferred_session_length.toString()) : null,
        where_you_train: formData.where_you_train || [],
        equipment_access: formData.equipment_access || null,
        strength_level: formData.strength_level || null,
        conditioning_level: formData.conditioning_level || null,
        speed_explosiveness: formData.speed_explosiveness || null,
        pushups_max: formData.pushups_max ? parseInt(formData.pushups_max) : null,
        pullups_max: formData.pullups_max ? parseInt(formData.pullups_max) : null,
        squat_approx: formData.squat_approx ? parseFloat(formData.squat_approx) : null,
        deadlift_approx: formData.deadlift_approx ? parseFloat(formData.deadlift_approx) : null,
        bench_approx: formData.bench_approx ? parseFloat(formData.bench_approx) : null,
        current_pain_injuries: formData.current_pain_injuries || null,
        past_injuries_surgeries: formData.past_injuries_surgeries || null,
        limited_movements: formData.limited_movements || null,
        areas_needing_care: formData.areas_needing_care || [],
        sleep_hours_per_night: formData.sleep_hours_per_night ? parseFloat(formData.sleep_hours_per_night) : null,
        stress_level: formData.stress_level || null,
        daily_activity_level: formData.daily_activity_level || null,
        job_school_load: formData.job_school_load || null,
        meals_per_day: formData.meals_per_day ? parseInt(formData.meals_per_day) : null,
        protein_intake: formData.protein_intake || null,
        hydration: formData.hydration || null,
        willing_nutrition_guidance: formData.willing_nutrition_guidance || false,
        training_enjoy: formData.training_enjoy || null,
        training_dislike: formData.training_dislike || null,
        intensity_preference: formData.intensity_preference || null,
        motivation_commitment: formData.motivation_commitment ? parseInt(formData.motivation_commitment) : null,
        realistic_training_days: formData.realistic_training_days ? parseInt(formData.realistic_training_days) : null,
        important_notes: formData.important_notes || null,
      };
      
      if (existingIntake?.id) {
        await intakeApi.update(existingIntake.id, cleanPayload);
      } else {
        await intakeApi.create(cleanPayload);
      }
      
      toast.success("Intake form submitted successfully!");
      navigate("/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit intake form");
      toast.error("Failed to submit intake form");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    // Step 0: Player Selection (coach only)
    if (currentStep === 0 && isCoachMode) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Select Player</h2>
            <p className="text-gray-400">Choose an existing player or create a new one</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 mb-3 block">Select existing player</Label>
              <Select
                value={selectedPlayerId?.toString() || ""}
                onValueChange={(value) => {
                  setSelectedPlayerId(parseInt(value));
                  setCreateNewPlayer(false);
                }}
                disabled={createNewPlayer}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Choose a player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player.id} value={player.id.toString()}>
                      {player.name} {player.email && `(${player.email})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="create-new"
                checked={createNewPlayer}
                onCheckedChange={(checked) => {
                  setCreateNewPlayer(checked as boolean);
                  if (checked) setSelectedPlayerId(null);
                }}
              />
              <Label htmlFor="create-new" className="text-gray-300 cursor-pointer">
                Create new player
              </Label>
            </div>
            
            {createNewPlayer && (
              <div className="space-y-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="space-y-2">
                  <Label htmlFor="new-player-name" className="text-gray-300">Player Name *</Label>
                  <Input
                    id="new-player-name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-player-email" className="text-gray-300">Email (optional)</Label>
                  <Input
                    id="new-player-email"
                    type="email"
                    value={newPlayerEmail}
                    onChange={(e) => setNewPlayerEmail(e.target.value)}
                    className="bg-white/5 border-white/20 text-white"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Step 1: Athlete Profile
    if (currentStep === (isCoachMode ? 1 : 0)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Athlete Profile</h2>
            <p className="text-gray-400">Tell us about yourself</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-gray-300">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => updateFormData("full_name", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-gray-300">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => updateFormData("age", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height" className="text-gray-300">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => updateFormData("height", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="weight" className="text-gray-300">Weight (kg) - Optional</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData("weight", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Primary Activity</Label>
              <Select
                value={formData.primary_activity}
                onValueChange={(value) => updateFormData("primary_activity", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Football">Football</SelectItem>
                  <SelectItem value="Other sport">Other sport</SelectItem>
                  <SelectItem value="Gym">Gym</SelectItem>
                  <SelectItem value="Hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Training Experience</Label>
              <Select
                value={formData.training_experience}
                onValueChange={(value) => updateFormData("training_experience", value)}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      );
    }

    // Step 2: Performance Goals
    if (currentStep === (isCoachMode ? 2 : 1)) {
      const primaryFocusOptions = [
        "Speed & acceleration",
        "Strength & power",
        "Endurance / conditioning",
        "Athletic movement",
        "Muscle gain",
        "Fat loss",
        "Return-to-training",
      ];
      
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Performance Goals</h2>
            <p className="text-gray-400">What are you training for?</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Primary Focus (pick ONE) *</Label>
              <RadioGroup
                value={formData.primary_focus}
                onValueChange={(value) => updateFormData("primary_focus", value)}
              >
                {primaryFocusOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label htmlFor={option} className="text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Secondary Focus (max 2)</Label>
              <div className="space-y-2">
                {primaryFocusOptions.map((option) => {
                  const isChecked = formData.secondary_focus.includes(option);
                  return (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`secondary-${option}`}
                        checked={isChecked}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("secondary_focus", option, checked as boolean)
                        }
                        disabled={
                          !isChecked &&
                          formData.secondary_focus.length >= 2
                        }
                      />
                      <Label htmlFor={`secondary-${option}`} className="text-gray-300 cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="goals_why" className="text-gray-300">Why this matters right now</Label>
              <Textarea
                id="goals_why"
                value={formData.goals_why}
                onChange={(e) => updateFormData("goals_why", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="Tell us why these goals are important..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_timeline" className="text-gray-300">Target Timeline</Label>
              <Input
                id="target_timeline"
                value={formData.target_timeline}
                onChange={(e) => updateFormData("target_timeline", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="e.g., 12 weeks, Season start, Event date"
              />
            </div>
          </div>
        </div>
      );
    }

    // Step 3: Sport / Activity Context
    if (currentStep === (isCoachMode ? 3 : 2)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Sport / Activity Context</h2>
            <p className="text-gray-400">Tell us about your sport or activity</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sport_or_activity" className="text-gray-300">Sport or Activity</Label>
              <Input
                id="sport_or_activity"
                value={formData.sport_or_activity}
                onChange={(e) => updateFormData("sport_or_activity", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="e.g., Football, Rugby, Boxing, Gym only"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position_or_role" className="text-gray-300">Position / Role (if relevant)</Label>
              <Input
                id="position_or_role"
                value={formData.position_or_role}
                onChange={(e) => updateFormData("position_or_role", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Level</Label>
              <RadioGroup
                value={formData.level}
                onValueChange={(value) => updateFormData("level", value)}
              >
                {["Recreational", "League / Club", "Competitive", "Elite"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`level-${option}`} />
                    <Label htmlFor={`level-${option}`} className="text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sessions_per_week_sport" className="text-gray-300">Sessions per week (sport)</Label>
              <Input
                id="sessions_per_week_sport"
                type="number"
                value={formData.sessions_per_week_sport}
                onChange={(e) => updateFormData("sessions_per_week_sport", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competition_days" className="text-gray-300">Competition / Match Days (if any)</Label>
              <Input
                id="competition_days"
                value={formData.competition_days}
                onChange={(e) => updateFormData("competition_days", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                placeholder="e.g., Saturdays, Sundays"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="upcoming_events" className="text-gray-300">Upcoming Events / Trials</Label>
              <Textarea
                id="upcoming_events"
                value={formData.upcoming_events}
                onChange={(e) => updateFormData("upcoming_events", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="List any important dates or events..."
              />
            </div>
          </div>
        </div>
      );
    }

    // Step 4: Training Availability & Environment
    if (currentStep === (isCoachMode ? 4 : 3)) {
      const trainingLocations = ["Gym", "Field / park", "Home", "Mixed"];
      
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Training Availability & Environment</h2>
            <p className="text-gray-400">Where and how often can you train?</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="total_training_days_per_week" className="text-gray-300">Total Training Days per Week</Label>
              <Input
                id="total_training_days_per_week"
                type="number"
                value={formData.total_training_days_per_week}
                onChange={(e) => updateFormData("total_training_days_per_week", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                min="1"
                max="7"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Preferred Session Length</Label>
              <Select
                value={formData.preferred_session_length?.toString()}
                onValueChange={(value) => updateFormData("preferred_session_length", parseInt(value))}
              >
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 mins</SelectItem>
                  <SelectItem value="45">45 mins</SelectItem>
                  <SelectItem value="60">60 mins</SelectItem>
                  <SelectItem value="90">90 mins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Where You Train</Label>
              <div className="space-y-2">
                {trainingLocations.map((location) => (
                  <div key={location} className="flex items-center space-x-2">
                    <Checkbox
                      id={`location-${location}`}
                      checked={formData.where_you_train.includes(location)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("where_you_train", location, checked as boolean)
                      }
                    />
                    <Label htmlFor={`location-${location}`} className="text-gray-300 cursor-pointer">
                      {location}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="equipment_access" className="text-gray-300">Equipment Access</Label>
              <Textarea
                id="equipment_access"
                value={formData.equipment_access}
                onChange={(e) => updateFormData("equipment_access", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="e.g., barbells, dumbbells, kettlebells, bands, sleds, bodyweight, etc."
              />
            </div>
          </div>
        </div>
      );
    }

    // Step 5: Physical Benchmarks
    if (currentStep === (isCoachMode ? 5 : 4)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Physical Benchmarks</h2>
            <p className="text-gray-400">Rough estimates are fine</p>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Strength Level</Label>
                <Select
                  value={formData.strength_level}
                  onValueChange={(value) => updateFormData("strength_level", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Strong">Strong</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Conditioning Level</Label>
                <Select
                  value={formData.conditioning_level}
                  onValueChange={(value) => updateFormData("conditioning_level", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Speed / Explosiveness</Label>
                <Select
                  value={formData.speed_explosiveness}
                  onValueChange={(value) => updateFormData("speed_explosiveness", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pushups_max" className="text-gray-300">Push-ups (max)</Label>
                <Input
                  id="pushups_max"
                  type="number"
                  value={formData.pushups_max}
                  onChange={(e) => updateFormData("pushups_max", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pullups_max" className="text-gray-300">Pull-ups (max)</Label>
                <Input
                  id="pullups_max"
                  type="number"
                  value={formData.pullups_max}
                  onChange={(e) => updateFormData("pullups_max", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="squat_approx" className="text-gray-300">Squat (approx kg)</Label>
                <Input
                  id="squat_approx"
                  type="number"
                  value={formData.squat_approx}
                  onChange={(e) => updateFormData("squat_approx", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadlift_approx" className="text-gray-300">Deadlift (approx kg)</Label>
                <Input
                  id="deadlift_approx"
                  type="number"
                  value={formData.deadlift_approx}
                  onChange={(e) => updateFormData("deadlift_approx", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bench_approx" className="text-gray-300">Bench (approx kg)</Label>
                <Input
                  id="bench_approx"
                  type="number"
                  value={formData.bench_approx}
                  onChange={(e) => updateFormData("bench_approx", e.target.value)}
                  className="bg-white/5 border-white/20 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 6: Injury & Movement Screen
    if (currentStep === (isCoachMode ? 6 : 5)) {
      const areas = ["knees", "ankles", "hips", "back", "shoulders"];
      
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Injury & Movement Screen</h2>
            <p className="text-gray-400">Help us keep you safe</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_pain_injuries" className="text-gray-300">Current Pain or Injuries</Label>
              <Textarea
                id="current_pain_injuries"
                value={formData.current_pain_injuries}
                onChange={(e) => updateFormData("current_pain_injuries", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="Describe any current issues..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="past_injuries_surgeries" className="text-gray-300">Past Injuries or Surgeries</Label>
              <Textarea
                id="past_injuries_surgeries"
                value={formData.past_injuries_surgeries}
                onChange={(e) => updateFormData("past_injuries_surgeries", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="List any previous injuries or surgeries..."
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="limited_movements" className="text-gray-300">Movements That Feel Limited or Painful</Label>
              <Textarea
                id="limited_movements"
                value={formData.limited_movements}
                onChange={(e) => updateFormData("limited_movements", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="e.g., deep squats, overhead movements..."
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Areas Needing Extra Care</Label>
              <div className="space-y-2">
                {areas.map((area) => (
                  <div key={area} className="flex items-center space-x-2">
                    <Checkbox
                      id={`area-${area}`}
                      checked={formData.areas_needing_care.includes(area)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("areas_needing_care", area, checked as boolean)
                      }
                    />
                    <Label htmlFor={`area-${area}`} className="text-gray-300 cursor-pointer capitalize">
                      {area}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 7: Recovery & Lifestyle
    if (currentStep === (isCoachMode ? 7 : 6)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Recovery & Lifestyle</h2>
            <p className="text-gray-400">Understanding your daily life</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sleep_hours_per_night" className="text-gray-300">Sleep (hours/night)</Label>
              <Input
                id="sleep_hours_per_night"
                type="number"
                step="0.5"
                value={formData.sleep_hours_per_night}
                onChange={(e) => updateFormData("sleep_hours_per_night", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                min="0"
                max="24"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Stress Level</Label>
                <Select
                  value={formData.stress_level}
                  onValueChange={(value) => updateFormData("stress_level", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Daily Activity Level</Label>
                <Select
                  value={formData.daily_activity_level}
                  onValueChange={(value) => updateFormData("daily_activity_level", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sedentary">Sedentary</SelectItem>
                    <SelectItem value="Mixed">Mixed</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Job / School Load</Label>
                <Select
                  value={formData.job_school_load}
                  onValueChange={(value) => updateFormData("job_school_load", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Light">Light</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Heavy">Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Step 8: Nutrition Snapshot
    if (currentStep === (isCoachMode ? 8 : 7)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Nutrition Snapshot</h2>
            <p className="text-gray-400">Current nutrition habits</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meals_per_day" className="text-gray-300">Meals per Day</Label>
              <Input
                id="meals_per_day"
                type="number"
                value={formData.meals_per_day}
                onChange={(e) => updateFormData("meals_per_day", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                min="1"
                max="10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Protein Intake</Label>
                <Select
                  value={formData.protein_intake}
                  onValueChange={(value) => updateFormData("protein_intake", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Hydration</Label>
                <Select
                  value={formData.hydration}
                  onValueChange={(value) => updateFormData("hydration", value)}
                >
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Poor">Poor</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Good">Good</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="willing_nutrition_guidance"
                checked={formData.willing_nutrition_guidance}
                onCheckedChange={(checked) => updateFormData("willing_nutrition_guidance", checked as boolean)}
              />
              <Label htmlFor="willing_nutrition_guidance" className="text-gray-300 cursor-pointer">
                Willing to follow simple nutrition guidance
              </Label>
            </div>
          </div>
        </div>
      );
    }

    // Step 9: Preferences & Mentality
    if (currentStep === (isCoachMode ? 9 : 8)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Preferences & Mentality</h2>
            <p className="text-gray-400">What motivates you?</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="training_enjoy" className="text-gray-300">Training You Enjoy</Label>
              <Textarea
                id="training_enjoy"
                value={formData.training_enjoy}
                onChange={(e) => updateFormData("training_enjoy", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="What types of training do you enjoy most?"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="training_dislike" className="text-gray-300">Training You Dislike</Label>
              <Textarea
                id="training_dislike"
                value={formData.training_dislike}
                onChange={(e) => updateFormData("training_dislike", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[100px]"
                placeholder="What types of training do you dislike or want to avoid?"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-300">Intensity Preference</Label>
              <RadioGroup
                value={formData.intensity_preference}
                onValueChange={(value) => updateFormData("intensity_preference", value)}
              >
                {["Hard & challenging", "Structured & controlled", "Flexible"].map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`intensity-${option}`} />
                    <Label htmlFor={`intensity-${option}`} className="text-gray-300 cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="motivation_commitment" className="text-gray-300">Motivation / Commitment (1-10)</Label>
              <Input
                id="motivation_commitment"
                type="number"
                value={formData.motivation_commitment}
                onChange={(e) => updateFormData("motivation_commitment", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                min="1"
                max="10"
              />
            </div>
          </div>
        </div>
      );
    }

    // Step 10: Commitment & Notes
    if (currentStep === (isCoachMode ? 10 : 9)) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-2xl text-white mb-2">Commitment & Notes</h2>
            <p className="text-gray-400">Final details</p>
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="realistic_training_days" className="text-gray-300">Realistic Training Days You Can Stick To</Label>
              <Input
                id="realistic_training_days"
                type="number"
                value={formData.realistic_training_days}
                onChange={(e) => updateFormData("realistic_training_days", e.target.value)}
                className="bg-white/5 border-white/20 text-white"
                min="1"
                max="7"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="important_notes" className="text-gray-300">Anything Important Your Coach Should Know?</Label>
              <Textarea
                id="important_notes"
                value={formData.important_notes}
                onChange={(e) => updateFormData("important_notes", e.target.value)}
                className="bg-white/5 border-white/20 text-white min-h-[150px]"
                placeholder="Any additional information, concerns, or notes..."
              />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const totalStepsWithPlayer = isCoachMode ? TOTAL_STEPS + 1 : TOTAL_STEPS;
  const progress = ((currentStep + 1) / totalStepsWithPlayer) * 100;

  return (
    <div className="min-h-screen pb-24 noise-texture">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/app")}
          className="text-[#00FF88] hover:text-[#00FF88] hover:bg-[#00FF88]/10 mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="glassy-panel border-white/10 p-8">
          <div className="mb-8">
            <h1 className="font-display text-4xl text-white mb-2">
              Athlete & Performance Intake
            </h1>
            <p className="text-gray-400 mb-4">
              Step {isCoachMode && currentStep === 0 ? '0 (Player Selection)' : currentStep - (isCoachMode ? 0 : 0) + 1} of {isCoachMode ? TOTAL_STEPS + 1 : TOTAL_STEPS}
            </p>
            <Progress value={progress} className="h-2" />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 text-red-400 text-sm mb-6">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="mb-8">{renderStepContent()}</div>

          <div className="flex items-center justify-between pt-6 border-t border-white/10">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSaving}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>

              {currentStep === (isCoachMode ? TOTAL_STEPS - 1 : TOTAL_STEPS - 2) ? (
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Submit
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  className="bg-[#00FF88] hover:bg-[#00FF88]/90 text-[#0F1419] font-semibold"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

