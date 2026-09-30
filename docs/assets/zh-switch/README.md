# The language switch, checked on seven pages (bilingual Part 2, done-when)

Run on 2026-09-29 against the local dev server, in the in-app browser, at phone width
(375 × 812) and desktop width (1280 × 800). On each of `/`, `/reading`, `/company`,
`/spread`, `/learn/why`, `/method` and `/lab`, the header button was clicked to go to the
Chinese page, and then the Chinese page's button was clicked to go back. Both clicks landed
on the page's counterpart, at both widths, and the stored choice read `en` after the return.
The screenshots are the Chinese side of each pair. The red strip at the bottom is the dev
server's "analytics dark" banner, which production does not show.

| Page | Phone | Desktop |
|---|---|---|
| `/zh` | [phone-zh-home.jpg](phone-zh-home.jpg) | [desktop-zh-home.jpg](desktop-zh-home.jpg) |
| `/zh/reading` | [phone-zh-reading.jpg](phone-zh-reading.jpg) | [desktop-zh-reading.jpg](desktop-zh-reading.jpg) |
| `/zh/company` | [phone-zh-company.jpg](phone-zh-company.jpg) | [desktop-zh-company.jpg](desktop-zh-company.jpg) |
| `/zh/spread` | [phone-zh-spread.jpg](phone-zh-spread.jpg) | [desktop-zh-spread.jpg](desktop-zh-spread.jpg) |
| `/zh/learn/why` | [phone-zh-learn-why.jpg](phone-zh-learn-why.jpg) | [desktop-zh-learn-why.jpg](desktop-zh-learn-why.jpg) |
| `/zh/method` | [phone-zh-method.jpg](phone-zh-method.jpg) | [desktop-zh-method.jpg](desktop-zh-method.jpg) |
| `/zh/lab` | [phone-zh-lab.jpg](phone-zh-lab.jpg) | [desktop-zh-lab.jpg](desktop-zh-lab.jpg) |

The reading was also taken through to its creation screen in Chinese during slice 2. That
check is recorded in commit `1c07581`.
