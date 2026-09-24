/**
 * THE COMPANY VIEW'S COPY (blueprint Part 6; BA-9, BA-12; BP-BUSINESS, BP-GOAL).
 *
 * Why a fictional streaming company, Tessavox, would build the reading, how it
 * would measure it, and what five of its departments would ask. Every sentence
 * lives here so the deck and the guards can read it. The business case itself
 * is not retyped: the page renders BP-BUSINESS from `docs/blueprint.md`.
 *
 * Two outside facts are cited, and both were checked on 2026-09-23 against the
 * source named beside them. NOT YET THROUGH A WRITING PASS.
 */
import { HOST_NAME } from "@/content/reading/copy";

export { HOST_NAME };

export const COMPANY_LABEL = "Illustrative. A fictional company; nothing here was measured.";
export const COMPANY_KICKER = "THE COMPANY VIEW";
export const COMPANY_TITLE = `Why ${HOST_NAME} would build the reading, and how it would find out if it was wrong.`;

export const CASE_HEADING = "The business case";
// The first line paraphrases BP-CA2, attributed as BP-CA2-PUBLIC attributes that half: to the
// interviews (BP-F2). The ID stays in this comment, not on the page. The lines serve BP-BUSINESS.
export const FIT_LINES: readonly string[] = [
  `${HOST_NAME} already holds what the reading needs: every listener's recent plays. Nobody is asked to describe their taste, which the interviews behind this project found almost nobody can do.`,
  `The prompt the reading ends in is pasted into ${HOST_NAME}'s own creation tool, trained on music it has licensed. The reading is the way in; the tool is what it feeds.`,
  "What a listener rejects and what they choose is a signal a recommender does not collect: a person correcting a description of their own listening.",
];

export const METRICS_HEADING = "What it would measure";
export interface Metric {
  name: string;
  definition: string;
  why: string;
}
export const NORTH_STAR: Metric = {
  name: "Readings that end in a creation start",
  definition: "Of the readings a listener opens, the share that reach the creation screen and start a track.",
  why: "It is the whole claim in one number: a reading worth having is one somebody carries into something they make.",
};
export const SUPPORTING: readonly Metric[] = [
  {
    name: "Kept-line rate",
    definition: "Lines kept, over lines shown.",
    why: "A reading whose lines are mostly rejected is describing somebody else.",
  },
  {
    name: "Chosen-reading rate",
    definition: "Kept lines where the listener picked one of the two offered readings, over kept lines.",
    why: "It says whether the offers land. A line kept with \"neither\" every time names a real pattern and misreads it.",
  },
];
export const GUARDRAILS: readonly Metric[] = [
  {
    name: "Rejection rate, per template",
    definition: "For each line template, rejections over showings.",
    // Serves BP-ARG-OBJECTION; the ID stays here, not on the page.
    why: "High means the template is wrong. Near zero is its own warning: a line nobody ever rejects may be true of everyone, which is the Barnum effect the receipts exist to prevent.",
  },
  {
    name: "Carve-out hits",
    definition: "Rendered sentences that match the carve-out patterns.",
    why: "The target is zero, always: nothing on any surface asserts anything about trauma, abuse or mental health.",
  },
  {
    name: "Opt-out rate",
    definition: "Listeners who turn the reading off, over listeners shown it.",
    why: "A feature that reads your listening back to you has to be easy to refuse, and a rising opt-out is the first sign it is unwelcome.",
  },
];

export const TEST_HEADING = "How it would test it";
export const TEST_DESIGN = `An A/B test at ${HOST_NAME}'s creation entry. Half of the visitors who open the creation tool see the reading and the prompt it ends in; the other half see the plain prompt box they see today.`;
export const PRIMARY_METRIC =
  "Primary metric: creation starts per visitor who reaches the creation entry, compared between the two arms.";
