import type { Metadata } from "next";
import Link from "next/link";
import ForgetThisBrowser from "@/components/ForgetThisBrowser";

export const metadata: Metadata = {
  title: "Terms & Privacy — Vibe Check",
  description: "The plain-language legal page: terms of use and privacy.",
};

/**
 * §23.A (G3) — the legal floor: ToS, privacy, all-sales-final, contact. Plain
 * language, honest, and consistent with the §8/§9 entertainment framing. Static.
 */
export default function LegalPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <p className="text-xs font-bold tracking-[0.4em] text-accent">VIBE CHECK</p>
      <h1 className="mt-6 font-display text-4xl font-black leading-tight">
        Terms & privacy
      </h1>
      <p className="mt-3 text-sm text-muted">Plain language, no tricks. Last updated June 2026.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">What this is</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          Vibe Check is an <strong>entertainment</strong> product. It reads your quiz answers with a
          deterministic scoring engine and writes a playful, personality-style reading. It is not a
          psychological assessment, not medical or mental-health advice, and not a diagnosis of
          anything. Trait language (like &ldquo;Big Five&rdquo; or attachment styles) is used as a
          playful lens, grounded in published research on music preference — a mirror, never a
          verdict.
        </p>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Terms of use</h2>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>The paid &ldquo;full read&rdquo; is a one-time digital purchase for personal use.</li>
          <li>
            Don&apos;t use readings to make decisions about employment, credit, insurance, housing,
            or anything else that matters that much. It&apos;s entertainment.
          </li>
          <li>
            Footballer names appear only to describe public playing styles. Vibe Check is not
            affiliated with, endorsed by, or connected to FIFA, any club, league, or player.
          </li>
          <li>Don&apos;t abuse, reverse-engineer, or resell the service. Be normal.</li>
          <li>Not directed at children under 13.</li>
        </ul>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">All sales are final</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          The full read is a digital product delivered <strong>instantly</strong> — the moment you
          pay, it&apos;s unlocked and yours to keep. For that reason, all sales are final and we
          don&apos;t offer refunds. If something technically went wrong — you paid but couldn&apos;t
          see your read —{" "}
          {support ? (
            <>
              email <a className="text-accent underline" href={`mailto:${support}`}>{support}</a>
            </>
          ) : (
            "reply to your payment receipt"
          )}{" "}
          and we&apos;ll make sure you get what you paid for.
        </p>
      </section>

      {/*
        REWRITTEN E13/S4 ON PM RULING RT-G2 (b), to describe the product that
        exists. Every claim below was checked against the code rather than
        inherited. Two of the old ones were not stale but FALSE: it named Stripe
        as the payment processor, when `paymentProvider()` has defaulted to Dodo
        since the merchant-of-record change, and it named Vercel Web Analytics
        alone, when `src/lib/analytics.ts` has carried a second PostHog sink
        since E7. A third was true but silent about the largest thing we now
        keep: RT-G ruled device-local history, so this browser holds finished
        sessions, and a privacy page that does not mention them is a privacy
        page describing a different product.
      */}
      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Privacy</h2>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>
            <strong>No accounts, no user database.</strong> There is nothing to sign up for and no
            record of you on a server. Everything the gym knows about you is in the browser you are
            reading this in.
          </li>
          <li>
            <strong>Your sessions are stored on your device.</strong> When you finish an instrument
            we keep your raw answers in this browser&apos;s local storage — never a computed score,
            so nothing here can be edited into a better result. It is what lets a later session say
            whether your ear moved, and it is why the seven-day retest gate knows you. Switch
            device or clear your browsing data and it is gone; there is no copy anywhere else.
          </li>
          <li>
            Quiz answers in the older music and football readings live in the page URL, so a link
            you share carries them and nothing else does.
          </li>
          <li>
            Artist names you type are sent to our AI provider (Anthropic) solely to generate your
            reading, and ride along inside your purchase record so a paid report can be rebuilt
            from your receipt link.
          </li>
          <li>
            Payments are processed by <strong>Dodo Payments</strong>, which is the merchant of
            record — they are the seller, they handle tax and disputes, and we never see your card
            number.
          </li>
          <li>
            We collect anonymised usage events (page views, session completion, shares) through
            Vercel Web Analytics and PostHog, to see whether the product works. No advertising
            trackers, no selling data.
          </li>
          <li>
            Want a purchase record gone? Contact us ({support ? support : "reply to your receipt"})
            and we&apos;ll handle it.
          </li>
        </ul>

        {/* THE CONTROL ITSELF, ON THE PAGE PEOPLE LOOK FOR IT ON (Track G3,
            RT-G1 a). The result screens carry the same one inline; this is the
            copy reachable from every footer, including for someone who has run
            a single instrument and never seen the combined view. */}
        <div className="mt-5 border-t border-white/10 pt-5">
          <ForgetThisBrowser />
        </div>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Contact</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          {support ? (
            <>
              <a className="text-accent underline" href={`mailto:${support}`}>{support}</a> — or
              reply to your payment receipt.
            </>
          ) : (
            "Reply to your payment receipt and it reaches us."
          )}
        </p>
      </section>

      <div className="mt-10 mb-2">
        <Link href="/" className="text-sm text-muted underline">
          ← Back to Vibe Check
        </Link>
      </div>
    </main>
  );
}
