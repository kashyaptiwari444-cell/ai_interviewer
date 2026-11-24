import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AudioLines, Check, Mic, MicOff, Send, Square, Volume2, BrainCircuit } from "lucide-react";
import Logo from "../components/Logo";
import { endInterview, sendAnswer } from "../services/api";

export default function Interview() {
  const navigate = useNavigate();
  const saved = JSON.parse(sessionStorage.getItem("ai_interview_session") || "null");
  const [session] = useState(saved);
  const [messages,setMessages] = useState(saved?.first_question ? [{role:"ai",text:saved.first_question}] : []);
  const [answer,setAnswer] = useState("");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [listening,setListening] = useState(false);
  const [speaking,setSpeaking] = useState(false);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages,busy]);
  useEffect(()=>()=>{ recognitionRef.current?.stop(); window.speechSynthesis?.cancel(); },[]);
  if (!session?.session_id) return <main className="center-screen"><h2>No active interview</h2><button className="btn" onClick={()=>navigate("/setup")}>Start a session</button></main>;
  const latestQuestion = [...messages].reverse().find(m=>m.role==="ai")?.text || "";
  function toggleMic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setError("Speech recognition is not supported in this browser. Try Chrome, or type your answer."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
    const recognition = new SR(); recognition.lang="en-IN"; recognition.interimResults=true; recognition.continuous=true;
    recognition.onresult = e => { let text=""; for(let i=e.resultIndex;i<e.results.length;i++) text += e.results[i][0].transcript; setAnswer(p=>p+" "+text); };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current=recognition; recognition.start(); setListening(true); setError("");
  }
  function speakQuestion() {
    if (!("speechSynthesis" in window)) { setError("Text-to-speech is not supported in this browser."); return; }
    window.speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(latestQuestion); u.lang="en-IN"; u.onstart=()=>setSpeaking(true); u.onend=()=>setSpeaking(false); window.speechSynthesis.speak(u);
  }
  async function finish() {
    setBusy(true); setError("");
    try { const {data}=await endInterview(session.session_id); sessionStorage.setItem("ai_interview_report",JSON.stringify(data.report || data)); sessionStorage.removeItem("ai_interview_session"); navigate("/report"); }
    catch(e){setError(e.response?.data?.error || "Could not generate report. Please try again.");}
    finally{setBusy(false);}
  }
  async function submit() {
    const clean=answer.trim(); if(!clean || busy) return;
    setAnswer(""); setMessages(p=>[...p,{role:"user",text:clean}]); setBusy(true); setError("");
    try {
      const {data}=await sendAnswer({session_id:session.session_id,answer:clean});
      if(data.feedback) setMessages(p=>[...p,{role:"feedback",text:data.feedback}]);
      if(data.question || data.message) setMessages(p=>[...p,{role:"ai",text:data.question || data.message}]);
      if(data.is_complete) { await finish(); }
    } catch(e){setError(e.response?.data?.error || "Could not send your answer. Please retry.");}
    finally{setBusy(false);}
  }
  return <main className="interview-shell"><header className="interview-header"><Logo/><div className="session-info"><span className="live"><i></i> SESSION IN PROGRESS</span><b>{session.role}</b></div><button className="btn btn-small btn-outline" onClick={finish} disabled={busy}><Square size={14}/> End interview</button></header>
    <div className="chat-layout"><aside className="interview-aside"><div className="aside-icon"><BrainCircuit size={27}/></div><h3>You've got this.</h3><p>Take a moment to think. Explain your reasoning, and use examples from your projects whenever possible.</p><div className="aside-tip"><b>Interview tip</b><p>Structure answers clearly: explain the situation, your action, and the result.</p></div><div className="aside-meta"><span>ROLE</span><b>{session.role}</b><span>MODE</span><b>{session.mode}</b></div></aside>
      <section className="chat-panel"><div className="chat-top"><div><span className="eyebrow">YOUR MOCK INTERVIEW</span><h2>Interview room</h2></div><button className="icon-btn" title="Read latest question aloud" onClick={speakQuestion}><Volume2 size={18}/></button></div>
        <div className="messages">{messages.map((m,i)=><div key={i} className={`message-row ${m.role}`}><div className="message-avatar">{m.role==="ai"?<BrainCircuit size={17}/>:m.role==="feedback"?<Check size={16}/>: "You"}</div><div className="message-content"><span className="message-name">{m.role==="ai"?"AI INTERVIEWER":m.role==="feedback"?"QUICK FEEDBACK":"YOUR ANSWER"}</span><div className={`bubble ${m.role}`}>{m.text}</div></div></div>)}{busy&&<div className="typing"><i></i><i></i><i></i><span>Thinking…</span></div>}<div ref={bottomRef}/></div>
        {error&&<div className="error chat-error">{error}</div>}
        <div className="composer"><textarea value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();submit();}}} placeholder="Type your answer here… (Enter to send, Shift + Enter for a new line)" rows={3}/>
          <div className="composer-bottom"><div className="composer-tools"><button className={`tool-btn ${listening?"recording":""}`} onClick={toggleMic}><Mic size={16}/>{listening?"Listening…":"Use microphone"}</button>{speaking&&<span className="muted"><AudioLines size={14}/> Speaking question</span>}</div><button className="btn btn-send" onClick={submit} disabled={busy||!answer.trim()}>{busy?"Please wait":"Send answer"} <Send size={15}/></button></div>
        </div>
      </section>
    </div>
  </main>;
}