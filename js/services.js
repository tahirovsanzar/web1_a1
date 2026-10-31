$(function () {
  'use strict';
  const { programs, money, referenceNumber, readDraft, saveDraft } = window.Experience;
  const $priceSection = $('#price-list');
  const $tableBody = $priceSection.find('tbody');
  const $results = $('#services-results');
  const cart = new Map();
  let currentReference = '';

  const $toggleFilters = $('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm mb-3',
    text: 'Hide filters', 'aria-controls': 'program-controls', 'aria-expanded': 'true' });
  const $controls = $('<div>', { id: 'program-controls', class: 'bg-black border border-danger rounded p-3 mb-3' });
  const $controlRow = $('<div>', { class: 'row g-3' });
  function controlColumn(labelText, $control) {
    const $column = $('<div>', { class: 'col-12 col-md-6' });
    $column.append($('<label>', { class: 'form-label', for: $control.attr('id'), text: labelText }), $control);
    return $column;
  }
  const $category = $('<select>', { id: 'program-category', class: 'form-select' });
  $category.append($('<option>', { value: '', text: 'All categories' }));
  [...new Set(programs.map((program) => program.category))].sort().forEach((name) => {
    $category.append($('<option>', { value: name, text: name }));
  });
  const $sort = $('<select>', { id: 'program-sort', class: 'form-select' });
  [['default', 'Original order'], ['name', 'Name A–Z'], ['category', 'Category A–Z']].forEach(([value, label]) => {
    $sort.append($('<option>', { value: value, text: label }));
  });
  const $count = $('<p>', { id: 'program-count', class: 'mb-2 mt-3', role: 'status' });
  const $resetFilters = $('<button>', { id: 'program-reset', type: 'button',
    class: 'btn btn-outline-danger btn-sm', text: 'Reset filters' });
  $controlRow.append(controlColumn('Category', $category), controlColumn('Sort by', $sort));
  $controls.append($controlRow, $count, $resetFilters);
  $priceSection.find('.table-responsive').before($toggleFilters, $controls);
  const $empty = $('<p>', { id: 'program-empty', class: 'text-danger mt-3 hidden', role: 'status',
    text: 'No programs match these filters. Reset filters to see all nine.' });
  $priceSection.find('.table-responsive').after($empty);


  function renderProgramRow(program) {
    const $row = $('<tr>');
    const $action = $('<td>');
    const $add = $('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm me-2 mb-1',
      text: 'Add to estimate', 'aria-label': 'Add ' + program.name + ' to estimate' })
      .attr('data-add-program', program.id);
    const $plan = $('<a>', { class: 'btn btn-danger btn-sm mb-1', text: 'Plan visit',
      href: 'booking.html?service=' + encodeURIComponent(program.id) + '#booking-service',
      'aria-label': 'Plan a ' + program.name + ' visit' })
      .attr('data-service', program.id);
    $action.append($add, $plan);
    return $row.append(
      $('<th>', { scope: 'row', text: program.name }),
      $('<td>', { text: program.duration }),
      $('<td>', { text: money(program.price) }),
      $action
    );
  }
  function matchingPrograms(chosenCategory, order) {
    const matches = programs.filter((program) => chosenCategory === '' || program.category === chosenCategory);
    if (order === 'name') matches.sort((a, b) => a.name.localeCompare(b.name));
    if (order === 'category') matches.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return matches;
  }
  function renderCatalogue() {
    const matches = matchingPrograms($category.val(), $sort.val());
    $tableBody.empty();
    matches.forEach((program) => $tableBody.append(renderProgramRow(program)));
    $count.text(matches.length + ' of ' + programs.length + ' programs shown.');
    $empty.toggleClass('hidden', matches.length !== 0);
    return matches.length;
  }

  const $cartPanel = $('<section>', { id: 'service-plan', class: 'bg-black border border-danger rounded p-4 mt-4' });
  const $cartLines = $('<div>', { id: 'cart-lines', 'aria-live': 'polite' });
  const $cartTotal = $('<p>', { id: 'cart-total', class: 'fw-bold mt-3', role: 'status' });
  const $clear = $('<button>', { id: 'cart-clear', type: 'button', class: 'btn btn-outline-danger', text: 'Clear plan' });
  const $finish = $('<button>', { id: 'cart-finish', type: 'button', class: 'btn btn-danger', text: 'Create demo summary' });
  const $feedback = $('<p>', { id: 'cart-feedback', class: 'mt-3', role: 'status' });
  const $confirmation = $('<p>', { id: 'cart-confirmation', class: 'success hidden', role: 'status' });
  const $next = $('<a>', { id: 'cart-next', class: 'btn btn-outline-danger hidden',
    href: 'booking.html#booking-service', text: 'Plan the first selected program' });
  const $note = $('<p>', { class: 'small' });
  $note.html('<strong>Indicative prices only.</strong> This is a demonstration estimate, not a purchase or reservation.');
  $cartPanel.append(
    $('<h3>', { class: 'h4 text-danger', text: 'Session estimate' }),
    $note, $cartLines, $cartTotal,
    $('<div>', { class: 'd-flex flex-wrap gap-2' }).append($clear, $finish),
    $feedback, $confirmation, $next
  );
  $results.append($cartPanel);

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
  function cartButton(label, action, program) {
    return $('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm', text: label,
      'aria-label': label + ' ' + program.name })
      .attr('data-cart-action', action).attr('data-program', program.id);
  }
  function renderCart() {
    const lines = [...cart.entries()];
    $cartLines.empty();
    if (lines.length === 0) {
      $cartLines.append($('<p>', { class: 'text-danger', text: 'Your plan is empty. Add a program from the table.' }));
    }
    lines.forEach(([id, quantity]) => {
      const program = programs.find((item) => item.id === id);
      const $buttons = $('<div>', { class: 'd-flex flex-wrap gap-1' }).append(
        cartButton('−', 'decrease', program),
        cartButton('+', 'increase', program),
        cartButton('Remove', 'remove', program)
      );
      const $line = $('<div>', { class: 'd-flex flex-wrap justify-content-between align-items-center gap-2 border-bottom border-secondary py-2' })
        .attr('data-cart-program', id)
        .append($('<span>', { text: program.name + ' × ' + quantity + ' — ' + money(program.price * quantity) }), $buttons);
      $cartLines.append($line);
    });
    const totals = calculateCart(lines);
    $cartTotal.text(totals.quantity + ' session' + (totals.quantity === 1 ? '' : 's') +
      ' · estimated total ' + money(totals.price));
    $clear.prop('disabled', totals.quantity === 0);
    $finish.prop('disabled', totals.quantity === 0);
    return totals;
  }
  function hideConfirmation() {
    $confirmation.stop(true, true).fadeOut(120, function () {
      $confirmation.addClass('hidden');
    });
    $next.addClass('hidden');
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
    hideConfirmation();
    $feedback.text(quantity === 20 && (action === 'increase' || action === 'add')
      ? 'The estimate is limited to 20 sessions per program.'
      : action === 'remove' ? 'Program removed from the estimate.' : 'Estimate updated.');
    renderCart();
    return true;
  }

  $category.on('change', renderCatalogue);
  $sort.on('change', renderCatalogue);
  $resetFilters.on('click', function () {
    $category.val(''); $sort.val('default'); renderCatalogue(); $category.trigger('focus');
  });
  $toggleFilters.on('click', function () {
    $controls.stop(true, true).slideToggle(180, function () {
      const expanded = $controls.is(':visible');
      $toggleFilters.text(expanded ? 'Hide filters' : 'Show filters').attr('aria-expanded', String(expanded));
    });
  });
  $tableBody.on('click', 'button[data-add-program]', function () {
    const id = $(this).attr('data-add-program');
    const name = $(this).closest('tr').find('th').first().text();
    if (changeCart(id, 'add')) $feedback.text(name + ' added to the estimate.');
  });
  $tableBody.on('click', 'a[data-service]', function () {
    saveDraft({ ...readDraft(), service: $(this).attr('data-service') });
  });
  $cartLines.on('click', 'button[data-cart-action]', function () {
    changeCart($(this).attr('data-program'), $(this).attr('data-cart-action'));
  });
  $clear.on('click', function () {
    cart.clear(); currentReference = ''; hideConfirmation();
    $feedback.text('Estimate cleared.'); renderCart();
  });
  $finish.on('click', function () {
    const totals = calculateCart([...cart.entries()]);
    if (totals.quantity === 0) return;
    if (currentReference === '') currentReference = referenceNumber();
    const firstProgram = $cartLines.find('[data-cart-program]').filter(':first').attr('data-cart-program');
    saveDraft({ ...readDraft(), service: firstProgram });
    $next.attr('href', 'booking.html?service=' + encodeURIComponent(firstProgram) + '#booking-service');
    $confirmation.text(currentReference + ': demo estimate for ' + totals.quantity + ' session' +
      (totals.quantity === 1 ? '' : 's') + ', ' + money(totals.price) +
      '. Nothing was ordered, booked or paid for.');
    $confirmation.removeClass('hidden').hide().fadeIn(220);
    $next.removeClass('hidden');
    $feedback.text('Choose the link below to plan the first selected program.');
  });

  renderCatalogue();
  renderCart();
});
