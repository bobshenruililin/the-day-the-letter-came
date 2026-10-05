import {REPLIES, SCRIPT, LETTER, LETTER_ZH, NOTEBOOK} from './story.js?v=03.1';
import {ROAD_PHOTOS, ROAD_HEIGHT, roadCenterY} from './mechanics.js?v=03.1';

export const FINAL_PAGE_IDS = Object.freeze([
  'same_door', 'kept', 'sent', 'voice', 'of_course', 'little_one',
  'before_dark', 'show_me', 'still_here',
]);

const PAGE_NAMES = [
  'The same door', 'What she kept', 'What he sent', 'The voice', 'Of course',
  'Little one', 'Before dark', 'Show me', 'Still here',
];
const SUPPORT = {table: [0, 0], notebook: [1, 0], sheng: [0, 1], phone: [1, 1]};
const canonicalMemory = value => {
  const supplied = value && typeof value === 'object' ? value.callback ?? value.id : value;
  return (REPLIES.find(r => r.callback === supplied || r.id === supplied) ?? REPLIES[0]).callback;
};
const pageIndex = value => {
  const found = FINAL_PAGE_IDS.indexOf(value);
  if (found >= 0) return found;
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(8, Math.floor(numeric))) : 0;
};
const speakerName = name => ({JO: 'Jo', AUNTIE: 'Auntie', SHENG: 'Sheng', CHILD: 'Child',
  'SHENG, ON THE CALL': 'Sheng · on the call'}[name] ?? name);
const now = () => globalThis.performance?.now?.() ?? Date.now();

