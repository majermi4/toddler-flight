import { art, icon, heroArt, thumbnail } from './art.js';
import { Sound } from './audio.js';
import { launchGame } from './games.js';

export const games = [
  { id: 'paint', title: 'Finger Painting', description: 'A little colour, a lot of imagination.', category: 'Create', color: 'lavender', hint: 'Choose a colour and make your mark.' },
  { id: 'pairs', title: 'Animal Pairs', description: 'Two little friends. One happy match.', category: 'Discover', color: 'peach', hint: 'Tap two cards to find matching friends.' },
  { id: 'sounds', title: 'Animal Sounds', description: 'Who says moo? Come and find out.', category: 'Discover', color: 'sage', hint: 'Tap a friend to hear their voice.' },
  { id: 'animals', title: 'Move the Animals', description: 'Little friends, big adventures.', category: 'Move', color: 'blue', hint: 'Move the friends around their little world.' },
  { id: 'bubbles', title: 'Bubble Pop', description: 'Pop, pop… a lovely little surprise.', category: 'Move', color: 'pink', hint: 'Tap the bubbles. What’s hiding inside?' },
  { id: 'peekaboo', title: 'Peekaboo', description: 'Someone is hiding. Who could it be?', category: 'Discover', color: 'yellow', hint: 'Tap a hiding place. Peekaboo!' },
  { id: 'vehicles', title: 'Things That Go', description: 'All aboard our tiny adventure.', category: 'Move', color: 'sage', hint: 'Tap a vehicle and watch it go.' },
  { id: 'shapes', title: 'Shape Sorter', description: 'Every little shape has a home.', category: 'Discover', color: 'lavender', hint: 'Drag a shape home, or tap it and its outline.' },
  { id: 'colors', title: 'Colour Match', description: 'Find a colourful place to belong.', category: 'Discover', color: 'peach', hint: 'Put each little ball in its matching basket.' },
  { id: 'feed', title: 'Feed a Friend', description: 'A tiny snack for a hungry friend.', category: 'Discover', color: 'yellow', hint: 'Give each friend their favourite snack.' },
  { id: 'face', title: 'Funny Faces', description: 'A hat, a smile, a little silliness.', category: 'Create', color: 'pink', hint: 'Tap a face part to change it. Move the decorations!' },
  { id: 'stickers', title: 'Sticker Stories', description: 'Make a world that’s all your own.', category: 'Create', color: 'blue', hint: 'Tap a sticker to add it, then move it anywhere.' },
  { id: 'music', title: 'Little Music', description: 'A tiny concert at your fingertips.', category: 'Create', color: 'lavender', hint: 'Play the keys and make the animals dance.' },
  { id: 'fireflies', title: 'Follow the Fireflies', description: 'Small lights. A quiet little wonder.', category: 'Calm', color: 'sage', hint: 'Touch the glowing lights. Watch them twinkle.' },
  { id: 'wash', title: 'Splash & Shine', description: 'Rub, rinse, and reveal a happy friend.', category: 'Move', color: 'blue', hint: 'Rub away the mud with your sponge.' },
];
export function readSaved(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
export function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }
const savedSettings = readSaved('little-sky-settings', {});
const settings = { sound: savedSettings.sound === true, volume: typeof savedSettings.volume === 'number' ? Math.max(0, Math.min(.7, savedSettings.volume)) : .35, calm: savedSettings.calm === true };
const savedFavorites = readSaved('little-sky-favorites', []);
const favorites = new Set(Array.isArray(savedFavorites) ? savedFavorites.filter(id => games.some(game => game.id === id)) : []);
const sound = new Sound(settings);
const app = document.querySelector('#app');
let category = 'All play';
let activeGame = null;
let cleanup = () => {};
let offlineReady = false;
let installPrompt;
let toastTimer;
document.body.classList.toggle('calm-mode', settings.calm);

