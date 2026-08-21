"use client";

import { useState } from "react";
import { track } from "@/lib/analytics";
import { readableOn, BRAND_ACCENT } from "@/lib/readable-on";

/**
 * Starts the hosted MoR checkout (spec §24) and redirects to it. If payments
 * aren't configured yet (501) and a dev-unlock href was provided (non-prod
 * only), it surfaces that so the gated report view is testable without keys.
 */
export default function UnlockButton({
  profile,
  price,
  devUnlockHref,
}: {
  profile: string;
  price: string;
  devUnlockHref?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function unlock() {
    setBusy(true);
    setNote(null);
    track("checkout_start", { profile });
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ profile }),
      });
      if (res.ok) {
        const { url } = await res.json();
        if (url) {
          window.location.href = url;
          return;
        }
      } else if (res.status === 501) {
        setNote(devUnlockHref ? "Payments not configured — use dev unlock below." : "Checkout isn't available yet.");
      } else {
        setNote("Something went wrong. Try again.");
      }
    } catch {
      setNote("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={unlock}
        disabled={busy}
        // `text-white` on the violet accent measured 3.86:1 against a 4.5 bar
        // at 18px/700 — the primary paid CTA was the least readable control on
        // its own page. Black clears at 5.45 and matches every other accent
        // button after E6/S19 and S21.
        className="rounded-full bg-accent px-10 py-4 text-lg font-bold transition hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
        style={{ color: readableOn(BRAND_ACCENT) }}
      >
        {busy ? "Opening checkout…" : `Unlock the full read · ${price}`}
      </button>
      <p className="text-xs text-muted">Less than your coffee · one-time · instant</p>
      {note ? <p className="mt-1 text-xs text-amber-400">{note}</p> : null}
      {devUnlockHref ? (
        <a href={devUnlockHref} className="mt-1 text-xs text-muted underline">
          Dev unlock (test the gated view)
        </a>
      ) : null}
    </div>
  );
}
