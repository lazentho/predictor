(function(){
'use strict';

// Safe visual helper loaded from GitHub.
// Uses visible page data only. No cookies, no server, no auto-click.

const VERSION='2.2';
const COLS=3;
const STORE='tw_settings_v1';
const SLIDE_HIST='nx_slide_history_v2';
const SLIDE_MAX=250;
let picks=[];
let enabled=true;
let lastUrl=location.href;
let autoStarted=false;
let lastBoardState='';
let lastCleanState='';
let lastHadReveal=false;
let lastSlideKey='';
let settings=loadSettings();

function loadSettings(){try{return Object.assign({algorithm:'smart',n_safe:8},JSON.parse(localStorage.getItem(STORE)||'{}'));}catch(e){return {algorithm:'smart',n_safe:8};}}
function saveSettings(){localStorage.setItem(STORE,JSON.stringify(settings));}
function css(s){const e=document.createElement('style');e.textContent=s;document.head.appendChild(e);}

css(`
#twPanel{position:fixed;top:90px;right:20px;z-index:999999999;width:245px;background:linear-gradient(180deg,rgba(0,18,8,.98),rgba(0,8,4,.98));color:#d7ffe0;border:2px solid #39FF14;border-radius:14px;padding:14px;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 18px rgba(57,255,20,.45),inset 0 0 18px rgba(57,255,20,.08)}
#twPanel h2{margin:0 0 8px;color:#39FF14;font-size:18px;text-shadow:0 0 8px #39FF14;letter-spacing:.5px}#twPanel p{margin:6px 0;font-size:12px;color:#39FF14;text-shadow:0 0 6px #39FF14}
#twPanel button{width:100%;padding:10px;margin-top:10px;border:1px solid #39FF14;border-radius:8px;background:#39FF14;color:#001900;font-weight:bold;cursor:pointer;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 10px rgba(57,255,20,.35)}#twPanel button:hover{filter:brightness(1.1);box-shadow:0 0 18px rgba(57,255,20,.7)}
.twHL{position:fixed;z-index:999999990;pointer-events:none;border:2px solid #39FF14;border-radius:6px;box-shadow:0 0 4px #39FF14,0 0 10px #39FF14,0 0 16px rgba(57,255,20,.7),inset 0 0 5px rgba(57,255,20,.35);background:rgba(57,255,20,.08)}
.nxSlideHL{position:fixed;z-index:999999991;pointer-events:none;border:2px solid #39FF14;border-radius:8px;box-shadow:0 0 5px #39FF14,0 0 12px #39FF14,0 0 20px rgba(57,255,20,.8),inset 0 0 7px rgba(57,255,20,.35);background:rgba(57,255,20,.1)}
#twSettings{position:fixed;inset:0;z-index:1000000000;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;font-family:Consolas,'Courier New',monospace;color:#d7ffe0;backdrop-filter:blur(2px)}
#twSettingsBox{width:680px;max-width:92vw;background:linear-gradient(180deg,#001408,#020602);border:3px solid #39FF14;border-radius:28px;padding:34px 40px;box-shadow:0 0 28px rgba(57,255,20,.55),inset 0 0 28px rgba(57,255,20,.08)}
#twSettingsBox h1{margin:0 0 28px;font-size:36px;color:#39FF14;text-shadow:0 0 10px #39FF14;letter-spacing:.5px}#twSettingsBox label{display:flex;align-items:center;justify-content:space-between;margin:22px 0;font-size:18px;color:#d7ffe0}
#twSettingsBox select,#twSettingsBox input{width:140px;background:#000;color:#39FF14;border:1px solid #39FF14;border-radius:7px;padding:10px 12px;font-size:16px;outline:none;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 10px rgba(57,255,20,.25)}
#twSettingsBox option{background:#001408;color:#39FF14}#twSettingsSave{float:right;width:110px!important;background:#39FF14!important;color:#001900!important;border:1px solid #39FF14!important;border-radius:12px!important;font-size:16px!important}#twSettingsClose{float:right;width:110px!important;margin-right:10px;background:#001408!important;color:#39FF14!important;border:1px solid #39FF14!important;border-radius:12px!important;font-size:16px!important}
#nxSlideBox{margin-top:10px;padding:9px;border:1px solid rgba(57,255,20,.35);border-radius:8px;background:rgba(0,0,0,.55);font-size:12px;line-height:1.35;color:#baffc4;white-space:pre-wrap;text-shadow:0 0 4px rgba(57,255,20,.25)}
`);

function isTowers(){return location.href.includes('/towers');}
function isSlide(){return location.href.includes('/slide');}
function menuTitle(){return isTowers()?'Towers ESP':isSlide()?'Slide Math':'Horizon';}
function updateMenuTitle(){const t=document.getElementById('twTitle');if(t)t.textContent=menuTitle();}
function clamp(v,min,max){v=Number(v);if(!Number.isFinite(v))v=min;return Math.max(min,Math.min(max,Math.floor(v)));}
function clear(){document.querySelectorAll('.twHL').forEach(e=>e.remove());}
function clearSlideHighlights(){document.querySelectorAll('.nxSlideHL').forEach(e=>e.remove());}

function panel(){
 if(document.getElementById('twPanel')){updateMenuTitle();ensureSlideBox();return;}
 const p=document.createElement('div');p.id='twPanel';
 p.innerHTML=`<h2 id="twTitle">${menuTitle()}</h2><p>Version: <b>${VERSION}</b></p><button id="twSet">Settings</button>`;
 document.body.appendChild(p);
 document.getElementById('twSet').onclick=openSettings;
 ensureSlideBox();
}

function ensureSlideBox(){
 const p=document.getElementById('twPanel'); if(!p)return;
 const old=document.getElementById('nxSlideBox');
 if(!isSlide()){old?.remove();clearSlideHighlights();return;}
 if(!old){const b=document.createElement('div');b.id='nxSlideBox';b.textContent='Reading color history...';p.appendChild(b);}
}

function openSettings(){
 document.getElementById('twSettings')?.remove();
 const wrap=document.createElement('div');wrap.id='twSettings';
 wrap.innerHTML=`<div id="twSettingsBox"><h1>settings -> Towers</h1><label><span>algorithm</span><select id="twAlg"><option value="smart">smart</option><option value="knn">knn indexing</option><option value="mingle">mingle</option></select></label><label><span>safe tiles (n_safe)</span><input id="twSafe" type="number" min="1" max="8" step="1"></label><button id="twSettingsSave">save</button><button id="twSettingsClose">close</button><div style="clear:both"></div></div>`;
 document.body.appendChild(wrap);
 document.getElementById('twAlg').value=settings.algorithm;
 document.getElementById('twSafe').value=settings.n_safe;
 document.getElementById('twSettingsClose').onclick=()=>wrap.remove();
 document.getElementById('twSettingsSave').onclick=()=>{settings.algorithm=document.getElementById('twAlg').value;settings.n_safe=clamp(document.getElementById('twSafe').value,1,8);saveSettings();wrap.remove();forceNewPicks();};
 wrap.onclick=e=>{if(e.target===wrap)wrap.remove();};
}

function slideHist(){try{return JSON.parse(localStorage.getItem(SLIDE_HIST)||'[]');}catch(e){return[];}}
function saveSlideHist(h){localStorage.setItem(SLIDE_HIST,JSON.stringify(h.slice(-SLIDE_MAX)));}
function detectSlideColor(el){
 const chain=[];let n=el;
 for(let i=0;i<5&&n;i++,n=n.parentElement)chain.push(n);
 const txt=chain.map(x=>(x.className||'')+' '+(x.getAttribute?.('style')||'')+' '+(x.getAttribute?.('data-color')||'')).join(' ').toLowerCase();
 if(txt.includes('yellow'))return'yellow';
 if(txt.includes('red'))return'red';
 if(txt.includes('purple'))return'purple';
 const st=getComputedStyle(el); const bg=st.backgroundColor||'';
 const m=bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
 if(m){const r=+m[1],g=+m[2],b=+m[3];
  if(r>180&&g>110&&b<90)return'yellow';
  if(r>150&&g<110&&b<140)return'red';
  if(r>90&&b>120)return'purple';
 }
 return'unknown';
}
function slideVisibleColorItems(){
 const els=[...document.querySelectorAll('.gameLatestItem,[data-color],[class*="slideGameTrackItem"],[class*="slidePlayersColumn"],[class*="slide-module"]')];
 const items=[];
 for(const el of els){
  const r=el.getBoundingClientRect();
  if(r.width<20||r.height<14||r.top<0||r.top>window.innerHeight)continue;
  const color=detectSlideColor(el);
  if(!['yellow','red','purple'].includes(color))continue;
  const text=(el.innerText||el.textContent||'').trim();
  const multi=(text.match(/\d+(?:\.\d+)?x/i)||[''])[0];
  items.push({el,color,multi,x:Math.round(r.left),y:Math.round(r.top),w:Math.round(r.width),h:Math.round(r.height)});
 }
 items.sort((a,b)=>a.x-b.x||a.y-b.y);
 const unique=[];
 for(const it of items){if(!unique.find(u=>u.el===it.el||u.color===it.color&&Math.abs(u.x-it.x)<10&&Math.abs(u.y-it.y)<10))unique.push(it);}
 return unique;
}
function highlightSlideColor(color,items){
 clearSlideHighlights();
 if(!color||color==='none')return;
 const targets=items.filter(x=>x.color===color);
 for(const item of targets){
  const r=item.el.getBoundingClientRect();
  if(r.width<20||r.height<14||r.top<0||r.top>window.innerHeight)continue;
  const box=document.createElement('div');
  box.className='nxSlideHL';
  box.style.left=`${r.left-4}px`;
  box.style.top=`${r.top-4}px`;
  box.style.width=`${r.width+8}px`;
  box.style.height=`${r.height+8}px`;
  document.body.appendChild(box);
 }
}
function updateSlideMath(){
 if(!isSlide()){clearSlideHighlights();return;}
 ensureSlideBox();
 const box=document.getElementById('nxSlideBox'); if(!box)return;
 const seen=slideVisibleColorItems();
 if(seen.length){
  const key=seen.map(x=>`${x.color}:${x.x}:${x.y}:${x.multi}`).join('|');
  if(key!==lastSlideKey){
   lastSlideKey=key;
   const h=slideHist();
   for(const item of seen)h.push({color:item.color,multi:item.multi,time:Date.now()});
   saveSlideHist(h);
  }
 }
 const h=slideHist(); const total=h.length;
 const count=c=>h.filter(x=>x.color===c).length;
 const pct=c=>total?(count(c)/total*100):0;
 const yellow=count('yellow'),red=count('red'),purple=count('purple');
 const best=[['yellow',yellow],['red',red],['purple',purple]].sort((a,b)=>b[1]-a[1])[0]?.[0]||'none';
 highlightSlideColor(best,seen);
 box.textContent=`Color history saved: ${total}\n\nYellow: ${yellow} (${pct('yellow').toFixed(1)}%)\nRed: ${red} (${pct('red').toFixed(1)}%)\nPurple: ${purple} (${pct('purple').toFixed(1)}%)\n\nHighlighted: ${best}\n\nHistory only. Not a prediction.`;
}

function findGrid(){
 const game=document.querySelector('[class*="towersGame"]');if(!game)return[];
 let rows=[...game.querySelectorAll('[class*="towersGameRow"]')].filter(r=>{const x=r.getBoundingClientRect();return x.width>0&&x.height>0&&x.bottom>=0&&x.top<=innerHeight});
 rows.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
 const grid=[];for(const r of rows){let tiles=getTiles(r);if(tiles.length>=3){tiles=tiles.slice(0,3).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);grid.push(tiles);}}return grid;
}
function getTiles(row){
 const containers=[...row.querySelectorAll('[class*="towersGameRowContainer"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10});if(containers.length>=3)return containers;
 const buttons=[...row.querySelectorAll('[class*="towersGameButton"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10});if(buttons.length>=3)return buttons;
 const children=[...row.children].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10});if(children.length>=3)return children;
 const cand=[...row.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=20&&r.width<=180&&r.height>=15&&r.height<=90&&/\d+\.\d{2}/.test(txt)});
 const u=[];for(const e of cand){const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(!u.find(o=>{const q=o.getBoundingClientRect(),ox=q.left+q.width/2,oy=q.top+q.height/2;return Math.abs(x-ox)<8&&Math.abs(y-oy)<8}))u.push(e);}return u;
}
function targetRect(tile){
 const btn=tile.matches?.('[class*="towersGameButton"]')?tile:tile.querySelector?.('[class*="towersGameButton"]');if(btn)return btn.getBoundingClientRect();
 const all=[tile,...tile.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=35&&r.width<=95&&r.height>=18&&r.height<=45&&/\d+\.\d{2}/.test(txt)});
 const best=all.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return(ra.width*ra.height)-(rb.width*rb.height)})[0]||tile;return best.getBoundingClientRect();
}
function tileNum(tile){return((tile.innerText||tile.textContent||'').match(/\d+\.\d{2}/)||[''])[0];}
function boardState(grid){return grid.map(r=>r.map(tileNum).join(',')).join('|');}
function revealedCount(grid){let n=0;for(const row of grid){for(const tile of row){if(!tileNum(tile))n++;}}return n;}
function cleanBoardState(grid){return grid.map(r=>r.map(tileNum).join(',')).join('|');}
function chooseSmart(row,prev){let c=Math.floor(Math.random()*COLS);if(prev!==undefined&&c===prev)c=(c+1+Math.floor(Math.random()*2))%COLS;return c;}
function chooseKnn(row){const hist=JSON.parse(localStorage.getItem('tw_knn_hist')||'{}');const scores=[0,1,2].map(c=>hist[`${row}:${c}`]||0);const max=Math.max(...scores);const best=scores.map((s,i)=>s===max?i:null).filter(x=>x!==null);return best[Math.floor(Math.random()*best.length)]??Math.floor(Math.random()*COLS);}
function chooseCol(row,prev){if(settings.algorithm==='smart')return chooseSmart(row,prev);if(settings.algorithm==='knn')return chooseKnn(row);return Math.random()<.5?chooseSmart(row,prev):chooseKnn(row);}
function makePicks(rowCount){picks=[];let prev;for(let i=0;i<rowCount;i++){const c=chooseCol(i,prev);picks.push(c);prev=c;}}
function forceNewPicks(){enabled=true;autoStarted=true;const g=findGrid();if(!g.length)return;makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanBoardState(g);lastHadReveal=revealedCount(g)>0;draw();}
function draw(){clear();if(!isTowers()||!enabled)return;const g=findGrid();if(!g.length||!picks.length)return;const nSafe=clamp(settings.n_safe,1,Math.min(8,g.length));const start=Math.max(0,g.length-nSafe);for(let r=start;r<g.length;r++){const tile=g[r][picks[r]??Math.floor(Math.random()*COLS)];if(!tile)continue;const b=targetRect(tile),w=72,h=30,box=document.createElement('div');box.className='twHL';box.style.left=`${b.left+b.width/2-w/2}px`;box.style.top=`${b.top+b.height/2-h/2}px`;box.style.width=`${w}px`;box.style.height=`${h}px`;document.body.appendChild(box);}}
function autoDraw(){
 if(!isTowers())return;
 const g=findGrid();if(!g.length)return;
 const reveal=revealedCount(g);
 const cleanSig=cleanBoardState(g);
 if(!autoStarted){autoStarted=true;enabled=true;makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanSig;lastHadReveal=reveal>0;draw();return;}
 if(reveal>0){lastHadReveal=true;draw();return;}
 if(lastHadReveal&&reveal===0){makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanSig;lastHadReveal=false;draw();return;}
 if(!lastHadReveal&&lastCleanState&&cleanSig!==lastCleanState){makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanSig;draw();return;}
 draw();
}
function resetPage(){clear();clearSlideHighlights();picks=[];autoStarted=false;lastBoardState='';lastCleanState='';lastHadReveal=false;lastSlideKey='';document.getElementById('twSettings')?.remove();}
setTimeout(()=>{panel();autoDraw();updateSlideMath();},1000);
addEventListener('resize',()=>{draw();updateSlideMath();});addEventListener('scroll',()=>{draw();updateSlideMath();},true);
setInterval(()=>{if(location.href!==lastUrl){lastUrl=location.href;resetPage();setTimeout(()=>{panel();autoDraw();updateSlideMath();},700);return;}panel();autoDraw();updateSlideMath();},800);
})();