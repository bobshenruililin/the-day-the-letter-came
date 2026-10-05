export const SAVE_KEY = 'letter-came-story-v1';
export const SETTINGS_KEY = 'letter-came-settings-v1';
export const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
export const distance = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const ENDING_PAGE_IDS=['same_door','kept','sent','voice','of_course','little_one','before_dark','show_me','still_here'];
export const DEFAULT_STORY = {version:1,started:false,chapter:0,maxChapter:0,reply:null,completed:false,codaCompleted:false,tripPhotos:[],footballResolution:'unfinished',studyPlan:null,roadStop:'direct',readShengLetter:false,resumeEnding:false,endingPage:null};
export function loadStory(storage){
 try{
  const raw=JSON.parse(storage.getItem(SAVE_KEY));if(!raw||raw.version!==1)return {...DEFAULT_STORY};
  const chapter=clamp(Number(raw.chapter)||0,0,5);
  return {...DEFAULT_STORY,...raw,chapter,maxChapter:clamp(Number(raw.maxChapter)||0,0,4),reply:['football','trick','goal'].includes(raw.reply)?raw.reply:null,
   tripPhotos:Array.isArray(raw.tripPhotos)?[...new Set(raw.tripPhotos.filter(id=>['lane','bridge','fields'].includes(id)))]:[],
   footballResolution:['unfinished','sheng','qiang','watch'].includes(raw.footballResolution)?raw.footballResolution:'unfinished',
   studyPlan:['a','b'].includes(raw.studyPlan)?raw.studyPlan:null,roadStop:['direct','scenic','snack'].includes(raw.roadStop)?raw.roadStop:'direct',
   endingPage:ENDING_PAGE_IDS.includes(raw.endingPage)?raw.endingPage:raw.completed===true&&raw.resumeEnding===true&&chapter===4?'still_here':null,
   readShengLetter:raw.readShengLetter===true,resumeEnding:raw.resumeEnding===true&&raw.completed===true&&chapter===4};
 }catch{return {...DEFAULT_STORY};}
}
export function rememberReply(story,id){if(!['football','trick','goal'].includes(id))throw Error('Unknown reply');return {...story,reply:story.reply??id};}
export function chapterWarning(chapter,story){return chapter>story.maxChapter&&!story.completed;}
export function movement(keys){let x=Number(keys.has('ArrowRight')||keys.has('d'))-Number(keys.has('ArrowLeft')||keys.has('a'));let y=Number(keys.has('ArrowDown')||keys.has('s'))-Number(keys.has('ArrowUp')||keys.has('w'));let len=Math.hypot(x,y)||1;return{x:x/len,y:y/len};}
export function stepBall(ball,dt,bounds){ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;const drag=Math.pow(.985,dt*60);ball.vx*=drag;ball.vy*=drag;if(ball.x<bounds.left||ball.x>bounds.right){ball.x=clamp(ball.x,bounds.left,bounds.right);ball.vx*=-.78;}if(ball.y>bounds.bottom){ball.y=bounds.bottom;ball.vy*=-.78;}return ball;}
// The study sequence is a literal, forgiving climb. A steady hand opens its upper half.
export const LADDER={bottom:540,top:120,helpY:330};
export function stepLadder(player,dt,direction,steady){const next=clamp(player.y-direction*85*dt,LADDER.top,LADDER.bottom);if(!steady&&direction>0&&next<=LADDER.helpY){player.y=LADDER.helpY;return 'help';}player.y=next;return next===LADDER.top?'top':null;}
// A crowded promenade: contact is a small shoulder bump, never a reset or lost life.
export function stepPromenade(player,state,dt,v,assist=false){state.cooldown=Math.max(0,state.cooldown-dt);for(const c of state.commuters){c.x+=c.speed*dt;c.moving=true;if(c.x>880)c.x=80;if(c.x<80)c.x=880;}player.x=clamp(player.x+v.x*145*dt,120,840);player.y=clamp(player.y+v.y*145*dt,400,550);if(!assist&&!state.cooldown&&state.commuters.some(c=>Math.abs(c.x-player.x)<26&&Math.abs(c.y-player.y)<18)){player.y=clamp(player.y+20,400,550);state.cooldown=.65;return 'bump';}return null;}
export const GOAL={left:314,right:384,y:198};

