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
const FORM_URL   = "https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform";
const FORM_SHORT = "https://forms.gle/nGhcSqWJtoXxDkTbA";
```

Two spellings of the same published form, because they do different jobs. **`FORM_URL`**
is the canonical link and is what the embed uses — the iframe needs `?embedded=true`
appended, and `forms.gle` silently drops query parameters when it redirects, so the short
link cannot carry it. **`FORM_SHORT`** is the shareable one: the "open in a new tab" link,
and whatever you paste into Slack or an email.

To re-derive either: open the form → **Send** → the link (🔗) tab. The box gives the
canonical link; ticking **Shorten URL** gives the `forms.gle` one.

**The form must be reachable without a Google sign-in.** If Google answers `401` — *"You
must sign in to access this content"* — the embed renders a sign-in box rather than the
form, and Google refuses to render its own sign-in flow inside a third-party iframe, so
the embed becomes a dead end rather than a degraded experience. Two settings cause it:

- Settings → Responses → **Restrict to users in *org* and its trusted organisations**
- Settings → Responses → **Collect email addresses: Verified** (set it to *Responder
  input* instead, which asks for the address without demanding an account)

Check it from outside the org before applications open:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "$FORM_URL"   # want 200, not 401
```

If sign-in has to stay on for some reason, drop the embed and send people straight to
`FORM_SHORT` in a new tab — see `loadForm()` in `main.js`.

The form is **click-to-load**: the iframe is only injected once someone presses the button.
That keeps Google's cookies off the page for everyone who never applies, which is the
polite thing to do on an Erasmus+ funded site.

### 2. The application window

```js
const OPENS_AT  = new Date("2026-08-17T09:00:00+02:00");
const CLOSES_AT = new Date("2026-08-30T23:59:59+02:00");
```

The whole Apply section rewrites itself off these two dates, so **you do not have to
redeploy on the 17th or the 30th**:

| When | Countdown | Button | Copy |
|---|---|---|---|
| Before `OPENS_AT` | counts down to opening | "Remind me when it opens" (mailto) | "Applications open on 17 August…" |
| Between the two | counts down to the deadline | "Open the application form" | "Applications are open now…" |
| After `CLOSES_AT` | hidden | "Write to us anyway" (mailto) | "Applications closed on…" |

It also flips live if the boundary passes while somebody has the page open.

The section leads with a **status pill** (`#apply-status`) above the countdown, and the
countdown label reads *"until applications close"* rather than *"left to apply"*. Both came
out of a reader saying the page looked like it meant *come back in nine days*: `COME BACK`
set over a running clock reads as a countdown **to** opening, and the one line that said
otherwise was the smallest type on the screen. Keep the pill, and keep any wording here
explicit about opening versus closing.

---

## Replacing a photo

**Change the filename when you change the picture.** Images are served with a
`Cache-Control` max-age, so a new file at an old URL keeps showing the old picture to
anyone who has already loaded the page — the browser has no reason to ask again.

This bit us on George: the photo was replaced in `98dd6ed`, the filename stayed
`/team/george.jpg`, and the team kept seeing the previous shot. The fix was renaming it to
`/team/george-2.jpg`, which is a URL no cache has ever seen. A `?v=2` query string works
too, but a rename is proof against CDNs that key on path alone.

The image max-age is **one hour** (`vercel.json`). It was a week, which is sensible for a
finished site and actively unhelpful while the page is being edited daily. Put it back up
once the content settles.

## Deploying

Vercel, as a static site — no framework preset, no build command, output directory is the
repository root. `vercel.json` sets clean URLs, security headers and cache lifetimes
(fonts immutable for a year, images a week).

For `forum.thevale.eu`: add the domain in the Vercel project, then point a `CNAME` at
`cname.vercel-dns.com`.

**The production branch is `claude/vale-forum-recruitment-page-p1wbzy`, not `main`.**
Pushing to `main` builds successfully and tells you nothing is wrong — the deployment just
comes back with `target: null` and the live site never changes. Only that branch has
`target: "production"`. Push to both, or move the production branch to `main` in Project
Settings → Git and delete this paragraph.

Do not trust a green build as proof the site updated. Check the thing itself:

```sh
curl -s -o /dev/null -w "%{http_code}\n" "https://forum.thevale.eu/photos/<a-file-you-just-added>.jpg"
```

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

The brochure was briefly pulled in August 2026 while it was out of step with the page,
and restored once Marky sent a corrected version.

