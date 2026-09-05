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
  },
});
