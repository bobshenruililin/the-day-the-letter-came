import {createFinale,FINAL_PAGE_IDS} from './finale.js?v=03.1';
import {REPLIES,SCRIPT,LETTER,LETTER_ZH,NOTEBOOK,STUDY_LETTER} from './story.js?v=03.1';
import {clamp,distance,loadStory,rememberReply,chapterWarning,movement,stepBall,stepLadder,stepPromenade,SAVE_KEY,SETTINGS_KEY,DEFAULT_STORY,GOAL,LADDER,ROAD_HEIGHT,ROAD_DISTANCE,ROAD_PHOTOS,roadCenterY,roadPosition,makeRoad,stepDrive} from './mechanics.js?v=03.1';

const $=id=>document.getElementById(id), canvas=$('world'),ctx=canvas.getContext('2d');
const W=960,H=600,keys=new Set();
let storage;try{storage=localStorage;}catch{storage={getItem:()=>null,setItem:()=>{}};}
let story=loadStory(storage),settings={assist:false,reduced:false,speed:'instant',size:'1',sound:false};
try{settings={...settings,...JSON.parse(storage.getItem(SETTINGS_KEY)||'{}')};}catch{}
let scene='title',mode='title',chapter=0,dialogue=null,documentCallback=null,t=0,activeTime=0,last=performance.now(),toastUntil=0,transitionUntil=0,transitionDone=null,ambient=null,soundContext=null,soundGain=null,pauseAt=null;
let actors=[],player=null,ball=null,football=null,ladder=null,road=null,shanghaiGame=null,inspection=new Set(),cameraViews=new Set(),work=null,fold=0,storedDefault=false,phoneActive=false;
let rainState=null,studyState=null,folderOpen=false,visitReadSheng=false,shelterRequested=false,cameraReady=false,gestureAt=0,quietEnding=false;
const assets={},spriteBounds=[];
let finale=null;
let passageStarted=0,routeRevealAt=0;
const goal=GOAL;
const backgrounds={courtyard:'ningbo-courtyard',envelope:'envelope-table',roadScenic:'environment-atlas-v2',study:'environment-atlas-v2',shanghai:'environment-atlas-v2',road:'ningbo-road',workshop:'environment-atlas-v2'};
const chapters=[{id:1,icon:'⚽',name:'One More Goal',where:'Ningbo · 1948'},{id:2,icon:'▤',name:'Upstairs',where:'Hong Kong · around 1960'},{id:3,icon:'▱',name:'The Detour',where:'Shanghai to Ningbo · around 2015'},{id:4,icon:'✉',name:'The Same Door',where:'The courtyard, again'}];
const names={SHENG:'Sheng',QIANG:'Qiang',MOTHER:'Chunxiu · Mother',JO:'Jo',AUNTIE:'Auntie',CLASSMATE:'Classmate','YOUNGER CHILD':'Little one',FATHER:'Father','CO-WORKER':'Co-worker','SCENE':'','STUDY PARTNER':'Study partner','FRIEND':'Friend','COLLEAGUE':'Colleague','SHENG, WRITING':'Sheng · writing','FATHER, WRITING':'Father · writing','CHILD':'Child','YOUNG JO':'Jo','RELATIVE':'Relative'};
const details={1:'Sheng · age 10',2:'Sheng · age 22',3:'Jo · Sheng’s daughter',4:'Jo · Sheng’s daughter',5:'Before the letter was sent'};

function save(){try{storage.setItem(SAVE_KEY,JSON.stringify(story));$('saveStatus').textContent=storedDefault?'Default story memory · saved':'Saved on this device';}catch{$('saveStatus').textContent='Saving unavailable · keep this tab open';}}
function saveSettings(){try{storage.setItem(SETTINGS_KEY,JSON.stringify(settings));}catch{}applySettings();}
function applySettings(){document.documentElement.style.setProperty('--text-scale',settings.size);document.body.classList.toggle('reduced',settings.reduced);$('assistSetting').checked=settings.assist;$('motionSetting').checked=settings.reduced;$('speedSetting').value=settings.speed;$('sizeSetting').value=settings.size;$('soundToggle').querySelector('span').textContent=settings.sound?'Sound on':'Sound off';$('soundToggle').setAttribute('aria-label',settings.sound?'Mute sound':'Enable sound');if(soundGain)soundGain.gain.setTargetAtTime(settings.sound?.18:0,soundContext.currentTime,.15);finale?.refreshSettings();}
function clearKeys(){keys.clear();}
function focusStory(){(mode==='comic'?$('finale'):canvas).focus({preventScroll:true});}
function hideFinale(){finale?.hide();$('game').classList.remove('comic-mode');$('stage').hidden=false;$('finale').hidden=true;$('controlsHint').hidden=false;$('entryNotice').hidden=true;}
function getFinale(){
 if(finale)return finale;
 finale=createFinale({host:$('finale'),getSettings:()=>settings,
  onPage:id=>{story.endingPage=Number.isInteger(id)?FINAL_PAGE_IDS[id]:id;story.chapter=4;phoneActive=FINAL_PAGE_IDS.indexOf(story.endingPage)>=3;save();if(story.endingPage==='still_here')$('saveStatus').textContent='The call stays open';},
  onComplete:finishStory,onSound:type=>{ensureAudio();sfx(type);},
  onTranscript:()=>showDocument('The conversation',[p(finale.transcript())],()=>focusStory(),'READ AGAIN'),
  onRecords:openFamilyRecords
 });return finale;
}
function startComic(page='same_door'){
 closeMenu();$('document').close();clearKeys();dialogue=null;transitionDone=null;transitionUntil=Infinity;
 chapter=4;scene='comic';quietEnding=false;ball=null;road=null;actors=[];player=null;
 $('titleScreen').hidden=true;$('reading').hidden=true;$('transition').hidden=true;$('hud').hidden=true;$('sceneLabel').hidden=true;$('cameraFrame').hidden=true;$('toast').hidden=true;hideActions();
 $('stage').hidden=true;$('game').classList.add('comic-mode');$('controlsHint').hidden=true;setMode('comic');
 $('entryNotice').hidden=!storedDefault;$('entryNotice').textContent=storedDefault?'This visit uses the default memory: “Do they play football there?”':'';
 getFinale().show({page,memory:reply().callback,roadStop:story.roadStop,tripPhotos:[...(story.tripPhotos??[])]});focusStory();
}
function openFamilyRecords(){
 if(!story.completed)return;
 const choices=[button('Chunxiu’s notebook',()=>showDocument('Chunxiu’s notebook',[...NOTEBOOK.map(p),quote(reply().callback)],openFamilyRecords)),
 button('Grandfather’s qiaopi',()=>letterDocument(openFamilyRecords)),
 button('Sheng’s letter from Hong Kong',()=>{story.readShengLetter=true;save();showDocument('Sheng’s letter from Hong Kong',[p(STUDY_LETTER)],openFamilyRecords,'AMONG THE FAMILY LETTERS');})];
 if(story.tripPhotos?.length)choices.push(button('Trip album',()=>showTripAlbum(savedTripPhotos(),openFamilyRecords)));
 showDocument('Family records',choices,()=>focusStory(),'AFTER THE CONVERSATION');
}

function button(label,fn,options={}){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{clearKeys();ensureAudio();b.blur();fn();if(!$('menu').open&&!$('document').open)focusStory();};if(options.primary)b.className='primary';if(options.disabled)b.disabled=true;return b;}
function actions(hint,entries=[]){$('actionbar').hidden=false;$('hint').textContent=hint;$('actions').replaceChildren(...entries.map(e=>button(e.label,e.fn,e)));}
function hideActions(){$('actionbar').hidden=true;$('actions').replaceChildren();}
function hud(objective,counter=''){$('hud').hidden=false;$('objective').textContent=objective;$('counter').textContent=counter;$('counter').hidden=!counter;}
function label(num,title,place){$('sceneLabel').hidden=false;$('chapterNumber').textContent=num;$('chapterTitle').textContent=title;$('placeLabel').textContent=place;}
function setMode(next){
 mode=next;$('game').dataset.mode=next;clearKeys();
 if(!$('menu').open&&!$('document').open)focusStory();
 const tactile=['football','ladder','ladderDown','ladderSupport','shanghaiWalk','drive','explore','camera','rain','bookCarry','work','fatherKick','returnPlay','finalKick'];
 $('touchControls').hidden=!('ontouchstart'in window)||!tactile.includes(next);
 $('touchAction').textContent={football:'Kick',ladder:'Climb',ladderDown:'Descend',ladderSupport:'Steady',shanghaiWalk:'Wait',drive:'Brake',explore:'Look',camera:'Show',rain:'Pick up',bookCarry:'Place book',work:'Tidy',fatherKick:'Kick',returnPlay:'Pass',finalKick:'Return'}[next]??'Action';
 $('touchInteract').hidden=['drive','fatherKick'].includes(next);
}

function toast(text,duration=3){$('toast').textContent=text;$('toast').hidden=false;toastUntil=t+duration;}
function speak(lines,done){$('toast').hidden=true;toastUntil=0;clearKeys();hideActions();$('hud').hidden=true;$('reading').hidden=false;$('choices').hidden=true;$('nextLine').hidden=false;dialogue={lines,index:0,done,chars:0,elapsed:0};setMode('dialogue');displayLine();}
function speakerContext(speaker){
 if(speaker==='SCENE')return '';
 if(speaker.startsWith('SHENG'))return chapter===4||scene==='photoRequest'?'Jo’s father · in his seventies':scene==='family'?'Sheng · years later':chapter===1?'Sheng · about ten':'Sheng · about twenty-two';
 return {MOTHER:'Sheng’s mother',QIANG:'Sheng’s childhood friend',JO:'Sheng’s daughter','YOUNG JO':'Sheng’s daughter · years later',AUNTIE:'A relative in Ningbo',FATHER:'Sheng’s father · Singapore','FATHER, WRITING':'Sheng’s father · Singapore','CO-WORKER':'Singapore · the workshop',CLASSMATE:'Hong Kong · evening study','STUDY PARTNER':'Hong Kong · evening study',RELATIVE:'Sheng’s relative in Hong Kong',FRIEND:'Jo’s travelling companion',COLLEAGUE:'Shanghai'}[speaker]??'';
}