// Waypoints traced from the painted road, in map fractions (north to south).
export const ROAD_HEIGHT=1920,ROAD_START=1790,ROAD_END=230,ROAD_DISTANCE=ROAD_START-ROAD_END;
export const ROAD_POINTS=[[.10,.477],[.15,.521],[.20,.647],[.25,.689],[.30,.594],[.35,.458],[.40,.450],[.45,.539],[.50,.565],[.55,.567],[.60,.556],[.65,.463],[.70,.412],[.75,.407],[.80,.479],[.85,.567],[.90,.561],[.95,.525],[1,.529]];
export function roadCenterY(y){const f=clamp(y/ROAD_HEIGHT,.10,1);for(let i=1;i<ROAD_POINTS.length;i++){const [yb,xb]=ROAD_POINTS[i], [ya,xa]=ROAD_POINTS[i-1];if(f<=yb){const q=(f-ya)/(yb-ya);return (xa+(xb-xa)*q)*960;}}return 960*ROAD_POINTS.at(-1)[1];}
export function roadPosition(progress,lane=0){const y=ROAD_START-clamp(progress,0,ROAD_DISTANCE),camera=clamp(y-470,0,ROAD_HEIGHT-600);return{x:roadCenterY(y)+lane,y,screenY:y-camera,camera};}
export const ROAD_PHOTOS=[{id:'lane',label:'Village lane',y:ROAD_HEIGHT*.85,dx:45},{id:'bridge',label:'Canal bridge',y:ROAD_HEIGHT*.55,dx:-45},{id:'fields',label:'Rice fields',y:ROAD_HEIGHT*.25,dx:45}];
export function makeRoad(){return{progress:0,lane:0,speed:0,cruise:false,parked:false,junction:false,route:'direct',auto:false,bump:0,lastSection:-1,photos:ROAD_PHOTOS.map(p=>({...p,taken:false,x:roadCenterY(p.y)+p.dx})),baskets:[{y:1370,dx:24,hit:false},{y:795,dx:-24,hit:false}]};}
export function stepDrive(state,dt,input){if(state.parked)return{};state.bump=Math.max(0,state.bump-dt);if(input.forward)state.cruise=true;if(input.brake){state.cruise=false;state.auto=false;}if(input.forward||input.x)state.auto=false;let desired=state.cruise?(input.forward?180:130):0;if(state.auto){state.cruise=true;desired=130;const upcoming=state.photos.find(p=>!p.taken&&p.y<roadPosition(state.progress).y+40);const lane=upcoming?.dx??0;state.lane+=clamp(lane-state.lane,-dt*150,dt*150);}else state.lane=clamp(state.lane+input.x*dt*150,-48,48);if(state.bump)desired=Math.min(desired,45);state.speed+=clamp(desired-state.speed,-dt*260,dt*150);state.progress=clamp(state.progress+state.speed*dt,0,ROAD_DISTANCE);const pos=roadPosition(state.progress,state.lane),events={};for(const p of state.photos){if(!p.taken&&Math.abs(pos.x-p.x)<28&&Math.abs(pos.y-p.y)<44){p.taken=true;events.photo=p;}}for(const b of state.baskets){if(!b.hit&&Math.hypot(pos.x-(roadCenterY(b.y)+b.dx),pos.y-b.y)<36){b.hit=true;state.bump=.8;state.speed=Math.min(state.speed,45);events.bump=true;}}events.finished=state.progress>=ROAD_DISTANCE;return events;}
