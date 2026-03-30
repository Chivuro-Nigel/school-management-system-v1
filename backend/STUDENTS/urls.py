from django.urls import path
from .views import StudentMeView, StudentListView, StudentUpdateView, StudentDeleteView, StudentCreateView, StudentBulkCreateView

urlpatterns = [
    path('me/', StudentMeView.as_view(), name='student-me'),
    path('list/', StudentListView.as_view(), name='student-list-for-marks'),
    path('update/<int:id>/', StudentUpdateView.as_view(), name='student-update'),
    path('delete/<int:id>/', StudentDeleteView.as_view(), name='student-delete'),
    path('create/', StudentCreateView.as_view(), name='student-delete'),
    path('bulk-create/', StudentBulkCreateView.as_view(), name='student-bulk-create'),
]