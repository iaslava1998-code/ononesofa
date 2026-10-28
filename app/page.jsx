'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import Chat from './Chat';
import Comments from './Comments';
import Trailer from './Trailer';
import Premieres from './Premieres';
import PosterImage from './PosterImage';
const sharedRating=(f)=>{const scores=[f.slava,f.veronika].filter(v=>v!==null&&v!==undefined&&Number.isFinite(Number(v))).map(Number);return scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length*10)/10:null};
const poster=(path)=>path?.startsWith('https://')?path:path?'https://image.tmdb.org/t/p/w500'+path:null;
function SofaCharacter({girl=false}){
 const id=girl?'v':'s',hair=girl?'#55382f':'#49352b',shirt=girl?'#e8b6c8':'#8aadd9';
 return <svg className={'sofa-avatar-svg '+(girl?'sofa-avatar-girl':'sofa-avatar-boy')} viewBox="0 0 220 245" aria-hidden="true" focusable="false">
 <defs>
  <radialGradient id={id+'skin'} cx="38%" cy="29%" r="81%"><stop stopColor="#ffe9d2"/><stop offset=".61" stopColor="#f4c29f"/><stop offset="1" stopColor="#d99674"/></radialGradient>
  <linearGradient id={id+'hair'} x1="0" y1="0" x2="1" y2="1"><stop stopColor={girl?'#9b6d55':'#7d5a46'}/><stop offset=".43" stopColor={hair}/><stop offset="1" stopColor="#281e20"/></linearGradient>
  <linearGradient id={id+'shirt'} x1="0" x2=".7" y1="0" y2="1"><stop stopColor={girl?'#f7dbe6':'#cfdef6'}/><stop offset="1" stopColor={shirt}/></linearGradient>
  <radialGradient id={id+'cheek'}><stop stopColor="#e68081" stopOpacity=".42"/><stop offset="1" stopColor="#e68081" stopOpacity="0"/></radialGradient>
  <filter id={id+'soft'} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4"/></filter>
 </defs>
 <ellipse cx="110" cy="235" rx="70" ry="6" fill="#18131a" opacity=".2"/>
 <g className="sofa-avatar-body">
 <path d="M26 245Q24 195 65 177Q84 167 110 167Q139 166 156 177Q197 193 195 245Z" fill={'url(#'+id+'shirt)'} />
 <path d="M31 233Q37 192 67 186" fill="none" stroke="#fff" opacity=".42" strokeWidth="7" strokeLinecap="round"/>
 <path d="M157 186Q184 200 188 234" fill="none" stroke="#634a5b" opacity=".12" strokeWidth="8" strokeLinecap="round"/>
 <path d="M88 174Q110 201 132 174" fill="none" stroke={girl?'#f5f1ec':'#f7faff'} strokeWidth="9" strokeLinecap="round"/>
 {girl?<path d="M110 195V245" stroke="#b98ba0" strokeWidth="2" opacity=".5"/>:<path d="M92 180L110 194L128 180" fill="none" stroke="#567ea7" strokeWidth="2" opacity=".6"/>}
 </g>
 <g className="sofa-avatar-head">
 {girl&&<path d="M46 108Q33 54 66 31Q88 12 120 16Q167 17 175 70Q182 113 174 176Q168 199 147 190L145 125L68 125L68 183Q47 196 43 172Z" fill={'url(#'+id+'hair)'}/>}
 <path d="M98 155H124V186Q110 195 97 183Z" fill="#e8ad8e"/>
 <ellipse cx="60" cy="111" rx="11" ry="16" fill="#e9ab89"/>
 <ellipse cx="161" cy="111" rx="11" ry="16" fill="#df9d7d"/>
 <ellipse cx="110" cy="103" rx="55" ry="70" fill={'url(#'+id+'skin)'}/>
 <ellipse cx="78" cy="119" rx="23" ry="14" fill={'url(#'+id+'cheek)'}/>
 <ellipse cx="143" cy="119" rx="23" ry="14" fill={'url(#'+id+'cheek)'}/>
 <path d="M63 96Q66 60 88 50" stroke="#fff" strokeOpacity=".23" strokeWidth="9" fill="none" strokeLinecap="round" filter={'url(#'+id+'soft)'}/>
 {girl?<g><path d="M53 103Q40 46 76 28Q104 8 139 24Q173 35 169 96Q159 73 149 61Q126 77 100 68Q77 88 53 103Z" fill={'url(#'+id+'hair)'}/><path d="M70 49Q97 27 132 36" fill="none" stroke="#b88e70" strokeWidth="7" opacity=".4" strokeLinecap="round"/><path d="M158 75Q174 130 160 183" fill="none" stroke="#2e2024" strokeWidth="10" strokeLinecap="round" opacity=".65"/></g>:<g><path d="M56 95Q46 66 60 49Q60 27 88 27Q103 14 124 27Q147 19 158 38Q176 54 161 93Q155 66 146 64Q124 71 113 59Q91 78 73 70Q64 89 56 95Z" fill={'url(#'+id+'hair)'}/><path d="M63 59Q77 42 94 44M110 35Q133 41 149 49" fill="none" stroke="#b48a6f" strokeWidth="5" opacity=".5" strokeLinecap="round"/></g>}
 <path d="M73 91Q87 84 100 90M122 90Q136 84 148 91" fill="none" stroke={hair} strokeWidth="5" strokeLinecap="round"/>
 <g className="sofa-avatar-open-eyes">
 <ellipse cx="88" cy="108" rx="13" ry="14" fill="#fffaf6"/>
 <ellipse cx="134" cy="108" rx="13" ry="14" fill="#fffaf6"/>
 <circle cx="90" cy="109" r="8" fill={girl?'#745d43':'#516d77'}/>
 <circle cx="132" cy="109" r="8" fill={girl?'#745d43':'#516d77'}/>
 <circle cx="91" cy="109" r="4.4" fill="#26222a"/><circle cx="133" cy="109" r="4.4" fill="#26222a"/>
 <circle cx="94" cy="105" r="3" fill="white"/><circle cx="136" cy="105" r="3" fill="white"/>
 <path d="M76 104Q87 94 101 104M121 104Q133 94 147 104" stroke={hair} strokeWidth="3" strokeLinecap="round" fill="none"/>
 {girl&&<path d="M77 102L72 98M146 102L151 98" stroke={hair} strokeWidth="2.5" strokeLinecap="round"/>}
 </g>
 <g className="sofa-avatar-shut-eyes" opacity="0"><path d="M77 109Q88 120 101 109M121 109Q133 120 146 109" stroke={hair} strokeWidth="4" strokeLinecap="round" fill="none"/></g>
 <path d="M110 108Q106 126 110 129Q113 131 118 127" stroke="#bd816d" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".65"/>
 <g className="sofa-avatar-neutral-mouth"><path d="M97 144Q110 148 123 144" stroke="#a96567" strokeWidth="3.5" strokeLinecap="round" fill="none"/></g>
 <g className="sofa-avatar-happy-mouth" opacity="0"><path d="M91 138Q111 169 131 138Q111 151 91 138Z" fill="#8d4c54"/><path d="M97 142Q110 151 125 142" stroke="#fff9f5" strokeWidth="5" strokeLinecap="round" fill="none"/><path d="M103 155Q111 151 119 155" stroke="#da8a95" strokeWidth="3" fill="none"/></g>
 {girl&&<g><circle cx="57" cy="136" r="4" fill="#f5d89c"/><circle cx="164" cy="136" r="4" fill="#f5d89c"/></g>}
 </g>
 </svg>
}
export default function Home(){
 const [films,setFilms]=useState([]),[tab,setTab]=useState('want'),[q,setQ]=useState(''),[selected,setSelected]=useState(null),[pin,setPin]=useState(''),[unlocked,setUnlocked]=useState(false),[status,setStatus]=useState(''),[add,setAdd]=useState(false),[found,setFound]=useState([]);
 const [identity,setIdentity]=useState('');
 const searchRequest=useRef(0);
 const draggingId=useRef(null);
 const touchDrag=useRef(null);
 const [dragOver,setDragOver]=useState(null);
 const suppressClick=useRef(false);
 const [kind,setKind]=useState('films'),[series,setSeries]=useState([]);
 const [loading,setLoading]=useState(false),[checkingSession,setCheckingSession]=useState(true),[zoom,setZoom]=useState(null),[magic,setMagic]=useState(false),[revealed,setRevealed]=useState(false),[loggingIn,setLoggingIn]=useState(false),[wrongMagic,setWrongMagic]=useState(false),[ratingBurst,setRatingBurst]=useState(null),[roulette,setRoulette]=useState(null);
 async function refresh(){try{const [fr,sr]=await Promise.all([fetch('/api/films',{cache:'no-store'}),fetch('/api/series',{cache:'no-store'})]);if(fr.ok){const d=await fr.json();if(Array.isArray(d.films))setFilms(d.films)}if(sr.ok){const d=await sr.json();if(Array.isArray(d.series))setSeries(d.series)}}catch{}}
 useEffect(()=>{const sync=()=>{const date=new Date();const parts=new Intl.DateTimeFormat('en-US',{timeZone:'Asia/Yekaterinburg',hour:'2-digit',hourCycle:'h23',month:'numeric'}).formatToParts(date);const h=Number(parts.find(p=>p.type==='hour')?.value);const month=Number(parts.find(p=>p.type==='month')?.value)-1;document.body.dataset.daypart=h>=7&&h<19?'day':'night';document.body.dataset.season=[11,0,1].includes(month)?'winter':[2,3,4].includes(month)?'spring':[5,6,7].includes(month)?'summer':'autumn'};sync();const timer=setInterval(sync,60000);document.addEventListener('visibilitychange',sync);return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',sync);delete document.body.dataset.daypart;delete document.body.dataset.season}},[]);
 useEffect(()=>{let active=true;fetch('/api/auth',{cache:'no-store'}).then(async r=>{if(!r.ok)return null;const d=await r.json();if(!sessionStorage.getItem('sofa_session_tab')){if(d.authenticated)await fetch('/api/auth',{method:'DELETE'});return null}return d}).then(async d=>{if(d?.authenticated&&active){setUnlocked(true);setRevealed(true);const remembered=sessionStorage.getItem('sofa_identity');if(['Слава','Вероника'].includes(remembered))setIdentity(remembered);await refresh()}}).catch(()=>{}).finally(()=>{if(active)setCheckingSession(false)});return()=>{active=false}},[]);
 const items=kind==='series'?series:films;
 const watchedOrder=useMemo(()=>new Map([...items].filter(f=>f.slava!=null||f.veronika!=null).sort((a,b)=>(a.watched_at||'9999-12-31').localeCompare(b.watched_at||'9999-12-31')||(a.created_at||'').localeCompare(b.created_at||'')).map((f,i)=>[f.id,i+1])),[items]);
 const scheduled=useMemo(()=>[...items].filter(f=>f.planned_at&&f.slava==null&&f.veronika==null).sort((a,b)=>a.planned_at.localeCompare(b.planned_at)),[items]);
 const counts=useMemo(()=>({want:items.filter(f=>f.slava==null&&f.veronika==null).length,seen:items.filter(f=>f.slava!=null||f.veronika!=null).length}),[items]);
 const filtered=useMemo(()=>items.filter(f=>(tab==='seen'?f.slava!=null||f.veronika!=null:f.slava==null&&f.veronika==null)&&f.title.toLowerCase().includes(q.toLowerCase())).sort((a,b)=>(Number.isInteger(a.sort_order)&&Number.isInteger(b.sort_order)?a.sort_order-b.sort_order:Number.isInteger(a.sort_order)?-1:Number.isInteger(b.sort_order)?1:tab==='seen'?(watchedOrder.get(a.id)??Infinity)-(watchedOrder.get(b.id)??Infinity):0)),[items,tab,q]);
 function pickMovie(){const pool=items.filter(f=>f.slava==null&&f.veronika==null);if(!pool.length){setStatus('Сначала добавьте фильмы в список «Хочу посмотреть»');return}const movie=pool[Math.floor(Math.random()*pool.length)];setRoulette(movie)}
 useEffect(()=>{if(!unlocked||!identity)return;let live=true;const beat=()=>{if(live&&document.visibilityState==='visible')fetch('/api/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:identity}),cache:'no-store'}).catch(()=>{})};beat();const timer=setInterval(beat,30000);document.addEventListener('visibilitychange',beat);return()=>{live=false;clearInterval(timer);document.removeEventListener('visibilitychange',beat)}},[unlocked,identity]);
 function chooseIdentity(name){if(!['Слава','Вероника'].includes(name))return;sessionStorage.setItem('sofa_identity',name);setIdentity(name);setRevealed(false);setMagic(true);setTimeout(()=>{setMagic(false);setRevealed(true)},3400)}
 async function logout(){await fetch('/api/auth',{method:'DELETE'}).catch(()=>{});sessionStorage.removeItem('sofa_session_tab');sessionStorage.removeItem('sofa_identity');setIdentity('');setUnlocked(false);setRevealed(false);setFilms([]);setSeries([]);setSelected(null);setRoulette(null)}
 async function login(){if(loggingIn)return;setLoggingIn(true);setStatus('');try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pin})});if(!r.ok){if(r.status===401){setStatus('');setWrongMagic(true);setTimeout(()=>setWrongMagic(false),3100)}else setStatus('Не удалось проверить код');return}sessionStorage.setItem('sofa_session_tab','1');sessionStorage.removeItem('sofa_identity');setIdentity('');setUnlocked(true);setPin('');setRevealed(true);await refresh()}catch{setStatus('Нет связи с сервером. Попробуй ещё раз.')}finally{setLoggingIn(false)}}
 async function save(movie){setStatus('Сохраняю оценку…');try{const r=await fetch(kind==='series'?'/api/series':'/api/films',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:movie.id,slava:movie.slava,veronika:movie.veronika,watched_at:movie.watched_at||null,planned_at:movie.planned_at||null})});if(r.ok){const scores=[movie.slava,movie.veronika].filter(v=>v!=null&&Number.isFinite(Number(v))).map(Number);const previous=items.find(item=>item.id===movie.id);const changed=!!previous&&(previous.slava!==movie.slava||previous.veronika!==movie.veronika);if(changed&&scores.length){const score=scores.reduce((a,b)=>a+b,0)/scores.length;setRatingBurst({key:Date.now(),score,count:Math.max(3,Math.round(score*5))});setTimeout(()=>setRatingBurst(null),2900)}await refresh();setSelected(null);setStatus('')}else{const d=await r.json().catch(()=>({}));setStatus(r.status===401?'Нужно снова ввести PIN после обновления сайта. Закрой фильм и нажми «Войти».':r.status===503?'База данных не подключена. Нужно проверить ключ Supabase в Vercel.':'Ошибка сохранения: '+(d.error||'код '+r.status))}}catch{setStatus('Нет связи с сервером, попробуй ещё раз')}}
 async function removeFilm(movie){if(!window.confirm('Удалить «'+movie.title+'» из общего списка? Это действие нельзя отменить.'))return;setStatus('Удаляю фильм…');try{const r=await fetch(kind==='series'?'/api/series':'/api/films',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:movie.id})});if(!r.ok){setStatus(r.status===401?'Нужно снова войти по PIN.':'Не удалось удалить фильм');return}setSelected(null);setStatus('');await refresh()}catch{setStatus('Нет связи с сервером')}}
 async function reorderFilms(sourceId,targetId){
  if(q||!sourceId||!targetId||sourceId===targetId)return;
  const group=[...items].filter(f=>tab==='seen'?f.slava!=null||f.veronika!=null:f.slava==null&&f.veronika==null).sort((a,b)=>Number.isInteger(a.sort_order)&&Number.isInteger(b.sort_order)?a.sort_order-b.sort_order:Number.isInteger(a.sort_order)?-1:Number.isInteger(b.sort_order)?1:tab==='seen'?(watchedOrder.get(a.id)??Infinity)-(watchedOrder.get(b.id)??Infinity):0);
  const from=group.findIndex(f=>f.id===sourceId),to=group.findIndex(f=>f.id===targetId);
  if(from<0||to<0)return;
  const [moved]=group.splice(from,1);group.splice(to,0,moved);
  const original=items;
  const positions=new Map(group.map((f,i)=>[f.id,i]));
  const revised=items.map(f=>positions.has(f.id)?{...f,sort_order:positions.get(f.id)}:f);
  if(kind==='series')setSeries(revised);else setFilms(revised);
  try{
   const response=await fetch('/api/order',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,tab,ids:group.map(f=>f.id)})});
   if(!response.ok)throw Error('Save failed');
   await refresh();
  }catch{
   if(kind==='series')setSeries(original);else setFilms(original);
   setStatus('Не удалось сохранить порядок. Попробуй ещё раз.');
  }
 }
 function dragStart(event,id){
  if(q)return;
  draggingId.current=id;
  event.dataTransfer.effectAllowed='move';
  event.dataTransfer.setData('text/plain',id);
 }
 function dragEnd(){draggingId.current=null;setDragOver(null)}
 function dragDrop(event,id){
  event.preventDefault();
  const from=draggingId.current||event.dataTransfer.getData('text/plain');
  dragEnd();reorderFilms(from,id);
 }
 function touchStart(event,id){
  if(q||event.touches.length!==1)return;
  const t=event.touches[0];touchDrag.current={id,x:t.clientX,y:t.clientY,moved:false};
 }
 function touchMove(event){
  const d=touchDrag.current;if(!d||event.touches.length!==1)return;
  const t=event.touches[0];
  if(Math.hypot(t.clientX-d.x,t.clientY-d.y)>12)d.moved=true;
  if(!d.moved)return;
  event.preventDefault();
  const node=document.elementFromPoint(t.clientX,t.clientY)?.closest('[data-reorder-id]');
  setDragOver(node?.getAttribute('data-reorder-id')||null);
 }
 function touchEnd(event){
  const d=touchDrag.current;touchDrag.current=null;setDragOver(null);
  if(!d?.moved)return;
  suppressClick.current=true;
  setTimeout(()=>{suppressClick.current=false},350);
  const t=event.changedTouches[0];
  const target=document.elementFromPoint(t.clientX,t.clientY)?.closest('[data-reorder-id]')?.getAttribute('data-reorder-id');
  if(target)reorderFilms(d.id,target);
 }
 function reorderKey(event,id){
  if(!event.altKey||!['ArrowLeft','ArrowRight'].includes(event.key))return;
  event.preventDefault();
  const index=filtered.findIndex(x=>x.id===id),target=filtered[index+(event.key==='ArrowLeft'?-1:1)];
  if(target)reorderFilms(id,target.id);
 }
 function changeKind(nextKind){
  searchRequest.current+=1;
  setKind(nextKind);setTab('want');setQ('');setStatus('');setFound([]);setLoading(false);setAdd(false);setSelected(null);setRoulette(null);
 }
 function closeSearch(){searchRequest.current+=1;setAdd(false);setFound([]);setLoading(false)}
 function openSearch(){searchRequest.current+=1;setFound([]);setStatus('');setLoading(false);setAdd(true)}
 async function lookup(title){
  const requestId=++searchRequest.current;
  setLoading(true);setStatus('');setFound([]);
  try{
   const r=await fetch('/api/search?type='+kind+'&q='+encodeURIComponent(title));
   const d=await r.json();
   if(requestId!==searchRequest.current)return;
   if(!r.ok){setStatus(d.error||'Не удалось выполнить поиск');return}
   setFound(d.results||[]);
  }catch{if(requestId===searchRequest.current)setStatus('Нет связи с сервером. Попробуй ещё раз.')}
  finally{if(requestId===searchRequest.current)setLoading(false)}
 }
 async function addFilm(f,targetKind){
  const mediaType=targetKind==='series'?'tv':targetKind==='films'?'movie':null;
  if(!mediaType||(f.media_type&&f.media_type!==mediaType)){setStatus('Тип найденного результата не совпадает с разделом. Повтори поиск.');return}
  try{
   const r=await fetch(targetKind==='series'?'/api/series':'/api/films',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...f,media_type:mediaType})});
   if(!r.ok){setStatus(targetKind==='series'?'Не получилось добавить сериал':'Не получилось добавить фильм');return}
   changeKind(targetKind);await refresh();
  }catch{setStatus('Нет связи с сервером. Попробуй ещё раз.')}
 }

 return <><div className="cinema-wallpaper" aria-hidden="true"/><div className="season-atmosphere" aria-hidden="true"><div className="season-light"/>{Array.from({length:35},(_,i)=><span key={i} style={{'--i':i,'--x':((i*47+13)%101)+'%','--d':(i%11)+'s','--s':(.6+(i%5)*.17)}}/>)}</div><header><div className="eyebrow">Кино для двоих</div><h1>На одном диване</h1><p className="subtitle">Смотрим, спорим, оцениваем. Только наш список.</p></header>{!checkingSession&&!unlocked&&<main className="gate-main"><form className="magic-gate" onSubmit={e=>{e.preventDefault();login()}}><div className="gate-orbit" aria-hidden="true">✦</div><p className="gate-eyebrow">Тайный киноклуб для двоих</p><h2>Открой нашу историю</h2><p className="gate-description">Только один секретный код отделяет тебя от нашего кинотеатра.</p><label htmlFor="access-pin" className="gate-label">Секретный код</label><input id="access-pin" type="password" autoComplete="off" inputMode="numeric" maxLength={12} value={pin} onChange={e=>setPin(e.target.value)} placeholder="Введи PIN" required/><button type="submit" className="gate-enter" disabled={loggingIn}>{loggingIn?'Проверяем заклинание…':'Открыть кинотеатр ✦'}</button>{status&&<p className="gate-error" role="alert">{status}</p>}</form></main>}{checkingSession&&<main className="gate-loading" aria-label="Проверяем вход"><span>✦</span></main>}{unlocked&&revealed&&!identity&&<main className="gate-main"><div className="magic-gate"><h2>Кто ты?</h2><div className="sofa-identity-options"><button type="button" className="gate-enter sofa-identity-choice" onClick={()=>chooseIdentity('Слава')}><span className="sofa-avatar"><SofaCharacter /></span><span className="sofa-identity-name">Слава</span></button><button type="button" className="gate-enter sofa-identity-choice" onClick={()=>chooseIdentity('Вероника')}><span className="sofa-avatar"><SofaCharacter girl /></span><span className="sofa-identity-name">Вероника</span></button></div></div></main>}{unlocked&&revealed&&identity&&<main className="catalog-reveal">
 <Premieres films={films} onAdd={f=>addFilm(f,'films')}/><div className="catalog-switch" role="group" aria-label="Тип каталога"><button className={kind==='films'?'current':''} onClick={()=>{changeKind('films')}}>Фильмы</button><button className={kind==='series'?'current':''} onClick={()=>{changeKind('series')}}>Сериалы</button></div><nav className="bar main-toolbar" aria-label="Навигация по каталогу"><div className="film-tabs"><button className={'pill '+(tab==='want'?'active':'')} aria-pressed={tab==='want'} onClick={()=>setTab('want')}>Хочу посмотреть <span className="tab-count">{counts.want}</span></button><button className={'pill '+(tab==='seen'?'active':'')} aria-pressed={tab==='seen'} onClick={()=>setTab('seen')}>Посмотрели <span className="tab-count">{counts.seen}</span></button></div><div className="film-search"><input className="search" aria-label="Поиск по фильмам" placeholder={kind==='series'?'Поиск сериала по названию…':'Поиск фильма по названию…'} value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button className="search-clear" aria-label="Очистить поиск" title="Очистить поиск" onClick={()=>setQ('')}>×</button>}</div><button className="action primary add-film" onClick={openSearch}>{kind==='series'?'+ Добавить сериал':'+ Добавить фильм'}</button>{unlocked&&<a className="action chat-link" href="#chat">Чат ↓</a>}<button type="button" className="action" onClick={pickMovie}>🎲 Что посмотрим?</button><button type="button" className="action" onClick={logout}>Выйти</button></nav>

 {status&&<p className="notice">{status}</p>}
 {scheduled.length>0&&<section className="planned-screenings"><h2>Запланированные просмотры</h2><div className="planned-list">{scheduled.map(f=><button type="button" className="planned-item" key={f.id} onClick={()=>setSelected({...f})}><span className="planned-poster"><PosterImage item={f} kind={kind} alt="" /><span className="planned-date-badge">{new Date(f.planned_at+'T12:00:00').toLocaleDateString('ru-RU',{day:'2-digit',month:'short'})}</span></span><span className="planned-title"><strong>{f.title}</strong></span><span className="planned-edit">Изменить дату</span></button>)}</div></section>}
 <h2>{kind==='series'?'Сериалы · ':''}{tab==='want'?'Хотим посмотреть':'Уже посмотрели'} <span className="muted">({filtered.length})</span></h2>
 <div className="grid">{filtered.map(f=><div key={f.id} data-reorder-id={f.id} className={"sortable-film "+(dragOver===f.id?"drag-target":"")} style={{position:"relative",minWidth:0}} draggable={unlocked&&!q} onDragStart={e=>dragStart(e,f.id)} onDragOver={e=>{if(!q){e.preventDefault();setDragOver(f.id)}}} onDrop={e=>dragDrop(e,f.id)} onDragEnd={dragEnd} onTouchStart={e=>touchStart(e,f.id)} onTouchMove={touchMove} onTouchEnd={touchEnd} onTouchCancel={()=>{touchDrag.current=null;setDragOver(null)}} onKeyDown={e=>reorderKey(e,f.id)} tabIndex={unlocked&&!q?0:undefined} aria-label={unlocked&&!q?f.title+". Для перестановки перетащи карточку или нажми Alt и стрелку.":undefined}><button className="movie" style={{width:"100%",height:"100%"}} onClick={()=>{if(!suppressClick.current)setSelected({...f})}}><div className="poster-frame"><PosterImage className="poster" item={f} kind={kind} alt={'Постер '+f.title}/><span className="film-ribbon">{tab==='seen'?'✓ Просмотрено':'✦ В планах'}</span>{tab==='seen'&&sharedRating(f)!==null&&<span className="shared-rating" aria-label={'Общая оценка '+sharedRating(f)+' из 10'}><b>{sharedRating(f)}</b><small>/10</small></span>}</div><div className="film-meta"><strong>{tab==='seen'?'№'+watchedOrder.get(f.id)+' · ':''}{f.title}</strong><small>{f.year||''}{tab==='seen'?' · Слава '+(f.slava??'—')+' · Вероника '+(f.veronika??'—'):''}{tab==='seen'&&f.watched_at?' · '+new Date(f.watched_at+'T12:00:00').toLocaleDateString('ru-RU'):''}</small></div></button>{unlocked&&<button aria-label={'Удалить '+(kind==='series'?'сериал ':'фильм ')+f.title} title={kind==='series'?'Удалить сериал':'Удалить фильм'} onClick={()=>removeFilm(f)} style={{position:"absolute",top:8,right:8,zIndex:2,width:34,height:34,borderRadius:"50%",border:"1px solid rgba(255,255,255,.35)",background:"rgba(20,19,26,.85)",color:"white",fontSize:24,cursor:"pointer",display:"grid",placeItems:"center",lineHeight:1}}>×</button>}</div>)}</div>{filtered.length===0&&<div className="empty-state"><p>{q?'По запросу «'+q+'» ничего не найдено.':'В этом разделе пока нет '+(kind==='series'?'сериалов.':'фильмов.')}</p>{q?<button className="action" onClick={()=>setQ('')}>Сбросить поиск</button>:<button className="action primary" onClick={openSearch} >{kind==='series'?'+ Добавить сериал':'+ Добавить фильм'}</button>}</div>}
 {unlocked&&<Chat unlocked={unlocked} identity={identity}/>}<nav className="mobile-bottom-nav" aria-label="Навигация"><button onClick={()=>{changeKind("films");window.scrollTo({top:0,behavior:"smooth"})}}>Фильмы</button><button onClick={()=>{changeKind("series");window.scrollTo({top:0,behavior:"smooth"})}}>Сериалы</button><a href="#chat">Чат</a></nav></main>}<footer>На одном диване · наш маленький киноклуб</footer>
 {roulette&&<div className="modalback" onClick={()=>setRoulette(null)}><div className="modal movie-roulette" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setRoulette(null)}>×</button><div className="roulette-spark">✦</div><h2>Сегодня смотрим?</h2><PosterImage item={roulette} kind={kind} alt={'Постер '+roulette.title}/><h3>{roulette.title}</h3><p className="muted">{roulette.year||''}</p><div className="film-actions"><button className="action primary" onClick={()=>{setSelected({...roulette});setRoulette(null)}}>Открыть фильм</button><button className="action" onClick={pickMovie}>Выбрать другой</button></div></div></div>}
 {selected&&<div className="modalback" onClick={()=>setSelected(null)}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><div className="details"><button type="button" className="poster-preview" aria-label="Увеличить постер" onClick={()=>setZoom(selected)}><PosterImage item={selected} kind={kind} alt={'Постер '+selected.title}/></button><div><h2>{selected.title}</h2><p className="muted">{selected.year||''}</p><p>{selected.overview||'Выберем фильм и посмотрим вместе.'}</p></div></div>{kind==='films'&&<Trailer key={selected.id} filmId={selected.id}/>} <div className="scores">{[['Слава','slava'],['Вероника','veronika']].map(([n,key])=><div className="score-stars" key={key}><strong>{n}: {selected[key]??'—'}/10</strong><div className="score-star-row">{Array.from({length:10},(_,i)=><button type="button" disabled={!unlocked} key={i} aria-label={n+': '+(i+1)+' из 10'} className={selected[key]!=null&&i<selected[key]?'lit':''} onClick={()=>setSelected({...selected,[key]:i+1})}>★</button>)}</div><button className="score-clear" type="button" onClick={()=>setSelected({...selected,[key]:null})}>Очистить</button></div>)}</div><label className="watch-date">Запланировать просмотр <input type="date" value={selected.planned_at||''} onChange={e=>setSelected({...selected,planned_at:e.target.value||null})}/></label><p className="hint">Дату можно изменить или очистить и сохранить.</p><label className="watch-date">Дата просмотра <input type="date" value={selected.watched_at||''} onChange={e=>setSelected({...selected,watched_at:e.target.value||null})}/></label><p className="hint">Оценка переносит фильм в «Посмотрели». Чтобы вернуть его, очистите обе оценки.</p>{status&&<p role="alert" className="notice">{status}</p>}<div className="film-actions"><button disabled={!unlocked} className="action primary" onClick={()=>save(selected)}>Сохранить изменения</button><button disabled={!unlocked} className="action delete-film" onClick={()=>removeFilm(selected)} >{kind==='series'?'Удалить сериал':'Удалить фильм'}</button></div>{unlocked&&kind==='films'&&<Comments key={selected.id} filmId={selected.id}/>} </div></div>}
 {add&&<div className="modalback" onClick={closeSearch}><div className="modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={closeSearch}>×</button><h2>{kind==='series'?'Добавить сериал':'Добавить фильм'}</h2><p className="muted">Поиск по каталогу TMDB</p><form onSubmit={e=>{e.preventDefault();lookup(e.currentTarget.elements.title.value)}}><div className="bar"><input name="title" required placeholder={kind==='series'?'Название сериала':'Название фильма'} className="search"/><button className="action primary" disabled={loading}>Найти</button></div></form>{status&&<p className="muted">{status}</p>}<div className="results">{found.map(f=><button className="result" disabled={!unlocked} key={f.tmdb_id} onClick={()=>addFilm(f,f.media_type==='tv'?'series':'films')}><img src={poster(f.poster)||'/placeholder.svg'} alt=""/><span>{f.title} <span className="muted">({f.year})</span></span></button>)}</div>{!unlocked&&<p className="hint">Для добавления сначала войдите по общему PIN.</p>}</div></div>}
 {zoom&&<div className="poster-lightbox" onClick={()=>setZoom(null)} role="presentation"><button className="lightbox-close" onClick={()=>setZoom(null)} aria-label="Закрыть">×</button><PosterImage item={zoom} kind={kind} alt={'Постер '+zoom.title} onClick={e=>e.stopPropagation()}/></div>}
 {ratingBurst&&<div className="rating-burst" key={ratingBurst.key} aria-hidden="true">{Array.from({length:ratingBurst.count},(_,i)=>{const angle=i*2.399963229728653;const distance=95+((i*37)%Math.max(120,Math.min(530,Math.round(ratingBurst.score*58))));return <span key={i} className="rating-star" style={{'--dx':Math.cos(angle)*distance+'px','--dy':Math.sin(angle)*distance+'px','--dx-mid':Math.cos(angle)*distance*.44+'px','--dy-mid':Math.sin(angle)*distance*.44+'px','--delay':(i%7)*35+'ms','--spin':(i%2?1:-1)*(140+(i%4)*90)+'deg','--scale':.55+(i%4)*.25}}>{i%3===0?'✦':'★'}</span>})}<span className="rating-burst-score">{Number(ratingBurst.score.toFixed(1))}<small>/10</small></span></div>}
 {wrongMagic&&<div className="demon-overlay" role="alertdialog" aria-label="Неверный код доступа"><div className="demon-smoke" aria-hidden="true"/><div className="demon-figure" aria-hidden="true"><div className="demon-horns"><i/><i/></div><div className="demon-head"><div className="demon-brows"><i/><i/></div><div className="demon-eyes"><i/><i/></div><div className="demon-grin">◆ ◆ ◆ ◆ ◆</div></div><div className="demon-body"/></div><div className="demon-warning">Вы не желанный гость,<span>идите нахуй</span></div><p className="demon-note">Неверный секретный код</p></div>}
 {magic&&<div className="magic-overlay" aria-live="polite"><div className="magic-stars" aria-hidden="true">{Array.from({length:82},(_,i)=><span key={i} style={{left:(i*37%98)+1+'%',top:(i*61%94)+3+'%',animationDelay:(i%17)*.10+'s',fontSize:((i%4)+1)*7+'px'}}>{i%4===0?'✧':'✦'}</span>)}</div><div className="magic-runes" aria-hidden="true">✧ ✦ ✧</div><div className="magic-ring" aria-hidden="true"/><div className="magic-wand" aria-hidden="true"/><div className="magic-symbol">✧</div><div className="magic-title">Шалость удалась</div><div className="magic-subtitle">Добро пожаловать на наш диван</div></div>}
 </>}
