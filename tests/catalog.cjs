const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=__dirname+'/../';
const read=p=>fs.readFileSync(root+p,'utf8');
function route(path,extra={}){
 const code=read(path).replace(/import[^;]+;/g,'').replaceAll('export async function','async function');
 return vm.createContext({URL,process:{env:{TMDB_API_KEY:'test'}},NextResponse:{json:(body,options={})=>({body,status:options.status||200})},...extra,code});
}
async function main(){
 for(const kind of ['films','series']){
  let requested;
  const context=route('app/api/search/route.js',{fetch:async url=>{requested=url;return {ok:true,json:async()=>({results:[kind==='series'?{id:7,name:'Test series',first_air_date:'2024-01-01'}:{id:7,title:'Test film',release_date:'2023-01-01'}]})}}});
  vm.runInContext(context.code,context);
  const response=await context.GET({url:'https://example.test/api/search?type='+kind+'&q=test'});
  assert.equal(new URL(requested).pathname,kind==='series'?'/3/search/tv':'/3/search/movie');
  assert.equal(response.body.results[0].media_type,kind==='series'?'tv':'movie');
  assert.equal(response.body.results[0].title,kind==='series'?'Test series':'Test film');
 }
 for(const [kind,type,wrong] of [['films','movie','tv'],['series','tv','movie']]){
  let writes=0;
  const context=route('app/api/'+kind+'/route.js',{authenticated:()=>true,db:()=>({from:table=>{assert.equal(table,kind);return {upsert:async()=>{writes++;return {error:null}}}}})});
  vm.runInContext(context.code,context);
  const post=media_type=>context.POST({json:async()=>({tmdb_id:7,title:'Test',media_type})});
  assert.equal((await post(wrong)).status,400);assert.equal(writes,0);
  assert.equal((await post(type)).status,200);assert.equal(writes,1);
 }
 const page=read('app/page.jsx');
 const logic=page.slice(page.indexOf(' function changeKind('),page.indexOf('\n return <>'));
 const state={};let requests=[];let response;
 const context={kind:'series',searchRequest:{current:0},refresh:async()=>{},fetch:async(url,options)=>{requests.push({url,options});return response||{ok:true,json:async()=>({results:[]})}}};
 for(const name of ['Kind','Tab','Q','Status','Found','Loading','Add','Selected','Roulette'])context['set'+name]=value=>{state[name]=value};
 vm.createContext(context);vm.runInContext(logic,context);
 await context.addFilm({tmdb_id:1,title:'Premiere'},'films');assert.equal(requests.at(-1).url,'/api/films');
 await context.addFilm({tmdb_id:2,title:'Series',media_type:'tv'},'series');assert.equal(requests.at(-1).url,'/api/series');
 const count=requests.length;await context.addFilm({media_type:'movie'},'series');assert.equal(requests.length,count);
 let resolve;context.fetch=()=>new Promise(r=>{resolve=r});const pending=context.lookup('old');context.changeKind('films');resolve({ok:true,json:async()=>({results:[{title:'stale'}]})});await pending;assert.equal(state.Found.length,0);assert.equal(state.Loading,false);
 context.fetch=async()=>{throw Error('offline')};await context.lookup('test');assert.equal(state.Loading,false);assert.match(state.Status,/Нет связи/);
 assert.match(page,/onAdd=\{f=>addFilm\(f,'films'\)\}/);
 console.log('PASS: film/TV search, metadata, API type guards, premiere routing, series routing, stale requests, network errors');
}
main().catch(e=>{console.error(e);process.exit(1)});
