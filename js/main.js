'use strict';

const programs = [
  { id: 'full-body', name: 'Full Body', category: 'Strength', price: 5000, duration: 'One session' },
  { id: 'fight', name: 'Fight', category: 'Combat', price: 5000, duration: 'One session' },
  { id: 'yoga', name: 'Yoga', category: 'Mobility', price: 5000, duration: 'One session' },
  { id: 'healthy-posture', name: 'Healthy Posture', category: 'Mobility', price: 5000, duration: 'One session' },
  { id: 'strip-plastic', name: 'Strip Plastic', category: 'Dance', price: 5000, duration: 'One session' },
  { id: 'workout-school', name: 'Workout School', category: 'Strength', price: 5000, duration: 'One session' },
  { id: 'stretching', name: 'Stretching', category: 'Mobility', price: 5000, duration: 'One session' },
  { id: 'strength-flexibility', name: 'Strength and Flexibility', category: 'Mobility', price: 5000, duration: 'One session' },
  { id: 'functional', name: 'Functional Training', category: 'Strength', price: 5000, duration: 'One session' }
];
const trainers = [
  { id: 'sokolovskiy', name: 'Sokolovskiy', programs: ['full-body', 'fight', 'workout-school', 'functional'] },
  { id: 'sama', name: 'Sama', programs: ['yoga', 'healthy-posture', 'strip-plastic', 'stretching', 'strength-flexibility'] },
  { id: 'anna', name: 'Anna', programs: ['full-body', 'yoga', 'healthy-posture', 'strip-plastic', 'stretching', 'strength-flexibility'] },
  { id: 'ulzhan', name: 'Ulzhan', programs: ['yoga', 'healthy-posture', 'strip-plastic', 'stretching', 'strength-flexibility', 'functional'] },
  { id: 'iskazzzin', name: 'Iskazzzin', programs: ['full-body', 'fight', 'workout-school', 'strength-flexibility', 'functional'] }
];
const draftKey = 'experience-visit-plan';

function element(tag, classNames, content) {
  const node = document.createElement(tag);
  if (classNames) node.className = classNames;
  if (content !== undefined) node.textContent = content;
  return node;
}
function money(amount) {
  return `${new Intl.NumberFormat('en-US').format(amount)} KZT`;
}
function findProgram(id) {
  return programs.find((program) => program.id === id) || null;
}
function setFieldState(field, errorNode, message) {
  const invalid = message !== '';
  field.classList.toggle('error', invalid);
  field.classList.toggle('success', !invalid && field.value.trim() !== '');
  field.setAttribute('aria-invalid', String(invalid));
  errorNode.textContent = message;
  errorNode.classList.toggle('hidden', !invalid);
  return !invalid;
}
function localDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null;
}
function referenceNumber() {
  return `DEMO-${Math.floor(100000 + Math.random() * 900000)}`;
}
function readDraft() {
  try { return JSON.parse(sessionStorage.getItem(draftKey) || '{}'); }
  catch { return {}; }
}
function saveDraft(draft) {
  try { sessionStorage.setItem(draftKey, JSON.stringify(draft)); }
  catch {}
}
function connectPlanLinks() {
  $('a[data-service]').on('click', function () {
    const $link = $(this);
    const service = $link.attr('data-service');
    if (!findProgram(service)) return;
    saveDraft({ ...readDraft(), service });
    const destination = new URL($link.attr('href'), window.location.href);
    destination.searchParams.set('service', service);
    $link.attr('href', destination.href);
  });
  $('a[id^="btn-book-"]').on('click', function () {
    const $link = $(this);
    const trainer = $link.attr('id').slice('btn-book-'.length);
    if (!trainers.some((person) => person.id === trainer)) return;
    saveDraft({ ...readDraft(), trainer });
    const destination = new URL($link.attr('href'), window.location.href);
    destination.searchParams.set('trainer', trainer);
    $link.attr('href', destination.href);
  });
}

const jqueryReady = window.jQuery ? Promise.resolve() : new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
  script.onload = resolve;
  script.onerror = reject;
  document.head.append(script);
});

window.Experience = Object.freeze({ programs, trainers, element, money, findProgram, setFieldState, localDate, referenceNumber, readDraft, saveDraft, jqueryReady });
jqueryReady.then(() => $(connectPlanLinks)).catch(() => {});
