(function(){
'use strict';

// Safe Towers visual helper loaded from GitHub.
// Not a real predictor: random suggestions only. No cookies, no server, no auto-click.

const VERSION='1.6';
const COLS=3;
const STORE='tw_settings_v1';
let picks=[];
let enabled=true;
let lastUrl=location.href;
let autoStarted=false;
let lastBoardState='';

let settings=loadSettings();

function loadSettings(){
 try{return Object.assign({algorithm:'smart',n_safe:8},JSON.parse(localStorage.getItem(STORE)||'{}'));}
 catch(e){return {algorithm:'smart',n_safe:8};}
}
function saveSettings(){localStorage.setItem(STORE,JSON.stringify(settings));}

function css(s){const e=document.createElement('style');e.textContent=s;document.head.appendChild(e);}
css(`
#twPanel{position:fixed;top:90px;right:20px;z-index:999999999;width:290px;background:linear-gradient(180deg,rgba(0,18,8,.98),rgba(0,8,4,.98));color:#d7ffe0;border:2px solid #39FF14;border-radius:14px;padding:14px;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 18px rgba(57,255,20,.45),inset 0 0 18px rgba(57,255,20,.08)}
#twPanel h2{margin:0 0 8px;color:#39FF14;font-size:18px;text-shadow:0 0 8px #39FF14;letter-spacing:.5px}#twPanel p{margin:6px 0;font-size:13px;line-height:1.35;color:#d7ffe0}
#twPanel button{width:100%;padding:9px;margin-top:8px;border:1px solid #39FF14;border-radius:8px;background:#39FF14;color:#001900;font-weight:bold;cursor:pointer;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 10px rgba(57,255,20,.35)}#twPanel button:hover{filter:brightness(1.1);box-shadow:0 0 18px rgba(57,255,20,.7)}
#twOut{margin-top:10px;font-size:13px;white-space:pre-wrap;color:#baffc4;background:rgba(0,0,0,.62);border:1px solid rgba(57,255,20,.35);padding:8px;border-radius:8px;max-height:200px;overflow-y:auto;text-shadow:0 0 4px rgba(57,255,20,.25)}
.twWarn{color:#ffea00;font-size:12px!important;text-shadow:0 0 5px #ffea00}.twVer{color:#39FF14!important;font-size:12px!important;text-shadow:0 0 6px #39FF14}.twHL{position:fixed;z-index:999999990;pointer-events:none;border:2px solid #39FF14;border-radius:6px;box-shadow:0 0 4px #39FF14,0 0 10px #39FF14,0 0 16px rgba(57,255,20,.7),inset 0 0 5px rgba(57,255,20,.35);background:rgba(57,255,20,.08)}
#twSettings{position:fixed;inset:0;z-index:1000000000;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;font-family:Consolas,'Courier New',monospace;color:#d7ffe0;backdrop-filter:blur(2px)}
#twSettingsBox{width:680px;max-width:92vw;background:linear-gradient(180deg,#001408,#020602);border:3px solid #39FF14;border-radius:28px;padding:34px 40px;box-shadow:0 0 28px rgba(57,255,20,.55),inset 0 0 28px rgba(57,255,20,.08)}
#twSettingsBox h1{margin:0 0 28px;font-size:36px;color:#39FF14;text-shadow:0 0 10px #39FF14;letter-spacing:.5px}#twSettingsBox label{display:flex;align-items:center;justify-content:space-between;margin:22px 0;font-size:18px;color:#d7ffe0}
#twSettingsBox select,#twSettingsBox input{width:140px;background:#000;color:#39FF14;border:1px solid #39FF14;border-radius:7px;padding:10px 12px;font-size:16px;outline:none;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 10px rgba(57,255,20,.25)}
#twSettingsBox option{background:#001408;color:#39FF14}#twSettingsSave{float:right;width:110px!important;background:#39FF14!important;color:#001900!important;border:1px solid #39FF14!important;border-radius:12px!important;font-size:16px!important}#twSettingsClose{float:right;width:110px!important;margin-right:10px;background:#001408!important;color:#39FF14!important;border:1px solid #39FF14!important;border-radius:12px!important;font-size:16px!important}
`);

function isTowers(){return location.href.includes('/towers');}
function clamp(v,min,max){v=Number(v);if(!Number.isFinite(v))v=min;return Math.max(min,Math.min(max,Math.floor(v)));}

function out(msg=''){
 const o=document.getElementById('twOut'); if(!o)return;
 const g=findGrid();
 let t=`Version: ${VERSION}\nAlgorithm: ${settings.algorithm}\nSafe tiles: ${settings.n_safe}\nFound rows: ${g.length}\nFound tiles: ${g.reduce((a,r)=>a+r.length,0)}\n`;
 if(picks.length){const n=['Left','Middle','Right'];t+='\nPicks:\n';picks.forEach((p,i)=>t+=`Row ${i+1}: ${n[p]}\n`);}else t+='\nNo picks generated yet.\n';
 t+='\nRandom suggestions only.'; if(msg)t+=`\n\n${msg}`; o.textContent=t;
}

function panel(){
 if(!isTowers()||document.getElementById('twPanel'))return;
 const p=document.createElement('div'); p.id='twPanel';
 p.innerHTML=`<h2>Towers ESP</h2><p class="twVer">Version: <b>${VERSION}</b></p><p><b>1 bomb / 2 safe</b></p><p>Safe chance per tile: <b>66.67%</b></p><button id="twGen">Generate ESP</button><button id="twRedraw">Redraw ESP</button><button id="twSet">Settings</button><button id="twClear">Clear ESP</button><div id="twOut">Waiting...</div><p class="twWarn">Not a real predictor.</p>`;
 document.body.appendChild(p);
 document.getElementById('twGen').onclick=forceNewPicks;
 document.getElementById('twRedraw').onclick=draw;
 document.getElementById('twSet').onclick=openSettings;
 document.getElementById('twClear').onclick=()=>{enabled=false;autoStarted=false;picks=[];clear();out('ESP cleared.')};
 out();
}

function openSettings(){
 document.getElementById('twSettings')?.remove();
 const wrap=document.createElement('div');wrap.id='twSettings';
 wrap.innerHTML=`<div id="twSettingsBox"><h1>settings -> Towers</h1><label><span>algorithm</span><select id="twAlg"><option value="smart">smart</option><option value="knn">knn indexing</option><option value="mingle">mingle</option></select></label><label><span>safe tiles (n_safe)</span><input id="twSafe" type="number" min="1" max="8" step="1"></label><button id="twSettingsSave">save</button><button id="twSettingsClose">close</button><div style="clear:both"></div></div>`;
 document.body.appendChild(wrap);
 document.getElementById('twAlg').value=settings.algorithm;
 document.getElementById('twSafe').value=settings.n_safe;
 document.getElementById('twSettingsClose').onclick=()=>wrap.remove();
 document.getElementById('twSettingsSave').onclick=()=>{
  settings.algorithm=document.getElementById('twAlg').value;
  settings.n_safe=clamp(document.getElementById('twSafe').value,1,8);
  saveSettings();wrap.remove();forceNewPicks();
 };
 wrap.onclick=e=>{if(e.target===wrap)wrap.remove();};
}

function clear(){document.querySelectorAll('.twHL').forEach(e=>e.remove());}

function findGrid(){
 const game=document.querySelector('[class*="towersGame"]'); if(!game)return[];
 let rows=[...game.querySelectorAll('[class*="towersGameRow"]')].filter(r=>{const x=r.getBoundingClientRect();return x.width>0&&x.height>0&&x.bottom>=0&&x.top<=innerHeight});
 rows.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);
 const grid=[];
 for(const r of rows){let tiles=getTiles(r); if(tiles.length>=3){tiles=tiles.slice(0,3).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);grid.push(tiles);}}
 return grid;
}
function getTiles(row){
 const containers=[...row.querySelectorAll('[class*="towersGameRowContainer"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10}); if(containers.length>=3)return containers;
 const buttons=[...row.querySelectorAll('[class*="towersGameButton"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10}); if(buttons.length>=3)return buttons;
 const children=[...row.children].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10}); if(children.length>=3)return children;
 const cand=[...row.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=20&&r.width<=180&&r.height>=15&&r.height<=90&&/\d+\.\d{2}/.test(txt)});
 const u=[]; for(const e of cand){const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(!u.find(o=>{const q=o.getBoundingClientRect(),ox=q.left+q.width/2,oy=q.top+q.height/2;return Math.abs(x-ox)<8&&Math.abs(y-oy)<8}))u.push(e);} return u;
}
function targetRect(tile){
 const btn=tile.matches?.('[class*="towersGameButton"]')?tile:tile.querySelector?.('[class*="towersGameButton"]');
 if(btn)return btn.getBoundingClientRect();
 const all=[tile,...tile.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=35&&r.width<=95&&r.height>=18&&r.height<=45&&/\d+\.\d{2}/.test(txt)});
 const best=all.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return (ra.width*ra.height)-(rb.width*rb.height)})[0]||tile;
 return best.getBoundingClientRect();
}
function tileNum(tile){return ((tile.innerText||tile.textContent||'').match(/\d+\.\d{2}/)||[''])[0];}
function boardState(grid){return grid.map(r=>r.map(tileNum).join(',')).join('|');}

