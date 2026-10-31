(() => {
  'use strict';
  const { programs, trainers, element, readDraft } = window.Experience;
  trainers.forEach((trainer) => {
    const link = document.getElementById(`btn-book-${trainer.id}`);
    if (!link) return;
    const names = trainer.programs
      .map((id) => programs.find((program) => program.id === id)?.name)
      .filter(Boolean);
    const specialties = element('p', 'card-text small text-light', `Programs: ${names.join(', ')}. Illustrative specialties; confirm with the club.`);
    link.before(specialties);
  });
  const selectedTrainer = readDraft().trainer;
  if (selectedTrainer) {
    const selectedLink = document.getElementById(`btn-book-${selectedTrainer}`);
    if (selectedLink) selectedLink.closest('.trainer-card').classList.add('selected');
  }
})();
