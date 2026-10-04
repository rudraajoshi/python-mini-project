from django.contrib import admin
from django.urls import path
from api import views

urlpatterns = [
    path("admin/", admin.site.urls), path("api/health/", views.health),
    path("api/auth/register/", views.register), path("api/auth/login/", views.login),
    path("api/auth/me/", views.me), path("api/auth/logout/", views.logout),
    path("api/auth/token/refresh/", views.refresh),
    path("api/collections/", views.collections), path("api/collections/<uuid:pk>/", views.collection_detail),
    path("api/documents/", views.documents), path("api/documents/<uuid:pk>/", views.document_detail),
    path("api/documents/<uuid:pk>/status/", views.document_status), path("api/documents/<uuid:pk>/summarize/", views.summarize),
    path("api/search/", views.search), path("api/search/history/", views.search_history),
    path("api/chat/ask/", views.ask), path("api/chat/sessions/", views.sessions), path("api/chat/sessions/<uuid:pk>/", views.session_detail),
    path("api/bookmarks/", views.bookmarks), path("api/bookmarks/<uuid:pk>/", views.bookmark_detail),
    path("api/activity/", views.activity),
]
