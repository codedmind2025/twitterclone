from django.db import models
from django.contrib.auth.models import User
from accounts.models import Profile


# Create your models here.
class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    tweet = models.ForeignKey("Tweet", blank=True, null=True, on_delete=models.SET_NULL)

    def __str__(self):
        if self.user:
            return str(self.user)
        return 'user deleted'


class Tweet(models.Model):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.TextField(blank=True, null=True)
    parent = models.ForeignKey("self", blank=True, null=True, on_delete=models.SET_NULL, related_name='retweets')
    img = models.FileField(blank=True, null=True, upload_to="tweets/images")
    date_created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.content

    @property
    def is_retweet(self):
        if self.parent:
            return True
        return False
