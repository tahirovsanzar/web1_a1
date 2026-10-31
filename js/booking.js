(() => {
  'use strict';
  const { programs, trainers, element, findProgram, money, localDate, setFieldState, referenceNumber, readDraft, saveDraft } = window.Experience;
  const form = document.getElementById('booking-form');
  form.noValidate = true;
  const fields = {
    name: document.getElementById('booking-name'),
    location: document.getElementById('booking-location'),
    service: document.getElementById('booking-service'),
    date: document.getElementById('booking-date'),
    time: document.getElementById('booking-time'),
    trainer: document.getElementById('booking-trainer'),
    notes: document.getElementById('booking-notes')
  };
  const summary = document.getElementById('booking-summary');
  const status = document.getElementById('booking-status');
  const total = document.getElementById('booking-total');
  const errors = document.getElementById('booking-errors');
  const success = document.getElementById('booking-success');
  let lastPlanSignature = '';
  let lastReference = '';
  const quantityWrapper = element('div', 'mb-3');
  const quantityLabel = element('label', 'form-label', 'Participants (1–6)');
  const quantity = element('input', 'form-control');
  quantity.type = 'number'; quantity.id = 'booking-quantity'; quantity.name = 'participants';
  quantity.min = '1'; quantity.max = '6'; quantity.step = '1'; quantity.value = '1';
  quantityLabel.htmlFor = quantity.id;
  const quantityError = element('p', 'error hidden small mt-1', 'Choose 1–6 participants.');
  quantityError.id = 'booking-quantity-error';
  quantity.setAttribute('aria-describedby', quantityError.id);
  quantityWrapper.append(quantityLabel, quantity, quantityError);
  fields.service.closest('.mb-3').after(quantityWrapper);
  const reset = element('button', 'btn btn-outline-danger w-100 mt-2', 'Clear plan');
  reset.type = 'button'; reset.id = 'booking-reset';
  document.getElementById('submit-booking-btn').after(reset);
  const specialtyHint = element('p', 'form-text text-light', 'Choose a trainer to see their available programs. Specialties are illustrative; confirm with the club.');
  fields.service.closest('.mb-3').append(specialtyHint);
  const trainerHint = element('p', 'form-text text-light', 'Choose a program to see its available trainers. Specialties are illustrative; confirm with the club.');
  fields.trainer.closest('.mb-3').append(trainerHint);

  function selectedTrainer() {
    return trainers.find((person) => person.id === fields.trainer.value) || null;
  }
  function allowedPrograms() {
    const trainer = selectedTrainer();
    return trainer ? programs.filter((program) => trainer.programs.includes(program.id)) : programs;
  }
  function allowedTrainers() {
    const program = findProgram(fields.service.value);
    return program ? trainers.filter((trainer) => trainer.programs.includes(program.id)) : trainers;
  }
  function renderServiceOptions() {
    const previous = fields.service.value;
    const available = [...allowedPrograms()].sort((a, b) => a.name.localeCompare(b.name));
    const placeholder = new Option('Choose a program...', '', true, true);
    fields.service.replaceChildren(placeholder, ...available.map((program) => new Option(program.name, program.id)));
    if (available.some((program) => program.id === previous)) fields.service.value = previous;
    const trainer = selectedTrainer();
    specialtyHint.textContent = trainer
      ? `${trainer.name}: ${available.map((program) => program.name).join(', ')}. Specialties are illustrative; confirm with the club.`
      : 'Choose a trainer to see their available programs. Specialties are illustrative; confirm with the club.';
    return previous !== '' && fields.service.value === '';
  }
  function renderTrainerOptions() {
    const previous = fields.trainer.value;
    const available = allowedTrainers();
    fields.trainer.replaceChildren(
      new Option('No preference / not applicable', 'any'),
      ...available.map((trainer) => new Option(trainer.name, trainer.id))
    );
    if (available.some((trainer) => trainer.id === previous)) fields.trainer.value = previous;
    const program = findProgram(fields.service.value);
    trainerHint.textContent = program
      ? `${program.name}: ${available.map((trainer) => trainer.name).join(', ')}. Specialties are illustrative; confirm with the club.`
      : 'Choose a program to see its available trainers. Specialties are illustrative; confirm with the club.';
    return previous !== 'any' && fields.trainer.value === 'any';
  }

  function astanaNow() {
    const shifted = new Date(Date.now() + 5 * 60 * 60 * 1000);
    return { date: shifted.toISOString().slice(0, 10), time: shifted.toISOString().slice(11, 16) };
  }
  function timeWindow(date) {
    if (date.getDay() === 0) return null;
    return date.getDay() === 6 ? { start: '09:00', end: '21:30' } : { start: '07:00', end: '22:30' };
  }
  function checkField(key) {
    const value = key === 'quantity' ? quantity.value : fields[key].value.trim();
    const today = astanaNow();
    if (key === 'name') return value.length >= 2 ? '' : 'Enter a name with at least 2 characters.';
    if (key === 'location') return value !== '' ? '' : 'Choose a club location.';
    if (key === 'service') return allowedPrograms().some((program) => program.id === value)
      ? '' : 'Choose a program available with the selected trainer.';
    if (key === 'quantity') return /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 6 ? '' : 'Choose a whole number from 1 to 6.';
    if (key === 'date') {
      const date = localDate(value);
      if (!date) return 'Choose a valid date.';
      if (value < today.date) return 'Choose today or a future date.';
      if (!timeWindow(date)) return 'The listed schedule is closed on Sundays.';
      return '';
    }
    if (key === 'time') {
      const date = localDate(fields.date.value);
      const window = date ? timeWindow(date) : null;
      if (!/^\d{2}:(00|30)$/.test(value)) return 'Choose a time on a 30-minute boundary.';
      if (!window) return 'Choose an open date first.';
      if (value < window.start || value > window.end) return `Choose ${window.start}–${window.end} for this day.`;
      if (fields.date.value === today.date && value <= today.time) return 'Choose a start time later than the current Astana time.';
      return '';
    }
    if (key === 'trainer') return value === 'any' || allowedTrainers().some((person) => person.id === value)
      ? '' : 'Choose a trainer available for the selected program.';
    if (key === 'notes') return value.length <= 1000 ? '' : 'Keep the goal within 1,000 characters.';
    return '';
  }
  function markField(key) {
    const field = key === 'quantity' ? quantity : fields[key];
    const errorNode = document.getElementById(`booking-${key}-error`);
    return setFieldState(field, errorNode, checkField(key));
  }
  function chosenLabel(select) {
    return select.selectedOptions[0] && select.value !== '' ? select.selectedOptions[0].textContent : 'Not selected';
  }
  function updateSummary() {
    const program = findProgram(fields.service.value);
    const count = Number(quantity.value);
    const validCount = Number.isInteger(count) && count >= 1 && count <= 6;
    const parts = [
      `Program: ${program ? program.name : 'Not selected'}`,
      `Location: ${chosenLabel(fields.location)}`,
      `Date: ${fields.date.value || 'Not selected'}`,
      `Start time: ${fields.time.value || 'Not selected'} (Astana, UTC+5)`,
      `Participants: ${validCount ? count : 'Not selected'}`,
      `Trainer: ${chosenLabel(fields.trainer)}`
    ];
    summary.replaceChildren(...parts.map((part) => element('p', 'mb-1', part)));
    total.textContent = program && validCount ? `Indicative estimate: ${money(program.price)} × ${count} = ${money(program.price * count)}. Confirm actual pricing with the club.` : 'Select a program and participant count to see an indicative estimate.';
  }
  function storeSelection() {
    saveDraft({ service: fields.service.value, location: fields.location.value, date: fields.date.value, time: fields.time.value, trainer: fields.trainer.value, quantity: quantity.value });
  }
  const saved = readDraft();
  const selected = new URLSearchParams(window.location.search);
  const serviceFromUrl = selected.get('service');
  const requestedService = serviceFromUrl || saved.service;
  const requestedLocation = selected.get('location') || saved.location;
  const requestedTrainer = selected.get('trainer') || saved.trainer;
  if (trainers.some((person) => person.id === requestedTrainer)) fields.trainer.value = requestedTrainer;
  if (serviceFromUrl && !selected.has('trainer') &&
    !allowedPrograms().some((program) => program.id === serviceFromUrl)) fields.trainer.value = 'any';
  renderServiceOptions();
  if (allowedPrograms().some((program) => program.id === requestedService)) fields.service.value = requestedService;
  renderTrainerOptions();
  if (['imanbayeva', 'asfendiyarov'].includes(requestedLocation)) fields.location.value = requestedLocation;
  if (localDate(saved.date || '')) fields.date.value = saved.date;
  if (/^\d{2}:\d{2}$/.test(saved.time || '')) fields.time.value = saved.time;
  if (/^[1-6]$/.test(saved.quantity || '')) quantity.value = saved.quantity;
  fields.date.min = astanaNow().date;
  updateSummary();

  Object.entries({ ...fields, quantity }).forEach(([key, field]) => {
    const eventName = field.tagName === 'SELECT' ? 'change' : 'input';
    field.addEventListener(eventName, () => {
      const programCleared = key === 'trainer' && renderServiceOptions();
      const trainerCleared = (key === 'service' || key === 'trainer') && renderTrainerOptions();
      const errorNode = document.getElementById(`booking-${key}-error`);
      if (!errorNode.classList.contains('hidden')) markField(key);
      if (programCleared && !document.getElementById('booking-service-error').classList.contains('hidden')) markField('service');
      if (trainerCleared && !document.getElementById('booking-trainer-error').classList.contains('hidden')) markField('trainer');
      if (key === 'date' && !document.getElementById('booking-time-error').classList.contains('hidden')) markField('time');
      updateSummary();
      storeSelection();
      success.classList.add('hidden');
      errors.textContent = '';
      status.textContent = programCleared
        ? 'The previous program is not offered by this trainer. Choose one of the listed programs.'
        : trainerCleared
          ? 'The previous trainer is not available for this program. Choose another trainer or no preference.'
          : 'Plan edited. Review again when you are ready.';
    });
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const keys = ['name', 'location', 'service', 'quantity', 'date', 'time', 'trainer', 'notes'];
    const invalid = keys.filter((key) => !markField(key));
    updateSummary();
    if (invalid.length > 0) {
      errors.textContent = `Please correct ${invalid.length} highlighted field${invalid.length === 1 ? '' : 's'}.`;
      status.textContent = 'The plan needs correction before review.';
      success.classList.add('hidden');
      (invalid[0] === 'quantity' ? quantity : fields[invalid[0]]).focus();
      return;
    }
    errors.textContent = '';
    const signature = [fields.name.value.trim(), fields.location.value, fields.service.value, quantity.value, fields.date.value, fields.time.value, fields.trainer.value, fields.notes.value.trim()].join('|');
    if (signature !== lastPlanSignature) {
      lastPlanSignature = signature;
      lastReference = referenceNumber();
    }
    status.textContent = `${lastReference}: demonstration request reviewed. No data was sent to a server; no real booking or payment was created.`;
    success.classList.remove('hidden');
    document.getElementById('booking-confirmation').scrollIntoView({ block: 'nearest' });
  });
  reset.addEventListener('click', () => {
    form.reset();
    renderServiceOptions();
    renderTrainerOptions();
    Object.keys({ ...fields, quantity }).forEach((key) => {
      const field = key === 'quantity' ? quantity : fields[key];
      field.classList.remove('error', 'success');
      field.removeAttribute('aria-invalid');
      const message = document.getElementById(`booking-${key}-error`);
      message.classList.add('hidden');
    });
    quantity.value = '1';
    saveDraft({});
    lastPlanSignature = '';
    lastReference = '';
    status.textContent = 'Plan cleared. No reservation has been sent.';
    errors.textContent = '';
    success.classList.add('hidden');
    updateSummary();
    fields.name.focus();
  });

})();
