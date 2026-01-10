from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from .models import Player, Session, Metric, Leaderboard, PlayerIntake, ProgrammeTemplate, PlayerProgramme
from .serializers import (
    PlayerSerializer, SessionSerializer, MetricSerializer,
    LeaderboardSerializer, UserSerializer, PlayerIntakeSerializer,
    ProgrammeTemplateSerializer, PlayerProgrammeSerializer
)
from .services.programming import assign_archetype, suggest_templates, apply_modifiers
from .services.workout_generation import generate_sessions_from_programme, recommend_standalone_workout
from datetime import datetime
from django.db.models import Count, Q


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """Custom login endpoint that returns a token"""
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')

    if not email or not password:
        return Response(
            {'error': 'Email and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Try to find user by email first, then username
    user = None
    try:
        # Try email (case-insensitive)
        user = User.objects.filter(email__iexact=email).first()
        if not user:
            # Try username (case-insensitive)
            user = User.objects.filter(username__iexact=email).first()
    except Exception:
        pass

    if not user:
        return Response(
            {'error': 'Invalid email or username'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Authenticate with username and password
    authenticated_user = authenticate(username=user.username, password=password)
    if authenticated_user:
        token, created = Token.objects.get_or_create(user=authenticated_user)
        return Response({'token': token.key})
    else:
        return Response(
            {'error': 'Invalid password'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    """Logout endpoint - deletes the token"""
    try:
        request.user.auth_token.delete()
    except:
        pass
    return Response({'message': 'Logged out successfully'})


@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    """Signup endpoint - creates a new user and returns a token"""
    username = request.data.get('username', '').strip()
    email = request.data.get('email', '').strip()
    password = request.data.get('password', '')
    first_name = request.data.get('first_name', '').strip()
    last_name = request.data.get('last_name', '').strip()

    # Validation
    if not username or not email or not password:
        return Response(
            {'error': 'Username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 8:
        return Response(
            {'error': 'Password must be at least 8 characters'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already registered'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create user
    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        
        # Create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'token': token.key,
            'user': UserSerializer(user).data,
            'message': 'Account created successfully'
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': f'Error creating account: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me_view(request):
    """Get current user information"""
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


class PlayerViewSet(viewsets.ModelViewSet):
    """ViewSet for Player model"""
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=['get'])
    def metrics(self, request, pk=None):
        """Get all metrics for a specific player"""
        player = self.get_object()
        metrics = Metric.objects.filter(player=player)
        serializer = MetricSerializer(metrics, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def sessions(self, request, pk=None):
        """Get all sessions for a specific player"""
        player = self.get_object()
        sessions = Session.objects.filter(player=player)
        serializer = SessionSerializer(sessions, many=True)
        return Response(serializer.data)


class SessionViewSet(viewsets.ModelViewSet):
    """ViewSet for Session model"""
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter sessions by week if 'week' parameter is provided"""
        queryset = Session.objects.all()
        week = self.request.query_params.get('week', None)
        
        if week == 'current':
            # Get current week (Monday to Sunday)
            today = timezone.now().date()
            # Get Monday of current week
            monday = today - timedelta(days=today.weekday())
            sunday = monday + timedelta(days=6)
            queryset = queryset.filter(date__date__gte=monday, date__date__lte=sunday)
        
        return queryset.select_related('player')


class MetricViewSet(viewsets.ModelViewSet):
    """ViewSet for Metric model"""
    queryset = Metric.objects.all()
    serializer_class = MetricSerializer
    permission_classes = [IsAuthenticated]


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Leaderboard - read-only"""
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter by type if provided"""
        queryset = Leaderboard.objects.all()
        leaderboard_type = self.request.query_params.get('type', None)
        
        if leaderboard_type:
            queryset = queryset.filter(leaderboard_type=leaderboard_type)
        
        return queryset.select_related('player').order_by('rank')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary_view(request):
    """Dashboard summary endpoint with player-specific stats"""
    # Get the player associated with the logged-in user
    # First, try to find a player by matching user email or username
    user = request.user
    player = None
    
    # Try to find player by email match
    if user.email:
        player = Player.objects.filter(email=user.email).first()
    
    # If no match by email, try to find by username
    if not player:
        player = Player.objects.filter(name__icontains=user.username).first()
    
    # If still no player found, get or create one for this user
    if not player:
        player, created = Player.objects.get_or_create(
            email=user.email or f"{user.username}@example.com",
            defaults={
                'name': f"{user.first_name} {user.last_name}".strip() or user.username,
            }
        )
    
    # 1. Player's total sessions completed (all time)
    total_sessions_completed = Session.objects.filter(
        player=player,
        completed=True
    ).count()
    
    # 2. Player's compliance (current week: Monday-Sunday)
    today = timezone.now().date()
    # Get Monday of current week
    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)
    
    # Sessions assigned to this player for current week
    sessions_assigned = Session.objects.filter(
        player=player,
        date__date__gte=monday,
        date__date__lte=sunday
    ).count()
    
    # Sessions completed by this player for current week
    sessions_completed = Session.objects.filter(
        player=player,
        date__date__gte=monday,
        date__date__lte=sunday,
        completed=True
    ).count()
    
    # Calculate compliance percentage
    my_compliance = 0.0
    if sessions_assigned > 0:
        my_compliance = (sessions_completed / sessions_assigned) * 100
    
    # 3. Player's recent progress (this month)
    now = timezone.now()
    first_day_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    my_progress = []
    
    # Get strength and speed metrics for this player this month
    strength_metrics = Metric.objects.filter(
        player=player,
        date__gte=first_day_month,
        metric_type__icontains='strength'
    ).order_by('date')
    
    speed_metrics = Metric.objects.filter(
        player=player,
        date__gte=first_day_month,
        metric_type__icontains='speed'
    ).order_by('date')
    
    # Process strength metrics
    if strength_metrics.count() >= 2:
        start_value = strength_metrics.first().value
        end_value = strength_metrics.last().value
        if start_value > 0:
            pct_change = ((end_value - start_value) / start_value) * 100
            my_progress.append({
                'metric_type': 'strength',
                'start_value': start_value,
                'end_value': end_value,
                'pct_change': round(pct_change, 2)
            })
    
    # Process speed metrics (lower is better)
    if speed_metrics.count() >= 2:
        start_value = speed_metrics.first().value
        end_value = speed_metrics.last().value
        if start_value > 0:
            # For speed, improvement means time decreased (end < start)
            if end_value < start_value:
                pct_change = ((start_value - end_value) / start_value) * 100
            else:
                pct_change = -((end_value - start_value) / start_value) * 100
            my_progress.append({
                'metric_type': 'speed',
                'start_value': start_value,
                'end_value': end_value,
                'pct_change': round(pct_change, 2)
            })
    
    # 4. Current streak (consecutive days with completed sessions)
    current_streak = 0
    check_date = today
    while True:
        day_sessions = Session.objects.filter(
            player=player,
            date__date=check_date,
            completed=True
        )
        if day_sessions.exists():
            current_streak += 1
            check_date -= timedelta(days=1)
        else:
            break
    
    return Response({
        'total_sessions_completed': total_sessions_completed,
        'my_compliance': round(my_compliance, 2),
        'current_streak': current_streak,
        'my_progress': my_progress
    })


class PlayerIntakeViewSet(viewsets.ModelViewSet):
    """ViewSet for PlayerIntake model"""
    serializer_class = PlayerIntakeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter intakes based on user role"""
        user = self.request.user
        
        # Try to find player associated with user
        player = None
        if user.email:
            player = Player.objects.filter(email=user.email).first()
        if not player:
            player = Player.objects.filter(name__icontains=user.username).first()
        
        # If user has associated player, return their intake
        if player:
            return PlayerIntake.objects.filter(player=player)
        
        # Otherwise, return all intakes (for coaches/admins)
        return PlayerIntake.objects.all()

    def perform_create(self, serializer):
        """Set created_by to current user"""
        player_id = self.request.data.get('player')
        if not player_id:
            # If no player specified, try to find/create player for current user
            user = self.request.user
            player, created = Player.objects.get_or_create(
                email=user.email or f"{user.username}@example.com",
                defaults={'name': f"{user.first_name} {user.last_name}".strip() or user.username}
            )
            player_id = player.id
        
        serializer.save(created_by=self.request.user, player_id=player_id)

    @action(detail=False, methods=['get'])
    def my_intake(self, request):
        """Get current user's intake"""
        user = request.user
        
        # Find player for user
        player = None
        if user.email:
            player = Player.objects.filter(email=user.email).first()
        if not player:
            player = Player.objects.filter(name__icontains=user.username).first()
        
        if not player:
            return Response({'detail': 'No player profile found'}, status=status.HTTP_404_NOT_FOUND)
        
        try:
            intake = PlayerIntake.objects.get(player=player)
            serializer = self.get_serializer(intake)
            return Response(serializer.data)
        except PlayerIntake.DoesNotExist:
            return Response({'detail': 'Intake not found', 'player_id': player.id}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def check_complete(self, request):
        """Check if current user's intake is complete"""
        user = request.user
        
        # Find player for user
        player = None
        if user.email:
            player = Player.objects.filter(email=user.email).first()
        if not player:
            player = Player.objects.filter(name__icontains=user.username).first()
        
        if not player:
            return Response({'is_complete': False, 'has_intake': False})
        
        try:
            intake = PlayerIntake.objects.get(player=player)
            return Response({
                'is_complete': intake.is_complete,
                'has_intake': True,
                'player_id': player.id
            })
        except PlayerIntake.DoesNotExist:
            return Response({
                'is_complete': False,
                'has_intake': False,
                'player_id': player.id
            })


class ProgrammeTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for ProgrammeTemplate (read-only for now)"""
    queryset = ProgrammeTemplate.objects.all()
    serializer_class = ProgrammeTemplateSerializer
    permission_classes = [IsAuthenticated]


class PlayerProgrammeViewSet(viewsets.ModelViewSet):
    """ViewSet for PlayerProgramme model"""
    serializer_class = PlayerProgrammeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        """Filter programmes by player if player_id provided"""
        player_id = self.request.query_params.get('player_id')
        if player_id:
            return PlayerProgramme.objects.filter(player_id=player_id)
        return PlayerProgramme.objects.all()

    def perform_create(self, serializer):
        """Set created_by to current user"""
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'])
    def coach_approve(self, request, pk=None):
        """Coach approval endpoint with permission check"""
        programme = self.get_object()
        
        # Permission check: user must be creator or coach
        if programme.created_by != request.user:
            return Response(
                {'detail': 'Only the programme creator can approve as coach'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        programme.coach_approved_at = timezone.now()
        if programme.athlete_approved_at:
            programme.status = 'ACTIVE'
        else:
            programme.status = 'PENDING_ATHLETE'
        programme.save()
        
        serializer = self.get_serializer(programme)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def athlete_approve(self, request, pk=None):
        """Athlete approval endpoint with permission check"""
        programme = self.get_object()
        
        # Permission check: user must be the programme's player
        # Find player for current user
        user = request.user
        player = None
        if user.email:
            player = Player.objects.filter(email=user.email).first()
        if not player:
            player = Player.objects.filter(name__icontains=user.username).first()
        
        if not player or programme.player != player:
            return Response(
                {'detail': 'Only the programme player can approve as athlete'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        programme.athlete_approved_at = timezone.now()
        if programme.coach_approved_at:
            programme.status = 'ACTIVE'
        else:
            programme.status = 'PENDING_COACH'
        programme.save()
        
        serializer = self.get_serializer(programme)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def commence(self, request, pk=None):
        """Commence programme - generate sessions"""
        programme = self.get_object()
        
        # Verify programme belongs to current user's player
        user = request.user
        player = None
        if user.email:
            player = Player.objects.filter(email=user.email).first()
        if not player:
            player = Player.objects.filter(name__icontains=user.username).first()
        
        if not player or programme.player != player:
            return Response(
                {'detail': 'You can only commence your own programmes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if programme is ACTIVE
        if programme.status != 'ACTIVE':
            return Response(
                {'detail': f'Programme must be ACTIVE to commence. Current status: {programme.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if sessions already exist for this programme
        existing_sessions = Session.objects.filter(programme=programme).count()
        if existing_sessions > 0:
            return Response(
                {'detail': 'Sessions already generated for this programme'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Generate sessions
        try:
            sessions = generate_sessions_from_programme(programme)
            session_serializer = SessionSerializer(sessions, many=True)
            
            return Response({
                'sessions_created': len(sessions),
                'sessions': session_serializer.data,
                'message': f'Successfully created {len(sessions)} sessions'
            })
        except Exception as e:
            return Response(
                {'detail': f'Error generating sessions: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def check_completion(self, request, pk=None):
        """Check and update programme completion"""
        programme = self.get_object()
        
        # Verify programme belongs to current user's player
        user = request.user
        player = None
        if user.email:
            player = Player.objects.filter(email=user.email).first()
        if not player:
            player = Player.objects.filter(name__icontains=user.username).first()
        
        if not player or programme.player != player:
            return Response(
                {'detail': 'You can only check your own programmes'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Count sessions
        total_sessions = Session.objects.filter(programme=programme).count()
        completed_sessions = Session.objects.filter(programme=programme, completed=True).count()
        
        # If all sessions completed and programme is ACTIVE, mark as COMPLETED
        if total_sessions > 0 and completed_sessions == total_sessions and programme.status == 'ACTIVE':
            programme.status = 'COMPLETED'
            programme.save()
        
        serializer = PlayerProgrammeSerializer(programme)
        return Response({
            'programme': serializer.data,
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'is_complete': completed_sessions == total_sessions if total_sessions > 0 else False
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_intake_for_programme(request, player_id):
    """
    Submit intake for programme generation.
    Extracts fields from PlayerIntake or accepts standardized payload.
    Returns archetype and suggested templates.
    """
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response({'detail': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Get or extract intake data
    intake_data = request.data
    
    # Map to standardized keys if coming from PlayerIntake
    standardized_payload = {
        'sport': intake_data.get('sport') or '',
        'primary_goal': intake_data.get('primary_goal') or '',
        'training_level': intake_data.get('training_level') or '',
        'training_days_per_week': intake_data.get('training_days_per_week'),
        'equipment_access': intake_data.get('equipment_access') or '',
        'injuries': intake_data.get('injuries', []),
    }
    
    # Assign archetype
    archetype_label = assign_archetype(standardized_payload)
    
    # Update player profile fields
    player.archetype = archetype_label
    player.primary_goal = standardized_payload['primary_goal']
    player.training_level = standardized_payload['training_level']
    player.training_days_per_week = standardized_payload['training_days_per_week']
    player.sport = standardized_payload['sport']
    player.equipment_access = standardized_payload['equipment_access']
    player.injuries = standardized_payload['injuries']
    player.save()
    
    # Suggest templates
    suggested_templates = suggest_templates(
        standardized_payload['primary_goal'],
        standardized_payload['training_level'],
        standardized_payload['sport']
    )
    
    template_serializer = ProgrammeTemplateSerializer(suggested_templates, many=True)
    player_serializer = PlayerSerializer(player)
    
    return Response({
        'player': player_serializer.data,
        'archetype': archetype_label,
        'suggested_programmes': template_serializer.data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_programme_draft(request, player_id):
    """
    Create a draft programme from a template with modifiers applied.
    """
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response({'detail': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
    
    template_id = request.data.get('programme_template_id')
    start_date_str = request.data.get('start_date')
    edits = request.data.get('edits', {})
    
    if not template_id:
        return Response({'detail': 'programme_template_id is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not start_date_str:
        return Response({'detail': 'start_date is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        template = ProgrammeTemplate.objects.get(id=template_id)
    except ProgrammeTemplate.DoesNotExist:
        return Response({'detail': 'Template not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
    except ValueError:
        return Response({'detail': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Copy template structure to plan
    import copy
    plan = copy.deepcopy(template.structure)
    
    # Get intake payload from player profile
    intake_payload = {
        'injuries': player.injuries or [],
        'equipment_access': player.equipment_access or '',
        'training_days_per_week': player.training_days_per_week,
        'sport': player.sport or '',
    }
    
    # Apply modifiers
    modifier_result = apply_modifiers(plan, intake_payload)
    plan = modifier_result['final_plan']
    warnings = modifier_result['warnings']
    substitutions = modifier_result['substitutions_applied']
    
    # Apply V1 edits
    if edits.get('focus'):
        # Adjust meta.primary_focus emphasis
        if 'meta' in plan:
            plan['meta']['primary_focus'] = edits['focus']
    
    if edits.get('remove_day'):
        # Remove specified day from all weeks
        day_to_remove = edits['remove_day'].lower()
        for week in plan.get('weeks', []):
            week['days'] = [d for d in week.get('days', []) if d.get('day', '').lower() != day_to_remove]
    
    if edits.get('low_impact_week1'):
        # Reduce intensity/volume for week 1
        if plan.get('weeks') and len(plan['weeks']) > 0:
            week1 = plan['weeks'][0]
            for day in week1.get('days', []):
                for exercise in day.get('exercises', []):
                    # Reduce sets/reps
                    if 'sets' in exercise:
                        exercise['sets'] = max(1, exercise['sets'] - 1)
                    if 'reps' in exercise:
                        # Reduce reps by ~20%
                        try:
                            reps_str = str(exercise['reps'])
                            if '-' in reps_str:
                                parts = reps_str.split('-')
                                if len(parts) == 2:
                                    low, high = int(parts[0]), int(parts[1])
                                    exercise['reps'] = f"{max(1, low-1)}-{max(1, high-1)}"
                        except:
                            pass
    
    # Create programme
    programme = PlayerProgramme.objects.create(
        player=player,
        template=template,
        title=request.data.get('title', template.name),
        start_date=start_date,
        status='PENDING_COACH',
        plan=plan,
        warnings=warnings,
        substitutions_applied=substitutions,
        created_by=request.user
    )
    
    serializer = PlayerProgrammeSerializer(programme)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_player_programmes(request, player_id):
    """Get all programmes for a player"""
    try:
        player = Player.objects.get(id=player_id)
    except Player.DoesNotExist:
        return Response({'detail': 'Player not found'}, status=status.HTTP_404_NOT_FOUND)
    
    programmes = PlayerProgramme.objects.filter(player=player).order_by('-created_at')
    serializer = PlayerProgrammeSerializer(programmes, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_my_programmes(request):
    """Get all programmes for current user's player"""
    # Find player for current user
    user = request.user
    player = None
    if user.email:
        player = Player.objects.filter(email=user.email).first()
    if not player:
        player = Player.objects.filter(name__icontains=user.username).first()
    
    if not player:
        return Response({'detail': 'No player profile found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Order by status: ACTIVE first, then by created_at desc
    programmes = PlayerProgramme.objects.filter(player=player).order_by(
        '-status',  # ACTIVE comes before others alphabetically
        '-created_at'
    )
    
    # Get session counts for each programme
    programmes_with_stats = []
    for programme in programmes:
        serializer = PlayerProgrammeSerializer(programme)
        data = serializer.data
        
        # Count sessions for this programme
        total_sessions = Session.objects.filter(programme=programme).count()
        completed_sessions = Session.objects.filter(programme=programme, completed=True).count()
        
        data['total_sessions'] = total_sessions
        data['completed_sessions'] = completed_sessions
        data['progress_percent'] = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
        
        programmes_with_stats.append(data)
    
    return Response(programmes_with_stats)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def commence_programme(request, pk):
    """Commence a programme - generate all sessions from plan"""
    try:
        programme = PlayerProgramme.objects.get(id=pk)
    except PlayerProgramme.DoesNotExist:
        return Response({'detail': 'Programme not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify programme belongs to current user's player
    user = request.user
    player = None
    if user.email:
        player = Player.objects.filter(email=user.email).first()
    if not player:
        player = Player.objects.filter(name__icontains=user.username).first()
    
    if not player or programme.player != player:
        return Response(
            {'detail': 'You can only commence your own programmes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if programme is ACTIVE
    if programme.status != 'ACTIVE':
        return Response(
            {'detail': f'Programme must be ACTIVE to commence. Current status: {programme.status}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if sessions already exist for this programme
    existing_sessions = Session.objects.filter(programme=programme).count()
    if existing_sessions > 0:
        return Response(
            {'detail': 'Sessions already generated for this programme'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Generate sessions
    try:
        sessions = generate_sessions_from_programme(programme)
        session_serializer = SessionSerializer(sessions, many=True)
        
        return Response({
            'sessions_created': len(sessions),
            'sessions': session_serializer.data,
            'message': f'Successfully created {len(sessions)} sessions'
        })
    except Exception as e:
        return Response(
            {'detail': f'Error generating sessions: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def recommend_workout(request):
    """Get a recommended standalone workout"""
    # Find player for current user
    user = request.user
    player = None
    if user.email:
        player = Player.objects.filter(email=user.email).first()
    if not player:
        player = Player.objects.filter(name__icontains=user.username).first()
    
    if not player:
        return Response({'detail': 'No player profile found'}, status=status.HTTP_404_NOT_FOUND)
    
    focus = request.data.get('focus')
    
    try:
        workout = recommend_standalone_workout(player, focus)
        return Response(workout)
    except Exception as e:
        return Response(
            {'detail': f'Error generating workout: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_workout_session(request):
    """Create a Session from a workout structure"""
    # Find player for current user
    user = request.user
    player = None
    if user.email:
        player = Player.objects.filter(email=user.email).first()
    if not player:
        player = Player.objects.filter(name__icontains=user.username).first()
    
    if not player:
        return Response({'detail': 'No player profile found'}, status=status.HTTP_404_NOT_FOUND)
    
    workout = request.data.get('workout')
    date_str = request.data.get('date')
    
    if not workout:
        return Response({'detail': 'workout structure is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Parse date
    if date_str:
        try:
            workout_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        except ValueError:
            return Response({'detail': 'Invalid date format. Use YYYY-MM-DD'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        workout_date = timezone.now().date()
    
    # Create datetime (default to 18:00)
    workout_datetime = timezone.make_aware(datetime.combine(workout_date, datetime.min.time().replace(hour=18)))
    
    # Extract exercises for title/notes
    exercises = workout.get('exercises', [])
    exercises_list = ', '.join([ex.get('name', '') for ex in exercises[:2]])
    
    # Create session
    session = Session.objects.create(
        player=player,
        title=workout.get('title', 'Recommended Workout'),
        type=workout.get('type', 'Gym'),
        date=workout_datetime,
        duration=workout.get('duration', 60),
        completed=False,
    )
    
    serializer = SessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def check_programme_completion(request, pk):
    """Check and update programme completion status"""
    try:
        programme = PlayerProgramme.objects.get(id=pk)
    except PlayerProgramme.DoesNotExist:
        return Response({'detail': 'Programme not found'}, status=status.HTTP_404_NOT_FOUND)
    
    # Verify programme belongs to current user's player
    user = request.user
    player = None
    if user.email:
        player = Player.objects.filter(email=user.email).first()
    if not player:
        player = Player.objects.filter(name__icontains=user.username).first()
    
    if not player or programme.player != player:
        return Response(
            {'detail': 'You can only check your own programmes'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Count sessions
    total_sessions = Session.objects.filter(programme=programme).count()
    completed_sessions = Session.objects.filter(programme=programme, completed=True).count()
    
    # If all sessions completed and programme is ACTIVE, mark as COMPLETED
    if total_sessions > 0 and completed_sessions == total_sessions and programme.status == 'ACTIVE':
        programme.status = 'COMPLETED'
        programme.save()
    
    serializer = PlayerProgrammeSerializer(programme)
    return Response({
        'programme': serializer.data,
        'total_sessions': total_sessions,
        'completed_sessions': completed_sessions,
        'is_complete': completed_sessions == total_sessions if total_sessions > 0 else False
    })
