"""
Django signals for automatic programme completion tracking.
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Session, PlayerProgramme


@receiver(post_save, sender=Session)
def check_programme_completion_on_session_save(sender, instance, **kwargs):
    """Check if programme should be marked as complete when session is saved"""
    if instance.programme and instance.completed:
        programme = instance.programme
        
        # Only check if programme is ACTIVE
        if programme.status != 'ACTIVE':
            return
        
        # Count sessions
        total_sessions = Session.objects.filter(programme=programme).count()
        completed_sessions = Session.objects.filter(programme=programme, completed=True).count()
        
        # If all sessions completed, mark programme as COMPLETED
        if total_sessions > 0 and completed_sessions == total_sessions:
            programme.status = 'COMPLETED'
            programme.save(update_fields=['status'])

