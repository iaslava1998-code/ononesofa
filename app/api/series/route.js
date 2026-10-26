import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';
const fail=(message,status)=>NextResponse.json({error:message},{status});
export async function GET(){
 const c=db();if(!c)return fail('Database not configured',503);
 const {data,error}=await c.from('series').select('*').order('created_at',{ascending:true});
 return error?fail('Series unavailable',503):NextResponse.json({series:data||[]});
}
const valid=n=>n===null||(typeof n==='number'&&Number.isFinite(n)&&n>=0&&n<=10);
export async function PATCH(request){
 if(!authenticated(request))return fail('Unauthorized',401);const c=db();if(!c)return fail('Database not configured',503);
 const b=await request.json().catch(()=>({}));if(typeof b.id!=='string'||!valid(b.slava)||!valid(b.veronika))return fail('Invalid data',400);
 const {error}=await c.from('series').update({slava:b.slava,veronika:b.veronika}).eq('id',b.id);
 return error?fail('Could not update ratings',500):NextResponse.json({ok:true});
}
export async function POST(request){
 if(!authenticated(request))return fail('Unauthorized',401);const c=db();if(!c)return fail('Database not configured',503);
 const b=await request.json().catch(()=>({}));if(!Number.isInteger(b.tmdb_id)||b.tmdb_id<=0||typeof b.title!=='string'||!b.title.trim()||b.title.length>200)return fail('Invalid series',400);
 const {error}=await c.from('series').upsert({tmdb_id:b.tmdb_id,title:b.title.trim(),year:b.year?Number(b.year):null,poster:b.poster||null,overview:b.overview||null},{onConflict:'tmdb_id',ignoreDuplicates:true});
 return error?fail('Could not save series',500):NextResponse.json({ok:true});
}
export async function DELETE(request){
 if(!authenticated(request))return fail('Unauthorized',401);const c=db();if(!c)return fail('Database not configured',503);
 const b=await request.json().catch(()=>({}));if(typeof b.id!=='string'||b.id.length>150)return fail('Invalid id',400);
 const {error}=await c.from('series').delete().eq('id',b.id);
 return error?fail('Could not delete series',500):NextResponse.json({ok:true});
}