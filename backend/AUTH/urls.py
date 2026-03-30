from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('ACCOUNTS.urls')),
    path('api/teachers/', include('TEACHERS.urls')),
    path('api/academics/', include('ACADEMICS.urls')),
    path('api/students/', include('STUDENTS.urls')),
    path('api/core/', include('CORE.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
