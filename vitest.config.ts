import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

// Mirror the tsconfig "@/*" -> "./src/*" path alias so tests resolve the same
// imports the Next.js app does.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    /**
     * A GIT WORKTREE UNDER `.claude/` IS A SECOND COPY OF THIS REPOSITORY, AND
     * VITEST WAS COLLECTING BOTH (E17/S6).
     *
     * Spawning a background task creates `.claude/worktrees/<name>/`, a full
     * checkout. With only the default excludes, `vitest run` went from 172
     * files and 2330 tests to 282 and 3740 — the same suite counted twice,
     * with the other agent's in-progress edits mixed in. Every number in that
     * run is unreadable: a green result could be hiding a red one in this tree
     * behind a pass in the other, and the totals a session pastes as proof
     * would be measuring somebody else's working copy.
     *
     * `node_modules` and `dist` are vitest's defaults and are restated because
     * setting `exclude` replaces the default list rather than adding to it.
     */
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.claude/worktrees/**",
    ],

    /**
     * THE DEFAULT FIVE SECONDS IS A SPEED BUDGET, AND THIS SUITE HAS TESTS THAT
     * LEGITIMATELY EXCEED IT UNDER LOAD (E19/S23).
     *
     * Several tests do real work rather than arithmetic: `speech.test.ts`
     * decodes the whole shipped audio pool through ffmpeg, `irt.test.ts`
     * recovers parameters across sample sizes. Alone they take one to two
     * seconds. Run in parallel with 160 other files they intermittently crossed
     * five, and the failures moved around between runs — speech, then irt, then
     * deck-templates — which is the signature of contention rather than of a
     * defect. Each was verified to pass on its own before this was touched.
     *
     * RAISING A TIMEOUT TO MAKE A RED SUITE GREEN IS USUALLY THE WRONG MOVE and
     * it is worth saying why this is not that. A timeout catches a HANG. It was
     * doing a second job here — enforcing a speed budget on tests whose cost is
     * dominated by how busy the machine is, which is not a property of the test.
     * The first response was to cut what had actually got slower: `demoRecovery`
     * was recomputing 6.4 million draws on every call and is now memoised. This
     * covers the remainder.
     *
     * A genuinely hung test now takes fifteen seconds to fail instead of five.
     * That is the whole cost.
     */
    testTimeout: 15_000,
  },
});
