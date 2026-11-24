import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Clock3, Mic, MessageSquareText, Sparkles } from "lucide-react";
import Logo from "../components/Logo";
import { startInterview } from "../services/api";

const roles = ["Python Full Stack Developer", "DevOps Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "HR / Behavioural", "Other"];
export default function Setup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: roles[0], customRole: "", experience: "Fresher", difficulty: "Beginner", duration: "15", mode: "both" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const update = (key, value) => setForm(p => ({...p, [key]: value}));
  async function begin() {
    setBusy(true); setError("");
    try {
      const payload = {...form, role: form.role === "Other" ? form.customRole.trim() : form.role};
      if (!payload.role) throw new Error("Please enter your target role.");
      const {data} = await startInterview(payload);
      sessionStorage.setItem("ai_interview_session", JSON.stringify({session_id:data.session_id, role:payload.role, first_question:data.first_question || data.question || data.message, mode:form.mode}));
      navigate("/interview");
    } catch (e) { setError(e.response?.data?.error || e.message || "Could not start interview. Check that the backend is running."); }
    finally { setBusy(false); }
  }
  return <main className="setup-shell"><nav className="nav"><Logo/><button className="text-btn" onClick={()=>navigate("/")}><ArrowLeft size={16}/> Back home</button></nav>
    <div className="setup-wrap"><div className="eyebrow"><Sparkles size={15}/> PERSONALISE YOUR SESSION</div><h1>Set up your interview.</h1><p className="muted">A few details help the interviewer choose the right questions.</p>
      <div className="setup-card">
        <label>What role are you preparing for?</label><select value={form.role} onChange={e=>update("role",e.target.value)}>{roles.map(r=><option key={r}>{r}</option>)}</select>
        {form.role==="Other" && <input placeholder="Enter job role" value={form.customRole} onChange={e=>update("customRole",e.target.value)}/>}
        <div className="field-row"><div><label>Your experience</label><select value={form.experience} onChange={e=>update("experience",e.target.value)}>{["Fresher","Less than 1 year","1–3 years","3–5 years","5+ years"].map(x=><option key={x}>{x}</option>)}</select></div><div><label>Difficulty</label><select value={form.difficulty} onChange={e=>update("difficulty",e.target.value)}>{["Beginner","Intermediate","Advanced","Mixed"].map(x=><option key={x}>{x}</option>)}</select></div></div>
        <label><Clock3 size={15}/> Interview duration</label><div className="choice-row">{["10","15","20","30"].map(x=><button key={x} className={`choice ${form.duration===x?"selected":""}`} onClick={()=>update("duration",x)}>{x} min</button>)}</div>
        <label>How would you like to answer?</label><div className="mode-row">
          <button className={`mode-card ${form.mode==="text"?"selected":""}`} onClick={()=>update("mode","text")}><MessageSquareText/><b>Text</b><small>Type your answers</small></button>
          <button className={`mode-card ${form.mode==="voice"?"selected":""}`} onClick={()=>update("mode","voice")}><Mic/><b>Voice</b><small>Speak your answers</small></button>
          <button className={`mode-card ${form.mode==="both"?"selected":""}`} onClick={()=>update("mode","both")}><Sparkles/><b>Both</b><small>Switch anytime</small></button>
        </div>
        {error && <div className="error">{error}</div>}
        <button className="btn full-btn" onClick={begin} disabled={busy}>{busy?"Preparing your interview…":"Start interview"} <ArrowRight size={18}/></button>
        <p className="privacy-note">Your session is temporary. This MVP does not save interview data to a database.</p>
      </div>
    </div>
  </main>;
}