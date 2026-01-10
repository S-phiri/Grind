from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    PlayerViewSet, SessionViewSet, MetricViewSet, LeaderboardViewSet,
    PlayerIntakeViewSet, ProgrammeTemplateViewSet, PlayerProgrammeViewSet,
    login_view, logout_view, me_view, signup_view, dashboard_summary_view,
    submit_intake_for_programme, create_programme_draft, get_player_programmes,
    get_my_programmes, recommend_workout, generate_workout_session
)

router = DefaultRouter()
router.register(r'players', PlayerViewSet, basename='player')
router.register(r'sessions', SessionViewSet, basename='session')
router.register(r'metrics', MetricViewSet, basename='metric')
router.register(r'leaderboards', LeaderboardViewSet, basename='leaderboard')
router.register(r'intake', PlayerIntakeViewSet, basename='intake')
router.register(r'programme-templates', ProgrammeTemplateViewSet, basename='programme-template')
router.register(r'programmes', PlayerProgrammeViewSet, basename='programme')

urlpatterns = [
    # Auth endpoints
    path('auth/login/', login_view, name='login'),
    path('auth/signup/', signup_view, name='signup'),
    path('auth/logout/', logout_view, name='logout'),
    path('me/', me_view, name='me'),
    # Dashboard
    path('dashboard/summary/', dashboard_summary_view, name='dashboard-summary'),
    # Programme endpoints
    path('players/<int:player_id>/intake/', submit_intake_for_programme, name='submit-intake'),
    path('players/<int:player_id>/programmes/draft/', create_programme_draft, name='create-draft'),
    path('players/<int:player_id>/programmes/', get_player_programmes, name='player-programmes'),
    path('programmes/my-programmes/', get_my_programmes, name='my-programmes'),
    # Workout endpoints
    path('workouts/recommend/', recommend_workout, name='recommend-workout'),
    path('workouts/generate/', generate_workout_session, name='generate-workout'),
    # API endpoints
    path('', include(router.urls)),
]

