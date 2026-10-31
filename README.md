# Experience Fitness Astana — Assignments 4–6

Open `index.html` in a browser. The eight pages use Bootstrap from a CDN, the existing site CSS and page-specific JavaScript in `js/`. The forms work in the browser but do not send a booking, message or payment to a server. This is an interactive demonstration, not a real reservation system. The jQuery pages require an internet connection to load jQuery 3.7.1 from its CDN.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home and links to the main journeys |
| `about.html` | Two locations, maps, branch contacts and hours |
| `gallery.html` | Captioned club photographs and prepared preview dialog |
| `services.html` | Nine programs and indicative price table |
| `booking.html` | Session-planning form and result area |
| `trainers.html` | Five trainer profiles and illustrative program specialties |
| `contact.html` | Message-draft form and direct contact options |
| `404.html` | Helpful route back to the site |

## Three visitor journeys

1. **Find a branch.** Start at Home → choose **View locations** → compare the two address cards on About → open a map, check opening hours and use the relevant branch telephone link. End: the visitor knows where and when to visit and how to confirm details.
2. **Compare a program and plan a visit.** Start at Home → **Explore programs** → filter or sort the nine programs → add sessions to the estimate and adjust quantities → create a demo summary → continue to Booking with a selected program → choose a branch, date, exact time, participants and an optional trainer → select only programs available with that trainer → review the validated plan → call the club for a real visit. End: the visitor sees a calculated estimate and demonstration request. No reservation or payment is created.
3. **See the facilities and ask a question.** Start at Home → Gallery through the common navigation → preview the photos → go to Contact → complete the message-draft fields and use **Review message** → choose phone or Instagram in the result area. Feedback can also be previewed as a removable card. End: the visitor can contact the club directly. Nothing is sent to a server.

## Midterm freeze

The `midterm` tag remains the earlier project snapshot. Assignment 6 adds jQuery script links to About, Services and Contact; this revision adds no hand-written HTML blocks or CSS rules. New controls and states are created in JavaScript using existing classes.

## Functionality Plan

The responsibility column proposes who should review and explain each area at defense; it does not claim who authored the code. The team must confirm ownership and independently satisfy its commit-history requirement.

| Page | Visitor goal | Planned function and expected result | Proposed responsible student |
| --- | --- | --- | --- |
| Services | Find a suitable program | Category filter and sort; count, empty state and reset | Meirzhan |
| Services | Estimate several sessions | Add/increase/decrease/remove/clear; live totals and demo summary | Meirzhan |
| Booking | Choose a possible visit | Limit programs to the selected trainer, then validate name, branch, program, participant count, date, time and trainer; focus first error | Meirzhan |
| Booking | Understand the choice | Live summary and indicative total; demonstration reference on valid review | Meirzhan |
| About | Choose a branch | Select a location and carry it to the planner; open usable map links | Sanzharbek |
| Gallery | Inspect club facilities | Open photo preview, move previous/next and restore keyboard focus | Sanzharbek |
| Training | Select a trainer | Show illustrative specialties, pass a chosen profile to Booking and highlight a saved trainer | Bekzat |
| Contact | Review a question or feedback | Validate email and message, show field errors, counter and summary | Bekzat |
| Contact | Inspect feedback locally | Render dated rating cards with the same function; remove a card | Bekzat |
| Shared | Carry a choice between pages | Common program/trainer data, reusable helpers and URL-based selections | Team review |

## JavaScript checklist

| Requirement | Evidence in code |
| --- | --- |
| Six or more objects, four properties, arrays and loops | `js/main.js:4` (nine program objects); `js/services.js:57` and `js/services.js:67` (filter/sort/render) |
| Four reusable functions and nested calls | `js/main.js:24`, `js/main.js:30`, `js/main.js:33`, `js/main.js:36`; `js/services.js:125` calls `renderCart` |
| Conditions, arithmetic, strict equality and logical operators | `js/booking.js:45`; `js/services.js:91` and `js/services.js:125` |
| Meaningful random value | `js/main.js:51` (clearly labelled demonstration reference) |
| DOM creation/removal and prepared classes | `js/services.js:42`, `js/services.js:107`; `js/contact.js:67`, `js/contact.js:78`; `js/main.js:36` |
| Filter/sort/count/empty/reset | `js/services.js`; trainer links are handled by `js/main.js` and `js/trainers.js` |
| Add/quantity/remove/clear/total/demo finish | `js/services.js:91`, `js/services.js:107`, `js/services.js:125`, `js/services.js:158`, `js/services.js:163` |
| Field validation, focus and confirmation | `js/booking.js:45`, `js/booking.js:125`; `js/contact.js:53`, `js/contact.js:113` |
| `submit`, `click`, `input` and `change` events | `js/booking.js:125`; `js/services.js:141`, `js/services.js:142`, `js/services.js:148` |
| Reviews with date/time, counter and removal | `js/contact.js:32`, `js/contact.js:67`, `js/contact.js:113`, `js/contact.js:138` |
| Keyboard-accessible gallery | `js/gallery.js:25`, `js/gallery.js:33`, `js/gallery.js:37` |
| No real server action or booking | `js/booking.js:125`, `js/contact.js:113`, `js/services.js:163` |

## Verification

The existing `quality/` and `screenshots/` folders contain earlier site checks and page captures. For Assignment 6, the linked JavaScript files passed `node --check`; browser checks covered filial selection, trainer-specific program choices and booking prefill, service filtering and estimate, contact errors/success/reset and gallery navigation. All eight pages were also checked at 375, 768 and 1440 px without horizontal overflow or browser console errors. Open `index.html` directly or use IntelliJ's local preview with internet access.

## Content notes

The prices are editable **estimates**, not official club tariffs; see `PRICE_NOTES.md`. Confirm opening hours, class availability, trainers and tariffs with the club. The photographed assets were carried over from the corrected project.

The trainer-to-program assignments in `js/main.js` are illustrative project data, not confirmed club specialties. Multiple trainers can offer the same program. In Booking, choosing a trainer updates the program list; if a previously selected program is not offered by the newly chosen trainer, the program choice is cleared. Choosing “No preference” restores all nine programs. Confirm the actual trainer and program availability with the club.

See `QUALITY_PASS.md` for the earlier pass and `AI_Log.md` for the assistance record. The team must review the code and be able to explain it at defense.

## Assignment 6 jQuery revision

The official jQuery 3.7.1 CDN is loaded before the page script on About, Services and Contact. The full build is used because this revision includes effects. Each page script runs inside `$(function () { ... })`.

Three existing plain-JavaScript features were rewritten with jQuery: the About branch selection, the Services program list and estimate, and the Contact form validation and feedback preview. Their previous versions are preserved in `js/old-js-version.js`, which is deliberately not linked to a page. Comments above each rewrite explain the method replacements.

About uses delegated branch buttons and effects for the selection feedback. Services rebuilds program rows from the shared array with jQuery, handles dynamic cart buttons through delegation, and lets visitors expand or collapse the filters. Contact creates the required phone field in code, checks name, email, phone, subject, message and conditional rating, shows field-level errors, and resets the form after a valid demonstration review. No data is sent to a server.
