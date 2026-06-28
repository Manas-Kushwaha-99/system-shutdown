const { invoke } = window.__TAURI__.core;
const { getCurrentWindow } = window.__TAURI__.window;

const hoursInput = document.getElementById('hoursInput');
const minutesInput = document.getElementById('minutesInput');
const specificTimeInput = document.getElementById('specificTimeInput');
const startBtn = document.getElementById('startBtn');
const cancelBtn = document.getElementById('cancelBtn');
const mainView = document.getElementById('mainView');
const timerView = document.getElementById('timerView');
const countdownText = document.getElementById('countdownText');
const targetTimeText = document.getElementById('targetTimeText');
const toast = document.getElementById('toast');
const minimizeBtn = document.getElementById('minimizeBtn');
const closeBtn = document.getElementById('closeBtn');

let countdownInterval = null;
let targetTime = null;

const appWindow = getCurrentWindow();

minimizeBtn.addEventListener('click', () => appWindow.minimize());
closeBtn.addEventListener('click', () => appWindow.close());

document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const totalMinutes = parseInt(btn.dataset.minutes);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    hoursInput.value = hours || '';
    minutesInput.value = minutes || '';
    specificTimeInput.value = '';
  });
});

startBtn.addEventListener('click', startTimer);
cancelBtn.addEventListener('click', cancelShutdown);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && countdownInterval) cancelShutdown();
  if (e.key === 'Enter' && !countdownInterval) startTimer();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

async function startTimer() {
  const hours = parseInt(hoursInput.value) || 0;
  const minutes = parseInt(minutesInput.value) || 0;
  const specificTime = specificTimeInput.value;

  let totalSeconds = 0;

  if (specificTime) {
    const [h, m] = specificTime.split(':').map(Number);
    const now = new Date();
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);
    totalSeconds = Math.floor((target - now) / 1000);
    targetTime = target;
  } else if (hours > 0 || minutes > 0) {
    totalSeconds = (hours * 60 + minutes) * 60;
    targetTime = new Date(Date.now() + totalSeconds * 1000);
  } else {
    showToast('Please enter a time value');
    return;
  }

  if (totalSeconds <= 0) {
    showToast('Time must be greater than 0');
    return;
  }

  try {
    await invoke('schedule_shutdown', { seconds: totalSeconds });
    showToast(`Shutdown scheduled in ${formatDuration(totalSeconds)}`);
    showTimerView();
    startCountdown();
  } catch (err) {
    showToast(`Error: ${err}`);
  }
}

function showTimerView() {
  mainView.classList.add('hidden');
  timerView.classList.add('active');
  if (targetTime) {
    targetTimeText.textContent = `Shuts down at ${targetTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

function showMainView() {
  timerView.classList.remove('active');
  mainView.classList.remove('hidden');
}

function startCountdown() {
  if (countdownInterval) clearInterval(countdownInterval);

  const update = () => {
    const remaining = targetTime - Date.now();
    if (remaining <= 0) {
      clearInterval(countdownInterval);
      countdownText.textContent = 'SHUTTING DOWN';
      return;
    }
    countdownText.textContent = formatCountdown(remaining);
  };

  update();
  countdownInterval = setInterval(update, 1000);
}

async function cancelShutdown() {
  try {
    await invoke('cancel_shutdown');
    showToast('Shutdown cancelled');
  } catch (err) {
    showToast(`Cancel failed: ${err}`);
  }

  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }

  showMainView();
  clearInputs();
}

function clearInputs() {
  hoursInput.value = '';
  minutesInput.value = '';
  specificTimeInput.value = '';
  countdownText.textContent = '00:00:00';
  targetTimeText.textContent = '';
}