export function toast(message) {
  const el = document.querySelector('#toast');
  el.textContent = message; el.classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 3000);
}
function soundButton() { return `<button class="icon-button sound-toggle" aria-label="${settings.sound ? 'Mute sound' : 'Turn sound on'}" title="${settings.sound ? 'Mute sound' : 'Turn sound on'}">${icon(settings.sound ? 'sound' : 'mute')}</button>`; }
function bindSound() {
  document.querySelector('.sound-toggle')?.addEventListener('click', () => {
    settings.sound = !settings.sound; save('little-sky-settings', settings);
    if (!settings.sound) sound.stop(); else { sound.unlock(); sound.tone(523); }
    const el = document.querySelector('.sound-toggle');
    el.innerHTML = icon(settings.sound ? 'sound' : 'mute');
    el.setAttribute('aria-label', settings.sound ? 'Mute sound' : 'Turn sound on');
    el.title = settings.sound ? 'Mute sound' : 'Turn sound on';
  });
}
function card(game) {
  return `<article class="game-card ${game.color}"><button class="game-open" data-game="${game.id}" aria-label="Play ${game.title}"><div class="card-picture">${thumbnail(game.id)}<span class="play-corner">${icon('arrow', 18)}</span></div><div class="card-copy"><span class="card-category">${game.category}</span><h3>${game.title}</h3><p>${game.description}</p></div></button><button class="favorite ${favorites.has(game.id) ? 'is-favorite' : ''}" data-favorite="${game.id}" aria-label="${favorites.has(game.id) ? 'Unfavorite' : 'Favorite'} ${game.title}" aria-pressed="${favorites.has(game.id)}">${icon('heart', 18)}</button></article>`;
}
function renderHome() {
  cleanup(); sound.stop(); activeGame = null;
  document.body.classList.remove('in-game');
  const visible = games.filter(game => category === 'All play' || (category === 'Favourites' ? favorites.has(game.id) : game.category === category));
  app.innerHTML = `<div class="home-shell"><header class="site-header"><a href="#" class="brand" aria-label="Little Sky home"><span class="brand-mark">${art('plane')}</span><span>little sky<span class="brand-dot">.</span></span></a><div class="header-right"><span class="flight-pill">${icon('cloud', 16)} Made for little travellers</span>${soundButton()}<button class="parent-button" id="parent-open">${icon('settings', 17)}<span>Grown-ups</span></button></div></header><main><section class="welcome"><div class="welcome-copy"><div class="eyebrow"><span></span> BIG ADVENTURES FOR LITTLE HANDS</div><h1>A little world<br>of <span>play.</span></h1><p>Happy hands. Curious minds.<br>A pocketful of fun, wherever you go.</p><button class="primary-button" id="start-play">Let’s play ${icon('arrow', 19)}</button><div class="welcome-note">${icon('check', 15)} 15 gentle games <span>·</span> No ads <span>·</span> Works offline</div></div><div class="welcome-illustration">${heroArt()}<div class="floating-label">a little joy, on the go ${icon('heart', 14)}</div></div></section><section class="playroom"><div class="section-heading"><div><span class="eyebrow">THE PLAYROOM</span><h2>What shall we play?</h2></div><span class="game-count">${visible.length} little ${visible.length === 1 ? 'adventure' : 'adventures'}</span></div><div class="filters" role="group" aria-label="Filter games">${['All play', 'Create', 'Discover', 'Move', 'Calm', 'Favourites'].map(name => `<button class="filter ${category === name ? 'selected' : ''}" data-category="${name}" aria-pressed="${category === name}">${name === 'Favourites' ? icon('heart', 15) : name === 'Calm' ? icon('leaf', 15) : ''}${name}</button>`).join('')}</div><div class="game-grid">${visible.length ? visible.map(card).join('') : '<div class="empty-state">A little space for your favourites.<br>Tap a heart on a game to save it here.</div>'}</div></section><footer><span>${icon('cloud', 17)} Little moments. Lovely memories.</span><button id="offline-info" class="offline-status">${icon(offlineReady ? 'check' : 'download', 15)} ${offlineReady ? 'Ready for airplane mode' : 'Preparing offline play…'}</button></footer></main></div>`;
  bindSound();
  document.querySelectorAll('[data-game]').forEach(el => el.addEventListener('click', () => { location.hash = el.dataset.game; }));
  document.querySelectorAll('[data-favorite]').forEach(el => el.addEventListener('click', () => {
    favorites.has(el.dataset.favorite) ? favorites.delete(el.dataset.favorite) : favorites.add(el.dataset.favorite);
    save('little-sky-favorites', [...favorites]); renderHome();
  }));
  document.querySelectorAll('[data-category]').forEach(el => el.addEventListener('click', () => { category = el.dataset.category; renderHome(); document.querySelector('.playroom').scrollIntoView({ block: 'start' }); }));
  document.querySelector('#parent-open').addEventListener('click', openParents);
  document.querySelector('#start-play').addEventListener('click', () => { location.hash = 'bubbles'; });
  document.querySelector('#offline-info').addEventListener('click', openParents);
}
function renderGame(game) {
  cleanup(); sound.stop(); activeGame = game;
  document.body.classList.add('in-game');
  app.innerHTML = `<div class="game-shell ${game.color}"><header class="game-header"><button class="home-button" id="back-home" aria-label="Back to playroom">${icon('back')}<span>Playroom</span></button><div class="game-heading"><span class="eyebrow">LITTLE SKY</span><h1>${game.title}</h1></div><div class="game-header-actions">${soundButton()}<button class="icon-button" id="restart" aria-label="Start game again">${icon('refresh')}</button><button class="icon-button" id="fullscreen" aria-label="Enter or leave fullscreen">${icon('fullscreen')}</button></div></header><main class="game-main"><div id="game-stage" class="game-stage"></div><p id="game-hint" class="game-hint">${game.hint}</p></main></div>`;
  document.querySelector('#back-home').addEventListener('click', () => { location.hash = ''; });
  document.querySelector('#restart').addEventListener('click', () => renderGame(game));
  document.querySelector('#fullscreen').addEventListener('click', async () => {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen(); else toast('Use Add to Home Screen for a full-screen playroom.'); } catch { toast('Use Add to Home Screen for a full-screen playroom.'); }
  });
  bindSound();
  cleanup = launchGame(game.id, document.querySelector('#game-stage'), { sound, settings, save, readSaved, toast });
}
function route() { const game = games.find(game => game.id === location.hash.slice(1)); game ? renderGame(game) : renderHome(); }
window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', () => { if (document.hidden) sound.stop(); });
window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; });

