'use client';
import {useEffect,useRef,useState} from 'react';
const url=path=>path?.startsWith('https://')?path:path?'https://image.tmdb.org/t/p/w500'+path:'/placeholder.svg';

export default function PosterImage({item,kind='films',...props}){
 const [source,setSource]=useState(()=>url(item.poster));
 const tried=useRef(new Set());
 const queue=useRef([]);
 const searching=useRef(false);
 const restored=useRef(false);
 const lookedUp=useRef(false);
 const alive=useRef(true);
 useEffect(()=>{
  alive.current=true;tried.current=new Set();queue.current=[];searching.current=false;restored.current=false;lookedUp.current=false;
  setSource(url(item.poster));
  if(!item.poster)recover();
  return()=>{alive.current=false};
 // Each record is a separate poster session.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[item.id,item.poster,kind]);
 async function recover(){
  if(searching.current||lookedUp.current||restored.current||!item.id||!item.tmdb_id){setSource('/placeholder.svg');return}
  searching.current=true;lookedUp.current=true;
  try{
   const response=await fetch('/api/poster?kind='+encodeURIComponent(kind)+'&id='+encodeURIComponent(item.id));
   if(!response.ok)throw new Error('No alternatives');
   const data=await response.json();
   if(!alive.current)return;
   queue.current=Array.isArray(data.posters)?data.posters.filter(Boolean):[];
   next();
  }catch{if(alive.current)setSource('/placeholder.svg')}
  finally{searching.current=false}
 }
 function next(){
  let path=queue.current.shift();
  while(path&&tried.current.has(path))path=queue.current.shift();
  if(!path){restored.current=true;setSource('/placeholder.svg');return}
  tried.current.add(path);
  setSource(url(path));
 }
 function failed(){
  if(source==='/placeholder.svg')return;
  if(queue.current.length){next();return}
  if(!restored.current)recover();
  else setSource('/placeholder.svg');
 }
 function loaded(){
  if(source==='/placeholder.svg'||source===url(item.poster))return;
  const pathname=new URL(source).pathname;
  const path=pathname.replace(/^\/t\/w500/,'');
  if(!/^\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(path))return;
  fetch('/api/poster',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,id:item.id,poster:path})}).catch(()=>{});
  restored.current=true;
 }
 return <img {...props} src={source} onError={failed} onLoad={loaded}/>;
}
