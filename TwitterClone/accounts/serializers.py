from django.contrib.auth.models import User
from rest_framework.serializers import ModelSerializer
from .models import Profile
from rest_framework import serializers
from tweets.serializer import TweetSerializer


class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name']


class ProfileSerializer(ModelSerializer):
    followers = serializers.SerializerMethodField('get_followers')
    following = serializers.SerializerMethodField()
    prof_user = serializers.SerializerMethodField()
    all_tweets = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()


    class Meta:
        model = Profile
        fields = ['bio', 'prof_img', 'banner_img', 'followers', 'prof_user', 'following', 'all_tweets', 'is_following']

    def get_followers(self, obj: Profile):
        return obj.follower.all().count()

    def get_prof_user(self, obj: Profile):
        usr = obj.usr
        return UserSerializer(usr).data

    def get_following(self, obj: Profile):
        usr = obj.usr
        return usr.following.all().count()

    def get_all_tweets(self, obj: Profile):
        context = self.context
        request = context.get('request')
        usr = obj.usr
        all_tweets = usr.tweet_set.all()
        return TweetSerializer(all_tweets, many=True, context={'request':request}).data

    def get_is_following(self, obj:Profile):
        context = self.context
        request = context.get('request')
        usr = request.user
        if usr == obj.usr:
            return None
        if obj.follower.filter(id=usr.id).exists():
            return True
        return False


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    pswd = serializers.CharField()


class UserCreateSerializer(serializers.Serializer):
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    email = serializers.EmailField()
    username = serializers.CharField()
    password1 = serializers.CharField()
    password2 = serializers.CharField()

class ProfileUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = Profile
        fields = ['bio', 'prof_img', 'banner_img']
