const API_KEY = 'UxXCR2GAdx9idhSiONYzaYl8SIViskisNfj0NGyRmAPbqhXKnQ';
const LIMIT   = 50;

// ── State ─────────────────────────────────────────────────
let blogs    = ['toust', 'colorfulgradients'];
let blogIdx  = 0;
let blog     = blogs[0];
let offset   = 0;
let photoList = [];
let shown    = new Set();
let blogExhausted = false;
let history  = [];
let histPos  = -1;
let currentPostUrl = '';
let timeImg  = 10;
let timer    = null;          // setInterval para modo manual
let isPlaying = false;
let timerSource = 'manual';   // 'manual' | 'tab' | 'audio'

// ── Elements ──────────────────────────────────────────────
const foto               = document.getElementById('foto');
const ui                 = document.getElementById('ui');
const blogInput          = document.getElementById('blog');
const timeInput          = document.getElementById('time');
const goBtn              = document.getElementById('go');
const playBtn            = document.getElementById('play');
const linkBtn            = document.getElementById('link');
const fsBtn              = document.getElementById('fs-btn');
const menuBtn            = document.getElementById('menu-btn');
const menuPanel          = document.getElementById('menu-panel');
const menuTabs           = document.querySelectorAll('.menu-tab');
const menuTabContents    = document.querySelectorAll('.menu-tab-content');
const blogListEl         = document.getElementById('blog-list');
const newBlogInput       = document.getElementById('new-blog');
const addBlogBtn         = document.getElementById('add-blog-btn');
const tabOverlay         = document.getElementById('tab-overlay');
const tabBpmEl           = document.getElementById('tab-bpm');
const tabTapsEl          = document.getElementById('tab-taps');
const audioStatus        = document.getElementById('audio-status');
const audioAnalyzeBtn    = document.getElementById('audio-analyze-btn');
const audioApplyBtn      = document.getElementById('audio-apply-btn');
const audioDeactivateBtn = document.getElementById('audio-deactivate-btn');
const audioActiveIndicator = document.getElementById('audio-active-indicator');
const beatCountInput     = document.getElementById('beat-count');
const beatSecondsEl      = document.getElementById('beat-seconds');
const bpmReadout         = document.getElementById('bpm-readout');

// ── Kill all timers (helper central) ──────────────────────
function killAllTimers() {
  clearInterval(timer);   timer = null;
  clearTimeout(beatTimeout); beatTimeout = null;
}

// ── Timer source indicator ─────────────────────────────────
function setTimerSource(src) {
  timerSource = src;
  timeInput.classList.remove('timer-active', 'timer-confirm', 'timer-inactive');
  menuBtn.classList.remove('timer-active', 'timer-confirm');
  if (src === 'manual' || src === 'tab') {
    timeInput.classList.add('timer-active', 'timer-confirm');
  } else {
    timeInput.classList.add('timer-inactive');
    menuBtn.classList.add('timer-active', 'timer-confirm');
  }
  setTimeout(() => {
    timeInput.classList.remove('timer-confirm');
    menuBtn.classList.remove('timer-confirm');
  }, 400);
}

// ── UI / cursor ───────────────────────────────────────────
let cursorTimer;
function wakeUI() {
  document.body.classList.add('ui-visible');
  clearTimeout(cursorTimer);
  cursorTimer = setTimeout(() => document.body.classList.remove('ui-visible'), 3000);
}
document.addEventListener('mousemove', wakeUI);
document.addEventListener('touchstart', wakeUI, { passive: true });
document.body.classList.add('ui-visible');
ui.classList.add('visible');   // siempre visible

function closePanels() {
  menuPanel.classList.remove('open');
  menuBtn.classList.remove('active-btn');
}
document.addEventListener('keydown', e => { if (e.code === 'Escape') closePanels(); });
document.addEventListener('click',   e => { if (!ui.contains(e.target)) closePanels(); });

// ── Fullscreen ────────────────────────────────────────────
fsBtn.addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(()=>{});
  else document.exitFullscreen().catch(()=>{});
});

