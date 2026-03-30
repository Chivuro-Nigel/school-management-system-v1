from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudentResultViewSet, PostResultsView, DashboardStatsView, EventViewSet, ClassSectionViewSet, SubjectViewSet

router = DefaultRouter()
router.register(r'my-results', StudentResultViewSet, basename='my-results')
router.register(r'events', EventViewSet, basename='event')
router.register(r'classes', ClassSectionViewSet)
router.register(r'subjects', SubjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('post-results/', PostResultsView.as_view(), name='post-results'),
    path('dashboard-stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
]