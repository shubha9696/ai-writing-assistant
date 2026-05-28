from django.db import models
from django.contrib.auth.models import User

class RewriteHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='rewrites')
    original_text = models.TextField()
    output_text = models.TextField()
    mode = models.CharField(max_length=20)  # e.g., 'rewrite', 'summarise'
    tone = models.CharField(max_length=30, blank=True, null=True)  # e.g., 'professional', 'casual', etc.
    length = models.CharField(max_length=20, blank=True, null=True)  # e.g., 'shorter', 'longer', 'same'
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Rewrite Histories'

    def __str__(self):
        return f"{self.user.username} - {self.mode} - {self.created_at.strftime('%Y-%m-%d %H:%M')}"

