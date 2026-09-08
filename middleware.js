import {NextResponse} from "next/server";

const SAFE_METHODS=new Set(["GET","HEAD","OPTIONS"]);
const ALLOWED_ORIGINS=new Set([
  "https://www.vsizambia.org",
  "https://vsizambia.org",
  "https://vsiwebsite-vsi-zm.vercel.app",
]);
const ADMIN_COOKIE="vsi_admin_session";

function sameOrigin(request){
  const origin=request.headers.get("origin")?.trim();
  if(origin)return ALLOWED_ORIGINS.has(origin);
  const referer=request.headers.get("referer")?.trim();
  if(!referer)return false;
  try{return ALLOWED_ORIGINS.has(new URL(referer).origin);}catch{return false;}
}

async function isValidAdminSession(request){
  const token=request.cookies.get(ADMIN_COOKIE)?.value;
  const secret=process.env.ADMIN_SESSION_SECRET;
  if(!token||!secret)return false;
  const [expires,signature]=token.split(".");
  if(!expires||!signature||Number(expires)<Math.floor(Date.now()/1000))return false;
  const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signed=await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(expires));
  const expected=Array.from(new Uint8Array(signed)).map(b=>b.toString(16).padStart(2,"0")).join("");
  if(signature.length!==expected.length)return false;
  let diff=0;for(let i=0;i<signature.length;i++)diff|=signature.charCodeAt(i)^expected.charCodeAt(i);
  return diff===0;
}

export async function middleware(request){
  const pathname=request.nextUrl.pathname;
  if(pathname.startsWith("/admin")){
    if(await isValidAdminSession(request))return NextResponse.next();
    const loginUrl=request.nextUrl.clone();
    loginUrl.pathname="/auth/admin";
    loginUrl.searchParams.set("next",pathname+request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }
  if(!pathname.startsWith("/api/admin/"))return NextResponse.next();
  if(SAFE_METHODS.has(request.method))return NextResponse.next();
  if(!sameOrigin(request))return NextResponse.json({error:"Cross-site request blocked."},{status:403});
  return NextResponse.next();
}

export const config={matcher:["/admin/:path*","/api/admin/:path*"]};