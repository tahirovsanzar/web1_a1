// Assignment 6 comparison copy. This file is deliberately not linked to a page.

// Original plain JavaScript from js/about.js
(() => {
'use strict';
const { element, readDraft, saveDraft } = window.Experience;
const locations = [
  { id: 'imanbayeva', label: 'Sholpan Imanbayeva Street 8/2' },
  { id: 'asfendiyarov', label: 'Sanjar Asfendiyarov Street 6' }
];
const section = document.getElementById('locations');
const cards = [...section.querySelectorAll('article')];
const mapSearches = {
  imanbayeva: 'Experience Fitness, Sholpan Imanbayeva Street 8/2, Astana',
  asfendiyarov: 'Experience Fitness, Sanjar Asfendiyarov Street 6, Astana'
};
locations.forEach((location) => {
  const link = document.getElementById(`map-${location.id}`);
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearches[location.id])}`;
});
const status = element('p', 'mt-3', 'Choose a branch to carry it into the visit planner.');
status.id = 'branch-selection-status'; status.setAttribute('role', 'status');
const next = element('a', 'btn btn-danger mt-2 hidden', 'Continue with selected branch');
next.href = 'booking.html#booking-location'; next.id = 'branch-selection-next';
section.append(status, next);
function chooseBranch(id) {
  const choice = locations.find((location) => location.id === id);
  if (!choice) return null;
  cards.forEach((card, index) => card.classList.toggle('selected', locations[index].id === id));
  saveDraft({ ...readDraft(), location: id });
  status.textContent = `${choice.label} selected for your visit plan. Confirm hours and availability with the branch.`;
  next.href = `booking.html?location=${encodeURIComponent(id)}#booking-location`;
  next.classList.remove('hidden');
  return choice;
}
locations.forEach((location, index) => {
  const button = element('button', 'btn btn-outline-danger ms-2 mt-2', `Choose ${location.label.split(' Street')[0]}`);
  button.type = 'button'; button.dataset.location = location.id;
  cards[index].append(button);
  button.addEventListener('click', () => chooseBranch(location.id));
});
if (locations.some((location) => location.id === readDraft().location)) chooseBranch(readDraft().location);
})();


