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
