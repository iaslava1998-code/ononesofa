'use client';
import {useEffect,useRef,useState} from 'react';
export default function Chat({unlocked,identity}){
 const sender=identity;
 const [presence,setPresence]=useState([]);
 const [messages,setMessages]=useState([]);
 const [draft,setDraft]=useState('');
 const [error,setError]=useState('');
 const [sending,setSending]=useState(false);
 const [picker,setPicker]=useState('');
 const [mediaQuery,setMediaQuery]=useState('');
 const [mediaItems,setMediaItems]=useState([]);
 const [mediaNext,setMediaNext]=useState(0);
 const [mediaLoading,setMediaLoading]=useState(false);
 const [mediaError,setMediaError]=useState('');
 const [mediaProvider,setMediaProvider]=useState('');
 const mediaEnd=useRef(null);
 const chatScroll=useRef(null);
 const chatBottom=useRef(null);
 const [unread,setUnread]=useState(0);
 const [lastViewed,setLastViewed]=useState(0);
 const emoji=['❤️','😂','🥹','😍','😘','😎','🥰','😭','🔥','✨','😈','💚','🍿','🎬','⭐','👍','😴','🙃','💋','🤍'];
 const stickers=['😈','👽','🤖','🐈','🍿','🧙','👻','🦇','💀','🐸','🦄','🧸'];
 useEffect(()=>{if(!unlocked||!identity)return;let active=true;
  const load=async()=>{try{const r=await fetch('/api/presence',{cache:'no-store'});if(!r.ok)return;const d=await r.json();if(active)setPresence(d.people||[])}catch{}};
  load();const timer=setInterval(load,15000);return()=>{active=false;clearInterval(timer)};
 },[unlocked,identity]);
 function presenceText(name){const row=presence.find(p=>p.name===name);if(!row)return 'ещё не заходил(а)';
  const date=new Date(row.last_seen);if(!Number.isFinite(date.getTime()))return 'нет данных';
  const age=Date.now()-date.getTime();if(age>=0&&age<90000)return 'в сети';
  const sameDay=new Date().toDateString()===date.toDateString();
  return 'был(а) '+(sameDay?'сегодня в ':'')+date.toLocaleString('ru-RU',sameDay?{hour:'2-digit',minute:'2-digit'}:{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
 }
 useEffect(()=>{if(!unlocked)return;let active=true;
 async function load(){try{const r=await fetch('/api/chat',{cache:'no-store'});if(!r.ok)throw Error('Чат недоступен');const d=await r.json();if(active){setMessages(d.messages||[]);setError('');if(document.visibilityState==='hidden')setUnread(Math.max(0,(d.messages||[]).filter(m=>Number(m.id)>lastViewed).length))}}catch(e){if(active)setError(e.message)}}
 load();const t=setInterval(load,5000);return()=>{active=false;clearInterval(t)};
 },[unlocked]);
 useEffect(()=>{if(picker!=='gif'&&picker!=='sticker')return;let active=true;setMediaItems([]);setMediaNext(0);setMediaError('');setMediaLoading(true);const timer=setTimeout(async()=>{try{const r=await fetch('/api/media?type='+picker+'&q='+encodeURIComponent(mediaQuery)+'&offset=0');const d=await r.json();if(!r.ok)throw Error(d.error||'Поиск недоступен');if(active){setMediaItems(d.items||[]);setMediaNext(d.nextOffset);setMediaProvider(d.provider||'');}}catch(e){if(active)setMediaError(e.message+' Попробуйте другой запрос или повторите позже.') }finally{if(active)setMediaLoading(false)}},250);return()=>{active=false;clearTimeout(timer)}},[picker,mediaQuery]);
 async function loadMore(){if(mediaLoading||mediaNext===null)return;setMediaLoading(true);try{const r=await fetch('/api/media?type='+picker+'&q='+encodeURIComponent(mediaQuery)+'&offset='+mediaNext);const d=await r.json();if(!r.ok)throw Error(d.error||'Не удалось загрузить');setMediaItems(old=>[...old,...(d.items||[]).filter(item=>!old.some(existing=>existing.url===item.url))]);setMediaNext(d.nextOffset)}catch(e){setMediaError(e.message)}finally{setMediaLoading(false)}}
 useEffect(()=>{if(!['gif','sticker'].includes(picker)||mediaNext===null||mediaLoading)return;const node=mediaEnd.current;if(!node||typeof IntersectionObserver==='undefined')return;const observer=new IntersectionObserver(entries=>{if(entries[0]?.isIntersecting)loadMore()},{rootMargin:'160px'});observer.observe(node);return()=>observer.disconnect()},[picker,mediaItems,mediaNext,mediaLoading]);
 function readChat(){setUnread(0);setLastViewed(Math.max(0,...messages.map(m=>Number(m.id)||0)));chatScroll.current?.scrollTo({top:chatScroll.current.scrollHeight,behavior:'smooth'})}
 useEffect(()=>{if(messages.length&&document.visibilityState==='visible')chatBottom.current?.scrollIntoView({block:'nearest',behavior:'smooth'})},[messages.length]);
 async function send(e){e.preventDefault();return sendBody(draft)}
 async function sendBody(body){if(!sender){setError('Выбери имя');return}if(!body.trim()||sending)return;setSending(true);
 try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sender,body:body.trim()})});if(!r.ok)throw Error('Не получилось отправить');const d=await r.json();setMessages(old=>old.some(m=>m.id===d.message.id)?old:[...old,d.message]);setDraft('');setPicker('');setError('')}catch(e){setError(e.message)}finally{setSending(false)}}
 async function like(m){if(!sender){setError('Сначала выбери своё имя');return}try{const r=await fetch('/api/chat',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:m.id,sender})});if(!r.ok)throw Error('Не удалось поставить лайк');const d=await r.json();setMessages(old=>old.map(x=>x.id===m.id?{...x,liked_by:d.reaction.liked_by}:x))}catch(e){setError(e.message)}}
 async function removeMessage(m){if(!window.confirm('Удалить это сообщение у вас обоих?'))return;try{const r=await fetch('/api/chat',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:m.id})});if(!r.ok)throw Error('Не удалось удалить сообщение');setMessages(old=>old.filter(item=>item.id!==m.id));setError('')}catch(e){setError(e.message)}}
 return <section className="chat-shell" id="chat"><div className="chat-head"><div><span className="eyebrow">Наш уголок</span><h2>Чат на двоих</h2><p className="muted">Сообщения появляются у обоих автоматически.</p></div><span className="chat-live">● Общий чат {unread>0&&<button type="button" onClick={readChat}>Новых: {unread}</button>}</span></div>
 {!unlocked?<p className="notice">Чтобы переписываться, войдите по общему PIN.</p>:<>
 <div className="chat-who sofa-presence"><span>Ты пишешь как: <strong>{sender}</strong></span><div className="sofa-presence-list">{['Слава','Вероника'].map(n=><div key={n} className="sofa-presence-person"><strong>{n}</strong><small>{presenceText(n)}</small></div>)}</div></div>
 <div className="chat-messages" role="log" ref={chatScroll}>{messages.length===0&&<p className="chat-empty">Пока нет сообщений. Начните разговор.</p>}{messages.map(m=><div className={'chat-message '+(m.sender===sender?'mine':'')} key={m.id}><div className="chat-by">{m.sender} · {new Date(m.created_at).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div><div className={m.body.startsWith("SOFA_STICKER:")?"chat-body chat-sticker":m.body.startsWith("SOFA_MEDIA:")?"chat-body chat-media":"chat-body"}>{m.body.startsWith("SOFA_MEDIA:")?<img loading="lazy" referrerPolicy="no-referrer" src={m.body.slice(11)} alt="GIF или стикер" />:m.body.startsWith("SOFA_STICKER:")?m.body.slice(13):m.body}</div><button className={"chat-like "+((m.liked_by||[]).includes(sender)?"active":"")} type="button" onClick={()=>like(m)} aria-label="Поставить или убрать лайк">♥ <span>{(m.liked_by||[]).length||""}</span></button><button type="button" className="chat-delete" aria-label="Удалить сообщение" title="Удалить сообщение" onClick={()=>removeMessage(m)}>Удалить</button></div>)}<div ref={chatBottom}/></div>
 {error&&<p className="chat-error" role="alert">{error}</p>}
 <div className="chat-extras"><button type="button" className={picker==="emoji"?"current":""} onClick={()=>setPicker(picker==="emoji"?"":"emoji")}>☺ Смайлики</button><button type="button" className={picker==="sticker"?"current":""} onClick={()=>setPicker(picker==="sticker"?"":"sticker")}>✦ Стикеры и GIF</button></div>{picker==="emoji"&&<div className="chat-picker">{emoji.map((e,i)=><button type="button" key={i} onClick={()=>setDraft(v=>v+e)}>{e}</button>)}</div>}{(picker==="gif"||picker==="sticker")&&<div className="chat-media-picker"><div className="chat-media-tabs"><button type="button" className={picker==="sticker"?"current":""} onClick={()=>setPicker("sticker")}>Стикеры</button><button type="button" className={picker==="gif"?"current":""} onClick={()=>setPicker("gif")}>GIF-анимации</button></div><label htmlFor="chat-media-query">Поиск по эмоции или слову</label><div className="chat-emotion-tags">{["Радость","Любовь","Смех","Грусть","Злость","Удивление","Котики","Объятия"].map(t=><button key={t} type="button" onClick={()=>setMediaQuery(t)}>{t}</button>)}</div><input id="chat-media-query" placeholder="Радость, любовь, злость, котики…" value={mediaQuery} onChange={e=>setMediaQuery(e.target.value)}/><div className="chat-media-results">{mediaItems.map((item,i)=><button key={item.url+i} type="button" disabled={sending} title={item.title} onClick={()=>sendBody('SOFA_MEDIA:'+item.url)}><img loading="lazy" referrerPolicy="no-referrer" src={picker==="gif"?item.url:(item.preview||item.url)} alt={item.title}/></button>)}</div>{mediaError&&<p className="chat-error">{mediaError}</p>}{mediaItems.length===0&&!mediaLoading&&!mediaError&&<p className="chat-empty">Ничего не найдено. Попробуй другую эмоцию.</p>}<div ref={mediaEnd} className="chat-media-bottom">{mediaLoading?'Ищем картинки…':mediaNext!==null?<button type="button" onClick={loadMore}>Загрузить ещё</button>:'Больше результатов нет'}</div><small className="chat-media-source">Источник: {mediaProvider||"интернет"}. Лента подгружается при прокрутке.</small></div>}{picker==="legacy"&&<div className="chat-picker">{stickers.map((e,i)=><button key={i} type="button" onClick={()=>sendBody('SOFA_STICKER:'+e)}>{e}</button>)}</div>}<form className="chat-compose" onSubmit={send}><input aria-label="Сообщение" placeholder="Написать сообщение…" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000}/><button className="action primary" disabled={sending||!draft.trim()}>Отправить</button></form></>}</section>
}
