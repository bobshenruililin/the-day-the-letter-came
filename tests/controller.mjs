import assert from 'node:assert/strict';
import {makeGame,mechanics,narrative} from './harness.mjs';

const checks=[],failures=[];
function check(name,fn){try{fn();checks.push(name);}catch(error){failures.push({name,message:error.message,location:error.stack?.split('\n').find(x=>x.includes('controller.mjs:'))});}}
const plain=text=>text.replace(/[’‘]/g,"'");
function football(saved=null){
  const game=makeGame(saved);game.api.startChapter(1);game.drainDialogue();
  assert.equal(game.state().mode,'football');return game;
}

check('Keyboard and visible kick controls score twice through actual physics, then reach Mother',()=>{
  const g=football();g.api.place(349,250);g.press(' ');
  assert.equal(g.state().ball.owner,null);assert.ok(g.state().ball.vy<0);
  g.frames(30);assert.equal(g.state().football.goals,1);assert.equal(g.state().mode,'football');
  g.api.place(349,250);g.action(/Kick.*goal/i);g.frames(30);
  assert.equal(g.state().football.goals,2);assert.equal(g.state().mode,'dialogue');
  assert.equal(g.el('counter').textContent,'2 / 2 goals');
  g.api.advance();g.api.advance();assert.equal(g.state().speaker,'MOTHER');
});
check('Movement still works after a button has focus',()=>{
  const g=football(),before=g.state().player.y;g.doc.activeElement=new g.Element('BUTTON');
  g.key('w');g.api.step(.04);g.key('w',false);assert.ok(g.state().player.y<before);
});
check('Dribbling stops outside the goal line; a visible kick is required',()=>{
  const g=football();g.api.place(349,224);g.key('w');g.frames(30);g.key('w',false);
  assert.equal(g.state().football.goals,0);assert.ok(g.state().ball.y>mechanics.GOAL.y);
});
check('A real pass is caught and returned, opens the goal, and produces an assisted goal through normal physics',()=>{
  const g=football();g.action(/Pass.*little one/i);
  assert.equal(g.state().ball.passTarget,'teammate');assert.equal(g.state().ball.owner,null);
  g.until(s=>s.ball.owner==='teammate');g.until(s=>s.ball.owner==='player');
  assert.ok(g.state().football.openUntil>g.state().activeTime);assert.equal(g.state().football.passes,1);
  g.api.place(349,250);g.press(' ');g.frames(30);
  assert.equal(g.state().football.goals,1);assert.equal(g.state().football.assistedGoals,1);
});
check('A menu pauses play and restores canvas focus and movement',()=>{
  const g=football();g.key('w');g.api.openMenu();const paused=g.state();g.frames(120);
  assert.equal(g.state().activeTime,paused.activeTime);assert.equal(g.state().player.y,paused.player.y);
  g.api.closeMenu();assert.equal(g.doc.activeElement,g.el('world'));
  g.key('w');g.api.step(.04);g.key('w',false);assert.ok(g.state().player.y<paused.player.y);
});



