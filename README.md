# The Day the Letter Came · 来信的那天

[Play the hosted game](https://the-day-the-letter-came.bobshenruililin.chatgpt.site).

A browser-playable pixel-art family adventure. The playable v02 chapters lead into the v03 director’s cut: one authored nine-page comic conversation at the family home. The story follows Sheng in Ningbo as a child, the same Sheng in Hong Kong as a young adult, and his daughter Jo in Shanghai and Ningbo. An optional Singapore coda opens after the main ending.

## Play locally

Serve the `dist` folder with a static web server. From this folder:

```sh
python3 -m http.server 4173 --directory dist
```

Open `http://localhost:4173`. A server is needed because the source uses JavaScript modules.

## Current narrative flow

1. **An envelope → One More Goal.** Fold the envelope and enter the childhood courtyard. Football ends at two goals, or Sheng can leave for Mother. Passing sends the ball to the younger child and back, briefly opening the shot. Mother’s call and the return-to-play exchange reflect unfinished, Sheng-won, Qiang-won or watch outcomes. The first chosen childhood message is retained exactly. After an untimed playable return to the yard, pick up the wet schoolbook and place it on the dry table. A book match cut introduces the same Sheng in Hong Kong with a different book.
2. **Upstairs.** A relative, borrowed book and interest in work drawings establish Sheng’s situation. In the study daydream, hand the book over, secure a classmate’s grip, climb, descend and support the classmate’s ascent. Releasing support safely pauses the climb. Two valid practice plans follow: prepare measurements and save the diagram for eight, or try it early and explain it again at eight. Preparation, arrival dialogue and the study partner’s departure differ. Turn the diagram, leave Sheng’s honest sentence intact and fold his letter home. A later father–daughter page moment leads to adult Jo and the doorway-photo request.
3. **The Detour.** Walk to Jo’s friend through Shanghai with optional assistance; commuters do not create a collision challenge. After the journey cue, steer along the painted Ningbo road or let the friend drive. Three passenger photographs are optional. Navigation and album reading park the car. Choose to continue, stop by the water or buy a snack. Reaching the house automatically parks the car, saves the stop and photographs, and opens the comic’s first page.
4. **The Same Door.** Read the nine-page conversation below. The doorway photograph, notebook, qiaopi, call, shelter and gentle ball return are authored within the comic. Progress requires only page navigation. The childhood message appears exactly in the notebook and phone exchange. Photographs and a snack can add small foreground details to the welcome; neither is required.
5. **Before It Arrived.** Open the optional coda from the chapter menu after completion. One workshop interaction permits **Finish together**; further smoothing is optional, and a watch route is available. Father kicks once, reads the established letter, folds it twice and hands it over. Explicit past/present cues return to the completed open-call page and save that return.

## The nine-page ending

Each page presents its complete dialogue immediately. A short art entrance is decorative; it never reveals required words over time. Click, tap or deliberately advance to the next page. Back, transcript, reading settings and historical notes remain available.

| Page | Narrative beat |
| --- | --- |
| **The same door** | Jo and the friend arrive; the doorway photograph prompts Auntie to bring the family records to the table. |
| **What she kept** | Chunxiu’s mending and ball-repair notebook leads to the exact childhood message she copied into her outgoing reply. |
| **What he sent** | Grandfather’s full qiaopi is the primary reading surface, with an English/Chinese switch and the present courtyard alongside it. |
| **The voice** | Jo calls Sheng; the joke and exact retained childhood line connect the record to his memory. |
| **Of course** | Fare, roof and shoes lead to Jo’s question and Sheng’s plain admission that he was angry. |
| **Little one** | Father’s later return is shown at the familiar doorway, looking up at his taller son. |
| **Before dark** | A labelled 1948/present-day courtyard pairing connects Mother’s permission to play with the inhabited yard today. |
| **Show me** | Jo turns the phone toward the yard and shelter; a present-day child asks for the ball. |
| **Still here** | Jo’s gentle return pass leads to “Don’t hang up yet” / “All right,” with the call left open across two separate places. |

Completion is saved when the final page and its full exchange appear. It needs no extra completion button. **Re-read from the door** and **Family records** are secondary actions on that page. Family records offer the notebook, qiaopi, Sheng’s separate Hong Kong letter and an album when photographs exist. The student letter adds no compulsory page or new phone branch in this cut.

See [NARRATIVE-IMPLEMENTATION-v03.md](NARRATIVE-IMPLEMENTATION-v03.md) for acceptance and continuity details.

## Controls and assistance

- WASD or arrows: move, steer, climb or descend during playable scenes.
- Space: the current physical action, such as kick, steady the ladder, wait or brake.
- E or Enter: interact or deliberately advance dialogue and text cards.
- In the comic, Space, E or Enter advances; Left Arrow goes back. Visible **Continue** and **Back** buttons provide mouse/touch navigation. Keyboard activation of a focused button performs its own action once.
- Escape: pause, chapters and reading settings; close a document when it is open.
- Touch devices receive a movement pad during playable scenes.

In football, Space or **Kick toward goal** aims at the doorway. Click the yard to choose a target. Dribbling alone cannot score. Passing, watching and leaving for Mother are available.

For driving, Up / W or **Start driving** moves the car; Left / Right or A / D steers; Space / Down / S or **Park** brakes. Braking takes control back from the friend. Steer toward postcard markers for optional photographs. **Trip album** parks the car. Baskets cause a forgiving slowdown, with no damage or countdown.

Football, the reciprocal ladder, walking, driving and the workshop offer watch or assisted movement. Reading and conversations are untimed. Text size, dialogue text speed, reduced motion and optional synthesized sound are available. The comic always uses complete-page text regardless of dialogue speed. Pixelify Sans and Fusion Pixel SC are locally bundled with their font licenses.

## Saving and replay

Progress, the original childhood message, football resolution, study plan, photographs, holiday stop and completion flags are saved on the current device and browser origin. Same-story childhood replay speaks the committed message. **New story** resets narrative progress, album and ending page while retaining reading settings. Later-chapter entry uses a labelled default when no childhood choice exists; it does not record that default as a player choice.

Before the comic, **Continue** restarts the saved chapter; individual rungs and dialogue positions are not saved. During an unfinished comic, each page saves its stable page ID and **Continue** restores that page. After completion or the coda return, **Continue** restores **Still here**. Going back or rereading keeps completion. Explicitly choosing another chapter begins that chapter; choosing Chapter 4 opens **The same door**. Letter language starts in English on a new comic entry; reading settings persist separately.

## Fiction and production limits

Characters, family records, the student letter and the depicted reunion are original fiction. The Ningbo–Singapore connection, migration route, workshop trade, educational arrangements and period speech remain research questions. The build claims no production historical authenticity, authenticated dialect, archival translation, amount, exchange rate or official seal. The Chinese letter is a modern readable draft. Historical notes remain separate from the dramatic reading.

Chunxiu kept a copy of her outgoing reply. Sheng’s student letter is a separate family letter. Father did return later; no exact reunion year, recovered photograph, surprise death or missed-years total is claimed. The ending does not require Jo to abandon Shanghai or repay a family debt. Companions are authored characters rather than a live AI-agent system.

The earlier father–daughter page scene remains a static illustration with a small page overlay; Sheng’s elbow does not animate moving off the page. The book match cut uses two illustrated views. The comic uses composed illustrations, crops and brief decorative movement, rather than fully animated scenes. Missing illustration files show descriptive fallbacks and do not block reading or completion. All four final comic images are bundled and were reviewed in the browser. Playtime, emotional effect and classroom learning outcomes have not been measured.

## Source

| File | Role |
| --- | --- |
| `dist/index.html` | Interface, dialogs, playable stage and comic host. |
| `dist/game.js` | Controller, playable scenes, arrival, saves, comic integration and sound. |
| `dist/mechanics.js` | Saved-state validation, movement, ball physics, ladder and winding road. |
| `dist/story.js` | Fictional dialogue, exact childhood messages, letters and notebook. |
| `dist/finale.js` / `dist/finale.css` | Nine-page reader, transcript, language switch, accessible controls and layout. |
| `dist/assets` | Generated pixel art, bundled fonts and provenance/license files. |
| `tests/harness.mjs` / `tests/dom.mjs` | Isolated DOM substitute and clock for the actual controller and reader. |

Two optional, feature-detected WebMCP tools read story progress and open chapters through the same navigation rules. They are not required to play.

## Verification

From this folder:

```sh
node tests/verification.mjs
node tests/controller.mjs
node tests/finale.mjs
node tests/assets.mjs
```

**64 automated checks pass: 21 mechanics/story checks, 31 actual-controller scenarios and 12 checks against the actual finale module.** They cover the preserved playable chapters, physical passing, both practice plans, all three exact callbacks, all nine pages and the full bilingual letter, automatic arrival with all stop states and optional photographs, middle-page saves, completion and coda return, replay/reset, held/rapid/button input, pause/focus, sound off, reduced motion, text settings and missing-art fallback. One uninterrupted controller scenario traverses the story and coda.

The suites exercise actual controller and reader code in a lightweight DOM substitute. They verify behavior and continuity; they do not certify rendered art, screen-reader behavior, browser layout or real touch hardware.

**v03 browser review:** All nine pages were reviewed with the finished artwork in the Codex in-app browser. Hong Kong’s larger figures fit the apartment; the comic preserves the saved childhood line; Page 3 reload/Continue restores the letter; final reload/Continue restores the open call without a Continue button. Keyboard Enter on Back moves one page, and Space on Read transcript opens the transcript without advancing. The Chinese letter was checked at 390 × 844 with Largest text and reduced motion: Fusion Pixel SC rendered at 33.6 px, the letter measured 307 px within a 375 px document, no horizontal overflow was observed, and the companion illustrations loaded successfully.

Screenshots are in `previews/v03-*.jpg`; detailed behavior results are in [verification-v03.json](verification-v03.json). [COMIC-ASSETS-v03.md](COMIC-ASSETS-v03.md) records the exact art prompts, source images and crops. This review does not certify independent audience comprehension, screen-reader usability, other browser engines or real touch hardware.

## Sharing release v03.1

The shareable release bundles all thirteen WebP illustrations and both local pixel fonts. Artwork and modules carry a release version so an earlier failed request does not stay cached across revisions. The comic also clears its fallback when an image loads successfully. `tests/assets.mjs` verifies every referenced file and validates the artwork payloads against the actual static publishing directory.
