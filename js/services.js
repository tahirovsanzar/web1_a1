$(function () {
  'use strict';
  const { programs, money, readDraft, saveDraft } = window.Experience;
  const $priceSection = $('#price-list');
  const $tableBody = $priceSection.find('tbody');
  const $results = $('#services-results');
  const cart = new Map();

  const $toggleFilters = $('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm mb-3',
    text: 'Hide filters', 'aria-controls': 'program-controls', 'aria-expanded': 'true' });
  const $controls = $('<div>', { id: 'program-controls', class: 'bg-black border border-danger rounded p-3 mb-3' });
  const $category = $('<select>', { id: 'program-category', class: 'form-select' });
  $category.append($('<option>', { value: '', text: 'All categories' }));
  [...new Set(programs.map((program) => program.category))].sort().forEach((name) => {
    $category.append($('<option>', { value: name, text: name }));
  });
  const $resetFilters = $('<button>', { id: 'program-reset', type: 'button',
    class: 'btn btn-outline-danger btn-sm', text: 'Reset filters' });
  const goals = [
    { label: 'All programs', category: '' },
    { label: 'Build strength', category: 'Strength' },
    { label: 'Improve flexibility', category: 'Mobility' },
    { label: 'Learn fighting', category: 'Combat' },
    { label: 'Dance', category: 'Dance' }
  ];
  const $goals = $('<div>', { class: 'd-flex flex-wrap gap-2 mb-3', role: 'group', 'aria-label': 'Choose a training goal' });
  goals.forEach((goal) => {
    $goals.append($('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm', text: goal.label,
      'aria-pressed': String(goal.category === '') }).attr('data-goal-category', goal.category));
  });
  $controls.append($('<p>', { class: 'mb-2', text: 'Choose your training goal' }), $goals);
  $controls.append($resetFilters);
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
  function matchingPrograms(chosenCategory) {
    const matches = programs.filter((program) => chosenCategory === '' || program.category === chosenCategory);
    return matches;
  }
  function renderCatalogue() {
    const matches = matchingPrograms($category.val());
    $tableBody.empty();
    matches.forEach((program) => $tableBody.append(renderProgramRow(program)));
    $empty.toggleClass('hidden', matches.length !== 0);
    return matches.length;
  }

  const $cartPanel = $('<section>', { id: 'service-plan', class: 'bg-black border border-danger rounded p-4 mt-4' });
  const $cartLines = $('<div>', { id: 'cart-lines', 'aria-live': 'polite' });
  const $cartTotal = $('<p>', { id: 'cart-total', class: 'fw-bold mt-3', role: 'status' });
  const $clear = $('<button>', { id: 'cart-clear', type: 'button', class: 'btn btn-outline-danger', text: 'Clear plan' });
  const $feedback = $('<p>', { id: 'cart-feedback', class: 'mt-3', role: 'status' });
  const $note = $('<p>', { class: 'small' });
  $note.html('<strong>Indicative prices only.</strong> This is a demonstration estimate, not a purchase or reservation.');
  $cartPanel.append(
    $('<h3>', { class: 'h4 text-danger', text: 'Session estimate' }),
    $note, $cartLines, $cartTotal,
    $('<div>', { class: 'd-flex flex-wrap gap-2' }).append($clear),
    $feedback
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
        $('<input>', { type: 'number', class: 'form-control form-control-sm w-auto', min: '1', max: '20', step: '1', value: quantity,
          'aria-label': 'Sessions for ' + program.name }).attr('data-cart-quantity', id),
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
    $feedback.text(quantity === 20 && (action === 'increase' || action === 'add')
      ? 'The estimate is limited to 20 sessions per program.'
      : action === 'remove' ? 'Program removed from the estimate.' : 'Estimate updated.');
    renderCart();
    return true;
  }

  function updateGoalSelection() {
    $goals.find('button').each(function () {
      const selected = $(this).attr('data-goal-category') === $category.val();
      $(this).toggleClass('active', selected).attr('aria-pressed', String(selected));
    });
  }
  $goals.on('click', 'button[data-goal-category]', function () {
    $category.val($(this).attr('data-goal-category')).trigger('change');
  });
  $category.on('change', function () { updateGoalSelection(); renderCatalogue(); });
  $resetFilters.on('click', function () {
    $category.val(''); updateGoalSelection(); renderCatalogue(); $goals.find('button').first().trigger('focus');
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
  $cartLines.on('change', 'input[data-cart-quantity]', function () {
    const id = $(this).attr('data-cart-quantity');
    const raw = String($(this).val()).trim();
    const quantity = Number(raw);
    if (!/^\d+$/.test(raw) || quantity < 1 || quantity > 20) {
      $(this).val(cart.get(id));
      $feedback.text('Enter a whole number from 1 to 20 sessions.');
      return;
    }
    cart.set(id, quantity);
    $feedback.text('Estimate updated.');
    renderCart();
    $cartLines.find('input[data-cart-quantity]').filter(function () { return $(this).attr('data-cart-quantity') === id; }).trigger('focus');
  });
  $clear.on('click', function () {
    cart.clear();
    $feedback.text('Estimate cleared.'); renderCart();
  });

  updateGoalSelection();
  renderCatalogue();
  renderCart();
});
