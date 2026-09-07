import {NextResponse} from "next/server";
import {pool} from "../../../lib/db";

const defaults={header:{links:[["Discover VSI","/discover"],["Our work","/#work"],["Our story","/story"],["Community","/community"],["VSI News","/news"],["Events","/events"],["Volunteer","/volunteer"],["Contact","/#contact"]],ctaLabel:"Volunteer",ctaHref:"/volunteer"},footer:{brandText:"Promoting policies and initiatives that place students at the centre of national development.",explore:[["Home","/"],["Discover VSI","/discover"],["Our work","/#work"],["Our story","/story"],["VSI in the Community","/community"],["VSI News","/news"],["Events","/events"],["Volunteer","/volunteer"]],email:"vsizambia@gmail.com",phone:"+260 968 623 786",address:"Plot No. 9173, Ben Bella Road\nPeace Embassy Building, 1st Floor\nLusaka, Zambia"}};

export async function GET(request){
  const key=new URL(request.url).searchParams.get("key");
  if(!key||!defaults[key])return NextResponse.json({error:"Invalid chrome key."},{status:400});
  try{const r=await pool.query("SELECT published_content FROM website_chrome WHERE chrome_key=$1 LIMIT 1",[key]);return NextResponse.json({content:r.rows[0]?.published_content||defaults[key]},{headers:{"Cache-Control":"no-store"}})}catch{return NextResponse.json({content:defaults[key]},{headers:{"Cache-Control":"no-store"}})}
}
