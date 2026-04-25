'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Utensils, Gamepad2, Bath, Megaphone, Hospital, Moon, Sun, Send, ShoppingBag, BookHeart, ListTodo, Pencil, Check, X, Sparkles, Lock, Heart, Mic, MicOff, Volume2, VolumeX, ChevronRight, LogOut, User, Joystick } from 'lucide-react';
import type { PetStatus, PetDNA, DailyTask, JournalEntry } from '@/lib/types';
import { RANK_NAMES, RANK_XP_THRESHOLDS, INTERACTION, DEFAULT_DNA } from '@/lib/types';
import { ACCESSORIES } from '@/lib/accessories';
import { getFrames, applyEyes, applyPlaceholders, type PetType, type EyeDirection } from '@/lib/frames';
import PetSelector from '@/components/PetSelector';
import StatBars from '@/components/StatBars';
import { useTTS, useSTT } from '@/components/useVoice';
import { loginWithGoogle, logout as firebaseLogout, onUserChange, type User as FBUser } from '@/firebase/auth';
import GameHub from '@/games/GameHub';

// idle and sleeping are no longer separate exports — use getFrames(petType, 'idle') etc.
type Tab = 'pet' | 'chat' | 'shop' | 'tasks' | 'journal' | 'games';
interface ChatMsg { role: 'user'|'pet'; content: string; }

