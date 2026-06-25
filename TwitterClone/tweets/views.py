from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
# from .models import Tweet, Like
# from .forms import TweetForm
# from django.contrib.auth.models import User
# from .serializer import TweetSerializer, ActionSerializer
# from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q


def home(request, *args, **kwargs):
    return render(request, 'home.html', {
        'user': request.user,
    })


@login_required()
def create(request, *args, **kwargs):
    if request.method == 'POST':
        tweet = TweetForm(request.POST, request.FILES)
        if tweet.is_valid():
            obj = tweet.save(commit=False)
            obj.owner = request.user
            obj.save()
            return redirect("/")
    return redirect("/")


# @api_view(['POST', 'GET'])
# @permission_classes([IsAuthenticated])
def action_serialize(request, *args, **kwargs):
    curr_user_id = request.user.id
    serialized = ActionSerializer(data=request.data)
    if serialized.is_valid(raise_exception=True):
        serialized_data = serialized.data
        tweet_id = serialized_data.get("id")
        action = serialized_data.get("action")
        tweet = Tweet.objects.filter(id=tweet_id).first()
        if tweet:
            like = tweet.like_set.filter(user_id=curr_user_id)
            if action == 'like':
                if not like:
                    Like.objects.create(tweet=tweet, user=User.objects.get(id=curr_user_id)).save()
                    return Response({"message": "liked"})
                return Response({"message": "already liked"})
            if action == 'unlike':
                if like:
                    like.delete()
                    return Response({"message": "like deleted"})
                return Response({"message": "no like was associated"})
        return Response({"message": "tweet not found"}, status=404)


# @api_view(['GET'])
def tweet_serialize(request):
    if request.user.is_authenticated:
        usr = request.user
        following_users_id = usr.following.values_list("usr_id")
        # following_users_id.append(usr.id)
        tweets = Tweet.objects.filter(
            Q(owner_id__in=following_users_id) |
            Q(owner_id=usr.id)
        ).order_by('-date_created')
        serailized = TweetSerializer(tweets, many=True, context={'request': request})
        return Response(serailized.data)
    tweet = Tweet.objects.all()
    serailized = TweetSerializer(tweet, many=True, context={'request': request})
    return Response(serailized.data)


@login_required()
def retweet(request, tweet_id, *args, **kwargs):
    tweet = get_object_or_404(Tweet, id=tweet_id)
    if request.method == 'POST':
        retweet_content = request.POST["retweet-content"]
        if retweet_content == "":
            retweet_content = "This is a Retweet"

        t1 = Tweet.objects.create(content=retweet_content,
                                  owner=request.user,
                                  parent=tweet,
                                  )
        return redirect("/")
    return render(request, 'tweetManager/retweet.html', context={
        'tweet': tweet,
        'user': request.user,
    })


# @api_view(['GET'])
def tweet_serialize_global(request):
    serailized = TweetSerializer(Tweet.objects.all(), many=True, context={'request': request})
    return Response(serailized.data)
