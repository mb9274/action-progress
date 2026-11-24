# Content guide

All the text on the website lives in the `content/` folder. You do not need to
edit HTML or CSS to update the site.

- `site.json` — organization name, contact details, Facebook link, address.
- `donate.json` — donation methods. This is the only place to edit giving details.
- `home.json` — hero and home-page copy.
- `impact.json` — verified impact numbers and photo gallery.
- `pages/*.md` — About, Our work, Impact, News, Get involved, Contact and Privacy pages.
- `work/*.md` — the two focus-area pages.
- `stories/*.md` — beneficiary stories. Leave `published: false` until consent is confirmed.
- `news/*.md` — news and activity updates.

## Placeholders

Anything written like `[PHONE NUMBER]` is a visible placeholder. Replace it
with the real information, or keep it out of the live site until it is ready.
Run `npm run check:placeholders` to see every placeholder still in the site.

## Child safety

Do not add a child's full name, exact location, school, or any detail that
could identify them. A story can only be published if `consentConfirmed: true`.
If a child appears in the story or photo, `guardianConsent: true` is also
required. The build stops if these rules are broken.

See the main README for full editing instructions.