export default function Home() {
  const [status, setStatus] = useState<PetStatus|null>(null);
  const [dna, setDna] = useState<PetDNA>(DEFAULT_DNA);
  const [petType, setPetType] = useState<PetType>('cat');
  const [animState, setAnimState] = useState('idle');
  const [frameIdx, setFrameIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>('pet');
  const [sleeping, setSleeping] = useState(false);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [chatIn, setChatIn] = useState('');
  const [chatLoad, setChatLoad] = useState(false);
  const [owned, setOwned] = useState<string[]>([]);
  const [equipped, setEquipped] = useState<string[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [locked, setLocked] = useState(0);
  const [editName, setEditName] = useState(false);
  const [nameIn, setNameIn] = useState('');
  const [showSelector, setShowSelector] = useState(false);
  const [eyeDir, setEyeDir] = useState<EyeDirection>('center');
  const [autoVoice, setAutoVoice] = useState(false);
  const [fbUser, setFbUser] = useState<FBUser|null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [appLoading, setAppLoading] = useState(true);
  const [levelUpRank, setLevelUpRank] = useState<number|null>(null);
  const [prevRank, setPrevRank] = useState(0);
  const petRef = useRef<HTMLDivElement>(null);
  const chatEnd = useRef<HTMLDivElement>(null);
  const { speak, speaking, stop: stopTTS } = useTTS();
  const { listening, startListening, stopListening } = useSTT();

  // Firebase auth observer
  useEffect(() => {
    const unsub = onUserChange((user) => { setFbUser(user); setAuthReady(true); });
    setTimeout(() => setAppLoading(false), 1800);
    return () => unsub();
  }, []);

  const handleGoogleLogin = async () => {
    setAuthLoading(true); setAuthError('');
    try { await loginWithGoogle(); } catch { setAuthError('Sign-in failed. Try again.'); }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await firebaseLogout();
    setFbUser(null);
  };

  // Fetch state
  const fetchState = useCallback(async () => {
    try {
      const r = await fetch('/api/state'); const d = await r.json();
      if (d.status) {
        setStatus(prev => {
          if (prev && d.status.rank > prev.rank) { setPrevRank(prev.rank); setLevelUpRank(d.status.rank); }
          return d.status;
        });
        setPetType((d.status.petType || 'cat') as PetType);
      }
      if (d.dna) setDna(d.dna);
      if (d.ownedAccessories) setOwned(d.ownedAccessories);
      if (d.equippedAccessories) setEquipped(d.equippedAccessories);
      if (d.dailyTasks) setTasks(d.dailyTasks);
      if (d.lockedJournalCount !== undefined) setLocked(d.lockedJournalCount);
      if (d.status && d.status.age === 0 && d.status.name === 'Tamago') setShowSelector(true);
    } catch {}
  }, []);
  useEffect(() => { fetchState(); }, [fetchState]);

  // Animation loop
  useEffect(() => {
    const frames = getFrames(petType, sleeping ? 'sleeping' : animState);
    const ms = sleeping ? 900 : Math.max(300, 700 / dna.vibrationFreq);
    const iv = setInterval(() => setFrameIdx(i => (i + 1) % frames.length), ms);
    return () => clearInterval(iv);
  }, [petType, animState, sleeping, dna.vibrationFreq]);

  // Cursor tracking
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!petRef.current) return;
      const r = petRef.current.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const dx = e.clientX - cx, dy = e.clientY - cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < 50) { setEyeDir('center'); return; }
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);
      if (angle > -45 && angle < 45) setEyeDir('right');
      else if (angle >= 45 && angle < 135) setEyeDir('down');
      else if (angle <= -45 && angle > -135) setEyeDir('up');
      else setEyeDir('left');
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  // Game tick
  useEffect(() => {
    const iv = setInterval(async () => {
      if (!sleeping) { try { const r = await fetch('/api/tick',{method:'POST'}); const d = await r.json(); if(d.state) setStatus(d.state); } catch{} }
    }, 5*60*1000);
    return () => clearInterval(iv);
  }, [sleeping]);

  useEffect(() => { chatEnd.current?.scrollIntoView({behavior:'smooth'}); }, [msgs]);

  // Get current rendered frame with equipped accessories
  const getFrame = () => {
    const frames = getFrames(petType, sleeping ? 'sleeping' : animState);
    const raw = frames[frameIdx % frames.length] || frames[0];
    let f = applyEyes(raw, sleeping ? 'center' : eyeDir);
    f = applyPlaceholders(f, {});
    // Apply equipped accessories
    const eqAcc = ACCESSORIES.filter(a => equipped.includes(a.id));
    const hat = eqAcc.find(a => a.type === 'hat');
    const vest = eqAcc.find(a => a.type === 'vest');
    const shades = eqAcc.find(a => a.type === 'shades');
    if (shades) {
      if (shades.id === 'shades_cool') f = f.replace(/\((.)\.(.) ?\)/g, '(■.■)');
      else if (shades.id === 'shades_star') f = f.replace(/\((.)\.(.) ?\)/g, '(★.★)');
      else if (shades.id === 'shades_heart') f = f.replace(/\((.)\.(.) ?\)/g, '(♥.♥)');
    }
    let result = '';
    if (hat && hat.ascii.length > 0) result += hat.ascii.join('\n') + '\n';
    result += f;
    if (vest && vest.ascii.length > 0) result += '\n' + vest.ascii.join('\n');
    return result;
  };

  // Interact
  const interact = async (type: INTERACTION) => {
    if (loading) return;
    setLoading(true);
    try {
      const r = await fetch('/api/interact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({interactionType:type})});
      const d = await r.json();
      if (d.state) setStatus(d.state);
      if (d.dna) setDna(d.dna);
      // Map interaction to anim state
      const stateMap: Record<number,string> = {0:'eating',1:'playing',3:'bath',4:'sick',5:'discipline',7:'sleeping'};
      setAnimState(stateMap[type] || 'happy');
      setTimeout(() => { setAnimState('idle'); fetchState(); }, 4000);
    } catch {}
    setLoading(false);
  };

  // Chat
  const sendChat = async (text?: string) => {
    const msg = (text || chatIn).trim();
    if (!msg || chatLoad) return;
    setChatIn('');
    setMsgs(p => [...p, {role:'user',content:msg}]);
    setChatLoad(true);
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,timezone:tz})});
      const d = await r.json();
      const resp = d.response || '*confused look*';
      setMsgs(p => [...p, {role:'pet',content:resp}]);
      if (d.state) setStatus(d.state);
      if (d.dna) setDna(d.dna);
      if (autoVoice) speak(resp);
    } catch { setMsgs(p => [...p, {role:'pet',content:'*tilts head* Mrrp?'}]); }
    setChatLoad(false);
  };

  // Voice input
  const handleVoice = () => {
    if (listening) { stopListening(); return; }
    startListening((text) => { setChatIn(text); sendChat(text); });
  };

  // Sleep
  const toggleSleep = () => {
    if (!sleeping) { setSleeping(true); interact(INTERACTION.SLEEP); }
    else { setSleeping(false); setAnimState('idle'); }
  };

  // Pet selection
  const handlePetSelect = async (pet: PetType, name: string) => {
    setShowSelector(false); setPetType(pet);
    try {
      await fetch('/api/name',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,petType:pet})});
      fetchState();
    } catch {}
  };

  // Name save
  const saveName = async () => {
    if (!nameIn.trim()) return;
    try { const r = await fetch('/api/name',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:nameIn.trim()})}); const d = await r.json(); if(d.state) setStatus(d.state); } catch{}
    setEditName(false);
  };

  // Shop
  const shopAction = async (action: string, id: string) => {
    try {
      const r = await fetch('/api/shop',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,accessoryId:id})});
      const d = await r.json();
      if(d.owned) setOwned(d.owned); if(d.equipped) setEquipped(d.equipped); if(d.state) setStatus(d.state);
    } catch{}
  };

  // Journal
  useEffect(() => {
    if (tab === 'journal') fetch('/api/journal').then(r=>r.json()).then(d=>{if(d.entries)setJournal(d.entries);if(d.lockedCount!==undefined)setLocked(d.lockedCount);}).catch(()=>{});
  }, [tab]);

  if (showSelector) return <PetSelector onSelect={handlePetSelect} />;

  // Loading screen
  if (appLoading) return (
    <div className="loading-screen">
      <div className="loading-egg">{`   /\\_/\\  \n  ( o.o ) \n   > ^ <  `}</div>
      <div className="loading-dots"><span/><span/><span/></div>
      <div className="loading-text">NeoPet</div>
    </div>
  );

  // Auth screen
  if (authReady && !fbUser) return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="loading-egg" style={{fontSize:'12px',marginBottom:'20px'}}>{`  /\\_/\\  \n ( o.o ) \n  > ^ <  `}</div>
        <h1 className="auth-title">NeoPet</h1>
        <p className="auth-subtitle">Your AI Virtual Companion</p>
        {authError && <div className="auth-error">{authError}</div>}
        <button className="auth-btn" onClick={handleGoogleLogin} disabled={authLoading} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          {authLoading ? 'Signing in...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );

  // Still checking auth...
  if (!authReady) return <div className="min-h-screen flex items-center justify-center" style={{background:'#000'}}><div className="spinner"/></div>;

  if (!status) return <div className="min-h-screen flex items-center justify-center" style={{background:'#000'}}><div className="spinner"/></div>;

  const nxp = RANK_XP_THRESHOLDS[status.rank+1]||RANK_XP_THRESHOLDS[5];
  const pxp = RANK_XP_THRESHOLDS[status.rank]||0;
  const xpPct = Math.min(100,((status.xp-pxp)/(nxp-pxp))*100);

  const TABS: [Tab,any,string][] = [['pet',Gamepad2,'Pet'],['chat',Send,'Chat'],['shop',ShoppingBag,'Shop'],['games',Joystick,'Games'],['tasks',ListTodo,'Tasks'],['journal',BookHeart,'Journal']];

  const handleGameEnd = async (xp: number) => {
    if (xp > 0 && status) {
      const newStatus = { ...status, xp: status.xp + xp };
      // Check rank up
      const nextThreshold = RANK_XP_THRESHOLDS[status.rank + 1];
      if (nextThreshold && newStatus.xp >= nextThreshold && status.rank < 5) {
        newStatus.rank = status.rank + 1;
        setLevelUpRank(newStatus.rank);
      }
      setStatus(newStatus);
      try { await fetch('/api/interact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ interactionType: 1, xpBonus: xp }) }); fetchState(); } catch {}
    }
  };

  return (
    <main className="min-h-screen relative" style={{background:'#050505'}}>
      {/* LEVEL UP OVERLAY */}
      {levelUpRank !== null && (
        <div className="level-up-overlay" onClick={()=>setLevelUpRank(null)}>
          <div className="level-up-content">
            <div className="level-up-badge">⬆ Level Up! ⬆</div>
            <div className="level-up-rank">{RANK_NAMES[levelUpRank]}</div>
            <div className="level-up-stars">✦ ✦ ✦</div>
            <button className="auth-btn" style={{maxWidth:'200px',margin:'0 auto'}} onClick={()=>setLevelUpRank(null)}>Continue</button>
          </div>
        </div>
      )}
      {/* NIGHT MODE */}
      {sleeping && (
        <div className="night-mode flex items-center justify-center flex-col">
          <div className="night-stars">{Array.from({length:25}).map((_,i)=>(<div key={i} className="night-star" style={{left:`${Math.random()*100}%`,top:`${Math.random()*60}%`,animationDelay:`${Math.random()*3}s`}}/>))}</div>
          <div className="moon"/>
          <pre className="pet-display text-base mb-4 z-10">{getFrame()}</pre>
          <p className="text-gray-400 text-sm mb-4 z-10">{status.name} is sleeping...</p>
          <button onClick={toggleSleep} className="action-btn flex-row gap-2 px-6 z-10"><Sun size={16}/> Wake Up</button>
        </div>
      )}

      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* HEADER */}
        <header className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {editName ? (
              <div className="flex items-center gap-2">
                <input value={nameIn} onChange={e=>setNameIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveName()} className="name-edit-input" autoFocus maxLength={20}/>
                <button onClick={saveName} style={{color:'#888',transition:'color 0.2s'}} onMouseEnter={e=>(e.target as HTMLElement).style.color='#fff'} onMouseLeave={e=>(e.target as HTMLElement).style.color='#888'}><Check size={14}/></button>
                <button onClick={()=>setEditName(false)} style={{color:'#555',transition:'color 0.2s'}} onMouseEnter={e=>(e.target as HTMLElement).style.color='#fff'} onMouseLeave={e=>(e.target as HTMLElement).style.color='#555'}><X size={14}/></button>
              </div>
            ) : (
              <h1 className="text-lg font-bold text-white flex items-center gap-2 cursor-pointer group" onClick={()=>{setEditName(true);setNameIn(status.name)}}>
                {status.name} <Pencil size={12} className="opacity-0 group-hover:opacity-40 transition-opacity"/>
              </h1>
            )}
            <span className={`rank-badge rank-${status.rank}`}><Sparkles size={10}/> {RANK_NAMES[status.rank]}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 text-[11px]" style={{color:'#555',fontFamily:'Space Mono, monospace'}}>
              <span>Age {status.age}</span>
              <span>XP {status.xp}</span>
              <span className="flex items-center gap-1"><Heart size={10} style={{color:'#666'}}/> {status.syncFrequency}%</span>
            </div>
            {fbUser && <button className="user-badge" onClick={handleLogout}><User size={11}/> {fbUser.displayName || fbUser.email} <LogOut size={10}/></button>}
          </div>
        </header>

        {/* XP BAR */}
        <div className="mb-5">
          <div className="flex justify-between text-[9px] mb-0.5" style={{color:'#444',fontFamily:'Space Mono, monospace'}}><span>{RANK_NAMES[status.rank]}</span><span>{status.rank<5?RANK_NAMES[status.rank+1]:'MAX'}</span></div>
          <div className="xp-bar"><div className="xp-bar-fill" style={{width:`${xpPct}%`}}/></div>
        </div>

        {/* TABS */}
        <nav className="flex gap-1.5 mb-5 flex-wrap">
          {TABS.map(([id,Icon,label])=>(<button key={id} onClick={()=>setTab(id)} className={`tab-btn flex items-center gap-1.5 ${tab===id?'active':''}`}><Icon size={13}/>{label}</button>))}
        </nav>

        {/* ═══ PET TAB ═══ */}
        {tab==='pet' && (
          <div className="grid md:grid-cols-[1fr_280px] gap-5">
            <div className="glass-panel p-6 flex flex-col items-center justify-center relative min-h-[340px]" ref={petRef}>
              {dna.particleDensity>0.15 && Array.from({length:Math.floor(dna.particleDensity*8)}).map((_,i)=>(<div key={i} className="particle" style={{left:`${30+Math.random()*40}%`,bottom:'30%',animationDelay:`${Math.random()*3}s`}}/>))}
              <pre className="pet-display text-base transition-all duration-300">{getFrame()}</pre>
              <div className="thought-bubble mt-4"><p className="text-sm text-gray-300 italic">&ldquo;{status.comment}&rdquo;</p></div>
            </div>
            <div className="space-y-4">
              <div className="glass-panel p-4"><StatBars hunger={status.hunger} happiness={status.happiness} health={status.health} energy={status.energy} poop={status.poop}/></div>
              <div className="grid grid-cols-3 gap-2">
                {[[INTERACTION.FEED,Utensils,'Feed'],[INTERACTION.PLAY,Gamepad2,'Play'],[INTERACTION.BATH,Bath,'Bath'],[INTERACTION.DISCIPLINE,Megaphone,'Scold'],[INTERACTION.GO_TO_HOSPITAL,Hospital,'Doctor']].map(([t,I,l]:any)=>(
                  <button key={t} onClick={()=>interact(t)} disabled={loading||sleeping} className="action-btn"><div className="icon-wrapper"><I size={16}/></div><span className="text-[10px]">{l}</span></button>
                ))}
                <button onClick={toggleSleep} className="action-btn"><div className="icon-wrapper"><Moon size={16}/></div><span className="text-[10px]">Sleep</span></button>
              </div>
              {loading && <div className="flex justify-center"><div className="spinner"/></div>}
            </div>
          </div>
        )}

        {/* ═══ CHAT TAB ═══ */}
        {tab==='chat' && (
          <div className="glass-panel p-4 flex flex-col" style={{height:'480px'}}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">Chat with {status.name}</span>
              <button onClick={()=>{setAutoVoice(!autoVoice);if(speaking)stopTTS();}} style={{fontSize:'11px',display:'flex',alignItems:'center',gap:'4px',padding:'4px 8px',borderRadius:'8px',transition:'all 0.2s',color:autoVoice?'#fff':'#555',background:autoVoice?'rgba(255,255,255,0.08)':'transparent',border:'none',cursor:'pointer'}}>
                {autoVoice?<Volume2 size={12}/>:<VolumeX size={12}/>} Voice {autoVoice?'On':'Off'}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-3 pr-1">
              {msgs.length===0 && <p className="text-center text-gray-600 text-sm mt-16">Say hi to {status.name}!</p>}
              {msgs.map((m,i)=>(<div key={i} className={`flex ${m.role==='user'?'justify-end':'justify-start'}`}><div className={`max-w-[80%] px-3.5 py-2 text-sm ${m.role==='user'?'chat-bubble-user text-gray-300':'chat-bubble-pet text-gray-200'}`}>{m.content}</div></div>))}
              {chatLoad && <div className="flex justify-start"><div className="chat-bubble-pet px-4 py-3"><div className="spinner"/></div></div>}
              <div ref={chatEnd}/>
            </div>
            <div className="flex gap-2">
              <button onClick={handleVoice} className={`action-btn px-3 ${listening?'!border-red-400 !text-red-400':''}`}>{listening?<MicOff size={16}/>:<Mic size={16}/>}</button>
              <input value={chatIn} onChange={e=>setChatIn(e.target.value)} onKeyDown={e=>e.key==='Enter'&&sendChat()} placeholder={`Talk to ${status.name}...`} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white outline-none focus:border-white/20"/>
              <button onClick={()=>sendChat()} disabled={chatLoad||!chatIn.trim()} className="action-btn px-3"><Send size={16}/></button>
            </div>
          </div>
        )}

        {/* ═══ SHOP TAB ═══ */}
        {tab==='shop' && (
          <div className="glass-panel p-4">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Accessory Shop</h2><span className="text-sm text-gray-400">XP: {status.xp}</span></div>
            {(['hat','vest','shades'] as const).map(type=>(
              <div key={type} className="mb-5">
                <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">{type}s</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {ACCESSORIES.filter(a=>a.type===type).map(a=>{const o=owned.includes(a.id),eq=equipped.includes(a.id);return(
                    <div key={a.id} className={`shop-item ${o?'owned':''} ${eq?'equipped':''}`} onClick={()=>shopAction(o?'toggle':'buy',a.id)}>
                      <p className="text-sm font-medium">{a.name}</p>
                      {!o&&<p className="text-xs text-amber-400 mt-1">{a.cost} XP</p>}
                      {o&&<p className="text-xs text-emerald-400 mt-1">{eq?'✓ Equipped':'Owned'}</p>}
                    </div>
                  );})}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ═══ GAMES TAB ═══ */}
        {tab==='games' && (
          <div className="glass-panel p-0 overflow-hidden">
            <GameHub onGameEnd={handleGameEnd} petName={status.name} />
          </div>
        )}

        {/* ═══ TASKS TAB ═══ */}
        {tab==='tasks' && (
          <div className="glass-panel p-4">
            <h2 className="text-lg font-semibold mb-3">Daily Tasks</h2>
            <p className="text-[11px] text-gray-500 mb-4">Complete tasks → earn XP → rank up! Resets daily.</p>
            <div className="space-y-2">
              {tasks.map(t=>(
                <div key={t.id} className={`flex items-center gap-3 p-3 rounded-xl ${t.completed?'bg-emerald-500/10 border border-emerald-500/20':'bg-white/[0.02] border border-white/5'}`}>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs ${t.completed?'bg-emerald-500/20 text-emerald-400':'bg-white/5 text-gray-500'}`}>{t.completed?<Check size={14}/>:<ChevronRight size={14}/>}</div>
                  <div className="flex-1"><p className={`text-sm ${t.completed?'text-emerald-400 line-through':'text-gray-300'}`}>{t.description}</p>
                    <div className="flex items-center gap-2 mt-1"><div className="stat-bar flex-1" style={{height:'3px'}}><div className="stat-bar-fill" style={{width:`${(t.current/t.target)*100}%`,background:t.completed?'#22c55e':'#3b82f6'}}/></div><span className="text-[9px] text-gray-500">{t.current}/{t.target}</span></div>
                  </div>
                  <span className="text-[10px] text-amber-400">+{t.xpReward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══ JOURNAL TAB ═══ */}
        {tab==='journal' && (
          <div className="glass-panel p-4">
            <div className="flex justify-between items-center mb-3"><h2 className="text-lg font-semibold flex items-center gap-2"><BookHeart size={18}/> Secret Thoughts</h2><span className="text-[10px] text-gray-500 flex items-center gap-1"><Lock size={10}/> {locked} locked</span></div>
            <p className="text-[11px] text-gray-500 mb-4">Chat more to increase Sync and unlock {status.name}&apos;s hidden thoughts.</p>
            <div className="space-y-2">
              {journal.length===0 && <p className="text-center text-gray-600 text-sm py-8">No thoughts yet. Chat more!</p>}
              {journal.map(e=>(<div key={e.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5"><p className="text-sm text-gray-300 italic">&ldquo;{e.thought}&rdquo;</p><div className="flex justify-between mt-1.5 text-[9px] text-gray-600"><span>{e.sentiment}</span><span>{new Date(e.createdAt).toLocaleDateString()}</span></div></div>))}
              {locked>0 && <div className="p-3 rounded-xl bg-white/[0.01] border border-white/5 text-center"><Lock size={14} className="mx-auto mb-1 text-gray-700"/><p className="text-[10px] text-gray-600">{locked} thoughts locked</p></div>}
            </div>
          </div>
        )}

        {/* DNA BAR */}
        <div className="mt-5 glass-panel p-2.5 flex items-center justify-between text-[10px] text-gray-600">
          <span>DNA</span>
          <div className="dna-indicator">{[dna.hue/36,dna.saturation/10,dna.vibrationFreq*3,dna.particleDensity*10,dna.complexity*10,dna.auraGlow*10].map((v,i)=>(<div key={i} className="dna-bar" style={{height:`${Math.max(3,v*2)}px`,opacity:0.3+v*0.07}}/>))}</div>
          <span style={{color:`hsl(${dna.hue},${dna.saturation}%,60%)`}}>H:{dna.hue} V:{dna.vibrationFreq.toFixed(1)}x</span>
        </div>
      </div>
    </main>
  );
}
