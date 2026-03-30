from django.urls import path
from .views import LoginView, complete_setup, get_user_profile, IdentityPasswordResetView


urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('complete-setup/', complete_setup, name='complete-setup'),
    path('profile/', get_user_profile, name='user-profile'),
    path('identity-reset/', IdentityPasswordResetView.as_view(), name='identity_reset'),
]