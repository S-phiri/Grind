from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    """Represents a player/athlete in the training system"""
    name = models.CharField(max_length=200)
    email = models.EmailField(blank=True, null=True)
    position = models.CharField(max_length=100, blank=True, null=True)
    team = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Programme profile fields
    archetype = models.CharField(max_length=200, blank=True, help_text="Human-readable label like 'Explosive Speed Focus', 'Strength & Power Focus'")
    primary_goal = models.CharField(max_length=50, blank=True, choices=[
        ('base', 'Base'),
        ('speed', 'Speed'),
        ('power', 'Power'),
        ('strength', 'Strength'),
        ('hypertrophy', 'Hypertrophy'),
        ('conditioning', 'Conditioning'),
    ])
    training_level = models.CharField(max_length=50, blank=True, choices=[
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ])
    training_days_per_week = models.IntegerField(null=True, blank=True)
    injuries = models.JSONField(default=list, blank=True, help_text="Array of {area, severity, notes}")
    sport = models.CharField(max_length=100, blank=True, help_text="e.g., soccer, boxing, rugby, gym")
    equipment_access = models.CharField(max_length=50, blank=True, choices=[
        ('gym', 'Gym'),
        ('home', 'Home'),
        ('none', 'None'),
        ('limited', 'Limited'),
    ])

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class Session(models.Model):
    """Represents a training session"""
    SESSION_TYPES = [
        ('Gym', 'Gym'),
        ('Field', 'Field'),
        ('Mobility', 'Mobility'),
        ('Conditioning', 'Conditioning'),
        ('Home', 'Home'),
    ]

    title = models.CharField(max_length=200)
    type = models.CharField(max_length=50, choices=SESSION_TYPES, blank=True, null=True)
    date = models.DateTimeField()
    duration = models.IntegerField(help_text="Duration in minutes", blank=True, null=True)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='sessions', blank=True, null=True)
    programme = models.ForeignKey('PlayerProgramme', on_delete=models.SET_NULL, null=True, blank=True, related_name='sessions')
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.title} - {self.date.strftime('%Y-%m-%d')}"


class Metric(models.Model):
    """Represents a performance metric for a player"""
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='metrics')
    metric_type = models.CharField(max_length=200, help_text="e.g., Sprint 10m, Bench Press, Body Weight")
    value = models.FloatField()
    unit = models.CharField(max_length=50, blank=True, null=True, help_text="e.g., kg, s, cm")
    date = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.player.name} - {self.metric_type}: {self.value} {self.unit or ''}"


class Leaderboard(models.Model):
    """Pre-calculated leaderboard entries for performance"""
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='leaderboard_entries')
    leaderboard_type = models.CharField(max_length=50, choices=[
        ('speed', 'Speed'),
        ('strength', 'Strength'),
        ('compliance', 'Compliance'),
    ])
    value = models.FloatField()
    rank = models.IntegerField()
    calculated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['player', 'leaderboard_type']
        ordering = ['leaderboard_type', 'rank']

    def __str__(self):
        return f"{self.leaderboard_type} - {self.player.name}: Rank {self.rank}"


