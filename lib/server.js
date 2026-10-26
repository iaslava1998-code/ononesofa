import {createClient} from '@supabase/supabase-js';
import seed from '../data/films.json';

export function db(){
  if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)return null;
  return createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false}});
}

const normalize=s=>(s||'').toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const pending=new Map();
async function repairPoster(client,film){
  const token=process.env.TMDB_API_KEY;
  if(!token||!film.title||!film.year||film.poster)return film;
  const cacheKey=film.id;
  if(pending.get(cacheKey)>Date.now())return film;
  pending.set(cacheKey,Date.now()+30*60*1000);
  try{
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),6000);
    let response;
    try{
      response=await fetch('https://api.themoviedb.org/3/search/movie?language=ru-RU&query='+encodeURIComponent(film.title),{
        headers:{Authorization:'Bearer '+token},signal:controller.signal,cache:'no-store'
      });
    }finally{clearTimeout(timeout)}
    if(!response.ok)return film;
    const body=await response.json();
    const matches=(body.results||[]).filter(item=>item.poster_path&&
      String(item.release_date||'').slice(0,4)===String(film.year)&&
      normalize(item.title)===normalize(film.title));
    // Never guess when more than one film could match.
    if(matches.length!==1)return film;
    const poster=matches[0].poster_path;
    const {data,error}=await client.from('films').update({poster,tmdb_id:film.tmdb_id||matches[0].id})
      .eq('id',film.id).is('poster',null).select('poster,tmdb_id').maybeSingle();
    if(error||!data)return film;
    return {...film,poster:data.poster,tmdb_id:data.tmdb_id};
  }catch{return film}
}
export async function films(){
  const client=db();
  if(!client)return seed;
  const {data,error}=await client.from('films').select('*').order('created_at',{ascending:true});
  if(error)throw error;
  if(!process.env.TMDB_API_KEY)return data;
  const missing=data.filter(f=>!f.poster);
  // Keep requests bounded, even for a large watchlist.
  for(let i=0;i<missing.length;i+=3){
    const fixes=await Promise.all(missing.slice(i,i+3).map(f=>repairPoster(client,f)));
    for(const fixed of fixes){
      const index=data.findIndex(f=>f.id===fixed.id);
      if(index>=0)data[index]=fixed;
    }
  }
  return data;
}