check('Prologue reaches child play and reading never advances on a timer or held key',()=>{
  const g=makeGame();g.api.begin();g.press('Enter');assert.equal(g.state().mode,'envelopeTravel');
  g.until(s=>s.mode==='dialogue');const before=g.state();g.frames(1200);
  assert.equal(g.state().text,before.text);assert.equal(g.state().dialogueIndex,before.dialogueIndex);
  g.listeners.get('keydown')({key:'Enter',repeat:true,preventDefault(){}});
  assert.equal(g.state().dialogueIndex,before.dialogueIndex);g.drainDialogue();
  assert.equal(g.state().mode,'football');assert.equal(g.state().chapter,1);
});
check('All four football outcomes use consistent Mother and return-to-yard dialogue',()=>{
  for(const resolution of ['unfinished','sheng','qiang','watch']){
    const g=football();
    if(resolution==='unfinished')g.action(/Go to Mother/i);
    else if(resolution==='watch'){g.action(/Watch.*match/i);g.until(s=>s.mode==='dialogue');}
    else{
      for(let i=0;i<2;i++){
        g.api.setBall({owner:null,x:349,y:195,vx:0,vy:-30,team:resolution==='qiang'?'them':'us'});
        g.api.step(1/60);
      }
    }
    const call=plain(g.drainDialogue().map(x=>x.text).join('\n'));
    assert.equal(g.state().story.footballResolution,resolution);assert.equal(g.state().mode,'choice');
    assert.ok(call.includes(resolution==='unfinished'?"No we're not.":'That would be a new game.'));
    assert.ok(!call.includes(resolution==='unfinished'?'That would be a new game.':"No we're not."));
    g.choice(0);const reply=plain(g.drainDialogue().map(x=>x.text).join('\n'));
    assert.ok(reply.includes(resolution==='unfinished'?"Come on. We're still playing.":"Next one's mine."));
    assert.equal(g.state().mode,'returnPlay');
  }
});
check('Permission to play is an untimed playable interval, followed by book pickup and a deliberate book transition',()=>{
  const g=football();g.action(/Go to Mother/i);g.drainDialogue();g.choice(0);g.drainDialogue();
  g.frames(900);assert.equal(g.state().mode,'returnPlay');const x=g.state().player.x;
  g.key('a');g.frames(30);g.key('a',false);assert.ok(g.state().player.x<x);
  g.press(' ');assert.ok(g.state().ball.vx<0);
  g.action(/^Go on$/i);g.drainDialogue();assert.equal(g.state().mode,'rain');
  g.press('Enter');assert.equal(g.state().mode,'bookCarry');assert.equal(g.state().rainState.held,true);
  g.api.place(702,265);g.press('Enter');assert.equal(g.state().mode,'transition');
  g.frames(900);assert.equal(g.state().mode,'transition');g.press('Enter');
  assert.equal(g.state().chapter,2);assert.equal(g.state().scene,'study');
});


check('Same-story replay speaks only the committed message and does not offer a conflicting replacement',()=>{
  for(const r of narrative.REPLIES){
    const g=football({...mechanics.DEFAULT_STORY,started:true,reply:r.id,maxChapter:4});
    g.action(/Go to Mother/i);const lines=g.drainDialogue();assert.equal(g.state().mode,'returnPlay');
    assert.equal(lines.filter(x=>x.text===r.callback).length,1);assert.equal(g.saved().reply,r.id);
    for(const other of narrative.REPLIES.filter(x=>x.id!==r.id))assert.ok(!lines.some(x=>x.text===other.callback));
  }
});

