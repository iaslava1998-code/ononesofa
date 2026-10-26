'use client';
import {useEffect,useState} from 'react';
export default function Trailer({filmId}){
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[open,setOpen]=useState(false);
 useEffect(()=>{let active=true;setData(null);setLoading(true);setOpen(false);fetch('/api/trailer?id='+encodeURIComponent(filmId)).then(r=>r.ok?r.json():null).then(d=>{if(active)setData(d?.trailer||null)}).catch(()=>{}).finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[filmId]);
 if(loading)return <p className="hint">Ищем трейлер…</p>;
 if(!data)return null;
 return <div className="trailer-section"><button type="button" className="action trailer-button" onClick={()=>setOpen(true)}>▶ Смотреть трейлер</button>
 {open&&<div className="trailer-overlay" role="dialog" aria-modal="true" aria-label="Трейлер фильма" onClick={()=>setOpen(false)}><div className="trailer-frame" onClick={e=>e.stopPropagation()}><button className="trailer-close" aria-label="Закрыть трейлер" onClick={()=>setOpen(false)}>×</button><iframe src={'https://www.youtube-nocookie.com/embed/'+data.key+'?autoplay=1&rel=0'} title={data.name||'Трейлер фильма'} allow="autoplay; encrypted-media; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen/></div></div>}</div>
}
