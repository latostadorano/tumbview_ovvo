const API_KEY = 'UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ';
const LIMIT = 50;

let blog = 'toust';
let offset = 0;
let photoList = [];   // [{ url, postUrl }]
let shown = new Set();
let history = [];
let histPos = -1;
let currentPostUrl = '';
let timeImg = 10;
let timer = null;
let isPlaying = false;

const foto    = document.getElementById('foto');
const ui      = document.getElementById('ui');
const blogInput = document.getElementById('blog');
const timeInput = document.getElementById('time');
const goBtn   = document.getElementById('go');
const playBtn = document.getElementById('play');
const linkBtn = document.getElementById('link');

// ── UI visibility ────────────────────────────────────────
let hideTimer;

function showUI() {
  ui.classList.add('visible');
  document.body.classList.add('ui-visible');
  clearTimeout(hideTimer);
  if (isPlaying) {
    hideTimer = setTimeout(hideUI, 3000);
  }
}

function hideUI() {
  ui.classList.remove('visible');
  document.body.classList.remove('ui-visible');
}

document.addEventListener('mousemove', showUI);
document.addEventListener('keydown', showUI);
showUI();

// ── Controls ─────────────────────────────────────────────
goBtn.addEventListener('click', async () => {
  blog = blogInput.value.trim() || 'toust';
  timeImg = parseInt(timeInput.value) || 10;
  goBtn.textContent = '...';
  goBtn.disabled = true;
  reset();
  await fetchPhotos();
  goBtn.textContent = 'Go';
  goBtn.disabled = false;
  if (photoList.length > 0) {
    playBtn.disabled = false;
    linkBtn.disabled = false;
    startSlideshow();
  }
});

playBtn.addEventListener('click', togglePlay);

linkBtn.addEventListener('click', () => {
  if (currentPostUrl) window.open(currentPostUrl, '_blank');
});

// ── Keyboard / click ─────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.code === 'Enter')      { e.preventDefault(); goBtn.click(); }
  if (e.code === 'Space' || e.code === 'ArrowRight') { e.preventDefault(); next(); }
  if (e.code === 'ArrowLeft')  { e.preventDefault(); prev(); }
});

foto.style.cursor = 'pointer';
foto.addEventListener('click', next);

// ── Data ─────────────────────────────────────────────────
function reset() {
  photoList = [];
  shown.clear();
  history = [];
  histPos = -1;
  offset = 0;
}

async function fetchPhotos() {
  const url = `https://api.tumblr.com/v2/blog/${blog}.tumblr.com/posts/photo` +
    `?api_key=${API_KEY}&offset=${offset * LIMIT}&limit=${LIMIT}&npf=false`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    data.response.posts
      .filter(p => p.type === 'photo')
      .forEach(p => p.photos.forEach(ph => {
        photoList.push({ url: ph.original_size.url, postUrl: p.post_url });
      }));
    console.log(`${blog}: ${photoList.length} photos loaded (offset ${offset})`);
  } catch (err) {
    console.error('Tumblr API error:', err);
    goBtn.textContent = 'Error — retry';
  }
}

function randomUnshown() {
  const pool = photoList.map((_, i) => i).filter(i => !shown.has(i));
  if (pool.length === 0) return -1;
  return pool[Math.floor(Math.random() * pool.length)];
}

function showPhoto(idx) {
  if (idx < 0 || idx >= photoList.length) return;
  const p = photoList[idx];
  foto.src = p.url;
  currentPostUrl = p.postUrl;
  foto.style.visibility = 'visible';
}

// ── Playback ─────────────────────────────────────────────
async function next() {
  let idx = randomUnshown();
  if (idx === -1) {
    // all photos seen — fetch next page
    offset++;
    await fetchPhotos();
    shown.clear();
    idx = randomUnshown();
  }
  if (idx === -1) return;
  shown.add(idx);
  history.push(idx);
  histPos = history.length - 1;
  showPhoto(idx);
  if (isPlaying) scheduleNext();
}

function prev() {
  if (histPos > 0) {
    histPos--;
    showPhoto(history[histPos]);
    if (isPlaying) scheduleNext();
  }
}

function startSlideshow() {
  isPlaying = true;
  playBtn.textContent = '⏸';
  next();
  scheduleNext();
  hideTimer = setTimeout(hideUI, 3000);
}

function scheduleNext() {
  clearInterval(timer);
  if (isPlaying) {
    timer = setInterval(() => next(), timeImg * 1000);
  }
}

function togglePlay() {
  if (isPlaying) {
    isPlaying = false;
    clearInterval(timer);
    playBtn.textContent = '▶';
    showUI();
  } else {
    isPlaying = true;
    playBtn.textContent = '⏸';
    scheduleNext();
    hideTimer = setTimeout(hideUI, 3000);
  }
}