check('The reciprocal ladder needs book transfer and a steady grip, then changes the player into the support role',()=>{
  const g=makeGame();g.api.startChapter(2);g.drainDialogue();g.key('w');g.until(s=>s.ladder.stage==='ask');g.key('w',false);
  assert.equal(g.state().player.y,mechanics.LADDER.helpY);g.press('Enter');g.drainDialogue();
  assert.equal(g.state().mode,'ladderBook');g.press('Enter');g.drainDialogue();
  assert.equal(g.state().ladder.book,true);assert.equal(g.state().mode,'ladderSteady');
  g.press('Enter');g.drainDialogue();assert.equal(g.state().ladder.peer,true);
  g.key('w');g.until(s=>s.mode==='dialogue');g.key('w',false);assert.equal(g.state().player.y,mechanics.LADDER.top);
  assert.equal(g.state().ladder.stage,'top');g.drainDialogue();assert.equal(g.state().mode,'ladderDown');
  g.key('s');g.until(s=>s.mode==='dialogue');g.key('s',false);g.drainDialogue();
  assert.equal(g.state().mode,'ladderSupport');assert.equal(g.state().player.y,mechanics.LADDER.bottom);
  assert.equal(g.state().ladder.friendY,mechanics.LADDER.bottom);g.frames(120);
  assert.equal(g.state().ladder.friendY,mechanics.LADDER.bottom);
  g.press(' ');g.frames(60);const climbed=g.state().ladder.friendY;assert.ok(climbed<mechanics.LADDER.bottom);
  g.press(' ');g.frames(120);assert.equal(g.state().ladder.friendY,climbed);
  g.press(' ');g.until(s=>s.mode==='dialogue');g.drainDialogue();assert.equal(g.state().mode,'choice');
  assert.equal(g.state().ladder.stage,'done');assert.equal(g.state().ladder.friendY,mechanics.LADDER.top);
});
check('Ladder assistance performs the same reciprocal transfers and reaches both viewpoints',()=>{
  const g=makeGame();g.api.startChapter(2);g.drainDialogue();g.action(/Watch together/i);
  const stages=[];let limit=3000;
  while(g.state().mode!=='choice'){
    assert.ok(limit-->0,'Assisted ladder did not reach the practice choice');stages.push(g.state().ladder.stage);
    if(g.state().mode==='dialogue')g.api.advance();else g.api.step(1/60);
  }
  assert.ok(stages.includes('book'));assert.ok(stages.includes('steady'));assert.ok(stages.includes('descend'));assert.ok(stages.includes('support'));
  assert.equal(g.state().ladder.book,true);assert.equal(g.state().ladder.peer,true);assert.equal(g.state().ladder.friendY,mechanics.LADDER.top);
});
for(const plan of ['a','b']){
  check(`Study plan ${plan.toUpperCase()} has its own preparation and partner timing, then reaches Jo`,()=>{
    const g=makeGame();g.api.startChapter(2);g.drainDialogue();g.api.scheduleChoice();
    g.choice(plan==='a'?/Measurements first/i:/Try.*early/i);assert.equal(g.saved().studyPlan,plan);
    assert.equal(g.state().mode,'transition');g.frames(900);assert.equal(g.state().mode,'transition');g.press('Enter');
    const early=g.drainDialogue();assert.equal(g.state().mode,'practiceSetup');
    assert.equal(g.state().studyState.prepared,false);assert.equal(g.state().studyState.late,false);
    assert.equal(g.state().actors.filter(x=>x.name==='Study partner').length,1);
    assert.ok(early.some(x=>x.text.includes(plan==='a'?'Measurements first?':'We can try it once.')));
    g.press('Enter');assert.equal(g.state().studyState.prepared,true);assert.equal(g.state().mode,'transition');g.press('Enter');
    const arrival=g.drainDialogue();assert.equal(g.state().mode,'studyDiagram');assert.equal(g.state().studyState.late,true);
    assert.equal(g.state().studyState.partnerPresent,plan==='a');assert.equal(g.state().actors.filter(x=>x.name==='Late classmate').length,1);
    assert.ok(arrival.some(x=>x.text.includes(plan==='a'?'We saved this part.':'One attempt.')));
    g.press('Enter');const turned=g.drainDialogue();assert.equal(g.state().studyState.turned,true);
    assert.equal(turned.some(x=>x.speaker==='STUDY PARTNER'&&x.text==='Ask the next bit as well.'),plan==='a');
    assert.equal(g.state().mode,'studyFold');assert.ok(turned.some(x=>x.text.includes('Classes are harder than I expected.')));
    g.press('Enter');assert.equal(g.state().scene,'family');g.press('Enter');const family=g.drainDialogue();
    assert.ok(family.some(x=>x.speaker==='YOUNG JO'));assert.equal(g.state().mode,'transition');
    g.press('Enter');assert.equal(g.state().chapter,3);const request=g.drainDialogue();
    assert.ok(request.some(x=>x.speaker==='SHENG'&&/photograph of the doorway/i.test(x.text)));
    assert.equal(g.state().mode,'shanghaiWalk');
  });
}

check('Shanghai has a playable route and no collision displacement or precision failure',()=>{
  const g=makeGame();g.api.startChapter(3);g.drainDialogue();assert.equal(g.state().mode,'shanghaiWalk');
  g.api.place(190,535);g.api.step(1/60);assert.equal(g.state().player.y,535);
  g.action(/Walk.*friend/i);g.until(s=>s.mode==='dialogue');const lines=g.drainDialogue();
  assert.ok(lines.some(x=>x.text==='I like it down here.'));assert.equal(g.state().mode,'transition');
  g.press('Enter');g.drainDialogue();assert.equal(g.state().mode,'drive');
});

check('One workshop interaction permits shared completion, while additional smoothing remains optional',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,completed:true,reply:'trick'});g.api.startChapter(5);g.drainDialogue();
  assert.equal(g.state().mode,'work');assert.equal(g.el('counter').hidden,true);
  const coworkerX=g.state().actors[0].x;g.action(/Smooth.*board/i);assert.equal(g.state().work.strokes,1);
  assert.equal(g.state().work.done.length,0);assert.notEqual(g.state().actors[0].x,coworkerX);
  g.action(/Finish together/i);g.drainDialogue();assert.equal(g.state().mode,'fatherKick');
});

