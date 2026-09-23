# Name check — the reading's fictional artists, tracks and host (2026-09-23)

**Rule (owner rulings BA-8, BA-9):** no real artist, track, or brand anywhere on a mock. Every
fictional artist and track name in `src/content/reading/listeners.ts`, and the host name used by
the Company view, was checked by web search before it shipped. Any hit was replaced and re-checked.

**Method, and its limit.** Exact-phrase queries, batched six to nine names per query with `OR`, most
with a `music`, `song` or `band` context word. A batch was trusted only after one returned a hit
it contained: the query `"Quorvane" OR "Sondrelle" OR "Tessavox" OR "Lowvenn"` surfaced
"Quorvane" (a real song, 2026-05-07), so a batched query does report a name inside it. The host
name was also checked alone. **What this cannot rule out:** a name used by an artist too small to
be indexed, or indexed only on a platform the search engine does not reach. The criterion is an
exact match; partial overlaps (a real word inside an invented title) are listed below but were not
counted as hits unless the overlap was itself a music or company name.

**Listener first names (Mira, Teo, Lin)** are personas, not brands, and were not searched.

## Hits, and what replaced them

| Name first chosen | What it collided with | Replaced by (re-checked clear) |
|---|---|---|
| Mothlight Etude | "Mothlight": a music venue, a live album, a game soundtrack, a music company | Mothlamp Etude |
| Slowgold | Slowgold, a Swedish band | Ambergild |
| Ottoline Five / Ottoline Stroll | *Ottoline*, an album by L.A. Salami | Ottrel Five / Ottrel Stroll |
| Juniper Kells Trio / Kellsway Shuffle | Kells, a French band; then "Kallow", a recording artist | Juniper Qell Trio / Qellway Shuffle |
| Bramblefoot | two released songs of that title | Brambleknot Hop |
| PXLMOTH / PXL Candy | PIXL, a producer (too close in sound) | Zorbelle / Zorbelle Candy |
| Zestrel | a person's online handle | Zestrine |
| Fernwick Hollis / Fernwick Letter | Solan Fernwick, a performer | Fennow Hollis / Fennow Letter |
| Rye at Brenmoor | "BRENMOOR", a folk-ballad catalogue id | Rye at Tessmoor |
| **Marrowtone** (the host name the brief started from) | Marrowtone Smith Corp, a California corporation filed 2025-11-11; the Marrowstone Music Festival one letter away | **Tessavox** |
| Harkwell, Velloria, Oriveen (host candidates) | a UK label company; a clothing brand; a card-game character and a Finnish place-name form | not used |

## Checked clear, by listener

- **Mira.** Artists: Anneke Vosstrand, The Quillmere Room, Halcyrne, Dovetail Sistrum, Kestrelline,
  Ondo Varrick. Tracks: Tallowfen, Ostrelle, Late, The Quillmere Stair, Hush for Varrow, Lampwick
  Sonata, Fennish Glass, Orrinwick Window, Candlewane, Stillmoor, Low Tide at Essany, Mothlamp Etude,
  Wintel Hours, Velvetine Drift, Harrowglass, Soft Machinery of Ule, Brume Parade, Pellucine,
  Ambergild, Amberlane Tapes, Quietus Carnival, Halcyrne Blue, Dovetail Hymn, Sistrum Weather, Loam
  and Neon, Kestrel Signal, Bright Varrick, Signal Orchard, Tessellate Summer, Ondo Ondo, Glassrunner.
- **Teo.** Artists: Ottrel Five, Juniper Qell Trio, Zorbelle, Tesserine, Hollowvane Consort, Aurelle
  Stasis. Tracks: Ottrel Stroll, Qellway Shuffle, Tamarind Dispatch, Brambleknot Hop, Quorra Walk,
  Upright in Vell, Sunday at Merrow Yard, Hobnail Bounce, Tinbird Lope, Porch at Oduvell, Zorbelle
  Candy, Tesserine Rush, Glimmerjack, Hyperdew, Neon Quokka, Sugarwire, Blink Harbour, Zestrine,
  Chromafroth, Pop Vesuvia, Ultravine, Kilowisp, Hollowvane I, Hollowvane II, Aurelle's Long Room,
  Stasis for Nine Strings, Umbercall, Tidewell, The Slow Anvil, Ferrocanticle.
- **Lin.** Artists: Gravelhymn, Cinder Parish, Fennow Hollis, Tamsel & Rye, The Orvelle Singers,
  Chapelmoss. Tracks: Cindergrist, Parish of Static, Kilnroar, Blackwick Engine, Teeth of Harrowmere,
  Stormvellar, Fuse Sermon, Ironvelt, Gravelhymn Theme, Rustcantor, Fennow Letter, Tamsel Lullaby,
  Rye at Tessmoor, Small Hands of Brenn, Linenvale Road, Ashgrove Quill, Thimblewort, Quiet Engine of
  Wellsby, Morrowleaf, Pinewhistle Air, Candlefern, Sparrowgilt, Orvelle Magnificat, Chapelmoss
  Evening, Seven Candles for Aune, Organ at Tullowmere, Stonevell Canticle, Brevellan Hymn, Lumen
  Tarry, Quire of Ashvel.

**The host:** Tessavox — checked alone, with the exact phrase, on 2026-09-23, and re-checked before
the Company view shipped the same day. No company, artist or product of that name was found.

**Partial overlaps noted, not counted:** "Kestrel" (a common word), "Merrow" (a small artist; the
exact "Merrow Yard" returned nothing), "Tin Bird Choir" (against "Tinbird Lope"), "Ondo" (an
irrigation company, a place), "Tessavo.com" (a domain for sale) and "Tessa Fox" (a performer's
name) against "Tessavox".

`src/content/reading/names.test.ts` holds the list above to the code: every name in the listeners
file must appear in this document's "checked clear" lists, so a name added later without a check
fails the build.
