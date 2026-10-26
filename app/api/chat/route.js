import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';

export async function GET(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const client=db();
 if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {data,error}=await client.from('chat_messages').select('id,sender,body,created_at,liked_by').order('id',{ascending:false}).limit(150);
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
 const {data,error}=await client.from('chat_messages').insert({sender,body}).select('id,sender,body,created_at,liked_by').single();
 if(error)return NextResponse.json({error:'Could not send'},{status:500});
 return NextResponse.json({message:data},{status:201});
}

export async function DELETE(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const payload=await request.json().catch(()=>({}));
 if(!Number.isSafeInteger(payload.id)||payload.id<=0)return NextResponse.json({error:'Invalid message'},{status:400});
 const client=db();if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {error}=await client.from('chat_messages').delete().eq('id',payload.id);
 return error?NextResponse.json({error:'Could not delete'},{status:500}):NextResponse.json({ok:true});
}

export async function PATCH(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const payload=await request.json().catch(()=>({}));
 if(!Number.isSafeInteger(payload.id)||!['Слава','Вероника'].includes(payload.sender))return NextResponse.json({error:'Invalid reaction'},{status:400});
 const client=db();if(!client)return NextResponse.json({error:'Database unavailable'},{status:503});
 const {data:message,error:readError}=await client.from('chat_messages').select('liked_by').eq('id',payload.id).single();
 if(readError)return NextResponse.json({error:'Message unavailable'},{status:404});
 const liked=new Set(message.liked_by||[]);
 if(liked.has(payload.sender))liked.delete(payload.sender);else liked.add(payload.sender);
 const {data,error}=await client.from('chat_messages').update({liked_by:[...liked]}).eq('id',payload.id).select('id,liked_by').single();
 return error?NextResponse.json({error:'Reaction failed'},{status:500}):NextResponse.json({reaction:data});
}
