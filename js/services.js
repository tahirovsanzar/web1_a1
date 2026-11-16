$(function () {
  'use strict';
  const { programs, money, readDraft, saveDraft } = window.Experience;
  const $priceSection = $('#price-list');
  const $tableBody = $priceSection.find('tbody');

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
    const $plan = $('<a>', { class: 'btn btn-danger btn-sm mb-1', text: 'Plan visit',
      href: 'booking.html?service=' + encodeURIComponent(program.id) + '#booking-service',
      'aria-label': 'Plan a ' + program.name + ' visit' })
      .attr('data-service', program.id);
    $action.append($plan);
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
  $tableBody.on('click', 'a[data-service]', function () {
    saveDraft({ ...readDraft(), service: $(this).attr('data-service') });
  });
  updateGoalSelection();
  renderCatalogue();
});
