from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Player, Session, Metric, Leaderboard, PlayerIntake, ProgrammeTemplate, PlayerProgramme


class UserSerializer(serializers.ModelSerializer):
    """Serializer for user information"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'date_joined']


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model"""
    class Meta:
        model = Player
        fields = [
            'id', 'name', 'email', 'position', 'team', 
            'archetype', 'primary_goal', 'training_level', 
            'training_days_per_week', 'injuries', 'sport', 'equipment_access',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class SessionSerializer(serializers.ModelSerializer):
    """Serializer for Session model"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    programme_id = serializers.IntegerField(source='programme.id', read_only=True, allow_null=True)
    programme_title = serializers.CharField(source='programme.title', read_only=True, allow_null=True)

    class Meta:
        model = Session
        fields = [
            'id', 'title', 'type', 'date', 'duration', 
            'player', 'player_name', 'programme', 'programme_id', 'programme_title',
            'completed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MetricSerializer(serializers.ModelSerializer):
    """Serializer for Metric model"""
    class Meta:
        model = Metric
        fields = ['id', 'player', 'metric_type', 'value', 'unit', 'date', 'notes']
        read_only_fields = ['date']


class LeaderboardSerializer(serializers.ModelSerializer):
    """Serializer for Leaderboard model"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    player_id = serializers.IntegerField(source='player.id', read_only=True)

    class Meta:
        model = Leaderboard
        fields = ['id', 'player_id', 'player_name', 'leaderboard_type', 'value', 'unit', 'rank', 'calculated_at']


class PlayerIntakeSerializer(serializers.ModelSerializer):
    """Serializer for PlayerIntake model"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    player_id = serializers.IntegerField(source='player.id', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PlayerIntake
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'created_by']


class ProgrammeTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ProgrammeTemplate model"""
    class Meta:
        model = ProgrammeTemplate
        fields = ['id', 'name', 'description', 'primary_focus', 'difficulty', 'sport', 'duration_weeks', 'structure', 'created_at']
        read_only_fields = ['created_at']


class PlayerProgrammeSerializer(serializers.ModelSerializer):
    """Serializer for PlayerProgramme model"""
    player_name = serializers.CharField(source='player.name', read_only=True)
    player_id = serializers.IntegerField(source='player.id', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    template_id = serializers.IntegerField(source='template.id', read_only=True, allow_null=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True, allow_null=True)

    class Meta:
        model = PlayerProgramme
        fields = [
            'id', 'player', 'player_id', 'player_name',
            'template', 'template_id', 'template_name',
            'title', 'start_date', 'status', 'plan',
            'warnings', 'substitutions_applied',
            'coach_approved_at', 'athlete_approved_at',
            'created_by', 'created_by_username', 'created_at'
        ]
        read_only_fields = ['created_at', 'created_by']

