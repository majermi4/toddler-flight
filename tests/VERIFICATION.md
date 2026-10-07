# Browser verification — 7 October 2026

Verified in a Chromium browser using tablet-sized CSS viewports. These checks emulate tablet layout; they do not replace a final test on a physical iPad or Android tablet.

## Layout and runtime

- All 15 games rendered at **1024 × 768** and **768 × 1024**.
- No horizontal overflow in either orientation; no vertical overflow in portrait game screens.
- No browser JavaScript errors or warnings during the interaction checks.

## Interaction checks

- Finger Painting: drew with crayon and rainbow brushes using actual pointer drags; the drawing remained after a reload.
- Animal Pairs: matched all four cards; changed difficulty and received eight cards.
- Animal Sounds: enabled sound, tapped the cow, and verified its animated “Moooo!” call. Sound was then muted again. Real-world audio quality was not assessed on tablet speakers.
- Move the Animals: tapping the fish moved it to the pond.
- Bubble Pop: tapping removed a bubble and produced a sparkle.
- Peekaboo: opened the bush and revealed a rabbit.
- Things That Go: tapping the train started its travel animation.
- Shape Sorter: an incorrect home left the piece playable; all four correct tap matches completed; replay reset all pieces; an actual pointer drag matched the circle.
- Colour Match: completed all four colours.
- Feed a Friend: fed all three correct snacks.
- Funny Faces: tapping the eyes changed their expression.
- Sticker Stories: added a cat sticker, switched to the ocean, then cleared the scene.
- Little Music: pressing a piano key produced a note effect and dance feedback.
- Follow the Fireflies: tapping a firefly brightened it.
- Splash & Shine: four actual pointer sweeps removed the mud, filled the progress bar, and displayed “Squeaky clean!”.
- Parent settings: gentle motion persisted after reload.
- Favourites: saving a game showed it in the favourites filter; removing it cleared the saved favourite.

## Offline check

Stopped the local HTTP preview server completely, then reloaded the app from its service-worker cache. **All 15 games opened with the server stopped.** A colour-matching interaction also succeeded offline. No JavaScript errors were reported. Restarted the server afterward for the delivered preview.

## Automated checks

`npm run check`: syntax checks plus five passing Node tests for card shuffling, semantic matching, animal artwork, install icons, and complete offline asset coverage.
