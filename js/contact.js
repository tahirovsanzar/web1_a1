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
  const membershipPreviews = [];
  let lastFeedbackSignature = '';

  const $phoneWrapper = $('<div>', { class: 'mb-3' });
  const $phone = $('<input>', { id: 'contact-phone', name: 'phone', type: 'tel',
    class: 'form-control', autocomplete: 'tel-national', placeholder: '00 123 45 67', inputmode: 'numeric', maxlength: '12',
    'aria-describedby': 'contact-phone-error' }).prop('required', true);
  const $phoneGroup = $('<div>', { class: 'input-group' }).append(
    $('<span>', { class: 'input-group-text', text: '+7 7' }), $phone
  );
  const $phoneError = $('<p>', { id: 'contact-phone-error', class: 'error hidden small mt-1',
    text: 'Enter a Kazakhstan phone number, for example +7 700 123 45 67.' });
  $phoneWrapper.append(
    $('<label>', { class: 'form-label text-light', for: 'contact-phone', text: 'Phone Number' }),
    $phoneGroup, $phoneError
  );
  $fields.email.parent().after($phoneWrapper);
  $fields.phone = $phone;
  $phone.on('input', function () {
    const digits = String($phone.val() || '').replace(/\D/g, '').slice(0, 9);
    $phone.val([digits.slice(0, 2), digits.slice(2, 5), digits.slice(5, 7), digits.slice(7, 9)].filter(Boolean).join(' '));
  });

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
  const $membershipSection = $('<section>', { id: 'membership-previews', class: 'mt-5' });
  const $membershipList = $('<div>', { class: 'row g-3', 'aria-live': 'polite' });
  $membershipSection.append(
    $('<h2>', { class: 'h4 text-danger', text: 'Membership inquiry previews' }),
    $('<p>', { text: 'Previews remain on this page only. No inquiry is sent to the club.' }),
    $membershipList
  );
  $reviewSection.after($membershipSection);

  function renderMembershipPreviews() {
    $membershipList.empty();
    if (!membershipPreviews.length) {
      $membershipList.append($('<p>', { class: 'text-danger', text: 'No membership inquiry previews yet.' }));
      return;
    }
    membershipPreviews.forEach((preview, index) => {
      const $card = $('<article>', { class: 'card bg-black border-danger h-100 p-3' }).append(
        $('<h3>', { class: 'h5 text-danger', text: 'Membership prices inquiry' }),
        $('<p>', { class: 'small', text: 'Anonymous preview · ' + preview.date }),
        $('<button>', { type: 'button', class: 'btn btn-outline-danger btn-sm mt-auto', text: 'Remove preview' })
          .attr('data-remove-membership', String(index))
      );
      $membershipList.append($('<div>', { class: 'col-12 col-md-6' }).append($card));
    });
  }

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
      return /^[\d\s]+$/.test(value) && /^\d{9}$/.test(digits)
        ? '' : 'Enter the remaining 9 digits after +7 7.';
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
      $('<h3>', { class: 'h5 text-danger', text: 'Anonymous feedback' }),
      $('<p>', { class: 'small', text: 'Feedback · ' + review.rating + '/5 · ' + review.date }),
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
    const lines = ['Subject: ' + $fields.subject.find('option:selected').text()];
    if ($fields.subject.val() === 'feedback') {
      lines.push('Rating: ' + $rating.val() + '/5');
      if ($fields.visits.val()) lines.push('Visits: ' + $fields.visits.find('option:selected').text());
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
        reviews.push({ rating: $rating.val(), date: new Date().toLocaleString('en-GB') });
        lastFeedbackSignature = signature;
        renderReviews();
      }
    }
    if ($fields.subject.val() === 'membership') {
      membershipPreviews.push({ date: new Date().toLocaleString('en-GB') });
      renderMembershipPreviews();
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
  $membershipList.on('click', 'button[data-remove-membership]', function () {
    membershipPreviews.splice(Number($(this).attr('data-remove-membership')), 1);
    renderMembershipPreviews();
  });
  showSubjectFields(false);
  renderReviews();
  renderMembershipPreviews();
});
