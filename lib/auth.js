import {createHmac,timingSafeEqual} from 'crypto';
export function makeToken(pin){return createHmac('sha256',process.env.SITE_SESSION_SECRET||'').update(pin).digest('hex')}
export function authenticated(request){const pin=process.env.SITE_PIN,secret=process.env.SITE_SESSION_SECRET;if(!pin||!secret)return false;const token=request.cookies.get('sofa_access')?.value||'';const expected=makeToken(pin);try{return timingSafeEqual(Buffer.from(token),Buffer.from(expected))}catch{return false}}
