$(function () {
  'use strict';
  const { readDraft, saveDraft } = window.Experience;
  const locations = [
    { id: 'imanbayeva', label: 'Sholpan Imanbayeva Street 8/2' },
    { id: 'asfendiyarov', label: 'Sanjar Asfendiyarov Street 6' }
  ];
  const $section = $('#locations');
  const $cards = $section.find('article');
  const $hoursStatus = $('<p>', { class: 'mt-3 mb-0', role: 'status' });
  $('#schedule dl').after($hoursStatus);
  function updateHoursStatus() {
    const astana = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const day = astana.getUTCDay();
    const minutes = astana.getUTCHours() * 60 + astana.getUTCMinutes();
    const start = day === 6 ? 9 * 60 : 7 * 60;
    const end = day === 6 ? 22 * 60 : 23 * 60;
    const open = day !== 0 && minutes >= start && minutes < end;
    $hoursStatus.text(open ? 'Currently open (Astana time).' : 'Currently closed (Astana time).');
  }
  updateHoursStatus();
  window.setInterval(updateHoursStatus, 60000);
  const mapSearches = {
    imanbayeva: 'Experience Fitness, Sholpan Imanbayeva Street 8/2, Astana',
    asfendiyarov: 'Experience Fitness, Sanjar Asfendiyarov Street 6, Astana'
  };

  $cards.each(function (index) {
    const location = locations[index];
    if (!location) return;
    const $card = $(this).addClass('d-flex flex-column');
    const $actions = $('<div>', { class: 'mt-auto pt-2 d-flex flex-wrap gap-2' });
    $card.find('a[id^="map-"]').attr(
      'href',
      'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(mapSearches[location.id])
    ).appendTo($actions);
    $('<a>', { href: 'booking.html?location=' + encodeURIComponent(location.id) + '#booking-location',
      class: 'btn btn-outline-danger', text: 'Choose ' + location.label.split(' Street')[0] })
      .attr('data-location', location.id)
      .appendTo($actions);
    $card.append($actions);
  });

  $section.on('click', 'a[data-location]', function () {
    saveDraft({ ...readDraft(), location: $(this).attr('data-location') });
  });
});