// ── Panel toggle + tabs ─────────────────────────────────────
menuBtn.addEventListener('click', e => {
  e.stopPropagation();
  const opening = !menuPanel.classList.contains('open');
  closePanels();
  if (opening) { menuPanel.classList.add('open'); menuBtn.classList.add('active-btn'); renderBlogList(); }
});

function switchMenuTab(tab) {
  menuTabs.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
  menuTabContents.forEach(el => el.classList.toggle('active', el.dataset.tabContent === tab));
}
menuTabs.forEach(btn => btn.addEventListener('click', e => {
  e.stopPropagation();
  switchMenuTab(btn.dataset.tab);
}));

// ── Blog list ─────────────────────────────────────────────
function renderBlogList() {
  blogListEl.innerHTML = '';
  blogs.forEach((b, i) => {
    const row = document.createElement('div');
    row.className = 'blog-row' + (i === blogIdx ? ' active-blog' : '');
    row.innerHTML =
      '<span class="blog-idx">' + (i+1) + '</span>' +
      '<span class="blog-name">' + b + '</span>' +
      '<button class="remove-btn">\u00d7</button>';
    row.addEventListener('click', e => { if (!e.target.classList.contains('remove-btn')) switchToBlog(i); });
    row.querySelector('.remove-btn').addEventListener('click', e => { e.stopPropagation(); removeBlog(i); });
    blogListEl.appendChild(row);
  });
}
function switchToBlog(i) {
  blogIdx = i; blog = blogs[i]; blogInput.value = blog;
  renderBlogList(); loadBlog(true);
}
function removeBlog(i) {
  if (blogs.length === 1) return;
  blogs.splice(i, 1);
  if (blogIdx >= blogs.length) blogIdx = blogs.length - 1;
  blog = blogs[blogIdx]; blogInput.value = blog; renderBlogList();
}
addBlogBtn.addEventListener('click', addBlog);
newBlogInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.stopPropagation(); addBlog(); } });
function addBlog() {
  const val = newBlogInput.value.trim().replace(/\.tumblr\.com$/, '');
  if (!val || blogs.includes(val)) return;
  blogs.push(val); newBlogInput.value = ''; renderBlogList();
}

// ── Manual time ───────────────────────────────────────────
timeInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); applyManualTime(); timeInput.blur(); }
});
function applyManualTime() {
  killAllTimers();
  cancelTabGrid();
  deactivateAudioTimer();
  timeImg = Math.max(0.5, parseFloat(timeInput.value) || 10);
  timeInput.value = timeImg;
  setTimerSource('manual');
  if (isPlaying) startManualTimer();
}

// ── Playback ──────────────────────────────────────────────
function startManualTimer() {
  clearInterval(timer);
  timer = setInterval(() => next(), timeImg * 1000);
}
function startSlideshow() {
  isPlaying = true; playBtn.textContent = '\u23f8';
  next(); startManualTimer();
}
function togglePlay() {
  if (isPlaying) {
    isPlaying = false;
    killAllTimers();
    tabGridActive = false;
    playBtn.textContent = '\u25b6';
  } else {
    isPlaying = true;
    playBtn.textContent = '\u23f8';
    if (timerSource === 'manual') startManualTimer();
    // tab y audio se reactivan cuando el usuario tapea o detecta beats
  }
}
foto.style.cursor = 'pointer';
foto.addEventListener('click', () => { next(); if (isPlaying && timerSource === 'manual') startManualTimer(); });

// ── Load blog ─────────────────────────────────────────────
goBtn.addEventListener('click', () => loadBlog(false));
async function loadBlog(preservePlayState) {
  blog = blogInput.value.trim() || blog;
  if (!blogs.includes(blog)) { blogs.push(blog); blogIdx = blogs.length - 1; }
  else blogIdx = blogs.indexOf(blog);
  if (!preservePlayState) timeImg = parseFloat(timeInput.value) || 10;
  goBtn.textContent = '...'; goBtn.disabled = true;
  reset(); await fetchPhotos();
  goBtn.textContent = 'Go'; goBtn.disabled = false;
  if (photoList.length > 0) {
    playBtn.disabled = false; linkBtn.disabled = false;
    if (preservePlayState) { next(); if (isPlaying && timerSource === 'manual') startManualTimer(); }
    else startSlideshow();
  }
  renderBlogList();
}
playBtn.addEventListener('click', togglePlay);
linkBtn.addEventListener('click', () => { if (currentPostUrl) window.open(currentPostUrl, '_blank'); });

