import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as mechanics from '../dist/mechanics.js';
import * as narrative from '../dist/story.js';
import {createDOM} from './dom.mjs';

const source=await readFile(new URL('../dist/game.js',import.meta.url),'utf8');
const finaleSource=await readFile(new URL('../dist/finale.js',import.meta.url),'utf8').catch(error=>{if(error.code==='ENOENT')return '';throw error;});
const stripImports=text=>text.replace(/^import\s+[\s\S]*?from\s+['"][^'"]+['"];\s*/gm,'');
function installFinale(scope){
  if(!finaleSource)return null;
  const body=stripImports(finaleSource).replace(/\bexport\s+(?=(?:const|let|var|function|class)\b)/g,'').replace(/^export\s*\{[^}]*\};?\s*$/gm,'');
  vm.runInNewContext(`globalThis.testFinaleModule=(()=>{${body}\nreturn {createFinale,FINAL_PAGE_IDS};})();`,scope);
  Object.assign(scope,scope.testFinaleModule);return scope.testFinaleModule;
}
const hooks=['begin','startChapter','advance','completeTransition','kickBall','passBall',
  'finishFootball','startRain','moveBook','startLadder','climbRung','askLadderHelp',
  'handLadderBook','steadyLadder','descendLadder','holdForClassmate','scheduleChoice',
  'practice','preparePractice','turnStudyDiagram','foldStudyLetter','startRoad',
  'roadJunction','resumeRoad','arriveRoad','startComic','getFinale','openFamilyRecords',
  'closeDocument','startWork','workTask','endWork','fatherKick','foldLetter',
  'openMenu','closeMenu','newStory','continueStory','restoreEnding'];

// Every scenario loads the actual controller and finale view into an isolated VM.
// No gameplay is reimplemented. The DOM stores text, focus, modal state and events.
export function makeGame(saved=null){
  const dom=createDOM(),{doc,el,Element,listeners}=dom,memory=new Map();
  if(saved)memory.set(mechanics.SAVE_KEY,JSON.stringify(saved));
  el('soundToggle').append(new Element('SPAN'));
  const scope={...dom.globals,...mechanics,...narrative,console,testClock:dom,
    localStorage:{getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)}};
  const module=installFinale(scope);
  const exposure=hooks.map(name=>`${name}:typeof ${name}==='function'?${name}:undefined`).join(',');
  vm.runInNewContext(stripImports(source)+`
    globalThis.api={${exposure},
      step(dt){testClock.tick(dt*1000);if(!$('menu').open&&!$('document').open&&!document.hidden){t+=dt;activeTime+=dt;update(dt)}},
      place(x,y){player.x=x;player.y=y;player.dir=1},
      setBall(value){Object.assign(ball,value)},
      assist(value=true){settings.assist=value},
      settings(value){Object.assign(settings,value);applySettings()},
      state(){return JSON.parse(JSON.stringify({scene,mode,chapter,t,activeTime,story,
        storedDefault,phoneActive,player,actors,ball,football,ladder,road,work,soundInitialized:!!soundContext,
        rainState:typeof rainState==='undefined'?null:rainState,
        studyState:typeof studyState==='undefined'?null:studyState,
        shanghaiGame,quietEnding:typeof quietEnding==='undefined'?false:quietEnding,
        finale:typeof finale==='undefined'||!finale?null:finale.getState(),
        inspection:typeof inspection==='undefined'?[]:[...inspection],
        cameraViews:typeof cameraViews==='undefined'?[]:[...cameraViews],
        speaker:dialogue?.lines[dialogue.index]?.speaker,
        text:dialogue?.lines[dialogue.index]?.text,lines:dialogue?.lines,dialogueIndex:dialogue?.index,
        documentOpen:$('document').open,menuOpen:$('menu').open},
        (key,value)=>value instanceof Set?[...value]:value))}
    };`,scope);
  const api=scope.api,state=()=>JSON.parse(JSON.stringify(api.state()));
  const frames=(count,dt=1/60)=>{for(let i=0;i<count;i++)api.step(dt);};
  function key(value,down=true,{repeat=false}={}){
    const event={key:value,repeat,preventDefault(){this.defaultPrevented=true;},stopPropagation(){this.cancelBubble=true;},stopImmediatePropagation(){this.immediateStopped=true;}};
    listeners.get(down?'keydown':'keyup')?.(event);return event;
  }
  function press(value){dom.tick(350);key(value);key(value,false);}
  function control(container,match){
    const buttons=el(container).querySelectorAll('button');
    const found=buttons.find((button,index)=>!button.disabled&&!button.hidden&&(typeof match==='number'?index===match:typeof match==='string'?button.textContent===match:match.test(button.textContent)));
    assert.ok(found,`Missing ${container} control matching ${match}; available: ${buttons.map(button=>button.textContent).join(' | ')}`);
    dom.tick(350);found.click();return found;
  }
  function drainDialogue(limit=180){
    const seen=[];while(state().mode==='dialogue'&&!el('document').open){assert.ok(limit-->0,'Dialogue did not settle');seen.push({speaker:state().speaker,text:state().text});api.advance();}return seen;
  }
  function until(predicate,{limit=1800,dt=1/60}={}){
    while(!predicate(state())){assert.ok(limit-->0,`Timed progress did not reach expected state: ${JSON.stringify(state())}`);api.step(dt);}
  }
  return {api,state,el,doc,Element,memory,listeners,frames,key,press,dom,module,
    tick:dom.tick,click:control,action:match=>control('actions',match),choice:match=>control('choices',match),
    drainDialogue,until,saved:()=>JSON.parse(memory.get(mechanics.SAVE_KEY))};
}

export function makeFinale({memory=null,page=0,roadStop='direct',tripPhotos=[],settings={}}={}){
  const dom=createDOM(),scope={...dom.globals,...mechanics,...narrative,console};
  const module=installFinale(scope);assert.ok(module,'Actual finale module is missing');
  const host=dom.el('finaleTest'),calls={pages:[],completed:[],sounds:[],transcript:0,records:0};
  const config={reduced:false,size:'1',sound:false,...settings};
  const view=module.createFinale({host,getSettings:()=>config,onPage:id=>calls.pages.push(id),
    onComplete:id=>calls.completed.push(id),onSound:sound=>calls.sounds.push(sound),
    onTranscript:()=>calls.transcript++,onRecords:()=>calls.records++});
  view.show({page,memory,roadStop,tripPhotos});
  const state=()=>JSON.parse(JSON.stringify(view.getState()));
  const advance=()=>{dom.tick(350);view.advance();};
  function click(match){const buttons=host.querySelectorAll('button'),button=buttons.find(b=>typeof match==='string'?b.textContent===match:match.test(b.textContent));assert.ok(button,`Missing finale button ${match}; available: ${buttons.map(b=>b.textContent).join(' | ')}`);dom.tick(350);button.click();return button;}
  return {view,state,host,calls,settings:config,module,dom,advance,click,tick:dom.tick};
}

export {mechanics,narrative};
