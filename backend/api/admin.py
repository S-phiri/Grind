from django.contrib import admin
from .models import Player, Session, Metric, Leaderboard


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'position', 'team', 'created_at']
    search_fields = ['name', 'email']
    list_filter = ['position', 'team']


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ['title', 'type', 'date', 'player', 'duration', 'completed']
    list_filter = ['type', 'completed', 'date']
    search_fields = ['title', 'player__name']
    date_hierarchy = 'date'


@admin.register(Metric)
class MetricAdmin(admin.ModelAdmin):
    list_display = ['player', 'metric_type', 'value', 'unit', 'date']
    list_filter = ['metric_type', 'date']
    search_fields = ['player__name', 'metric_type']
    date_hierarchy = 'date'


@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = ['player', 'leaderboard_type', 'value', 'rank', 'calculated_at']
    list_filter = ['leaderboard_type', 'rank']
    search_fields = ['player__name']
