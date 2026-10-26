import {NextResponse} from 'next/server';
import {authenticated} from '../../../../lib/auth';

const map={радость:'happy',смех:'laugh',смешно:'funny',любовь:'love',грусть:'sad',злость:'angry',удивление:'surprised',объятия:'hug',кот:'cat',котики:'cat',поцелуй:'kiss',страх:'scared',танцы:'dance',ура:'celebration',милота:'cute',реакция:'reaction'};
export async function GET(request){
 if(!authenticated(request))return NextResponse.json({error:'Unauthorized'},{status:401});
 const {searchParams}=new URL(request.url);
 const type=searchParams.get('type')==='sticker'?'sticker':'gif';
 const raw=(searchParams.get('q')||'').trim().slice(0,50);
 const term=map[raw.toLowerCase()]||raw||(type==='gif'?'reaction':'cute');
 const offset=Math.min(5000,Math.max(0,Number(searchParams.get('offset'))||0));
 const query=type==='gif'?term+' animated gif':term+' (sticker OR emoji OR emoticon OR cartoon)';
 const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:query,gsrnamespace:'6',gsrlimit:'50',gsroffset:String(offset),prop:'imageinfo',iiprop:'url|mime|size',format:'json',formatversion:'2'});
 try{
  const response=await fetch('https://commons.wikimedia.org/w/api.php?'+params,{headers:{'User-Agent':'OnOneSofa/1.0 cinema chat media search'},signal:AbortSignal.timeout(10000),cache:'no-store'});
  if(!response.ok)throw Error('Source unavailable');
  const data=await response.json();
  const items=(data.query?.pages||[]).flatMap(p=>{
   const i=p.imageinfo?.[0];if(!i||i.size>6000000)return[];
   const url=i.url||'';
   if(!url.startsWith('https://upload.wikimedia.org/'))return[];
   if(type==='gif'&&i.mime!=='image/gif')return[];
   if(type==='sticker'&&!['image/png','image/webp','image/gif','image/svg+xml'].includes(i.mime))return[];
   return[{url,title:p.title.replace(/^File:/,''),source:'https://commons.wikimedia.org/wiki/'+encodeURIComponent(p.title.replaceAll(' ','_'))}];
  });
  const nextOffset=data.continue?.gsroffset??null;
  return NextResponse.json({items,nextOffset},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({items:[],nextOffset:null,error:'Сейчас не удалось загрузить изображения'},{status:502})}
}
