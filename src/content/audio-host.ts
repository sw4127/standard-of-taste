/**
 * WHERE THE INSTRUMENT'S AUDIO IS SERVED FROM (E19/S21, PM ruling RT-Z8 a).
 *
 * WHY IT MOVED. 154 MB of clip audio was packaged into every deployment, and
 * Vercel re-stored all of it on every push to serve files byte-identical to the
 * last push. It was 99.99% of the static payload — `public/` is 268 MB with the
 * audio and 35 KB without — and it filled the free tier's 10 GB of deployment
 * storage in two days. Vercel's own guidance names this case: "Do not package
 * large videos, archives, or changing data exports into each deployment when
 * the application can load them from separate storage."
 *
 * WHY jsDelivr AND NOT BLOB STORAGE. The audio is already in a public
 * repository, so a CDN that serves GitHub content costs nothing and adds no
 * account, no key and no recurring bill. Blob storage would have solved the
 * same problem for money, and the cost guardrail says flag a recurring cost
 * before taking one.
 *
 * WHY A COMMIT SHA AND NOT A TAG OR A BRANCH. Measured, not assumed:
 *
 *   @branch → x-jsd-version-type: branch, s-maxage=43200   (mutable, 12h)
 *   @commit → x-jsd-version-type: commit,
 *             cache-control: max-age=31536000, immutable   (a year, pinned)
 *
 * A branch reference means the audio under a listener's feet can change when
 * somebody pushes. A commit cannot. The pool versions already promise that a
 * share link replays the same clips; the pin is what keeps that true once the
 * bytes live somewhere else.
 *
 * THE PIN IS NOT A DEPLOYMENT CONCERN, IT IS A POOL CONCERN. It changes when
 * the audio changes, which is when a pool version changes — never as a side
 * effect of a push. `audio-host.test.ts` refuses a pin that does not contain
 * every file the manifests name, checked against git rather than the network,
 * so it fails on the machine rather than in front of a listener.
 *
 * ONE URL IN EVERY ENVIRONMENT, DELIBERATELY. The obvious convenience is to
 * serve `/audio/...` locally and the CDN in production, and it is refused: this
 * project has paid twice this week for defects that existed only on the surface
 * nobody had loaded. What runs in development is what ships.
 */

/** The public repository jsDelivr reads. */
export const AUDIO_REPO = "sw4127/standard-of-taste";

/**
 * The commit whose tree the audio is served from.
 *
 * MUST BE PUSHED TO THE REMOTE, because jsDelivr reads GitHub and not this
 * working copy. It is a commit that already contains every clip; it does not
 * need to be — and must not be — the commit that introduces this file.
 */
export const AUDIO_PIN = "41ab6dda578247f8f0a6f3a39f1e640038d2815f";

/** Path inside the repository where the audio lives, without a leading slash. */
export const AUDIO_ROOT = "public/audio";

/**
 * A clip's URL from a repo-relative path such as `staircase/st-pb1-w1.mp3`.
 *
 * Takes the path AFTER `public/audio/`, because that is the part the manifests
 * carry and the part that survives the files moving out of the deployment.
 */
export function audioUrl(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, "");
  return `https://cdn.jsdelivr.net/gh/${AUDIO_REPO}@${AUDIO_PIN}/${AUDIO_ROOT}/${clean}`;
}