const pageIds=['same_door','kept','sent','voice','of_course','little_one','before_dark','show_me','still_here'];
function startComic(g){
  g.api.startChapter(4,{direct:true});assert.equal(g.state().mode,'comic');
  assert.equal(g.state().finale.id,'same_door');assert.equal(g.state().finale.visible,true);
  assert.equal(g.el('stage').hidden,true);assert.equal(g.el('hud').hidden,true);
  assert.equal(g.el('actionbar').hidden,true);assert.equal(g.el('document').open,false);
}
function completeComic(g){
  let limit=12;while(g.state().finale.id!=='still_here'){assert.ok(limit-->0,'Comic did not reach the final tableau');g.press(' ');}
  assert.equal(g.state().finale.completed,true);assert.equal(g.saved().completed,true);
  assert.equal(g.saved().resumeEnding,true);assert.equal(g.saved().endingPage,'still_here');
  assert.equal(g.state().phoneActive,true);assert.equal(g.el('document').open,false);
}
function driveUntil(g,predicate){
  let limit=2400;while(!predicate(g.state())){
    assert.ok(limit-->0,`Drive did not reach the next scene: ${g.state().mode}`);
    if(g.state().mode==='dialogue'){const before=g.state().road.progress;g.frames(120);assert.equal(g.state().road.progress,before);g.drainDialogue();}
    else g.api.step(1/60);
  }
}