function displayLine(){const line=dialogue.lines[dialogue.index];$('speakerName').textContent=names[line.speaker]??line.speaker;$('speakerDetail').textContent=speakerContext(line.speaker);dialogue.chars=settings.speed==='instant'?line.text.length:0;dialogue.elapsed=0;$('lineText').textContent=line.text.slice(0,dialogue.chars);$('nextLine').textContent='Continue';const k=document.createElement('kbd');k.textContent='Enter';$('nextLine').append(k);}
function advance(){if(!dialogue)return;const line=dialogue.lines[dialogue.index];if(dialogue.chars<line.text.length){dialogue.chars=line.text.length;$('lineText').textContent=line.text;return;}dialogue.index++;if(dialogue.index<dialogue.lines.length){displayLine();return;}const done=dialogue.done;dialogue=null;$('reading').hidden=true;clearKeys();done?.();}
function choose(speaker,text,options){hideActions();dialogue=null;$('reading').hidden=false;$('speakerName').textContent=speaker;$('speakerDetail').textContent=details[chapter]??'';$('lineText').textContent=text;$('nextLine').hidden=true;$('choices').hidden=false;$('choices').replaceChildren(...options.map(o=>button(o.label,()=>{$('reading').hidden=true;$('choices').hidden=true;o.fn();})));setMode('choice');}
function transition(title,text,done,duration=3.5){$('toast').hidden=true;toastUntil=0;dialogue=null;$('reading').hidden=true;hideActions();$('hud').hidden=true;setMode('transition');$('transition').classList.toggle('family-montage',false);$('transition').classList.toggle('art-transition',['family','bookPassage','photoRequest'].includes(scene));$('transition').replaceChildren();const heading=document.createElement('strong');heading.textContent=title;const p=document.createElement('p');p.textContent=text;$('transition').append(heading,p);$('transition').hidden=false;transitionUntil=Infinity;transitionDone=done;$('transition').append(button('Continue',completeTransition,{primary:true}));}
function completeTransition(){if(mode!=='transition'||!transitionDone)return;const done=transitionDone;transitionDone=null;$('transition').hidden=true;done();}
function actor(col,x,y,dir=0,name=''){return{col,x,y,dir,name,moving:false};}
function reply(){return REPLIES.find(r=>r.id===(story.reply??'football'));}
function startChapter(id,{direct=false}={}){
 hideFinale();closeMenu();$('document').close();$('titleScreen').hidden=true;$('transition').hidden=true;$('cameraFrame').hidden=true;$('reading').hidden=true;$('toast').hidden=true;
 dialogue=null;transitionDone=null;inspection=new Set();cameraViews=new Set();phoneActive=false;actors=[];ball=null;football=null;ladder=null;road=null;shanghaiGame=null;work=null;fold=0;player=null;activeTime=0;rainState=null;studyState=null;folderOpen=false;visitReadSheng=false;shelterRequested=false;cameraReady=false;quietEnding=false;
 chapter=id;story.started=true;story.chapter=id;story.resumeEnding=false;if(id===4)story.endingPage='same_door';else if(id<4)story.endingPage=null;story.maxChapter=Math.max(story.maxChapter,Math.min(id,4));storedDefault=direct&&id>1&&!story.reply;
 if(storedDefault)toast('This visit uses the default memory: “Do they play football there?”',6);save();
 if(id===1){
  scene='courtyard';player=actor(0,420,455,1,'Sheng');actors=[actor(1,355,285,0,'Qiang'),actor(2,575,360,2,'Little one'),actor(1,735,340,2,'Defender'),actor(3,765,235,2,'Mother')];ball={x:420,y:436,vx:0,vy:0,owner:'player',assist:false,team:'us'};
  football={goals:0,other:0,passes:0,comic:false,watch:false,watchAt:0,lastKick:-5,kickAt:0,lastSteal:0,assistedGoals:0,openUntil:0,mendingAt:0,celebrateUntil:0};story.footballResolution='unfinished';
  label('CHAPTER 01','One More Goal','Ningbo · 1948 · Sheng, about ten');speak(SCRIPT.footballIntro,footballPlay);
 }
 if(id===2){
  scene='study';player=actor(4,575,435,2,'Sheng');actors=[actor(4,365,425,3,'Classmate'),actor(4,710,345,2,'Relative'),actor(4,670,445,2,'Study partner')];
  label('CHAPTER 02','Upstairs','Hong Kong · around 1960 · Sheng, about twenty-two');speak(SCRIPT.hongKongIntro,()=>{scene='diagramEntry';gestureAt=t;speak(SCRIPT.ladderStart,startLadder);});
 }
 if(id===3){
  scene='photoRequest';player=actor(5,200,535,1,'Jo');actors=[actor(4,740,410,0,'Friend'),actor(5,375,500,3,'Colleague')];
  label('CHAPTER 03','The Detour','Shanghai · around 2015 · Jo, Sheng’s daughter');speak(SCRIPT.photoRequest,()=>{scene='shanghai';speak(SCRIPT.shanghai.slice(0,4),startShanghaiWalk);});
 }
 if(id===4){startComic('same_door');}
 if(id===5){scene='workshop';player=actor(4,410,430,0,'Father');actors=[actor(4,665,390,2,'Co-worker')];label('AFTER THE STORY','Before It Arrived','Singapore · before the original letter was sent');speak(SCRIPT.fatherIntro,startWork);}
}
function welcomeCourtyard(){
 speak(SCRIPT.courtyardArrival,()=>{
  const snack=story.roadStop==='snack'?SCRIPT.snackArrival:[];
  speakIf(snack,()=>{if((story.tripPhotos??[]).length){speak(SCRIPT.albumSharePlain,()=>showTripAlbum(savedTripPhotos(),()=>photoActions()));}else photoActions();});
 });
}
function speakIf(lines,done){if(lines?.length)speak(lines,done);else done();}
function savedTripPhotos(){return ROAD_PHOTOS.map(p=>({...p,x:roadCenterY(p.y)+p.dx,taken:story.tripPhotos.includes(p.id)}));}
function photoActions(){setMode('explore');hud('Photograph the left side of the doorway');actions('Walk to the step, or take the photograph here.',[{label:'Take Dad’s photograph',fn:inspectStep,primary:true},...((story.tripPhotos??[]).length?[{label:'Share the trip album',fn:()=>showTripAlbum(savedTripPhotos(),photoActions)}]:[])]);}
function continueStory(){
 if(story.resumeEnding&&story.completed){restoreEnding();return;}
 if(story.chapter===4&&story.endingPage){storedDefault=!story.reply;startComic(story.endingPage);return;}
 if(story.chapter)startChapter(story.chapter,{direct:true});else begin();
}
function restoreEnding(){storedDefault=!story.reply;story.chapter=4;story.endingPage='still_here';story.resumeEnding=true;startComic('still_here');}

function begin(){hideFinale();story.endingPage=null;ensureAudio();story.started=true;story.chapter=0;save();$('titleScreen').hidden=true;scene='envelope';chapter=0;fold=0;label('PROLOGUE','An envelope','Singapore → Ningbo');setMode('prologue');hideActions();hud('E / Enter · Fold the envelope');actions('Chunxiu · Ningbo',[{label:'Fold the envelope',fn:foldPrologue,primary:true}]);}
function foldPrologue(){if(mode!=='prologue')return;fold=1;sfx('paper');sfx('ship');hideActions();hud('Across the water');transitionUntil=t+2.7;transitionDone=()=>{transitionDone=null;scene='courtyard';speak(SCRIPT.prologue,()=>startChapter(1));};setMode('envelopeTravel');}
function footballHud(){hud('First to two goals · kick into the doorway',`You ${football.goals} / 2 · Qiang ${football.other}`);}
function footballPlay(){setMode('football');footballHud();actions('Arrows / WASD · Move. Space / Kick · Shoot at the goal. Click the yard to aim.',[{label:'Kick toward goal',fn:()=>kickBall(),primary:true},{label:'Pass to little one',fn:passBall},{label:'Watch the match',fn:()=>{football.watch=true;football.watchAt=activeTime;toast('The children play on.');}},{label:'Go to Mother',fn:finishFootball}]);}
function kickBall(target={x:(goal.left+goal.right)/2,y:goal.y-8}){if(!ball||mode!=='football'||activeTime-football.lastKick<.3)return;if(ball.owner!=='player'&&distance(player,ball)>55){toast('The ball is away from you. Move closer or call for a pass.');return;}football.lastKick=activeTime;football.kickAt=activeTime;if(ball.team==='them')ball.assist=false;ball.team='us';ball.owner=null;ball.x=player.x;ball.y=player.y-10;const d=Math.hypot(target.x-ball.x,target.y-ball.y)||1;ball.vx=(target.x-ball.x)/d*480;ball.vy=(target.y-ball.y)/d*480;sfx('kick');toast('Sheng shoots!',.6);}
function passBall(){
 if(mode!=='football')return;
 const mate=actors[1];
 if(ball.owner==='player'||distance(player,ball)<55){ball.owner=null;ball.team='us';ball.assist=true;ball.passTarget='teammate';football.passAt=activeTime;const d=Math.max(1,distance(ball,mate));ball.vx=(mate.x-ball.x)/d*350;ball.vy=(mate.y-ball.y)/d*350;football.passes++;toast('“Here!”',.8);sfx('kick');}
 else if(ball.owner==='teammate'){football.passAt=activeTime-.7;}else{toast('Little one moves into space. Bring the ball close, then pass.');}
}

function footballGoal(assisted=false){
 if(football.roundEnded)return;football.goals++;if(assisted)football.assistedGoals++;
 ball.assist=false;ball.passTarget=null;ball.team='us';ball.owner='player';ball.x=420;ball.y=435;player.x=420;player.y=455;sfx('goal');
 football.celebrateUntil=activeTime+1.8;toast(assisted?'Little one throws both arms up.':'Qiang: “That shoe was here a minute ago.”');
 if(!football.comic){football.comic=true;football.shoeAt=activeTime;}
 footballHud();
 if(football.goals>=2){football.roundEnded=true;story.footballResolution=football.watch?'watch':'sheng';save();speak([{speaker:'QIANG',text:assisted?'Two goals. That one was both of you.':'Two goals. Fine. One more tomorrow.'},{speaker:'YOUNGER CHILD',text:assisted?'We did it!':'I was open!'}],finishFootball);hud('Match finished','2 / 2 goals');}
}

function finishFootball(){
 if(!football)return;setMode('idle');player.x=725;player.y=275;player.dir=1;
 const committed=story.reply;
 speak(football.roundEnded?SCRIPT.motherCallFinished:SCRIPT.motherCall,()=>{
  if(committed){speak([{speaker:'SHENG',text:reply().callback},...(football.roundEnded?SCRIPT.motherReplyFinished:SCRIPT.motherReplyAfter)],returnToYard);return;}
  choose('Sheng','What shall she tell Dad?',REPLIES.map(r=>({label:r.text,fn:()=>{story=rememberReply(story,r.id);save();gestureAt=t;speak([{speaker:'SHENG',text:reply().callback},...(football.roundEnded?SCRIPT.motherReplyFinished:SCRIPT.motherReplyAfter)],returnToYard);}})));
 });
}

function returnToYard(){
 scene='courtyard';player.x=725;player.y=275;player.dir=0;ball={x:575,y:405,vx:45,vy:0,owner:null};setMode('returnPlay');$('sceneLabel').hidden=true;hud('Back to the yard');actions('Move and pass. There is still a little light.',[{label:'Pass it back',fn:()=>{ball.vx=-130;ball.vy=-25;sfx('kick');},primary:true},{label:'Go on',fn:startRain}]);
}

function startRain(){
 scene='rain';player.x=600;player.y=370;rainState={held:false,placed:false};speak(SCRIPT.rain,()=>{setMode('rain');hud('Bring your schoolbook under the shelter');actions('The book is beside the drip. Mother makes a dry space.',[{label:'Pick up the schoolbook',fn:moveBook,primary:true}]);});
}

function moveBook(){
 if(!['rain','bookCarry'].includes(mode))return;
 if(!rainState.held){rainState.held=true;rainState.bowlAt=t;player.x=600;player.y=290;sfx('paper');setMode('bookCarry');hud('Bring the book to Mother');actions('Walk toward the dry table under the shelter. E / Enter · Put it down.',[{label:'Place it on the dry table',fn:placeBook,primary:true}]);return;}
 if(distance(player,{x:702,y:265})<140)placeBook();else toast('Mother has made room under the shelter.');
}
function placeBook(){
 if(!rainState?.held||rainState.placed)return;rainState.placed=true;rainState.held=false;player.x=702;player.y=265;actors[3].x=755;actors[3].y=245;sfx('paper');scene='bookPassage';gestureAt=t;setMode('idle');
 transition('The same Sheng','Hong Kong · around 1960\nAbout twenty-two. After work, a different book opens.',()=>startChapter(2));
}

function startLadder(){
 scene='ladder';actors=[actor(4,415,540,3,'Classmate'),actor(4,610,540,2,'Study partner')];player=actor(4,480,LADDER.bottom,1,'Sheng');ladder={peer:false,asked:false,watch:false,stage:'climb',book:false,holding:false,friendY:LADDER.bottom};gestureAt=t;ladderContinue();
}