It arrives from Canva at around 14 MB, which is far too heavy to hand to an applicant.
Shrink it before committing, and do not rasterise — page 7 carries a live link to
forum.thevale.eu and the text layer is worth keeping. What works, in order:

1. Downsample each image to roughly 120 DPI **of the size it is actually placed at**, not
   of its own pixel dimensions. `Document.rewrite_images()` recompresses but does not
   resize, so do it by hand via `Page.replace_image()`.
2. Convert to JPEG anything with no soft mask. Most of the "PNGs" are opaque RGB and drop
   by 80% or more.
3. For the two banner images that *do* carry a soft mask, rebuild the alpha into an RGBA
   PNG and quantise to ~192 colours. This is the single biggest win: without it the file
   stalls near 3.9 MB, with it it lands at 1.7 MB.

That path took 14.5 MB to 1.7 MB with a per-page RMS difference under 3/255 — no visible
change. Check the page count before you start: the upload harness has misreported it.

Voice is first-person from the organising team. The brochure speaks to partners and
funders; this page speaks to VALE alumni.

### Photographs

Files in `/photos` are named for the cohort they come from (`2021-course-1.jpg`), so a
photo can always be traced back to its source. Two `notes-*.jpg` files survive from the
first batch: `notes-03` on the Leadership Lab beat, and `notes-02` on the Saturday beat.

**`notes-02` is a Symposium photograph and that is deliberate.** The Saturday beat is
styled `beat-cool` because it is the one day the week faces outwards, and the photo has to
read as a different kind of event — a stage, a screen, an audience — or the teal loses its
meaning. The course photographs are warm, rustic and close; do not swap one in here.

The tell, if you are sorting a new batch: Symposium means name badges, blue printed
materials, a corporate atrium or the red-curtain venue. Course means green VALE
sweatshirts, rustic rooms, flipcharts and no badges.

Two things to check on any new batch before it goes in:

- **EXIF orientation.** Three photos in the August 2026 batch carried rotation tags
  (`Orientation` 3, 6 and 8). Browsers honour them, most command-line tools do not, and
  two of the three turned out to be portrait once corrected. Apply the rotation into the
  pixels and strip the tag, or the image rotates twice.
- **Duplicates.** Hash the batch against itself *and* against `/photos`, `/venue`,
  `/team`. `venue/01-estate.jpg` once ran twice — the panoramic break in `#why` and the
  first carousel slide.

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

## Where the page departs from the grant application

The application (`KA153-YOU-7C226954`) was written before some things settled. Where it
disagrees with reality, **the page follows reality** — confirmed by Erik:

- **Location.** The application says Berlin. It is Hamburg: Gut Schöneworth, near Stade.
  Ignore the application on this.
- **Who leads.** The project is **led by The VALE**. Youth For Understanding Norway is
  the applicant organisation (it holds the grant), with YFU partner organisations across
  Europe. The funding band names both, since the applicant partner deserves the credit
  and The VALE deserves the lead.

**Still open:** the application says *"50 youth workers from 13 YFU partner
organisations"*, while the brochure is broader — youth workers, NGO and civil society
leaders, 20–45, Europe-based. The page uses the broader framing. If places are in fact
allocated through partner organisations, the eligibility copy in `#people` and the
`d-match` dialog both need rewriting before applications open.

## A note on spirit groups

Spirit groups are the single most praised thing in six years of course evaluations, so
the page sells the small group hard — but carefully. The Forum will have *something in
that spirit*, not spirit groups as run on a course, and the copy says exactly that
rather than promising a format that isn't designed yet. When the shape firms up, the
beat in `#format` is the place to update.

## Positioning: not another course

Almost everyone applying has already done a VALE course and found it transformative.
The Forum builds on that and goes past it — you were the participant, now you run the
room. Two rules came out of getting this wrong twice:

1. **Don't sell it as Course #7.** An early draft counted courses in the stats row and
   framed the whole thing as a return to the same experience.
2. **Don't define it by negation either.** The fix for (1) was worse: a scroll beat
   reading *"A course would put someone at the front to fix that"*, and the real pitch
   hidden behind a "Why this isn't another course" dialog. Defensive, and buried.

What's there now is affirmative and in the main flow — the `.manifesto` block in
`#why`, ending on *Same people. Same care. Much bigger room.* If this needs revisiting,
edit it in place; don't push it back into a dialog.

## Accessibility

Skip link, landmarks and heading order, `aria-current` on the rail, focus-visible rings,
labelled dialogs closable by Escape / backdrop / button, alt text on every image, and a
full `prefers-reduced-motion` path that stops the embers, the ticker and every transition.
