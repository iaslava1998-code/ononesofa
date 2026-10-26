import {createClient} from '@supabase/supabase-js';
import seed from '../data/films.json';
export function db(){if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return null;return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}})}
const norm=s=>(s||'').toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const attempted=new Map();
async function updatePoster(client,f){
 const token=process.env.TMDB_API_KEY;if(!token||f.id==='seed-2')return f;
 attempted.set(f.id,Date.now()+1800000);
 try{
  let movie;
  if(f.tmdb_id){
   const r=await fetch('https://api.themoviedb.org/3/movie/'+f.tmdb_id+'?language=ru-RU',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(6000),cache:'no-store'});
   if(!r.ok)return f;movie=await r.json();
  }else{
   const query=f.id==='seed-19'?'Contratiempo':f.title;
   const r=await fetch('https://api.themoviedb.org/3/search/movie?language=ru-RU&query='+encodeURIComponent(query),{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(6000),cache:'no-store'});
   if(!r.ok)return f;
   const search=await r.json();
   const matches=(search.results||[]).filter(x=>x.poster_path&&String(x.release_date||'').slice(0,4)===String(f.year)&&(norm(x.title)===norm(f.title)||norm(x.original_title)===norm(query)));
   if(matches.length!==1)return f;movie=matches[0];
  }
  if(!movie?.poster_path)return f;
  const poster=movie.poster_path;
  const {data,error}=await client.from('films').update({poster,tmdb_id:movie.id}).eq('id',f.id).select('poster,tmdb_id').single();
  return error?f:{...f,poster:data.poster,tmdb_id:data.tmdb_id};
 }catch{return f}
}
export async function films(){
 const client=db();if(!client)return seed;
 const {data,error}=await client.from('films').select('*').order('created_at',{ascending:true});
 if(error)throw error;if(!process.env.TMDB_API_KEY)return data;
 const now=Date.now();
 // Replace unverified legacy image links with authoritative TMDB paths. Do not guess ambiguous titles.
 const candidates=data.filter(f=>f.id!=='seed-2'&&(!f.poster||f.poster.startsWith('https://image.tmdb.org/'))&&(!attempted.has(f.id)||attempted.get(f.id)<now)).slice(0,8);
 const updated=await Promise.all(candidates.map(f=>updatePoster(client,f)));
 for(const item of updated){const i=data.findIndex(f=>f.id===item.id);if(i>=0)data[i]=item}
 return data;
}
