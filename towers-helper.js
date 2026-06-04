(function(){
'use strict';

// Safe Towers visual helper loaded from GitHub.
// Not a real predictor: random suggestions only. No cookies, no server, no auto-click.

const COLS=3;
let picks=[];
let enabled=true;
let lastUrl=location.href;

function css(s){const e=document.createElement('style');e.textContent=s;document.head.appendChild(e);}
css(`
#twPanel{position:fixed;top:90px;right:20px;z-index:999999999;width:290px;background:rgba(5,8,20,.97);color:white;border:2px solid #39FF14;border-radius:14px;padding:14px;font-family:Arial,sans-serif;box-shadow:0 0 22px rgba(0,0,0,.65)}
#twPanel h2{margin:0 0 8px;color:#39FF14;font-size:18px}#twPanel p{margin:6px 0;font-size:13px;line-height:1.35}
#twPanel button{width:100%;padding:9px;margin-top:8px;border:0;border-radius:8px;background:#39FF14;color:#000;font-weight:bold;cursor:pointer}#twPanel button:hover{filter:brightness(1.1)}
#twOut{margin-top:10px;font-size:13px;white-space:pre-wrap;color:#ddd;background:rgba(0,0,0,.35);padding:8px;border-radius:8px;max-height:200px;overflow-y:auto}
.twWarn{color:#ffcc00;font-size:12px!important}.twHL{position:fixed;z-index:999999990;pointer-events:none;border:2px solid #39FF14;border-radius:7px;box-shadow:0 0 6px #39FF14,0 0 13px #39FF14,0 0 22px rgba(57,255,20,.7),inset 0 0 7px rgba(57,255,20,.35);background:rgba(57,255,20,.11)}
`);

function isTowers(){return location.href.includes('/towers');}
function out(msg=''){
 const o=document.getElementById('twOut'); if(!o)return;
 const g=findGrid(); let t=`Found rows: ${g.length}\nFound tiles: ${g.reduce((a,r)=>a+r.length,0)}\n`;
 if(picks.length){const n=['Left','Middle','Right'];t+='\nPicks:\n';picks.forEach((p,i)=>t+=`Row ${i+1}: ${n[p]}\n`);}else t+='\nNo picks generated yet.\n';
 t+='\nRandom suggestions only.'; if(msg)t+=`\n\n${msg}`; o.textContent=t;
}
function panel(){
 if(!isTowers()||document.getElementById('twPanel'))return;
 const p=document.createElement('div'); p.id='twPanel'; p.innerHTML=`<h2>Towers ESP</h2><p><b>1 bomb / 2 safe</b></p><p>Safe chance per tile: <b>66.67%</b></p><button id="twGen">Generate ESP</button><button id="twRedraw">Redraw ESP</button><button id="twClear">Clear ESP</button><div id="twOut">Waiting...</div><p class="twWarn">Not a real predictor.</p>`;
 document.body.appendChild(p);
 document.getElementById('twGen').onclick=gen;
 document.getElementById('twRedraw').onclick=draw;
 document.getElementById('twClear').onclick=()=>{enabled=false;clear();out('ESP cleared.')};
 out();
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
 const children=[...row.children].filter(e=>{const r=e.getBoundingClientRect();return r.width>10&&r.height>10}); if(children.length>=3)return children;
 const cand=[...row.querySelectorAll('button,div,span')].filter(e=>{const r=e.getBoundingClientRect(),txt=(e.innerText||e.textContent||'').trim();return r.width>=20&&r.width<=180&&r.height>=15&&r.height<=90&&/\d+\.\d{2}/.test(txt)});
 const u=[]; for(const e of cand){const r=e.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;if(!u.find(o=>{const q=o.getBoundingClientRect(),ox=q.left+q.width/2,oy=q.top+q.height/2;return Math.abs(x-ox)<8&&Math.abs(y-oy)<8}))u.push(e);} return u;
}
function gen(){enabled=true;picks=[];const g=findGrid();if(!g.length){out('Could not find Towers grid. Make sure the board is visible.');return;}for(let i=0;i<g.length;i++)picks.push(Math.floor(Math.random()*COLS));out();draw();}
function draw(){clear(); if(!isTowers()||!enabled)return; const g=findGrid(); if(!g.length){out('Could not find grid when drawing.');return;} if(!picks.length){out('Click Generate ESP first.');return;}
 for(let r=0;r<g.length;r++){const tile=g[r][picks[r]??Math.floor(Math.random()*COLS)]; if(!tile)continue; const b=tile.getBoundingClientRect(),w=Math.min(76,Math.max(50,b.width*.55)),h=Math.min(30,Math.max(24,b.height*.45)),box=document.createElement('div'); box.className='twHL'; box.style.left=`${b.left+b.width/2-w/2}px`; box.style.top=`${b.top+b.height/2-h/2}px`; box.style.width=`${w}px`; box.style.height=`${h}px`; document.body.appendChild(box);} out();
}
function reset(){clear();picks=[];document.getElementById('twPanel')?.remove();}
setTimeout(panel,1000); addEventListener('resize',draw); addEventListener('scroll',draw,true);
setInterval(()=>{if(location.href!==lastUrl){lastUrl=location.href;reset();setTimeout(panel,700);return;}if(isTowers()&&!document.getElementById('twPanel'))panel();if(isTowers()&&picks.length&&enabled)draw();},800);
})();