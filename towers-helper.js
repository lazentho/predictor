(function(){
'use strict';

// Horizon visual helper loaded from GitHub.
// Uses visible page data only. No cookies, no server, no auto-click.

const VERSION='2.4';
const COLS=3;
const STORE='tw_settings_v1';
const SLIDE_HIST='nx_slide_history_v3';
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

function loadSettings(){try{return Object.assign({algorithm:'smart',n_safe:8,mines_clicks:3,mines_auto:true},JSON.parse(localStorage.getItem(STORE)||'{}'));}catch(e){return {algorithm:'smart',n_safe:8,mines_clicks:3,mines_auto:true};}}
function saveSettings(){localStorage.setItem(STORE,JSON.stringify(settings));}
function css(s){const e=document.createElement('style');e.textContent=s;document.head.appendChild(e);}

css(`
  #twPanel {position:fixed;top:90px;right:20px;z-index:999999999;width:240px;background:linear-gradient(160deg,rgba(0,16,6,.97) 0%,rgba(0,6,2,.99) 100%);color:#c8ffda;border:1.5px solid rgba(57,255,20,.7);border-radius:12px;padding:16px 18px 14px;font-family:Consolas,'Courier New',monospace;box-shadow:0 0 22px rgba(57,255,20,.3),0 2px 40px rgba(0,0,0,.7),inset 0 0 20px rgba(57,255,20,.04)}
  #twPanelHeader {display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(57,255,20,.2)}
  #twTitle {margin:0;font-size:16px;font-weight:700;color:#39FF14;text-shadow:0 0 8px rgba(57,255,20,.8);letter-spacing:1px;text-transform:uppercase}
  #twVersion {font-size:10px;color:rgba(57,255,20,.45);letter-spacing:.5px}
  #twPanel button {width:100%;padding:9px;margin-top:7px;border:1px solid rgba(57,255,20,.6);border-radius:7px;background:rgba(57,255,20,.08);color:#39FF14;font-weight:600;font-size:12px;cursor:pointer;font-family:Consolas,'Courier New',monospace;letter-spacing:.5px;transition:background .15s,box-shadow .15s}
  #twPanel button:hover {background:rgba(57,255,20,.18);box-shadow:0 0 12px rgba(57,255,20,.35)}
  .twHL,.nxSlideHL {position:fixed;z-index:999999990;pointer-events:none;border:2px solid #39FF14;border-radius:8px;box-shadow:0 0 5px #39FF14,0 0 12px #39FF14,0 0 22px rgba(57,255,20,.8),inset 0 0 8px rgba(57,255,20,.35);background:rgba(57,255,20,.1)}
  #twSettings {position:fixed;inset:0;z-index:1000000000;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;font-family:Consolas,'Courier New',monospace;color:#c8ffda;backdrop-filter:blur(3px)}
  #twSettingsBox {width:520px;max-width:92vw;background:linear-gradient(160deg,#001208,#020702);border:1.5px solid rgba(57,255,20,.65);border-radius:14px;padding:28px 32px 24px;box-shadow:0 0 32px rgba(57,255,20,.35),0 4px 60px rgba(0,0,0,.8)}
  #twSettingsBox h1 {margin:0 0 6px;font-size:20px;color:#39FF14;text-shadow:0 0 10px rgba(57,255,20,.8);letter-spacing:1px;text-transform:uppercase}
  #twSettingsSubtitle {font-size:11px;color:rgba(57,255,20,.4);margin:0 0 22px;letter-spacing:.5px}
  #twSettingsDivider {border:none;border-top:1px solid rgba(57,255,20,.15);margin:18px 0}
  #twSettingsBox label {display:flex;align-items:center;justify-content:space-between;margin:16px 0;font-size:13px;color:#c8ffda}
  #twSettingsBox select,#twSettingsBox input {width:130px;background:rgba(0,0,0,.6);color:#39FF14;border:1px solid rgba(57,255,20,.45);border-radius:6px;padding:8px 10px;font-size:13px;outline:none;font-family:Consolas,'Courier New',monospace}
  #twSettingsBox option {background:#001208;color:#39FF14}
  #twSettingsButtons {display:flex;gap:10px;margin-top:22px}
  #twSettingsSave {flex:1;padding:10px;background:rgba(57,255,20,.12);color:#39FF14;border:1px solid rgba(57,255,20,.6);border-radius:7px;font-size:13px;font-weight:600;cursor:pointer;font-family:Consolas,'Courier New',monospace;transition:background .15s}
  #twSettingsSave:hover {background:rgba(57,255,20,.22)}
  #twSettingsClose {flex:1;padding:10px;background:transparent;color:rgba(57,255,20,.5);border:1px solid rgba(57,255,20,.25);border-radius:7px;font-size:13px;cursor:pointer;font-family:Consolas,'Courier New',monospace;transition:background .15s}
  #twSettingsClose:hover {background:rgba(57,255,20,.06);color:#39FF14}
  #nxSlideBox,#nxMinesBox {margin-top:12px;padding:10px 12px;border:1px solid rgba(57,255,20,.25);border-radius:8px;background:rgba(0,0,0,.4);font-size:11px;line-height:1.6;color:rgba(57,255,20,.75);white-space:pre-wrap}
`);

function isTowers(){return location.href.includes('/towers');}
function isSlide(){return location.href.includes('/slide');}
function isMines(){return location.href.includes('/mines');}
function menuTitle(){return isTowers()?'Towers ESP':isSlide()?'Slide Math':isMines()?'Mines Math':'Horizon';}
function updateMenuTitle(){const t=document.getElementById('twTitle');if(t)t.textContent=menuTitle();const v=document.getElementById('twVersion');if(v)v.textContent='v'+VERSION;}
function clamp(v,min,max){v=Number(v);if(!Number.isFinite(v))v=min;return Math.max(min,Math.min(max,Math.floor(v)));}
function clear(){document.querySelectorAll('.twHL').forEach(e=>e.remove());}
function clearSlideHighlights(){document.querySelectorAll('.nxSlideHL').forEach(e=>e.remove());}

function panel(){
  if(document.getElementById('twPanel')){updateMenuTitle();ensureModeBoxes();return;}
  const p=document.createElement('div');p.id='twPanel';
  p.innerHTML=`<div id="twPanelHeader"><h2 id="twTitle">${menuTitle()}</h2><span id="twVersion">v${VERSION}</span></div><button id="twSet">Settings</button>`;
  document.body.appendChild(p);
  document.getElementById('twSet').onclick=openSettings;
  ensureModeBoxes();
}

function ensureModeBoxes(){
  const p=document.getElementById('twPanel'); if(!p)return;
  const slide=document.getElementById('nxSlideBox');
  const mines=document.getElementById('nxMinesBox');
  if(!isSlide()){slide?.remove();clearSlideHighlights();}
  if(!isMines()){mines?.remove();}
  if(isSlide()&&!slide){const b=document.createElement('div');b.id='nxSlideBox';b.textContent='Reading color history...';p.appendChild(b);}
  if(isMines()&&!mines){const b=document.createElement('div');b.id='nxMinesBox';b.textContent='Reading mines board...';p.appendChild(b);}
}

function openSettings(){
  document.getElementById('twSettings')?.remove();
  const wrap=document.createElement('div');wrap.id='twSettings';
  wrap.innerHTML=`
    <div id="twSettingsBox">
      <h1>Settings</h1>
      <p id="twSettingsSubtitle">Horizon configuration</p>
      <hr id="twSettingsDivider">
      <label><span>Towers algorithm</span><select id="twAlg"><option value="smart">smart</option><option value="knn">knn indexing</option><option value="mingle">mingle</option></select></label>
      <label><span>Towers safe tiles</span><input id="twSafe" type="number" min="1" max="8" step="1"></label>
      <label><span>Mines planned clicks</span><input id="mineClicks" type="number" min="1" max="99" step="1"></label>
      <label><span>Mines auto update</span><select id="mineAuto"><option value="true">on</option><option value="false">off</option></select></label>
      <div id="twSettingsButtons"><button id="twSettingsSave">Save</button><button id="twSettingsClose">Close</button></div>
    </div>`;
  document.body.appendChild(wrap);
  document.getElementById('twAlg').value=settings.algorithm;
  document.getElementById('twSafe').value=settings.n_safe;
  document.getElementById('mineClicks').value=settings.mines_clicks;
  document.getElementById('mineAuto').value=String(settings.mines_auto);
  document.getElementById('twSettingsClose').onclick=()=>wrap.remove();
  document.getElementById('twSettingsSave').onclick=()=>{
    settings.algorithm=document.getElementById('twAlg').value;
    settings.n_safe=clamp(document.getElementById('twSafe').value,1,8);
    settings.mines_clicks=clamp(document.getElementById('mineClicks').value,1,99);
    settings.mines_auto=document.getElementById('mineAuto').value==='true';
    saveSettings();wrap.remove();forceNewPicks();updateMinesMath();
  };
  wrap.onclick=e=>{if(e.target===wrap)wrap.remove();};
}

function slideHist(){try{return JSON.parse(localStorage.getItem(SLIDE_HIST)||'[]');}catch(e){return[];}}
function saveSlideHist(h){localStorage.setItem(SLIDE_HIST,JSON.stringify(h.slice(-SLIDE_MAX)));}
function detectSlideColor(el){const chain=[];let n=el;for(let i=0;i<5&&n;i++,n=n.parentElement)chain.push(n);const txt=chain.map(x=>(x.className||'')+' '+(x.getAttribute?.('style')||'')+' '+(x.getAttribute?.('data-color')||'')).join(' ').toLowerCase();if(txt.includes('yellow'))return'yellow';if(txt.includes('red'))return'red';if(txt.includes('purple'))return'purple';return'unknown';}
function slideLatestItems(){const els=[...document.querySelectorAll('.gameLatestItem')];const items=[];for(const el of els){const r=el.getBoundingClientRect();if(r.width<15||r.height<10||r.top<0||r.top>180)continue;const color=detectSlideColor(el);if(['yellow','red','purple'].includes(color))items.push({el,color,x:Math.round(r.left),y:Math.round(r.top)});}return items.sort((a,b)=>a.x-b.x);}
function slideBetTargets(){const cols=[...document.querySelectorAll('[class*="slidePlayersColumn"]')];const items=[];for(const col of cols){const cr=col.getBoundingClientRect();if(cr.width<120||cr.height<45||cr.top<250||cr.top>window.innerHeight)continue;const color=detectSlideColor(col);if(!['yellow','red','purple'].includes(color))continue;const target=col.querySelector('[class*="slidePlayersColumnBet"] button')||col.querySelector('[class*="slidePlayersColumnBet"]')||col.querySelector('button');if(!target)continue;const r=target.getBoundingClientRect();if(r.width<60||r.height<20)continue;items.push({el:target,color,x:Math.round(r.left),y:Math.round(r.top)});}return items.sort((a,b)=>a.x-b.x);}
function highlightSlideColor(color){clearSlideHighlights();if(!isSlide()||!color||color==='none')return;const targets=slideBetTargets().filter(x=>x.color===color);for(const item of targets){const r=item.el.getBoundingClientRect();const box=document.createElement('div');box.className='nxSlideHL';box.style.left=`${r.left-6}px`;box.style.top=`${r.top-6}px`;box.style.width=`${r.width+12}px`;box.style.height=`${r.height+12}px`;document.body.appendChild(box);}}
function updateSlideMath(){if(!isSlide()){clearSlideHighlights();return;}ensureModeBoxes();const box=document.getElementById('nxSlideBox');if(!box)return;const seen=slideLatestItems();if(seen.length){const key=seen.map(x=>`${x.color}:${x.x}:${x.y}`).join('|');if(key!==lastSlideKey){lastSlideKey=key;const h=slideHist();for(const item of seen)h.push({color:item.color,time:Date.now()});saveSlideHist(h);}}const h=slideHist();const total=h.length;const count=c=>h.filter(x=>x.color===c).length;const pct=c=>total?(count(c)/total*100):0;const yellow=count('yellow'),red=count('red'),purple=count('purple');const best=[['yellow',yellow],['red',red],['purple',purple]].sort((a,b)=>b[1]-a[1])[0]?.[0]||'none';highlightSlideColor(best);box.textContent=`Saved: ${total} rounds\n\nYellow  ${yellow}  (${pct('yellow').toFixed(1)}%)\nRed     ${red}  (${pct('red').toFixed(1)}%)\nPurple  ${purple}  (${pct('purple').toFixed(1)}%)\n\nHighlighting button: ${best}\n\n— history only, not a prediction —`;}

function minesBoard(){const container=document.querySelector('[class*="minesGameContainer"]');return{container,tiles:container?[...container.querySelectorAll('[class*="minesGameItem"]')]:[]};}
function getMineCount(){const groups=[...document.querySelectorAll('.customInput,.gameBetInput')];for(const group of groups){if(/\bMines\b/i.test(group.innerText||'')){const input=group.querySelector('input');const value=parseInt(input?.value,10);if(Number.isFinite(value))return value;}}return 3;}
function isClosedMineTile(tile){const label=tile.getAttribute('aria-label')||'';return /^Open mine/i.test(label)&&!tile.disabled;}
function minesStats(){const board=minesBoard();const totalTiles=board.tiles.length;const mines=clamp(getMineCount(),1,Math.max(1,totalTiles-1));const closedTiles=board.tiles.filter(isClosedMineTile).length;const openedTiles=Math.max(0,totalTiles-closedTiles);const tilesLeft=Math.max(1,totalTiles-openedTiles);const safeTilesTotal=totalTiles-mines;const safeTilesLeft=Math.max(0,safeTilesTotal-openedTiles);const plannedClicks=clamp(settings.mines_clicks,1,Math.max(1,tilesLeft));const nextSafeChance=totalTiles?(safeTilesLeft/tilesLeft)*100:0;const nextBombChance=totalTiles?(mines/tilesLeft)*100:0;let surviveChance=1;for(let i=0;i<plannedClicks;i++){const safe=safeTilesLeft-i;const total=tilesLeft-i;if(safe<=0||total<=0){surviveChance=0;break;}surviveChance*=safe/total;}return{board,totalTiles,mines,closedTiles,openedTiles,tilesLeft,safeTilesLeft,plannedClicks,nextSafeChance,nextBombChance,surviveChance:surviveChance*100};}
function updateMinesMath(){if(!isMines())return;ensureModeBoxes();const box=document.getElementById('nxMinesBox');if(!box)return;const s=minesStats();if(!s.board.tiles.length){box.textContent='Could not find Mines board.';return;}const root=Math.sqrt(s.totalTiles);const grid=Number.isInteger(root)?`${root}x${root}`:`${s.totalTiles} tiles`;box.textContent=`Grid: ${grid}\nTiles: ${s.totalTiles}\nMines: ${s.mines}\nOpened: ${s.openedTiles}\nTiles left: ${s.tilesLeft}\nSafe left: ${s.safeTilesLeft}\n\nNext safe: ${s.nextSafeChance.toFixed(2)}%\nNext bomb: ${s.nextBombChance.toFixed(2)}%\n\nPlanned clicks: ${s.plannedClicks}\nChance to survive: ${s.surviveChance.toFixed(2)}%\n\nMath only. Not a predictor.`;}

function findGrid(){const game=document.querySelector('[class*="towersGame"]');if(!game)return[];let rows=[...game.querySelectorAll('[class*="towersGameRow"]')].filter(r=>{const x=r.getBoundingClientRect();return x.width>0&&x.height>0&&x.bottom>=0&&x.top<=innerHeight});rows.sort((a,b)=>a.getBoundingClientRect().top-b.getBoundingClientRect().top);const grid=[];for(const r of rows){let tiles=getTiles(r);if(tiles.length>=3){tiles=tiles.slice(0,3).sort((a,b)=>a.getBoundingClientRect().left-b.getBoundingClientRect().left);grid.push(tiles);}}return grid;}
function getTiles(row){const containers=[...row.querySelectorAll('[class*="towersGameRowContainer"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10});if(containers.length>=3)return containers;const buttons=[...row.querySelectorAll('[class*="towersGameButton"]')].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10});if(buttons.length>=3)return buttons;const children=[...row.children].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10});if(children.length>=3)return children;const cand=[...row.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=20&&r.width<=180&&r.height>=15&&r.height<=90&&/\d+\.\d{2}/.test(txt)});const u=[];for(const e of cand){const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(!u.find(o=>{const q=o.getBoundingClientRect(),ox=q.left+q.width/2,oy=q.top+q.height/2;return Math.abs(x-ox)<8&&Math.abs(y-oy)<8}))u.push(e);}return u;}
function targetRect(tile){const btn=tile.matches?.('[class*="towersGameButton"]')?tile:tile.querySelector?.('[class*="towersGameButton"]');if(btn)return btn.getBoundingClientRect();const all=[tile,...tile.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=35&&r.width<=95&&r.height>=18&&r.height<=45&&/\d+\.\d{2}/.test(txt)});const best=all.sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return(ra.width*ra.height)-(rb.width*rb.height)})[0]||tile;return best.getBoundingClientRect();}
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
function autoDraw(){if(!isTowers())return;const g=findGrid();if(!g.length)return;const reveal=revealedCount(g);const cleanSig=cleanBoardState(g);if(!autoStarted){autoStarted=true;enabled=true;makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanSig;lastHadReveal=reveal>0;draw();return;}if(reveal>0){lastHadReveal=true;draw();return;}if(lastHadReveal&&reveal===0){makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanSig;lastHadReveal=false;draw();return;}if(!lastHadReveal&&lastCleanState&&cleanSig!==lastCleanState){makePicks(g.length);lastBoardState=boardState(g);lastCleanState=cleanSig;draw();return;}draw();}
function resetPage(){clear();clearSlideHighlights();picks=[];autoStarted=false;lastBoardState='';lastCleanState='';lastHadReveal=false;lastSlideKey='';document.getElementById('twSettings')?.remove();}
setTimeout(()=>{panel();autoDraw();updateSlideMath();updateMinesMath();},1000);
addEventListener('resize',()=>{draw();updateSlideMath();updateMinesMath();});
addEventListener('scroll',()=>{draw();updateSlideMath();updateMinesMath();},true);
setInterval(()=>{if(location.href!==lastUrl){lastUrl=location.href;resetPage();setTimeout(()=>{panel();autoDraw();updateSlideMath();updateMinesMath();},700);return;}panel();autoDraw();updateSlideMath();if(settings.mines_auto)updateMinesMath();},800);
})();