function chooseCol(row,prev){
 if(settings.algorithm==='smart'){
  let c=Math.floor(Math.random()*COLS);
  if(prev!==undefined&&c===prev)c=(c+1+Math.floor(Math.random()*2))%COLS;
  return c;
 }
 if(settings.algorithm==='knn'){
  const hist=JSON.parse(localStorage.getItem('tw_knn_hist')||'{}');
  const scores=[0,1,2].map(c=>hist[`${row}:${c}`]||0);
  const max=Math.max(...scores); const best=scores.map((s,i)=>s===max?i:null).filter(x=>x!==null);
  return best[Math.floor(Math.random()*best.length)]??Math.floor(Math.random()*COLS);
 }
 // mingle = smart + knn + random mix
 return Math.random()<.5?chooseSmart(row,prev):chooseKnn(row);
}
function chooseSmart(row,prev){let c=Math.floor(Math.random()*COLS);if(prev!==undefined&&c===prev)c=(c+1+Math.floor(Math.random()*2))%COLS;return c;}
function chooseKnn(row){const hist=JSON.parse(localStorage.getItem('tw_knn_hist')||'{}');const scores=[0,1,2].map(c=>hist[`${row}:${c}`]||0);const max=Math.max(...scores);const best=scores.map((s,i)=>s===max?i:null).filter(x=>x!==null);return best[Math.floor(Math.random()*best.length)]??Math.floor(Math.random()*COLS);}
function makePicks(rowCount){picks=[];let prev;for(let i=0;i<rowCount;i++){const c=chooseCol(i,prev);picks.push(c);prev=c;}}