function ladderContinue(){
 setMode('ladder');$('sceneLabel').hidden=true;hud(ladder.peer?'A steady ladder':'Climb the ladder');actions('Hold ↑ / W / Space to climb. ↓ / S to go down.',[{label:'Climb one rung',fn:climbRung,primary:true},{label:'Watch together',fn:()=>{ladder.watch=true;ladderContinue();}}]);
}

function climbRung(){if(mode!=='ladder')return;if(ladder.asked&&!ladder.peer){askLadderHelp();return;}const result=stepLadder(player,30/85,1,ladder.peer);sfx('work');ladderResult(result);}
function ladderResult(result){
 if(result==='help'&&!ladder.asked){ladder.asked=true;clearKeys();ladder.stage='ask';hud('The ladder moves. Your classmate is beside you.');actions('E / Enter · Ask for a hand.',[{label:'Ask for a hand',fn:askLadderHelp,primary:true},{label:'Watch together',fn:()=>{ladder.watch=true;askLadderHelp();}}]);if(ladder.watch)askLadderHelp();}
 else if(result==='top')finishLadder();
}

function askLadderHelp(){
 if(mode!=='ladder'||!ladder.asked||ladder.peer)return;speak(SCRIPT.peerHelp,()=>{ladder.stage='book';setMode('ladderBook');hud('Pass the book to your study partner');actions('The classmate needs both hands. Your partner has a free one.',[{label:'Hand over the book',fn:handLadderBook,primary:true}]);if(ladder.watch)handLadderBook();});
}
function handLadderBook(){
 if(ladder.stage!=='book')return;ladder.book=true;gestureAt=t;sfx('paper');speak(SCRIPT.ladderBook,()=>{ladder.stage='steady';setMode('ladderSteady');hud('Make room for a steady grip');actions('E / Enter · Let your classmate take the ladder.',[{label:'Steady the ladder together',fn:steadyLadder,primary:true}]);if(ladder.watch)steadyLadder();});
}
function steadyLadder(){
 if(ladder.stage!=='steady')return;actors[0].x=440;actors[0].dir=3;speak(SCRIPT.ladderSteady,()=>{ladder.peer=true;ladder.stage='climb';ladderContinue();});
}

function finishLadder(){
 if(!ladder?.peer||ladder.stage!=='climb')return;ladder.stage='top';player.moving=false;speak(SCRIPT.ladderTop,()=>{ladder.stage='descend';setMode('ladderDown');hud('Come down and change places');actions('Hold ↓ / S / Space to descend. Nothing falls.',[{label:'Climb down a rung',fn:descendLadder,primary:true},{label:'Watch together',fn:()=>{ladder.watch=true;}}]);});
}
function descendLadder(){if(mode!=='ladderDown')return;player.y=Math.min(LADDER.bottom,player.y+30);if(player.y===LADDER.bottom)swapLadder();}
function swapLadder(){
 ladder.stage='swap';player.x=435;player.dir=3;actors[0].x=480;actors[0].y=LADDER.bottom;speak(SCRIPT.ladderSwap,()=>{ladder.stage='support';setMode('ladderSupport');hud('Your turn to steady the ladder');ladderSupportActions();if(ladder.watch)holdForClassmate();});
}
function ladderSupportActions(){actions('Space / E · Take or release the grip. A pause is safe.',[{label:ladder.holding?'Pause the climb':'Hold the ladder',fn:holdForClassmate,primary:true},{label:'Watch together',fn:()=>{ladder.watch=true;ladder.holding=true;ladderSupportActions();}}]);}
function holdForClassmate(){if(mode!=='ladderSupport')return;ladder.holding=!ladder.holding;ladderSupportActions();}
function endReciprocalLadder(){
 ladder.stage='done';ladder.holding=false;speak(SCRIPT.ladderReciprocalEnd,()=>{scene='study';player=actor(4,580,435,2,'Sheng');actors=[actor(4,365,425,3,'Classmate'),actor(4,670,440,2,'Study partner')];speak(SCRIPT.schedulePrompt,scheduleChoice);});
}

function scheduleChoice(){
 choose('Tomorrow’s practice','Your classmate arrives at eight. Your study partner cannot stay much later.',[
 {label:'Measurements first · diagram together at eight',fn:()=>practice('a')},
 {label:'Try the diagram early · go through it again at eight',fn:()=>practice('b')}
 ]);
}

function practice(plan){
 story.studyPlan=plan;save();studyState={plan,prepared:false,turned:false,late:false,partnerPresent:true};
 transition('The next evening',plan==='a'?'Measurements first. The diagram can wait until eight.':'One early attempt. Sheng will stay to go through it again at eight.',()=>{
  actors=[actor(4,365,425,3,'Study partner')];scene='study';
  speak(plan==='a'?SCRIPT.practicePlanA:SCRIPT.practicePlanB,()=>{setMode('practiceSetup');hud(plan==='a'?'Clear the chair':'Keep the rough work');actions('E / Enter · Make a place at the table.',[{label:plan==='a'?'Move the bag off the chair':'Keep the rough page',fn:preparePractice,primary:true}]);});
 });
}
function preparePractice(){
 if(mode!=='practiceSetup')return;studyState.prepared=true;gestureAt=t;sfx('paper');
 transition('Eight o’clock','The classmate’s shift is over.',()=>{
  studyState.late=true;
  if(studyState.plan==='b'){studyState.partnerPresent=false;actors[0].x=770;actors[0].dir=3;}
  actors.push(actor(4,685,435,2,'Late classmate'));
  const arrival=studyState.plan==='a'?SCRIPT.arrivalPlanA:SCRIPT.arrivalPlanB;
  speak(arrival,()=>speak(SCRIPT.peerDiagram,()=>{setMode('studyDiagram');hud('Turn the drawing toward the table');actions('The rough work is here. E / Enter · Turn the page.',[{label:'Turn the diagram',fn:turnStudyDiagram,primary:true}]);}));
 });
}
function turnStudyDiagram(){
 if(mode!=='studyDiagram')return;studyState.turned=true;gestureAt=t;sfx('paper');
 const lines=[...SCRIPT.diagramTurned,...(studyState.partnerPresent?SCRIPT.peerDiagramPartner:[])];
 speak(lines,()=>{if(studyState.partnerPresent)speak(SCRIPT.studyPartnerLeave,()=>{studyState.partnerPresent=false;actors[0].x=790;actors[0].dir=3;writeStudyLetter();});else writeStudyLetter();});
}
function writeStudyLetter(){
 speak(SCRIPT.hongKongEnd,()=>{setMode('studyFold');hud('A letter home');actions('Let the sentence stay.',[{label:'Fold the letter',fn:foldStudyLetter,primary:true}]);});
}
function foldStudyLetter(){
 if(mode!=='studyFold')return;sfx('paper');scene='family';gestureAt=t;studyState=null;actors=[];player=null;
 transition('Years later · Hong Kong','Sheng and his daughter, Jo.',()=>speak(SCRIPT.youngJo,()=>{scene='photoRequest';transition('Shanghai · around 2015','Jo, Sheng’s daughter, in her early thirties.',()=>startChapter(3));}));
}

function startShanghaiWalk(){actors=[actor(4,740,410,0,'Friend')];shanghaiGame={auto:false,cooldown:0,commuters:[{col:4,x:190,y:535,speed:95,dir:3},{col:3,x:620,y:535,speed:95,dir:3},{col:4,x:300,y:480,speed:-115,dir:2},{col:5,x:745,y:480,speed:-115,dir:2},{col:3,x:150,y:425,speed:80,dir:3},{col:4,x:550,y:425,speed:80,dir:3}]};setMode('shanghaiWalk');hud('Meet your friend by the river');actions('Arrows / WASD · Walk through the crowd. Space · Wait. Your friend is waving.',[{label:'Walk to your friend',fn:()=>{shanghaiGame.auto=true;toast('Your friend waves you over.');}}]);}
function finishShanghaiWalk(){setMode('idle');player.moving=false;player.dir=3;speak([{speaker:'FRIEND',text:'There you are.'},{speaker:'JO',text:'I like it down here.'},...SCRIPT.shanghai.slice(4)],()=>transition('Ningbo · 老家','After the journey from Shanghai, Jo and her friend begin a local drive.',()=>{scene='road';label('CHAPTER 03','The Detour','Ningbo · the local road');speak(SCRIPT.ningboArrival,startRoad);},4));}
function updateShanghai(dt){
 const v=shanghaiGame.auto?{x:(740-player.x)/Math.max(1,distance(player,actors[0])),y:(410-player.y)/Math.max(1,distance(player,actors[0]))}:(keys.has(' ')||t<(shanghaiGame.waitUntil??0))?{x:0,y:0}:movement(keys);
 stepPromenade(player,shanghaiGame,dt,v,true);player.moving=!!(v.x||v.y);if(v.x)player.dir=v.x>0?3:2;else if(v.y)player.dir=v.y>0?0:1;
 if(distance(player,actors[0])<40)finishShanghaiWalk();
}

function startRoad(){scene='road';player=null;actors=[];road=makeRoad();setMode('drive');roadActions();}
function roadHud(){if(mode==='drive'&&$('actions').firstElementChild)$('actions').firstElementChild.textContent=road.cruise?'Park':'Start driving';hud('Follow the wall to Auntie’s house');}

function steerRoad(direction){if(mode!=='drive')return;road.auto=false;road.lane=clamp(road.lane+direction*28,-48,48);road.cruise=true;}
function roadActions(){roadHud();actions('↑ / W · Drive. ← / → · Steer onto postcards; your friend takes the photos. Space / ↓ · Brake.',[{label:road.cruise?'Park':'Start driving',fn:()=>{road.cruise=!road.cruise;if(!road.cruise){road.speed=0;road.auto=false;}roadActions();},primary:true},{label:'← Left',fn:()=>steerRoad(-1)},{label:'Right →',fn:()=>steerRoad(1)},{label:'Trip album',fn:parkDirections},{label:'Let your friend drive',fn:()=>{road.auto=true;road.cruise=true;roadActions();}}]);}
function parkDirections(){if(mode!=='drive')return;const driving=road.cruise;road.parked=true;road.speed=0;showTripAlbum(road.photos,()=>{road.parked=false;road.cruise=driving;setMode('drive');roadActions();});}
function showTripAlbum(photos,done){
 const taken=photos.filter(p=>p.taken).length,nodes=[p('A few photographs from the local road. '+taken+' of 3 views.')];
 const grid=document.createElement('div');grid.className='postcard-album';
 for(const photo of photos){const card=document.createElement('div'),name=p(photo.taken?photo.label:'Not photographed');if(photo.taken){const picture=document.createElement('canvas');picture.width=210;picture.height=130;const im=assets['ningbo-road'];if(im){const scale=im.width/W;picture.getContext('2d').drawImage(im,clamp(photo.x-150,0,W-300)*scale,clamp(photo.y-95,0,ROAD_HEIGHT-190)*scale,300*scale,190*scale,0,0,210,130);}card.append(picture);}else{const empty=p('◇');empty.className='empty-postcard';card.append(empty);}card.append(name);grid.append(card);}
 nodes.push(grid);showDocument('On the way to Auntie’s',nodes,done,'YOUR FRIEND’S CAMERA');
}

