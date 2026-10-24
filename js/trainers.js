(() => {
'use strict';
const { readDraft } = window.Experience;
const selectedTrainer = readDraft().trainer;
if (selectedTrainer) {
  const selectedLink = document.getElementById(`btn-book-${selectedTrainer}`);
  if (selectedLink) selectedLink.closest('.trainer-card').classList.add('selected');
}
})();
