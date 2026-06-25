from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, auth
from django.shortcuts import render, redirect, get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Profile
from .serializers import UserSerializer, ProfileSerializer, LoginSerializer, UserCreateSerializer, \
    ProfileUpdateSerializer


def login(request, *args, **kwargs):
    if request.user.is_authenticated:
        return redirect("/")
    if request.method == 'POST':
        username = request.POST.get('username')
        pswd = request.POST.get('pswd')
        user = auth.authenticate(request, username=username, password=pswd)
        if user:
            auth.login(request, user)
            return redirect("/")
        else:
            return redirect("accounts:login")
    return render(request, "accounts/login.html")


def logout(request, *args, **kwargs):
    if request.user.is_authenticated:
        auth.logout(request)
        return redirect("/")
    return redirect("/")


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def userinf(request):
    serialized = UserSerializer(request.user)
    return Response(serialized.data)


@api_view(['GET'])
def usr_profile_view(request, pk, *args, **kwargs):
    user_obj = get_object_or_404(User, id=pk)
    profile_obj = get_object_or_404(Profile, usr=user_obj)
    return Response(ProfileSerializer(profile_obj, context={'request': request}).data)


@api_view(['POST'])
def login_api(request):
    serialized = LoginSerializer(data=request.data)
    if serialized.is_valid():
        user = auth.authenticate(request, username=serialized.data.get('username'),
                                 password=serialized.data.get('pswd'))
        if not user:
            return Response(status=401)
        auth.login(request, user)
        return Response(status=200)
    return Response(status=400)


@api_view(['POST'])
def user_regis_api(request):
    serialized = UserCreateSerializer(data=request.data)
    if serialized.is_valid():

        email = request.data.get('email')
        username = request.data.get('username')
        password1 = request.data.get('password1')
        password2 = request.data.get('password2')

        user = User.objects.filter(email__iexact=email).first()
        user2 = User.objects.filter(username__iexact=username).first()

        if user2 or user:
            return Response({'message': 'user already exists'}, status=409)
        if password1 != password2:
            return Response(data={'message': 'paswords donot match'}, status=409)

        usr = User.objects.create_user(username=username,
                                       email=email,
                                       password=password2,
                                       first_name=request.data.get('first_name'),
                                       last_name=request.data.get('last_name')
                                       )

        usr.save()
        auth.login(request, usr)
        return Response(status=200)

    return Response({'message': 'something is not ok try again!!'})


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def prof_update_api(request, *args, **kwargs):
    prof_obj = get_object_or_404(Profile, usr=request.user)

    if request.method == 'GET':
        return Response(ProfileUpdateSerializer(prof_obj).data)

    if request.method == 'POST':
        serialized = ProfileUpdateSerializer(instance=prof_obj, data=request.data)
        if serialized.is_valid(raise_exception=True):
            serialized.save()
            first_name = request.data.get('first_name')
            last_name = request.data.get('last_name')

            usr = request.user
            usr.first_name = first_name
            usr.last_name = last_name
            usr.save()

            return Response({'message': 'saved'}, status=200)
        return Response({'message': 'invalid'}, status=400)


@login_required(login_url='/')
def prof_update(request, *args, **kwargs):
    if request.method == 'GET':
        return render(request, 'accounts/prof_update.html')


@login_required(login_url='/')
def profile_page(request, *args, **kwargs):
    return render(request, 'accounts/profile_view.html')


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def self_profile(request, *args, **kwargs):
    profile_obj = get_object_or_404(Profile, usr=request.user)
    return Response(ProfileSerializer(profile_obj, context={'request': request}).data)


@api_view(['GET'])
def search(request, term):
    results = User.objects.filter(username__icontains=term)
    if len(results) != 0:
        users = list(map(lambda x: (x.username, x.id), results))
        return Response({'results': users})
    return Response({'results': None})


def profile_view(request, pk):
    if request.user.id == pk:
        return redirect('/accounts/profile')
    else:
        return render(request, 'accounts/prof_view.html', context={'id': pk})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def profile_action(request, *args, **kwargs):
    usr_id = request.user.id
    action = request.data.get('action')
    pk = request.data.get('usr_id')
    if usr_id == pk:
        return Response({'message': 'you cant follow yourself'})

    p = get_object_or_404(Profile, usr_id=pk)


    if action == 'follow':
        # User.objects.filter(use)
        if p.follower.filter(id=usr_id).exists():
            return Response({'message': 'you are already following'})
        p.follower.add(request.user)
        return Response({'message': 'you are now a follower'}, status=200)
    if action == 'unfollow':
        if p.follower.filter(id=usr_id).exists():
            p.follower.remove(request.user)
            return Response({'message': 'you are no longer a follower'}, status=200)
        return Response({'message': 'you are not following'})
