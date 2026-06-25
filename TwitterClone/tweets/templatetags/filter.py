from django import template
from ..models import Tweet

register = template.Library()


def liked_or_unliked(value : Tweet, user_id : int = 0):
    likes = value.like_set.filter(user_id=user_id)
    if likes:
        return True
    return False

register.filter('liked_or_unliked', liked_or_unliked)
