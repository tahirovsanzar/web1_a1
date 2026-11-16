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
  const $planPreviews = $('<section>', { class: 'mt-4', 'aria-live': 'polite' }).append(
    $('<h2>', { class: 'h4 text-danger', text: 'Session plan previews' })
  );
  $form.after($planPreviews);

  const $timeInput = $fields.time;
  const $timeDisplay = $('<input>', { id: 'booking-time', name: 'time', type: 'text',
    class: 'form-control', readonly: true, placeholder: 'HH:MM', required: true,
    'aria-describedby': 'booking-time-help booking-time-error', 'aria-expanded': 'false',
    'aria-controls': 'time-picker' });
  $timeInput.replaceWith($timeDisplay);
  $fields.time = $timeDisplay;
  const $hours = $('<select>', { class: 'form-select', size: 5, 'aria-label': 'Hour' });
  const $minutes = $('<select>', { class: 'form-select', size: 2, 'aria-label': 'Minute' });
  const $picker = $('<div>', { id: 'time-picker', class: 'position-absolute bg-white border rounded shadow p-2 d-none',
    role: 'group', 'aria-label': 'Choose a start time' }).css('z-index', '10');
  $picker.append($('<div>', { class: 'd-flex gap-2' }).append($hours, $minutes));
  const $chooseTime = $('<button>', { type: 'button', class: 'btn btn-danger btn-sm w-100 mt-2', text: 'Choose time' });
  $picker.append($chooseTime);
  const $openTime = $('<button>', { type: 'button', class: 'btn btn-outline-danger', text: '◷', 'aria-label': 'Choose start time' });
  $timeDisplay.wrap($('<div>', { class: 'input-group' }));
  $timeDisplay.after($openTime);
  $timeDisplay.parent().parent().addClass('position-relative').append($picker);

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
  const $availability = $('<p>', { class: 'form-text text-light', role: 'status' });
  $fields.trainer.closest('.mb-3').append($availability);

  function updateAvailability() {
    const program = findProgram(value('service'));
    const trainer = selectedTrainer();
    if (!program || !trainer) { $availability.text(''); return; }
    const seed = (program.id + trainer.id).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    $availability.text(`Example availability: approximately ${2 + seed % 5} places. Demo only; confirm actual availability with the club.`);
  }

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
  function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }
  function formatTime(totalMinutes) {
    const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const minutes = String(totalMinutes % 60).padStart(2, '0');
    return hours + ':' + minutes;
  }
  function availableTimes() {
    const selectedDate = value('date');
    const date = localDate(selectedDate);
    const window = date && timeWindow(date);
    if (!window || selectedDate < astanaNow().date) return [];
    const now = astanaNow();
    const times = [];
    for (let minutes = timeToMinutes(window.start); minutes <= timeToMinutes(window.end); minutes += 30) {
      const time = formatTime(minutes);
      if (selectedDate !== now.date || time > now.time) times.push(time);
    }
    return times;
  }
  function updateMinutes(times, selectedTime) {
    const hour = $hours.val();
    $minutes.empty();
    times.filter((time) => time.slice(0, 2) === hour).forEach((time) => {
      $minutes.append($('<option>', { value: time.slice(3), text: time.slice(3) }));
    });
    if (selectedTime && selectedTime.slice(0, 2) === hour) $minutes.val(selectedTime.slice(3));
  }
  function openTimePicker() {
    const times = availableTimes();
    if (!times.length) {
      $('#booking-time-error').text(value('date') ? 'No available start times for this date.' : 'Choose a date first.').removeClass('hidden');
      return;
    }
    const selectedTime = times.includes(value('time')) ? value('time') : times[0];
    $hours.empty();
    [...new Set(times.map((time) => time.slice(0, 2)))].forEach((hour) => {
      $hours.append($('<option>', { value: hour, text: hour }));
    });
    $hours.val(selectedTime.slice(0, 2));
    updateMinutes(times, selectedTime);
    $picker.removeClass('d-none');
    $timeDisplay.attr('aria-expanded', 'true');
    $hours.trigger('focus');
  }
  function closeTimePicker() {
    $picker.addClass('d-none');
    $timeDisplay.attr('aria-expanded', 'false');
  }
  function selectTime() {
    if ($hours.val() && $minutes.val()) $timeDisplay.val($hours.val() + ':' + $minutes.val()).trigger('input');
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
  if (/^\d{2}:(00|30)$/.test(saved.time || '')) $fields.time.val(saved.time);
  if (/^[1-6]$/.test(saved.quantity || '')) $quantity.val(saved.quantity);
  $fields.date.attr('min', astanaNow().date);
  updateAvailability();
  updateSummary();

  $timeDisplay.on('click', openTimePicker).on('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openTimePicker(); }
  });
  $openTime.on('click', openTimePicker);
  $chooseTime.on('click', function () { selectTime(); closeTimePicker(); $timeDisplay.trigger('focus'); });
  $hours.on('change', function () { updateMinutes(availableTimes()); selectTime(); });
  $minutes.on('change', selectTime);
  $minutes.on('click', function () { selectTime(); closeTimePicker(); });
  $picker.on('keydown', function (event) {
    if (event.key === 'Escape') { closeTimePicker(); $timeDisplay.trigger('focus'); }
  });
  $(document).on('pointerdown', function (event) {
    if (!$(event.target).closest($picker).length && event.target !== $timeDisplay[0] && event.target !== $openTime[0]) closeTimePicker();
  });

  Object.entries({ ...$fields, quantity: $quantity }).forEach(([key, $field]) => {
    $field.on($field.is('select') ? 'change' : 'input', function () {
      if (key === 'date') {
        closeTimePicker();
        if (value('time') && !availableTimes().includes(value('time'))) $timeDisplay.val('');
      }
      const programCleared = key === 'trainer' && renderServiceOptions();
      const trainerCleared = (key === 'service' || key === 'trainer') && renderTrainerOptions();
      if (key === 'service' || key === 'trainer') updateAvailability();
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
    const $preview = $('<article>', { class: 'card bg-black border-danger p-3 mb-3' }).append(
      $('<h3>', { class: 'h5 text-danger', text: 'Session plan preview' }),
      $('<p>', { class: 'small', text: 'Demo only · No reservation created' }),
      $summary.clone().removeAttr('id').removeAttr('aria-live'),
      $('<p>', { class: 'small mt-2', text: $total.text() }),
      $('<button>', { type: 'button', class: 'btn btn-outline-danger', text: 'Remove preview' })
    );
    $planPreviews.append($preview);
    $form.trigger('reset');
    closeTimePicker();
    $fields.service.val('');
    $fields.trainer.val('any');
    renderServiceOptions();
    renderTrainerOptions();
    updateAvailability();
    $quantity.val('1');
    Object.entries({ ...$fields, quantity: $quantity }).forEach(([key, $field]) => {
      $field.removeClass('error success').removeAttr('aria-invalid');
      $('#booking-' + key + '-error').addClass('hidden');
    });
    saveDraft({});
    lastPlanSignature = '';
    lastReference = '';
    $('html, body').stop(true).animate({ scrollTop: $('#booking-confirmation').offset().top - 100 }, 200);
  });
  $planPreviews.on('click', 'button', function () { $(this).closest('article').remove(); });
  $reset.on('click', function () {
    $form.trigger('reset');
    closeTimePicker();
    renderServiceOptions();
    renderTrainerOptions();
    updateAvailability();
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
