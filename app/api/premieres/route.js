import {NextResponse} from 'next/server';
import {authenticated} from '../../../lib/auth';
const genres={all:0,action:28,comedy:35,horror:27,scifi:878,thriller:53,romance:10749,detective:9648,animation:16};
export async function GET(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const key=process.env.TMDB_API_KEY;
 if(!key)return NextResponse.json({error:'TMDB is not configured'},{status:503});
 const params=new URL(request.url).searchParams;
 const genre=params.get('genre')||'all';
 const page=Math.min(5,Math.max(1,Number(params.get('page'))||1));
 const today=new Date(),start=new Date(today);start.setDate(start.getDate()-100);
 const fmt=d=>d.toISOString().slice(0,10);
 const qs=new URLSearchParams({language:'ru-RU',sort_by:'primary_release_date.desc',include_adult:'false',include_video:'false',page:String(page),'primary_release_date.gte':fmt(start),'primary_release_date.lte':fmt(today),'vote_count.gte':'0'});
 if(genres[genre])qs.set('with_genres',String(genres[genre]));
 try{
  const r=await fetch('https://api.themoviedb.org/3/discover/movie?'+qs,{headers:{Authorization:'Bearer '+key},next:{revalidate:21600}});
  if(!r.ok)return NextResponse.json({error:'TMDB unavailable'},{status:502});
  const d=await r.json();
  const source=(d.results||[]).filter(f=>f.poster_path);
  const russian=await Promise.all(source.map(async f=>{
   let title=f.title||f.original_title||'Без названия';
   if(!/[А-Яа-яЁё]/.test(title)){
    try{
     const rr=await fetch('https://api.themoviedb.org/3/movie/'+f.id+'/translations',{headers:{Authorization:'Bearer '+key},next:{revalidate:86400}});
     if(rr.ok){
      const td=await rr.json();
      const ru=(td.translations||[]).find(t=>t.iso_639_1==='ru'&&t.iso_3166_1==='RU')||(td.translations||[]).find(t=>t.iso_639_1==='ru');
      if(ru?.data?.title?.trim())title=ru.data.title.trim();
     }
    }catch{}
   }
   return {tmdb_id:f.id,title,year:f.release_date?.slice(0,4)||null,release_date:f.release_date,poster:f.poster_path,overview:f.overview,rating:f.vote_average};
  }));
  return NextResponse.json({results:russian,pages:Math.min(d.total_pages||1,5)},{headers:{'Cache-Control':'private, max-age=1800'}});
 }catch{return NextResponse.json({error:'Could not load premieres'},{status:502})}
}