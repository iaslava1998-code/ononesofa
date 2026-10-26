import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';

export async function GET(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const client=db();
 if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {data,error}=await client.from('chat_messages').select('id,sender,body,created_at').order('id',{ascending:false}).limit(150);
 if(error)return NextResponse.json({error:'Chat unavailable'},{status:500});
 return NextResponse.json({messages:(data||[]).reverse()},{headers:{'Cache-Control':'no-store'}});
}

export async function POST(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const client=db();
 if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const payload=await request.json().catch(()=>({}));
 const sender=payload.sender;
 const body=typeof payload.body==='string'?payload.body.trim():'';
 if(!['Слава','Вероника'].includes(sender)||!body||body.length>2000)return NextResponse.json({error:'Invalid message'},{status:400});
 const {data,error}=await client.from('chat_messages').insert({sender,body}).select('id,sender,body,created_at').single();
 if(error)return NextResponse.json({error:'Could not send'},{status:500});
 return NextResponse.json({message:data},{status:201});
}
