import time
import uuid
from threading import RLock

from django.conf import settings
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

from .ai import first_question, next_turn, build_report

# In-memory only: process restart clears all active interview sessions.
SESSIONS = {}
LOCK = RLock()
SESSION_TTL_SECONDS = 60 * 60 * 3

def _cleanup():
    now = time.time()
    expired = [key for key, value in SESSIONS.items() if now - value["created_at"] > SESSION_TTL_SECONDS]
    for key in expired:
        SESSIONS.pop(key, None)

def _error(message, code=400):
    return Response({"error": message}, status=code)

@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({
        "status": "ok",
        "service": "AI Interviewer API",
        "gemini_configured": bool(settings.GEMINI_API_KEY),
        "database": "not used",
    })

@api_view(["POST"])
@permission_classes([AllowAny])
def start_interview(request):
    role = str(request.data.get("role", "")).strip()
    if not role:
        return _error("Please provide a job role.")
    experience = str(request.data.get("experience", "Fresher"))[:60]
    difficulty = str(request.data.get("difficulty", "Beginner"))[:40]
    try:
        duration = max(5, min(60, int(request.data.get("duration", 15))))
    except (TypeError, ValueError):
        duration = 15
    session = {
        "role": role[:100],
        "experience": experience,
        "difficulty": difficulty,
        "duration": duration,
        "max_questions": max(3, min(10, round(duration / 2.5))),
        "transcript": [],
        "evaluations": [],
        "current_question": "",
        "created_at": time.time(),
    }
    try:
        question = first_question(session)
        if not question:
            return _error("The AI could not create a question. Please try again.", 502)
        session["current_question"] = question
        session_id = str(uuid.uuid4())
        with LOCK:
            _cleanup()
            SESSIONS[session_id] = session
        return Response({"session_id": session_id, "first_question": question, "max_questions": session["max_questions"]})
    except Exception as exc:
        return _error(str(exc), 503)

@api_view(["POST"])
@permission_classes([AllowAny])
def chat_interview(request):
    session_id = str(request.data.get("session_id", "")).strip()
    answer = str(request.data.get("answer", "")).strip()
    if not session_id or not answer:
        return _error("session_id and answer are required.")
    if len(answer) > 12000:
        return _error("Please keep each answer under 12,000 characters.")
    with LOCK:
        _cleanup()
        session = SESSIONS.get(session_id)
    if not session:
        return _error("Interview session not found or expired. Please start a new interview.", 404)
    if len(session["transcript"]) >= session["max_questions"]:
        return _error("This interview is already complete. Generate your report.")
    try:
        result = next_turn(session, answer)
        return Response({
            "feedback": result["feedback"],
            "question": result["question"],
            "is_complete": result["is_complete"],
            "answered": len(session["transcript"]),
            "total": session["max_questions"],
        })
    except Exception as exc:
        # Do not lose the candidate's answer if Gemini temporarily fails.
        if session["transcript"] and session["transcript"][-1]["answer"] == answer:
            session["transcript"].pop()
        return _error(str(exc), 503)

@api_view(["POST"])
@permission_classes([AllowAny])
def end_interview(request):
    session_id = str(request.data.get("session_id", "")).strip()
    if not session_id:
        return _error("session_id is required.")
    with LOCK:
        session = SESSIONS.get(session_id)
    if not session:
        return _error("Interview session not found or expired.", 404)
    if not session["transcript"]:
        return _error("Answer at least one question before generating a report.")
    try:
        report = build_report(session)
        with LOCK:
            SESSIONS.pop(session_id, None)
        return Response({"report": report})
    except Exception as exc:
        return _error(str(exc), 503)