// Original fiction and English subtitle drafts, adapted from the goal treatment
// and the supplied playable narrative revision v0.2.
// Dates and character names are provisional. LETTER_ZH is a modern readable
// Chinese draft, not an authenticated facsimile or a claim about spoken dialect.
// The controller inserts the selected callback after phoneBeforeCallback and
// beside the last notebook entry. It must retain the first-play choice.

export const REPLIES = [
  {
    id: 'football',
    text: 'Ask if they play football there.',
    callback: 'Do they play football there?',
  },
  {
    id: 'trick',
    text: 'Tell him I want to show him my new trick.',
    callback: 'I want to show him my new trick.',
  },
  {
    id: 'goal',
    text: 'Tell him Qiang keeps moving the goal.',
    callback: 'Qiang keeps moving the goal.',
  },
];

export const SCRIPT = {
  prologue: [
    { speaker: 'SCENE', text: 'Ningbo · 1948\nSheng, about ten.' },
  ],

  footballIntro: [
    { speaker: 'QIANG', text: 'That was out.' },
    { speaker: 'SHENG', text: 'You moved the goal.' },
    { speaker: 'QIANG', text: "It's my shoe." },
    { speaker: 'YOUNGER CHILD', text: 'Pass here!' },
    { speaker: 'SHENG', text: 'All right. Stay there.' },
    { speaker: 'QIANG', text: 'Are we playing or talking?' },
  ],

  mendingExchange: [
    { speaker: 'NEIGHBOUR', text: 'Straighter than when I bought it.' },
    { speaker: 'MOTHER', text: "Don't tell the shop." },
  ],

  motherCall: [
    { speaker: 'MOTHER', text: 'Sheng. Come here a minute.' },
    { speaker: 'SHENG', text: "We're nearly finished." },
    { speaker: 'QIANG', text: "No we're not." },
    { speaker: 'SHENG', text: 'Is that from Dad?' },
    { speaker: 'MOTHER', text: 'Yes.' },
    { speaker: 'SHENG', text: 'What does he say?' },
    { speaker: 'MOTHER', text: "He's working. He asked about you." },
    { speaker: 'SHENG', text: 'Can we write back?' },
    { speaker: 'MOTHER', text: "We’ll write after dinner. What shall I tell him?" },
  ],

  motherCallFinished: [
    { speaker: 'MOTHER', text: 'Sheng. Come here a minute.' },
    { speaker: 'SHENG', text: 'One more?' },
    { speaker: 'QIANG', text: 'That would be a new game.' },
    { speaker: 'SHENG', text: 'Is that from Dad?' },
    { speaker: 'MOTHER', text: 'Yes.' },
    { speaker: 'SHENG', text: 'What does he say?' },
    { speaker: 'MOTHER', text: "He's working. He asked about you." },
    { speaker: 'SHENG', text: 'Can we write back?' },
    { speaker: 'MOTHER', text: "We’ll write after dinner. What shall I tell him?" },
  ],

  motherReplyAfter: [
    { speaker: 'MOTHER', text: "All right. I’ll write that down." },
    { speaker: 'MOTHER', text: 'Go on. Before it gets dark.' },
    { speaker: 'QIANG', text: "Come on. We’re still playing." },
  ],

  motherReplyFinished: [
    { speaker: 'MOTHER', text: "All right. I’ll write that down." },
    { speaker: 'MOTHER', text: 'Go on. Before it gets dark.' },
    { speaker: 'QIANG', text: "Next one's mine." },
  ],

  rain: [
    { speaker: 'SHENG', text: "My schoolbook's getting wet." },
    { speaker: 'MOTHER', text: "Put it here. I'll move the bowl." },
  ],

  hongKongIntro: [
    { speaker: 'SCENE', text: 'The same Sheng\nHong Kong · around 1960\nAbout twenty-two.' },
    { speaker: 'RELATIVE', text: 'You know where everything is now?' },
    { speaker: 'SHENG', text: 'Most of it.' },
    { speaker: 'RELATIVE', text: "Give your mother our address. Tell her you’re eating." },
    { speaker: 'SHENG', text: 'I am eating.' },
    { speaker: 'RELATIVE', text: "Then put that in, too." },
    { speaker: 'SHENG', text: 'Is this your book?' },
    { speaker: 'CLASSMATE', text: 'Until you give it back.' },
    { speaker: 'SHENG', text: 'Tomorrow?' },
    { speaker: 'CLASSMATE', text: "Before tomorrow's class. I'd like to pass as well." },
    { speaker: 'SHENG', text: 'They give me drawings at work. I can follow them.' },
    { speaker: 'CLASSMATE', text: 'Most of them?' },
    { speaker: 'SHENG', text: "I'd like to know what I'm looking at." },
    { speaker: 'CLASSMATE', text: 'This one first, then.' },
  ],

  ladderStart: [
    { speaker: 'SCENE', text: "A study daydream." },
    { speaker: 'SHENG', text: "Is it steady?" },
    { speaker: 'CLASSMATE', text: "Try it. I’ll stay here." },
  ],

  peerHelp: [
    { speaker: 'SHENG', text: 'Could you hold it a moment?' },
    { speaker: 'CLASSMATE', text: 'Give me the book first.' },
  ],

  ladderBook: [
    { speaker: 'STUDY PARTNER', text: "Here. I've got it." },
  ],

  ladderSteady: [
    { speaker: 'CLASSMATE', text: 'All right. Go on.' },
  ],

  ladderTop: [
    { speaker: 'CLASSMATE', text: "What's it like up there?" },
    { speaker: 'SHENG', text: 'Come and look.' },
    { speaker: 'CLASSMATE', text: "You're on the ladder." },
  ],

  ladderSwap: [
    { speaker: 'SHENG', text: 'All right. Swap.' },
  ],

  ladderReciprocalEnd: [
    { speaker: 'CLASSMATE', text: 'You left the page folded.' },
    { speaker: 'STUDY PARTNER', text: 'That explains the missing corner.' },
  ],

  schedulePrompt: [
    { speaker: 'CLASSMATE', text: "Tomorrow, I can’t get here before eight. My shift finishes late." },
    { speaker: 'SHENG', text: "I'll leave my notes." },
    { speaker: 'CLASSMATE', text: 'I need you to explain that bit. Not just the answer.' },
    { speaker: 'SHENG', text: "Let me see what we can move." },
    { speaker: 'STUDY PARTNER', text: "I can't stay much after eight." },
  ],

  practicePlanA: [
    { speaker: 'STUDY PARTNER', text: 'Measurements first?' },
    { speaker: 'SHENG', text: "Yes. We'll do the diagram when he gets here." },
    { speaker: 'STUDY PARTNER', text: "Move the bag, then. That's his chair." },
  ],

  practicePlanB: [
    { speaker: 'STUDY PARTNER', text: 'We can try it once.' },
    { speaker: 'SHENG', text: "And I'll go through it with him at eight." },
    { speaker: 'STUDY PARTNER', text: 'Keep the rough work. Not just the neat answer.' },
  ],

  arrivalPlanA: [
    { speaker: 'CLASSMATE', text: 'Sorry. Am I too late?' },
    { speaker: 'SHENG', text: 'We saved this part. Sit here.' },
  ],

  arrivalPlanB: [
    { speaker: 'CLASSMATE', text: 'Have you finished?' },
    { speaker: 'SHENG', text: "One attempt. I've kept the steps. Sit down." },
  ],

  peerDiagram: [
    { speaker: 'CLASSMATE', text: "I can see the answer. I can't follow the steps." },
    { speaker: 'SHENG', text: "Let's go through it from the beginning. Start with this line." },
    { speaker: 'CLASSMATE', text: 'This edge?' },
    { speaker: 'SHENG', text: 'Yes.' },
    { speaker: 'CLASSMATE', text: 'I thought you were looking at the other side.' },
  ],

  diagramTurned: [
    { speaker: 'SHENG', text: "Ah. That's what I did." },
    { speaker: 'CLASSMATE', text: 'I only asked.' },
  ],

  peerDiagramPartner: [
    { speaker: 'STUDY PARTNER', text: 'Ask the next bit as well.' },
  ],

  studyPartnerLeave: [
    { speaker: 'STUDY PARTNER', text: 'I have to go.' },
    { speaker: 'SHENG', text: 'All right. Thanks.' },
  ],

  earlyPractice: [
    { speaker: 'STUDY PARTNER', text: 'We can start with the measurements.' },
    { speaker: 'SHENG', text: "Yes. Save the diagram for eight." },
    { speaker: 'STUDY PARTNER', text: 'Leave him a seat.' },
  ],

  lateArrival: [
    { speaker: 'CLASSMATE', text: 'Sorry. Am I too late?' },
    { speaker: 'SHENG', text: 'We saved this part. Sit here.' },
    { speaker: 'CLASSMATE', text: "I can see the answer. I can’t follow the steps." },
    { speaker: 'SHENG', text: "Let's go through it from the beginning. Start with this line." },
    { speaker: 'CLASSMATE', text: 'Good. I got lost about halfway.' },
    { speaker: 'STUDY PARTNER', text: 'So did I.' },
  ],

  hongKongEnd: [
    { speaker: 'SHENG, WRITING', text: 'Work is all right. Classes are harder than I expected.' },
    { speaker: 'SHENG', text: "That'll do." },
  ],

  // Optional split cue for the fold interaction; replaces hongKongEnd[1].
  foldingLetter: [
    { speaker: 'SHENG', text: "That'll do." },
  ],

  youngJo: [
    { speaker: 'SCENE', text: 'Years later · Hong Kong.' },
    { speaker: 'YOUNG JO', text: 'Dad.' },
    { speaker: 'SHENG', text: 'One minute.' },
    { speaker: 'YOUNG JO', text: "You're on it." },
  ],

  photoRequest: [
    { speaker: 'SHENG', text: 'When you go, take a photograph of the doorway.' },
    { speaker: 'JO', text: "I've got the old one." },
    { speaker: 'SHENG', text: 'The left side too. The step.' },
    { speaker: 'JO', text: 'All right.' },
  ],

  shanghai: [
    { speaker: 'SCENE', text: "Shanghai · around 2015\nJo, Sheng's daughter, in her early thirties." },
    { speaker: 'COLLEAGUE', text: 'Have you sent the revisions?' },
    { speaker: 'JO', text: "Yes. They're in your inbox." },
    { speaker: 'COLLEAGUE', text: "Then go. Have a good break." },
    { speaker: 'JO', text: 'Dad wants a photo of the old house.' },
    { speaker: 'FRIEND', text: 'I thought this was a holiday.' },
    { speaker: 'JO', text: 'It is. One stop.' },
    { speaker: 'FRIEND', text: "That's what you said about the other stop." },
    { speaker: 'JO', text: "I told Auntie we might come." },
    { speaker: 'FRIEND', text: 'All right. But I am choosing lunch.' },
    { speaker: 'JO', text: 'You already chose lunch.' },
    { speaker: 'FRIEND', text: 'Tomorrow, then.' },
  ],

  shanghaiGreeting: [
    { speaker: 'FRIEND', text: 'There you are.' },
    { speaker: 'JO', text: 'I like it down here.' },
  ],

  ningboArrival: [
    { speaker: 'FRIEND', text: 'Are these the directions?' },
    { speaker: 'JO', text: 'Auntie sent them. She says to look for the wall at the last turn.' },
    { speaker: 'FRIEND', text: "I'll read them. You watch the road." },
    { speaker: 'JO', text: 'Thank you.' },
  ],

  roadNavigation: [
    { speaker: 'FRIEND', text: 'After the bridge, follow the wall.' },
    { speaker: 'JO', text: 'Which wall?' },
    { speaker: 'FRIEND', text: 'She\'s underlined "old."' },
    { speaker: 'JO', text: 'That narrows it down.' },
  ],

  roadScenic: [
    { speaker: 'FRIEND', text: "There’s the water." },
    { speaker: 'JO', text: "We've got time." },
    { speaker: 'FRIEND', text: 'Good. I want to get out and look.' },
    { speaker: 'JO', text: 'So do I.' },
  ],

  roadSnack: [
    { speaker: 'FRIEND', text: 'There. Lunch.' },
    { speaker: 'JO', text: 'You can choose when we stop.' },
    { speaker: 'FRIEND', text: 'I chose yesterday.' },
    { speaker: 'JO', text: 'Get enough for Auntie too.' },
  ],

  roadArrival: [
    { speaker: 'FRIEND', text: 'There. The doorway in the photograph.' },
    { speaker: 'JO', text: 'Yes. That must be it.' },
  ],

  snackArrival: [
    { speaker: 'JO', text: 'We brought something.' },
    { speaker: 'AUNTIE', text: 'Enough for the whole lane.' },
    { speaker: 'FRIEND', text: 'We were hungry when we bought it.' },
  ],

  albumOffer: [
    { speaker: 'FRIEND', text: "I'll send you what I took." },
    { speaker: 'JO', text: "Thanks. I'll show Auntie." },
  ],

  // Use with an actual thumb-obscured photograph in the saved trip album.
  albumShare: [
    { speaker: 'AUNTIE', text: 'And this?' },
    { speaker: 'FRIEND', text: 'My thumb.' },
    { speaker: 'JO', text: 'She took that one especially.' },
  ],

  albumSharePlain: [
    { speaker: 'AUNTIE', text: 'Let me see.' },
    { speaker: 'JO', text: 'Here.' },
  ],

  courtyardArrival: [
    { speaker: 'AUNTIE', text: "You're Sheng's daughter?" },
    { speaker: 'JO', text: 'Jo. Yes.' },
    { speaker: 'AUNTIE', text: 'Come in. Leave the bags there.' },
    { speaker: 'JO', text: 'Dad asked me to take a photo.' },
    { speaker: 'AUNTIE', text: "Of course he did. Sit down first. I'll put the kettle on." },
  ],

  step: [
    { speaker: 'JO', text: "This is the doorway from Dad's photograph." },
    { speaker: 'AUNTIE', text: 'Yes. Mind the chipped bit on the left.' },
    { speaker: 'JO', text: 'He told me the ball did that.' },
    { speaker: 'AUNTIE', text: 'Then you can ask him about it.' },
  ],

  folderIntro: [
    { speaker: 'AUNTIE', text: 'Let me see that.' },
    { speaker: 'JO', text: 'This one?' },
    { speaker: 'AUNTIE', text: "We kept the photographs with the letters. I'll get them." },
  ],

  notebookIntro: [
    { speaker: 'AUNTIE', text: "Your grandmother's notebook. We kept it with the letters." },
    { speaker: 'JO', text: 'Is this the reply she sent?' },
    { speaker: 'AUNTIE', text: 'A copy she kept. The letter she sent went to your grandfather.' },
  ],

  // The controller follows this accessible summary with the exact saved message.
  notebookSummary: [
    { speaker: 'AUNTIE', text: 'She arranged the roof repair. A neighbour was going to help clear the room.' },
    { speaker: 'JO', text: 'And the ball repair came out of her mending money.' },
    { speaker: 'AUNTIE', text: "She kept a copy of her reply, too. Here's your father's message." },
  ],

  studyLetterIntro: [
    { speaker: 'AUNTIE', text: 'This is one your father sent from Hong Kong.' },
  ],

  letterIntro: [
    { speaker: 'AUNTIE', text: 'Your grandfather sent this from Singapore. The letter and the money arrived together.' },
    { speaker: 'JO', text: 'Grandma kept it.' },
    { speaker: 'AUNTIE', text: 'She did.' },
  ],

  shengLetterCall: [
    { speaker: 'JO', text: 'I read one of yours, too. The one about classes.' },
    { speaker: 'SHENG', text: 'She kept that?' },
    { speaker: 'JO', text: 'She kept quite a lot.' },
  ],

  phoneBeforeCallback: [
    { speaker: 'JO', text: 'Dad?' },
    { speaker: 'SHENG', text: 'Did you find it?' },
    { speaker: 'JO', text: 'The house?' },
    { speaker: 'SHENG', text: 'The step. Left side. I chipped it.' },
    { speaker: 'JO', text: 'You said that was the ball.' },
    { speaker: 'SHENG', text: 'I said a lot of things.' },
    { speaker: 'JO', text: "There’s a copy of Grandma’s reply. She wrote down what you wanted her to tell him." },
  ],

  phoneAfterCallback: [
    { speaker: 'SHENG', text: 'Did I say that?' },
    { speaker: 'JO', text: 'You did.' },
    { speaker: 'JO', text: 'This money was for his trip?' },
    { speaker: 'SHENG', text: 'Mm.' },
    { speaker: 'JO', text: 'Did you know?' },
    { speaker: 'SHENG', text: 'Not then.' },
    { speaker: 'JO', text: 'Were you angry?' },
    { speaker: 'SHENG', text: 'Of course. I wanted him home.' },
    { speaker: 'JO', text: 'Did he come back?' },
    { speaker: 'SHENG', text: 'Later. He kept calling me little one.' },
    { speaker: 'SHENG', text: 'I was taller than him.' },
    { speaker: 'JO', text: 'What did Grandma tell you that day?' },
    { speaker: 'SHENG', text: 'To go and play before it got dark.' },
  ],

  finalCamera: [
    { speaker: 'SHENG', text: 'Can you show me the yard?' },
    { speaker: 'JO', text: "Hang on. I'll turn it around." },
    { speaker: 'SHENG', text: "A bit to the left. Yes. That's where the other shoe went." },
    { speaker: 'CHILD', text: 'Can you send it back?' },
  ],

  cameraStep: [
    { speaker: 'SHENG', text: "The step. Left side. Yes, that's it." },
  ],

  shelterRequest: [
    { speaker: 'SHENG', text: 'Can you turn toward the shelter?' },
  ],

  shelterRecall: [
    { speaker: 'SHENG', text: 'She did her mending there.' },
  ],

  ending: [
    { speaker: 'SHENG', text: "Don't hang up yet." },
    { speaker: 'JO', text: 'All right.' },
  ],

  fatherIntro: [
    { speaker: 'SCENE', text: 'Singapore · Before the letter was sent.' },
    { speaker: 'CO-WORKER', text: 'Shall I put these away?' },
    { speaker: 'FATHER', text: "Leave the ones by the door. I'll finish." },
    { speaker: 'CO-WORKER', text: 'Then come outside for a minute.' },
  ],

  fatherSharedRoutine: [
    { speaker: 'CO-WORKER', text: "I'll clear the other end." },
    { speaker: 'FATHER', text: 'All right.' },
  ],

  fatherWorkDone: [
    { speaker: 'CO-WORKER', text: 'Finished?' },
    { speaker: 'FATHER', text: 'Finished enough to sit down.' },
    { speaker: 'CO-WORKER', text: 'You can sit after one kick.' },
  ],

  fatherFootball: [
    { speaker: 'CO-WORKER', text: "You're terrible at this." },
    { speaker: 'FATHER', text: "I'm tired." },
    { speaker: 'CO-WORKER', text: "You've kicked it once." },
    { speaker: 'FATHER', text: 'Exactly.' },
  ],

  fatherLetterEnd: [
    { speaker: 'FATHER, WRITING', text: "If Sheng has outgrown his shoes, get him another pair. Don't let him wait for me." },
    { speaker: 'CO-WORKER', text: 'Ready?' },
    { speaker: 'FATHER', text: 'Yes.' },
  ],
};

