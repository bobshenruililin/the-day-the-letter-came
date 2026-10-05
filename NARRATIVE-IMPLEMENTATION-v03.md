# The Day the Letter Came · v03 implementation checklist

**Status:** Nine-page director’s cut integrated with the existing playable chapters. Checked against the supplied v03 brief and current `dist/game.js`, `dist/finale.js`, `dist/story.js` and `dist/mechanics.js` on 5 October 2026. All 64 automated checks pass, and the final artwork and reading flow were reviewed in the Codex in-app browser. This records a local build and makes no publication claim.

## Accepted flow

- [x] Childhood football, Mother’s work, the first retained reply, wet-book handling and the adult-Sheng book match cut remain playable.
- [x] The reciprocal ladder still includes book handoff, secured grip, ascent, descent and supporting the classmate. Manual and watch routes reach the same sequence; releasing support safely pauses it.
- [x] Both valid practice plans, honest letter home, father–daughter page moment, doorway-photo request, Shanghai walk and local Ningbo drive remain in the story.
- [x] Reaching the house automatically parks the car, saves its stop/photos and enters **The same door**. Direct Chapter 4 entry begins there too.
- [x] The final chapter is one linear comic. The requested photograph, records, phone call, shelter and child’s ball are authored page content; inspection, camera selection and manual kicking are no longer progression gates.
- [x] A snack stop changes the welcome’s bag detail. An actually collected road photograph can appear as a thumbnail. Direct/scenic visits and no-photo visits reach the same full conversation without a required album or substitute quiz.
- [x] All nine pages contain complete text when presented. A brief art entrance may settle on an early input; it never withholds essential dialogue. Reading never advances on a timer.
- [x] The final exchange saves completion on presentation, without another click. Optional transcript, rereading, family records, notes and the father coda remain secondary reading/navigation.
- [x] The coda retains the shared workshop routine, bad kick, original qiaopi, two folds and handover, then returns through explicit 1948/present-day cues to **Still here**.

## Nine-page acceptance

| Stable ID | Implemented beat and continuity requirement |
| --- | --- |
| `same_door` | Present-day household, Jo and friend; doorway photograph causes Auntie to fetch the records. Road details are small foreground additions. |
| `kept` | Chunxiu’s notebook includes mending and ball repair, followed by her retained reply copy and the exact saved childhood line. |
| `sent` | The original full qiaopi is the main reading surface. English/Chinese switching stays on the same page; the courtyard remains its present-day companion. |
| `voice` | Jo calls older Sheng. The original joke and exact childhood message connect notebook and memory. |
| `of_course` | Fare, roof, shoes and Sheng’s childhood anger remain; the answer is not rewritten as grateful obedience. |
| `little_one` | Father did return later; an authored reunion shows him looking up at his taller son. No exact reunion year is introduced. |
| `before_dark` | A labelled Ningbo 1948 / around 2015 courtyard pairing carries Mother’s permission to play and the occupied present-day yard. |
| `show_me` | The phone turns toward the courtyard and shelter; a present-day child’s request supplies the ball-return cue. No view quota or camera exercise interrupts it. |
| `still_here` | A gentle return pass leads to “Don’t hang up yet” / “All right.” Two separate places remain joined by an open call; no forced return migration or debt repayment becomes the ending. |

## Saved state and replay contract

| State | Actual behavior |
| --- | --- |
| `reply` | The first `football`, `trick` or `goal` choice is retained. Its exact callback appears in `kept`, `voice` and the transcript. Same-story replay speaks it. No-choice direct entry uses an external labelled default without saving a fabricated choice. |
| `footballResolution`, `studyPlan` | Existing unfinished/Sheng/Qiang/watch results and either practice plan remain valid saved state and preserve their earlier dialogue consequences. |
| `tripPhotos`, `roadStop` | Valid photographs and direct/scenic/snack stop survive arrival and comic entry. A no-photo visit is complete; photographs never gate reading. |
| `endingPage` | A validated categorical ID is saved whenever a comic page is presented. Unfinished Chapter 4 Continue resumes that page. Invalid IDs become `null`; compatible older completed open-call saves receive `still_here`. |
| `completed`, `resumeEnding` | Presentation of `still_here` saves main completion and its return target. Back and rereading keep completion. Completed Continue restores the final page. Explicit chapter navigation can revisit earlier material. |
| `codaCompleted` | The coda handover records completion and saves Chapter 4, `still_here` and the open-call resume before its explicit return. |
| `readShengLetter` | Reading Sheng’s separate Hong Kong letter through optional post-ending Family records marks it read. The v03 main comic does not add the former optional phone aside. |
| Settings / reset | Text size, dialogue speed, reduced motion, assistance and sound settings are separate from narrative progress. New story clears narrative state and ending position while retaining settings. Comic language starts in English on each new entry. |