function openParents() {
  const dialog = document.createElement('dialog');
  dialog.className = 'parent-dialog';
  dialog.innerHTML = `<button class="icon-button dialog-close" aria-label="Close settings">${icon('close')}</button><span class="eyebrow">A LITTLE HELP FOR GROWN-UPS</span><h2>Ready for takeoff.</h2><p>Settle in, pick a game, and play together.</p><label class="setting-row"><span><strong>Sound</strong><small>Gentle sounds, off by default.</small></span><input type="checkbox" id="parent-sound" ${settings.sound ? 'checked' : ''}></label><label class="setting-row"><span><strong>Volume</strong><small>A little goes a long way.</small></span><input type="range" id="parent-volume" min="0" max="0.7" step="0.05" value="${settings.volume}" aria-label="Sound volume"></label><label class="setting-row"><span><strong>Gentle motion</strong><small>Slow down drifting and animations.</small></span><input type="checkbox" id="parent-calm" ${settings.calm ? 'checked' : ''}></label><div class="offline-panel"><strong>${offlineReady ? '✓ Ready for airplane mode' : 'Offline download in progress'}</strong><p>${offlineReady ? 'All 15 games are saved on this device. Try opening the app in airplane mode before your flight.' : 'Keep this tab open while the games are saved. Offline installation needs HTTPS or localhost.'}</p></div><button class="primary-button install-button">${icon('download', 18)} Add to your tablet</button><div class="install-help">iPad: Safari → Share → Add to Home Screen.<br>Android: browser menu → Install app / Add to Home screen.<br>Open once online and wait for “Ready for airplane mode”.</div><p class="privacy-note">No accounts, ads, tracking, or purchases. Favourites and drawings stay on this device.</p>`;
  document.body.append(dialog); dialog.showModal();
  dialog.querySelector('.dialog-close').onclick = () => dialog.close();
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => dialog.remove());
  dialog.querySelector('#parent-sound').onchange = event => { settings.sound = event.target.checked; if (!settings.sound) sound.stop(); else sound.unlock(); save('little-sky-settings', settings); const btn = document.querySelector('.sound-toggle'); btn.innerHTML = icon(settings.sound ? 'sound' : 'mute'); btn.setAttribute('aria-label', settings.sound ? 'Mute sound' : 'Turn sound on'); };
  dialog.querySelector('#parent-volume').oninput = event => { settings.volume = Number(event.target.value); save('little-sky-settings', settings); };
  dialog.querySelector('#parent-calm').onchange = event => { settings.calm = event.target.checked; document.body.classList.toggle('calm-mode', settings.calm); save('little-sky-settings', settings); };
  dialog.querySelector('.install-button').onclick = async () => {
    if (installPrompt) { await installPrompt.prompt(); installPrompt = null; }
    else dialog.querySelector('.install-help').classList.add('highlight');
  };
}

route();
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'OFFLINE_STATUS') { offlineReady = event.data.ready; const el = document.querySelector('.offline-status'); if (el) el.innerHTML = `${icon(offlineReady ? 'check' : 'download', 15)} ${offlineReady ? 'Ready for airplane mode' : 'Preparing offline play…'}`; }
  });
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(reg => {
    reg.active?.postMessage('CHECK_OFFLINE');
    navigator.serviceWorker.addEventListener('controllerchange', () => navigator.serviceWorker.controller?.postMessage('CHECK_OFFLINE'));
  }).catch(() => { const el = document.querySelector('.offline-status'); if (el) el.textContent = 'Open on HTTPS to enable offline play'; });
}