// ── Data ──────────────────────────────────────────────────
function reset() { photoList = []; shown.clear(); blogExhausted = false; history = []; histPos = -1; offset = 0; }
async function fetchPhotos() {
  const url = 'https://api.tumblr.com/v2/blog/' + blog + '.tumblr.com/posts/photo' +
    '?api_key=' + API_KEY + '&offset=' + (offset*LIMIT) + '&limit=' + LIMIT + '&npf=false';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const before = photoList.length;
    data.response.posts.filter(p => p.type === 'photo')
      .forEach(p => p.photos.forEach(ph =>
        photoList.push({ url: ph.original_size.url, postUrl: p.post_url })
      ));
    if (photoList.length === before) blogExhausted = true;
  } catch(err) { console.error('Tumblr API error:', err); goBtn.textContent = 'Error'; }
}
function randomUnshown() {
  const pool = photoList.map((_,i) => i).filter(i => !shown.has(i));
  return pool.length === 0 ? -1 : pool[Math.floor(Math.random() * pool.length)];
}
function showPhoto(idx) {
  if (idx < 0 || idx >= photoList.length) return;
  foto.src = photoList[idx].url;
  currentPostUrl = photoList[idx].postUrl;
  foto.style.visibility = 'visible';
}
async function next() {
  let idx = randomUnshown();
  if (idx === -1 && !blogExhausted) {
    // all currently loaded photos seen — fetch next page (previously shown
    // photos stay marked, so nothing already seen repeats early)
    offset++;
    await fetchPhotos();
    idx = randomUnshown();
  }
  if (idx === -1 && blogExhausted) {
    // truly out of new content — loop back over the whole blog
    shown.clear();
    idx = randomUnshown();
  }
  if (idx === -1) return;
  shown.add(idx); history.push(idx); histPos = history.length - 1;
  showPhoto(idx);
}
function prev() { if (histPos > 0) { histPos--; showPhoto(history[histPos]); } }

// ── Keyboard ──────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const inInput = document.activeElement && document.activeElement.tagName === 'INPUT';
  if (e.code === 'Escape') return;
  if (e.code === 'KeyF'       && !inInput) { e.preventDefault(); document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen(); return; }
  if (e.code === 'Enter'      && !inInput) { e.preventDefault(); loadBlog(false); return; }
  if (e.code === 'Space'      && !inInput) { e.preventDefault(); togglePlay(); return; }
  if (e.code === 'ArrowRight' && !inInput) { e.preventDefault(); next(); if (isPlaying && timerSource === 'manual') startManualTimer(); return; }
  if (e.code === 'ArrowLeft'  && !inInput) { e.preventDefault(); prev(); return; }
  if (e.code === 'ArrowDown'  && !inInput) { e.preventDefault(); switchToBlog((blogIdx+1) % blogs.length); return; }
  if (e.code === 'ArrowUp'    && !inInput) { e.preventDefault(); switchToBlog((blogIdx-1+blogs.length) % blogs.length); return; }
  if (e.code === 'Tab'        && !inInput) { e.preventDefault(); if (!tabIsDown) { tabIsDown = true; onTabDown(); } }
  if (e.code === 'KeyA'       && !inInput) { e.preventDefault(); toggleAudioReactive(); return; }
});
document.addEventListener('keyup', e => { if (e.code === 'Tab') tabIsDown = false; });

tabOverlay.addEventListener('pointerdown', e => { e.preventDefault(); onTabDown(); });

// ── Tab beat grid ─────────────────────────────────────────
let lastTapTime   = 0;
let tapInterval   = 0;
let beatTimeout   = null;
let tabIsDown     = false;
let tabGridActive = false;
let tabOverlayTimer = null;