Earlier playable chapters resume at their chapter beginning rather than a live rung, road coordinate or dialogue line. Comic page position is saved; art entrance progress, scroll position and language are not. In the source, earlier folder/camera controller functions remain, but the canonical arrival and Chapter 4 entry use the comic. They are not acceptance paths for this cut.

## Reader and accessibility behavior

- [x] Continue, click/tap, Space, E or Enter advance the reader; Back / Left Arrow move back. The final page has secondary rereading and records controls, with no required primary advance.
- [x] Held-key repeats, immediate repeated advances and button bubbling do not consume two pages. Focused button activation performs its own action once.
- [x] Pause, transcript and historical notes preserve the page. Closing dialogs returns focus to the comic. Text selection and clicks on reader controls do not trigger an extra page advance.
- [x] Full transcript, English/Chinese letter switching, enlarged text and reduced motion preserve all essential content. Sound off does not initialize audio and permits full completion.
- [x] Page headings, speaker labels, page status, illustration descriptions and visible focus styles exist in the reader. Failed illustrations reveal descriptive fallbacks while text/navigation stay usable.

These are source and automated behavior checks. Browser screen-reader output, reading comfort, real touch input and cross-engine layout still need direct evaluation.

## Fiction, visual scope and research boundaries

The 1948 child and Hong Kong student are the same Sheng; Jo is his daughter. She encounters the old home through records, photographs and family memory rather than her own childhood in 1948. Grandfather sent the Singapore qiaopi; Chunxiu kept her outgoing reply copy. Sheng’s student letter is a separate fictional family letter. Father’s coda precedes the childhood message and does not quote it.

Characters, records, the study arrangements and the later reunion illustration are original fiction. No production historical-authenticity claim is made for the Ningbo–Singapore route, migration, craft, educational practice, period tools, food, speech or documents. No authenticated dialect, archival remittance amount, exchange rate, official seal or recovered reunion photograph is claimed. The Chinese letter is a modern readable draft. Historical context stays in separate notes; the core comic adds no speculative history lesson.

The earlier family page moment remains a **static illustration with a small page overlay**; **Sheng’s elbow does not animate moving off the page**. The book match cut has two illustrated views. The comic uses composed images, crops and brief decorative entrance/pass/steam/cloth effects rather than a fully animated film. All four final comic images are bundled and reviewed; illustration fallbacks preserve readability if loading fails. Classmates and companions are authored characters, not a live AI-agent system. Duration, emotional response and learning outcomes remain unmeasured.

## Verification evidence

Run from this project folder:

```sh
node tests/verification.mjs
node tests/controller.mjs
node tests/finale.mjs
```

**64 checks pass: 21 mechanics/story, 31 actual-controller scenarios and 12 real-finale-module checks.** Coverage includes preserved passing physics and earlier chapter branches; all three exact messages; all nine pages; the full English and existing Chinese letter; no-photo/photo and all road stops; automatic arrival without former gates; middle-page resume; completion, back and rereading; the coda return; replay/reset; held/rapid/button input; focus and modal pause; settings; sound-off completion; art failure; and one uninterrupted full controller journey.

The controller and finale suites run the production code in a small DOM substitute with a controlled clock. They establish behavior and saved continuity, not rendered layout, art quality, screen-reader usability or hardware support. Obsolete folder/camera quota tests were removed rather than counted as validation of the new flow.

**v03 browser review:** All nine pages were reviewed with the finished artwork. The larger Hong Kong figures fit the apartment. The exact saved childhood sentence appears in the notebook and call; Page 3 reload/Continue restores the full letter, and final reload/Continue restores the open-call spread without another Continue control. Keyboard Back/Enter and transcript/Space each perform only their own action. The Chinese letter was checked at 390 × 844 with Largest text and reduced motion: Fusion Pixel SC rendered at 33.6 px, the letter measured 307 px within a 375 px document, no horizontal overflow was observed, and both companion images loaded.

Evidence is saved in `previews/v03-*.jpg` and [verification-v03.json](verification-v03.json). [COMIC-ASSETS-v03.md](COMIC-ASSETS-v03.md) records the artwork prompts and selected sources. Independent audience comprehension, screen-reader usability, cross-engine behavior and real touch hardware have not been tested. Earlier v02 screenshots are revision history.
