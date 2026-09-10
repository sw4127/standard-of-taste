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

/**
 * WHERE THE PINNED COMMIT KEEPS THE AUDIO — which is NOT where this checkout
 * keeps it, and the difference is deliberate.
 *
 * The pin is a historical commit, taken before the files were moved out of
 * `public/` so they would stop being copied into every deployment. That commit
 * is immutable, so its paths are frozen at `public/audio/...` and the URLs go on
 * resolving. `AUDIO_DIR` is where the same files live today.
 *
 * The two converge again the next time the pin moves forward. Until then,
 * anything asking "is this clip in the tree the CDN reads" wants this one, and
 * anything asking "is this clip in my working copy" wants the other.
 */
export const AUDIO_ROOT = "public/audio";

/** Where the audio lives in this checkout, outside the deployed directory. */
export const AUDIO_DIR = "audio";

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


/**
 * The repository path a served URL points at, or null if it is not one of ours.
 *
 * The inverse of `audioUrl`, and it exists so the pool gates can go on asking
 * the question they have always asked — does the audio a listener will request
 * actually exist — now that the answer lives in a commit rather than in
 * `public/`. A gate that checked the URL PREFIX was checking where the files
 * used to be; this lets it check whether they are there at all.
 */
export function audioRepoPath(url: string): string | null {
  const marker = `@${AUDIO_PIN}/`;
  const at = url.indexOf(marker);
  if (at === -1) return null;
  return url.slice(at + marker.length);
}

/** Whether a URL is served by this project's pinned audio host. */
export function isPinnedAudio(url: string): boolean {
  return url.startsWith(`https://cdn.jsdelivr.net/gh/${AUDIO_REPO}@${AUDIO_PIN}/${AUDIO_ROOT}/`);
}

/**
 * Where a served clip lives in THIS checkout.
 *
 * `audioRepoPath` answers for the pinned commit; the pipeline, and any gate
 * checking that a candidate file is actually present locally, needs the working
 * copy instead. Composed from the two roots rather than string-patched, so the
 * day the pin moves forward this returns the same answer without an edit.
 */
export function audioDiskPath(url: string): string | null {
  const rel = audioRepoPath(url);
  if (rel === null || !rel.startsWith(`${AUDIO_ROOT}/`)) return null;
  return `${AUDIO_DIR}/${rel.slice(AUDIO_ROOT.length + 1)}`;
}
