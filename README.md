# Experience Fitness Astana — midterm HTML/CSS snapshot

Open `index.html` in a browser. The eight pages use local Bootstrap and CSS; this copy contains no JavaScript. It preserves the corrected project's dark, red-accented design. The forms are HTML/CSS planning interfaces: they do not send a booking, message, or payment. Their result areas, validation-message elements and styling are present for later JavaScript work.

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
2. **Compare a program and plan a visit.** Start at Home → **Explore programs** → compare all nine programs and the indicative price table → follow a program link to Booking → select a program, location, date, time and optional trainer → use **Review session plan** to reach the result area → call the club to arrange the real visit. End: the visitor has a proposed plan and a direct contact option. This static version does not calculate a total or reserve a place.
3. **See the facilities and ask a question.** Start at Home → Gallery through the common navigation → read the photo captions → go to Contact → complete the message-draft fields and use **Review message** → choose phone or Instagram in the result area. End: the visitor can contact the club directly. The static form does not send its contents.

## Prepared for later JavaScript

Forms, inputs, buttons, result and error containers have stable English lowercase IDs. `css/base.css` defines `hidden`, `active`, `selected`, `error` and `success` states. The gallery contains a captioned preview dialog. Later scripts can attach behavior without changing this HTML/CSS structure.

## Content notes

The prices are editable **estimates**, not official club tariffs; see `PRICE_NOTES.md`. Confirm opening hours, class availability, trainers and tariffs with the club. The photographed assets were carried over from the corrected project.

See `QUALITY_PASS.md` for the validation checklist and `AI_Log.md` for the assistance record.
