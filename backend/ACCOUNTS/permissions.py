from rest_framework import permissions

class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_teacher)

class IsStudent(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_student)
    

class IsOwnerOrIsTeacher(permissions.BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.user.is_teacher:
            return True
        return obj.user == request.user