1. AI Prompt / Question:
   "Why is (document).ready() required when loading jQuery from a CDN, and what is its conceptual role compared to vanilla JavaScript?"
   Purpose & Outcome:
   I needed to understand the timing of DOM readiness to ensure our scripts execute safely after jQuery loads. The AI explained the concept of DOM tree parsing versus full window asset loading. I manually linked the jQuery CDN, placed our custom script below it, and wrapped our code in $(document).ready() with the required version comment.

2. AI Prompt / Question:
   "How does DOM traversal with .closest(), .find(), and .siblings() work relative to (this), and why is it better than adding IDs to every element?"
   Purpose & Outcome:
   I needed to manipulate dynamic card elements without violating the midterm freeze by adding unnecessary IDs to the HTML. The AI explained hierarchical DOM traversal. I used this concept to manually write handlers where clicking an action button targets its parent card and modifies sibling elements using $(this).

3. AI Prompt / Question:
   "What is the conceptual difference between .text() and .html(), and between .attr() and .prop() when checking a checkbox in jQuery?"
   Purpose & Outcome:
   I needed to prepare for oral defense questions and prevent security risks in our application. The AI clarified that .text() escapes characters to prevent XSS while .html() parses tags, and that .prop('checked') tracks live runtime state rather than initial HTML markup attributes. I applied this by strictly using .text() for error messages and .prop('checked') for form checkbox validation.

4. AI Prompt / Question:
   "Why doesn't a direct click listener work on elements created dynamically with .append(), and how does event delegation resolve this?"
   Purpose & Outcome:
   Our cards are generated dynamically from an array in code, and direct listeners failed to respond to new elements. The AI explained event bubbling and how delegating to an existing ancestor catches events from future children. I manually wrote the delegated handler on our static container and documented the explanation in our code.

5. AI Prompt / Question:
   "Why does client-side form validation with event.preventDefault() and regex never replace server-side validation?"
   Purpose & Outcome:
   I needed to understand the security justification required in our form validation comments. The AI explained that client-side validation improves user experience but can easily be bypassed or modified by an attacker. I manually wrote the field-by-field validation, inline error toggles, and added the mandatory client-versus-server security comment in our script.
