(() => {
'use strict';
const { element, readDraft, saveDraft } = window.Experience;
const locations = [
  { id: 'imanbayeva', label: 'Sholpan Imanbayeva Street 8/2' },
  { id: 'asfendiyarov', label: 'Sanjar Asfendiyarov Street 6' }
];
const section = document.getElementById('locations');
const cards = [...section.querySelectorAll('article')];
const mapSearches = {
  imanbayeva: 'Experience Fitness, Sholpan Imanbayeva Street 8/2, Astana',
  asfendiyarov: 'Experience Fitness, Sanjar Asfendiyarov Street 6, Astana'
};
locations.forEach((location) => {
  const link = document.getElementById(`map-${location.id}`);
  link.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapSearches[location.id])}`;
});
const status = element('p', 'mt-3', 'Choose a branch to carry it into the visit planner.');
status.id = 'branch-selection-status'; status.setAttribute('role', 'status');
const next = element('a', 'btn btn-danger mt-2 hidden', 'Continue with selected branch');
next.href = 'booking.html#booking-location'; next.id = 'branch-selection-next';
section.append(status, next);
function chooseBranch(id) {
  const choice = locations.find((location) => location.id === id);
  if (!choice) return null;
  cards.forEach((card, index) => card.classList.toggle('selected', locations[index].id === id));
  saveDraft({ ...readDraft(), location: id });
  status.textContent = `${choice.label} selected for your visit plan. Confirm hours and availability with the branch.`;
  next.href = `booking.html?location=${encodeURIComponent(id)}#booking-location`;
  next.classList.remove('hidden');
  return choice;
}
locations.forEach((location, index) => {
  const button = element('button', 'btn btn-outline-danger ms-2 mt-2', `Choose ${location.label.split(' Street')[0]}`);
  button.type = 'button'; button.dataset.location = location.id;
  cards[index].append(button);
  button.addEventListener('click', () => chooseBranch(location.id));
});
if (locations.some((location) => location.id === readDraft().location)) chooseBranch(readDraft().location);
})();
