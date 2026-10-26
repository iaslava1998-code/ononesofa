import './globals.css';
import './season.css';
import './gate.css';
import './demon.css';
import './rating-stars.css';
export const metadata = {title:'На одном диване',description:'Наш киносписок: смотрим, спорим, оцениваем',icons:{icon:[{url:'/icon.svg',type:'image/svg+xml'}],shortcut:'/icon.svg'}};
export default function RootLayout({children}) {return <html lang="ru"><body>{children}</body></html>}