export const ASSUMPTIONS_HEADING = "Planning assumptions";
export const ASSUMPTIONS_NOTE = "Every number below is a planning assumption or computed from one. None is a result.";
export const FORMULA_LEAD = "Visitors needed in each arm, from the assumptions:";
export const OTHER_BASELINES_LEAD = "If the baseline were different:";
export const KILL_HEADING = "The result that would kill it";
export const KILL_LINES: readonly string[] = [
  "The upper end of the 95% interval for the lift falls below the smallest lift worth detecting. The reading is then not worth its screens, however much people enjoy it.",
  "Any carve-out hit in the rendered copy, at any point in the test.",
  "A template rejected by more than half the listeners it is shown to is pulled, and the test continues without it.",
];

export const STAKEHOLDERS_HEADING = "What five departments would ask";

export interface Source {
  what: string;
  date: string;
  url: string;
}
export interface Stakeholder {
  team: string;
  question: string;
  answer: string;
  cites: string;
  source?: Source;
}

export const ACCESS_NOW: Source = {
  what: "Access Now, Fight for the Future, the Union of Musicians and Allied Workers and more than 180 musicians and rights groups, letter to Spotify dated 4 May 2021 on its patent for detecting a speaker's \"emotional state\"; press release published",
  date: "19 May 2021",
  url: "https://www.accessnow.org/press-release/spotify-spy-tech-coalition/",
};

export const SPOTIFY_AI: Source = {
  what: "Spotify, \"artist-first\" AI music products announced with Sony, Universal, Warner, Merlin and Believe — not, at the time, a licence to train on their catalogues",
  date: "16 October 2025",
  url: "https://newsroom.spotify.com/2025-10-16/artist-first-ai-music-spotify-collaboration/",
};

export const STAKEHOLDERS: readonly Stakeholder[] = [
  {
    team: "Personalization",
    question: "Doesn't the recommender already do this?",
    answer:
      "The recommender acts on a listener's taste without ever showing it to them. The reading shows the pattern, points at the plays behind it, and lets the listener correct it; a correction is a signal the recommender never gets.",
    cites: "BP-UNMET, BP-ARG-REPLY",
  },
  {
    team: "Trust & safety",
    question: "Are we inferring how people feel from what they play?",
    answer:
      "We don't infer it, and the design refuses to. A line names a pattern and offers two readings as questions, because the same pattern can come from opposite feelings; the listener says which, if either. No model writes any sentence, and nothing on any surface asserts anything about trauma, abuse or mental health. In 2021 a streaming service's patent for detecting a listener's emotional state from their voice drew a public campaign against it.",
    cites: "BA-3, BP-ARG-S1, BA-10, RT-Z10 (a)",
    source: ACCESS_NOW,
  },
  {
    team: "Legal & licensing",
    question: "What data does it touch, and where does the prompt go?",
    answer: `Listening history ${HOST_NAME} already holds, read inside ${HOST_NAME}. The prompt goes only to ${HOST_NAME}'s own licensed creation tool, never to a third-party generator, and it names no artist. What that tool was trained on is its own licensing question, not the reading's.`,
    cites: "BP-BUSINESS, BA-8, BA-11",
  },
  {
    team: "Growth",
    question: "Which number does it move, and how would we know it didn't?",
    answer:
      "Creation starts, tested against today's plain prompt box, with the result that kills it written down before the test runs. The demand underneath is assumed, not shown: nobody has yet been observed wanting this.",
    cites: "BP-DEMAND (ASSUMED), BP-GOAL",
  },
  {
    team: "Label partnerships",
    question: "Will labels see this as a tool that competes with their artists?",
    answer: `The prompt feeds ${HOST_NAME}'s licensed tool, which is the direction the industry has taken in public: in October 2025 a major streaming service announced AI music products built with the labels rather than around them.`,
    cites: "BP-BUSINESS",
    source: SPOTIFY_AI,
  },
];

export const TRY_IT = "Try the reading";