function roadJunction(){road.junction=true;road.parked=true;road.speed=0;choose('Friend · car parked','There’s a place to pull over. Want to stop?', [{label:'Keep going to Auntie’s',fn:()=>resumeRoad('direct')},{label:'Stretch our legs by the water',fn:()=>{road.route='scenic';speak(SCRIPT.roadScenic,()=>{scene='scenic';setMode('detour');hud('A moment by the water');actions('The car is parked. Stay as long as you like.',[{label:'Back to the road',fn:()=>resumeRoad('scenic'),primary:true}]);});}},{label:'Pick up a snack for Auntie',fn:()=>{road.route='snack';speak(SCRIPT.roadSnack,()=>{scene='snack';setMode('detour');hud('A stop in the village');actions('The friend gets enough for Auntie, too.',[{label:'Back to the road',fn:()=>resumeRoad('snack'),primary:true}]);});}}]);}
function resumeRoad(route){road.route=route;scene='road';road.parked=false;setMode('drive');roadActions();}
function arriveRoad(){
 story.tripPhotos=[...new Set([...(story.tripPhotos??[]),...road.photos.filter(p=>p.taken).map(p=>p.id)])];story.roadStop=road.route;
 road.parked=true;road.speed=0;road.cruise=false;road.auto=false;clearKeys();save();startChapter(4);
}

function explore(){
 setMode('explore');$('sceneLabel').hidden=true;hud(inspection.has('letter')?'A question for Dad':'The family folder');
 actions('Take your time at the table.',[
 {label:'The doorway',fn:inspectStep},{label:'Chunxiu’s notebook',fn:inspectNotebook},{label:'Grandfather’s qiaopi',fn:inspectLetter},{label:'Sheng’s letter from Hong Kong',fn:inspectShengLetter},
 ...((story.tripPhotos??[]).length?[{label:'Trip album',fn:()=>showTripAlbum(savedTripPhotos(),explore)}]:[]),
 ...(inspection.has('letter')?[{label:'Ask Dad about the letter',fn:phone,primary:true}]:[])
 ]);
}

function inspectStep(){
 if(mode!=='explore')return;player.x=370;player.y=270;player.dir=1;
 speak(SCRIPT.step,()=>{inspection.add('step');sfx('camera');gestureAt=t;if(!folderOpen)speak(SCRIPT.folderIntro,folderPresentation);else explore();});
}
function folderPresentation(){
 folderOpen=true;actors[0].x=728;actors[0].y=290;
 speak(SCRIPT.notebookIntro,()=>{setMode('folderChoice');hud('Chunxiu’s notebook');actions('Auntie lays the notebook beside the letters.',[
 {label:'Read the notebook',fn:()=>readNotebook(()=>offerQiaopi()),primary:true},
 {label:'Let Auntie read it with you',fn:()=>speak([...SCRIPT.notebookSummary,{speaker:'JO',text:reply().callback}],offerQiaopi)}
 ]);});
}
function offerQiaopi(){
 setMode('explore');hud('A letter from Singapore');actions('Auntie puts the next page on the table.',[{label:'Read Grandfather’s qiaopi',fn:inspectLetter,primary:true},{label:'Look at the folder',fn:explore}]);
}
function readNotebook(done=explore){
 inspection.add('notebook');const entries=NOTEBOOK.map(x=>p(x));entries.push(quote(reply().callback));showDocument('Chunxiu’s notebook',entries,done);
}

function inspectNotebook(){if(mode!=='explore')return;player.x=700;player.y=290;player.dir=1;folderOpen=true;speak(SCRIPT.notebookIntro,()=>readNotebook());}
function inspectShengLetter(){
 if(mode!=='explore')return;visitReadSheng=true;story.readShengLetter=true;save();
 showDocument('Sheng’s letter from Hong Kong',[p(STUDY_LETTER)],explore,'AMONG THE FAMILY LETTERS');
}

function inspectLetter(){if(mode!=='explore')return;player.x=730;player.y=270;player.dir=1;speak(SCRIPT.letterIntro,()=>{inspection.add('letter');letterDocument(explore);});}
function p(text){const el=document.createElement('p');el.textContent=text;return el;}
function note(text){const el=p(text);el.className='note';return el;}
function quote(text){const el=document.createElement('blockquote');el.textContent=text;return el;}
function showDocument(title,nodes,done,kicker='PRESERVED IN THE HOUSE'){$('documentTitle').textContent=title;$('documentKicker').textContent=kicker;$('documentBody').replaceChildren(...nodes);documentCallback=done;clearKeys();$('document').showModal();$('documentBody').scrollTop=0;}
function closeDocument(){if(!$('document').open)return;$('document').close();const cb=documentCallback;documentCallback=null;clearKeys();cb?.();focusStory();}
function letterDocument(done){
 const language=button('读中文',()=>{const copy=$('documentBody').querySelector('.letter-copy');const shown=copy.lang==='zh';copy.lang=shown?'en':'zh';copy.textContent=shown?LETTER:LETTER_ZH;language.textContent=shown?'读中文':'Read in English';});
 const copy=p(LETTER);copy.className='letter-copy';copy.lang='en';
 const info=button('About this letter',()=>{showDocument('About the family letters',[
  p('Original fiction. The English is a subtitle rendering and the Chinese is a modern readable draft, not an archival translation.'),
  p('Qiaopi linked correspondence and remittance records. This letter is associated with money sent to Chunxiu. No historical amount, exchange rate or official seal is invented.'),
  p('Chunxiu kept a copy of her outgoing reply. Sheng’s later letter from Hong Kong is a separate family letter, not another qiaopi.')
 ],()=>letterDocument(done),'ARTIFACT NOTES');});
 showDocument(chapter===5?'Before it left':'The letter from Singapore',[note('To Chunxiu · Ningbo\nFrom Singapore'),copy,language,info],done,chapter===5?'ON THE WORKSHOP TABLE':'GRANDFATHER’S QIAOPI');
}

function phone(){
 if(mode!=='explore'||!inspection.has('letter'))return;phoneActive=true;scene='phone';player.x=480;player.y=435;player.dir=0;
 const opening=SCRIPT.phoneBeforeCallback.slice(0,-1),callbackIntro=SCRIPT.phoneBeforeCallback.slice(-1);
 const readLine=visitReadSheng?SCRIPT.shengLetterCall:[];
 speak([...opening,...readLine,...callbackIntro,{speaker:'JO',text:reply().callback},...SCRIPT.phoneAfterCallback],()=>speak(SCRIPT.finalCamera.slice(0,2),startCamera));
}

function startCamera(){scene='camera';$('cameraFrame').hidden=false;cameraViews=new Set();shelterRequested=false;cameraReady=false;setMode('camera');$('sceneLabel').hidden=true;hud('Show Dad the yard');cameraActions();}

function cameraActions(){actions(cameraReady?'Keep looking, or let the afternoon continue.':'Turn the phone. E / Enter · Show what he asks to see.',[
 {label:'Show the step',fn:()=>showPlace('step')},{label:'Show the doorway',fn:()=>showPlace('door')},{label:'Show the shelter',fn:()=>showPlace('shelter')},
 ...(cameraReady?[{label:'Let the afternoon continue',fn:finishCamera,primary:true}]:[])
 ]);}

function showPlace(place){
 if(mode!=='camera')return;player.x={step:355,door:380,shelter:735}[place];
 if(cameraViews.has(place)){cameraActions();return;}
 cameraViews.add(place);let lines={step:[{speaker:'SHENG',text:'The step. Left side. Yes, that’s it.'}],door:[SCRIPT.finalCamera[2]],shelter:[{speaker:'SHENG',text:'She did her mending there.'}]}[place];
 speak(lines,()=>{
  if(place==='shelter'){cameraReady=true;setMode('camera');hud('Dad can see the shelter');cameraActions();}
  else if(!cameraViews.has('shelter')&&!shelterRequested){shelterRequested=true;speak(SCRIPT.shelterRequest,()=>{setMode('camera');hud('Turn toward the shelter');cameraActions();});}
  else{setMode('camera');hud('Dad is still here');cameraActions();}
 });
}
function finishCamera(){if(mode!=='camera'||!cameraViews.has('shelter'))return;actors[1].x=690;actors[1].y=395;ball={x:590,y:430,vx:-45,vy:15,owner:null};speak([SCRIPT.finalCamera[3]],finalKickReady);}

function finalKickReady(){setMode('finalKick');hud('A child’s ball rolls into the courtyard');actions('Space / E · Return the ball. Dad is still on the phone.',[{label:'Return the ball',fn:finalKick,primary:true}]);}
function finalKick(){if(mode!=='finalKick')return;ball.vx=130;ball.vy=-30;sfx('kick');player.dir=3;speak(SCRIPT.ending,finishStory);}
function finishStory(){
 story.completed=true;story.maxChapter=4;story.chapter=4;story.endingPage='still_here';story.resumeEnding=true;save();quietEnding=true;phoneActive=true;$('saveStatus').textContent='The call stays open';buildChapterMenu();
}

function startWork(){work={done:new Set(),strokes:0,touched:false,finishing:false};scene='workshop';setMode('work');$('sceneLabel').hidden=true;hud('Closing time');workActions();}

function workActions(){actions('Finish a small part. Your co-worker is clearing the other side.',[
 {label:'Put a tool away',fn:()=>workTask('tools')},{label:'Sweep a little',fn:()=>workTask('sweep')},{label:'Smooth the board',fn:()=>workTask('board')},
 ...(work.touched?[{label:'Finish together',fn:finishWorkshop,primary:true}]:[]),
 {label:'Watch the closing routine',fn:()=>{work.touched=true;finishWorkshop();}}
 ]);}

function workTask(task){
 if(mode!=='work')return;work.touched=true;gestureAt=t;player.x={tools:480,sweep:360,board:630}[task];player.y=task==='sweep'?430:395;player.dir=1;
 if(task==='board'){work.strokes++;sfx('pencil');toast(['The edge catches.','A smoother pass.','Smooth enough.'][Math.min(work.strokes-1,2)]);if(work.strokes>=3)work.done.add(task);}else{work.done.add(task);sfx('work');}
 actors[0].x=task==='tools'?630:470;actors[0].dir=1;workActions();
}
function finishWorkshop(){if(mode!=='work'||!work.touched)return;work.finishing=true;actors[0].x=520;actors[0].y=390;gestureAt=t;endWork();}

function endWork(){speak(SCRIPT.fatherWorkDone,()=>{scene='fatherYard';player.x=365;player.y=465;player.dir=3;actors[0].x=680;actors[0].y=440;ball={x:395,y:455,vx:0,vy:0,owner:'player'};setMode('fatherKick');hud('One kick before sitting down');actions('Space · Kick.',[{label:'Kick to your co-worker',fn:fatherKick,primary:true}]);});}
function fatherKick(){if(mode!=='fatherKick')return;ball.owner=null;ball.vx=220;ball.vy=-10;sfx('kick');speak(SCRIPT.fatherFootball,()=>{scene='fatherLetter';player.x=460;player.y=360;speak(SCRIPT.fatherLetterEnd,()=>{letterDocument(()=>{scene='envelope';setMode('fold');fold=0;hud('The same envelope');foldActions();});});});}
function foldActions(){actions(fold===0?'E / Enter · Fold the page.':fold===1?'E / Enter · Fold it once more.':'E / Enter · Hand over the letter.',[{label:fold<2?'Fold the letter':'Hand over the letter',fn:foldLetter,primary:true}]);}
function foldLetter(){
 if(mode!=='fold')return;fold++;sfx('paper');if(fold<3){foldActions();return;}
 story.codaCompleted=true;story.chapter=4;story.endingPage='still_here';story.resumeEnding=true;save();
 transition('Before it arrived','Singapore → Ningbo · 1948',()=>{scene='courtyardNow';transition('Back in Ningbo · around 2015','The call is still open.',restoreEnding);});
}

