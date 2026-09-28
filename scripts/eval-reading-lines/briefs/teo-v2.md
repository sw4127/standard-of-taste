You are writing the lines of a "reading" of one listener's last four weeks of music plays, for a product that shows a listener patterns in what they reach for. The listener, "Teo", is fictional and illustrative.

Write ONE line for EACH fact below. Each line has three parts:
1. pattern: one or two sentences saying only what the plays show: how many, when, which. It must name no feeling or state of mind at all. It is the part a reader can check.
2. receipt: the count behind the pattern, stated as numbers taken from the fact (for example "41 of 120 plays").
3. offers: exactly two questions, each offering one possible reading of what the pattern might mean for the listener. The same pattern can come from opposite feelings, so the two offers should point in different directions. A question may name a feeling, because it hands the feeling to the reader to accept or refuse.

Rules that apply to every word:
- Never say the listener IS or FEELS something, or that a pattern MEANS or SHOWS something about them. Offer, do not assert.
- No comparison with other people: no percentiles, no "most listeners", no "unusual" or "average". There is no population to compare with.
- Nothing about trauma, abuse, grief, mental health, therapy or anything clinical, on any line, even as a question.
- Address the reader as "you": the reader is the listener. Never name the listener in the third person, and never use a pronoun such as she, he or they for them.
- Use only numbers that are in the fact, percentages computed from them, or these definitions: the plays span 28 days (days 0-27); week one is days 0-6 and week four is days 21-27; late night is 23:00-03:59 (11 at night to 4 in the morning); an early skip is abandoning a new track's first play inside 30 seconds.

Reply with JSON only, no prose around it, in exactly this shape:
{"lines": [{"fact": "<the fact's kind>", "pattern": "...", "receipt": "...", "offers": ["...?", "...?"]}]}

The facts:
[
  {
    "kind": "earlySkip",
    "playsCounted": 17,
    "direction": "high",
    "newTracksTried": 17,
    "skippedInside30s": 13,
    "soundThatKeptMost": "live bass and brushed drums"
  },
  {
    "kind": "lateNight",
    "playsCounted": 14,
    "direction": "low",
    "totalPlays": 384,
    "latePlays": 14
  },
  {
    "kind": "drift",
    "playsCounted": 62,
    "fromSound": "live bass and brushed drums",
    "toSound": "chopped vocal samples and bright synths",
    "weekOnePlays": 88,
    "weekFourPlays": 98,
    "fromSoundPlays": {
      "week1": 48,
      "week4": 41
    },
    "toSoundPlays": {
      "week1": 18,
      "week4": 44
    }
  },
  {
    "kind": "newShare",
    "playsCounted": 254,
    "direction": "high",
    "totalPlays": 384,
    "playsOfNewTracks": 254,
    "risingNewTrack": {
      "title": "Upright in Vell",
      "lastWeekPlays": 8
    }
  }
]
