import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';

export async function PATCH(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const body=await request.json().catch(()=>({}));
 const table=body.kind==='series'?'series':body.kind==='films'?'films':null;
 const ids=body.ids;
 if(!table||!Array.isArray(ids)||ids.length>500||!ids.length||ids.some(id=>typeof id!=='string'||id.length>150)||new Set(ids).size!==ids.length||!['want','seen'].includes(body.tab))
  return NextResponse.json({error:'Invalid order'},{status:400});
 const client=db();if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {data,error}=await client.from(table).select('id,slava,veronika');
 if(error)return NextResponse.json({error:'Could not fetch media'},{status:503});
 const group=data.filter(x=>body.tab==='seen'?x.slava!=null||x.veronika!=null:x.slava==null&&x.veronika==null);
 if(group.length!==ids.length||!ids.every(id=>group.some(x=>x.id===id)))
  return NextResponse.json({error:'List changed, refresh the page'},{status:409});
 for(let i=0;i<ids.length;i++){
  const {error:updateError}=await client.from(table).update({sort_order:i}).eq('id',ids[i]);
  if(updateError)return NextResponse.json({error:'Could not save full order'},{status:500});
 }
 return NextResponse.json({ok:true});
}
