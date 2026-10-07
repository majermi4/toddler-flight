import { art, animalNames } from './art.js';

const palette = ['#db8d7e', '#e7b96b', '#9eb995', '#8fb7c4', '#b5a0cb', '#775f57'];
const pick = array => array[Math.floor(Math.random() * array.length)];
export function shuffled(array, random = Math.random) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
}
export function matches(source, target) { return source === target; }
export function launchGame(id, stage, env) {
  const scope = new AbortController();
  const disposers = [];
  const on = (el, event, fn, options = {}) => el.addEventListener(event, fn, { ...options, signal: scope.signal });
  const timers = new Set();
  const later = (fn, ms) => { const t = setTimeout(() => { timers.delete(t); if (!scope.signal.aborted) fn(); }, ms); timers.add(t); return t; };
  const every = (fn, ms) => { const t = setInterval(() => { if (!document.hidden && !scope.signal.aborted) fn(); }, ms); disposers.push(() => clearInterval(t)); };
  const hint = text => { document.querySelector('#game-hint').textContent = text; };
  const celebrate = el => { env.sound.happy(); el?.classList.add('celebrate'); later(() => el?.classList.remove('celebrate'), 650); };
  function sparkle(x, y, content = '✦') {
    const el = document.createElement('span'); el.className = 'sparkle'; el.textContent = content; el.style.left = `${x}px`; el.style.top = `${y}px`; stage.append(el); later(() => el.remove(), 950);
  }
  function tool(content, extra = '') { return `<div class="game-tools" ${extra}>${content}</div>`; }
  function activate(group, button) { group.querySelectorAll('button').forEach(el => { el.classList.toggle('active', el === button); el.setAttribute('aria-pressed', String(el === button)); }); }
  function drag(el, area, finish = () => false) {
    let state;
    on(el, 'pointerdown', e => {
      if (state) return;
      e.preventDefault(); env.sound.unlock();
      const r = el.getBoundingClientRect(); const a = area.getBoundingClientRect();
      state = { id: e.pointerId, offsetX: e.clientX - r.left, offsetY: e.clientY - r.top, startX: e.clientX, startY: e.clientY, moved: false, left: el.style.left, top: el.style.top };
      el.setPointerCapture(e.pointerId); el.classList.add('dragging');
      if (getComputedStyle(el).position !== 'absolute') { el.style.position = 'absolute'; el.style.left = `${r.left - a.left}px`; el.style.top = `${r.top - a.top}px`; }
    });
    on(el, 'pointermove', e => {
      if (!state || e.pointerId !== state.id) return;
      if (Math.hypot(e.clientX - state.startX, e.clientY - state.startY) > 8) state.moved = true;
      const r = area.getBoundingClientRect();
      el.style.left = `${Math.max(0, Math.min(r.width - el.offsetWidth, e.clientX - r.left - state.offsetX)) / r.width * 100}%`;
      el.style.top = `${Math.max(0, Math.min(r.height - el.offsetHeight, e.clientY - r.top - state.offsetY)) / r.height * 100}%`;
    });
    function end(e, cancelled = false) {
      if (!state || e.pointerId !== state.id) return;
      const previous = state; state = null; el.classList.remove('dragging');
      if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
      if (cancelled) { el.style.left = previous.left; el.style.top = previous.top; return; }
      finish({ x: e.clientX, y: e.clientY, moved: previous.moved, origin: previous });
    }
    on(el, 'pointerup', e => end(e)); on(el, 'pointercancel', e => end(e, true));
    // Activation also works with keyboard; pointer activation is handled above.
    on(el, 'click', e => { if (e.detail === 0) finish({ x: 0, y: 0, moved: false, origin: { left: el.style.left, top: el.style.top } }); });
  }
  function targetAt(targets, x, y, padding = 24) {
    return [...targets].find(el => { const r = el.getBoundingClientRect(); return x >= r.left - padding && x <= r.right + padding && y >= r.top - padding && y <= r.bottom + padding; });
  }
  function setupCanvas(canvas, redraw) {
    const context = canvas.getContext('2d');
    const resize = () => { const r = canvas.getBoundingClientRect(); if (!r.width || !r.height) return; const dpr = Math.min(window.devicePixelRatio || 1, 2); canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr); context.setTransform(dpr, 0, 0, dpr, 0, 0); redraw(context, r.width, r.height); };
    const observer = new ResizeObserver(resize); observer.observe(canvas); disposers.push(() => observer.disconnect()); resize();
    return context;
  }
  const implementations = {
    paint() {
      stage.innerHTML = `<div class="paint-layout">${tool(`<div class="swatches" role="group" aria-label="Paint colours">${palette.map((c, i) => `<button class="swatch ${i === 0 ? 'active' : ''}" style="--swatch:${c}" data-color="${c}" aria-label="${['Coral', 'Yellow', 'Green', 'Blue', 'Purple', 'Brown'][i]} paint" aria-pressed="${i === 0}"></button>`).join('')}</div><div class="brushes" role="group" aria-label="Brush style"><button data-brush="crayon" class="active" aria-pressed="true">Crayon</button><button data-brush="soft" aria-pressed="false">Soft brush</button><button data-brush="rainbow" aria-pressed="false">Rainbow</button><button data-brush="stamp" aria-pressed="false">Stars</button><button data-brush="eraser" aria-pressed="false">Eraser</button></div><button id="clear-art" class="soft-button">Fresh paper</button>`)}<div class="drawing-paper"><span class="paper-label">YOUR LITTLE MASTERPIECE</span><canvas aria-label="Finger painting canvas. Draw with your fingers." role="img"></canvas></div></div>`;
      let color = palette[0], brush = 'crayon';
      let strokes = env.readSaved('little-sky-drawing', []);
      if (!Array.isArray(strokes) || strokes.some(s => !s || !Array.isArray(s.points) || s.points.some(p => !Array.isArray(p) || p.length !== 2 || p.some(n => typeof n !== 'number')))) strokes = [];
      const pointers = new Map(); const canvas = stage.querySelector('canvas');
      function drawStroke(ctx, stroke, w, h, start = 0) {
        if (!stroke.points.length) return;
        const base = Math.min(w, h);
        ctx.globalCompositeOperation = stroke.brush === 'eraser' ? 'destination-out' : 'source-over';
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = stroke.brush === 'soft' ? .32 : .9;
        ctx.lineWidth = base * (stroke.brush === 'soft' || stroke.brush === 'eraser' ? .085 : .035);
        if (stroke.brush === 'stamp') {
          ctx.fillStyle = stroke.color;
          stroke.points.forEach(([x, y], i) => {
            if (i < start || i % 4 !== 0) return;
            ctx.save(); ctx.translate(x * w, y * h); ctx.beginPath();
            for (let j = 0; j < 10; j++) { const a = j * Math.PI / 5 - Math.PI / 2; const r = base * (j % 2 ? .015 : .035); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
            ctx.closePath(); ctx.fill(); ctx.restore();
          });
        } else {
          stroke.points.forEach(([x, y], i) => {
            if (i < start) return;
            ctx.strokeStyle = stroke.brush === 'rainbow' ? `hsl(${(i * 9 + stroke.hue) % 360},60%,70%)` : stroke.color;
            const prev = stroke.points[Math.max(0, i - 1)];
            ctx.beginPath(); ctx.moveTo(prev[0] * w, prev[1] * h); ctx.lineTo(x * w + (i === 0 ? .01 : 0), y * h); ctx.stroke();
          });
        }
        ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      }
      function redraw(ctx, w, h) { ctx.clearRect(0, 0, w, h); strokes.forEach(s => drawStroke(ctx, s, w, h)); }
      const ctx = setupCanvas(canvas, redraw);
      const point = e => { const r = canvas.getBoundingClientRect(); return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]; };
      on(canvas, 'pointerdown', e => { e.preventDefault(); canvas.setPointerCapture(e.pointerId); const stroke = { color, brush, hue: Math.random() * 360, points: [point(e)] }; strokes.push(stroke); pointers.set(e.pointerId, stroke); const r = canvas.getBoundingClientRect(); drawStroke(ctx, stroke, r.width, r.height); });
      on(canvas, 'pointermove', e => { const stroke = pointers.get(e.pointerId); if (!stroke) return; const next = point(e); const prev = stroke.points.at(-1); if (Math.hypot(next[0] - prev[0], next[1] - prev[1]) < .002) return; stroke.points.push(next); const r = canvas.getBoundingClientRect(); drawStroke(ctx, stroke, r.width, r.height, stroke.points.length - 1); });
      const end = e => { pointers.delete(e.pointerId); if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId); strokes = strokes.slice(-120); env.save('little-sky-drawing', strokes); };
      on(canvas, 'pointerup', end); on(canvas, 'pointercancel', end);
      disposers.push(() => env.save('little-sky-drawing', strokes.slice(-120)));
      stage.querySelectorAll('[data-color]').forEach(el => on(el, 'click', () => { color = el.dataset.color; activate(stage.querySelector('.swatches'), el); }));
      stage.querySelectorAll('[data-brush]').forEach(el => on(el, 'click', () => { brush = el.dataset.brush; activate(stage.querySelector('.brushes'), el); }));
      on(stage.querySelector('#clear-art'), 'click', () => { strokes = []; pointers.clear(); const r = canvas.getBoundingClientRect(); redraw(ctx, r.width, r.height); env.save('little-sky-drawing', []); });
    },
    pairs() {
      let count = 2, first = null;
      stage.innerHTML = `${tool('<button class="soft-button active" data-pairs="2" aria-pressed="true">2 pairs</button><button class="soft-button" data-pairs="3" aria-pressed="false">3 pairs</button><button class="soft-button" data-pairs="4" aria-pressed="false">4 pairs</button><button class="soft-button" id="new-pairs">New friends</button>')}<div class="pairs-board"></div>`;
      function deal() {
        first = null;
        const names = shuffled(animalNames).slice(0, count);
        const cards = shuffled([...names, ...names]); const board = stage.querySelector('.pairs-board');
        board.style.setProperty('--pair-columns', count === 3 ? 3 : count === 4 ? 4 : 2);
        board.innerHTML = cards.map((name, i) => `<button class="pair-card" data-animal="${name}" aria-label="${name} card ${i + 1}" aria-pressed="false"><span class="card-front">${art(name)}</span></button>`).join('');
        board.querySelectorAll('button').forEach(el => on(el, 'click', () => {
          if (el.classList.contains('matched')) return;
          if (first === el) { el.classList.remove('selected'); el.setAttribute('aria-pressed', 'false'); first = null; hint('Tap two of the same animal.'); return; }
          env.sound.pop(); el.classList.add('selected'); el.setAttribute('aria-pressed', 'true');
          if (!first) { first = el; hint(`Find another ${el.dataset.animal}.`); return; }
          const other = first; first = null;
          if (matches(el.dataset.animal, other.dataset.animal)) {
            [el, other].forEach(card => { card.classList.remove('selected'); card.classList.add('matched'); card.disabled = true; }); celebrate(el);
            hint('Two matching friends! Find another pair.');
            if (board.querySelectorAll('.matched').length === cards.length) { hint('All the friends are together! Play again?'); later(() => { if (board.querySelectorAll('.matched').length === cards.length) celebrate(board); }, 400); }
          } else { other.classList.remove('selected'); other.setAttribute('aria-pressed', 'false'); first = el; hint(`Find another ${el.dataset.animal}.`); }
        }));
        hint('Tap two of the same animal.');
      }
      stage.querySelectorAll('[data-pairs]').forEach(el => on(el, 'click', () => { count = Number(el.dataset.pairs); activate(stage.querySelector('.game-tools'), el); deal(); }));
      on(stage.querySelector('#new-pairs'), 'click', deal); deal();
    },
    sounds() {
      const words = { cow: 'Moooo!', cat: 'Meow!', dog: 'Woof woof!', rabbit: 'Sniff sniff!', monkey: 'Oo oo ah ah!', bird: 'Tweet tweet!', fish: 'Blub blub!', sheep: 'Baa baa!', frog: 'Ribbit!' };
      stage.innerHTML = `<div class="animal-sound-grid">${animalNames.map(name => `<button class="sound-animal" aria-label="${name} sound" data-animal="${name}">${art(name)}<span>${name}</span><span class="animal-call" aria-hidden="true"></span></button>`).join('')}</div>`;
      stage.querySelectorAll('button').forEach(el => { let timer; on(el, 'click', () => { env.sound.animal(el.dataset.animal); el.classList.remove('talking'); void el.offsetWidth; el.classList.add('talking'); el.querySelector('.animal-call').textContent = words[el.dataset.animal]; clearTimeout(timer); timer = later(() => { el.classList.remove('talking'); }, 1300); hint(`${words[el.dataset.animal]} ${!env.settings.sound ? 'Sound is off — tap the speaker to listen.' : ''}`); }); });
    },
    animals() {
      stage.innerHTML = `${tool('<span class="tool-note">A sky, a meadow, a pond. A home for every friend.</span>')}<div class="world-scene meadow"><div class="cloud cloud-one"></div><div class="cloud cloud-two"></div><div class="sun"></div><div class="hill hill-one"></div><div class="hill hill-two"></div><div class="pond"></div><span class="scene-flower f-one">${art('flower')}</span><span class="scene-flower f-two">${art('flower')}</span><div class="world-label sky-label">sky</div><div class="world-label meadow-label">meadow</div><div class="world-label pond-label">pond</div>${['cow', 'rabbit', 'bird', 'fish', 'frog', 'butterfly'].map((name, i) => `<button class="scene-animal draggable" style="left:${8 + i * 14}%;top:${52 + i % 2 * 14}%" aria-label="Move ${name}" data-animal="${name}">${art(name)}</button>`).join('')}</div>`;
      const world = stage.querySelector('.world-scene');
      world.querySelectorAll('.scene-animal').forEach(el => drag(el, world, ({ moved }) => {
        if (!moved) { const habitats = { bird: [55, 10], butterfly: [20, 20], fish: [73, 66], frog: [65, 61], rabbit: [30, 65], cow: [10, 57] }; const [x, y] = habitats[el.dataset.animal]; el.style.left = `${x}%`; el.style.top = `${y}%`; }
        env.sound.animal(el.dataset.animal); celebrate(el);
      }));
    },
    bubbles() {
      stage.innerHTML = '<div class="bubble-world"><div class="bubble-instruction">pop a little happiness</div></div>';
      const world = stage.querySelector('.bubble-world'); let number = 0;
      function spawn() {
        if (world.querySelectorAll('button').length >= 12) return;
        const button = document.createElement('button'); button.className = 'floating-bubble'; button.setAttribute('aria-label', 'Pop bubble');
        const size = 75 + Math.random() * 55; button.style.width = `${size}px`; button.style.height = `${size}px`;
        button.style.left = `${5 + Math.random() * 76}%`; button.style.top = `${5 + Math.random() * 67}%`; button.style.setProperty('--bubble-color', pick(['#b7d9d6', '#d1c5e4', '#efd3c0', '#b8d3e7'])); button.style.animationDelay = `${Math.random() * -5}s`;
        const animal = number++ % 3 === 0 ? pick(animalNames) : null;
        if (animal) button.innerHTML = art(animal);
        world.append(button);
        on(button, 'click', () => { const r = button.getBoundingClientRect(); const s = stage.getBoundingClientRect(); env.sound.pop(); sparkle(r.left - s.left + r.width / 2, r.top - s.top + r.height / 2, animal ? '♡' : '✦'); button.remove(); later(spawn, 500); }, { once: true });
      }
      for (let i = 0; i < 9; i++) spawn(); every(spawn, 1700);
    },
    peekaboo() {
      stage.innerHTML = `<div class="peek-board">${['bush', 'box', 'curtain', 'cloud'].map((place, i) => `<button class="peek-place ${place}" aria-label="Who is hiding behind the ${place}?" data-name="${['rabbit', 'cat', 'monkey', 'bird'][i]}"><span class="hidden-friend">${art(['rabbit', 'cat', 'monkey', 'bird'][i])}</span><span class="peek-cover">${place === 'bush' ? '♣' : place === 'box' ? '✧' : place === 'curtain' ? '☾' : '☁'}</span><span class="peek-word">Peekaboo!</span></button>`).join('')}</div>`;
      stage.querySelectorAll('button').forEach(el => { let timer; on(el, 'click', () => { clearTimeout(timer); el.classList.toggle('open'); if (el.classList.contains('open')) { env.sound.animal(el.dataset.name); hint(`Peekaboo, little ${el.dataset.name}!`); timer = later(() => el.classList.remove('open'), 4000); } }); });
    },
    vehicles() {
      const names = ['train', 'plane', 'tractor', 'boat'];
      stage.innerHTML = `<div class="vehicle-world">${names.map((name, i) => `<div class="vehicle-lane lane-${name}"><span class="lane-label">${name}</span><button class="vehicle" aria-label="Make the ${name} move" data-name="${name}" style="left:${10 + i * 9}%">${art(name)}</button><div class="lane-track"></div></div>`).join('')}</div>`;
      stage.querySelectorAll('button').forEach(el => { let trip; on(el, 'click', () => { clearTimeout(trip); el.classList.remove('going'); void el.offsetWidth; el.classList.add('going'); const n = el.dataset.name; if (n === 'train') { env.sound.tone(440, .4); env.sound.tone(550, .4, 'sine', .4); } else if (n === 'boat') env.sound.tone(170, .6); else if (n === 'plane') env.sound.tone(200, .8, 'triangle', 0, 360); else { env.sound.tone(100, .16, 'triangle'); env.sound.tone(100, .16, 'triangle', .2); } trip = later(() => el.classList.remove('going'), env.settings.calm ? 5000 : 3500); }); });
    },
    shapes() { sorting('shapes'); },
    colors() { sorting('colors'); },
    feed() { sorting('feed'); },
    face() {
      stage.innerHTML = `${tool('<span class="tool-note">Tap the eyes, nose, mouth, or hat to change them.</span>')}<div class="face-world"><div class="face-head"><div class="face-ear left"></div><div class="face-ear right"></div><button class="face-part face-eyes" aria-label="Change eyes">● &nbsp; ●</button><button class="face-part face-nose" aria-label="Change nose">●</button><button class="face-part face-mouth" aria-label="Change smile">ᴗ</button><button class="face-part face-hat" aria-label="Change hat">👑</button><span class="cheek left"></span><span class="cheek right"></span></div>${['star', 'flower', 'butterfly'].map((name, i) => `<button class="face-decoration draggable" style="left:${12 + i * 30}%;top:76%" aria-label="Move ${name} decoration">${art(name)}</button>`).join('')}</div>`;
      const parts = { eyes: ['● &nbsp; ●', '⌒ &nbsp; ⌒', '★ &nbsp; ★', '◉ &nbsp; ◉'], nose: ['●', '▲', '♥'], mouth: ['ᴗ', '○', 'ω', '◡'], hat: ['👑', '🎩', '🎀', '🧢', '🌻'] };
      Object.entries(parts).forEach(([part, options]) => { let index = 0; const el = stage.querySelector(`.face-${part}`); on(el, 'click', () => { index = (index + 1) % options.length; el.innerHTML = options[index]; env.sound.pop(); celebrate(el); }); });
      stage.querySelectorAll('.draggable').forEach(el => drag(el, stage.querySelector('.face-world')));
    },
    stickers() {
      const stickers = ['cat', 'dog', 'rabbit', 'bird', 'fish', 'butterfly', 'flower', 'star', 'plane', 'ball'];
      stage.innerHTML = `${tool('<div class="scene-tabs" role="group" aria-label="Sticker background"><button class="soft-button active" data-scene="meadow" aria-pressed="true">Meadow</button><button class="soft-button" data-scene="ocean" aria-pressed="false">Ocean</button><button class="soft-button" data-scene="space" aria-pressed="false">Space</button></div><button class="soft-button" id="clear-stickers">New story</button>')}<div class="sticker-layout"><div class="world-scene sticker-world meadow"><div class="cloud cloud-one"></div><div class="sun"></div><div class="hill hill-one"></div><div class="hill hill-two"></div><div class="scene-stars">✧ &nbsp; · &nbsp; ✦ &nbsp; · &nbsp; ✧</div></div><div class="sticker-tray" aria-label="Choose stickers">${stickers.map(name => `<button class="sticker-choice" data-sticker="${name}" aria-label="Add ${name} sticker">${art(name)}</button>`).join('')}</div></div>`;
      const world = stage.querySelector('.sticker-world');
      stage.querySelectorAll('[data-sticker]').forEach(el => on(el, 'click', () => {
        if (world.querySelectorAll('.placed-sticker').length >= 35) world.querySelector('.placed-sticker').remove();
        const sticker = document.createElement('button'); sticker.className = 'placed-sticker draggable'; sticker.setAttribute('aria-label', `Move ${el.dataset.sticker} sticker`); sticker.innerHTML = art(el.dataset.sticker); sticker.style.left = `${15 + Math.random() * 55}%`; sticker.style.top = `${15 + Math.random() * 45}%`; world.append(sticker); env.sound.pop(); drag(sticker, world, ({ moved }) => { if (!moved) celebrate(sticker); });
      }));
      stage.querySelectorAll('[data-scene]').forEach(el => on(el, 'click', () => { world.classList.remove('meadow', 'ocean', 'space'); world.classList.add(el.dataset.scene); activate(stage.querySelector('.scene-tabs'), el); }));
      on(stage.querySelector('#clear-stickers'), 'click', () => world.querySelectorAll('.placed-sticker').forEach(el => el.remove()));
    },
    music() {
      const freqs = [261.63, 293.66, 329.63, 349.23, 392, 440, 493.88, 523.25];
      stage.innerHTML = `<div class="music-world"><div class="music-friends">${['cat', 'rabbit', 'bird'].map(name => `<div class="dancing-friend">${art(name)}</div>`).join('')}</div><div class="music-notes" aria-hidden="true">♪ &nbsp; ♫ &nbsp; ♪</div><div class="piano">${freqs.map((freq, i) => `<button class="piano-key" data-frequency="${freq}" style="--key-color:${[...palette, '#dcadbd', '#98bbaa'][i]}" aria-label="Play ${['C', 'D', 'E', 'F', 'G', 'A', 'B', 'high C'][i]}"><span>${['do', 're', 'mi', 'fa', 'sol', 'la', 'si', 'do'][i]}</span><i></i></button>`).join('')}</div><p class="music-help">${env.settings.sound ? 'A little tune, just for you.' : 'Tap the speaker above to hear your little tune.'}</p></div>`;
      stage.querySelectorAll('.piano-key').forEach(el => {
        const play = () => { env.sound.tone(Number(el.dataset.frequency), .65); el.classList.add('pressed'); later(() => el.classList.remove('pressed'), 220); const friend = pick([...stage.querySelectorAll('.dancing-friend')]); friend.classList.remove('dance'); void friend.offsetWidth; friend.classList.add('dance'); later(() => friend.classList.remove('dance'), 500); const r = el.getBoundingClientRect(); const s = stage.getBoundingClientRect(); sparkle(r.left - s.left + r.width / 2, r.top - s.top, '♪'); };
        on(el, 'pointerdown', e => { e.preventDefault(); play(); }); on(el, 'click', e => { if (e.detail === 0) play(); });
      });
    },
    fireflies() {
      stage.innerHTML = '<div class="night-world"><span class="moon">☾</span><div class="night-hill"></div><div class="night-hill second"></div><p class="night-caption">hello, little lights</p></div>';
      const world = stage.querySelector('.night-world');
      for (let i = 0; i < 11; i++) {
        const el = document.createElement('button'); el.className = 'firefly'; el.setAttribute('aria-label', 'Touch glowing firefly'); el.style.left = `${8 + Math.random() * 77}%`; el.style.top = `${14 + Math.random() * 61}%`; el.style.animationDelay = `${-Math.random() * 8}s`; el.style.setProperty('--drift', `${20 + Math.random() * 30}px`); world.append(el);
        on(el, 'click', () => { if (el.classList.contains('glowing')) return; el.classList.add('glowing'); env.sound.tone(800 + Math.random() * 400, .7); const r = el.getBoundingClientRect(); const s = stage.getBoundingClientRect(); sparkle(r.left - s.left + r.width / 2, r.top - s.top, '✧'); later(() => { el.classList.remove('glowing'); el.style.left = `${8 + Math.random() * 77}%`; el.style.top = `${14 + Math.random() * 61}%`; }, 1100); });
      }
    },
    wash() {
      stage.innerHTML = `${tool('<div class="wash-choices" role="group" aria-label="Choose who to wash"><button class="soft-button active" data-wash="car" aria-pressed="true">Car</button><button class="soft-button" data-wash="dog" aria-pressed="false">Dog</button><button class="soft-button" data-wash="cow" aria-pressed="false">Cow</button></div><button class="soft-button" id="mud-again">More mud!</button>')}<div class="wash-world"><div class="wash-picture">${art('car')}</div><canvas aria-label="Rub away the mud" role="img"></canvas><div class="wash-finish" aria-live="polite">Squeaky clean! ✨</div></div><div class="wash-progress"><span></span></div>`;
      const canvas = stage.querySelector('canvas'); const progress = stage.querySelector('.wash-progress span');
      let erased = [], finished = false; const pointers = new Set();
      function draw(ctx, w, h) {
        ctx.clearRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over';
        const cx = w / 2, cy = h / 2, size = Math.min(w * .56, h * .8);
        ctx.fillStyle = '#9b8064';
        for (let i = 0; i < 28; i++) { const a = i * 2.4; const rad = size * (.05 + (i % 7) * .04); ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * .72, size * (.07 + i % 3 * .025), size * (.06 + i % 4 * .014), a, 0, Math.PI * 2); ctx.fill(); }
        ctx.globalCompositeOperation = 'destination-out';
        erased.forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * w, y * h, Math.min(w, h) * .1, 0, Math.PI * 2); ctx.fill(); });
        ctx.globalCompositeOperation = 'source-over';
      }
      const ctx = setupCanvas(canvas, draw);
      function rub(e) {
        if (finished) return;
        const r = canvas.getBoundingClientRect(); const p = [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]; erased.push(p);
        ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(p[0] * r.width, p[1] * r.height, Math.min(r.width, r.height) * .1, 0, Math.PI * 2); ctx.fill(); ctx.restore();
        // Measure uncovered samples in the actual mud area, rather than counting touches.
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let remaining = 0;
        for (let i = 3; i < data.length; i += 4 * 25) if (data[i] > 30) remaining++;
        const fraction = 1 - remaining / Math.max(1, initialSamples);
        progress.style.width = `${Math.max(0, Math.min(1, fraction)) * 100}%`;
        if (fraction > .91) { finished = true; ctx.clearRect(0, 0, r.width, r.height); erased = [[.5, .5]]; stage.querySelector('.wash-world').classList.add('clean'); progress.style.width = '100%'; celebrate(stage.querySelector('.wash-picture')); hint('All clean! Pick another friend or add more mud.'); }
      }
      let initialSamples = 1;
      function reset() {
        erased = []; finished = false; stage.querySelector('.wash-world').classList.remove('clean'); progress.style.width = '0'; const r = canvas.getBoundingClientRect(); draw(ctx, r.width, r.height);
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; initialSamples = 0; for (let i = 3; i < data.length; i += 4 * 25) if (data[i] > 30) initialSamples++;
        hint('Rub away the mud with your sponge.');
      }
      on(canvas, 'pointerdown', e => { e.preventDefault(); pointers.add(e.pointerId); canvas.setPointerCapture(e.pointerId); rub(e); });
      on(canvas, 'pointermove', e => { if (pointers.has(e.pointerId)) rub(e); });
      const end = e => { pointers.delete(e.pointerId); }; on(canvas, 'pointerup', end); on(canvas, 'pointercancel', end);
      stage.querySelectorAll('[data-wash]').forEach(el => on(el, 'click', () => { stage.querySelector('.wash-picture').innerHTML = art(el.dataset.wash); activate(stage.querySelector('.wash-choices'), el); reset(); }));
      on(stage.querySelector('#mud-again'), 'click', reset);
      // ResizeObserver runs after initial layout; recalibrate dirt coverage on rotation.
      const observer = new ResizeObserver(() => { if (finished) { const r = canvas.getBoundingClientRect(); ctx.clearRect(0, 0, r.width, r.height); } else { const r = canvas.getBoundingClientRect(); const previous = erased; erased = []; draw(ctx, r.width, r.height); const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data; initialSamples = 0; for (let i = 3; i < data.length; i += 4 * 25) if (data[i] > 30) initialSamples++; erased = previous; draw(ctx, r.width, r.height); } }); observer.observe(canvas); disposers.push(() => observer.disconnect());
      reset();
    },
  };
  function sorting(mode) {
    const definitions = {
      shapes: [{ key: 'circle', label: 'Circle', shape: true, color: palette[0] }, { key: 'square', label: 'Square', shape: true, color: palette[3] }, { key: 'triangle', label: 'Triangle', shape: true, color: palette[2] }, { key: 'star', label: 'Star', shape: true, color: palette[1] }],
      colors: [{ key: 'coral', label: 'Coral', color: palette[0] }, { key: 'yellow', label: 'Yellow', color: palette[1] }, { key: 'green', label: 'Green', color: palette[2] }, { key: 'blue', label: 'Blue', color: palette[3] }],
      feed: [{ key: 'rabbit', label: 'Rabbit', food: 'carrot' }, { key: 'monkey', label: 'Monkey', food: 'banana' }, { key: 'cow', label: 'Cow', food: 'apple' }],
    };
    const items = definitions[mode];
    let selected = null;
    const content = (item, target = false) => mode === 'feed' ? art(target ? item.key : item.food) : `<span class="sort-shape ${mode === 'colors' ? 'circle' : item.key}" style="--shape-color:${item.color}">${item.key === 'star' ? '★' : ''}</span>`;
    stage.innerHTML = `${tool('<button class="soft-button" id="sort-again">Play again</button><span class="tool-note">Drag, or tap one thing and then its home.</span>')}<div class="sort-board ${mode}"><div class="sort-targets">${items.map(item => `<button class="sort-target" data-key="${item.key}" aria-label="${mode === 'feed' ? `Feed ${item.label} a ${item.food}` : `${item.label} home`}" style="--shape-color:${item.color || '#e3be91'}">${content(item, true)}<span class="target-label">${item.label}</span><span class="target-happy">${mode === 'feed' ? 'Yum!' : '✓'}</span></button>`).join('')}</div>${shuffled(items).map((item, i) => `<button class="sort-piece draggable" data-key="${item.key}" aria-label="${mode === 'feed' ? item.food : item.label}" style="left:${10 + i * (items.length === 3 ? 29 : 22)}%;top:68%">${content(item)}</button>`).join('')}</div>`;
    const board = stage.querySelector('.sort-board'); const targets = board.querySelectorAll('.sort-target');
    function place(piece, target) {
      if (!piece || !target || piece.disabled) return false;
      if (matches(piece.dataset.key, target.dataset.key)) {
        piece.disabled = true; piece.classList.add('sorted'); piece.classList.remove('chosen'); target.classList.add('filled'); selected = null; celebrate(target);
        if (board.querySelectorAll('.sorted').length === items.length) hint(mode === 'feed' ? 'Happy tummies, happy friends! Play again?' : 'Every little thing found its home! Play again?');
        return true;
      }
      target.classList.add('gentle-wiggle'); later(() => target.classList.remove('gentle-wiggle'), 450); hint(mode === 'feed' ? 'Try their favourite snack.' : 'Try another little home.'); return false;
    }
    board.querySelectorAll('.sort-piece').forEach(el => drag(el, board, ({ x, y, moved, origin }) => {
      if (!moved) { selected?.classList.remove('chosen'); selected = el; el.classList.add('chosen'); return; }
      const target = targetAt(targets, x, y);
      if (!place(el, target)) { el.style.left = origin.left; el.style.top = origin.top; }
    }));
    targets.forEach(el => on(el, 'click', () => place(selected, el)));
    on(stage.querySelector('#sort-again'), 'click', () => { board.querySelectorAll('.sort-piece').forEach((el, i) => { el.disabled = false; el.classList.remove('sorted', 'chosen'); el.style.left = `${10 + i * (items.length === 3 ? 29 : 22)}%`; el.style.top = '68%'; }); targets.forEach(el => el.classList.remove('filled')); selected = null; hint('Drag, or tap one thing and then its home.'); });
  }
  implementations[id]?.();
  return () => { scope.abort(); timers.forEach(clearTimeout); timers.clear(); disposers.forEach(fn => fn()); };
}
