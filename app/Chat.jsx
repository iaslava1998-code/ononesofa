'use client';
import {useEffect,useState} from 'react';
export default function Chat({unlocked}){
 const [sender,setSender]=useState('');
 const [messages,setMessages]=useState([]);
 const [draft,setDraft]=useState('');
 const [error,setError]=useState('');
 const [sending,setSending]=useState(false);
 const [picker,setPicker]=useState('');
 const emoji=['❤️','😂','🥹','😍','😘','😎','🥰','😭','🔥','✨','😈','💚','🍿','🎬','⭐','👍','😴','🙃','💋','🤍'];
 const stickers=['😈','👽','🤖','🐈','🍿','🧙','👻','🦇','💀','🐸','🦄','🧸'];
 useEffect(()=>{try{setSender(localStorage.getItem('sofa_chat_sender')||'')}catch{}},[]);
 useEffect(()=>{if(!unlocked)return;let active=true;
 async function load(){try{const r=await fetch('/api/chat',{cache:'no-store'});if(!r.ok)throw Error('Чат недоступен');const d=await r.json();if(active){setMessages(d.messages||[]);setError('')}}catch(e){if(active)setError(e.message)}}
 load();const t=setInterval(load,5000);return()=>{active=false;clearInterval(t)};
 },[unlocked]);
 function choose(n){setSender(n);try{localStorage.setItem('sofa_chat_sender',n)}catch{}}
 async function send(e){e.preventDefault();return sendBody(draft)}
 async function sendBody(body){if(!sender){setError('Выбери имя');return}if(!body.trim()||sending)return;setSending(true);
 try{const r=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sender,body:body.trim()})});if(!r.ok)throw Error('Не получилось отправить');const d=await r.json();setMessages(old=>old.some(m=>m.id===d.message.id)?old:[...old,d.message]);setDraft('');setPicker('');setError('')}catch(e){setError(e.message)}finally{setSending(false)}}
 async function like(m){if(!sender){setError('Сначала выбери своё имя');return}try{const r=await fetch('/api/chat',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:m.id,sender})});if(!r.ok)throw Error('Не удалось поставить лайк');const d=await r.json();setMessages(old=>old.map(x=>x.id===m.id?{...x,liked_by:d.reaction.liked_by}:x))}catch(e){setError(e.message)}}
 async function removeMessage(m){if(!window.confirm('Удалить это сообщение у вас обоих?'))return;try{const r=await fetch('/api/chat',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:m.id})});if(!r.ok)throw Error('Не удалось удалить сообщение');setMessages(old=>old.filter(item=>item.id!==m.id));setError('')}catch(e){setError(e.message)}}
 return <section className="chat-shell" id="chat"><div className="chat-head"><div><span className="eyebrow">Наш уголок</span><h2>Чат на двоих</h2><p className="muted">Сообщения появляются у обоих автоматически.</p></div><span className="chat-live">● Общий чат</span></div>
 {!unlocked?<p className="notice">Чтобы переписываться, войдите по общему PIN.</p>:<>
 <div className="chat-who"><span>Я пишу как:</span>{['Слава','Вероника'].map(n=><button type="button" key={n} className={'pill '+(sender===n?'active':'')} onClick={()=>choose(n)}>{n}</button>)}</div>
 <div className="chat-messages" role="log">{messages.length===0&&<p className="chat-empty">Пока нет сообщений. Начните разговор.</p>}{messages.map(m=><div className={'chat-message '+(m.sender===sender?'mine':'')} key={m.id}><div className="chat-by">{m.sender} · {new Date(m.created_at).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div><div className={m.body.startsWith("SOFA_STICKER:")?"chat-body chat-sticker":"chat-body"}>{m.body.startsWith("SOFA_STICKER:")?m.body.slice(13):m.body}</div><button className={"chat-like "+((m.liked_by||[]).includes(sender)?"active":"")} type="button" onClick={()=>like(m)} aria-label="Поставить или убрать лайк">♥ <span>{(m.liked_by||[]).length||""}</span></button><button type="button" className="chat-delete" aria-label="Удалить сообщение" title="Удалить сообщение" onClick={()=>removeMessage(m)}>Удалить</button></div>)}</div>
 {error&&<p className="chat-error" role="alert">{error}</p>}
 <div className="chat-extras"><button type="button" className={picker==="emoji"?"current":""} onClick={()=>setPicker(picker==="emoji"?"":"emoji")}>☺ Смайлики</button><button type="button" className={picker==="sticker"?"current":""} onClick={()=>setPicker(picker==="sticker"?"":"sticker")}>✦ Стикеры</button></div>{picker&&<div className="chat-picker">{(picker==="emoji"?emoji:stickers).map((e,i)=><button type="button" key={i} aria-label={picker==="emoji"?"Добавить смайлик":"Отправить стикер"} onClick={()=>picker==="emoji"?setDraft(v=>v+e):sendBody("SOFA_STICKER:"+e)}>{e}</button>)}</div>}<form className="chat-compose" onSubmit={send}><input aria-label="Сообщение" placeholder="Написать сообщение…" value={draft} onChange={e=>setDraft(e.target.value)} maxLength={2000}/><button className="action primary" disabled={sending||!draft.trim()}>Отправить</button></form></>}</section>
}