function buildChapterMenu(){const grid=$('chapterGrid');grid.replaceChildren();for(const c of chapters){const b=button('',()=>navigateChapter(c.id));const icon=document.createElement('span');icon.className='stamp';icon.textContent=c.icon;const text=document.createElement('span');const title=document.createElement('strong');title.textContent=c.name;const sub=document.createElement('small');sub.textContent=c.where+(chapterWarning(c.id,story)?' · ahead of your story':'');text.append(title,sub);b.append(icon,text);grid.append(b);}if(story.completed){const stay=button('Return to the open call',()=>restoreEnding());grid.append(stay);const b=button('',()=>navigateChapter(5));b.className='coda-stamp';const icon=document.createElement('span');icon.className='stamp';icon.textContent='↶ ✉';const text=document.createElement('span');const strong=document.createElement('strong');strong.textContent='Before It Arrived';const small=document.createElement('small');small.textContent='The reverse of the envelope · Father in Singapore';text.append(strong,small);b.append(icon,text);grid.append(b);}}
function openMenu(){clearKeys();pauseAt=t;buildChapterMenu();$('menuMessage').hidden=true;$('menu').showModal();}
function closeMenu(){if($('menu').open)$('menu').close();clearKeys();focusStory();pauseAt=null;}
function menuMessage(text,buttons){$('menuMessage').replaceChildren(p(text),...buttons.map(x=>button(x.label,x.fn,x)));$('menuMessage').hidden=false;}
function navigateChapter(id){if(id===5&&!story.completed)return;if(chapterWarning(id,story)){menuMessage('This chapter reveals later parts of the story. You can go directly there. If you have not chosen a childhood message, it uses a labelled default memory.',[{label:'Visit this chapter',fn:()=>startChapter(id,{direct:true}),primary:true},{label:'Keep my place',fn:()=>{$('menuMessage').hidden=true;}}]);return;}startChapter(id,{direct:true});}
function about(){const nodes=[p('An original family story informed by historical research. Characters, letters and household records are fictional. English and readable Chinese text are dramatic renderings.'),p('Three generations: the father working overseas; Sheng as a child and young adult; Jo, Sheng’s Hong Kong-born daughter. The names and dates are working fiction. No spoken dialect is claimed.'),p('Qiaopi joined family correspondence with remittance documents. The letter’s fare, roof and shoes are invented family circumstances; no amount, exchange rate or seal is presented as archival evidence.'),p('The study ladder is a daydream about learning after work. It is not a reconstructed entrance examination or a claim about a migration route.'),p('Mother’s mending, neighbours’ help and the family’s records are fictional. The Ningbo household and its mending records are original fiction; the cited remittance collections give wider context, not provenance for this family.'),p('Demo rounds use forgiving controls and short goals so there is time for the story. Photo pickups, passes and obstacles add a little room to play.'),p('Artwork created for this game. Ambient sounds are synthesized. The story is adapted from the supplied treatment; all characters are fictional.'),p('Chinese pixel lettering: Fusion Pixel SC, by TakWolf and contributors. Latin lettering: Pixelify Sans. Both fonts are bundled with their SIL Open Font Licenses.'),p('The Hong Kong student letter, work-drawing interest, shared ladder and family page moment are original additions from the supplied v0.2 narrative revision. These details are not historical records.'),p('The final comic interprets the already-established later reunion and conversation. No reunion year or recovered photograph is claimed. Jo remains free to continue the life she has made in Shanghai.')];const links=[['UNESCO · Qiaopi and Yinxin collection','https://media.unesco.org/sites/default/files/webform/mow001/china_qiaopi_and_yinxin.pdf'],['NLB · family remittance letters','https://biblioasia.nlb.gov.sg/all-sections/vol-13-issue-4-jan-mar-2018-warm-tidings-in-cold-war/'],['PolyU · institutional history','https://www.polyu.edu.hk/about-polyu/history/'],['Singapore NHB · workshop craft history','https://www.roots.gov.sg/ich-landing/ich/making-of-chinese-signboards']];for(const [title,url]of links){const el=p('');const a=document.createElement('a');a.textContent=title;a.href=url;a.target='_blank';a.rel='noopener';el.append(a);nodes.push(el);}closeMenu();showDocument('Story & historical notes',nodes,()=>openMenu(),'ABOUT THE STORY');}
function newStory(){menuMessage('Start a new story? This deliberately clears the childhood message and chapter progress saved on this device. Your reading settings stay the same.',[{label:'Start a new story',fn:()=>{story={...DEFAULT_STORY};storedDefault=false;save();closeMenu();begin();},primary:true},{label:'Keep this story',fn:()=>{$('menuMessage').hidden=true;}}]);}

function ensureAudio(){if(!settings.sound)return;if(!soundContext){soundContext=new(window.AudioContext||window.webkitAudioContext)();soundGain=soundContext.createGain();soundGain.gain.value=.18;soundGain.connect(soundContext.destination);const buffer=soundContext.createBuffer(1,soundContext.sampleRate*2,soundContext.sampleRate);let data=buffer.getChannelData(0),old=0;for(let i=0;i<data.length;i++){old=(old+(Math.random()*2-1)*.03)/1.03;data[i]=old*.6;}const noise=soundContext.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=soundContext.createBiquadFilter();filter.type='lowpass';filter.frequency.value=500;ambient=soundContext.createGain();ambient.gain.value=.035;noise.connect(filter);filter.connect(ambient);ambient.connect(soundGain);noise.start();}if(soundContext.state==='suspended')soundContext.resume();}
function sfx(type){if(!settings.sound||!soundContext)return;const freqs={ball:130,kick:190,goal:420,pencil:780,paper:320,rain:100,camera:600,work:220,ship:58};const osc=soundContext.createOscillator(),g=soundContext.createGain();osc.type=['paper','pencil','work'].includes(type)?'triangle':'sine';osc.frequency.setValueAtTime(freqs[type]||180,soundContext.currentTime);osc.frequency.exponentialRampToValueAtTime(type==='goal'?670:70,soundContext.currentTime+.14);g.gain.setValueAtTime(.22,soundContext.currentTime);g.gain.exponentialRampToValueAtTime(.001,soundContext.currentTime+.22);osc.connect(g);g.connect(soundGain);osc.start();osc.stop(soundContext.currentTime+.24);}

function update(dt){
 if(dialogue&&settings.speed!=='instant'){const line=dialogue.lines[dialogue.index];dialogue.elapsed+=dt;const chars=Math.min(line.text.length,Math.floor(dialogue.elapsed*(settings.speed==='slow'?22:44)));if(chars>dialogue.chars){dialogue.chars=chars;$('lineText').textContent=line.text.slice(0,chars);}}
 if(transitionDone&&t>=transitionUntil){const done=transitionDone;transitionDone=null;$('transition').hidden=true;done();}
 if(toastUntil&&t>=toastUntil){$('toast').hidden=true;toastUntil=0;}
 if(mode==='returnPlay'){moveActor(player,dt,180);player.x=clamp(player.x,160,800);player.y=clamp(player.y,245,530);if(ball)stepBall(ball,dt,{left:150,right:780,bottom:530});}
 if(mode==='football')updateFootball(dt);
 if(['ladder','ladderDown','ladderSupport'].includes(mode))updateLadder(dt);
 if(mode==='shanghaiWalk')updateShanghai(dt);
 if(mode==='drive')updateRoad(dt);
 if(mode==='camera'){const v=movement(keys);player.x=clamp(player.x+v.x*dt*210,310,760);}
 if(['explore','work','rain','bookCarry','arrivalLook'].includes(mode)){moveActor(player,dt,150);player.x=clamp(player.x,140,830);player.y=clamp(player.y,240,530);}
 if(['ending','finalKick','fatherKick'].includes(mode)||mode==='dialogue'&&['fatherYard','camera'].includes(scene)){
  if(ball&&!ball.owner)stepBall(ball,dt,{left:150,right:850,bottom:520});
  if(quietEnding&&actors[1]){actors[1].x=690+Math.sin(t*.7)*65;actors[1].y=390+Math.sin(t*.4)*20;actors[1].moving=!settings.reduced;}
 }
}

function moveActor(a,dt,speed){if(!a)return;const v=movement(keys);a.moving=!!(v.x||v.y);a.x+=v.x*dt*speed;a.y+=v.y*dt*speed;if(v.x||v.y){if(Math.abs(v.x)>Math.abs(v.y))a.dir=v.x>0?3:2;else a.dir=v.y>0?0:1;}}
function updateFootball(dt){
 if(activeTime>3&&!football.mended){football.mended=true;football.seamAt=activeTime;toast('Neighbour: “Straighter than when I bought it.”\nMother: “Don’t tell the shop.”',4);}
 if(football.watch){player.dir=1;player.x=349;player.y=300;ball.x=349;ball.y=player.y-20;if(activeTime-football.watchAt>2.2){football.watchAt=activeTime;footballGoal(football.goals===1);}return;}
 moveActor(player,dt,settings.assist?195:180);player.x=clamp(player.x,150,825);player.y=clamp(player.y,224,530);
 const goalie=actors[0],mate=actors[1],defender=actors[2];
 if(!football.mendingAt){football.mendingAt=activeTime;}
 if(activeTime>13&&!football.neighbour){football.neighbour=true;toast('Neighbour: “Mind the washing!”');}
 goalie.x=football.openUntil>activeTime?goal.right+24:349+Math.sin(activeTime*1.35)*37;
 if(ball.owner!=='teammate'&&ball.passTarget!=='teammate'){
  const target={x:clamp(player.x+(player.x<400?110:-100),415,650),y:clamp(player.y-65,310,420)};
  mate.x+=(target.x-mate.x)*dt*1.4;mate.y+=(target.y-mate.y)*dt*1.4;mate.dir=player.x<mate.x?2:3;
 }
 if(ball.owner!=='opponent'){
  const chase=ball.owner==='player'&&player.x>480;const tx=chase?player.x:710+Math.sin(activeTime*.65)*60,ty=chase?player.y:320+Math.cos(activeTime*.8)*45,d=Math.max(1,Math.hypot(tx-defender.x,ty-defender.y));defender.x+=(tx-defender.x)/d*dt*55;defender.y+=(ty-defender.y)/d*dt*55;defender.dir=tx>defender.x?3:2;
 }
 if(ball.owner==='player'){
  const offset=[{x:0,y:14},{x:0,y:-15},{x:-15,y:0},{x:15,y:0}][player.dir];ball.x=player.x+offset.x;ball.y=player.y+offset.y;
  if(!settings.assist&&distance(player,defender)<27&&activeTime-football.lastSteal>4){ball.owner='opponent';ball.team='them';ball.assist=false;football.lastSteal=activeTime;toast('A quick tap. Get it back, or call for a pass.');}
 }else if(ball.owner==='teammate'){
  ball.x=mate.x;ball.y=mate.y+8;
  if(activeTime-football.passAt>.4){ball.owner=null;ball.passTarget='player';const len=Math.max(1,distance(ball,player));ball.vx=(player.x-ball.x)/len*320;ball.vy=(player.y-ball.y)/len*320;football.openUntil=activeTime+3;football.kickAt=activeTime;toast('“Back to you!”',1.2);sfx('kick');}
 }else if(ball.owner==='opponent'){
  const dx=349-defender.x,dy=245-defender.y,d=Math.max(1,Math.hypot(dx,dy));defender.x+=dx/d*dt*75;defender.y+=dy/d*dt*75;defender.dir=1;ball.x=defender.x;ball.y=defender.y-14;
  if(distance(player,defender)<36&&activeTime-football.lastSteal>.6){ball.owner='player';ball.team='us';football.lastSteal=activeTime;sfx('kick');}
  else if(d<26){ball.owner=null;ball.vx=(349-ball.x)*3;ball.vy=-270;football.kickAt=activeTime;}
 }else{
  stepBall(ball,dt,{left:144,right:842,bottom:550});
  if(ball.passTarget==='teammate'&&distance(ball,mate)<30){ball.owner='teammate';ball.passTarget=null;football.passAt=activeTime;return;}
  if(ball.y<=goal.y&&ball.x>=goal.left&&ball.x<=goal.right){
   if(ball.team==='them'){football.other++;ball.owner='player';ball.team='us';ball.assist=false;player.x=420;player.y=455;ball.x=420;ball.y=436;footballHud();sfx('goal');toast('Qiang: “That shoe is staying there now.”');if(football.other>=2){football.roundEnded=true;story.footballResolution='qiang';save();speak([{speaker:'QIANG',text:'Same shoes tomorrow?'},{speaker:'SHENG',text:'If you leave them in the same place.'}],finishFootball);hud('Match finished','Qiang · 2 goals');}}
   else footballGoal(ball.assist);return;
  }
  if(ball.y<193){ball.y=193;ball.vy=Math.abs(ball.vy)*.8;sfx('ball');}
  if(distance(ball,player)<30&&activeTime-football.kickAt>.18&&ball.passTarget!=='teammate'){ball.owner='player';ball.team='us';ball.passTarget=null;}
  if(ball.team==='us'&&distance(ball,goalie)<12&&ball.vy<0&&!settings.assist&&football.openUntil<activeTime){ball.vx=90;ball.vy=130;sfx('ball');toast('Qiang taps it out. Try a pass or a rebound.');}
  if(Math.hypot(ball.vx,ball.vy)<12&&distance(ball,player)<50){ball.owner='player';ball.team='us';ball.passTarget=null;}
 }
}

