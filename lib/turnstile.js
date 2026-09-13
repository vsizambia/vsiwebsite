const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token, request, expectedAction) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("Turnstile verification is not configured.");
    return { ok: false, error: "Turnstile is not configured." };
  }

  if (typeof token !== "string" || token.trim().length === 0 || token.length > 2048) {
    return { ok: false, error: "Please complete the security check." };
  }

  const remoteip = request.headers.get("x-real-ip")?.trim()
    || request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || undefined;

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, response: token.trim(), ...(remoteip ? { remoteip } : {}) }),
      cache: "no-store",
    });
    if (!response.ok) return { ok: false, error: "The security check could not be verified." };

    const result = await response.json();
    if (!result.success) return { ok: false, error: "Please complete the security check again." };
    if (expectedAction && result.action !== expectedAction) {
      return { ok: false, error: "The security check could not be verified." };
    }

    return { ok: true, result };
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return { ok: false, error: "The security check is temporarily unavailable. Please try again." };
  }
}