function showTabOverlay() {
  tabOverlay.classList.add('visible');
  clearTimeout(tabOverlayTimer);
  tabOverlayTimer = setTimeout(() => tabOverlay.classList.remove('visible'), 3000);
}

function onTabDown() {
  const now = performance.now();

  // Matar todo lo demás
  killAllTimers();
  deactivateAudioTimer();

  next();
  showTabOverlay();
  isPlaying = true;
  playBtn.textContent = '\u23f8';
  setTimerSource('tab');

  if (lastTapTime === 0) {
    lastTapTime = now;
    tabBpmEl.textContent = '– –';
    tabTapsEl.textContent = 'tap…';
    return;
  }

  const gap = now - lastTapTime;
  lastTapTime = now;

  if (gap > 8000) {
    tapInterval = 0; tabBpmEl.textContent = '– –'; tabTapsEl.textContent = 'tap…'; return;
  }

  tapInterval = tapInterval > 0 ? tapInterval * 0.5 + gap * 0.5 : gap;
  tabGridActive = true;

  beatTimeout = setTimeout(function tick() {
    if (!tabGridActive) return;
    next();
    beatTimeout = setTimeout(tick, tapInterval);
  }, tapInterval);

  tabBpmEl.textContent = Math.round(60000 / tapInterval) + ' bpm';
  tabTapsEl.textContent = (tapInterval / 1000).toFixed(2) + 's';
  timeImg = tapInterval / 1000;
  timeInput.value = timeImg.toFixed(2);
}

function cancelTabGrid() {
  tabGridActive = false; lastTapTime = 0; tapInterval = 0;
  clearTimeout(beatTimeout); beatTimeout = null;
  tabOverlay.classList.remove('visible');
}

// ── Scroll multiplier ─────────────────────────────────────
const MULT_STEPS = [0.25, 0.5, 1, 2, 4, 6, 8];
let multStepIdx  = 2; // ×1
let multTimer    = null;

const multEl = document.createElement('div');
multEl.id = 'mult-display';
multEl.style.cssText = 'position:fixed;right:14px;top:50%;transform:translateY(-50%);font-family:Courier New,monospace;font-size:24px;font-weight:bold;color:rgba(255,255,255,0.9);pointer-events:none;z-index:100;opacity:0;transition:opacity 0.15s;text-shadow:0 0 16px rgba(0,0,0,0.9)';
document.body.appendChild(multEl);

function showMult(label) {
  multEl.textContent = label;
  multEl.style.opacity = '1';
  clearTimeout(multTimer);
  multTimer = setTimeout(() => { multEl.style.opacity = '0'; }, 3000);
}

document.addEventListener('wheel', e => {
  if (ui.contains(e.target)) return;
  e.preventDefault();
  const dir = e.deltaY > 0 ? 1 : -1;
  multStepIdx = Math.max(0, Math.min(MULT_STEPS.length - 1, multStepIdx + dir));
  const m = MULT_STEPS[multStepIdx];
  const label = m >= 1 ? '\u00d7' + m : '\u00f7' + Math.round(1/m);
  showMult(label);

  if (tabGridActive && tapInterval > 0) {
    const iv = tapInterval * m;
    clearTimeout(beatTimeout);
    beatTimeout = setTimeout(function tick() {
      if (!tabGridActive) return;
      next();
      beatTimeout = setTimeout(tick, tapInterval * MULT_STEPS[multStepIdx]);
    }, iv);
    timeImg = iv / 1000;
    timeInput.value = timeImg.toFixed(2);
  } else if (timerSource === 'manual' && isPlaying) {
    const base = parseFloat(timeInput.dataset.base) || timeImg;
    timeImg = Math.max(0.1, base * m);
    timeInput.value = timeImg.toFixed(2);
    startManualTimer();
  }
}, { passive: false });

// ── Audio ─────────────────────────────────────────────────
let audioCtx         = null;
let analyser         = null;
let audioStream      = null;
let analysing        = false;
let audioTimerActive = false;
let selectedAudioSrc = 'mic';
let detectedBPM      = 0;
let lastBeatTime     = 0;
let beatIntervals    = [];
let beatCount        = 0;
let bassStart        = 1;
let bassEnd          = 1;
const SP_BUFFER_SIZE = 1024;
let scriptNode       = null;
let silentGain       = null;