function updateLadder(dt){
 if(mode==='ladderDown'){
  const descending=ladder.watch||keys.has(' ')||movement(keys).y>0;player.moving=descending;player.dir=0;
  if(descending){player.y=Math.min(LADDER.bottom,player.y+dt*180);if(player.y===LADDER.bottom)swapLadder();}return;
 }
 if(mode==='ladderSupport'){
  player.moving=false;
  if(ladder.holding){ladder.friendY=Math.max(LADDER.top,ladder.friendY-dt*110);actors[0].y=ladder.friendY;actors[0].dir=1;actors[0].moving=true;if(ladder.friendY===LADDER.top)endReciprocalLadder();}
  else actors[0].moving=false;return;
 }
 if(ladder.asked&&!ladder.peer){player.moving=false;return;}
 const direction=ladder.watch||keys.has(' ')?1:-movement(keys).y;player.moving=!!direction;player.dir=1;ladderResult(stepLadder(player,dt,direction,ladder.peer));
}

function updateRoad(dt){
 if(road.parked)return;const v=movement(keys),events=stepDrive(road,dt,{x:v.x,forward:v.y<0,brake:keys.has(' ')||v.y>0});
 if(events.photo){sfx('camera');toast('Friend: “Got it.”',1.2);}
 if(events.bump){sfx('ball');toast('Easy does it.',1);}
 roadHud();
 const section=Math.floor(road.progress/450);
 if(section!==road.lastSection){road.lastSection=section;$('sceneLabel').hidden=true;}
 if(road.progress>570&&!road.navigation){road.navigation=true;road.parked=true;road.speed=0;speak(SCRIPT.roadNavigation,()=>{road.parked=false;setMode('drive');roadActions();});return;}
 if(road.progress>900&&!road.junction){roadJunction();return;}
 if(events.finished)arriveRoad();
}

function sprite(a,scale=1){
 if(!a||!assets['character-atlas'])return;const dir=a.dir??0;
 const peerColumn=['Classmate','Late classmate'].includes(a.name)?0:a.name==='Study partner'?1:null;
 const peerBoxes=[[[158,89,155,354],[158,506,155,355],[161,930,154,357],[160,1348,155,360]],[[588,98,146,345],[585,518,152,343],[588,937,152,351],[581,1357,153,351]]];
 const peer=peerColumn!==null&&assets['peer-sprites'];
 const b=peer?Object.fromEntries(['x','y','w','h'].map((key,i)=>[key,peerBoxes[peerColumn][dir][i]])):spriteBounds[a.col]?.[dir];if(!b)return;
 const child=a.col<3,sceneScale=['study','diagramEntry'].includes(scene)?2.65*(a.name==='Relative'?.84:1):scene==='photoRequest'?1.5:['workshop','fatherYard','fatherLetter'].includes(scene)?1.55:scene==='ladder'?1:child?1.25:1.5;
 const height=(child?55:67)*scale*sceneScale,width=height*b.w/b.h,bob=a.moving&&!settings.reduced?Math.sin(t*12)*2:0;
 ctx.fillStyle='#11272b33';ctx.fillRect(Math.round(a.x-width*.35),Math.round(a.y-3),Math.round(width*.7),5);ctx.drawImage(peer?assets['peer-sprites']:assets['character-atlas'],b.x,b.y,b.w,b.h,Math.round(a.x-width/2),Math.round(a.y-height+bob),Math.round(width),Math.round(height));
}