// Original plain JavaScript from js/services.js
(() => {
'use strict';
const { programs, element, money, referenceNumber, readDraft, saveDraft } = window.Experience;
const priceSection = document.getElementById('price-list');
const tableBody = priceSection.querySelector('tbody');
const results = document.getElementById('services-results');
const cart = new Map();
let currentReference = '';

const controls = element('div', 'bg-black border border-danger rounded p-3 mb-3');
controls.id = 'program-controls';
const controlRow = element('div', 'row g-3');
function controlColumn(labelText, control) {
  const column = element('div', 'col-12 col-md-6');
  const label = element('label', 'form-label', labelText);
  label.htmlFor = control.id;
  column.append(label, control);
  return column;
}
const category = element('select', 'form-select'); category.id = 'program-category';
const allOption = element('option', '', 'All categories'); allOption.value = ''; category.append(allOption);
[...new Set(programs.map((program) => program.category))].sort().forEach((name) => {
  const option = element('option', '', name); option.value = name; category.append(option);
});
const sort = element('select', 'form-select'); sort.id = 'program-sort';
[['default', 'Original order'], ['name', 'Name A–Z'], ['category', 'Category A–Z']].forEach(([value, label]) => {
  const option = element('option', '', label); option.value = value; sort.append(option);
});
controlRow.append(controlColumn('Category', category), controlColumn('Sort by', sort));
const count = element('p', 'mb-2 mt-3'); count.id = 'program-count'; count.setAttribute('role', 'status');
const resetFilters = element('button', 'btn btn-outline-danger btn-sm', 'Reset filters');
resetFilters.id = 'program-reset'; resetFilters.type = 'button';
controls.append(controlRow, count, resetFilters);
priceSection.querySelector('.table-responsive').before(controls);

const empty = element('p', 'text-danger mt-3 hidden', 'No programs match these filters. Reset filters to see all nine.');
empty.id = 'program-empty'; empty.setAttribute('role', 'status');
priceSection.querySelector('.table-responsive').after(empty);

function renderProgramRow(program) {
  const row = element('tr');
  const name = element('th', '', program.name); name.scope = 'row';
  const duration = element('td', '', program.duration);
  const cost = element('td', '', money(program.price));
  const actionCell = element('td');
  const button = element('button', 'btn btn-outline-danger btn-sm me-2 mb-1', 'Add to estimate');
  button.type = 'button'; button.dataset.addProgram = program.id;
  button.setAttribute('aria-label', `Add ${program.name} to estimate`);
  const plan = element('a', 'btn btn-danger btn-sm mb-1', 'Plan visit');
  plan.href = `booking.html?service=${encodeURIComponent(program.id)}#booking-service`; plan.dataset.service = program.id;
  plan.setAttribute('aria-label', `Plan a ${program.name} visit`);
  actionCell.append(button, plan); row.append(name, duration, cost, actionCell);
  return row;
}
function matchingPrograms(chosenCategory, order) {
  const matches = programs.filter((program) => chosenCategory === '' || program.category === chosenCategory);
  if (order === 'name') matches.sort((a, b) => a.name.localeCompare(b.name));
  if (order === 'category') matches.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
  return matches;
}
function renderCatalogue() {
  const matches = matchingPrograms(category.value, sort.value);
  tableBody.replaceChildren(...matches.map(renderProgramRow));
  count.textContent = `${matches.length} of ${programs.length} programs shown.`;
  empty.classList.toggle('hidden', matches.length !== 0);
  return matches.length;
}

const cartPanel = element('section', 'bg-black border border-danger rounded p-4 mt-4');
cartPanel.id = 'service-plan';
const cartTitle = element('h3', 'h4 text-danger', 'Session estimate');
const cartNote = element('p', 'small', 'Indicative prices only. This is a demonstration estimate, not a purchase or reservation.');
const cartLines = element('div'); cartLines.id = 'cart-lines'; cartLines.setAttribute('aria-live', 'polite');
const cartTotal = element('p', 'fw-bold mt-3'); cartTotal.id = 'cart-total'; cartTotal.setAttribute('role', 'status');
const clearButton = element('button', 'btn btn-outline-danger', 'Clear plan'); clearButton.type = 'button'; clearButton.id = 'cart-clear';
const finishButton = element('button', 'btn btn-danger', 'Create demo summary'); finishButton.type = 'button'; finishButton.id = 'cart-finish';
const actions = element('div', 'd-flex flex-wrap gap-2'); actions.append(clearButton, finishButton);
const cartFeedback = element('p', 'mt-3'); cartFeedback.id = 'cart-feedback'; cartFeedback.setAttribute('role', 'status');
const confirmation = element('p', 'success hidden'); confirmation.id = 'cart-confirmation'; confirmation.setAttribute('role', 'status');
const nextLink = element('a', 'btn btn-outline-danger hidden', 'Plan the first selected program');
nextLink.id = 'cart-next'; nextLink.href = 'booking.html#booking-service';
cartPanel.append(cartTitle, cartNote, cartLines, cartTotal, actions, cartFeedback, confirmation, nextLink);
results.append(cartPanel);

function calculateCart(items) {
  return items.reduce((totals, [id, quantity]) => {
    const program = programs.find((item) => item.id === id);
    if (program) {
      totals.quantity += quantity;
      totals.price += program.price * quantity;
    }
    return totals;
  }, { quantity: 0, price: 0 });
}
function cartButton(text, action, id) {
  const button = element('button', 'btn btn-outline-danger btn-sm', text);
  button.type = 'button'; button.dataset.cartAction = action; button.dataset.program = id;
  button.setAttribute('aria-label', `${text} ${programs.find((item) => item.id === id).name}`);
  return button;
}
function renderCart() {
  const lines = [...cart.entries()];
  cartLines.replaceChildren();
  if (lines.length === 0) cartLines.append(element('p', 'text-danger', 'Your plan is empty. Add a program from the table.'));
  lines.forEach(([id, quantity]) => {
    const program = programs.find((item) => item.id === id);
    const line = element('div', 'd-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom border-secondary py-2');
    const description = element('span', '', `${program.name} × ${quantity} — ${money(program.price * quantity)}`);
    const buttons = element('div', 'd-flex flex-wrap gap-1');
    buttons.append(cartButton('−', 'decrease', id), cartButton('+', 'increase', id), cartButton('Remove', 'remove', id));
    line.append(description, buttons); cartLines.append(line);
  });
  const totals = calculateCart(lines);
  cartTotal.textContent = `${totals.quantity} session${totals.quantity === 1 ? '' : 's'} · estimated total ${money(totals.price)}`;
  clearButton.disabled = totals.quantity === 0;
  finishButton.disabled = totals.quantity === 0;
  return totals;
}
function changeCart(id, action) {
  if (!programs.some((program) => program.id === id)) return false;
  const quantity = cart.get(id) || 0;
  if (action === 'increase' || action === 'add') cart.set(id, Math.min(quantity + 1, 20));
  if (action === 'decrease') {
    if (quantity <= 1) cart.delete(id); else cart.set(id, quantity - 1);
  }
  if (action === 'remove') cart.delete(id);
  currentReference = '';
  confirmation.classList.add('hidden'); nextLink.classList.add('hidden');
  cartFeedback.textContent = quantity === 20 && (action === 'increase' || action === 'add')
    ? 'The estimate is limited to 20 sessions per program.'
    : action === 'remove' ? 'Program removed from the estimate.' : 'Estimate updated.';
  renderCart();
  return true;
}
category.addEventListener('change', renderCatalogue);
sort.addEventListener('change', renderCatalogue);
resetFilters.addEventListener('click', () => {
  category.value = ''; sort.value = 'default';
  renderCatalogue(); category.focus();
});
tableBody.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-add-program]');
  if (button) changeCart(button.dataset.addProgram, 'add');
  const link = event.target.closest('a[data-service]');
  if (link) saveDraft({ ...readDraft(), service: link.dataset.service });
});
cartLines.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-cart-action]');
  if (button) changeCart(button.dataset.program, button.dataset.cartAction);
});
clearButton.addEventListener('click', () => {
  cart.clear(); currentReference = '';
  confirmation.classList.add('hidden'); nextLink.classList.add('hidden');
  cartFeedback.textContent = 'Estimate cleared.'; renderCart();
});
finishButton.addEventListener('click', () => {
  const totals = calculateCart([...cart.entries()]);
  if (totals.quantity === 0) return;
  if (currentReference === '') currentReference = referenceNumber();
  const firstProgram = cart.keys().next().value;
  saveDraft({ ...readDraft(), service: firstProgram });
  nextLink.href = `booking.html?service=${encodeURIComponent(firstProgram)}#booking-service`;
  confirmation.textContent = `${currentReference}: demo estimate for ${totals.quantity} session${totals.quantity === 1 ? '' : 's'}, ${money(totals.price)}. Nothing was ordered, booked or paid for.`;
  confirmation.classList.remove('hidden'); nextLink.classList.remove('hidden');
  cartFeedback.textContent = 'Choose the link below to plan the first selected program.';
});
renderCatalogue();
renderCart();

})();


