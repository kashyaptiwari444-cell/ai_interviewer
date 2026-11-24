from django.urls import path
from interviews.views import health, start_interview, chat_interview, end_interview

urlpatterns = [
    path("api/health/", health),
    path("api/interview/start/", start_interview),
    path("api/interview/chat/", chat_interview),
    path("api/interview/end/", end_interview),
]