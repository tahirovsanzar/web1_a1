# Quality pass

Automated and visual review performed on 15 October 2026 against the supplied midterm brief. This is an AI-assisted technical review; it does not stand in for the required teammate/device review two days before the deadline.

## Findings and fixes

| Finding | Fix |
| --- | --- |
| Booking and Contact linked nonexistent `meyirzhan.css` / `bekzhat.css` | Corrected to the existing `meirzhan.css` / `bekzat.css` |
| Mobile navigation depended on missing Bootstrap JavaScript | Replaced with a native keyboard-operable details/summary menu; identical links on every page |
| Brand, active navigation and footers differed | Applied the same header/footer and current-page indication everywhere |
| Colophon contained an unrelated birthday invitation and JavaScript | Removed the Colophon page and its navigation entry at the owner's request; price sources are now on Services |
| Gallery contained extra `<img/>` tags and an empty preview source | Removed malformed elements; added valid existing images and prepared dialog controls |
| Reception/cardio/shower photos had unrelated gym/yoga/spa captions | Visually inspected originals and corrected captions |
| Booking had only three generic services, no exact time, no trainer selection | Added nine named program choices, exact 30-minute start time, five trainers and optional session goal |
| Form inputs lacked names, required constraints and error hooks | Added labels, names, constraints, individual error messages and shared error/success states |
| Confirmation areas were hidden and empty with no clear next step | Added visible neutral result areas, prepared summaries/success messages and direct club contact links |
| README described six trainers and nonexistent dynamic interactions | Corrected to five profiles and documented the real static-stage journeys |
| No price comparison or source notes | Added visibly labelled editable estimates at the owner's request, with comparison sources |
| Default manifest metadata was empty | Added project name, relative start URL and matching dark theme |
| No consistent recovery page | Restyled 404 with site navigation and a return-home link |
| Bootstrap depended on an external CDN | Included Bootstrap 5.3.2 CSS locally with its licence notice |

## Completed checks

- W3C Nu HTML validator version 26.10.12: all eight HTML pages have **zero errors and zero warnings**. Full responses are in `quality/w3c-validation.json`.
- All local href, src and form action targets exist, including fragment IDs. Headers expose the same seven navigation links; footers match. See `quality/static-checks.json`.
- Chromium browser: all eight pages at 1440 x 1000 and 390 x 844; also checked 320 px width. No page/console errors, failed local requests, broken images, duplicate IDs, missing field labels or horizontal page overflow. No site scripts are present. See `quality/browser-checks.json`.
- Saved 16 full-page screenshots in `screenshots/desktop/` and `screenshots/phone/`; inspected the About page at desktop and phone widths.
- Mobile menu closes and reopens with a keyboard without JavaScript.
- All nine booking program values and five trainer values verified. Empty required fields, an invalid email, out-of-range time and a 15-minute off-step start are rejected by native HTML validation. Valid forms navigate to their visible result areas.
- Three documented visitor journeys checked through local navigation and form submission. No actual reservation, message, payment or external call was made.
- 2GIS and the three comparison price sources returned HTTP 200. Instagram connections timed out/reset; profile availability remains unverified. See `quality/external-checks.json`.

## Remaining owner and team checks

- Replace indicative prices with confirmed Experience Fitness tariffs for the brief's real-content criterion. Estimates are not official club prices.
- Confirm current opening hours, telephone, both branches and trainer availability. The original site content was retained; public listings are inconsistent.
- Confirm that all existing photographs are owned by the team and permitted for use. No new photographs were added.
- This is the no-JavaScript stage. Service links scroll to the selector but do not preselect values. Forms do not generate summaries or send messages. Date-dependent hours, future dates, session duration, availability and conditional fields need later JavaScript; all relevant markup and states are prepared.
- Carry out the required genuine human cross-review and check its timing against the deadline. Do not describe this automated review as a teammate review.
- The local `midterm` tag already points to `e9c4c0112c3fc915b27c1c584e53df6968746b31`, the previous frozen version. It was preserved; these repairs remain reviewable working-tree edits. Final commit/tag decisions belong to the team after content verification. No remote push or tag rewrite was performed.
- Existing history shows one contributor identity across multiple days. The requirement for every member's own commits across at least four days must be satisfied by the members themselves; no history was fabricated.
- AI_Log.md explicitly discloses direct AI coding. The brief restricts AI to explanations, so these repairs cannot be represented as compliant with that policy. Resolve this with the instructor or independently redo the implementation as required.


## Owner correction on 15 October 2026

The only bookable services are Full Body, Fight, Yoga, Healthy Posture, Strip Plastic, Workout School, Stretching, Strength and Flexibility, and Functional Training. Removed all additional service choices and all prices from booking option labels. The Services price table now covers these nine programs only. Exact time and the five-trainer selector are preserved.


## Page consolidation

Owner subsequently restored About as a detailed standalone page. Home now contains a short introduction. About carries the branch, schedule and first-visit information, and Booking links to its schedule. Colophon remains deleted. Navigation and screenshots were refreshed.