function forceNewPicks(){
 enabled=true;autoStarted=true;
 const g=findGrid(); if(!g.length){out('Could not find Towers grid. Make sure the board is visible.');return;}
 makePicks(g.length); lastBoardState=boardState(g); out('New ESP generated.'); draw();
}
function gen(){forceNewPicks();}

function draw(){
 clear(); if(!isTowers()||!enabled)return;
 const g=findGrid(); if(!g.length){out('Could not find grid when drawing.');return;} if(!picks.length){out('Waiting for auto ESP...');return;}
 const nSafe=clamp(settings.n_safe,1,Math.min(8,g.length));
 const start=Math.max(0,g.length-nSafe);
 for(let r=start;r<g.length;r++){
  const tile=g[r][picks[r]??Math.floor(Math.random()*COLS)]; if(!tile)continue;
  const b=targetRect(tile),w=72,h=30,box=document.createElement('div');
  box.className='twHL'; box.style.left=`${b.left+b.width/2-w/2}px`; box.style.top=`${b.top+b.height/2-h/2}px`; box.style.width=`${w}px`; box.style.height=`${h}px`; document.body.appendChild(box);
 }
 out();
}

function autoDraw(){
 if(!isTowers())return;
 const g=findGrid(); if(!g.length)return;
 const sig=boardState(g);
 if(!autoStarted){autoStarted=true;enabled=true;makePicks(g.length);lastBoardState=sig;draw();return;}
 if(sig!==lastBoardState&&sig.split('|').length===lastBoardState.split('|').length){makePicks(g.length);lastBoardState=sig;draw();out('New/changed game detected. ESP regenerated.');return;}
}
function reset(){clear();picks=[];autoStarted=false;lastBoardState='';document.getElementById('twPanel')?.remove();document.getElementById('twSettings')?.remove();}
setTimeout(()=>{panel();autoDraw();},1000);
addEventListener('resize',draw);addEventListener('scroll',draw,true);
setInterval(()=>{if(location.href!==lastUrl){lastUrl=location.href;reset();setTimeout(()=>{panel();autoDraw();},700);return;}if(isTowers()&&!document.getElementById('twPanel'))panel();autoDraw();if(isTowers()&&picks.length&&enabled)draw();},800);
})();