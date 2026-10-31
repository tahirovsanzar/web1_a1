$(function () {
  'use strict';
  const $form = $('#contact-form');
  $form.prop('noValidate', true);

  const $fields = {
    name: $('#contact-name'),
    email: $('#contact-email'),
    subject: $('#contact-subject'),
    visits: $('#contact-visits'),
    message: $('#contact-message')
  };
  const $visitWrapper = $('#feedback-visits-container');
  const $status = $('#contact-status');
  const $errors = $('#contact-errors');
  const $summary = $('#contact-summary');
  const $success = $('#contact-success');
  const reviews = [];
  let lastFeedbackSignature = '';

  const $phoneWrapper = $('<div>', { class: 'mb-3' });
  const $phone = $('<input>', { id: 'contact-phone', name: 'phone', type: 'tel',
    class: 'form-control', autocomplete: 'tel', placeholder: '+7 700 123 45 67',
    'aria-describedby': 'contact-phone-error' }).prop('required', true);
  const $phoneError = $('<p>', { id: 'contact-phone-error', class: 'error hidden small mt-1',
    text: 'Enter a Kazakhstan phone number, for example +7 700 123 45 67.' });
  $phoneWrapper.append(
    $('<label>', { class: 'form-label text-light', for: 'contact-phone', text: 'Phone Number' }),
    $phone, $phoneError
  );
  $fields.email.parent().after($phoneWrapper);
  $fields.phone = $phone;

  const $ratingWrapper = $('<div>', { class: 'mb-3 hidden' });
  const $rating = $('<select>', { id: 'contact-rating', name: 'rating', class: 'form-select',
    'aria-describedby': 'contact-rating-error' });
  $rating.append($('<option>', { value: '', text: 'Choose a rating...' }));
  for (let score = 1; score <= 5; score += 1) {
    $rating.append($('<option>', { value: String(score), text: score + ' of 5' }));
  }
  const $ratingError = $('<p>', { id: 'contact-rating-error', class: 'error hidden small mt-1',
    text: 'Choose a 1–5 rating for feedback.' });
  $ratingWrapper.append(
    $('<label>', { class: 'form-label', for: 'contact-rating', text: 'Visit rating (1–5)' }),
    $rating, $ratingError
  );
  $visitWrapper.after($ratingWrapper);
  $fields.rating = $rating;

  const $counter = $('<p>', { id: 'contact-character-count', class: 'form-text text-light',
    role: 'status', text: '0 / 2,000 characters' });
  $fields.message.after($counter);
  const $reviewSection = $('<section>', { id: 'feedback-previews', class: 'mt-5' });
  const $reviewList = $('<div>', { id: 'feedback-list', class: 'row g-3' });
  $reviewSection.append(
    $('<h2>', { class: 'h4 text-danger', text: 'Feedback previews' }),
    $('<p>', { text: 'These examples stay on this page only. They are not published or sent to the club.' }),
    $reviewList
  );
  $form.after($reviewSection);

  function showSubjectFields(animate) {
    const feedback = $fields.subject.val() === 'feedback';
    [$visitWrapper, $ratingWrapper].forEach(($wrapper) => {
      $wrapper.stop(true, true);
      if (!animate) {
        $wrapper.toggleClass('hidden', !feedback);
      } else if (feedback) {
        $wrapper.removeClass('hidden').hide().slideDown(180);
      } else {
        $wrapper.slideUp(180, function () { $wrapper.addClass('hidden'); });
      }
    });
    if (!feedback) {
      $fields.visits.val('');
      $rating.val('');
      $ratingError.addClass('hidden');
      $rating.removeClass('error success');
    }
  }

  function checkField(key) {
    const value = String($fields[key].val() || '').trim();
    if (key === 'name') return value.length >= 2 ? '' : 'Enter your name with at least 2 characters.';
    if (key === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? '' : 'Enter a valid email address.';
    if (key === 'phone') {
      const digits = value.replace(/\D/g, '');
      return /^[+()\d\s-]+$/.test(value) && /^[78]\d{10}$/.test(digits)
        ? '' : 'Enter a Kazakhstan phone number with 11 digits.';
    }
    if (key === 'subject') return ['membership', 'feedback', 'other'].includes(value) ? '' : 'Choose a subject.';
    if (key === 'visits') return value === '' || ['0', '1', '2-5', '6+'].includes(value) ? '' : 'Choose a listed visit count.';
    if (key === 'rating') return $fields.subject.val() !== 'feedback' || /^[1-5]$/.test(value)
      ? '' : 'Choose a rating for feedback.';
    if (key === 'message') return value.length >= 10 && value.length <= 2000
      ? '' : 'Write a message between 10 and 2,000 characters.';
    return '';
  }

  function markField(key) {
    const $field = $fields[key];
    const $error = $('#contact-' + key + '-error');
    const message = checkField(key);
    const invalid = message !== '';
    $field.toggleClass('error', invalid)
      .toggleClass('success', !invalid && String($field.val() || '').trim() !== '')
      .attr('aria-invalid', String(invalid));
    $error.text(message).toggleClass('hidden', !invalid);
    return !invalid;
  }
  function renderReview(review, index) {
    const $card = $('<article>', { class: 'card bg-black border-danger h-100 p-3' }).append(
      $('<h3>', { class: 'h5 text-danger', text: review.name }),
      $('<p>', { class: 'small', text: 'Feedback · ' + review.rating + '/5 · ' + review.date }),
      $('<p>', { text: review.message }),
      $('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm mt-auto',
        text: 'Remove preview' }).attr('data-remove-review', String(index))
    );
    return $('<div>', { class: 'col-12 col-md-6' }).append($card);
  }
  function renderReviews() {
    $reviewList.empty();
    if (reviews.length === 0) {
      $reviewList.append($('<p>', { class: 'text-danger',
        text: 'No feedback previews yet. Select Feedback above to add one.' }));
      return;
    }
    reviews.forEach((review, index) => $reviewList.append(renderReview(review, index)));
  }
  function renderSummary() {
    const lines = [
      'Name: ' + $fields.name.val().trim(),
      'Email: ' + $fields.email.val().trim(),
      'Phone: ' + $fields.phone.val().trim(),
      'Subject: ' + $fields.subject.find('option:selected').text(),
      'Message: ' + $fields.message.val().trim()
    ];
    if ($fields.subject.val() === 'feedback') {
      lines.splice(4, 0, 'Rating: ' + $rating.val() + '/5');
      if ($fields.visits.val() !== '') lines.splice(5, 0,
        'Visits: ' + $fields.visits.find('option:selected').text());
    }
    $summary.empty();
    lines.forEach((line) => $summary.append($('<p>', { class: 'mb-1', text: line })));
  }

  $fields.subject.on('change', function () {
    showSubjectFields(true);
    $success.addClass('hidden');
  });
  Object.entries($fields).forEach(([key, $field]) => {
    $field.on($field.is('select') ? 'change' : 'input', function () {
      if (key === 'message') $counter.text(String($(this).val()).length + ' / 2,000 characters');
      if (!$('#contact-' + key + '-error').hasClass('hidden')) markField(key);
      if (!$success.hasClass('hidden')) {
        $success.stop(true, true).fadeOut(120, function () { $success.addClass('hidden'); });
        $status.text('Draft edited. Review again when ready.');
      }
      $errors.text('');
    });
  });

  $form.on('submit', function (event) {
    event.preventDefault();
    const keys = ['name', 'email', 'phone', 'subject', 'visits', 'rating', 'message'];
    const invalid = keys.filter((key) => !markField(key));
    if (invalid.length > 0) {
      $status.text('The draft needs correction before review.');
      $errors.text('Please correct ' + invalid.length + ' highlighted field' +
        (invalid.length === 1 ? '' : 's') + '.');
      $success.addClass('hidden');
      $fields[invalid[0]].trigger('focus');
      return;
    }
    $errors.text('');
    renderSummary();
    $status.text('Draft reviewed. No data was sent to a server; no message or public review was created.');
    if ($fields.subject.val() === 'feedback') {
      const signature = [$fields.name.val().trim(), $rating.val(), $fields.message.val().trim()].join('|');
      if (signature !== lastFeedbackSignature) {
        reviews.push({ name: $fields.name.val().trim(), message: $fields.message.val().trim(),
          rating: $rating.val(), date: new Date().toLocaleString('en-GB') });
        lastFeedbackSignature = signature;
        renderReviews();
      }
    }
    $success.removeClass('hidden').hide().fadeIn(220);
    $form.trigger('reset');
    Object.values($fields).forEach(($field) => $field.removeClass('error success').removeAttr('aria-invalid'));
    $form.find('p[id$="-error"]').addClass('hidden');
    $counter.text('0 / 2,000 characters');
    showSubjectFields(false);
  });

  $reviewList.on('click', 'button[data-remove-review]', function () {
    reviews.splice(Number($(this).attr('data-remove-review')), 1);
    lastFeedbackSignature = '';
    renderReviews();
    $status.text('Feedback preview removed. No public review was affected.');
  });
  showSubjectFields(false);
  renderReviews();
});
