import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
const norm=s=>(s||'').toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
async function tmdb(path,key){const r=await fetch('https://api.themoviedb.org/3'+path,{headers:{Authorization:'Bearer '+key},next:{revalidate:86400}});if(!r.ok)throw Error('TMDB error');return r.json()}
export async function GET(request){
 const key=process.env.TMDB_API_KEY, id=new URL(request.url).searchParams.get('id');
 if(!key)return NextResponse.json({error:'TMDB не подключён'},{status:503});
 if(!id||id.length>150)return NextResponse.json({error:'Неверный фильм'},{status:400});
 const client=db();if(!client)return NextResponse.json({error:'База недоступна'},{status:503});
 const {data:film,error}=await client.from('films').select('id,title,year,tmdb_id').eq('id',id).maybeSingle();
 if(error||!film)return NextResponse.json({error:'Фильм не найден'},{status:404});
 try{
  let movieId=film.tmdb_id;
  if(!movieId){
   const known={'seed-19':'Contratiempo'};
   const title=known[id]||film.title;
   const results=await tmdb('/search/movie?language=ru-RU&query='+encodeURIComponent(title),key);
   const matches=(results.results||[]).filter(x=>String(x.release_date||'').slice(0,4)===String(film.year)&&
     (norm(x.title)===norm(film.title)||norm(x.original_title)===norm(title)));
   if(matches.length!==1)return NextResponse.json({trailer:null});
   movieId=matches[0].id;
  }
  const [ru,en]=await Promise.all([
    tmdb('/movie/'+movieId+'/videos?language=ru-RU',key),
    tmdb('/movie/'+movieId+'/videos?language=en-US',key)
  ]);
  const videos=[...(ru.results||[]),...(en.results||[])].filter(v=>v.site==='YouTube'&&v.key&&/^[a-zA-Z0-9_-]{11}$/.test(v.key)&&['Trailer','Teaser'].includes(v.type));
  const unique=[...new Map(videos.map(v=>[v.key,v])).values()];
  unique.sort((a,b)=>(b.type==='Trailer')-(a.type==='Trailer')||(b.official===true)-(a.official===true));
  return NextResponse.json({trailer:unique[0]?{key:unique[0].key,name:unique[0].name}:null});
 }catch{return NextResponse.json({error:'Не удалось загрузить трейлер'},{status:502})}
}
