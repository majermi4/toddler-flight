const eyes = '<circle cx="40" cy="48" r="3" fill="#39493f"/><circle cx="60" cy="48" r="3" fill="#39493f"/><path d="M45 62q5 6 10 0" fill="none" stroke="#39493f" stroke-width="2.5" stroke-linecap="round"/>';
const drawings = {
  cat: `<path d="M23 38 21 13 42 25M59 25 80 13 77 39" fill="#e6ac75"/><ellipse cx="50" cy="53" rx="33" ry="31" fill="#efbc89"/><path d="m26 24 3 12 9-8m26 0 10-4-3 12" fill="#df8f85"/>${eyes}<path d="m46 55 4 4 4-4" fill="#bf7664"/><path d="M18 54h16m-15 8 15-3m32-5h16m-16 5 15 3" stroke="#a67757" stroke-width="2"/>`,
  dog: `<ellipse cx="25" cy="40" rx="14" ry="25" fill="#996e52" transform="rotate(20 25 40)"/><ellipse cx="75" cy="40" rx="14" ry="25" fill="#996e52" transform="rotate(-20 75 40)"/><ellipse cx="50" cy="52" rx="30" ry="33" fill="#d9a77a"/>${eyes}<ellipse cx="50" cy="59" rx="13" ry="10" fill="#f5d7b8"/><ellipse cx="50" cy="55" rx="6" ry="4" fill="#614b3a"/><path d="M46 64q4 14 8 0" fill="#de8d88"/>`,
  cow: `<path d="M30 25 23 9q18 2 17 17m20 0q-1-15 17-17l-7 16" fill="#d6ad70"/><ellipse cx="18" cy="37" rx="14" ry="9" fill="#adc3b0"/><ellipse cx="82" cy="37" rx="14" ry="9" fill="#adc3b0"/><rect x="22" y="22" width="56" height="60" rx="25" fill="#fffaf0"/><path d="M22 40q-2-25 20-17l7 14-15 13" fill="#64766b"/>${eyes}<ellipse cx="50" cy="66" rx="27" ry="16" fill="#e4a4a0"/><circle cx="40" cy="65" r="3" fill="#9b6562"/><circle cx="60" cy="65" r="3" fill="#9b6562"/>`,
  rabbit: `<ellipse cx="35" cy="22" rx="10" ry="23" fill="#ded7cc" transform="rotate(-12 35 22)"/><ellipse cx="65" cy="22" rx="10" ry="23" fill="#ded7cc" transform="rotate(12 65 22)"/><ellipse cx="35" cy="21" rx="4" ry="15" fill="#e1aaa7"/><ellipse cx="65" cy="21" rx="4" ry="15" fill="#e1aaa7"/><ellipse cx="50" cy="58" rx="32" ry="29" fill="#e7e1d7"/>${eyes}<path d="m46 57 4 5 4-5" fill="#db9e9e"/>`,
  monkey: `<circle cx="19" cy="48" r="15" fill="#ab7d5d"/><circle cx="81" cy="48" r="15" fill="#ab7d5d"/><circle cx="50" cy="48" r="34" fill="#ab7d5d"/><path d="M23 52c-7-29 22-32 27-17 5-15 34-12 27 17 0 35-54 35-54 0" fill="#f0c9a2"/>${eyes}<path d="M45 56h10" stroke="#a67d60" stroke-width="3" stroke-linecap="round"/>`,
  bird: `<ellipse cx="48" cy="57" rx="29" ry="28" fill="#d5ac55"/><circle cx="53" cy="35" r="19" fill="#e7c36a"/><path d="m71 32 18 8-18 7" fill="#cb8054"/><path d="M22 47q-27-16-17 17l19 4" fill="#d5ac55"/><path d="M32 54q21-15 19 16-18 11-19-16" fill="#f3dc95"/><circle cx="59" cy="32" r="3" fill="#39493f"/><path d="M40 84v9m14-9v9" stroke="#af774e" stroke-width="3"/>`,
  fish: `<path d="m30 44-23-15v42l23-15" fill="#d28c70"/><ellipse cx="56" cy="50" rx="30" ry="24" fill="#eeab83"/><path d="m48 26 14-17 9 21m-25 8q-16 14 0 27" fill="#d88c69"/><circle cx="71" cy="44" r="3" fill="#39493f"/><path d="M75 56q-4 4-8 0" stroke="#9c614d" fill="none" stroke-width="2"/>`,
  sheep: `<g fill="#f5f0e6"><circle cx="50" cy="46" r="32"/><circle cx="24" cy="40" r="17"/><circle cx="30" cy="22" r="17"/><circle cx="52" cy="18" r="17"/><circle cx="73" cy="30" r="17"/><circle cx="78" cy="49" r="17"/></g><ellipse cx="50" cy="57" rx="23" ry="28" fill="#9a9e8b"/><ellipse cx="21" cy="47" rx="13" ry="7" fill="#9a9e8b"/><ellipse cx="79" cy="47" rx="13" ry="7" fill="#9a9e8b"/>${eyes}`,
  frog: `<circle cx="30" cy="28" r="16" fill="#8cad7c"/><circle cx="70" cy="28" r="16" fill="#8cad7c"/><ellipse cx="50" cy="58" rx="39" ry="29" fill="#a9c592"/><circle cx="30" cy="28" r="8" fill="#fcfaeb"/><circle cx="70" cy="28" r="8" fill="#fcfaeb"/><circle cx="31" cy="28" r="4" fill="#39493f"/><circle cx="69" cy="28" r="4" fill="#39493f"/><path d="M33 62q17 15 34 0" fill="none" stroke="#547958" stroke-width="3" stroke-linecap="round"/>`,
  butterfly: `<path d="M45 48C10-7-11 33 24 57 0 90 32 100 45 62M55 48C90-7 111 33 76 57 100 90 68 100 55 62" fill="#b6a6ce"/><path d="M45 47c-22-30-34-16-20 4m30-4c22-30 34-16 20 4" fill="#e6d5e7"/><path d="M50 32v41m-1-42-9-12m11 12 9-12" stroke="#6d6584" stroke-width="6" stroke-linecap="round"/>`,
  plane: `<path d="m12 49 30-5 8-32 10-1 1 32 26 4q17 5 0 11l-26 1-10 28-9-1 1-27-29-2-9 12H5l3-18-3-18h9z" fill="#edaa80"/><path d="M13 47h67q17 3 8 7H15" fill="#f8d6b0"/><circle cx="74" cy="49" r="3" fill="#866854"/>`,
  train: `<rect x="9" y="30" width="52" height="43" rx="9" fill="#91b6a2"/><rect x="16" y="15" width="32" height="43" rx="5" fill="#b5d0ba"/><rect x="23" y="23" width="18" height="22" rx="3" fill="#fff6dd"/><path d="M59 44h29v29H59" fill="#d9a670"/><path d="M65 44V31h11v13" fill="#b28258"/><circle cx="28" cy="76" r="11" fill="#596d65"/><circle cx="72" cy="76" r="11" fill="#596d65"/><circle cx="28" cy="76" r="4" fill="#f0e4c8"/><circle cx="72" cy="76" r="4" fill="#f0e4c8"/>`,
  car: `<path d="m19 49 11-23h35l17 23" fill="#edb976"/><path d="m35 31-8 18h23V31m7 0v18h17L61 31" fill="#f8efd9"/><rect x="9" y="48" width="83" height="25" rx="11" fill="#d98d64"/><circle cx="28" cy="73" r="12" fill="#58635e"/><circle cx="74" cy="73" r="12" fill="#58635e"/><circle cx="28" cy="73" r="5" fill="#f8efd9"/><circle cx="74" cy="73" r="5" fill="#f8efd9"/>`,
  boat: `<path d="m7 64 19 22h50l18-22" fill="#a5b9ca"/><path d="M50 13v50" stroke="#9d7b56" stroke-width="4"/><path d="m45 17-28 41h28" fill="#f3d59b"/><path d="m55 26 24 32H55" fill="#e59c81"/><path d="M10 92q10-7 20 0t20 0 20 0 20 0" stroke="#779aaa" fill="none" stroke-width="3"/>`,
  tractor: `<rect x="7" y="47" width="75" height="24" rx="5" fill="#9bb77e"/><path d="M14 47V23h34v38" fill="#b4c999"/><rect x="20" y="30" width="20" height="22" rx="2" fill="#f8f1dc"/><path d="M67 47V31h7v16" fill="#65745b"/><circle cx="30" cy="71" r="20" fill="#69705b"/><circle cx="30" cy="71" r="10" fill="#ddbe79"/><circle cx="78" cy="75" r="13" fill="#69705b"/><circle cx="78" cy="75" r="6" fill="#ddbe79"/>`,
  carrot: `<path d="M47 27 37 7m15 19 8-19m-7 19 21-9" stroke="#93aa70" stroke-width="8" stroke-linecap="round"/><path d="M27 30q25-20 44 0L50 93z" fill="#e7a16a"/><path d="m37 43 11 3m3 11 11 3m-19 11 10 3" stroke="#c5834f" stroke-width="3"/>`,
  banana: `<path d="M24 17c-5 48 29 64 60 33-12 56-69 57-72 16-2-21 4-38 12-49" fill="#eccb72"/><path d="M23 24c-4 44 25 62 58 33" fill="none" stroke="#d6ae52" stroke-width="3"/><path d="m19 18 6-6" stroke="#7e8054" stroke-width="8"/>`,
  apple: `<path d="M50 26q-34-17-34 19 0 40 27 40l7-4 8 4c28 0 32-42 24-53-9-14-23-11-32-6" fill="#d8907b"/><path d="M50 28V13" stroke="#967250" stroke-width="5"/><path d="M51 19q6-21 25-15-3 22-25 15" fill="#94ac7b"/>`,
  ball: `<circle cx="50" cy="50" r="36" fill="#eeb28b"/><path d="M18 34q37 22 54 44M24 76q36-20 54-51" stroke="#fff1ca" stroke-width="13" fill="none"/><circle cx="50" cy="50" r="36" fill="none" stroke="#d99470" stroke-width="2"/>`,
  flower: `<path d="M50 49v44m0-14q-30 0-24-19 19-2 24 19m1-10q25 0 22-18-19 0-22 18" fill="#8da77d" stroke="#8da77d" stroke-width="4"/><g fill="#d8a3b4"><circle cx="50" cy="20" r="15"/><circle cx="72" cy="35" r="15"/><circle cx="63" cy="59" r="15"/><circle cx="37" cy="59" r="15"/><circle cx="28" cy="35" r="15"/></g><circle cx="50" cy="38" r="15" fill="#ead08b"/>`,
  star: '<path d="m50 8 13 27 30 4-22 22 5 30-26-14-26 14 5-30L7 39l30-4z" fill="#edcd77"/>',
  brush: '<path d="m53 48 24-38q7-9 13-2t-1 14L62 57" fill="#c59a75"/><path d="m45 43 22 15-11 15-23-16" fill="#c8c7c0"/><path d="M37 56q-24-4-22 21-1 12-9 13 30 12 47-20" fill="#ae9ccc"/>',
};
export const animalNames = ['cat', 'dog', 'cow', 'rabbit', 'monkey', 'bird', 'fish', 'sheep', 'frog'];
export function art(name, className = '', label = '') {
  return `<svg class="art ${className}" viewBox="0 0 100 100" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'} xmlns="http://www.w3.org/2000/svg">${drawings[name] || drawings.star}</svg>`;
}
export function icon(name, size = 22) {
  const paths = {
    arrow: '<path d="m5 12 14 0m-5-5 5 5-5 5"/>',
    back: '<path d="M19 12H5m6-6-6 6 6 6"/>',
    sound: '<path d="m11 5-5 4H3v6h3l5 4zM15 8q5 4 0 8m3-11q8 7 0 14"/>',
    mute: '<path d="m11 5-5 4H3v6h3l5 4zM16 9l6 6m0-6-6 6"/>',
    heart: '<path d="M12 20S2 14 2 8c0-6 8-6 10-1 2-5 10-5 10 1 0 6-10 12-10 12z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m9 3-1 3-3 1-2 3 2 2-1 3 3 2 1 3h4l1-3 3-1 2-3-2-2 1-3-3-2-1-3z"/>',
    refresh: '<path d="M20 8a8 8 0 1 0 0 8M20 3v6h-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    cloud: '<path d="M6 18a5 5 0 0 1-1-10 7 7 0 0 1 13-1 5.5 5.5 0 0 1 0 11z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    fullscreen: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
    leaf: '<path d="M4 20 17 7M5 16C-1 4 12 2 21 3c0 12-5 20-16 13z"/>',
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star || paths.check}</svg>`;
}
export function heroArt() {
  return `<svg viewBox="0 0 600 290" class="hero-art" aria-hidden="true"><path d="M18 237C91 108 202 114 262 166S424 244 592 52" fill="none" stroke="#a9bba4" stroke-width="2" stroke-dasharray="5 9"/><g fill="#fffaf0"><path d="M78 90c-35 0-43-33-12-42-7-41 60-51 72-14 41-19 65 15 40 35 25 20-2 32-25 21z"/><path d="M376 251c-28 0-33-28-9-35-6-32 49-40 57-11 34-15 52 12 33 28 20 16-2 25-21 18z"/><path d="M435 61c-24 0-28-24-7-29-4-27 41-34 49-9 28-12 44 9 27 23 18 13-1 22-18 15z"/></g><g transform="translate(160 60) rotate(-13 150 90)"><path d="M35 98 276 54q38 7 8 27L46 133 15 115z" fill="#e7a177"/><path d="m117 86 58-67 47-8-27 73" fill="#f2bd8c"/><path d="m124 113 99 48 43-12-61-59" fill="#cb805c"/><path d="m43 106-29-46 27-6 39 46" fill="#f2bd8c"/><path d="M49 116 276 62q17 4 2 11L48 124" fill="#f7d5ad"/><g fill="#876f5b"><ellipse cx="236" cy="69" rx="5" ry="4"/><ellipse cx="214" cy="74" rx="5" ry="4"/><ellipse cx="192" cy="78" rx="5" ry="4"/></g></g><g fill="#d4b573"><path d="m77 182 3-10 3 10 10 3-10 3-3 10-3-10-10-3z"/><path d="m397 107 3-9 3 9 9 3-9 3-3 9-3-9-9-3z"/><circle cx="491" cy="169" r="4"/><circle cx="124" cy="143" r="3"/></g></svg>`;
}
export function thumbnail(id) {
  const picks = { paint: ['brush', 'flower'], pairs: ['cat', 'cat'], sounds: ['cow', 'bird'], animals: ['rabbit', 'fish'], bubbles: ['fish', 'ball'], peekaboo: ['rabbit', 'cat'], vehicles: ['train', 'plane'], shapes: ['star', 'ball'], colors: ['apple', 'flower'], feed: ['rabbit', 'carrot'], face: ['monkey', 'star'], stickers: ['bird', 'flower'], music: ['cat', 'bird'], fireflies: ['star', 'frog'], wash: ['car', 'dog'] };
  if (id === 'bubbles') return '<div class="bubble-art"><i></i><i></i><i></i><i></i><i></i></div>';
  if (id === 'shapes') return '<div class="shape-art"><i></i><i></i><i></i></div>';
  if (id === 'colors') return '<div class="color-art"><i></i><i></i><i></i></div>';
  if (id === 'music') return '<div class="piano-art"><i></i><i></i><i></i><i></i><i></i></div>';
  const names = picks[id];
  return `<div class="thumb-art">${art(names[0])}${art(names[1])}<span class="little-spark">✧</span></div>`;
}
