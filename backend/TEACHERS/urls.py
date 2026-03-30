from django.urls import path
from .views import (
    TeacherAssignmentsView, 
    TeacherListView, 
    TeacherUpdateView,
    TeacherDeleteView,
    TeacherCreateView
    )


urlpatterns = [
    path('my-assignments/', TeacherAssignmentsView.as_view(), name='teacher-assignments'),
    path('list/', TeacherListView.as_view(), name='teacher-list'),
    path('create/', TeacherCreateView.as_view(), name='teacher-create'),
    path('<str:user_id>/update/', TeacherUpdateView.as_view(), name='teacher-update'),
    path('<str:user_id>/delete/', TeacherDeleteView.as_view(), name='teacher-delete'),
    
]