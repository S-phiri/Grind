"""
Management command to seed need-based programme templates.
Run with: python manage.py seed_templates
"""
from django.core.management.base import BaseCommand
from api.models import ProgrammeTemplate


class Command(BaseCommand):
    help = 'Seed need-based programme templates'

    def handle(self, *args, **options):
        templates_data = [
            {
                'name': 'Athletic Base – Foundation',
                'description': 'Build fundamental movement patterns and base strength. Perfect for beginners or those returning to training.',
                'primary_focus': 'base',
                'difficulty': 'beginner',
                'sport': None,
                'duration_weeks': 4,
                'structure': {
                    'meta': {
                        'primary_focus': 'base',
                        'difficulty': 'beginner',
                        'days_per_week': 3,
                        'sport_bias': None,
                        'intensity': 'low'
                    },
                    'weeks': [
                        {
                            'week': 1,
                            'theme': 'Foundation',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Gym',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Bodyweight Squat', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                                        {'name': 'Push-ups', 'sets': 3, 'reps': '8-10', 'rest': '2min'},
                                        {'name': 'Plank', 'sets': 3, 'reps': '30-45s', 'rest': '1min'},
                                    ]
                                },
                                {
                                    'day': 'wednesday',
                                    'type': 'Gym',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Goblet Squat', 'sets': 3, 'reps': '10', 'rest': '2min'},
                                        {'name': 'Dumbbell Row', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                                        {'name': 'Walking Lunges', 'sets': 2, 'reps': '10 each', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Gym',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Bodyweight Squat', 'sets': 3, 'reps': '12-15', 'rest': '2min'},
                                        {'name': 'Incline Push-ups', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                                        {'name': 'Dead Bug', 'sets': 2, 'reps': '10 each', 'rest': '1min'},
                                    ]
                                }
                            ]
                        },
                        {
                            'week': 2,
                            'theme': 'Progression',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Gym',
                                    'duration': 50,
                                    'exercises': [
                                        {'name': 'Goblet Squat', 'sets': 3, 'reps': '12', 'rest': '2min'},
                                        {'name': 'Push-ups', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                                        {'name': 'Plank', 'sets': 3, 'reps': '45-60s', 'rest': '1min'},
                                    ]
                                },
                                {
                                    'day': 'wednesday',
                                    'type': 'Gym',
                                    'duration': 50,
                                    'exercises': [
                                        {'name': 'Goblet Squat', 'sets': 4, 'reps': '10', 'rest': '2min'},
                                        {'name': 'Dumbbell Row', 'sets': 3, 'reps': '12', 'rest': '2min'},
                                        {'name': 'Walking Lunges', 'sets': 3, 'reps': '10 each', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Gym',
                                    'duration': 50,
                                    'exercises': [
                                        {'name': 'Goblet Squat', 'sets': 3, 'reps': '12-15', 'rest': '2min'},
                                        {'name': 'Push-ups', 'sets': 3, 'reps': '12', 'rest': '2min'},
                                        {'name': 'Dead Bug', 'sets': 3, 'reps': '10 each', 'rest': '1min'},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'name': 'Speed & Acceleration – Focus',
                'description': 'Develop explosive speed, acceleration, and change of direction. Ideal for athletes needing to improve sprint performance.',
                'primary_focus': 'speed',
                'difficulty': 'intermediate',
                'sport': None,
                'duration_weeks': 4,
                'structure': {
                    'meta': {
                        'primary_focus': 'speed',
                        'difficulty': 'intermediate',
                        'days_per_week': 4,
                        'sport_bias': None,
                        'intensity': 'moderate'
                    },
                    'weeks': [
                        {
                            'week': 1,
                            'theme': 'Speed Foundation',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Field',
                                    'duration': 60,
                                    'exercises': [
                                        {'name': '10m Sprint', 'sets': 4, 'reps': '1', 'rest': '3min'},
                                        {'name': '20m Sprint', 'sets': 3, 'reps': '1', 'rest': '4min'},
                                        {'name': 'Lateral Bounds', 'sets': 3, 'reps': '5 each', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'wednesday',
                                    'type': 'Gym',
                                    'duration': 60,
                                    'exercises': [
                                        {'name': 'Back Squat', 'sets': 4, 'reps': '5', 'rest': '3min'},
                                        {'name': 'Romanian Deadlift', 'sets': 3, 'reps': '6', 'rest': '3min'},
                                        {'name': 'Box Jumps', 'sets': 3, 'reps': '5', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Field',
                                    'duration': 60,
                                    'exercises': [
                                        {'name': '20m Sprint', 'sets': 4, 'reps': '1', 'rest': '4min'},
                                        {'name': 'Agility Ladder', 'sets': 3, 'reps': '30s', 'rest': '1min'},
                                        {'name': 'Change of Direction', 'sets': 3, 'reps': '5 each', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'saturday',
                                    'type': 'Conditioning',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Sled Push', 'sets': 3, 'reps': '20m', 'rest': '2min'},
                                        {'name': 'Farmer Walk', 'sets': 3, 'reps': '30m', 'rest': '2min'},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'name': 'Strength & Power – Focus',
                'description': 'Build maximal strength and explosive power. Perfect for athletes looking to increase force production.',
                'primary_focus': 'strength',
                'difficulty': 'intermediate',
                'sport': None,
                'duration_weeks': 4,
                'structure': {
                    'meta': {
                        'primary_focus': 'strength',
                        'difficulty': 'intermediate',
                        'days_per_week': 4,
                        'sport_bias': None,
                        'intensity': 'high'
                    },
                    'weeks': [
                        {
                            'week': 1,
                            'theme': 'Strength Base',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Gym',
                                    'duration': 75,
                                    'exercises': [
                                        {'name': 'Back Squat', 'sets': 5, 'reps': '5', 'rest': '4min'},
                                        {'name': 'Bench Press', 'sets': 5, 'reps': '5', 'rest': '4min'},
                                        {'name': 'Bent Over Row', 'sets': 4, 'reps': '8', 'rest': '3min'},
                                    ]
                                },
                                {
                                    'day': 'wednesday',
                                    'type': 'Gym',
                                    'duration': 75,
                                    'exercises': [
                                        {'name': 'Deadlift', 'sets': 5, 'reps': '5', 'rest': '4min'},
                                        {'name': 'Overhead Press', 'sets': 4, 'reps': '6', 'rest': '3min'},
                                        {'name': 'Pull-ups', 'sets': 3, 'reps': '8', 'rest': '3min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Gym',
                                    'duration': 75,
                                    'exercises': [
                                        {'name': 'Back Squat', 'sets': 5, 'reps': '5', 'rest': '4min'},
                                        {'name': 'Bench Press', 'sets': 5, 'reps': '5', 'rest': '4min'},
                                        {'name': 'Barbell Row', 'sets': 4, 'reps': '8', 'rest': '3min'},
                                    ]
                                },
                                {
                                    'day': 'saturday',
                                    'type': 'Gym',
                                    'duration': 60,
                                    'exercises': [
                                        {'name': 'Power Cleans', 'sets': 5, 'reps': '3', 'rest': '3min'},
                                        {'name': 'Box Jumps', 'sets': 4, 'reps': '5', 'rest': '2min'},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'name': 'Hypertrophy (Athletic Build) – Focus',
                'description': 'Build muscle mass while maintaining athleticism. Combines volume training with athletic movements.',
                'primary_focus': 'hypertrophy',
                'difficulty': 'intermediate',
                'sport': None,
                'duration_weeks': 4,
                'structure': {
                    'meta': {
                        'primary_focus': 'hypertrophy',
                        'difficulty': 'intermediate',
                        'days_per_week': 5,
                        'sport_bias': None,
                        'intensity': 'moderate'
                    },
                    'weeks': [
                        {
                            'week': 1,
                            'theme': 'Volume Base',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Gym',
                                    'duration': 75,
                                    'exercises': [
                                        {'name': 'Back Squat', 'sets': 4, 'reps': '8-10', 'rest': '2min'},
                                        {'name': 'Leg Press', 'sets': 3, 'reps': '12-15', 'rest': '2min'},
                                        {'name': 'Leg Curl', 'sets': 3, 'reps': '12', 'rest': '1.5min'},
                                    ]
                                },
                                {
                                    'day': 'tuesday',
                                    'type': 'Gym',
                                    'duration': 75,
                                    'exercises': [
                                        {'name': 'Bench Press', 'sets': 4, 'reps': '8-10', 'rest': '2min'},
                                        {'name': 'Incline Dumbbell Press', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                                        {'name': 'Cable Flyes', 'sets': 3, 'reps': '12', 'rest': '1.5min'},
                                    ]
                                },
                                {
                                    'day': 'thursday',
                                    'type': 'Gym',
                                    'duration': 75,
                                    'exercises': [
                                        {'name': 'Deadlift', 'sets': 4, 'reps': '6-8', 'rest': '3min'},
                                        {'name': 'Barbell Row', 'sets': 4, 'reps': '8-10', 'rest': '2min'},
                                        {'name': 'Lat Pulldown', 'sets': 3, 'reps': '10-12', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Gym',
                                    'duration': 60,
                                    'exercises': [
                                        {'name': 'Overhead Press', 'sets': 4, 'reps': '8-10', 'rest': '2min'},
                                        {'name': 'Lateral Raises', 'sets': 3, 'reps': '12-15', 'rest': '1.5min'},
                                        {'name': 'Rear Delt Flyes', 'sets': 3, 'reps': '12', 'rest': '1.5min'},
                                    ]
                                },
                                {
                                    'day': 'saturday',
                                    'type': 'Gym',
                                    'duration': 60,
                                    'exercises': [
                                        {'name': 'Romanian Deadlift', 'sets': 3, 'reps': '10', 'rest': '2min'},
                                        {'name': 'Leg Curl', 'sets': 3, 'reps': '12', 'rest': '1.5min'},
                                        {'name': 'Calf Raises', 'sets': 4, 'reps': '15-20', 'rest': '1min'},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'name': 'Conditioning Engine – Focus',
                'description': 'Build cardiovascular fitness and work capacity. High-intensity conditioning for athletes.',
                'primary_focus': 'conditioning',
                'difficulty': 'intermediate',
                'sport': None,
                'duration_weeks': 4,
                'structure': {
                    'meta': {
                        'primary_focus': 'conditioning',
                        'difficulty': 'intermediate',
                        'days_per_week': 4,
                        'sport_bias': None,
                        'intensity': 'high'
                    },
                    'weeks': [
                        {
                            'week': 1,
                            'theme': 'Conditioning Base',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Conditioning',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Assault Bike', 'sets': 4, 'reps': '30s on / 30s off', 'rest': '1min'},
                                        {'name': 'Burpees', 'sets': 3, 'reps': '10', 'rest': '1min'},
                                        {'name': 'Kettlebell Swings', 'sets': 3, 'reps': '15', 'rest': '1min'},
                                    ]
                                },
                                {
                                    'day': 'wednesday',
                                    'type': 'Field',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Shuttle Runs', 'sets': 5, 'reps': '40m', 'rest': '2min'},
                                        {'name': 'Sled Push', 'sets': 3, 'reps': '20m', 'rest': '2min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Conditioning',
                                    'duration': 45,
                                    'exercises': [
                                        {'name': 'Rowing Machine', 'sets': 4, 'reps': '500m', 'rest': '2min'},
                                        {'name': 'Battle Ropes', 'sets': 3, 'reps': '30s', 'rest': '1min'},
                                    ]
                                },
                                {
                                    'day': 'saturday',
                                    'type': 'Conditioning',
                                    'duration': 30,
                                    'exercises': [
                                        {'name': 'Circuit Training', 'sets': 3, 'reps': '5 exercises', 'rest': '2min'},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            },
            {
                'name': 'Return to Training – Foundation',
                'description': 'Gentle reintroduction to training after injury or time off. Low intensity, movement-focused.',
                'primary_focus': 'base',
                'difficulty': 'beginner',
                'sport': None,
                'duration_weeks': 4,
                'structure': {
                    'meta': {
                        'primary_focus': 'base',
                        'difficulty': 'beginner',
                        'days_per_week': 3,
                        'sport_bias': None,
                        'intensity': 'low'
                    },
                    'weeks': [
                        {
                            'week': 1,
                            'theme': 'Gentle Reintroduction',
                            'days': [
                                {
                                    'day': 'monday',
                                    'type': 'Mobility',
                                    'duration': 30,
                                    'exercises': [
                                        {'name': 'Cat-Cow', 'sets': 2, 'reps': '10', 'rest': '30s'},
                                        {'name': 'Hip Circles', 'sets': 2, 'reps': '10 each', 'rest': '30s'},
                                        {'name': 'Shoulder Rolls', 'sets': 2, 'reps': '10', 'rest': '30s'},
                                    ]
                                },
                                {
                                    'day': 'wednesday',
                                    'type': 'Gym',
                                    'duration': 30,
                                    'exercises': [
                                        {'name': 'Bodyweight Squat', 'sets': 2, 'reps': '8', 'rest': '2min'},
                                        {'name': 'Wall Push-ups', 'sets': 2, 'reps': '8', 'rest': '2min'},
                                        {'name': 'Plank', 'sets': 2, 'reps': '20s', 'rest': '1min'},
                                    ]
                                },
                                {
                                    'day': 'friday',
                                    'type': 'Mobility',
                                    'duration': 30,
                                    'exercises': [
                                        {'name': 'Walking', 'sets': 1, 'reps': '10min', 'rest': '0'},
                                        {'name': 'Light Stretching', 'sets': 1, 'reps': '10min', 'rest': '0'},
                                    ]
                                }
                            ]
                        }
                    ]
                }
            }
        ]

        created_count = 0
        for template_data in templates_data:
            template, created = ProgrammeTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Template already exists: {template.name}')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\nSuccessfully created {created_count} new templates.')
        )

