import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, RefreshCw, Target, TrendingUp, Trophy } from "lucide-react";
import Logo from "../components/Logo";

export default function Report() {
  const navigate=useNavigate();
  const report=JSON.parse(sessionStorage.getItem("ai_interview_report")||"null");
  if(!report) return <main className="center-screen"><h2>No report available yet</h2><button className="btn" onClick={()=>navigate("/setup")}>Start practicing</button></main>;
  const score=Math.max(0,Math.min(100,Number(report.overall_score)||0));
  const categories=Array.isArray(report.categories)?report.categories:[];
  const strengths=Array.isArray(report.strengths)?report.strengths:[];
  const improvements=Array.isArray(report.improvements)?report.improvements:[];
  return <main className="report-shell"><nav className="nav"><Logo/><button className="text-btn" onClick={()=>navigate("/")}><ArrowLeft size={16}/> Home</button></nav>
    <div className="report-wrap"><div className="eyebrow"><Trophy size={15}/> INTERVIEW COMPLETE</div><h1>Your practice report.</h1><p className="muted">A snapshot of how you performed and what to work on next.</p>
      <div className="score-card"><div className="score-ring" style={{"--score":`${score*3.6}deg`}}><div><strong>{score}</strong><small>/ 100</small></div></div><div><span className="eyebrow">OVERALL PERFORMANCE</span><h2>{report.summary_title || (score>=80?"Great work!":score>=60?"Good progress!":"A useful first step.")}</h2><p>{report.summary || "Review the feedback below and use it to guide your next practice session."}</p></div></div>
      <section className="report-section"><h2><Target size={19}/> Skill breakdown</h2><div className="skill-list">{categories.map((c,i)=><div className="skill" key={i}><div><b>{c.name || c.category || "Skill"}</b><span>{Number(c.score)||0}/100</span></div><div className="bar"><i style={{width:`${Math.max(0,Math.min(100,Number(c.score)||0))}%`}}/></div><small>{c.feedback || ""}</small></div>)}</div></section>
      <div className="report-columns"><section className="report-section"><h2><CheckCircle2 size={19}/> Your strengths</h2>{strengths.length?<ul>{strengths.map((x,i)=><li key={i}>{typeof x==="string"?x:x.point}</li>)}</ul>:<p className="muted">Keep practicing to identify your strongest areas.</p>}</section><section className="report-section"><h2><TrendingUp size={19}/> Improve next</h2>{improvements.length?<ul>{improvements.map((x,i)=><li key={i}>{typeof x==="string"?x:x.point}</li>)}</ul>:<p className="muted">Keep practicing and build on your answers.</p>}</section></div>
      <button className="btn" onClick={()=>{sessionStorage.removeItem("ai_interview_report");navigate("/setup");}}>Practice again <RefreshCw size={16}/></button>
      <button className="text-btn report-home" onClick={()=>navigate("/")}>Back to home <ArrowRight size={15}/></button>
    </div>
  </main>;
}