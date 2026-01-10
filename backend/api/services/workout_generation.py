"""
Workout generation service - converts programme plans into Session records
and generates standalone workout recommendations.
"""
from datetime import timedelta
from api.models import Session, Player, PlayerProgramme


def generate_sessions_from_programme(programme: PlayerProgramme):
    """
    Generate Session records from a PlayerProgramme plan structure.
    
    Args:
        programme: PlayerProgramme instance with plan structure
    
    Returns:
        List of created Session objects
    """
    if not programme.plan or 'weeks' not in programme.plan:
        return []
    
    sessions = []
    plan = programme.plan
    weeks = plan.get('weeks', [])
    
    # Day name to weekday offset (Monday = 0)
    day_offset_map = {
        'monday': 0,
        'tuesday': 1,
        'wednesday': 2,
        'thursday': 3,
        'friday': 4,
        'saturday': 5,
        'sunday': 6,
    }
    
    for week_data in weeks:
        week_num = week_data.get('week', 1)
        days = week_data.get('days', [])
        
        for day_data in days:
            day_name = day_data.get('day', '').lower()
            day_offset = day_offset_map.get(day_name, 0)
            
            # Calculate date: start_date + (week-1)*7 days + day_offset
            week_offset = (week_num - 1) * 7
            session_date = programme.start_date + timedelta(days=week_offset + day_offset)
            
            # Create session title
            day_title = day_name.capitalize()
            title = f"Week {week_num} - {day_title}"
            if week_data.get('theme'):
                title = f"{week_data.get('theme')} - {day_title}"
            
            # Create session with datetime (combine date + time)
            from django.utils import timezone
            from datetime import datetime, time
            
            # Combine date with a default time (e.g., 18:00)
            # start_date is a DateField, so combine with time and make timezone-aware
            session_datetime = timezone.make_aware(
                datetime.combine(session_date, time(18, 0))
            )
            
            session = Session.objects.create(
                player=programme.player,
                programme=programme,
                title=title,
                type=day_data.get('type', 'Gym'),
                date=session_datetime,
                duration=day_data.get('duration', 60),
                completed=False,
            )
            sessions.append(session)
    
    return sessions


