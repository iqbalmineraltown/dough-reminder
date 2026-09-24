export const steps = [
  { label: 'Finish autolyse', instruction: 'Mix in the starter and salt.', minutes: 30 },
  { label: 'Stretch & fold 1', instruction: 'Stretch and fold the dough.', minutes: 30 },
  { label: 'Stretch & fold 2', instruction: 'Stretch and fold the dough.', minutes: 30 },
  { label: 'Stretch & fold 3', instruction: 'Stretch and fold the dough.', minutes: 30 },
  { label: 'Stretch & fold 4', instruction: 'Stretch and fold the dough.', minutes: 30 },
  { label: 'End bulk fermentation', instruction: 'Shape the dough and put it in the fridge.', minutes: 120 },
  { label: 'Remove from fridge', instruction: 'Check the dough and prepare to bake.', overnight: true },
  { label: 'Finish bake', instruction: 'Mark the bake complete when the bread is out of the oven.', manual: true }
];

export function nextDeadline(step, now) {
  if (step.manual) return null;
  if (step.overnight) {
    const morning = new Date(now);
    morning.setDate(morning.getDate() + 1);
    morning.setHours(8, 0, 0, 0);
    return morning.getTime();
  }
  return now + step.minutes * 60_000;
}

export function formatTime(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return hours ? `${hours}h ${String(minutes).padStart(2, '0')}m` : `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
