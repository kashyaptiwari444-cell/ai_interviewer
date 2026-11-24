import { useNavigate } from "react-router-dom";
import { ArrowRight, AudioLines, BrainCircuit, ChartNoAxesCombined, Code2, MessageSquareText, ShieldCheck, Sparkles } from "lucide-react";
import Logo from "../components/Logo";

const roles = ["Python Full Stack Developer", "DevOps Engineer", "Frontend Developer", "Backend Developer", "Data Analyst", "HR / Behavioural"];
export default function Home() {
  const navigate = useNavigate();
  return <main className="shell">
    <nav className="nav"><Logo/><span className="nav-note">Your personal interview practice room</span><button className="btn btn-small" onClick={() => navigate("/setup")}>Start practicing <ArrowRight size={16}/></button></nav>
    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><Sparkles size={15}/> PRACTICE. IMPROVE. GET HIRED.</div>
        <h1>Interviews feel easier<br/><span>when you practice.</span></h1>
        <p className="lead">A realistic AI interviewer that asks role-specific questions, listens to your answers, and gives you a clear performance report.</p>
        <div className="hero-actions"><button className="btn" onClick={() => navigate("/setup")}>Start a mock interview <ArrowRight size={18}/></button><span className="muted">Free to start · No account needed</span></div>
        <div className="trust-row"><span><ShieldCheck size={15}/> Private practice</span><span><MessageSquareText size={15}/> Text + voice</span><span><ChartNoAxesCombined size={15}/> Actionable feedback</span></div>
      </div>
      <div className="hero-visual">
        <div className="glow"></div>
        <div className="mock-window">
          <div className="window-top"><span className="dots"><i></i><i></i><i></i></span><span>LIVE INTERVIEW SESSION</span><span className="live"><i></i> LIVE</span></div>
          <div className="interviewer-avatar"><BrainCircuit size={32}/></div>
          <div className="mock-label">AI INTERVIEWER</div>
          <h3>Let's get to know<br/>your skills.</h3>
          <p>Tell me about a project where you solved a challenging technical problem.</p>
          <div className="wave"><AudioLines size={19}/><div>{Array.from({length:28},(_,i)=><i key={i} style={{height:`${8+(i*17)%27}px`}}/>)}</div></div>
          <div className="mock-footer"><span>Voice mode ready</span><span className="pulse"></span></div>
        </div>
        <div className="float-card"><span className="float-icon"><ChartNoAxesCombined size={18}/></span><div><b>Performance report</b><small>Know what to improve next</small></div></div>
      </div>
    </section>
    <section className="section">
      <div className="section-heading"><div className="eyebrow">BUILT FOR YOUR NEXT OPPORTUNITY</div><h2>One practice room. Every role.</h2><p>Choose a job role and let the interview adapt to your goals.</p></div>
      <div className="role-grid">{roles.map((r,i)=><div className="role-chip" key={r}><span>{["🐍","⚙️","🎨","🧩","📊","🤝"][i]}</span>{r}</div>)}</div>
    </section>
    <section className="feature-grid">
      <div className="feature"><MessageSquareText/><h3>Natural conversations</h3><p>Answer by typing or use your microphone and browser voice features.</p></div>
      <div className="feature"><Code2/><h3>Role-based questions</h3><p>Practice technical, practical, and behavioural questions for your target role.</p></div>
      <div className="feature"><ChartNoAxesCombined/><h3>Useful feedback</h3><p>Get scores, strengths, improvement areas, and a focused next-step plan.</p></div>
    </section>
    <footer>AI Interviewer <span>Practice with purpose.</span></footer>
  </main>;
}