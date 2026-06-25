from .models import Profile
from django import forms


class ProfileCreate(forms.ModelForm):

    class Meta:
        model = Profile
        exclude = ['usr', 'follower']

        # widgets = {
        #     'bio': forms.Textarea(
        #         attrs={
        #             'class': 'form-control'
        #         }
        #     ),
        #
        # }
