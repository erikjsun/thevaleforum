# The VALE Forum 2026 — forum.thevale.eu

Recruitment site for **The VALE Forum 2026** — five days near Hamburg, 2–6 December,
for fifty youth leaders from across Europe.

Static site. No build step, no dependencies, no framework. Three files do the work:

```
index.html    all content
styles.css    the design system
main.js       reveals, countdown, application state machine, form embed
```

Everything else is assets (`/fonts`, `/photos`, `/team`, `/logos`) plus `og.png`.

---

## The two things you will actually want to change

Both live at the top of **`main.js`**, in the CONFIG block.

### 1. The Google Form link

```js
const FORM_URL = "https://docs.google.com/forms/d/1s31Bd04.../viewform";
```

This is built from the id in the form's *edit* URL and starts working the moment the form
is **published** and set to **"Anyone with the link"**. To use the canonical public link
instead: open the form → **Send** → the link (🔗) tab → copy → paste it here. It will look
like `https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform`.

Until the form is public, Google answers with a 401 and the embed will not render — the
page already shows an "open in a new tab" link next to it, so nothing looks broken in the
meantime.

The form is **click-to-load**: the iframe is only injected once someone presses the button.
That keeps Google's cookies off the page for everyone who never applies, which is the
polite thing to do on an Erasmus+ funded site.

### 2. The application window

```js
const OPENS_AT  = new Date("2026-08-15T00:00:00+02:00");
const CLOSES_AT = new Date("2026-08-30T23:59:59+02:00");
```

The whole Apply section rewrites itself off these two dates, so **you do not have to
redeploy on the 15th or the 30th**:

| When | Countdown | Button | Copy |
|---|---|---|---|
| Before `OPENS_AT` | counts down to opening | "Remind me when it opens" (mailto) | "Applications open on 15 August…" |
| Between the two | counts down to the deadline | "Open the application form" | "Applications are open now…" |
| After `CLOSES_AT` | hidden | "Write to us anyway" (mailto) | "Applications closed on…" |

It also flips live if the boundary passes while somebody has the page open.

---

## Deploying

Vercel, as a static site — no framework preset, no build command, output directory is the
repository root. `vercel.json` sets clean URLs, security headers and cache lifetimes
(fonts immutable for a year, images a week).

For `forum.thevale.eu`: add the domain in the Vercel project, then point a `CNAME` at
`cname.vercel-dns.com`.

## Running it locally

```bash
python3 -m http.server 8099
# → http://localhost:8099
```

Any static server works. Open it from a server rather than `file://` — the absolute asset
paths (`/styles.css`) need a document root.

---

## Design notes

The design system is inherited from [The VALE Symposium](https://symposium.thevale.eu)
so the two sites read as siblings: Roboto Condensed for display, Roboto for body, the same
reveal-on-scroll rhythm, the numbered side rail, the mountain range echoing the VALE mark.

What changed is the temperature, following the **Forum 2026 brand identity** — warmth,
energy, fire, ideas:

| | Symposium | Forum |
|---|---|---|
| Ground | `#050E12` blue night | `#120A06` ember dark |
| Accent | teal `#94DED8` | VALE orange `#FFA023` |
| Motion | snow falling | sparks rising |

**The Symposium is the cold night outside; the Forum is the fire inside.** Teal survives in
exactly two places on this site — the Saturday beat in the programme, and the line about
going into Hamburg — because that is the one day the week faces outwards. Everything else
is warm on purpose.

Fonts are self-hosted (latin + latin-ext, which covers the European alphabets our
applicants actually write in). Nothing is fetched from a third party at page load.

## Content sources

Facts came from the 2026 brochure and `thevale.eu/forum-2026`: the dates, fifty places,
the €40/€80/€120 sliding fee, travel reimbursement (€250 outside Germany, €140 within),
the participant profile, the five-day shape and the team.

The framing is deliberately not the brochure's. The brochure speaks to partners and
funders; this page speaks to VALE alumni, on the theory that the strongest reason to come
back is that you have been here before and remember what it was like.

## Accessibility

Skip link, landmarks and heading order, `aria-current` on the rail, focus-visible rings,
labelled dialogs closable by Escape / backdrop / button, alt text on every image, and a
full `prefers-reduced-motion` path that stops the embers, the ticker and every transition.
