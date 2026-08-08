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

Every concrete claim on the page traces to one of four places. Nothing is invented — if
you cannot source it, cut it rather than write around it.

| Source | What came from it |
|---|---|
| 2026 brochure + `thevale.eu/forum-2026` | Dates, fifty places, €40/€80/€120 sliding fee, travel reimbursement (€250 / €140), participant profile, five-day shape, the team |
| `erikjsun/thevalenorthstar` | Alumni quotes (verbatim from `data/evaluations/raw/*.csv` and `config/stats.ts`), and the real course formats: spirit groups, morning walks, the praise circle |
| `gut-schoeneworth.de` | Venue: the Apfelscheune's 120 m² and 4.3 m ceilings, the thatch, chef Matthias Pape, Gault&Millau 2005, Gründerstar 2023, Galloway beef, estate-pressed apple juice, WiFi, "sleep with the window open" |
| The team | The "Can you imagine" list, which is explicitly framed as *possible*, not scheduled — the programme genuinely does not exist until participants write it |

Voice is first-person from the organising team. The brochure speaks to partners and
funders; this page speaks to VALE alumni.

**Two standing rules**, learned the hard way on the first draft:

1. **No invented texture.** An early version had a lake, a 2am conversation and a
   three-hour goodbye. None existed. Specifics that sound intimate but are generated are
   exactly what makes a page read as machine-written — and alumni spot them instantly.
2. **No invented attributions.** Quotes carry the real cohort year and a generic
   attribution (`A participant · 2025 course`). Never attach a name that isn't in the
   source data.

Unverified numbers were pulled rather than published: the stats row now uses only figures
that can be counted from the repo (six courses since 2018, fifty places, five days, one
public day).

## Funding attribution

The page carries a dedicated funding band above the footer, using the official
**"Co-funded by the European Union"** emblem (`/logos/eu-cofunded.png`, from the
Commission's logo download centre).

That is the current 2021–2027 Erasmus+ emblem. The site previously carried
*"Co-funded by the Erasmus+ Programme of the European Union"*, which is the retired
2014–2020 lockup — it has been removed. The disclaimer wording is the standard EACEA
text. The emblem sits on a white card because it must keep its own background to stay
legible and compliant; it cannot be tinted into the page.

## Open questions for the team

Three things in the grant application (`KA153-YOU-7C226954`) don't match the
participant-facing material. The page follows the participant-facing material in each
case, because that is what Erik confirmed — but they are worth a decision:

1. **Berlin vs Hamburg.** The application says the Forum runs in Berlin. The brochure,
   `thevale.eu/forum-2026` and the booked venue all say near Hamburg. The page says
   Gut Schöneworth.
2. **Who can apply.** The application says *"50 youth workers from 13 YFU partner
   organisations"*. The brochure is broader: youth workers, NGO and civil society
   leaders, 20–45, Europe-based. The page uses the broader framing. If places are in
   fact allocated through partner organisations, the eligibility copy and the
   `d-match` dialog need rewriting.
3. **Who leads the project.** The applicant organisation is Youth For Understanding
   (NO); The VALE is one of thirteen partner organisations. An earlier draft of the
   footer claimed the project was *"led by The VALE"*, which was wrong and has been
   removed. The funding band now says "delivered together with Youth For Understanding
   organisations across Europe" — adjust if The VALE's role should be stated more
   precisely.

## Accessibility

Skip link, landmarks and heading order, `aria-current` on the rail, focus-visible rings,
labelled dialogs closable by Escape / backdrop / button, alt text on every image, and a
full `prefers-reduced-motion` path that stops the embers, the ticker and every transition.