/** The host owns game input and persistence. This reader owns comic-page input. */
export function createFinale({host, onPage, onComplete, onSound, onTranscript, onRecords, getSettings} = {}) {
  if (!host) throw new TypeError('A finale host element is required.');
  const doc = host.ownerDocument ?? document;
  const state = {visible: false, page: 0, id: FINAL_PAGE_IDS[0], completed: false,
    settled: true, language: 'en', memory: REPLIES[0].callback, roadStop: 'direct', tripPhotos: []};
  let entryTimer = null, pageElement = null, letterCopy = null, languageButton = null;
  let lastAdvanceAt = -Infinity, transcriptOpen = false;

  const element = (tag, className = '', text = '') => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  const reader = element('section', 'finale-reader');
  reader.setAttribute('aria-label', 'The final conversation');
  const status = element('p', 'finale-status');
  status.setAttribute('aria-live', 'polite');
  status.setAttribute('aria-atomic', 'true');
  const pages = element('div', 'finale-pages');
  const controls = element('div', 'finale-controls');
  const extra = element('div', 'finale-extra');
  reader.append(status, pages, controls, extra);
  host.classList.add('finale-host');
  host.replaceChildren(reader);
  host.hidden = true;

  const snapshot = () => ({...state, tripPhotos: [...state.tripPhotos]});
  const settings = () => getSettings?.() ?? {};
  const reduced = () => !!settings().reduced ||
    (typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const button = (text, callback, primary = false) => {
    const node = element('button', primary ? 'finale-continue' : 'finale-secondary', text);
    node.type = 'button';
    node.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      callback();
    });
    return node;
  };
  const lines = (items, className = '') => {
    const box = element('div', `finale-lines ${className}`.trim());
    for (const item of items) {
      const row = element('p', 'finale-speech');
      row.dataset.speaker = item.speaker;
      const name = element('strong', 'finale-speaker', speakerName(item.speaker));
      const words = element('span', 'finale-words', item.text);
      row.append(name, words);
      box.append(row);
    }
    return box;
  };
  const image = (file, alt, className = '', position = null) => {
    const frame = element('div', `finale-art ${className}`.trim());
    const picture = element('img');
    picture.alt = alt;
    picture.src = `assets/${file}?v=03.1`;
    picture.draggable = false;
    picture.decoding = 'async';
    if (position) for (const [key, value] of Object.entries(position)) picture.style[key] = value;
    const fallback = element('div', 'finale-image-fallback');
    fallback.hidden = true;
    fallback.setAttribute('role', 'img');
    fallback.setAttribute('aria-label', alt);
    fallback.append(element('span', 'finale-placeholder-shape', '◇'),
      element('p', '', 'Illustration unavailable'), element('p', 'finale-fallback-description', alt));
    picture.addEventListener('error', () => {picture.hidden = true; fallback.hidden = false;});
    picture.addEventListener('load', () => {picture.hidden = false; fallback.hidden = true;});
    frame.append(picture, fallback);
    return frame;
  };
  const support = (which, alt, className = '') => {
    const [column, row] = SUPPORT[which];
    return image('comic-support.webp', alt, `finale-atlas ${className}`, {
      width: '200%', height: '200%', left: `${-100 * column}%`, top: `${-100 * row}%`,
    });
  };
  const yard = (crop = '', alt = 'The inhabited courtyard, with its doorway, worn step and mending shelter.') =>
    image('ningbo-courtyard.webp', alt, `finale-yard ${crop ? `finale-crop-${crop}` : ''}`);
  const figure = (art, speech = [], className = '') => {
    const panel = element('figure', `finale-panel ${className}`.trim());
    if (art) panel.append(art);
    if (speech.length) {
      const caption = element('figcaption');
      caption.append(lines(speech));
      panel.append(caption);
    }
    return panel;
  };
  const strip = (speech, className = '') => {
    const panel = element('section', `finale-panel finale-strip ${className}`.trim());
    panel.append(lines(speech));
    return panel;
  };
  const grid = className => element('div', `finale-grid ${className}`);

  function visitDetails(art) {
    const details = element('div', 'finale-visit-details');
    const bag = element('span', `finale-small-bag ${state.roadStop === 'snack' ? 'finale-snack-bag' : ''}`);
    bag.setAttribute('role', 'img');
    bag.setAttribute('aria-label', state.roadStop === 'snack' ? 'The snack bag from the road stop, brought for Auntie.' : 'The friend sets down a travel bag.');
    details.append(bag);
    const photo = ROAD_PHOTOS.find(p => state.tripPhotos.includes(p.id));
    if (photo) {
      const cropX = Math.max(0, Math.min(660, roadCenterY(photo.y) + photo.dx - 150));
      const cropY = Math.max(0, Math.min(ROAD_HEIGHT - 190, photo.y - 95));
      const thumb = image('ningbo-road.webp', `The friend's collected photograph: ${photo.label}.`, 'finale-trip-thumb', {
        width: '320%', height: `${ROAD_HEIGHT / 190 * 100}%`,
        left: `${-cropX / 300 * 100}%`, top: `${-cropY / 190 * 100}%`,
      });
      details.append(thumb);
    }
    art.append(details);
  }

  function buildPage(index) {
    const page = element('article', `finale-page finale-page--${FINAL_PAGE_IDS[index]}`);
    page.tabIndex = -1;
    page.setAttribute('aria-labelledby', `finale-heading-${FINAL_PAGE_IDS[index]}`);
    const heading = element('h2', 'finale-sr-only', `Page ${index + 1}: ${PAGE_NAMES[index]}`);
    heading.id = `finale-heading-${FINAL_PAGE_IDS[index]}`;
    page.append(heading);
    const callback = {speaker: 'JO', text: state.memory};

    if (index === 0) {
      const layout = grid('finale-arrival-grid');
      const establishing = image('comic-courtyards.webp', 'The courtyard in the present day. Jo, Auntie, the friend and the current household occupy the familiar place.', 'finale-diptych-half finale-diptych-now',
        {width: '100%', height: '200%', left: '0', top: '-100%'});
      visitDetails(establishing);
      layout.append(figure(establishing, [], 'finale-panel-wide'),
        figure(support('table', 'Jo shows Auntie the doorway photograph at the courtyard table.'), [
          {speaker: 'JO', text: 'Dad asked for a photograph.'},
          {speaker: 'AUNTIE', text: "Sit down first. I'll put the kettle on."},
        ]), figure(support('notebook', 'A folder and notebook come to the table.'), [
          {speaker: 'AUNTIE', text: 'Let me see that.'},
          {speaker: 'JO', text: 'His old one?'},
          {speaker: 'AUNTIE', text: "We kept the photographs with the letters. I'll get them."},
        ]));
      page.append(layout);
    }
    if (index === 1) {
      const layout = grid('finale-notebook-grid');
      layout.append(figure(support('notebook', 'Auntie steadies the notebook while Jo turns a page.'), [
        {speaker: 'AUNTIE', text: "Your grandmother's notebook. She kept a copy of what she sent him."},
      ]));
      const records = element('section', 'finale-panel finale-records');
      records.append(element('h3', 'finale-document-name', "Chunxiu's notebook"));
      for (const entry of NOTEBOOK.slice(0, -1)) records.append(element('p', 'finale-record-entry', entry));
      layout.append(records);
      const remembered = element('section', 'finale-panel finale-remembered finale-panel-wide');
      remembered.append(element('p', 'finale-record-label', NOTEBOOK.at(-1)),
        element('blockquote', 'finale-memory', state.memory));
      layout.append(remembered);
      page.append(layout);
    }
    if (index === 2) {
      page.append(strip([SCRIPT.letterIntro[0]], 'finale-letter-intro'));
      const layout = grid('finale-letter-grid');
      const document = element('section', 'finale-panel finale-letter');
      document.append(element('h3', 'finale-sr-only', "Grandfather's qiaopi"));
      letterCopy = element('p', 'finale-letter-copy', state.language === 'zh' ? LETTER_ZH : LETTER);
      letterCopy.lang = state.language === 'zh' ? 'zh-Hans' : 'en';
      document.append(letterCopy);
      const companion = figure(yard('door', 'Beyond the letter, the present courtyard and doorway remain in view.'), [], 'finale-letter-companion');
      companion.append(support('table', 'Jo pauses with the letter beside Auntie at the table.', 'finale-letter-table'));
      layout.append(document, companion);
      page.append(layout);
    }
    if (index === 3) {
      const layout = grid('finale-voice-grid');
      layout.append(figure(support('table', 'Jo speaks on the phone from the family courtyard.'), SCRIPT.phoneBeforeCallback.slice(0, 3)),
        figure(support('sheng', 'The older Sheng holds his phone in a separate present-day room.'), SCRIPT.phoneBeforeCallback.slice(3, 6)));
      const remembered = element('section', 'finale-panel finale-callback-strip finale-panel-wide');
      remembered.append(support('notebook', 'The preserved notebook lies beside Jo during the call.'),
        lines([SCRIPT.phoneBeforeCallback[6], callback, ...SCRIPT.phoneAfterCallback.slice(0, 2)]));
      layout.append(remembered);
      page.append(layout);
    }
    if (index === 4) {
      const layout = grid('finale-of-course-grid');
      layout.append(figure(support('table', 'Jo asks about the letter while the call stays open.'), SCRIPT.phoneAfterCallback.slice(2, 4)),
        figure(support('sheng', 'Sheng listens, his hand resting beside the phone.'), SCRIPT.phoneAfterCallback.slice(4, 7)),
        figure(support('sheng', 'Sheng answers without hiding the disappointment he felt as a child.', 'finale-thoughtful'),
          [SCRIPT.phoneAfterCallback[7]], 'finale-panel-wide finale-answer'));
      page.append(layout);
    }
    if (index === 5) {
      page.append(strip(SCRIPT.phoneAfterCallback.slice(8, 10), 'finale-present-strip'));
      page.append(figure(image('comic-reunion.webp', 'At the familiar doorway, Sheng’s returning father looks up at his taller son.'),
        [{speaker: 'SHENG, ON THE CALL', text: SCRIPT.phoneAfterCallback[10].text}], 'finale-reunion'));
    }
    if (index === 6) {
      const layout = grid('finale-courtyard-grid');
      const past = figure(image('comic-courtyards.webp', 'The known courtyard in 1948: Mother works under the shelter as young Sheng returns toward the other children.',
        'finale-diptych-half finale-diptych-then', {width: '100%', height: '200%', left: '0', top: '0'}),
        [SCRIPT.phoneAfterCallback[11]], 'finale-time-panel');
      past.prepend(element('p', 'finale-time-label', 'Ningbo · 1948'));
      const present = figure(image('comic-courtyards.webp', 'The same courtyard around 2015, occupied by Jo and its present residents.',
        'finale-diptych-half finale-diptych-now', {width: '100%', height: '200%', left: '0', top: '-100%'}),
        [SCRIPT.phoneAfterCallback[12]], 'finale-time-panel');
      present.prepend(element('p', 'finale-time-label', 'Ningbo · around 2015'));
      layout.append(past, present);
      page.append(layout);
    }
    if (index === 7) {
      const layout = grid('finale-camera-grid');
      layout.append(figure(support('phone', 'Jo turns the rear camera of her phone toward the courtyard.'),
        SCRIPT.finalCamera.slice(0, 3), 'finale-panel-wide finale-camera-turn'));
      layout.append(figure(yard('shelter', 'The mending shelter from Sheng’s childhood, still part of the courtyard.'), SCRIPT.shelterRecall));
      const ballArt = yard('foreground', 'A ball rolls into Jo’s foreground, with a present-day child waiting nearby.');
      const ball = element('span', 'finale-pixel-ball finale-waiting-ball');
      ball.setAttribute('aria-hidden', 'true');
      ballArt.append(ball);
      layout.append(figure(ballArt, [SCRIPT.finalCamera[3]]));
      page.append(layout);
    }
    if (index === 8) {
      const art = image('comic-open-call.webp', 'Two separate present-day places share an open call: older Sheng watches his phone; Jo sits in the living courtyard with her phone beside the tea, its rear camera facing the yard. The child has received her gentle return pass.', 'finale-open-call');
      const pass = element('span', 'finale-pixel-ball finale-return-pass');
      pass.setAttribute('aria-hidden', 'true');
      const ballMask = element('span', 'finale-ball-mask');
      ballMask.setAttribute('aria-hidden', 'true');
      const steam = element('span', 'finale-steam');
      steam.setAttribute('aria-hidden', 'true');
      steam.append(element('i'), element('i'), element('i'));
      const cloth = element('span', 'finale-cloth-motion');
      cloth.setAttribute('aria-hidden', 'true');
      art.append(ballMask, pass, steam, cloth);
      page.append(figure(art, SCRIPT.ending, 'finale-final-spread'));
    }
    return page;
  }

  function settle() {
    if (entryTimer !== null) {clearTimeout(entryTimer); entryTimer = null;}
    state.settled = true;
    pageElement?.classList.remove('finale-entering');
    pageElement?.classList.add('finale-settled');
  }
  function readingControls() {
    controls.replaceChildren();
    const secondary = element('nav', 'finale-secondary-nav');
    secondary.setAttribute('aria-label', 'Reading controls');
    const previous = button('‹ Back', back);
    previous.disabled = state.page === 0;
    secondary.append(previous, button('Read transcript', requestTranscript));
    if (state.page === 2) {
      languageButton = button(state.language === 'en' ? '读中文' : 'Read in English', switchLanguage);
      languageButton.setAttribute('aria-label', state.language === 'en' ? 'Read the letter in Chinese' : 'Read the letter in English');
      secondary.append(languageButton);
    }
    if (state.page === 8) {
      secondary.append(button('Re-read from the door', () => render(0)));
      if (onRecords) secondary.append(button('Family records', () => onRecords(snapshot())));
    }
    const progression = element('div', 'finale-progression');
    if (state.page < 8) progression.append(button('Continue ›', advance, true));
    if (state.page === 0) progression.append(element('p', 'finale-input-hint', 'Click, tap or press Space to continue.'));
    controls.append(progression, secondary);
  }
  function refreshSettings() {
    const requested = Number(settings().size ?? 1);
    const scale = Number.isFinite(requested) ? Math.max(1, Math.min(1.6, requested)) : 1;
    reader.style.setProperty('--finale-scale', String(scale));
    reader.classList.toggle('finale-large', scale >= 1.4);
    reader.classList.toggle('finale-reduced', reduced());
    if (reduced()) settle();
  }
  function render(index, notify = true) {
    if (entryTimer !== null) clearTimeout(entryTimer);
    entryTimer = null;
    transcriptOpen = false;
    extra.replaceChildren();
    state.page = pageIndex(index);
    state.id = FINAL_PAGE_IDS[state.page];
    letterCopy = null;
    languageButton = null;
    pageElement = buildPage(state.page);
    pages.replaceChildren(pageElement);
    status.textContent = `Page ${state.page + 1} of ${FINAL_PAGE_IDS.length}`;
    const firstCompletion = state.page === 8 && !state.completed;
    if (state.page === 8) state.completed = true;
    readingControls();
    state.settled = reduced();
    pageElement.classList.add(state.settled ? 'finale-settled' : 'finale-entering');
    refreshSettings();
    if (!state.settled) entryTimer = setTimeout(settle, state.page === 8 ? 900 : 240);
    pageElement.focus?.({preventScroll: true});
    reader.scrollIntoView?.({block: 'start', behavior: 'instant'});
    if (notify) onPage?.(state.id);
    if (firstCompletion) onComplete?.(state.id);
    if (notify) {
      const sound = {same_door: 'paper', kept: 'paper', sent: 'paper', voice: 'phone',
        before_dark: 'ball', show_me: 'ball', still_here: 'kick'}[state.id];
      if (sound) onSound?.(sound);
    }
  }
  function advance() {
    if (!state.visible || transcriptOpen) return snapshot();
    const time = now();
    // Consume accidental double inputs, without imposing a reading pause.
    if (time - lastAdvanceAt < 160) return snapshot();
    lastAdvanceAt = time;
    if (!state.settled) {settle(); return snapshot();}
    if (state.page < 8) render(state.page + 1);
    return snapshot();
  }
  function back() {
    if (!state.visible) return snapshot();
    if (transcriptOpen) {closeTranscript(); return snapshot();}
    if (state.page > 0) render(state.page - 1);
    return snapshot();
  }
  function switchLanguage() {
    if (state.page !== 2 || !letterCopy) return;
    state.language = state.language === 'en' ? 'zh' : 'en';
    letterCopy.textContent = state.language === 'zh' ? LETTER_ZH : LETTER;
    letterCopy.lang = state.language === 'zh' ? 'zh-Hans' : 'en';
    languageButton.textContent = state.language === 'en' ? '读中文' : 'Read in English';
    languageButton.setAttribute('aria-label', state.language === 'en' ? 'Read the letter in Chinese' : 'Read the letter in English');
    settle();
  }
  function transcript() {
    const talk = items => items.map(item => `${speakerName(item.speaker)}: ${item.text}`).join('\n');
    const text = [
      talk([{speaker: 'JO', text: 'Dad asked for a photograph.'}, {speaker: 'AUNTIE', text: "Sit down first. I'll put the kettle on."},
        {speaker: 'AUNTIE', text: 'Let me see that.'}, {speaker: 'JO', text: 'His old one?'},
        {speaker: 'AUNTIE', text: "We kept the photographs with the letters. I'll get them."}]),
      "Auntie: Your grandmother's notebook. She kept a copy of what she sent him.\n\n" + NOTEBOOK.join('\n\n') + '\n' + state.memory,
      talk([SCRIPT.letterIntro[0]]) + '\n\n' + (state.language === 'zh' ? LETTER_ZH : LETTER),
      talk([...SCRIPT.phoneBeforeCallback, {speaker: 'JO', text: state.memory}, ...SCRIPT.phoneAfterCallback.slice(0, 2)]),
      talk(SCRIPT.phoneAfterCallback.slice(2, 8)),
      talk([...SCRIPT.phoneAfterCallback.slice(8, 10), {speaker: 'SHENG, ON THE CALL', text: SCRIPT.phoneAfterCallback[10].text}]),
      talk(SCRIPT.phoneAfterCallback.slice(11, 13)),
      talk([...SCRIPT.finalCamera.slice(0, 3), ...SCRIPT.shelterRecall, SCRIPT.finalCamera[3]]),
      'Jo returns the ball with a gentle pass. The child goes back to playing.\n\n' + talk(SCRIPT.ending),
    ];
    return text.map((page, index) => `${index + 1}. ${PAGE_NAMES[index]}\n\n${page}`).join('\n\n———\n\n');
  }
  function requestTranscript() {
    settle();
    if (onTranscript) {onTranscript(transcript()); return;}
    transcriptOpen = true;
    const panel = element('section', 'finale-transcript');
    panel.setAttribute('aria-label', 'Ending transcript');
    panel.append(element('h2', '', 'Read transcript'), element('p', 'finale-transcript-copy', transcript()),
      button('Return to the page', closeTranscript));
    extra.replaceChildren(panel);
    panel.scrollIntoView?.({block: 'start', behavior: 'instant'});
  }
  function closeTranscript() {transcriptOpen = false; extra.replaceChildren();pageElement?.focus?.({preventScroll: true});}
  function show({page = 0, memory, roadStop = 'direct', tripPhotos = []} = {}) {
    state.visible = true;
    state.completed = false;
    state.language = 'en';
    state.memory = canonicalMemory(memory);
    state.roadStop = ['direct', 'scenic', 'snack'].includes(roadStop) ? roadStop : 'direct';
    state.tripPhotos = [...new Set((Array.isArray(tripPhotos) ? tripPhotos : [])
      .map(photo => typeof photo === 'string' ? photo : photo?.taken === false ? null : photo?.id)
      .filter(id => ROAD_PHOTOS.some(photo => photo.id === id)))];
    lastAdvanceAt = -Infinity;
    host.hidden = false;
    render(page);
    return snapshot();
  }
  function hide() {state.visible = false; settle(); host.hidden = true;}

  reader.addEventListener('click', event => {
    if (event.defaultPrevented || !state.visible || transcriptOpen) return;
    const target = event.target?.closest ? event.target : event.target?.parentElement;
    if (target?.closest?.('button,a,input,select,textarea,summary,details,[role="button"],[contenteditable="true"]')) return;
    if (typeof globalThis.getSelection === 'function' && globalThis.getSelection()?.toString()) return;
    if (event.detail > 1) return;
    advance();
  });

  return {show, advance, back, hide, refreshSettings, getState: snapshot, transcript};
}
