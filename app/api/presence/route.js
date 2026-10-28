import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';

export const dynamic='force-dynamic';
export async function GET(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const client=db();
 if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {data,error}=await client.from('site_presence').select('name,last_seen');
 if(error)return NextResponse.json({error:'Presence unavailable'},{status:500});
 return NextResponse.json({people:data||[]},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const {name}=await request.json().catch(()=>({}));
 if(!['Слава','Вероника'].includes(name))return NextResponse.json({error:'Invalid name'},{status:400});
 const client=db();
 if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {error}=await client.from('site_presence').upsert({name,last_seen:new Date().toISOString()},{onConflict:'name'});
 if(error)return NextResponse.json({error:'Could not update presence'},{status:500});
 return NextResponse.json({ok:true});
}
