# The blueprint of record — Standard of Taste

Owner-approved 2026-09-23 (Cowork blueprint audit). This file is the one canonical text of the
project's goal, insight, demand, unmet demand, challenged assumptions and business case, with the
insight's argument. Every other statement of them quotes this file by ID, verbatim, or is registered
as a derived line that names the ID it serves. `src/content/blueprint.test.ts` enforces it.

<!-- BLUEPRINT:BEGIN v1 2026-09-23 -->

### The goal

**BP-GOAL** · A prototype that is never distributed, in which a reviewer can, within minutes, try the core as its intended user and see why a real company would fund it and how it would test that, with every simulated user, metric and stakeholder labelled as illustrative.
*Kind: owner ruling, not a claim.*

### The insight

**BP-INSIGHT** · Your recent taste carries cues about what you have been feeling, and because almost nobody can describe their own taste, putting its pattern into words gives you language for how those feelings show up in what you reach for.
*Label: ASSUMED. It is the conclusion of BP-ARG below.*

### The demand

**BP-DEMAND** · People want a readable account of what their recent taste says about how they have been, and a way to turn it into music about their own life.
*Label: ASSUMED. It does not follow from the insight; it is an independent premise.*

### The unmet demand

**BP-UNMET** · Existing tools label your listening, turn your words into playlists, or turn a playlist into a song without showing you why; none gives you a readable account of your recent taste that you can check, argue with, and carry into a prompt.
*Label: ASSUMED (a claim that nothing else does this; no full market survey). The named tools are EVIDENCED: Spotify daylist (2023-09-12) and Wrapped; Spotify AI playlists; Suno Inspire (v4.5+, 2025), which turns a playlist of the user's own Suno songs into a new track without showing its analysis.*

### The challenged assumptions

**BP-CA1** · Common sense: your taste is your history, your all-time favourites and years of plays. Rejected: for understanding yourself now or making something new, only what you are reaching for now or starting to reach for counts; what you used to like and no longer do has no value.
*Label: ASSUMED (a value claim; RT-8). Supporting finding: BP-F1.*

**BP-CA2** · Common sense: people know what they like and can say it. Rejected: almost nobody can describe their own taste in words beyond naming genres and artists.
*Label: EVIDENCED, qualitatively. Two sources, kept apart: BP-F2 (interviews) supports "almost nobody can describe their own taste in words"; "beyond naming genres and artists" rests on published prompt guides for music generators (MRD M8). Public copies use BP-CA2-PUBLIC, which attributes each half to its source.*

**BP-CA2-PUBLIC** · In the interviews behind this project, almost nobody could describe their own taste in words; the published prompt guides for music generators report the same failure, that people name artists and genres and cannot break down the sound.

**BP-CA3** · Common sense: there's no accounting for taste. Rejected: taste is subjective but still has a standard, because bad judgment comes from defects that can be removed (Hume).
*Kind: a philosophical position (Hume, "Of the Standard of Taste", 1757), not an empirical claim. It connects to the rest of the set only through BP-BRIDGE.*

**BP-BRIDGE** · What you can hear decides which words in your prompt are worth spending.
*Label: ASSUMED (an inference; the mapping of measured flaw families to prompt axes is MRD §4.1).*

### The business case

**BP-BUSINESS** · A streaming service would build this as a feature: it already holds each listener's recent listening, and a readable, arguable reading that ends in a prompt for the service's own licensed creation tools keeps listeners who want to make music inside the service.
*Label: ASSUMED. The direction is EVIDENCED: on 2025-10-16 Spotify announced "artist-first" AI music products with Sony, Universal, Warner and Merlin.*

### The two interview findings (evidence, quoted wherever the findings are cited)

**BP-F1** · Past listening predicts less than present and forming taste.
*Label: EVIDENCED, qualitatively. Listener interviews for a Columbia Business School engagement with Tidal; the notes are not in this repository. Interviews establish what listeners reported, not a measured prediction.*

**BP-F2** · Almost nobody can describe their own taste in words.
*Label: EVIDENCED, qualitatively. Same source and same caveat.*

### BP-ARG — the insight as an argument

**BP-ARG-P1** · Mood influences what people choose to hear.
*EVIDENCED. Knobloch & Zillmann (2002), "Mood management via the digital jukebox", Journal of Communication 52(2), doi:10.1111/j.1460-2466.2002.tb02549.x; population-level patterns in Park, Thom, Mennicken, Cramer & Macy (2019), Nature Human Behaviour 3, doi:10.1038/s41562-018-0508-z.*

**BP-ARG-P2** · The influence runs both ways: people choose music that matches a feeling and music that changes it.
*EVIDENCED. Knobloch & Zillmann (2002): participants put in a bad mood chose energetic, joyful music for longer.*

**BP-ARG-S1** · So the same listening pattern can come from opposite feelings: a reading cannot decode one person's feeling from their listening, but it can name the pattern, and the person supplies the feeling.
*INFERENCE from P1 and P2.*

**BP-ARG-P3** · Almost nobody can describe their own taste in words beyond naming genres and artists.
*EVIDENCED, qualitatively. This is BP-CA2's rejection, used as a premise.*

**BP-ARG-P4** · People do not already have words for how their recent feelings show up in what they reach for.
*ASSUMED.*

**BP-ARG-C** · Your recent taste carries cues about what you have been feeling, and because almost nobody can describe their own taste, putting its pattern into words gives you language for how those feelings show up in what you reach for.
*INFERENCE from S1, P3 and P4. Identical to BP-INSIGHT.*

**BP-ARG-WEAK** · The argument is weakest at P4, which nothing supports yet, and at the step from naming a pattern to saying anything about a feeling, which is why the reading offers and the reader decides.

**BP-ARG-OBJECTION** · The strongest objection is the Barnum effect: people accept generic descriptions as accurate about themselves, so a reader agreeing proves nothing.
*Forer (1949), "The fallacy of personal validation", Journal of Abnormal and Social Psychology 44(1).*

**BP-ARG-REPLY** · The reply is receipts and arguability: every line of the reading points at specific plays, so it is true of this listening and not of everyone, and the reader can reject any line.
*Receipts: spec §20.B ("depth = receipts, not paragraphs"). Arguability: BP-UNMET.*

**BP-ARG-OPEN** · One objection has no full answer: putting the reasons for a preference into words can change the preference.
*Wilson & Schooler (1991), "Thinking too much", Journal of Personality and Social Psychology 60(2), 181–192. Held open, not answered.*

### How the set hangs together

**BP-CHAIN** · The insight shows the reading is possible; the demand is a separate premise that people want it; the unmet demand adds what existing tools lack; the business case adds who holds the recent listening needed to read taste without asking people to describe it; the bridge ties what a listener can hear to the prompt.

<!-- BLUEPRINT:END -->
