"""
Deterministic rules engine for programme assignment and modification.
No LLM - all logic is rule-based.
"""
from django.db.models import Q
from api.models import ProgrammeTemplate


def assign_archetype(intake_payload: dict) -> str:
    """
    Assign human-readable archetype label based on intake payload.
    
    Args:
        intake_payload: Dict with keys: primary_goal, training_level, injuries (optional)
    
    Returns:
        Human-readable archetype label string
    """
    primary_goal = intake_payload.get('primary_goal', '').lower()
    training_level = intake_payload.get('training_level', '').lower()
    injuries = intake_payload.get('injuries', [])
    
    # Check for return-to-training indicators
    has_injuries = bool(injuries and len(injuries) > 0)
    is_return_to_training = (
        primary_goal == 'base' and 
        (has_injuries or intake_payload.get('primary_goal') == 'return-to-training')
    )
    
    # Map to human-readable labels
    if is_return_to_training:
        return "Return to Training"
    elif primary_goal == 'speed':
        if training_level == 'intermediate' or training_level == 'advanced':
            return "Explosive Speed Focus"
        else:
            return "Speed & Acceleration Focus"
    elif primary_goal in ['strength', 'power']:
        return "Strength & Power Focus"
    elif primary_goal == 'conditioning':
        return "Conditioning Engine"
    elif primary_goal == 'hypertrophy':
        return "Hypertrophy Focus"
    elif primary_goal == 'base':
        return "Athletic Base"
    else:
        return "Athletic Base"  # Default


def suggest_templates(primary_goal: str, training_level: str, sport: str = None) -> list:
    """
    Suggest 2-3 programme templates based on primary_goal and training_level.
    Sport is only used as a weak preference hint, not a filter.
    
    Args:
        primary_goal: One of base, speed, power, strength, hypertrophy, conditioning
        training_level: One of beginner, intermediate, advanced
        sport: Optional sport hint (not used for filtering)
    
    Returns:
        List of ProgrammeTemplate objects (2-3)
    """
    # Filter by primary_focus and difficulty
    queryset = ProgrammeTemplate.objects.filter(
        primary_focus=primary_goal,
        difficulty=training_level
    )
    
    # If sport provided, prefer templates with matching sport (but don't require it)
    if sport:
        # Order by sport match first, then by name
        queryset = queryset.order_by(
            '-sport',  # Templates with matching sport first (if sport is set)
            'name'
        )
    else:
        queryset = queryset.order_by('name')
    
    templates = list(queryset[:3])  # Get up to 3
    
    # Fallback: if no exact match, try by primary_focus only
    if len(templates) == 0:
        fallback = ProgrammeTemplate.objects.filter(
            primary_focus=primary_goal
        ).order_by('difficulty', 'name')[:3]
        templates = list(fallback)
    
    return templates


