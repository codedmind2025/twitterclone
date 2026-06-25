from django.forms import ModelForm
from .models import Tweet
from django import forms


class TweetForm(ModelForm):
    class Meta:
        model = Tweet
        fields = ['content', 'img']
        # widgets = {
        #     'content': forms.Textarea(attrs={
        #         'class': 'form-control',
        #         'placeholder': 'Your tweet...',
        #
        #     })
        # }


"""

<form class="md-form">
  <div class="file-field">
    <div class="btn btn-primary btn-sm float-left">
      <span>Choose file</span>
      <input type="file">
    </div>
    <div class="file-path-wrapper">
      <input class="file-path validate" type="text" placeholder="Upload your file">
    </div>
  </div>
</form>

"""