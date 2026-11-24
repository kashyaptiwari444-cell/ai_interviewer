import json
import re
from django.conf import settings


def _client():
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("Gemini API key missing")

    from google import genai
    from google.genai import types

    return genai.Client(
        api_key=settings.GEMINI_API_KEY,
        http_options=types.HttpOptions(
            timeout=180000
        )
    )
    
    
def _extract_json(text):
    if not text:
        raise ValueError("Gemini returned an empty response.")
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\\{.*\\}", cleaned, flags=re.DOTALL)
        if match:
            return json.loads(match.group(0))
        raise ValueError("AI response could not be parsed.")


def generate_json(prompt):
    client = _client()
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"},
        )
        return _extract_json(response.text)
    finally:
        client.close()

def first_question(session):
    prompt = f"""
You are a professional but friendly technical interviewer for students and job candidates.
Create the opening question for a mock interview. Ask exactly ONE clear question and no greeting.
Role: {session['role']}
Experience: {session['experience']}
Difficulty: {session['difficulty']}
Interview style: mix role-specific technical, practical and behavioural questions where suitable.
Return JSON only: {{"question":"..."}}
"""
    data = generate_json(prompt)
    return str(data.get("question", "")).strip()

def next_turn(session, answer):
    transcript = session["transcript"]
    transcript.append({"question": session["current_question"], "answer": answer})
    count = len(transcript)
    max_questions = session["max_questions"]
    history = "\n".join(
        f"Q{i+1}: {item['question']}\nCandidate: {item['answer']}"
        for i, item in enumerate(transcript)
    )
    complete = count >= max_questions
    prompt = f"""
You are conducting a helpful, realistic mock interview for a student.
Role: {session['role']}
Experience: {session['experience']}
Difficulty: {session['difficulty']}
This is answer {count} of {max_questions}. The interview must finish after this answer if that count reaches the maximum.
Conversation so far:
{history}

Evaluate only the latest answer. Give concise, kind but honest feedback in 1-2 sentences.
If more questions remain, ask exactly ONE relevant next question. Vary question types and use a follow-up if useful.
If this is the final answer, do not ask another question; set question to an empty string.
Return valid JSON:
{{"feedback":"short feedback","question":"next question or empty string","is_complete":{str(complete).lower()}}}
"""
    data = generate_json(prompt)
    data["feedback"] = str(data.get("feedback", "Thank you. Let's continue.")).strip()
    data["question"] = str(data.get("question", "")).strip()
    data["is_complete"] = bool(data.get("is_complete", complete)) or complete
    if not data["is_complete"] and not data["question"]:
        data["question"] = "Can you explain one practical example related to this topic?"
    session["evaluations"].append({"answer": answer, "feedback": data["feedback"]})
    if data["question"]:
        session["current_question"] = data["question"]
    return data

def build_report(session):
    history = "\n".join(
        f"Question: {x['question']}\nAnswer: {x['answer']}"
        for x in session["transcript"]
    )
    prompt = f"""
You are an experienced interviewer evaluating a mock interview. Be constructive and specific.
Candidate role: {session['role']}
Experience: {session['experience']}
Difficulty: {session['difficulty']}
Interview transcript:
{history}
Answer feedback:
{json.dumps(session['evaluations'], ensure_ascii=False)}
Score fairly based on relevance, correctness, clarity, structure and practical depth.
Return JSON with this exact shape:
{{
 "overall_score": 0,
 "summary_title": "short title",
 "summary": "2-3 sentence overall summary",
 "categories": [
   {{"name":"Technical knowledge","score":0,"feedback":"..."}},
   {{"name":"Communication","score":0,"feedback":"..."}},
   {{"name":"Problem solving","score":0,"feedback":"..."}},
   {{"name":"Answer structure","score":0,"feedback":"..."}}
 ],
 "strengths": ["...","..."],
 "improvements": ["...","...","..."]
}}
Use integer scores from 0 to 100. Be fair to a fresher; do not invent experience or claim facts not in answers.
"""
    report = generate_json(prompt)
    report["overall_score"] = max(0, min(100, int(report.get("overall_score", 0))))
    report.setdefault("categories", [])
    report.setdefault("strengths", [])
    report.setdefault("improvements", [])
    report.setdefault("summary", "Review the feedback and keep practicing.")
    return report