// Original plain JavaScript from js/contact.js
(() => {
'use strict';
const { element, setFieldState } = window.Experience;
const form = document.getElementById('contact-form');
form.noValidate = true;
const fields = {
  name: document.getElementById('contact-name'),
  email: document.getElementById('contact-email'),
  subject: document.getElementById('contact-subject'),
  visits: document.getElementById('contact-visits'),
  message: document.getElementById('contact-message')
};
const visitWrapper = document.getElementById('feedback-visits-container');
const status = document.getElementById('contact-status');
const errors = document.getElementById('contact-errors');
const summary = document.getElementById('contact-summary');
const success = document.getElementById('contact-success');
const reviews = [];
let lastFeedbackSignature = '';
const ratingWrapper = element('div', 'mb-3 hidden');
const ratingLabel = element('label', 'form-label', 'Visit rating (1–5)');
const rating = element('select', 'form-select'); rating.id = 'contact-rating'; rating.name = 'rating';
ratingLabel.htmlFor = rating.id;
const emptyOption = element('option', '', 'Choose a rating...'); emptyOption.value = ''; rating.append(emptyOption);
for (let score = 1; score <= 5; score += 1) {
  const option = element('option', '', `${score} of 5`); option.value = String(score); rating.append(option);
}
const ratingError = element('p', 'error hidden small mt-1', 'Choose a 1–5 rating for feedback.');
ratingError.id = 'contact-rating-error'; rating.setAttribute('aria-describedby', ratingError.id);
ratingWrapper.append(ratingLabel, rating, ratingError);
visitWrapper.after(ratingWrapper);
const counter = element('p', 'form-text text-light', '0 / 2,000 characters');
counter.id = 'contact-character-count'; counter.setAttribute('role', 'status');
fields.message.after(counter);
const reviewSection = element('section', 'mt-5'); reviewSection.id = 'feedback-previews';
reviewSection.append(element('h2', 'h4 text-danger', 'Feedback previews'));
reviewSection.append(element('p', '', 'These examples stay on this page only. They are not published or sent to the club.'));
const reviewList = element('div', 'row g-3'); reviewList.id = 'feedback-list';
reviewSection.append(reviewList);
form.after(reviewSection);

function showSubjectFields() {
  const feedback = fields.subject.value === 'feedback';
  visitWrapper.classList.toggle('hidden', !feedback);
  ratingWrapper.classList.toggle('hidden', !feedback);
  if (!feedback) {
    fields.visits.value = '';
    rating.value = '';
    ratingError.classList.add('hidden');
    rating.classList.remove('error', 'success');
  }
}
function checkField(key) {
  const value = key === 'rating' ? rating.value : fields[key].value.trim();
  if (key === 'name') return value.length >= 2 ? '' : 'Enter your name with at least 2 characters.';
  if (key === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.';
  if (key === 'subject') return ['membership', 'feedback', 'other'].includes(value) ? '' : 'Choose a subject.';
  if (key === 'visits') return value === '' || ['0', '1', '2-5', '6+'].includes(value) ? '' : 'Choose a listed visit count.';
  if (key === 'rating') return fields.subject.value !== 'feedback' || /^[1-5]$/.test(value) ? '' : 'Choose a rating for feedback.';
  if (key === 'message') return value.length >= 10 && value.length <= 2000 ? '' : 'Write a message between 10 and 2,000 characters.';
  return '';
}
function markField(key) {
  const field = key === 'rating' ? rating : fields[key];
  return setFieldState(field, document.getElementById(`contact-${key}-error`), checkField(key));
}
function renderReview(review, index) {
  const column = element('div', 'col-12 col-md-6');
  const card = element('article', 'card bg-black border-danger h-100 p-3');
  card.append(element('h3', 'h5 text-danger', review.name));
  card.append(element('p', 'small', `Feedback · ${review.rating}/5 · ${review.date}`));
  card.append(element('p', '', review.message));
  const remove = element('button', 'btn btn-outline-danger btn-sm mt-auto', 'Remove preview');
  remove.type = 'button'; remove.dataset.removeReview = String(index);
  card.append(remove); column.append(card);
  return column;
}
function renderReviews() {
  reviewList.replaceChildren();
  if (reviews.length === 0) {
    reviewList.append(element('p', 'text-danger', 'No feedback previews yet. Select Feedback above to add one.'));
    return;
  }
  reviews.forEach((review, index) => reviewList.append(renderReview(review, index)));
}
function renderSummary() {
  const lines = [
    `Name: ${fields.name.value.trim()}`,
    `Email: ${fields.email.value.trim()}`,
    `Subject: ${fields.subject.selectedOptions[0].textContent}`,
    `Message: ${fields.message.value.trim()}`
  ];
  if (fields.subject.value === 'feedback') {
    lines.splice(3, 0, `Rating: ${rating.value}/5`);
    if (fields.visits.value !== '') lines.splice(4, 0, `Visits: ${fields.visits.selectedOptions[0].textContent}`);
  }
  summary.replaceChildren(...lines.map((line) => element('p', 'mb-1', line)));
}
fields.subject.addEventListener('change', () => { showSubjectFields(); success.classList.add('hidden'); });
Object.entries({ ...fields, rating }).forEach(([key, field]) => {
  const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
  field.addEventListener(eventName, () => {
    if (key === 'message') counter.textContent = `${field.value.length} / 2,000 characters`;
    const errorNode = document.getElementById(`contact-${key}-error`);
    if (!errorNode.classList.contains('hidden')) markField(key);
    if (!success.classList.contains('hidden')) {
      success.classList.add('hidden');
      status.textContent = 'Draft edited. Review again when ready.';
    }
    errors.textContent = '';
  });
});
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const keys = ['name', 'email', 'subject', 'visits', 'rating', 'message'];
  const invalid = keys.filter((key) => !markField(key));
  if (invalid.length > 0) {
    status.textContent = 'The draft needs correction before review.';
    errors.textContent = `Please correct ${invalid.length} highlighted field${invalid.length === 1 ? '' : 's'}.`;
    success.classList.add('hidden');
    (invalid[0] === 'rating' ? rating : fields[invalid[0]]).focus();
    return;
  }
  errors.textContent = '';
  renderSummary();
  status.textContent = 'Draft reviewed. No data was sent to a server; no message or public review was created.';
  success.classList.remove('hidden');
  if (fields.subject.value === 'feedback') {
    const signature = `${fields.name.value.trim()}|${rating.value}|${fields.message.value.trim()}`;
    if (signature !== lastFeedbackSignature) {
      reviews.push({ name: fields.name.value.trim(), message: fields.message.value.trim(), rating: rating.value, date: new Date().toLocaleString('en-GB') });
      lastFeedbackSignature = signature;
      renderReviews();
    }
  }
  document.getElementById('contact-response').scrollIntoView({ block: 'nearest' });
});
reviewList.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-remove-review]');
  if (!button) return;
  reviews.splice(Number(button.dataset.removeReview), 1);
  lastFeedbackSignature = '';
  renderReviews();
  status.textContent = 'Feedback preview removed. No public review was affected.';
});
showSubjectFields();
renderReviews();

})();


