"use client";

import {useEffect,useState} from "react";

const STORAGE_KEY = "vsi-cookie-consent";

export default function CookieConsent(){
  const [visible,setVisible]=useState(false);

  useEffect(()=>{
    try{
      setVisible(localStorage.getItem(STORAGE_KEY)!=="accepted");
    }catch{
      setVisible(true);
    }
  },[]);

  function accept(){
    try{localStorage.setItem(STORAGE_KEY,"accepted");}catch{}
    setVisible(false);
  }

  if(!visible)return null;

  return (
    <aside className="vsi-cookie-banner" role="dialog" aria-label="Cookie and privacy notice">
      <div className="vsi-cookie-content">
        <div>
          <strong>Cookies &amp; privacy</strong>
          <p>
            VSI uses essential technologies to keep the website secure and working properly. We may also use
            optional technologies where enabled to understand website use and improve our services. Read our
            <a href="/privacy-policy"> Privacy Policy</a> and <a href="/data-protection">Data Protection</a> information.
          </p>
        </div>
        <div className="vsi-cookie-actions">
          <a className="vsi-cookie-link" href="/privacy-policy">Privacy Policy</a>
          <button type="button" onClick={accept}>Accept</button>
        </div>
      </div>
    </aside>
  );
}
