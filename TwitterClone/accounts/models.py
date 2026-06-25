from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.db.models import FileField


# Create your models here.
def auto_prof_create(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(usr=instance)


class Profile(models.Model):
    usr = models.OneToOneField(User, on_delete=models.CASCADE, null=True)
    bio = models.TextField(null=True, blank=True)
    prof_img = models.ImageField(blank=True, upload_to='accounts/profile_img', null=True)
    follower = models.ManyToManyField(User, blank=True, related_name='following')
    banner_img = models.ImageField(blank=True, upload_to='accounts/banner_img', null=True)

    def __str__(self):
        return self.usr.username


post_save.connect(auto_prof_create, sender=User)
