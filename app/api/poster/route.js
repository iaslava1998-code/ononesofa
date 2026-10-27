import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';

const fail=(error,status)=>NextResponse.json({error},{status});
const validKind=kind=>kind==='series'?'series':kind==='films'?'films':null;
const validPoster=value=>typeof value==='string'&&/^\/[a-zA-Z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(value);

export async function GET(request){
 if(!authenticated(request))return fail('Unauthorized',401);
 const params=new URL(request.url).searchParams;
 const kind=validKind(params.get('kind'));
 const id=params.get('id');
 if(!kind||!id||id.length>150)return fail('Invalid request',400);
 const client=db(),token=process.env.TMDB_API_KEY;
 if(!client||!token)return fail('Poster service unavailable',503);
 const {data:record,error}=await client.from(kind).select('tmdb_id,poster').eq('id',id).maybeSingle();
 if(error||!record?.tmdb_id)return fail('Media not found',404);
 const media=kind==='series'?'tv':'movie';
 try{
  const r=await fetch('https://api.themoviedb.org/3/'+media+'/'+record.tmdb_id+'/images?include_image_language=ru,en,null',{headers:{Authorization:'Bearer '+token},signal:AbortSignal.timeout(7000),cache:'no-store'});
  if(!r.ok)return fail('TMDB unavailable',502);
  const data=await r.json();
  const current=record.poster?.startsWith('https://image.tmdb.org/t/p/')?'/'+record.poster.split('/').pop():record.poster;
  const posters=(data.posters||[]).map(p=>p.file_path).filter(p=>validPoster(p)&&p!==current);
  return NextResponse.json({posters:[...new Set(posters)].slice(0,12)});
 }catch{return fail('Poster lookup failed',502)}
}

export async function PATCH(request){
 if(!authenticated(request))return fail('Unauthorized',401);
 const body=await request.json().catch(()=>({}));
 const kind=validKind(body.kind);
 if(!kind||typeof body.id!=='string'||body.id.length>150||!validPoster(body.poster))return fail('Invalid request',400);
 const client=db();if(!client)return fail('Database unavailable',503);
 const {error}=await client.from(kind).update({poster:body.poster}).eq('id',body.id);
 return error?fail('Could not save poster',500):NextResponse.json({ok:true});
}
