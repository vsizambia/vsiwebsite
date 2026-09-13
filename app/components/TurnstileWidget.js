"use client";

import { useEffect, useRef } from "react";

export default function TurnstileWidget({ action, onToken, className = "" }) {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const callbackRef = useRef(onToken);

  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey || !containerRef.current) return;

    let cancelled = false;
    const render = () => {
      if (cancelled || !window.turnstile || !containerRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey,
        action,
        callback: token => callbackRef.current?.(token),
        "expired-callback": () => callbackRef.current?.(""),
        "timeout-callback": () => callbackRef.current?.(""),
        "error-callback": errorCode => {
          console.error("Turnstile error:", errorCode);
          callbackRef.current?.("");
        },
      });
    };

    if (window.turnstile) render();
    else {
      const existing = document.querySelector('script[data-vsi-turnstile]');
      const script = existing || document.createElement("script");
      if (!existing) {
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.vsiTurnstile = "true";
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      const timer = window.setInterval(() => {
        if (window.turnstile) {
          window.clearInterval(timer);
          render();
        }
      }, 100);
      return () => {
        cancelled = true;
        window.clearInterval(timer);
        script.removeEventListener("load", render);
        if (widgetIdRef.current !== null && window.turnstile) {
          try { window.turnstile.remove(widgetIdRef.current); } catch {}
        }
        widgetIdRef.current = null;
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
      }
      widgetIdRef.current = null;
    };
  }, [action]);

  return <div ref={containerRef} className={className} aria-label="Security verification" />;
}