function text(text,x,y,size=14,color='#fff0c5',align='center'){ctx.font=`${size}px "Pixelify Sans", "Fusion Pixel SC", sans-serif`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillStyle='#102b32da';const m=ctx.measureText(text);ctx.fillRect(x-(align==='center'?m.width/2:0)-6,y-size/2-4,m.width+12,size+8);ctx.fillStyle=color;ctx.fillText(text,x,y);}
function bg(type,dim=0){const key=backgrounds[type]||'ningbo-courtyard',im=assets[key];if(im){if(key==='ningbo-road'){const camera=road?roadPosition(road.progress,road.lane).camera:0;ctx.drawImage(im,0,-camera,W,ROAD_HEIGHT);}else if(key==='environment-atlas-v2'){const panels={study:[0,0],shanghai:[1,0],road:[0,1],roadScenic:[0,1],workshop:[1,1]};const [c,r]=panels[type]||[0,1];const iw=im.width/2,ih=im.height/2;if(type==='road'&&road){const section=Math.floor(road.progress/550);const framing=[[0,0,1],[.05,.14,.86],[.18,.05,.78],[0,.26,.74]][Math.min(section,3)];ctx.drawImage(im,c*iw+iw*framing[0],r*ih+ih*framing[1],iw*framing[2],ih*framing[2],0,0,W,H);}else ctx.drawImage(im,c*iw,r*ih,iw,ih,0,0,W,H);}else ctx.drawImage(im,0,0,W,H);}else{ctx.fillStyle='#27494d';ctx.fillRect(0,0,W,H);}if(dim){ctx.fillStyle=`rgba(7,24,32,${dim})`;ctx.fillRect(0,0,W,H);}}
function drawBall(b){if(!b)return;ctx.fillStyle='#173b3e55';ctx.fillRect(b.x-7,b.y+4,14,4);ctx.fillStyle='#eadbbb';ctx.fillRect(Math.round(b.x-6),Math.round(b.y-6),12,12);ctx.fillStyle='#76685a';ctx.fillRect(Math.round(b.x-2),Math.round(b.y-2),4,4);ctx.fillRect(Math.round(b.x+3),Math.round(b.y+3),3,3);}
function drawGoal(){ctx.fillStyle='#b18b55';ctx.fillRect(goal.left-4,139,6,63);ctx.fillRect(goal.right-2,139,6,63);ctx.fillStyle='#ebd7a0';ctx.fillRect(goal.left-4,139,goal.right-goal.left+8,5);ctx.strokeStyle='#e8ddba55';ctx.lineWidth=1;for(let x=goal.left+8;x<goal.right;x+=12){ctx.beginPath();ctx.moveTo(x,144);ctx.lineTo(x,197);ctx.stroke();}for(let y=153;y<goal.y;y+=12){ctx.beginPath();ctx.moveTo(goal.left,y);ctx.lineTo(goal.right,y);ctx.stroke();}ctx.fillStyle='#f9d487';const shoeShift=football?.shoeAt!==undefined&&activeTime-football.shoeAt<1.8?Math.sin(Math.min(1,(activeTime-football.shoeAt)/1.8)*Math.PI)*18:0;ctx.fillRect(goal.left-8-shoeShift,199,14,6);ctx.fillRect(goal.right-6,199,14,6);text('GOAL',349,227,18);}
function roadSprite(cell,x,y,w,h){const im=assets['road-sprites'];if(!im)return;const b=[[196,166,237,380],[195,166,238,380],[178,238,280,174],[170,207,288,251]][cell],cx=cell%2*627,cy=Math.floor(cell/2)*627;ctx.drawImage(im,cx+b[0],cy+b[1],b[2],b[3],Math.round(x-w/2),Math.round(y-h/2),w,h);}
function renderRoad(){bg('road');if(!road)return;const pos=roadPosition(road.progress,road.lane);for(const p of road.photos){const y=p.y-pos.camera;if(p.taken||y<-40||y>H+40)continue;ctx.fillStyle='#ffdf7e55';ctx.fillRect(p.x-24,y-22,48,44);roadSprite(2,p.x,y,38,25);}for(const b of road.baskets){const y=b.y-pos.camera;if(y<-40||y>H+40)continue;roadSprite(3,roadCenterY(b.y)+b.dx+(b.hit?44:0),y,32,29);}ctx.save();ctx.translate(pos.x,pos.screenY);ctx.rotate(clamp(Math.atan2(roadCenterY(pos.y-18)-roadCenterY(pos.y+18),36),-.85,.85));ctx.fillStyle='#152e3d55';ctx.fillRect(-21,-33,42,72);roadSprite(road.speed>10?Math.floor(t*7)%2:0,0,0,42,68);ctx.restore();if(road.parked)text('PARKED',pos.x,pos.screenY+49,17);}
function draw(){
 ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);ctx.save();
 if(scene==='camera'&&player){ctx.translate((480-player.x)*.15-60,-36);ctx.scale(1.125,1.125);}
 if(scene==='bookPassage'){drawBookPassage();}
 else if(scene==='family'){drawFamilyMoment();}
 else if(scene==='diagramEntry'){bg('study',.35);drawStudyPaper(false,true);for(const a of actors)sprite(a);sprite(player);}
 else if(scene==='photoRequest'){bg('shanghai',.12);drawOldPhoto();sprite(player);}
 else if(['title','courtyard','courtyardNow','rain','phone','camera','approach'].includes(scene)){
  bg(scene==='title'?'envelope':'courtyard',scene==='title'?.09:scene==='rain'?.3:scene==='phone'?.04:0);
  if(['courtyardNow','phone','camera'].includes(scene)){ctx.fillStyle='#49736615';ctx.fillRect(75,480,75,35);drawPresentObjects();}
  if(scene==='courtyard'||scene==='rain'){
   drawGoal();drawMotherRoutine();
   if(!settings.reduced){ctx.fillStyle='#ddd2a0';ctx.fillRect(755+Math.sin(t*3)*2,181,15,3);}
  }
  if(scene!=='title'){
   const visible=[...actors.filter((a,i)=>!(i===3&&['courtyard','rain'].includes(scene))),player].filter(Boolean).sort((a,b)=>a.y-b.y);
   for(const a of visible)sprite(a);drawBall(ball);
   if(scene==='courtyardNow'&&activeTime<2.5)drawBall({x:330+activeTime*70,y:365+Math.abs(Math.sin(activeTime*5))*12});
  }
  if(scene==='courtyard'&&mode==='football'){
   if(activeTime<6||activeTime%8<2)text('Here!',actors[1].x,actors[1].y-85,16);
   if(football?.celebrateUntil>activeTime){ctx.fillStyle='#d1a680';ctx.fillRect(actors[1].x-23,actors[1].y-61,8,22);ctx.fillRect(actors[1].x+16,actors[1].y-61,8,22);}
  }
  if(scene==='rain')drawRainAndBook();
  if(mode==='explore'&&folderOpen){text('The family folder',730,330,16);}
  if(scene==='camera'){
   ctx.fillStyle='#071a2218';ctx.fillRect(0,0,W,H);
   const target=player.x>640?'shelter':player.x<365?'step':'door';
   ctx.strokeStyle='#edd4a040';ctx.lineWidth=2;ctx.strokeRect(target==='shelter'?675:310,target==='shelter'?170:130,target==='shelter'?170:90,target==='shelter'?140:170);
  }
 }
 else if(scene==='roadApproach'){renderRoad();ctx.save();ctx.globalAlpha=clamp((t-routeRevealAt)/(settings.reduced?1:2.5),0,1);bg('courtyard');ctx.restore();}
 else if(scene==='study'){
  bg('study');drawStudyPaper(studyState?.turned??false,false);
  for(const a of actors){if(studyState?.partnerPresent===false&&a.name==='Study partner'){sprite({...a,x:Math.min(940,a.x+(t-gestureAt)*40)});}else sprite(a);}sprite(player);
  if(studyState?.plan==='a')drawBag(studyState.prepared?785:690,studyState.prepared?390:365);
  if(studyState?.plan==='b'){ctx.save();ctx.translate(651,316);if(studyState.turned)ctx.rotate(Math.PI);ctx.fillStyle='#ded0a5';ctx.fillRect(-34,-23,68,46);ctx.fillStyle='#797e6e';for(let i=0;i<4;i++)ctx.fillRect(-26,-15+i*9,45-i*4,2);ctx.fillStyle='#aa7759';ctx.fillRect(19,12,7,5);ctx.restore();}
  if(mode==='studyFold'||dialogue?.lines[dialogue.index]?.speaker==='SHENG, WRITING')drawWritingLetter();
 }
 else if(scene==='ladder'){drawLadder();}
 else if(['road','scenic','snack'].includes(scene)){
  if(scene==='road')renderRoad();else{bg('roadScenic');sprite(actor(5,450,480,3));sprite(actor(4,535,485,2));if(scene==='snack')drawBag(562,433);}
 }
 else if(scene==='shanghai'){
  bg('shanghai');if(shanghaiGame){for(const a of [...actors,...shanghaiGame.commuters,player].sort((a,b)=>a.y-b.y))sprite(a);if(mode==='shanghaiWalk'){ctx.fillStyle='#f5d27a';ctx.fillRect(755,325+(!settings.reduced?Math.sin(t*3)*3:0),7,16);}}
  else{for(const a of actors)sprite(a);sprite(player);}
 }
 else if(['workshop','fatherYard','fatherLetter'].includes(scene)){
  bg('workshop',scene==='fatherLetter'?.08:0);for(const a of actors)sprite(a);sprite(player);drawBall(ball);drawWorkshopGesture();
 }
 else if(scene==='envelope'){
  bg('envelope');ctx.font='36px "Fusion Pixel SC",sans-serif';ctx.textAlign='center';ctx.fillStyle='#4e3b27';ctx.fillText('春秀',480,277);ctx.font='26px "Pixelify Sans", "Fusion Pixel SC",sans-serif';ctx.fillText('Chunxiu · Ningbo',480,319);ctx.font='17px "Pixelify Sans", "Fusion Pixel SC",sans-serif';ctx.fillText('From Singapore',480,355);
  if(fold){ctx.fillStyle='#b5a17f88';ctx.fillRect(276,397,416,3);ctx.fillStyle='#f1ddb766';ctx.beginPath();ctx.moveTo(276,398);ctx.lineTo(484,455-fold*12);ctx.lineTo(692,398);ctx.fill();}
  if(mode==='envelopeTravel'){const prog=clamp(1-(transitionUntil-t)/2.7,0,1);ctx.fillStyle=`rgba(13,47,58,${prog*.65})`;ctx.fillRect(0,0,W,H);ctx.save();const mw=416+(W-416)*prog,mh=254+(H-254)*prog;ctx.beginPath();ctx.rect((W-mw)/2,(H-mh)/2,mw,mh);ctx.clip();ctx.globalAlpha=prog;bg('courtyard');ctx.restore();}
 }
 if(!settings.reduced&&['courtyard','courtyardNow'].includes(scene)){ctx.fillStyle='#c8e0c02a';ctx.fillRect(80,145+Math.sin(t*1.8)*3,88,2);}
 if(mode==='dialogue'&&dialogue?.lines[dialogue.index]?.speaker==='SCENE'){ctx.fillStyle='#081b2433';ctx.fillRect(0,0,W,H);}ctx.restore();
}
function drawMotherRoutine(){
 const mother=actors[3];if(!mother)return;sprite(mother);
 const phase=football?Math.min(1,activeTime/6):1;
 const completed=football?.mended,leave=completed?Math.max(0,activeTime-football.seamAt-2):0;
 const handX=mother.x-12+(settings.reduced?0:Math.sin(t*5)*3);
 ctx.fillStyle='#ddc696';ctx.fillRect(735,192,42,19);ctx.fillStyle='#b58466';ctx.fillRect(handX,196,8,5);ctx.fillStyle='#5d796b';ctx.fillRect(740,203,32,2);
 ctx.fillStyle='#e8d4aa';ctx.fillRect(695,213,27,18);ctx.fillStyle='#b6a57e';ctx.fillRect(727,215,16,14);
 if(phase>.45&&scene==='courtyard'&&leave<5){const neighbour=actor(3,696+leave*46,285,3,'Neighbour');neighbour.moving=leave>0;sprite(neighbour);ctx.fillStyle='#c8c296';ctx.fillRect(completed?neighbour.x+8:708,completed?neighbour.y-51:225,25,18);}
 if(completed){ctx.fillStyle='#726e57';ctx.fillRect(701,219,14,2);ctx.fillRect(701,225,10,2);}
 if(dialogue?.lines[dialogue.index]?.speaker==='MOTHER'&&dialogue.lines[dialogue.index].text.includes('write')){
  ctx.fillStyle='#b98561';ctx.fillRect(710,220,7,4);ctx.fillStyle='#493e35';ctx.fillRect(715,224,2,8);
 }
}
function drawRainAndBook(){
 for(let i=0;i<44;i++){ctx.fillStyle='#adc2ca55';ctx.fillRect((i*107+37)%960,(i*83+(settings.reduced?0:t*210))%600,1,9);}
 const bowlMove=rainState?.bowlAt===undefined?0:clamp((t-rainState.bowlAt)*1.8,0,1);const bowlX=716-36*bowlMove;ctx.fillStyle='#74949f';ctx.fillRect(bowlX,244,18,4);ctx.fillStyle='#3f656d';ctx.fillRect(bowlX+3,248,12,4);if(bowlMove>0&&bowlMove<1){ctx.fillStyle='#c89f77';ctx.fillRect(bowlX+15,242,12,5);}
 if(rainState?.held&&player){drawBook(player.x+12,player.y-40,26,17,'#687e8e');}
 else drawBook(rainState?.placed?702:600,rainState?.placed?250:275,26,17,'#687e8e');
 if(rainState?.held){ctx.strokeStyle='#f1d190';ctx.lineWidth=2;ctx.strokeRect(684,242,43,24);}
}
function drawBook(x,y,w,h,color='#90794e'){ctx.fillStyle='#3c4850';ctx.fillRect(x-2,y+2,w,h);ctx.fillStyle=color;ctx.fillRect(x,y,w,h);ctx.fillStyle='#ece1bf';ctx.fillRect(x+w-4,y+3,3,h-5);}
function drawStudyPaper(turned=false,large=false){
 const x=large?300:405,y=large?225:291,w=large?360:140,h=large?235:84;
 ctx.save();ctx.translate(x+w/2,y+h/2);if(turned)ctx.rotate(Math.PI);ctx.fillStyle='#e8d6aa';ctx.fillRect(-w/2,-h/2,w,h);
 ctx.strokeStyle='#66828a';ctx.lineWidth=large?3:1;ctx.strokeRect(-w*.30,-h*.27,w*.58,h*.5);ctx.beginPath();ctx.moveTo(-w*.30,-h*.27);ctx.lineTo(w*.28,h*.23);ctx.moveTo(-w*.30,h*.23);ctx.lineTo(w*.28,-h*.27);ctx.stroke();
 ctx.fillStyle='#af7659';ctx.fillRect(-w*.46,-h*.46,w*.05,h*.045);
 if(!turned){ctx.fillStyle='#bba87e';ctx.beginPath();ctx.moveTo(-w/2,-h/2);ctx.lineTo(-w/2+w*.22,-h/2);ctx.lineTo(-w/2,-h/2+h*.22);ctx.fill();}
 ctx.restore();
}
function drawWritingLetter(){ctx.fillStyle='#ecdfb9';ctx.fillRect(430,287,100,60);ctx.fillStyle='#666455';for(let i=0;i<4;i++)ctx.fillRect(440,300+i*9,70-i*8,2);ctx.fillStyle='#896750';ctx.fillRect(514,322,3,17);}
function drawLadder(){
 bg('study',.9);ctx.fillStyle='#e6d3a1';ctx.fillRect(350,80,260,480);ctx.fillStyle='#c3b288';for(let y=94;y<558;y+=26)ctx.fillRect(360,y,240,1);
 ctx.fillStyle='#294951';for(let i=0;i<8;i++){const x=i*125,h=60+(i%4)*26;ctx.fillRect(x,H-h,80,h);ctx.fillStyle='#bdb47744';for(let y=H-h+15;y<H;y+=22)ctx.fillRect(x+15,y,8,8);ctx.fillStyle='#294951';}
 ctx.fillStyle='#e6c784';ctx.fillRect(393,105,174,12);
 ctx.save();const sway=!ladder?.peer&&!settings.reduced?Math.sin(t*3)*(ladder?.asked?3:1):0;ctx.translate(sway,0);
 ctx.fillStyle='#ac8251';ctx.fillRect(446,115,10,435);ctx.fillRect(504,115,10,435);for(let y=135;y<540;y+=30){ctx.fillStyle='#dec28a';ctx.fillRect(450,y,59,7);ctx.fillStyle='#73573d';ctx.fillRect(450,y+7,59,3);}
 if(ladder?.stage!=='support'&&ladder?.stage!=='done')sprite(player);ctx.restore();
 for(const a of actors)sprite(a);if(['support','done','swap'].includes(ladder?.stage))sprite(player);
 if(ladder?.stage==='done'){ctx.fillStyle='#ecdfb7';ctx.fillRect(600,467,50,32);ctx.fillStyle='#8b8b74';ctx.fillRect(607,478,24,2);ctx.fillRect(607,484,18,2);ctx.fillStyle='#b9a780';ctx.beginPath();ctx.moveTo(600,467);ctx.lineTo(614,467);ctx.lineTo(600,481);ctx.fill();}
 else if(ladder?.book){const q=clamp((t-gestureAt)*2,0,1);drawBook(480+(610-480)*q,Math.min(player.y,500)-44+(486-(Math.min(player.y,500)-44))*q,32,21,'#a29166');}
 else drawBook(player.x+7,player.y-43,30,20,'#a29166');
 if(ladder?.peer&&['climb','descend'].includes(ladder.stage)||ladder?.holding){ctx.fillStyle='#cba280';ctx.fillRect(443,500,13,6);}
 if(ladder?.stage==='support'){ctx.fillStyle=ladder.holding?'#e2c994':'#52676a';ctx.fillRect(436,510,17,7);}
}
function drawBag(x,y){ctx.fillStyle='#bb9165';ctx.fillRect(x,y,25,24);ctx.fillStyle='#e2c199';ctx.fillRect(x+5,y-5,15,5);ctx.fillStyle='#805e40';ctx.fillRect(x+11,y+4,3,16);}
function drawPresentObjects(){
 ctx.fillStyle='#ded0a6';ctx.fillRect(716,226,52,28);ctx.fillStyle='#967d54';ctx.fillRect(738,228,2,24);
 ctx.fillStyle='#ebe0c4';ctx.fillRect(804,239,11,16);ctx.fillStyle='#929878';ctx.fillRect(816,242,4,7);
 if(story.roadStop==='snack')drawBag(680,235);
 if(folderOpen){ctx.fillStyle='#74573d';ctx.fillRect(695,220,75,40);ctx.fillStyle='#e7d8b0';ctx.fillRect(704,226,34,23);ctx.fillRect(739,229,25,19);}
}
function drawOldPhoto(){
 ctx.save();ctx.translate(670,325);ctx.rotate(-.04);ctx.fillStyle='#eee0bf';ctx.fillRect(-145,-98,290,196);const im=assets['ningbo-courtyard'];if(im)ctx.drawImage(im,200,60,560,400,-133,-87,265,173);ctx.fillStyle='#d3c6a8';ctx.fillRect(-133,-87,28,173);ctx.restore();
}
function drawBookPassage(){
 const im=assets['book-matchcut'];if(im){const pane=t-gestureAt<1.5?0:1;ctx.drawImage(im,pane*im.width/2,0,im.width/2,im.height,0,0,W,H);}
 else{bg(t-gestureAt<1.5?'courtyard':'study',.25);drawBook(370,220,220,150,t-gestureAt<1.5?'#657e91':'#a28b62');ctx.fillStyle='#cda783';ctx.fillRect(438,170,70,85);}
}
function drawFamilyMoment(){
 const im=assets['family-page'];if(im)ctx.drawImage(im,0,0,W,H);else{bg('study');sprite(actor(4,430,445,3,'Sheng'));sprite(actor(2,515,450,2,'Jo'));}
 const line=dialogue?.lines[dialogue.index];
 if(line?.speaker==='YOUNG JO'&&line.text.includes('on it')){ctx.fillStyle='#e4d6b0';ctx.fillRect(445,335,46,30);}
}
function drawWorkshopGesture(){
 if(!work)return;const q=settings.reduced?1:clamp((t-gestureAt)*2,0,1);
 ctx.fillStyle='#a8a18a';ctx.fillRect(460,292,5,22);ctx.fillRect(475,302,13,4);
 if(work.touched){ctx.fillStyle='#c1a281';ctx.fillRect(actors[0]?.x-8,320,18,6);ctx.fillStyle='#b99563';ctx.fillRect(600,303,72,9);ctx.fillStyle=work.strokes>1?'#d6b77a':'#7b664b';ctx.fillRect(600+q*58,303,8,9);}
}

