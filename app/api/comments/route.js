import {NextResponse} from 'next/server';
import {db} from '../../../lib/server';
import {authenticated} from '../../../lib/auth';
export async function GET(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const id=new URL(request.url).searchParams.get('film_id');
 if(!id||id.length>150)return NextResponse.json({error:'Invalid film'},{status:400});
 const client=db();if(!client)return NextResponse.json({error:'No database'},{status:503});
 const {data,error}=await client.from('film_comments').select('id,film_id,sender,body,created_at').eq('film_id',id).order('id',{ascending:true}).limit(150);
 return error?NextResponse.json({error:'Cannot load comments'},{status:500}):NextResponse.json({comments:data||[]},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const b=await request.json().catch(()=>({}));
 if(typeof b.film_id!=='string'||!b.film_id||b.film_id.length>150||!['Слава','Вероника'].includes(b.sender)||typeof b.body!=='string'||!b.body.trim()||b.body.trim().length>2000)return NextResponse.json({error:'Invalid data'},{status:400});
 const client=db();if(!client)return NextResponse.json({error:'No database'},{status:503});
 const {data,error}=await client.from('film_comments').insert({film_id:b.film_id,sender:b.sender,body:b.body.trim()}).select('id,film_id,sender,body,created_at').single();
 return error?NextResponse.json({error:'Cannot save comment'},{status:500}):NextResponse.json({comment:data},{status:201});
}
