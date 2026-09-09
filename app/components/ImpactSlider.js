"use client";
import {useRef} from "react";

export default function ImpactSlider({children,label="Impact records"}){
  const track=useRef(null);
  const move=(direction)=>{
    const el=track.current;
    if(!el)return;
    el.scrollBy({left:direction*el.clientWidth*.86,behavior:"smooth"});
  };
  return <div className="impact-slider">
    <div className="impact-slider-controls" aria-label={label}>
      <button type="button" onClick={()=>move(-1)} aria-label="Previous">←</button>
      <button type="button" onClick={()=>move(1)} aria-label="Next">→</button>
    </div>
    <div className="impact-slider-track" ref={track}>{children}</div>
  </div>;
}