import {NextResponse} from "next/server";

const SAFE_METHODS=new Set(["GET","HEAD","OPTIONS"]);
const ALLOWED_ORIGINS=new Set([
  "https://www.vsizambia.org",
  "https://vsizambia.org",
  "https://vsiwebsite-vsi-zm.vercel.app",
]);

function sameOrigin(request){
  const origin=request.headers.get("origin")?.trim();
  if(origin)return ALLOWED_ORIGINS.has(origin);

  const referer=request.headers.get("referer")?.trim();
  if(!referer)return false;
  try{
    return ALLOWED_ORIGINS.has(new URL(referer).origin);
  }catch{
    return false;
  }
}

export function middleware(request){
  if(!request.nextUrl.pathname.startsWith("/api/admin/"))return NextResponse.next();
  if(SAFE_METHODS.has(request.method))return NextResponse.next();

  if(!sameOrigin(request)){
    return NextResponse.json({error:"Cross-site request blocked."},{status:403});
  }

  return NextResponse.next();
}

export const config={
  matcher:["/api/admin/:path*"],
};