check('Chapter 4 automatically opens the first readable comic page without inspection, modal, camera or kick controls',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,readShengLetter:true,inspected:['step','notebook','letter'],shownShelter:false});startComic(g);
  assert.ok(g.el('finale').textContent.includes('Dad asked for a photograph.'));
  assert.ok(g.el('finale').textContent.includes('Sit down first.'));
  assert.deepEqual(g.state().inspection,[]);assert.deepEqual(g.state().cameraViews,[]);
  const initial=g.state().finale.id;g.frames(1200);assert.equal(g.state().finale.id,initial);
  for(let i=1;i<pageIds.length;i++){g.press(' ');assert.equal(g.state().finale.id,pageIds[i]);assert.equal(g.el('document').open,false);assert.equal(g.el('actionbar').hidden,true);}
  assert.equal(g.saved().completed,true);assert.equal(g.state().finale.completed,true);
  assert.ok(!g.el('finale').textContent.includes('The one about classes.'));
});
for(const r of narrative.REPLIES){
  check(`The ${r.id} choice reaches the comic notebook, call and transcript exactly`,()=>{
    const g=football();g.action(/Go to Mother/i);g.drainDialogue();g.choice(narrative.REPLIES.indexOf(r));
    assert.equal(g.state().text,r.callback);g.drainDialogue();assert.equal(g.saved().reply,r.id);startComic(g);
    g.press('Enter');assert.equal(g.state().finale.id,'kept');const notebook=g.el('finale').textContent;
    assert.ok(notebook.includes(r.callback));assert.ok(notebook.includes('Payment for mending received.'));
    assert.ok(notebook.includes('Reply copy:'));assert.ok(!/choice was remembered|default memory/i.test(notebook));
    for(const other of narrative.REPLIES.filter(x=>x.id!==r.id))assert.ok(!notebook.includes(other.callback));
    g.press('e');assert.equal(g.state().finale.id,'sent');assert.ok(g.el('finale').textContent.includes(narrative.LETTER));
    g.press(' ');assert.equal(g.state().finale.id,'voice');assert.ok(g.el('finale').textContent.includes(r.callback));
    const transcript=g.api.getFinale().transcript();assert.equal(transcript.split(r.callback).length-1,2);
    for(const other of narrative.REPLIES.filter(x=>x.id!==r.id))assert.ok(!transcript.includes(other.callback));
    completeComic(g);assert.equal(g.saved().reply,r.id);
  });
}
check('Direct comic entry labels the default in navigation and never writes it as a prior player choice',()=>{
  const g=makeGame();startComic(g);assert.equal(g.state().storedDefault,true);
  assert.equal(g.el('entryNotice').hidden,false);assert.ok(g.el('entryNotice').textContent.includes(narrative.REPLIES[0].callback));
  assert.equal(g.saved().reply,null);g.press(' ');assert.ok(g.el('finale').textContent.includes(narrative.REPLIES[0].callback));
  assert.ok(!/default memory|no childhood message/i.test(g.el('finale').textContent));completeComic(g);assert.equal(g.saved().reply,null);
});
check('Every middle comic page persists and Continue resumes that page with the same canonical message',()=>{
  for(const target of ['sent','voice','little_one','before_dark','show_me']){
    const g=makeGame({...mechanics.DEFAULT_STORY,reply:'goal'});startComic(g);
    while(g.state().finale.id!==target)g.press(' ');
    const saved=g.saved();assert.equal(saved.endingPage,target);assert.equal(saved.completed,false);
    const resumed=makeGame(saved);resumed.el('continueButton').click();
    assert.equal(resumed.state().mode,'comic');assert.equal(resumed.state().finale.id,target);
    assert.equal(resumed.state().finale.memory,narrative.REPLIES[2].callback);assert.equal(resumed.saved().reply,'goal');
  }
});
check('Completed reload restores the open-call tableau, while back and re-read preserve completion',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,reply:'trick'});startComic(g);completeComic(g);
  g.press('ArrowLeft');assert.equal(g.state().finale.id,'show_me');assert.equal(g.state().finale.completed,true);
  assert.equal(g.saved().completed,true);assert.equal(g.saved().resumeEnding,true);
  const resumed=makeGame(g.saved());resumed.el('continueButton').click();
  assert.equal(resumed.state().finale.id,'still_here');assert.equal(resumed.state().phoneActive,true);assert.equal(resumed.saved().reply,'trick');
  resumed.frames(1800);resumed.press(' ');assert.equal(resumed.state().finale.id,'still_here');
  assert.equal(resumed.state().finale.completed,true);assert.equal(resumed.el('document').open,false);
});
check('Comic advance, held keys and native button activation have exclusive input routing',()=>{
  const g=makeGame();g.api.settings({reduced:true});startComic(g);const state=g.state();
  g.key('w');g.key('ArrowUp');g.api.step(.04);g.key('w',false);g.key('ArrowUp',false);
  assert.equal(g.state().finale.id,state.finale.id);assert.equal(g.state().road,null);
  g.key(' ');g.key(' ',false);assert.equal(g.state().finale.id,'kept');
  for(let i=0;i<10;i++)g.key(' ',true,{repeat:true});assert.equal(g.state().finale.id,'kept');
  for(const value of ['Enter','e',' ']){g.key(value);g.key(value,false);}assert.equal(g.state().finale.id,'kept');
  g.tick(350);const next=g.el('finale').querySelectorAll('button').find(b=>/Continue|Next/i.test(b.textContent));assert.ok(next);
  g.doc.activeElement=next;g.key('Enter');assert.equal(g.state().finale.id,'kept');next.click();g.key('Enter',false);
  assert.equal(g.state().finale.id,'sent');
  const language=g.el('finale').querySelectorAll('button').find(b=>/中文|Chinese/i.test(b.textContent));assert.ok(language);
  g.doc.activeElement=language;g.key(' ');assert.equal(g.state().finale.id,'sent');language.click();g.key(' ',false);
  assert.equal(g.state().finale.language,'zh');assert.equal(g.state().finale.id,'sent');
  const back=g.el('finale').querySelectorAll('button').find(b=>/Back/i.test(b.textContent));assert.ok(back);
  g.doc.activeElement=back;g.key('Enter');assert.equal(g.state().finale.id,'sent');back.click();g.key('Enter',false);
  assert.equal(g.state().finale.id,'kept');
  const repeated=g.key('Enter',true,{repeat:true});assert.equal(repeated.defaultPrevented,true);assert.equal(g.state().finale.id,'kept');
  const transcript=g.el('finale').querySelectorAll('button').find(b=>/Transcript/i.test(b.textContent));assert.ok(transcript);
  g.doc.activeElement=transcript;g.key(' ');assert.equal(g.state().finale.id,'kept');transcript.click();g.key(' ',false);
  assert.equal(g.el('document').open,true);assert.equal(g.state().finale.id,'kept');
});
check('Comic pause, transcript and notes controls leave the page in place and restore reading focus',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,reply:'goal'});startComic(g);g.press(' ');g.press(' ');
  const page=g.state().finale.id;g.press('Escape');const paused=g.state().activeTime;g.frames(600);
  assert.equal(g.state().activeTime,paused);assert.equal(g.state().finale.id,page);
  g.press('Escape');assert.equal(g.doc.activeElement,g.el('finale'));
  g.click('finale',/Transcript|Read.*conversation/i);assert.equal(g.el('document').open,true);
  assert.ok(g.el('documentBody').textContent.includes(narrative.LETTER));assert.equal(g.state().finale.id,page);
  g.press('Escape');assert.equal(g.state().finale.id,page);assert.equal(g.doc.activeElement,g.el('finale'));
  g.api.openFamilyRecords();assert.equal(g.el('document').open,false);
  completeComic(g);g.api.openFamilyRecords();assert.equal(g.el('document').open,true);
  g.click('documentBody',/Sheng.*Hong Kong/i);assert.ok(g.el('documentBody').textContent.includes(narrative.STUDY_LETTER));
  g.press('Escape');g.press('Escape');assert.equal(g.state().finale.id,'still_here');assert.equal(g.saved().completed,true);
});
check('Sound off, reduced motion and larger text preserve the full finale without initializing audio',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,reply:'trick'});g.api.settings({sound:false,reduced:true,size:'1.4'});startComic(g);
  assert.equal(g.state().finale.settled,true);assert.equal(g.state().soundInitialized,false);completeComic(g);
  assert.equal(g.state().soundInitialized,false);const transcript=g.api.getFinale().transcript();
  assert.ok(transcript.includes(narrative.LETTER));assert.ok(transcript.includes('Of course. I wanted him home.'));
  assert.ok(transcript.includes('I was taller than him.'));assert.ok(transcript.includes(narrative.REPLIES[1].callback));
});