function deactivateAudioTimer() {
  if (!audioTimerActive) return;
  audioTimerActive = false;
  audioActiveIndicator.classList.add('hidden');
  audioApplyBtn.classList.remove('hidden');
  audioApplyBtn.disabled = !analysing;
}

document.querySelectorAll('.audio-src-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (analysing) {
      stopAnalysis();
      audioStatus.textContent = 'Source changed \u2014 press Start';
    }
    document.querySelectorAll('.audio-src-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedAudioSrc = btn.dataset.src;
  });
});

audioAnalyzeBtn.addEventListener('click', async () => {
  if (analysing) stopAnalysis(); else await startAnalysis();
});

async function startAnalysis() {
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 4096;
    analyser.smoothingTimeConstant = 0.75;

    if (selectedAudioSrc === 'mic') {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false },
        video: false
      });
      audioCtx.createMediaStreamSource(audioStream).connect(analyser);
    } else {
      audioStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
        audio: { echoCancellation: false, noiseSuppression: false, sampleRate: 44100 }
      });
      audioStream.getVideoTracks().forEach(t => t.stop());
      if (audioStream.getAudioTracks().length === 0) {
        audioStatus.textContent = '\u26a0 Tick "Share audio" in the dialog';
        audioCtx.close(); audioCtx = null;
        return;
      }
      audioCtx.createMediaStreamSource(audioStream).connect(analyser);
    }

    analysing = true;
    detectedBPM = 0; lastBeatTime = 0; beatIntervals = [];
    beatCount = 0;
    // Bass band (~60-180Hz, kick-drum fundamental) derived from the real
    // sample rate \u2014 a fixed percentage of bins covered up to ~1800Hz and
    // picked up snares/vocals/cymbals as false beats.
    const binHz = audioCtx.sampleRate / analyser.fftSize;
    bassStart = Math.max(1, Math.round(60 / binHz));
    bassEnd   = Math.max(bassStart + 2, Math.round(180 / binHz));
    audioStatus.textContent = 'Listening\u2026';
    audioAnalyzeBtn.textContent = 'Stop';
    audioAnalyzeBtn.classList.add('analyzing');
    audioApplyBtn.disabled = false;

    // Drive detection off the audio graph (ScriptProcessorNode), not
    // requestAnimationFrame: rAF is throttled to a stop by the browser as
    // soon as the tab isn't the visible/focused one (e.g. alt-tabbing to
    // control the music source during a "System audio" capture), which
    // silently froze beat detection until the tab regained focus.
    const historyLen = Math.max(4, Math.round(audioCtx.sampleRate / SP_BUFFER_SIZE));
    fluxHistory = new Float32Array(historyLen).fill(0);
    fluxIdx = 0;
    prevEnergy = 0;
    scriptNode = audioCtx.createScriptProcessor(SP_BUFFER_SIZE, 1, 1);
    silentGain = audioCtx.createGain();
    silentGain.gain.value = 0;
    analyser.connect(scriptNode);
    scriptNode.connect(silentGain);
    silentGain.connect(audioCtx.destination);
    scriptNode.onaudioprocess = audioLoop;
  } catch(err) {
    audioStatus.textContent = 'Error: ' + err.message;
    if (audioCtx) { audioCtx.close(); audioCtx = null; }
  }
}

function stopAnalysis() {
  analysing = false;
  if (scriptNode) { scriptNode.onaudioprocess = null; scriptNode.disconnect(); scriptNode = null; }
  if (silentGain) { silentGain.disconnect(); silentGain = null; }
  if (audioStream) { audioStream.getTracks().forEach(t => t.stop()); audioStream = null; }
  if (audioCtx)   { audioCtx.close(); audioCtx = null; }
  analyser = null;
  audioStatus.textContent = 'Stopped';
  audioAnalyzeBtn.textContent = 'Start';
  audioAnalyzeBtn.classList.remove('analyzing');
  // NO llamar stopAudioTimer aquí — si el timer de audio estaba activo,
  // lo dejamos activo pero sin análisis. El usuario puede Deactivate manualmente.
  audioApplyBtn.disabled = !audioTimerActive;
}

