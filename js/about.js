$(function () {
  'use strict';
  const { readDraft, saveDraft } = window.Experience;
  const locations = [
    { id: 'imanbayeva', label: 'Sholpan Imanbayeva Street 8/2' },
    { id: 'asfendiyarov', label: 'Sanjar Asfendiyarov Street 6' }
  ];
  const $section = $('#locations');
  const $cards = $section.find('article');
  const mapSearches = {
    imanbayeva: 'Experience Fitness, Sholpan Imanbayeva Street 8/2, Astana',
    asfendiyarov: 'Experience Fitness, Sanjar Asfendiyarov Street 6, Astana'
  };

  const $status = $('<p>', { id: 'branch-selection-status', class: 'mt-3', role: 'status',
    text: 'Choose a branch to carry it into the visit planner.' });
  const $next = $('<a>', { id: 'branch-selection-next', class: 'btn btn-danger mt-2 hidden',
    href: 'booking.html#booking-location', text: 'Continue with selected branch' });
  $section.append($status, $next);

  $cards.each(function (index) {
    const location = locations[index];
    if (!location) return;
    $(this).find('a[id^="map-"]').attr(
      'href',
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapSearches[location.id])
    );
    $('<button>', { type: 'button', class: 'btn btn-outline-danger ms-2 mt-2',
      text: 'Choose ' + location.label.split(' Street')[0] })
      .attr('data-location', location.id)
      .appendTo($(this));
  });

  function chooseBranch(id, $clickedButton) {
    const choice = locations.find((location) => location.id === id);
    if (!choice) return null;

    if ($clickedButton && $clickedButton.length) {
      $clickedButton.closest('article').addClass('selected')
        .parent().siblings().find('article').removeClass('selected');
    } else {
      $cards.each(function (index) {
        $(this).toggleClass('selected', locations[index].id === id);
      });
    }

    saveDraft({ ...readDraft(), location: id });
    $next.attr('href', 'booking.html?location=' + encodeURIComponent(id) + '#booking-location');
    if ($next.hasClass('hidden')) $next.removeClass('hidden').hide().slideDown(180);
    $status.stop(true, true).fadeOut(120, function () {
      $status.text(choice.label + ' selected for your visit plan. Confirm hours and availability with the branch.')
        .fadeIn(180);
    });
    return choice;
  }

  $section.on('click', 'button[data-location]', function () {
    chooseBranch($(this).attr('data-location'), $(this));
  });

  const savedLocation = readDraft().location;
  if (locations.some((location) => location.id === savedLocation)) {
    chooseBranch(savedLocation);
  }
});
