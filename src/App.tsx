import { useMemo, useState } from 'react';
import { Activity, Anchor, BarChart3, Bot, ChevronDown, Gauge, Menu, Send, Ship, Sparkles, Target, TrendingUp, X } from 'lucide-react';

const routes = [
  ['Australia','East Coast India','Panamax'], ['Brazil','East Coast India','Capesize'],
  ['Indonesia','East Coast India','Supramax'], ['South Africa','East Coast India','Bulk Carrier'],
  ['USA Gulf','East Coast India','Panamax'],
];

const demo = {
  rate: 28.42, forecast: 30.18, change: 6.2, confidence: 91.4,
  savings: 184000, risk: 'LOW', model: 'Gradient Boosting', congestion: 'Moderate',
};

const fallback = (q:string) => {
  const s=q.toLowerCase();
  if(s.includes('rate') || s.includes('forecast')) return `The selected corridor is forecast at $${demo.forecast.toFixed(2)}/t, up ${demo.change}% from the current $${demo.rate.toFixed(2)}/t. Model confidence is ${demo.confidence}%.`;
  if(s.includes('vessel') || s.includes('charter')) return `For the selected cargo profile, Panamax is the recommended charter in demo mode. Estimated decision savings are ₹${(demo.savings/100000).toFixed(1)}L with ${demo.risk.toLowerCase()} risk.`;
  if(s.includes('risk') || s.includes('congestion')) return `Current demo risk is ${demo.risk}. Port congestion is ${demo.congestion}; the decision engine accounts for this in the charter recommendation.`;
  return 'I can explain the freight forecast, vessel fit, congestion, charter recommendation, optimization and What-If scenarios using the bundled SIH demo data.';
};