function activateAudioTimer() {
  if (!analysing) return;
  killAllTimers();
  cancelTabGrid();
  audioTimerActive = true;
  beatCount = 0;
  audioApplyBtn.classList.add('hidden');
  audioActiveIndicator.classList.remove('hidden');
  isPlaying = true;
  playBtn.textContent = '\u23f8';
  setTimerSource('audio');
}

function backToManualTimer() {
  deactivateAudioTimer();
  setTimerSource('manual');
  if (isPlaying) startManualTimer();
}

// Quick toggle between audio-reactive and manual/tab, so you can jump back
// to audio without opening the menu \u2014 pairs with Tab for tap-tempo.
function toggleAudioReactive() {
  if (audioTimerActive) backToManualTimer();
  else activateAudioTimer();
}

audioApplyBtn.addEventListener('click', activateAudioTimer);
audioDeactivateBtn.addEventListener('click', backToManualTimer);

function updateBeatSeconds() {
  const n = Math.max(1, parseInt(beatCountInput.value) || 1);
  if (detectedBPM > 0) {
    beatSecondsEl.textContent = '\u2248 ' + ((60000 / detectedBPM) * n / 1000).toFixed(2) + 's';
  } else {
    beatSecondsEl.textContent = '\u2248 – –s';
  }
}
beatCountInput.addEventListener('input', updateBeatSeconds);

const beatPresetBtns = document.querySelectorAll('.beat-preset');
beatPresetBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    beatPresetBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    beatCountInput.value = btn.dataset.n;
    updateBeatSeconds();
  });
});

// ── Beat detection ────────────────────────────────────────
// Spectral flux (positive-only energy jump), not raw energy vs. a rolling
// average: real music carries a sustained bass presence between kicks, which
// flattens an average-based comparison and causes it to miss every other
// beat. A sustained tone has near-zero frame-to-frame energy change, while a
// kick's attack still produces a sharp jump even riding on top of it.
let fluxHistory = new Float32Array(43).fill(0);
let fluxIdx     = 0;
let prevEnergy  = 0;

function audioLoop() {
  if (!analysing) return;

  const data = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(data);
  let energy = 0;
  for (let i = bassStart; i < bassEnd; i++) energy += data[i] * data[i];
  energy /= (bassEnd - bassStart);

  const flux = Math.max(0, energy - prevEnergy);
  prevEnergy = energy;
  fluxHistory[fluxIdx % fluxHistory.length] = flux;
  fluxIdx++;
  const avgFlux = fluxHistory.reduce((a, b) => a + b, 0) / fluxHistory.length;

  const now = performance.now();
  // Floor of 200ms regardless of detectedBPM: a couple of false double-
  // triggers inflate the apparent BPM, which shrinks this cooldown, which
  // permits more double-triggers — a runaway feedback loop without a floor.
  const cooldown = detectedBPM > 0 ? Math.max(200, (60000 / detectedBPM) * 0.4) : 250;
  const isBeat = flux > avgFlux * 1.8 + 40 && (now - lastBeatTime) > cooldown;

  if (isBeat) {
    if (lastBeatTime > 0) {
      const iv = now - lastBeatTime;
      if (iv > 200 && iv < 3000) {
        beatIntervals.push(iv);
        if (beatIntervals.length > 16) beatIntervals.shift();
        const avgIv = beatIntervals.reduce((a, b) => a + b, 0) / beatIntervals.length;
        detectedBPM = Math.round(60000 / avgIv);
        bpmReadout.textContent = detectedBPM + ' bpm';
        updateBeatSeconds();
      }
    }
    lastBeatTime = now;

    if (audioTimerActive) {
      const needed = Math.max(1, parseInt(beatCountInput.value) || 1);
      beatCount++;
      if (beatCount >= needed) { beatCount = 0; next(); }
    }
  }
}

// ── Init ──────────────────────────────────────────────────
setTimerSource('manual');
