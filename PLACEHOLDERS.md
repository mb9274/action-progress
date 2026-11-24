# Placeholders

This file lists the visible placeholders in the website content. A placeholder is any value written in square brackets, for example `[PHONE NUMBER]`. Replace each item with real, approved information before launch.

Run `npm run check:placeholders` to see the current placeholders detected in `content/`.

> Do not publish invented facts, statistics, names, or testimonials. If information is not confirmed, leave the placeholder and keep the related item unpublished.

## Contact and organization details (`content/site.json`)

- `[EMAIL ADDRESS]` — official contact email address.
- `[PHONE NUMBER]` — main phone number.
- `[WHATSAPP NUMBER]` — WhatsApp number (or remove if not used).
- `[STREET ADDRESS]` — exact street address in Brookfields.
- `[OPENING HOURS]` — days and times the team can be reached or visited.
- `[RESPONSE TIME]` — e.g. "two working days".
- `[REGISTRATION NUMBER]` — official registration number, if registered.
- `[YEAR FOUNDED]` — year the organization was founded.
- `url: https://actionforprogress.example` — replace with the real website address before launch.
- `formEndpoint` is empty — add a Formspree (or other approved) endpoint so contact and get-involved forms can send messages.

## Donation details (`content/donate.json`)

- `[WHO RECEIVES THE MONEY]` — name of the person or account that receives donations.
- `[MOBILE MONEY PROVIDER]` — e.g. Orange Money, Afrimoney.
- `[MOBILE MONEY NUMBER]` — mobile money number.
- `[ACCOUNT NAME]` — account/recipient name (mobile money and bank).
- `[BANK NAME]` — bank name for transfers.
- `[ACCOUNT NUMBER]` — bank account number.
- `[PAYMENT LINK]` — approved online payment link, if used.

Enable a method in `content/donate.json` only after all its details are confirmed.

## Page content

- `content/pages/about.md`: `[MISSION STATEMENT - add the approved mission.]`, `[VISION STATEMENT - add the approved vision.]`, `[ORGANIZATION HISTORY - explain when and why Action for Progress started, using approved facts.]`
- `content/pages/privacy-page.md`: `[RETENTION PERIOD - state how long form messages are kept and who can access them.]`, `[EMAIL ADDRESS]`, `[LAST UPDATED DATE - add the date this note was approved.]`
- `content/work/girl-child-education.md`: `[PROBLEM STATEMENT — describe the barriers to girls' education in the community, using verified information.]`, `[PROGRAMME DESCRIPTION — list the activities Action for Progress runs to support girls' education.]`, `[VERIFIED RESULTS — add only numbers or outcomes the organization can check. Do not publish estimates.]`
- `content/work/child-and-maternal-death-rate.md`: `[PROBLEM STATEMENT — describe the local context on child and maternal deaths, using verified information.]`, `[PROGRAMME DESCRIPTION — list the activities Action for Progress runs on child and maternal health.]`, `[VERIFIED RESULTS — add only numbers or outcomes the organization can check. Do not publish estimates.]`

## Impact, stories, photos, team and partners

- `content/impact.json`: add only verified metrics and consented photos (`consentConfirmed: true`). Until then, the site shows placeholders instead of invented numbers or stock photos.
- `content/stories/_TEMPLATE.md` and `content/news/_TEMPLATE.md` contain placeholders and must remain unpublished (`published: false`) until completed with consent and verified facts.
- Team names/roles and partner/sponsor logos are shown as placeholders on the site until approved details and permissions are provided.
- Get involved page shows `[PARTNERSHIP OPPORTUNITIES]` and `[VOLUNTEER OPPORTUNITIES]` placeholders.

## Logo and brand

- Replace `public/logo.svg`, `public/favicon.svg`, `public/apple-touch-icon.png`, and `public/og-default.png` with official assets when ready.
- Update brand colours in `src/styles.css` under `:root` (`--indigo`, `--green`, `--rose`, `--yellow`) to match the final logo palette.

## Before launch checklist

- [ ] Replace placeholders with approved information
- [ ] Confirm donation method and receiving details, then enable in `content/donate.json`
- [ ] Record written consent for every published photo/story (and written guardian consent for children)
- [ ] Publish only verified, checkable numbers
- [ ] Connect and test the form endpoint (`content/site.json` → `formEndpoint`)
- [ ] Set the real site URL (`content/site.json` → `url`)
- [ ] Add official logo and final colours
- [ ] Test on a real phone and slow connection
- [ ] Run `npm run check:launch` (it must pass before launch)

> All numbers on the site must be real and checkable. Placeholder figures must never go live.
