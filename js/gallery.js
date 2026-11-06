$(function () {
  'use strict';
  const $previews = $('#gallery-grid .gallery-preview');
  const $dialog = $('#gallery-modal');
  const $image = $('#modal-image');
  const $caption = $('#modal-caption');
  let current = 0;
  let $opener = null;

  $previews.prop('disabled', false);
  const $galleryStatus = $('<p>', { class: 'mt-3', role: 'status',
    text: `${$previews.length} club photographs. Select one to preview, then use Previous or Next.` });
  $('#gallery-results').append($galleryStatus);

  function showPhoto(index) {
    current = (index + $previews.length) % $previews.length;
    const $button = $previews.eq(current);
    $image.attr('src', $button.attr('data-image'))
      .attr('alt', $button.find('img').attr('alt'));
    $caption.text(`${$button.closest('article').find('h3').text()} · ${current + 1} of ${$previews.length}`);
    $galleryStatus.text(`Viewing photograph ${current + 1} of ${$previews.length}.`);
  }

  $previews.on('click', function () {
    $opener = $(this);
    showPhoto($previews.index(this));
    $dialog[0].showModal();
  });
  $('#previous-image-btn').on('click', function () { showPhoto(current - 1); });
  $('#next-image-btn').on('click', function () { showPhoto(current + 1); });
  $dialog.on('keydown', function (event) {
    if (event.key === 'ArrowLeft') { event.preventDefault(); showPhoto(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); showPhoto(current + 1); }
  });
  $dialog.on('close', function () { if ($opener) $opener.trigger('focus'); });
});
