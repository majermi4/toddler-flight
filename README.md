# Little Sky

A tablet-first progressive web app with the **first 15 games from the original numbered list**. All artwork, games, and sound synthesis are local; no account, network API, ads, tracking, external fonts, or purchases.

## Published app

Open [Little Sky](https://majermi4.github.io/toddler-flight/) on your tablet. The app is hosted on GitHub Pages over HTTPS, so installation and offline play are supported.

GitHub Pages publishes the root of the `main` branch. Push changes to `main` to update the hosted app; increment the cache version in `sw.js` whenever app assets change.

## Run locally

Requires Node.js 20 or later. No dependencies to install.

```sh
npm run dev
```

Open http://localhost:4173. For another port, use `PORT=8080 npm run dev`.

To use on a tablet, host these static files on HTTPS. A plain HTTP address on your local network can preview the games, but will **not** enable service workers or offline installation. HTTPS and localhost support offline mode.

## Put it on your tablet before the flight

1. Open the HTTPS app in Safari on iPad, or Chrome on Android.
2. Wait for **Ready for airplane mode** at the bottom of the playroom. This checks that every required file is in the offline cache.
3. iPad: Share → Add to Home Screen. Android: browser menu → Install app / Add to Home screen.
4. Launch the installed app once online, then test in airplane mode before travelling. Browser storage can be evicted by the device, so checking before departure matters.

Both tablet orientations work; no orientation lock. Painting supports multiple fingers, and all dragging games offer a tap-based interaction. Quiet mode is the default. Sound, volume, gentle-motion settings, favourites, and the last painting are stored only on the device. Browser Back returns to the playroom.

## Games

1. Finger Painting — crayon, soft brush, rainbow, star stamps, eraser; saved drawing.
2. Animal Pairs — 2, 3, or 4 shuffled pairs; forgiving reveal time and replay.
3. Animal Sounds — nine illustrated animals, animated calls, and gentle synthesized sound imitations. These are playful synthesized effects, **not recordings of real animals**. Rabbit sniffing and fish bubbles are illustrative.
4. Move the Animals — freely draggable friends in a sky/meadow/pond scene; tapping moves them to a suggested habitat.
5. Bubble Pop — drifting, replenishing bubbles and animal surprises.
6. Peekaboo — friends behind bushes, a box, curtains, and a cloud.
7. Things That Go — animated train, plane, tractor, and boat.
8. Shape Sorter — four shapes with drag or select-and-tap matching.
9. Colour Match — four coloured balls and baskets.
10. Feed a Friend — carrot/rabbit, banana/monkey, apple/cow matching.
11. Funny Faces — change eyes, nose, mouth, and hat; move decorations.
12. Sticker Stories — reusable stickers in meadow, ocean, and space scenes.
13. Little Music — eight simultaneous touchable keys and dancing animals.
14. Follow the Fireflies — gentle night scene with drifting, touchable lights.
15. Splash & Shine — rub actual mud away from a car, dog, or cow; completion measured from remaining mud.

## Checks and assets

```sh
npm run check
node scripts/make-icons.mjs
```

Icons can be regenerated using the included dependency-free PNG generator. The app itself is plain HTML, CSS, and ES modules, ready for static hosting; no build step. When changing deployed assets, increment the cache name in `sw.js` so installed devices receive the new version. The service worker only removes older Little Sky caches.
