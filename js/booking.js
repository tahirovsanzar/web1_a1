window.Experience.jqueryReady.then(() => $(function () {
  'use strict';
  const { programs, trainers, findProgram, money, localDate, referenceNumber, readDraft, saveDraft } = window.Experience;
  const $form = $('#booking-form').prop('noValidate', true);
  const $fields = {
    name: $('#booking-name'), location: $('#booking-location'), service: $('#booking-service'),
    date: $('#booking-date'), time: $('#booking-time'), trainer: $('#booking-trainer'),
    notes: $('#booking-notes')
  };
  const $summary = $('#booking-summary');
  const $status = $('#booking-status');
  const $total = $('#booking-total');
  const $errors = $('#booking-errors');
  const $success = $('#booking-success');
  let lastPlanSignature = '';
  let lastReference = '';

  const $quantity = $('<input>', { id: 'booking-quantity', name: 'participants', type: 'number',
    class: 'form-control', min: '1', max: '6', step: '1', value: '1',
    'aria-describedby': 'booking-quantity-error' });
  const $quantityWrapper = $('<div>', { class: 'mb-3' }).append(
    $('<label>', { class: 'form-label', for: 'booking-quantity', text: 'Participants (1–6)' }),
    $quantity,
    $('<p>', { id: 'booking-quantity-error', class: 'error hidden small mt-1',
      text: 'Choose 1–6 participants.' })
  );
  $fields.service.closest('.mb-3').after($quantityWrapper);
  const $reset = $('<button>', { id: 'booking-reset', type: 'button',
    class: 'btn btn-outline-danger w-100 mt-2', text: 'Clear plan' });
  $('#submit-booking-btn').after($reset);
  const $specialtyHint = $('<p>', { class: 'form-text text-light' });
  const $trainerHint = $('<p>', { class: 'form-text text-light' });
  $fields.service.closest('.mb-3').append($specialtyHint);
  $fields.trainer.closest('.mb-3').append($trainerHint);

  function value(key) {
    return String((key === 'quantity' ? $quantity : $fields[key]).val() || '').trim();
  }
  function selectedTrainer() {
    return trainers.find((person) => person.id === value('trainer')) || null;
  }
  function allowedPrograms() {
    const trainer = selectedTrainer();
    return trainer ? programs.filter((program) => trainer.programs.includes(program.id)) : programs;
  }
  function allowedTrainers() {
    const program = findProgram(value('service'));
    return program ? trainers.filter((trainer) => trainer.programs.includes(program.id)) : trainers;
  }
  function renderServiceOptions() {
    const previous = value('service');
    const available = [...allowedPrograms()].sort((a, b) => a.name.localeCompare(b.name));
    $fields.service.empty().append($('<option>', { value: '', text: 'Choose a program...' }));
    available.forEach((program) => $fields.service.append(
      $('<option>', { value: program.id, text: program.name })
    ));
    if (available.some((program) => program.id === previous)) $fields.service.val(previous);
    const trainer = selectedTrainer();
    $specialtyHint.text(trainer
      ? `${trainer.name}: ${available.map((program) => program.name).join(', ')}. Specialties are illustrative; confirm with the club.`
      : 'Choose a trainer to see their available programs. Specialties are illustrative; confirm with the club.');
    return previous !== '' && value('service') === '';
  }
  function renderTrainerOptions() {
    const previous = value('trainer');
    const available = allowedTrainers();
    $fields.trainer.empty().append($('<option>', { value: 'any', text: 'No preference / not applicable' }));
    available.forEach((trainer) => $fields.trainer.append(
      $('<option>', { value: trainer.id, text: trainer.name })
    ));
    if (available.some((trainer) => trainer.id === previous)) $fields.trainer.val(previous);
    const program = findProgram(value('service'));
    $trainerHint.text(program
      ? `${program.name}: ${available.map((trainer) => trainer.name).join(', ')}. Specialties are illustrative; confirm with the club.`
      : 'Choose a program to see its available trainers. Specialties are illustrative; confirm with the club.');
    return previous !== 'any' && value('trainer') === 'any';
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
    const entered = value(key);
    const today = astanaNow();
    if (key === 'name') return entered.length >= 2 ? '' : 'Enter a name with at least 2 characters.';
    if (key === 'location') return entered !== '' ? '' : 'Choose a club location.';
    if (key === 'service') return allowedPrograms().some((program) => program.id === entered)
      ? '' : 'Choose a program available with the selected trainer.';
    if (key === 'quantity') return /^\d+$/.test(entered) && Number(entered) >= 1 && Number(entered) <= 6
      ? '' : 'Choose a whole number from 1 to 6.';
    if (key === 'date') {
      const date = localDate(entered);
      if (!date) return 'Choose a valid date.';
      if (entered < today.date) return 'Choose today or a future date.';
      if (!timeWindow(date)) return 'The listed schedule is closed on Sundays.';
      return '';
    }
    if (key === 'time') {
      const date = localDate(value('date'));
      const window = date ? timeWindow(date) : null;
      if (!/^\d{2}:(00|30)$/.test(entered)) return 'Choose a time on a 30-minute boundary.';
      if (!window) return 'Choose an open date first.';
      if (entered < window.start || entered > window.end) return `Choose ${window.start}–${window.end} for this day.`;
      if (value('date') === today.date && entered <= today.time) return 'Choose a start time later than the current Astana time.';
      return '';
    }
    if (key === 'trainer') return entered === 'any' || allowedTrainers().some((person) => person.id === entered)
      ? '' : 'Choose a trainer available for the selected program.';
    if (key === 'notes') return entered.length <= 1000 ? '' : 'Keep the goal within 1,000 characters.';
    return '';
  }
  function markField(key) {
    const $field = key === 'quantity' ? $quantity : $fields[key];
    const $error = $('#booking-' + key + '-error');
    const message = checkField(key);
    const invalid = message !== '';
    $field.toggleClass('error', invalid)
      .toggleClass('success', !invalid && value(key) !== '')
      .attr('aria-invalid', String(invalid));
    $error.text(message).toggleClass('hidden', !invalid);
    return !invalid;
  }
  function chosenLabel($select) {
    return $select.val() !== '' ? $select.find('option:selected').text() : 'Not selected';
  }
  function updateSummary() {
    const program = findProgram(value('service'));
    const count = Number(value('quantity'));
    const validCount = Number.isInteger(count) && count >= 1 && count <= 6;
    const parts = [
      `Program: ${program ? program.name : 'Not selected'}`,
      `Location: ${chosenLabel($fields.location)}`,
      `Date: ${value('date') || 'Not selected'}`,
      `Start time: ${value('time') || 'Not selected'} (Astana, UTC+5)`,
      `Participants: ${validCount ? count : 'Not selected'}`,
      `Trainer: ${chosenLabel($fields.trainer)}`
    ];
    $summary.empty();
    parts.forEach((part) => $summary.append($('<p>', { class: 'mb-1', text: part })));
    $total.text(program && validCount
      ? `Indicative estimate: ${money(program.price)} × ${count} = ${money(program.price * count)}. Confirm actual pricing with the club.`
      : 'Select a program and participant count to see an indicative estimate.');
  }
  function storeSelection() {
    saveDraft({ service: value('service'), location: value('location'), date: value('date'),
      time: value('time'), trainer: value('trainer'), quantity: value('quantity') });
  }

  const saved = readDraft();
  const selected = new URLSearchParams(window.location.search);
  const serviceFromUrl = selected.get('service');
  const requestedService = serviceFromUrl || saved.service;
  const requestedLocation = selected.get('location') || saved.location;
  const requestedTrainer = selected.get('trainer') || saved.trainer;
  if (trainers.some((person) => person.id === requestedTrainer)) $fields.trainer.val(requestedTrainer);
  if (serviceFromUrl && !selected.has('trainer') &&
      !allowedPrograms().some((program) => program.id === serviceFromUrl)) $fields.trainer.val('any');
  renderServiceOptions();
  if (allowedPrograms().some((program) => program.id === requestedService)) $fields.service.val(requestedService);
  renderTrainerOptions();
  if (['imanbayeva', 'asfendiyarov'].includes(requestedLocation)) $fields.location.val(requestedLocation);
  if (localDate(saved.date || '')) $fields.date.val(saved.date);
  if (/^\d{2}:\d{2}$/.test(saved.time || '')) $fields.time.val(saved.time);
  if (/^[1-6]$/.test(saved.quantity || '')) $quantity.val(saved.quantity);
  $fields.date.attr('min', astanaNow().date);
  updateSummary();

  Object.entries({ ...$fields, quantity: $quantity }).forEach(([key, $field]) => {
    $field.on($field.is('select') ? 'change' : 'input', function () {
      const programCleared = key === 'trainer' && renderServiceOptions();
      const trainerCleared = (key === 'service' || key === 'trainer') && renderTrainerOptions();
      if (!$('#booking-' + key + '-error').hasClass('hidden')) markField(key);
      if (programCleared && !$('#booking-service-error').hasClass('hidden')) markField('service');
      if (trainerCleared && !$('#booking-trainer-error').hasClass('hidden')) markField('trainer');
      if (key === 'date' && !$('#booking-time-error').hasClass('hidden')) markField('time');
      updateSummary();
      storeSelection();
      $success.addClass('hidden');
      $errors.text('');
      $status.text(programCleared
        ? 'The previous program is not offered by this trainer. Choose one of the listed programs.'
        : trainerCleared
          ? 'The previous trainer is not available for this program. Choose another trainer or no preference.'
          : 'Plan edited. Review again when you are ready.');
    });
  });
  $form.on('submit', function (event) {
    event.preventDefault();
    const keys = ['name', 'location', 'service', 'quantity', 'date', 'time', 'trainer', 'notes'];
    const invalid = keys.filter((key) => !markField(key));
    updateSummary();
    if (invalid.length > 0) {
      $errors.text(`Please correct ${invalid.length} highlighted field${invalid.length === 1 ? '' : 's'}.`);
      $status.text('The plan needs correction before review.');
      $success.addClass('hidden');
      (invalid[0] === 'quantity' ? $quantity : $fields[invalid[0]]).trigger('focus');
      return;
    }
    $errors.text('');
    const signature = keys.map(value).join('|');
    if (signature !== lastPlanSignature) {
      lastPlanSignature = signature;
      lastReference = referenceNumber();
    }
    $status.text(`${lastReference}: demonstration request reviewed. No data was sent to a server; no real booking or payment was created.`);
    $success.removeClass('hidden');
    $('html, body').stop(true).animate({ scrollTop: $('#booking-confirmation').offset().top - 100 }, 200);
  });
  $reset.on('click', function () {
    $form.trigger('reset');
    renderServiceOptions();
    renderTrainerOptions();
    Object.entries({ ...$fields, quantity: $quantity }).forEach(([key, $field]) => {
      $field.removeClass('error success').removeAttr('aria-invalid');
      $('#booking-' + key + '-error').addClass('hidden');
    });
    $quantity.val('1');
    saveDraft({});
    lastPlanSignature = '';
    lastReference = '';
    $status.text('Plan cleared. No reservation has been sent.');
    $errors.text('');
    $success.addClass('hidden');
    updateSummary();
    $fields.name.trigger('focus');
  });
})).catch(() => {});