def recommend_standalone_workout(player: Player, focus: str = None):
    """
    Recommend a standalone workout based on player's profile.
    
    Args:
        player: Player instance
        focus: Optional focus override (speed, strength, etc.)
    
    Returns:
        Dict with workout structure
    """
    # Determine focus
    if not focus:
        focus = player.primary_goal or 'base'
    
    archetype = player.archetype or ''
    training_level = player.training_level or 'beginner'
    equipment_access = player.equipment_access or 'gym'
    injuries = player.injuries or []
    
    # Extract injury areas
    injury_areas = [inj.get('area', '').lower() if isinstance(inj, dict) else str(inj).lower() for inj in injuries]
    
    # Base workout templates by focus
    workouts = {
        'speed': {
            'title': 'Speed & Agility Focus',
            'type': 'Field',
            'duration': 45,
            'exercises': [
                {'name': '10m Sprint', 'sets': 4, 'reps': '1', 'rest': '3min'},
                {'name': '20m Sprint', 'sets': 3, 'reps': '1', 'rest': '4min'},
                {'name': 'Agility Ladder', 'sets': 3, 'reps': '30s', 'rest': '1min'},
                {'name': 'Change of Direction', 'sets': 3, 'reps': '5 each', 'rest': '2min'},
            ]
        },
        'strength': {
            'title': 'Strength Focus',
            'type': 'Gym',
            'duration': 60,
            'exercises': [
                {'name': 'Back Squat', 'sets': 4, 'reps': '5', 'rest': '3min'},
                {'name': 'Bench Press', 'sets': 4, 'reps': '5', 'rest': '3min'},
                {'name': 'Bent Over Row', 'sets': 3, 'reps': '8', 'rest': '2min'},
                {'name': 'Overhead Press', 'sets': 3, 'reps': '6', 'rest': '2min'},
            ]
        },
        'power': {
            'title': 'Power Focus',
            'type': 'Gym',
            'duration': 50,
            'exercises': [
                {'name': 'Power Cleans', 'sets': 5, 'reps': '3', 'rest': '3min'},
                {'name': 'Box Jumps', 'sets': 4, 'reps': '5', 'rest': '2min'},
                {'name': 'Medicine Ball Slams', 'sets': 3, 'reps': '8', 'rest': '2min'},
            ]
        },
        'hypertrophy': {
            'title': 'Hypertrophy Focus',
            'type': 'Gym',
            'duration': 75,
            'exercises': [
                {'name': 'Back Squat', 'sets': 4, 'reps': '8-10', 'rest': '2min'},
                {'name': 'Bench Press', 'sets': 4, 'reps': '8-10', 'rest': '2min'},
                {'name': 'Barbell Row', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                {'name': 'Leg Press', 'sets': 3, 'reps': '12-15', 'rest': '1.5min'},
            ]
        },
        'conditioning': {
            'title': 'Conditioning Focus',
            'type': 'Conditioning',
            'duration': 45,
            'exercises': [
                {'name': 'Assault Bike', 'sets': 4, 'reps': '30s on / 30s off', 'rest': '1min'},
                {'name': 'Burpees', 'sets': 3, 'reps': '10', 'rest': '1min'},
                {'name': 'Kettlebell Swings', 'sets': 3, 'reps': '15', 'rest': '1min'},
                {'name': 'Shuttle Runs', 'sets': 3, 'reps': '40m', 'rest': '2min'},
            ]
        },
        'base': {
            'title': 'Athletic Base',
            'type': 'Gym',
            'duration': 45,
            'exercises': [
                {'name': 'Goblet Squat', 'sets': 3, 'reps': '10', 'rest': '2min'},
                {'name': 'Push-ups', 'sets': 3, 'reps': '10', 'rest': '2min'},
                {'name': 'Dumbbell Row', 'sets': 3, 'reps': '10', 'rest': '2min'},
                {'name': 'Plank', 'sets': 3, 'reps': '30-45s', 'rest': '1min'},
            ]
        }
    }
    
    # Get base workout
    workout = workouts.get(focus, workouts['base']).copy()
    
    # Adjust for training level
    if training_level == 'beginner':
        # Reduce sets/reps for beginners
        for ex in workout['exercises']:
            if isinstance(ex.get('sets'), int):
                ex['sets'] = max(2, ex['sets'] - 1)
            if 'reps' in ex and isinstance(ex['reps'], str) and '-' in ex['reps']:
                # Reduce rep ranges
                parts = ex['reps'].split('-')
                if len(parts) == 2:
                    try:
                        low, high = int(parts[0]), int(parts[1])
                        ex['reps'] = f"{max(5, low-2)}-{max(8, high-2)}"
                    except:
                        pass
    elif training_level == 'advanced':
        # Increase sets/reps for advanced
        for ex in workout['exercises']:
            if isinstance(ex.get('sets'), int):
                ex['sets'] = ex['sets'] + 1
    
    # Apply equipment modifiers
    if equipment_access in ['none', 'limited', 'home']:
        # Swap to bodyweight/home exercises
        if workout['type'] == 'Gym' and focus == 'strength':
            workout['exercises'] = [
                {'name': 'Bodyweight Squat', 'sets': 3, 'reps': '15', 'rest': '2min'},
                {'name': 'Push-ups', 'sets': 3, 'reps': '12', 'rest': '2min'},
                {'name': 'Pistol Squat Progressions', 'sets': 3, 'reps': '8 each', 'rest': '2min'},
                {'name': 'Plank Variations', 'sets': 3, 'reps': '45s', 'rest': '1min'},
            ]
            workout['type'] = 'Home'
    
    # Apply injury modifiers
    if 'shoulder' in injury_areas:
        # Remove overhead/pressing, add alternatives
        workout['exercises'] = [
            ex for ex in workout['exercises'] 
            if 'press' not in ex.get('name', '').lower() and 'overhead' not in ex.get('name', '').lower()
        ]
        workout['exercises'].insert(0, {'name': 'Landmine Press', 'sets': 3, 'reps': '10', 'rest': '2min'})
        workout['exercises'].insert(1, {'name': 'Scapular Stability Work', 'sets': 2, 'reps': '12', 'rest': '1min'})
    
    if 'knee' in injury_areas:
        # Reduce squat/jump volume
        for ex in workout['exercises']:
            if 'squat' in ex.get('name', '').lower() or 'jump' in ex.get('name', '').lower():
                ex['sets'] = max(2, ex.get('sets', 3) - 1)
                ex['notes'] = 'Tempo controlled, avoid deep flexion'
    
    if 'hamstring' in injury_areas:
        # Reduce sprint volume
        for ex in workout['exercises']:
            if 'sprint' in ex.get('name', '').lower():
                ex['sets'] = max(2, ex.get('sets', 4) - 2)
                ex['notes'] = 'Progressive exposure, focus on form'
    
    return workout