// Sheng's retained study letter is new fictional family canon, not a qiaopi.
export const STUDY_LETTER = 'Work is all right. Classes are harder than I expected.';

// Original working fiction. This is not a translation of an archival letter.
export const LETTER = `Chunxiu,

I have sent a little more this time. It was what I had put aside for the fare home. Please have the roof seen to before the rain gets worse. I'll have to come later.

If Sheng has outgrown his shoes, get him another pair. Don't let him wait for me.

You said he uses the doorway for a goal now. When I left, he still had to lift his leg right over that step.

I'm all right here. Tell me how you are, too. Did the cough clear up?`;

// Modern readable drafting material, preserving the supplied provisional text.
export const LETTER_ZH = `春秀：

这次多寄了一些，原是留作回去的船钱。雨要大了，先把屋顶修好。我再攒一阵。

阿盛的鞋若穿不下了，就给他换一双，不要叫他等我。你说他如今拿门口当球门。我走的时候，他过那道门槛还要抬腿。

我这里还好。你也说说你自己，上回的咳嗽好了没有？`;

// Fictional household entries. No invented amount, exchange rate, date or seal.
// Add REPLIES.find(reply => reply.id === savedChoice).callback as a separate
// quoted line after the final entry, both here and in the phone conversation.
export const NOTEBOOK = [
  'Roof repair arranged. A neighbour will help clear the room before the work.',
  'Payment for mending received. Used some to have the ball repaired.',
  'Reply copy: The money arrived. I have arranged the repair. You keep asking whether we have enough. Have you kept enough for yourself?',
  "Sheng's message for the reply:",
];
