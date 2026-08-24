# Calibration fixtures

Not shipped to users. These files exist so the speech-presence detector's
calibration (`speech.test.ts`) can be re-run by anyone, rather than resting on
a measurement one session took once and wrote down.

## speech-pd-60s.mp3

60 seconds of unaccompanied read speech — the POSITIVE class the detector is
calibrated against.

- Source: *Jacko and Jumpo Kinkytail* (Howard R. Garis), read for LibriVox
- Item: https://archive.org/details/jacko_and_jumpo_2007_librivox
- Licence: **Public Domain Mark 1.0** (`licenseurl` on the item record); LibriVox
  releases all recordings into the public domain by policy
- Excerpt: 120s–180s of track 01, mono, 44.1 kHz, re-encoded

Chosen for being ordinary: one voice, no music bed, no effects. A detector that
cannot separate *this* from a string quartet is not worth gating on.