class PlayerIntake(models.Model):
    """Comprehensive athlete intake and performance assessment"""
    player = models.OneToOneField(Player, on_delete=models.CASCADE, related_name='intake')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='intakes_created')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_complete = models.BooleanField(default=False)
    
    # Athlete Profile
    full_name = models.CharField(max_length=200)
    age = models.IntegerField(blank=True, null=True)
    height = models.FloatField(blank=True, null=True, help_text="Height in cm")
    weight = models.FloatField(blank=True, null=True, help_text="Weight in kg")
    primary_activity = models.CharField(max_length=50, choices=[
        ('Football', 'Football'),
        ('Other sport', 'Other sport'),
        ('Gym', 'Gym'),
        ('Hybrid', 'Hybrid'),
    ], blank=True, null=True)
    training_experience = models.CharField(max_length=50, choices=[
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ], blank=True, null=True)
    
    # Performance Goals
    primary_focus = models.CharField(max_length=100, choices=[
        ('Speed & acceleration', 'Speed & acceleration'),
        ('Strength & power', 'Strength & power'),
        ('Endurance / conditioning', 'Endurance / conditioning'),
        ('Athletic movement', 'Athletic movement'),
        ('Muscle gain', 'Muscle gain'),
        ('Fat loss', 'Fat loss'),
        ('Return-to-training', 'Return-to-training'),
    ], blank=True, null=True)
    secondary_focus = models.JSONField(default=list, blank=True, help_text="Array of max 2 secondary focuses")
    goals_why = models.TextField(blank=True, null=True)
    target_timeline = models.CharField(max_length=200, blank=True, null=True)
    
    # Sport / Activity Context
    sport_or_activity = models.CharField(max_length=200, blank=True, null=True)
    position_or_role = models.CharField(max_length=200, blank=True, null=True)
    level = models.CharField(max_length=50, choices=[
        ('Recreational', 'Recreational'),
        ('League / Club', 'League / Club'),
        ('Competitive', 'Competitive'),
        ('Elite', 'Elite'),
    ], blank=True, null=True)
    sessions_per_week_sport = models.IntegerField(blank=True, null=True)
    competition_days = models.CharField(max_length=200, blank=True, null=True)
    upcoming_events = models.TextField(blank=True, null=True)
    
    # Training Availability & Environment
    total_training_days_per_week = models.IntegerField(blank=True, null=True)
    preferred_session_length = models.IntegerField(choices=[
        (30, '30 mins'),
        (45, '45 mins'),
        (60, '60 mins'),
        (90, '90 mins'),
    ], blank=True, null=True)
    where_you_train = models.JSONField(default=list, blank=True, help_text="Array: Gym, Field, Home, Mixed")
    equipment_access = models.TextField(blank=True, null=True)
    
    # Physical Benchmarks
    strength_level = models.CharField(max_length=50, choices=[
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Strong', 'Strong'),
    ], blank=True, null=True)
    conditioning_level = models.CharField(max_length=50, choices=[
        ('Poor', 'Poor'),
        ('Average', 'Average'),
        ('Good', 'Good'),
    ], blank=True, null=True)
    speed_explosiveness = models.CharField(max_length=50, choices=[
        ('Low', 'Low'),
        ('Average', 'Average'),
        ('High', 'High'),
    ], blank=True, null=True)
    pushups_max = models.IntegerField(blank=True, null=True)
    pullups_max = models.IntegerField(blank=True, null=True)
    squat_approx = models.FloatField(blank=True, null=True)
    deadlift_approx = models.FloatField(blank=True, null=True)
    bench_approx = models.FloatField(blank=True, null=True)
    
    # Injury & Movement Screen
    current_pain_injuries = models.TextField(blank=True, null=True)
    past_injuries_surgeries = models.TextField(blank=True, null=True)
    limited_movements = models.TextField(blank=True, null=True)
    areas_needing_care = models.JSONField(default=list, blank=True, help_text="Array: knees, ankles, hips, back, shoulders")
    
    # Recovery & Lifestyle
    sleep_hours_per_night = models.FloatField(blank=True, null=True)
    stress_level = models.CharField(max_length=50, choices=[
        ('Low', 'Low'),
        ('Moderate', 'Moderate'),
        ('High', 'High'),
    ], blank=True, null=True)
    daily_activity_level = models.CharField(max_length=50, choices=[
        ('Sedentary', 'Sedentary'),
        ('Mixed', 'Mixed'),
        ('Active', 'Active'),
    ], blank=True, null=True)
    job_school_load = models.CharField(max_length=50, choices=[
        ('Light', 'Light'),
        ('Moderate', 'Moderate'),
        ('Heavy', 'Heavy'),
    ], blank=True, null=True)
    
    # Nutrition Snapshot
    meals_per_day = models.IntegerField(blank=True, null=True)
    protein_intake = models.CharField(max_length=50, choices=[
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
    ], blank=True, null=True)
    hydration = models.CharField(max_length=50, choices=[
        ('Poor', 'Poor'),
        ('Average', 'Average'),
        ('Good', 'Good'),
    ], blank=True, null=True)
    willing_nutrition_guidance = models.BooleanField(default=False)
    
    # Preferences & Mentality
    training_enjoy = models.TextField(blank=True, null=True)
    training_dislike = models.TextField(blank=True, null=True)
    intensity_preference = models.CharField(max_length=50, choices=[
        ('Hard & challenging', 'Hard & challenging'),
        ('Structured & controlled', 'Structured & controlled'),
        ('Flexible', 'Flexible'),
    ], blank=True, null=True)
    motivation_commitment = models.IntegerField(blank=True, null=True, help_text="1-10 scale")
    
    # Commitment & Notes
    realistic_training_days = models.IntegerField(blank=True, null=True)
    important_notes = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Intake for {self.player.name}"


class ProgrammeTemplate(models.Model):
    """Need-based programme templates (not sport-named)"""
    PRIMARY_FOCUS_CHOICES = [
        ('base', 'Base'),
        ('speed', 'Speed'),
        ('power', 'Power'),
        ('strength', 'Strength'),
        ('hypertrophy', 'Hypertrophy'),
        ('conditioning', 'Conditioning'),
    ]
    
    DIFFICULTY_CHOICES = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    name = models.CharField(max_length=200)  # e.g., "Athletic Base – Foundation"
    description = models.TextField(blank=True)
    primary_focus = models.CharField(max_length=50, choices=PRIMARY_FOCUS_CHOICES)
    difficulty = models.CharField(max_length=50, choices=DIFFICULTY_CHOICES)
    sport = models.CharField(max_length=100, blank=True, null=True, help_text="Optional weak preference hint only")
    duration_weeks = models.IntegerField(default=4)
    structure = models.JSONField(help_text="Must include 'meta' + 'weeks' sections")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['primary_focus', 'difficulty', 'name']

    def __str__(self):
        return self.name


class PlayerProgramme(models.Model):
    """Player-specific programme instance"""
    STATUS_CHOICES = [
        ('DRAFT', 'Draft'),
        ('PENDING_COACH', 'Pending Coach Approval'),
        ('PENDING_ATHLETE', 'Pending Athlete Approval'),
        ('ACTIVE', 'Active'),
        ('PAUSED', 'Paused'),
        ('COMPLETED', 'Completed'),
    ]
    
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='programmes')
    template = models.ForeignKey(ProgrammeTemplate, on_delete=models.SET_NULL, null=True, blank=True)
    title = models.CharField(max_length=200)
    start_date = models.DateField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='DRAFT')
    plan = models.JSONField(help_text="Final plan after modifiers (same structure as template.structure)")
    warnings = models.JSONField(default=list, blank=True)
    substitutions_applied = models.JSONField(default=list, blank=True)
    coach_approved_at = models.DateTimeField(null=True, blank=True)
    athlete_approved_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.player.name} ({self.status})"
