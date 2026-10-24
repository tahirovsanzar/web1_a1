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
