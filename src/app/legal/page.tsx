import type { Metadata } from "next";
import Link from "next/link";
import ForgetThisBrowser from "@/components/ForgetThisBrowser";

export const metadata: Metadata = {
  title: "Terms & Privacy — The Taste Gym",
  description: "The plain-language legal page: terms of use and privacy.",
};

/**
 * §23.A (G3) — the legal floor: ToS, privacy, contact. Plain language, honest,
 * and consistent with the product that exists. Static.
 *
 * THE NON-PRIVACY SECTIONS DESCRIBED A DIFFERENT PRODUCT UNTIL E17. E13/S4
 * rewrote Privacy against the code and left the rest as it was written for the
 * legacy funnel, and it was carried in five successive handoffs as deferred
 * debt. Two of its claims were not merely stale:
 *
 *   - It sold a paid "full read" and declared all sales final. THERE IS NO PAID
 *     TIER and there has not been one since the D4 amendment, which says in
 *     terms that user-facing copy still promising one is a false claim to be
 *     fixed on sight. This page was the last of them, on the page a reader goes
 *     to precisely when they want to know what they are agreeing to.
 *   - It called the product a "personality-style reading". D1 is that this
 *     product evaluates taste and NEVER predicts personality, mood or
 *     psychological states. The legal page asserted the one thing the pivot
 *     exists to refuse.
 *
 * The football clause stays: /quiz and /fan-verdict are still routed, so the
 * trademark disclaimer still describes something a reader can reach.
 */
export default function LegalPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-10">
      <p className="text-xs font-bold tracking-[0.4em] text-accent">THE TASTE GYM</p>
      <h1 className="mt-6 font-display text-4xl font-black leading-tight">
        Terms & privacy
      </h1>
      <p className="mt-3 text-sm text-muted">Plain language, no tricks. Last updated September 2026.</p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold">What this is</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">
          The Taste Gym measures how you hear music. Each instrument is a listening task with
          answers you can get objectively wrong, and every number is computed by a deterministic
          engine in code — no machine-learning model and no language model classifies you. It is
          not a psychological assessment, not a personality test, not medical or mental-health
          advice, and not a diagnosis of anything. It does not predict your personality, your mood
          or your character, and it never claims to. Older readings still reachable here — the
          music and football quizzes — are entertainment and were never measurements.
        </p>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-xl font-semibold">Terms of use</h2>
        <ul className="mt-2 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-slate-300">
          <li>
            <strong>Everything here is free.</strong> There is no paid tier, no subscription and
            nothing to buy. The only gate is a seven-day wait before repeating an instrument, and
            that exists because a retest taken sooner measures your memory of the clips rather than
            your ear.
          </li>
          <li>
            Don&apos;t use any result here to make decisions about employment, credit, insurance,
            housing, or anything else that matters that much. It measures how you heard a handful of
            short clips on one afternoon.
          </li>
          <li>
            Footballer names appear only to describe public playing styles. The Taste Gym is not
            affiliated with, endorsed by, or connected to FIFA, any club, league, or player.
          </li>
          <li>Don&apos;t abuse, reverse-engineer, or resell the service. Be normal.</li>
          <li>Not directed at children under 13.</li>
        </ul>
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
            <strong>Your sessions are stored on your device.</strong>{" "}When you finish an instrument
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
            Artist names you type into the older music reading are sent to our AI provider
            (Anthropic) solely to write that reading. No instrument in the gym sends anything to a
            language model: every measured result is computed here, in code.
          </li>
          <li>
            We collect anonymised usage events (page views, session completion, shares) through
            Vercel Web Analytics and PostHog, to see whether the product works. No advertising
            trackers, no selling data.
          </li>
          <li>
            Want anything else gone? There is no server-side record of you to delete, but the button
            below clears everything this browser holds, and you can contact us
            ({support ? support : "through the address on the repository"}) with any question about it.
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
              <a className="text-accent underline" href={`mailto:${support}`}>{support}</a>.
            </>
          ) : (
            "The repository at github.com/sw4127/standard-of-taste is the way to reach us."
          )}
        </p>
      </section>

      <div className="mt-10 mb-2">
        <Link href="/" className="text-sm text-muted underline">
          ← Back to the gym
        </Link>
      </div>
    </main>
  );
}
