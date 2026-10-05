import assert from 'node:assert/strict';
import {makeFinale,narrative} from './harness.mjs';

const ids=['same_door','kept','sent','voice','of_course','little_one','before_dark','show_me','still_here'];
const checks=[],failures=[];
function check(name,fn){try{fn();checks.push(name);}catch(error){failures.push({name,message:error.message,location:error.stack?.split('\n').find(line=>line.includes('finale.mjs:'))});}}
function finish(g){let limit=12;while(g.state().id!=='still_here'){assert.ok(limit-->0,'Finale did not finish');g.advance();}}

check('Nine stable pages render complete text immediately, remain untimed, and finish without an extra final click',()=>{
  const g=makeFinale();assert.deepEqual(Array.from(g.module.FINAL_PAGE_IDS),ids);
  assert.equal(g.state().visible,true);assert.equal(g.state().id,'same_door');
  assert.ok(g.host.textContent.includes('Dad asked for a photograph.'));assert.ok(g.host.textContent.includes('Sit down first.'));
  g.tick(10000);assert.equal(g.state().id,'same_door');
  for(let index=1;index<ids.length;index++){g.advance();assert.equal(g.state().id,ids[index]);assert.equal(g.state().page,index);}
  assert.equal(g.state().completed,true);assert.deepEqual(g.calls.completed,['still_here']);
  assert.ok(g.host.textContent.includes("Don't hang up yet.")||g.host.textContent.includes('Don’t hang up yet.'));
  const advance=g.host.querySelectorAll('button').find(button=>/Continue|Next/i.test(button.textContent));
  assert.ok(!advance||advance.hidden||advance.disabled);g.tick(10000);g.view.advance();assert.equal(g.state().id,'still_here');
});
check('Every saved message appears exactly in the notebook, voice and full transcript with no substitute',()=>{
  for(const r of narrative.REPLIES){
    const g=makeFinale({memory:r.id});g.advance();assert.equal(g.state().id,'kept');assert.ok(g.host.textContent.includes(r.callback));
    assert.ok(g.host.textContent.includes('Payment for mending received. Used some to have the ball repaired.'));
    assert.ok(g.host.textContent.includes('Have you kept enough for yourself?'));
    assert.ok(!/choice was remembered|default memory|last thing/i.test(g.host.textContent));
    g.advance();g.advance();assert.equal(g.state().id,'voice');assert.ok(g.host.textContent.includes(r.callback));
    const transcript=g.view.transcript();assert.equal(typeof transcript,'string');assert.equal(transcript.split(r.callback).length-1,2);
    for(const other of narrative.REPLIES.filter(x=>x.id!==r.id))assert.ok(!transcript.includes(other.callback));
    assert.ok(!transcript.includes(narrative.STUDY_LETTER));
  }
});
check('Canonical memory and optional photos are snapshotted and invalid/default inputs are resolved consistently',()=>{
  const memory={id:'goal',callback:narrative.REPLIES[2].callback},photos=['bridge'];
  const g=makeFinale({memory,tripPhotos:photos});memory.callback=narrative.REPLIES[0].callback;photos.push('fields');
  assert.equal(g.state().memory,narrative.REPLIES[2].callback);assert.deepEqual(g.state().tripPhotos,['bridge']);
  const defaultGame=makeFinale({memory:'not-a-choice',page:'not-a-page'});assert.equal(defaultGame.state().memory,narrative.REPLIES[0].callback);
  assert.equal(defaultGame.state().id,'same_door');defaultGame.advance();assert.ok(defaultGame.host.textContent.includes(narrative.REPLIES[0].callback));
});
check('The full existing letter and Chinese draft are readable without changing page, memory or completion',()=>{
  const g=makeFinale({page:'sent',memory:'trick'});assert.ok(g.host.textContent.includes(narrative.LETTER));
  const pages=g.calls.pages.length;g.click(/中文|Chinese/i);assert.equal(g.state().language,'zh');
  assert.ok(g.host.textContent.includes(narrative.LETTER_ZH));assert.ok(g.view.transcript().includes(narrative.LETTER_ZH));
  assert.equal(g.state().id,'sent');assert.equal(g.state().memory,narrative.REPLIES[1].callback);assert.equal(g.calls.pages.length,pages);
  g.click(/English|英文/i);assert.ok(g.host.textContent.includes(narrative.LETTER));assert.equal(g.state().language,'en');
});
check('An early advance settles the entrance and rapid subsequent input cannot skip another page',()=>{
  const g=makeFinale();assert.equal(g.state().settled,false);g.view.advance();
  assert.equal(g.state().settled,true);assert.equal(g.state().id,'same_door');
  g.view.advance();assert.equal(g.state().id,'same_door');g.advance();assert.equal(g.state().id,'kept');
  for(let i=0;i<8;i++)g.view.advance();assert.equal(g.state().id,'kept');
});
check('Continue clicks and story-area taps each advance once even when an event bubbles',()=>{
  const g=makeFinale({settings:{reduced:true}});const button=g.host.querySelectorAll('button').find(b=>/Continue|Next/i.test(b.textContent));assert.ok(button);
  g.tick(350);button.click();assert.equal(g.state().id,'kept');button.click();assert.equal(g.state().id,'kept');
  g.tick(350);g.host.querySelector('.finale-reader').dispatchEvent({type:'click',bubbles:true,button:0});assert.equal(g.state().id,'sent');
});
check('Completion remains latched through back/re-read and callbacks fire once per show entry',()=>{
  const g=makeFinale();finish(g);g.tick(350);g.view.back();assert.equal(g.state().id,'show_me');assert.equal(g.state().completed,true);
  g.advance();assert.equal(g.state().id,'still_here');assert.equal(g.calls.completed.length,1);
  g.view.show({page:'still_here',memory:'football',roadStop:'direct',tripPhotos:[]});
  assert.equal(g.state().completed,true);assert.equal(g.calls.completed.length,2);
  g.view.advance();assert.equal(g.calls.completed.length,2);
});
check('Secondary transcript and records buttons consume their input without turning a page',()=>{
  const g=makeFinale({page:'voice'});const page=g.state().id;g.click(/Transcript|Read.*conversation/i);
  assert.equal(g.calls.transcript,1);assert.equal(g.state().id,page);assert.equal(g.calls.records,0);
  finish(g);g.click(/Records/i);assert.equal(g.calls.records,1);assert.equal(g.state().id,'still_here');
});
check('Reduced motion retains all information and avoids waiting for art',()=>{
  const g=makeFinale({settings:{reduced:true,sound:false,size:'1.4'}});
  assert.equal(g.state().settled,true);g.view.advance();assert.equal(g.state().id,'kept');
  finish(g);assert.equal(g.state().completed,true);
  const transcript=g.view.transcript();assert.ok(transcript.includes('Of course. I wanted him home.'));
  assert.ok(transcript.includes('I was taller than him.'));assert.ok(transcript.includes('She did her mending there.'));
});
check('Refreshing reading settings changes neither page order nor canonical content',()=>{
  const g=makeFinale({page:'sent',memory:'goal'}),before=g.host.textContent,pages=g.calls.pages.length;
  g.settings.size='1.4';g.settings.reduced=true;g.view.refreshSettings();
  assert.equal(g.state().settled,true);assert.equal(g.state().id,'sent');assert.equal(g.calls.pages.length,pages);
  assert.ok(g.host.textContent.includes(narrative.LETTER));assert.equal(g.state().memory,narrative.REPLIES[2].callback);
  assert.ok(before.includes(narrative.LETTER));
});
check('Image failures preserve readable content and the path to completion',()=>{
  const g=makeFinale();for(const img of g.host.querySelectorAll('img'))img.dispatchEvent({type:'error',bubbles:false});
  assert.ok(g.host.textContent.includes('Dad asked for a photograph.'));assert.equal(g.state().visible,true);
  for(const img of g.host.querySelectorAll('img')){assert.equal(img.hidden,true);img.dispatchEvent({type:'load',bubbles:false});assert.equal(img.hidden,false);}
  finish(g);
  assert.equal(g.state().completed,true);assert.ok(g.host.textContent.includes('All right.'));
});
check('All road branches use the same nine-page welcome and ending, with only actual collected photos retained',()=>{
  for(const roadStop of ['direct','scenic','snack'])for(const photos of [[],['lane','bridge','fields']]){
    const g=makeFinale({roadStop,tripPhotos:[...photos,'fake',...photos],memory:'trick'});
    assert.equal(g.state().roadStop,roadStop);assert.deepEqual(g.state().tripPhotos,photos);
    const bag=g.host.querySelector('.finale-small-bag');assert.ok(bag);
    assert.equal(/snack/i.test(bag.getAttribute('aria-label')),roadStop==='snack');
    const thumbnails=g.host.querySelectorAll('img').filter(img=>img.src.split('?')[0]==='assets/ningbo-road.webp');
    assert.equal(thumbnails.length,photos.length?1:0);
    if(photos.length)assert.ok(thumbnails[0].alt.includes('Village lane'));
    assert.ok(g.host.textContent.includes('Sit down first.'));finish(g);assert.equal(g.state().id,'still_here');
    assert.equal(g.state().completed,true);assert.equal(g.state().memory,narrative.REPLIES[1].callback);
  }
});

console.log(JSON.stringify({passed:checks.length,checks,failed:failures.length,failures},null,2));
if(failures.length)process.exitCode=1;