async function loadAssets(){await Promise.all(['ningbo-courtyard','environment-atlas-v2','character-atlas','envelope-table','ningbo-road','road-sprites','book-matchcut','family-page','peer-sprites'].map(name=>new Promise(resolve=>{const im=new Image();im.onload=()=>{assets[name]=im;resolve();};im.onerror=()=>{toast('Artwork could not load. Please reload when your connection returns.',10);resolve();};im.src=`assets/${name}.webp?v=03.1`;})));const atlas=assets['character-atlas'];if(atlas){const off=document.createElement('canvas');off.width=atlas.width;off.height=atlas.height;const c=off.getContext('2d',{willReadFrequently:true});c.drawImage(atlas,0,0);const data=c.getImageData(0,0,off.width,off.height).data;for(let col=0;col<6;col++){spriteBounds[col]=[];for(let row=0;row<4;row++){let minX=9999,minY=9999,maxX=0,maxY=0;const startY=row===0?0:row*256+15,endY=Math.min(1024,(row+1)*256+14);for(let y=startY;y<endY;y++){for(let x=col*256;x<(col+1)*256;x++){if(data[(y*off.width+x)*4+3]>220){minX=Math.min(x,minX);minY=Math.min(y,minY);maxX=Math.max(x,maxX);maxY=Math.max(y,maxY);}}}spriteBounds[col][row]={x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1};}}}}
function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;if(!$('menu').open&&!$('document').open&&!document.hidden){t+=dt;activeTime+=dt;update(dt);}if(mode!=='comic')draw();requestAnimationFrame(frame);}
function interact(){
 if(mode==='comic'){finale.advance();return;}
 if(mode==='transition')completeTransition();else if(mode==='prologue')foldPrologue();
 else if(mode==='football'&&distance(player,actors[3])<145)finishFootball();
 else if(['rain','bookCarry'].includes(mode))moveBook();
 else if(mode==='ladder')askLadderHelp();else if(mode==='ladderBook')handLadderBook();else if(mode==='ladderSteady')steadyLadder();else if(mode==='ladderDown')descendLadder();else if(mode==='ladderSupport')holdForClassmate();
 else if(mode==='practiceSetup')preparePractice();else if(mode==='studyDiagram')turnStudyDiagram();else if(mode==='studyFold')foldStudyLetter();
 else if(mode==='explore'){if(!folderOpen&&distance(player,{x:350,y:240})<170)inspectStep();else if(folderOpen){const spots=[{x:350,y:240,fn:inspectStep},{x:710,y:245,fn:inspectNotebook},{x:800,y:245,fn:inspectLetter}];const nearest=spots.sort((a,b)=>distance(a,player)-distance(b,player))[0];if(distance(player,nearest)<170)nearest.fn();else toast('Auntie has put the folder on the table.');}else toast('The doorway is just ahead.');}
 else if(mode==='work'){const task=player.x<420?'sweep':player.x<565?'tools':'board';workTask(task);}
 else if(mode==='fold')foldLetter();else if(mode==='camera')showPlace(player.x<420?'step':player.x>640?'shelter':'door');else if(mode==='finalKick')finalKick();
}

function action(){
 if(mode==='comic'){finale.advance();return;}
 if(mode==='shanghaiWalk'){shanghaiGame.waitUntil=t+.7;}
 else if(mode==='drive'){road.speed=0;road.cruise=false;road.auto=false;roadActions();}
 else if(mode==='football')kickBall();else if(mode==='ladder')climbRung();else if(mode==='ladderDown')descendLadder();else if(mode==='ladderSupport')holdForClassmate();
 else if(['rain','bookCarry'].includes(mode))moveBook();else if(mode==='fatherKick')fatherKick();else if(mode==='finalKick')finalKick();
 else if(mode==='returnPlay'){ball.vx=-130;ball.vy=-25;sfx('kick');}
 else if(['prologue','work','explore','camera','fold','ladderBook','ladderSteady','practiceSetup','studyDiagram','studyFold'].includes(mode))interact();
}

window.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if($('document').open)closeDocument();else if($('menu').open)closeMenu();else openMenu();return;}if($('menu').open||$('document').open||(['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)||document.activeElement?.isContentEditable))return;const key=e.key.length===1?e.key.toLowerCase():e.key;if(mode==='comic'){if([' ','Enter','e','ArrowLeft'].includes(key)){if(e.repeat){e.preventDefault();return;}if(document.activeElement?.tagName==='BUTTON'&&[' ','Enter'].includes(key))return;e.preventDefault();if(key==='ArrowLeft')finale.back();else finale.advance();}return;}if(document.activeElement?.tagName==='BUTTON'&&[' ','Enter'].includes(key))return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' ','Enter','e','w','a','s','d'].includes(key))e.preventDefault();keys.add(key);if(e.repeat)return;if(key==='Enter'||key==='e'){if(mode==='dialogue')advance();else interact();}else if(key===' '&&mode!=='dialogue'&&mode!=='choice')action();});window.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));window.addEventListener('blur',clearKeys);document.addEventListener('visibilitychange',clearKeys);
$('nextLine').onclick=()=>{ensureAudio();advance();$('nextLine').blur();};$('beginButton').onclick=begin;$('continueButton').onclick=continueStory;$('menuToggle').onclick=openMenu;$('closeMenu').onclick=closeMenu;$('resumeButton').onclick=closeMenu;$('newButton').onclick=newStory;$('aboutButton').onclick=about;$('closeDocument').onclick=closeDocument;$('documentDone').onclick=closeDocument;$('document').addEventListener('cancel',e=>{e.preventDefault();closeDocument();});$('menu').addEventListener('cancel',e=>{e.preventDefault();closeMenu();});$('soundToggle').onclick=()=>{$('soundToggle').blur();settings.sound=!settings.sound;ensureAudio();saveSettings();};$('assistSetting').onchange=e=>{settings.assist=e.target.checked;saveSettings();};$('motionSetting').onchange=e=>{settings.reduced=e.target.checked;saveSettings();};$('speedSetting').onchange=e=>{settings.speed=e.target.value;saveSettings();};$('sizeSetting').onchange=e=>{settings.size=e.target.value;saveSettings();};$('touchAction').onclick=()=>{action();$('touchAction').blur();focusStory();};$('touchInteract').onclick=()=>{mode==='dialogue'?advance():interact();$('touchInteract').blur();focusStory();};for(const b of document.querySelectorAll('[data-key]')){b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key);};b.onpointerup=b.onpointercancel=()=>keys.delete(b.dataset.key);}
canvas.addEventListener('pointerdown',e=>{focusStory();const r=canvas.getBoundingClientRect(),cover=getComputedStyle(canvas).objectFit==='cover',scale=cover?Math.max(r.width/W,r.height/H):r.width/W,x=cover?(e.clientX-r.left-(r.width-W*scale)/2)/scale:(e.clientX-r.left)/r.width*W,y=cover?(e.clientY-r.top-(r.height-H*scale)/2)/scale:(e.clientY-r.top)/r.height*H;if(mode==='football'){kickBall({x,y});return;}if(mode==='ladder'){climbRung();return;}if(mode==='shanghaiWalk'){shanghaiGame.auto=true;return;}if(mode!=='explore'&&mode!=='work')return;player.x=clamp(x,140,830);player.y=clamp(y,240,530);interact();});
applySettings();$('sceneLabel').hidden=true;if(story.started){$('continueButton').hidden=false;$('beginButton').textContent='Begin again';$('beginButton').onclick=()=>{openMenu();newStory();};$('continueButton').className='primary';$('beginButton').className='quiet';$('saveStatus').textContent='A story is saved on this device';}loadAssets();requestAnimationFrame(frame);
const model=document.modelContext;if(model?.registerTool){const life=new AbortController();window.addEventListener('pagehide',()=>life.abort(),{once:true});for(const tool of [{name:'read_story_progress',title:'Read story progress',description:'Read current chapter, scene, chosen childhood memory and completed chapters. No story state changes.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(!input||typeof input!=='object'||Object.keys(input).length)throw Error('Expected an empty object');return{chapter,scene,mode,childhoodMessage:story.reply?reply().callback:null,completed:story.completed,codaCompleted:story.codaCompleted,endingPage:story.endingPage};}},{name:'open_story_chapter',title:'Open a story chapter',description:'Navigate to a chapter using the same spoiler warning and saved-memory behavior as the chapter menu. Opens a warning first for unread chapters.',inputSchema:{type:'object',properties:{chapter:{type:'integer',minimum:1,maximum:5}},required:['chapter'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){if(!input||!Number.isInteger(input.chapter)||input.chapter<1||input.chapter>5||Object.keys(input).some(k=>k!=='chapter'))throw Error('Choose chapter 1–5');if(input.chapter===5&&!story.completed)throw Error('The father chapter opens after the main story');openMenu();navigateChapter(input.chapter);return{chapter,warningShown:!$('menuMessage').hidden};}}]){try{Promise.resolve(model.registerTool(tool,{signal:life.signal})).catch(()=>{});}catch{}}}