function driveVisit({photos,stop}){
  const g=makeGame();g.api.startChapter(3);g.drainDialogue();g.api.startRoad();
  g.action(/Trip album/i);const paused=g.state().road.progress;g.frames(600);assert.equal(g.state().road.progress,paused);g.api.closeDocument();
  let limit=4000,chosen=false;
  while(g.state().mode!=='comic'){
    assert.ok(limit-->0,'Drive did not open the comic');const state=g.state();
    if(state.mode==='choice'){g.choice(stop==='snack'?/snack/i:stop==='scenic'?/water/i:/Keep going/i);chosen=true;}
    else if(state.mode==='dialogue')g.api.advance();
    else if(state.mode==='detour'){const at=g.state().road.progress;g.frames(300);assert.equal(g.state().road.progress,at);g.action(/Back.*road/i);}
    else if(state.mode==='drive'){
      if(photos){if(!state.road.auto)g.action(/friend drive/i);g.api.step(1/60);}
      else{const next=state.road.photos.find(p=>p.y<mechanics.roadPosition(state.road.progress).y+44),desired=next?.dx>0?-48:48,direction=state.road.lane<desired?'d':state.road.lane>desired?'a':null;
        g.key('w');if(direction)g.key(direction);g.api.step(1/60);g.key('w',false);if(direction)g.key(direction,false);}
    }else g.api.step(1/60);
  }
  assert.equal(chosen,true);assert.equal(g.state().chapter,4);assert.equal(g.state().finale.id,'same_door');
  assert.equal(g.saved().roadStop,stop);assert.equal(g.saved().tripPhotos.length,photos?3:0);
  assert.equal(g.state().finale.roadStop,stop);assert.deepEqual(g.state().finale.tripPhotos,g.saved().tripPhotos);
  assert.equal(g.el('document').open,false);assert.equal(g.el('actionbar').hidden,true);assert.equal(g.el('hud').hidden,true);return g;
}
for(const [photos,stop] of [[false,'direct'],[true,'snack'],[false,'scenic']]){
  check(`The ${stop} road visit with ${photos?'photos':'no photos'} hands off automatically and retains only actual optional road state`,()=>{
    const g=driveVisit({photos,stop});assert.ok(g.el('finale').textContent.includes('Sit down first.'));completeComic(g);
  });
}
check('Workshop watch, kick and folds return to the completed comic tableau and persist that return',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,started:true,completed:true,chapter:4,maxChapter:4,reply:'goal',resumeEnding:true,endingPage:'still_here'});
  g.api.startChapter(5);g.drainDialogue();g.action(/Watch.*routine/i);g.drainDialogue();assert.equal(g.state().mode,'fatherKick');
  g.press(' ');const father=g.drainDialogue();assert.ok(father.some(x=>x.text==='Exactly.'));
  for(const r of narrative.REPLIES)assert.ok(!father.some(x=>x.text===r.callback));
  assert.ok(g.el('documentBody').textContent.includes(narrative.LETTER));g.api.closeDocument();
  g.press('Enter');g.press('Enter');g.press('Enter');g.press('Enter');
  assert.ok(g.el('transition').textContent.includes('around 2015'));g.press('Enter');
  assert.equal(g.state().mode,'comic');assert.equal(g.state().finale.id,'still_here');assert.equal(g.state().phoneActive,true);
  assert.equal(g.saved().codaCompleted,true);assert.equal(g.saved().chapter,4);assert.equal(g.saved().endingPage,'still_here');assert.equal(g.saved().reply,'goal');
  const resumed=makeGame(g.saved());resumed.el('continueButton').click();assert.equal(resumed.state().finale.id,'still_here');assert.equal(resumed.state().phoneActive,true);
});
check('Deliberate New story resets ending-page state and permits a different first message',()=>{
  const g=makeGame({...mechanics.DEFAULT_STORY,started:true,completed:true,codaCompleted:true,reply:'goal',studyPlan:'b',roadStop:'snack',readShengLetter:true,tripPhotos:['lane'],resumeEnding:true,endingPage:'still_here'});
  g.el('continueButton').click();g.api.openMenu();g.api.newStory();g.click('menuMessage',/^Start a new story$/i);
  assert.equal(g.state().mode,'prologue');assert.equal(g.saved().reply,null);assert.equal(g.saved().endingPage,null);
  assert.equal(g.saved().completed,false);assert.equal(g.saved().codaCompleted,false);assert.equal(g.saved().studyPlan,null);
  assert.equal(g.saved().readShengLetter,false);assert.deepEqual(g.saved().tripPhotos,[]);assert.equal(g.saved().resumeEnding,false);
  assert.equal(g.el('finale').hidden,true);g.api.startChapter(1);g.drainDialogue();g.action(/Go to Mother/i);g.drainDialogue();g.choice(0);assert.equal(g.saved().reply,'football');
});
check('One uninterrupted journey links earlier play, all nine comic pages and the optional coda without an old ending gate',()=>{
  const g=makeGame();g.api.begin();g.press('Enter');g.until(s=>s.mode==='dialogue');g.drainDialogue();
  g.action(/Go to Mother/i);g.drainDialogue();g.choice(1);g.drainDialogue();
  g.action(/^Go on$/i);g.drainDialogue();g.press('Enter');g.action(/Place.*dry table/i);g.press('Enter');g.drainDialogue();
  g.action(/Watch together/i);let limit=3000;while(g.state().mode!=='choice'){assert.ok(limit-->0,'Sequential ladder did not finish');if(g.state().mode==='dialogue')g.api.advance();else g.api.step(1/60);}
  g.choice(/Try.*early/i);g.press('Enter');g.drainDialogue();g.press('Enter');g.press('Enter');g.drainDialogue();
  g.press('Enter');g.drainDialogue();g.press('Enter');g.press('Enter');g.drainDialogue();g.press('Enter');g.drainDialogue();
  g.action(/Walk.*friend/i);g.until(s=>s.mode==='dialogue');g.drainDialogue();g.press('Enter');g.drainDialogue();
  g.action(/friend drive/i);driveUntil(g,s=>s.mode==='choice');g.choice(/snack/i);g.drainDialogue();g.action(/Back.*road/i);
  driveUntil(g,s=>s.mode==='comic');assert.equal(g.state().finale.id,'same_door');completeComic(g);
  g.api.openMenu();g.click('chapterGrid',/Before It Arrived/i);g.drainDialogue();g.action(/Smooth.*board/i);g.action(/Finish together/i);g.drainDialogue();
  g.press(' ');g.drainDialogue();g.api.closeDocument();for(let i=0;i<5;i++)g.press('Enter');
  assert.equal(g.state().finale.id,'still_here');assert.equal(g.saved().reply,'trick');assert.equal(g.saved().studyPlan,'b');
  assert.equal(g.saved().roadStop,'snack');assert.equal(g.saved().tripPhotos.length,3);assert.equal(g.saved().completed,true);assert.equal(g.saved().codaCompleted,true);
});

console.log(JSON.stringify({passed:checks.length,checks,failed:failures.length,failures},null,2));
if(failures.length)process.exitCode=1;
