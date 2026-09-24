import { steps, nextDeadline, formatTime } from './schedule.js';
const STORAGE_KEY = 'dough-reminder-bake-v1';

const title = document.querySelector('#next-title');
const instruction = document.querySelector('#instruction');
const countdown = document.querySelector('#countdown');
const due = document.querySelector('#due');
const action = document.querySelector('#action');
const reset = document.querySelector('#reset');
const schedule = document.querySelector('#schedule');
const notifications = document.querySelector('#notifications');
const notificationStatus = document.querySelector('#notification-status');

function load() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (value && Number.isInteger(value.index) && value.index >= 0 && value.index <= steps.length &&
        (value.deadline === null || Number.isFinite(value.deadline)) && typeof value.notified === 'boolean') return value;
  } catch { /* An invalid local record starts a fresh bake. */ }
  return null;
}
let bake = load();

function save() {
  if (bake) localStorage.setItem(STORAGE_KEY, JSON.stringify(bake));
  else localStorage.removeItem(STORAGE_KEY);
}


function showNotification(step) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const options = { body: step.instruction, icon: 'icon.svg', tag: 'dough-step', renotify: true };
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) return registration.showNotification(`Time to ${step.label.toLowerCase()}`, options);
      return new Notification(`Time to ${step.label.toLowerCase()}`, options);
    }).catch(() => new Notification(`Time to ${step.label.toLowerCase()}`, options));
  } else new Notification(`Time to ${step.label.toLowerCase()}`, options);
}

function renderSchedule() {
  schedule.replaceChildren();
  steps.forEach((step, index) => {
    const item = document.createElement('li');
    const duration = step.overnight ? 'Tomorrow at 8:00 AM' : step.manual ? 'When ready' : `${step.minutes} min after previous action`;
    item.textContent = `${step.label} · ${duration}`;
    if (bake && index < bake.index) item.className = 'complete';
    if (bake && index === bake.index) item.className = 'current';
    schedule.append(item);
  });
}

function tick() {
  const now = Date.now();
  if (!bake) {
    title.textContent = 'Start a bake';
    instruction.textContent = 'Start the autolyse when your dough is ready.';
    countdown.textContent = '30:00';
    due.textContent = '';
    action.textContent = 'Start autolyse';
    action.hidden = false;
    reset.hidden = true;
  } else if (bake.index === steps.length) {
    title.textContent = 'Bake complete';
    instruction.textContent = 'Enjoy your bread.';
    countdown.textContent = '✓';
    due.textContent = '';
    action.hidden = true;
    reset.hidden = false;
  } else {
    const step = steps[bake.index];
    title.textContent = step.label;
    instruction.textContent = step.instruction;
    action.textContent = `Done: ${step.label}`;
    action.hidden = false;
    reset.hidden = false;
    if (bake.deadline === null) {
      countdown.textContent = 'When ready';
      due.textContent = 'No timed reminder for this step.';
    } else {
      const remaining = bake.deadline - now;
      countdown.textContent = remaining <= 0 ? 'Time to act' : formatTime(remaining);
      due.textContent = `Due ${new Date(bake.deadline).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`;
      if (remaining <= 0 && !bake.notified && 'Notification' in window && Notification.permission === 'granted') {
        bake.notified = true;
        save();
        showNotification(step);
      }
    }
  }
  renderSchedule();
}

action.addEventListener('click', () => {
  const now = Date.now();
  if (!bake) bake = { index: 0, deadline: nextDeadline(steps[0], now), notified: false };
  else {
    bake.index++;
    bake.deadline = bake.index < steps.length ? nextDeadline(steps[bake.index], now) : null;
    bake.notified = false;
  }
  save();
  tick();
});
reset.addEventListener('click', () => {
  if (!confirm('Reset this bake and its countdown?')) return;
  bake = null;
  save();
  tick();
});

function updatePermission() {
  if (!('Notification' in window)) {
    notificationStatus.textContent = 'Notifications are not supported in this browser.';
    notifications.disabled = true;
  } else {
    notificationStatus.textContent = `Notification permission: ${Notification.permission}.`;
    notifications.disabled = Notification.permission === 'granted' || Notification.permission === 'denied';
  }
}
notifications.addEventListener('click', async () => {
  if (!('Notification' in window)) return;
  try { await Notification.requestPermission(); }
  catch { notificationStatus.textContent = 'Could not request notification permission.'; return; }
  updatePermission();
});

if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { updatePermission(); tick(); } });
updatePermission();
tick();
setInterval(tick, 1000);