export function App(){
  const [route,setRoute]=useState(0); const [horizon,setHorizon]=useState(30); const [ai,setAi]=useState(false); const [q,setQ]=useState('');
  const [messages,setMessages]=useState([{role:'ai',text:'Freight AI is ready. Ask about the forecast, vessel choice, risk or chartering decision.'}]);
  const r=routes[route];
  const forecast=demo.forecast + (horizon===7?-1.3:horizon===90?2.4:0);
  const send=async()=>{const text=q.trim();if(!text)return;setQ('');setMessages(m=>[...m,{role:'user',text}]);try{const res=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,context:{origin:r[0],destination:r[1],vessel:r[2],horizon}})});if(!res.ok)throw new Error();const d=await res.json();setMessages(m=>[...m,{role:'ai',text:String(d.answer||d.message||fallback(text))}]);}catch{setMessages(m=>[...m,{role:'ai',text:fallback(text)}]);}};
  const spark=useMemo(()=>Array.from({length:24},(_,i)=>45+Math.sin(i*.62)*9+i*.55+(i>15?(i-15)*.8:0)),[]);
  return <div className="app">
    <aside className="sidebar"><div className="brand"><span className="brandIcon"><Anchor size={19}/></span><div><b>FREIGHT</b><small>INTELLIGENCE</small></div></div><div className="demo"><span/> DEMO MODE <em>LOCAL</em></div><nav>{[['Command Center',Gauge],['Forecast Intelligence',TrendingUp],['Maritime Operations',Ship],['Charter Decision',Target],['Optimization',BarChart3],['Model Intelligence',Activity]].map(([label,I],i)=><button className={i===0?'active':''} key={String(label)}><I size={17}/>{String(label)}</button>)}</nav><div className="sideFoot">SIH 2026 · PS 26006<br/><span>No Render backend required</span></div></aside>
    <main><header><button className="mobileMenu"><Menu size={20}/></button><div><div className="eyebrow">SIH 2026 · DECISION SUPPORT</div><h1>Command Center <span className="pill">LIVE DEMO</span></h1><p>Intelligent Freight Forecasting & Chartering Decision Support</p></div><button className="aiTop" onClick={()=>setAi(true)}><Sparkles size={16}/> Ask Freight AI</button></header>
      <section className="routebar"><div className="routeSelect"><span>ORIGIN</span><select value={route} onChange={e=>setRoute(+e.target.value)}>{routes.map((x,i)=><option key={i} value={i}>{x[0]}</option>)}</select></div><div className="arrow">→</div><div className="routeSelect"><span>DESTINATION</span><strong>{r[1]}</strong></div><div className="routeSelect"><span>VESSEL</span><select value={r[2]} onChange={()=>{}}><option>{r[2]}</option></select></div><div className="routeSelect"><span>HORIZON</span><div className="horizons">{[7,30,90].map(x=><button className={horizon===x?'sel':''} onClick={()=>setHorizon(x)} key={x}>{x}D</button>)}</div></div></section>
      <section className="heroGrid"><div className="heroCard"><div className="cardTop"><div><span className="label">CURRENT FREIGHT RATE</span><div className="big">${demo.rate.toFixed(2)}<small>/t</small></div></div><span className="up">▲ {demo.change}%</span></div><div className="chart"><div className="gridlines"/ ><svg viewBox="0 0 700 220" preserveAspectRatio="none"><polyline fill="none" stroke="currentColor" strokeWidth="3" points={spark.map((v,i)=>`${i/23*700},${220-v*2.8}`).join(' ')}/></svg><div className="forecastLine"/><span className="chartTag">FORECAST</span></div><div className="chartFoot"><span>HISTORICAL</span><span>MODEL FORECAST · {horizon}D</span></div></div>
      <div className="kpis"><K label={`${horizon}D FORECAST`} value={`$${forecast.toFixed(2)}`} sub={demo.model}/><K label="EXPECTED CHANGE" value={`+${demo.change}%`} sub="vs current rate"/><K label="CONFIDENCE" value={`${demo.confidence}%`} sub="model confidence"/><K label="CHARTER SAVING" value={`₹${(demo.savings/100000).toFixed(1)}L`} sub="estimated"/></div></section>
      <section className="lower"><div className="panel"><div className="panelHead"><div><span className="label">DECISION PIPELINE</span><h2>Recommended charter action</h2></div><span className="risk">● {demo.risk} RISK</span></div><div className="pipeline"><Step n="01" t="MARKET" v={`$${demo.rate}/t`}/><Step n="02" t="FORECAST" v={`$${forecast.toFixed(2)}/t`}/><Step n="03" t="VESSEL FIT" v={r[2]}/><Step n="04" t="ACTION" v="CHARTER NOW" hot/></div><div className="recommend"><div><b>Charter {r[2]} now</b><p>Forecast momentum is favorable. Locking the vessel on the selected corridor minimizes expected delivered cost.</p></div><strong>₹{(demo.savings/100000).toFixed(1)}L<br/><small>EXPECTED SAVING</small></strong></div></div><div className="panel signal"><span className="label">MARKET SIGNALS</span><h2>Operating conditions</h2><div className="signalRow"><span>Port congestion</span><b>{demo.congestion}</b></div><div className="signalRow"><span>Freight momentum</span><b className="green">Bullish</b></div><div className="signalRow"><span>Model status</span><b className="green">Ready</b></div><button onClick={()=>setAi(true)} className="ask"><Bot size={15}/> Explain this decision</button></div></section>
    </main>
    {ai&&<div className="overlay"><div className="chat"><div className="chatHead"><div><Bot size={18}/><b>Freight AI</b><span>LLM + local demo context</span></div><button onClick={()=>setAi(false)}><X size={18}/></button></div><div className="msgs">{messages.map((m,i)=><div key={i} className={m.role}>{m.text}</div>)}</div><div className="composer"><input value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()} placeholder="Ask about this route, forecast or charter…"/><button onClick={send}><Send size={16}/></button></div></div></div>}
  </div>
}
function K({label,value,sub}:{label:string,value:string,sub:string}){return <div className="kpi"><span className="label">{label}</span><b>{value}</b><small>{sub}</small></div>}
function Step({n,t,v,hot=false}:{n:string,t:string,v:string,hot?:boolean}){return <div className={'step '+(hot?'hot':'')}><small>{n}</small><span>{t}</span><b>{v}</b></div>}
