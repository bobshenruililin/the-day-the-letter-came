// Minimal DOM with real propagation semantics for controller/view regression tests.
// It keeps text, focus, controls and event routing; layout is verified separately.
export function createDOM(){
  const elements=new Map(),windowListeners=new Map(),windowHandlers=new Map(),timers=new Map();
  const clock={now:0};let nextTimer=1,doc;
  const selectorParts=selector=>selector.split(',').map(s=>s.trim());
  const canvasContext=new Proxy({measureText:text=>({width:String(text).length*8}),getImageData:()=>({data:[]})},{get:(target,key)=>key in target?target[key]:(()=>{})});
  class Element {
    constructor(tag='DIV'){
      this.tagName=tag.toUpperCase();this.children=[];this.parentNode=null;
      this.hidden=false;this.open=false;this.disabled=false;this.dataset={};
      this.attributes={};this.events=new Map();this._text='';this._classes=new Set();
      this.style={setProperty:(name,value)=>{this.style[name]=value;},removeProperty:name=>{delete this.style[name];}};
      this.classList={add:(...names)=>names.forEach(n=>this._classes.add(n)),remove:(...names)=>names.forEach(n=>this._classes.delete(n)),contains:name=>this._classes.has(name),toggle:(name,force)=>{const shown=force??!this._classes.has(name);shown?this._classes.add(name):this._classes.delete(name);return shown;}};
    }
    get className(){return [...this._classes].join(' ');}
    set className(value){this._classes=new Set(String(value).split(/\s+/).filter(Boolean));}
    get parentElement(){return this.parentNode;}
    get childNodes(){return this.children;}
    get firstElementChild(){return this.children[0]??null;}
    get textContent(){return this._text+this.children.map(c=>c.textContent??String(c)).join('');}
    set textContent(value){this._text=String(value);for(const c of this.children)c.parentNode=null;this.children=[];}
    get innerText(){return this.textContent;}
    set innerText(value){this.textContent=value;}
    get innerHTML(){return this.textContent;}
    set innerHTML(value){if(value!=='')throw Error('Test DOM requires element-based rendering; nonempty innerHTML is not parsed');this.replaceChildren();}
    append(...nodes){for(const node of nodes){if(typeof node==='string'){const text=new Element('#TEXT');text.textContent=node;this.append(text);}else{node.remove?.();node.parentNode=this;this.children.push(node);}}}
    appendChild(node){this.append(node);return node;}
    prepend(...nodes){for(const node of [...nodes].reverse()){if(typeof node==='string'){const text=new Element('#TEXT');text.textContent=node;this.prepend(text);}else{node.remove?.();node.parentNode=this;this.children.unshift(node);}}}
    replaceChildren(...nodes){this.textContent='';this.append(...nodes);}
    remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(n=>n!==this);this.parentNode=null;}}
    insertBefore(node,before){node.remove?.();node.parentNode=this;const i=this.children.indexOf(before);this.children.splice(i<0?this.children.length:i,0,node);return node;}
    contains(node){return this===node||this.children.some(c=>c.contains(node));}
    setAttribute(name,value){
      this.attributes[name]=String(value);
      if(name==='class')this.className=value;else if(name==='id')this.id=value;
      else if(name==='lang')this.lang=value;
      else if(name.startsWith('data-'))this.dataset[name.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=String(value);
    }
    getAttribute(name){if(name==='class')return this.className;if(name.startsWith('data-'))return this.dataset[name.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]??null;return this.attributes[name]??null;}
    removeAttribute(name){delete this.attributes[name];}
    toggleAttribute(name,force){const on=force??!(name in this.attributes);if(on)this.setAttribute(name,'');else this.removeAttribute(name);return on;}
    matches(selector){return selectorParts(selector).some(part=>{
      const chain=part.split(/\s+/);const own=chain.pop();
      const matchOne=(el,s)=>{
        const attr=[...s.matchAll(/\[([^\]=]+)(?:=["']?([^\]"']+)["']?)?\]/g)];
        const base=s.replace(/\[[^\]]+\]/g,'').replace(/:(?:disabled|enabled|focus)(?:\([^)]*\))?/g,'');
        const tag=base.match(/^[a-zA-Z][\w-]*/)?.[0];if(tag&&el.tagName!==tag.toUpperCase())return false;
        const id=base.match(/#([\w-]+)/)?.[1];if(id&&el.id!==id)return false;
        if([...base.matchAll(/\.([\w-]+)/g)].some(m=>!el.classList.contains(m[1])))return false;
        return attr.every(([,name,value])=>el.getAttribute(name)!==null&&(value===undefined||el.getAttribute(name)===value));
      };
      if(!matchOne(this,own))return false;let ancestor=this.parentNode;
      for(let i=chain.length-1;i>=0;i--){while(ancestor&&!matchOne(ancestor,chain[i]))ancestor=ancestor.parentNode;if(!ancestor)return false;ancestor=ancestor.parentNode;}return true;
    });}
    closest(selector){let el=this;while(el){if(el.matches(selector))return el;el=el.parentNode;}return null;}
    querySelectorAll(selector){const found=[];const visit=el=>{for(const child of el.children){if(child.matches(selector))found.push(child);visit(child);}};visit(this);return found;}
    querySelector(selector){return this.querySelectorAll(selector)[0]??null;}
    addEventListener(type,fn,options={}){if(!this.events.has(type))this.events.set(type,[]);this.events.get(type).push({fn,once:options.once});}
    removeEventListener(type,fn){this.events.set(type,(this.events.get(type)??[]).filter(x=>x.fn!==fn));}
    dispatchEvent(event){
      event.target??=this;event.bubbles??=true;event.preventDefault??=()=>{event.defaultPrevented=true;};
      event.stopPropagation??=()=>{event.cancelBubble=true;};event.stopImmediatePropagation??=()=>{event.cancelBubble=true;event.immediateStopped=true;};
      let node=this;while(node){event.currentTarget=node;const own=node[`on${event.type}`];if(own)own(event);
        if(!event.immediateStopped)for(const entry of [...(node.events.get(event.type)??[])]){entry.fn(event);if(entry.once)node.removeEventListener(event.type,entry.fn);if(event.immediateStopped)break;}
        if(!event.bubbles||event.cancelBubble)break;node=node.parentNode;}
      return !event.defaultPrevented;
    }
    click(){if(!this.disabled)this.dispatchEvent({type:'click',bubbles:true,button:0});}
    focus(){doc.activeElement=this;}
    blur(){if(doc.activeElement===this)doc.activeElement=null;}
    close(){this.open=false;}
    showModal(){this.open=true;}
    scrollIntoView(){}
    setPointerCapture(){}
    getBoundingClientRect(){return {left:0,top:0,width:960,height:600};}
    getContext(){return canvasContext;}
  }
  class ButtonElement extends Element {constructor(){super('BUTTON');}}
  const createElement=tag=>String(tag).toUpperCase()==='BUTTON'?new ButtonElement():new Element(tag);
  function el(id){if(!elements.has(id)){const node=new Element(id==='world'?'CANVAS':'DIV');node.id=id;elements.set(id,node);doc?.body.append(node);}return elements.get(id);}
  function listen(type,fn){if(!windowHandlers.has(type))windowHandlers.set(type,[]);windowHandlers.get(type).push(fn);windowListeners.set(type,event=>{for(const handler of [...windowHandlers.get(type)]){handler(event);if(event.immediateStopped)break;}});}
  function unlisten(type,fn){windowHandlers.set(type,(windowHandlers.get(type)??[]).filter(handler=>handler!==fn));}
  doc={getElementById:el,createElement,createElementNS:(_,tag)=>new Element(tag),createTextNode:text=>{const n=new Element('#TEXT');n.textContent=text;return n;},
    documentElement:new Element('HTML'),body:new Element('BODY'),hidden:false,activeElement:null,
    querySelector:selector=>doc.body.querySelector(selector),querySelectorAll:selector=>doc.body.querySelectorAll(selector),
    addEventListener:listen,removeEventListener:unlisten};
  doc.documentElement.append(doc.body);
  function runTimers(){let limit=1000;while([...timers.values()].some(timer=>timer.at<=clock.now)){if(--limit<0)throw Error('Test timer loop did not settle');const [id,timer]=[...timers].filter(([,v])=>v.at<=clock.now).sort((a,b)=>a[1].at-b[1].at)[0];timers.delete(id);timer.fn();}}
  function tick(ms){clock.now+=ms;runTimers();}
  const timer=(fn,ms=0)=>{const id=nextTimer++;timers.set(id,{at:clock.now+ms,fn});return id;};
  const globals={document:doc,performance:{now:()=>clock.now},Date:class extends Date {static now(){return clock.now;}},
    setTimeout:timer,clearTimeout:id=>timers.delete(id),requestAnimationFrame(){},Image:class {},
    getComputedStyle:()=>({objectFit:'fill'}),Element,HTMLElement:Element,HTMLButtonElement:ButtonElement,
    window:{addEventListener:listen,removeEventListener:unlisten,matchMedia:()=>({matches:false,addEventListener(){}})}};
  return {doc,el,Element,clock,tick,globals,listeners:windowListeners};
}
