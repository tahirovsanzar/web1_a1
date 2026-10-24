# Experience Fitness Astana — Assignments 4–5

Open `index.html` in a browser. The eight pages use local Bootstrap, the frozen midterm CSS and page-specific JavaScript in `js/`. The forms work in the browser but do not send a booking, message or payment to a server. This is an interactive demonstration, not a real reservation system.

## Pages

| Page | Purpose |
| --- | --- |
| `index.html` | Home and links to the main journeys |
| `about.html` | Two locations, maps, branch contacts and hours |
| `gallery.html` | Captioned club photographs and prepared preview dialog |
| `services.html` | Nine programs and indicative price table |
| `booking.html` | Session-planning form and result area |
| `trainers.html` | Five trainer profiles |
| `contact.html` | Message-draft form and direct contact options |
| `404.html` | Helpful route back to the site |

## Three visitor journeys

1. **Find a branch.** Start at Home → choose **View locations** → compare the two address cards on About → open a map, check opening hours and use the relevant branch telephone link. End: the visitor knows where and when to visit and how to confirm details.
2. **Compare a program and plan a visit.** Start at Home → **Explore programs** → search/filter the nine programs → add sessions to the estimate and adjust quantities → create a demo summary → continue to Booking with a selected program → choose a branch, date, exact time, participants and optional trainer → review the validated plan → call the club for a real visit. End: the visitor sees a calculated estimate and demonstration request. No reservation or payment is created.
3. **See the facilities and ask a question.** Start at Home → Gallery through the common navigation → preview the photos → go to Contact → complete the message-draft fields and use **Review message** → choose phone or Instagram in the result area. Feedback can also be previewed as a removable card. End: the visitor can contact the club directly. Nothing is sent to a server.

## Midterm freeze

The `midterm` tag remains at the original HTML/CSS snapshot. Compared with that tag, HTML only adds deferred script links; CSS is unchanged. Forms, inputs, buttons, result/error containers and the gallery dialog existed at midterm. New controls and states are created with DOM methods and the prepared classes.

## Functionality Plan

The responsibility column proposes who should review and explain each area at defense; it does not claim who authored the code. The team must confirm ownership and independently satisfy its commit-history requirement.

| Page | Visitor goal | Planned function and expected result | Proposed responsible student |
| --- | --- | --- | --- |
| Services | Find a suitable program | Search, category filter and sort; count, empty state and reset | Meirzhan |
| Services | Estimate several sessions | Add/increase/decrease/remove/clear; live totals and demo summary | Meirzhan |
| Booking | Choose a possible visit | Validate name, branch, program, participant count, date, time and trainer; focus first error | Meirzhan |
| Booking | Understand the choice | Live summary and indicative total; demonstration reference on valid review | Meirzhan |
| About | Choose a branch | Select a location and carry it to the planner; open usable map links | Sanzharbek |
| Gallery | Inspect club facilities | Open photo preview, move previous/next and restore keyboard focus | Sanzharbek |
| Training | Find a trainer | Search five profiles with count, empty state and reset; pass choice to Booking | Bekzat |
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
| Search/filter/sort/count/empty/reset | `js/services.js:57`, `js/services.js:67`, `js/services.js:141`; `js/trainers.js:21` |
| Add/quantity/remove/clear/total/demo finish | `js/services.js:91`, `js/services.js:107`, `js/services.js:125`, `js/services.js:158`, `js/services.js:163` |
| Field validation, focus and confirmation | `js/booking.js:45`, `js/booking.js:125`; `js/contact.js:53`, `js/contact.js:113` |
| `submit`, `click`, `input` and `change` events | `js/booking.js:125`; `js/services.js:141`, `js/services.js:142`, `js/services.js:148` |
| Reviews with date/time, counter and removal | `js/contact.js:32`, `js/contact.js:67`, `js/contact.js:113`, `js/contact.js:138` |
| Keyboard-accessible gallery | `js/gallery.js:25`, `js/gallery.js:33`, `js/gallery.js:37` |
| No real server action or booking | `js/booking.js:125`, `js/contact.js:113`, `js/services.js:163` |

## Verification

`evidence/browser-checks.json` records interactive browser checks at 375, 768 and 1440 px, including empty/error/success states and cross-page journeys. `evidence/phone/` and `evidence/desktop/` contain screenshots of every page; `evidence/interactions/` shows selected dynamic states. `evidence/w3c-validation.json` records W3C HTML validation; `evidence/static-checks.json` records local links and assets. Open `index.html` directly or use IntelliJ's local preview.

## Content notes

The prices are editable **estimates**, not official club tariffs; see `PRICE_NOTES.md`. Confirm opening hours, class availability, trainers and tariffs with the club. The photographed assets were carried over from the corrected project.

See `QUALITY_PASS.md` for the midterm pass and `AI_Log.md` for the assistance record. The attached assignment prohibits AI-written JavaScript and README content; this working copy is AI-assisted and cannot honestly be represented as compliant with that authorship rule. The team should review the code and resolve the course policy before submission.