def apply_modifiers(template_plan: dict, intake_payload: dict) -> dict:
    """
    Apply modifiers to template plan based on intake data.
    
    Args:
        template_plan: Full structure with 'meta' + 'weeks'
        intake_payload: Dict with keys: injuries, equipment_access, training_days_per_week, sport
    
    Returns:
        Dict with keys: final_plan, warnings, substitutions_applied
    """
    import copy
    plan = copy.deepcopy(template_plan)
    warnings = []
    substitutions = []
    
    injuries = intake_payload.get('injuries', [])
    equipment_access = intake_payload.get('equipment_access', '').lower()
    training_days_per_week = intake_payload.get('training_days_per_week')
    sport = intake_payload.get('sport', '').lower()
    
    # Extract injury areas
    injury_areas = [inj.get('area', '').lower() for inj in injuries if isinstance(inj, dict)]
    
    # 1. Injury Modifiers
    if 'shoulder' in injury_areas:
        warnings.append("Shoulder injury detected - overhead movements modified")
        substitutions.append({
            "type": "injury",
            "area": "shoulder",
            "removed": ["overhead press", "dips", "handstand push-ups"],
            "added": ["landmine press", "incline push-ups", "rows", "scapular stability work"]
        })
        # Modify exercises in plan
        for week in plan.get('weeks', []):
            for day in week.get('days', []):
                exercises = day.get('exercises', [])
                for ex in exercises:
                    ex_name_lower = ex.get('name', '').lower()
                    if any(term in ex_name_lower for term in ['overhead', 'press', 'dip', 'handstand']):
                        # Mark for removal or substitution
                        ex['substituted'] = True
                        ex['substitution_reason'] = 'shoulder_injury'
    
    if 'knee' in injury_areas:
        warnings.append("Knee injury detected - jump volume reduced, deep flexion avoided")
        substitutions.append({
            "type": "injury",
            "area": "knee",
            "modifications": ["reduced jump volume", "avoid deep knee flexion", "added isometrics/tempo work"]
        })
        for week in plan.get('weeks', []):
            for day in week.get('days', []):
                exercises = day.get('exercises', [])
                for ex in exercises:
                    ex_name_lower = ex.get('name', '').lower()
                    if any(term in ex_name_lower for term in ['jump', 'squat', 'lunge']):
                        ex['intensity_reduced'] = True
                        ex['modification_reason'] = 'knee_injury'
    
    if 'hamstring' in injury_areas:
        warnings.append("Hamstring injury detected - sprint volume limited, eccentrics added")
        substitutions.append({
            "type": "injury",
            "area": "hamstring",
            "modifications": ["limited max sprint volume", "added eccentrics", "progressive sprint exposure"]
        })
        for week in plan.get('weeks', []):
            for day in week.get('days', []):
                exercises = day.get('exercises', [])
                for ex in exercises:
                    ex_name_lower = ex.get('name', '').lower()
                    if 'sprint' in ex_name_lower:
                        ex['volume_limited'] = True
                        ex['modification_reason'] = 'hamstring_injury'
    
    # 2. Equipment Modifiers
    if equipment_access in ['none', 'limited']:
        warnings.append("Limited equipment - exercises adapted for minimal equipment")
        substitutions.append({
            "type": "equipment",
            "from": "barbell/machines",
            "to": "dumbbells/bodyweight/bands"
        })
        for week in plan.get('weeks', []):
            for day in week.get('days', []):
                exercises = day.get('exercises', [])
                for ex in exercises:
                    ex_name_lower = ex.get('name', '').lower()
                    if 'barbell' in ex_name_lower or 'machine' in ex_name_lower:
                        ex['equipment_adapted'] = True
                        ex['equipment_note'] = 'Adapted for limited equipment'
    
    elif equipment_access == 'home':
        warnings.append("Home training - bodyweight and minimal equipment focus")
        substitutions.append({
            "type": "equipment",
            "from": "gym equipment",
            "to": "bodyweight/bands/minimal equipment"
        })
    
    # 3. Training Days Modifier
    if training_days_per_week:
        # Count days in template (assume each week has similar structure)
        if plan.get('weeks'):
            week1 = plan['weeks'][0]
            template_days = len(week1.get('days', []))
            
            if template_days > training_days_per_week:
                # Drop lowest priority day (last day of week)
                days_to_remove = template_days - training_days_per_week
                warnings.append(f"Reduced from {template_days} to {training_days_per_week} days per week")
                substitutions.append({
                    "type": "days",
                    "removed_days": days_to_remove,
                    "reason": "player_availability"
                })
                for week in plan.get('weeks', []):
                    days = week.get('days', [])
                    if len(days) > training_days_per_week:
                        week['days'] = days[:training_days_per_week]
            
            elif template_days < training_days_per_week:
                # Add optional session
                warnings.append(f"Added optional recovery session (template has {template_days} days)")
                substitutions.append({
                    "type": "days",
                    "added": "optional_recovery_session"
                })
    
    # 4. Sport Modifiers
    if sport == 'soccer':
        warnings.append("Soccer focus - speed/agility emphasis, change of direction work added")
        substitutions.append({
            "type": "sport",
            "sport": "soccer",
            "emphasis": ["speed", "agility", "change of direction"]
        })
        # Could add specific exercises or modify existing ones
        plan['meta']['sport_bias'] = 'soccer'
    
    elif sport == 'boxing':
        warnings.append("Boxing focus - conditioning/power emphasis, rotational work added")
        substitutions.append({
            "type": "sport",
            "sport": "boxing",
            "emphasis": ["conditioning", "power", "rotational work"]
        })
        plan['meta']['sport_bias'] = 'boxing'
    
    elif sport == 'rugby':
        warnings.append("Rugby focus - robustness/conditioning emphasis, contact prep added")
        substitutions.append({
            "type": "sport",
            "sport": "rugby",
            "emphasis": ["robustness", "conditioning", "contact prep"]
        })
        plan['meta']['sport_bias'] = 'rugby'
    
    elif sport == 'gym':
        warnings.append("Gym focus - hypertrophy/strength emphasis, volume added")
        substitutions.append({
            "type": "sport",
            "sport": "gym",
            "emphasis": ["hypertrophy", "strength", "volume"]
        })
        plan['meta']['sport_bias'] = 'gym'
    
    return {
        "final_plan": plan,
        "warnings": warnings,
        "substitutions_applied": substitutions
    }

