import {NextResponse} from 'next/server';import {timingSafeEqual} from 'crypto';import {makeToken,authenticated} from '../../../lib/auth';
export async function POST(request){const {pin}=await request.json().catch(()=>({}));const expected=process.env.SITE_PIN||'';if(!expected||!process.env.SITE_SESSION_SECRET||typeof pin!=='string')return NextResponse.json({error:'Not configured'},{status:503});const ok=Buffer.byteLength(pin)===Buffer.byteLength(expected)&&timingSafeEqual(Buffer.from(pin),Buffer.from(expected));if(!ok)return NextResponse.json({error:'Wrong PIN'},{status:401});const response=NextResponse.json({ok:true});response.cookies.set('sofa_access',makeToken(pin),{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/'});return response}

export async function GET(request){return NextResponse.json({authenticated:authenticated(request)},{headers:{'Cache-Control':'no-store'}})}

export async function DELETE(){const response=NextResponse.json({ok:true});response.cookies.set('sofa_access','',{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:0});return response}
