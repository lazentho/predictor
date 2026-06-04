// ==UserScript==
// @name         Horizon Mines Math
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Mines odds/math helper using visible page data only
// @author       lazentho
// @match        https://bloxflip.com/*
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const VERSION = '2.4';
  const STORE = 'horizon_mines_math_settings_v24';
  let settings = loadSettings();

  function loadSettings() {
    try {
      return Object.assign({ plannedClicks: 3, autoUpdate: true }, JSON.parse(localStorage.getItem(STORE) || '{}'));
    } catch {
      return { plannedClicks: 3, autoUpdate: true };
    }
  }

  function saveSettings() {
    localStorage.setItem(STORE, JSON.stringify(settings));
  }

  function isMines() {
    return location.pathname.includes('/mines');
  }

  function clamp(v, min, max) {
    v = Number(v);
    if (!Number.isFinite(v)) v = min;
    return Math.max(min, Math.min(max, Math.floor(v)));
  }

  function addCSS() {
    if (document.getElementById('hzMinesCSS')) return;
    const style = document.createElement('style');
    style.id = 'hzMinesCSS';
    style.textContent = `
      #hzMinesPanel {
        position: fixed;
        top: 90px;
        right: 20px;
        z-index: 999999999;
        width: 250px;
        background: linear-gradient(160deg, rgba(0,16,6,.97), rgba(0,6,2,.99));
        color: #c8ffda;
        border: 1.5px solid rgba(57,255,20,.7);
        border-radius: 12px;
        padding: 16px 18px 14px;
        font-family: Consolas, 'Courier New', monospace;
        box-shadow: 0 0 22px rgba(57,255,20,.3), 0 2px 40px rgba(0,0,0,.7), inset 0 0 20px rgba(57,255,20,.04);
      }
      #hzMinesHeader { display:flex;align-items:center;justify-content:space-between;padding-bottom:10px;margin-bottom:10px;border-bottom:1px solid rgba(57,255,20,.2); }
      #hzMinesTitle { margin:0;font-size:16px;font-weight:700;color:#39FF14;text-shadow:0 0 8px rgba(57,255,20,.8);letter-spacing:1px;text-transform:uppercase; }
      #hzMinesVersion { font-size:10px;color:rgba(57,255,20,.45); }
      #hzMinesPanel button { width:100%;padding:9px;margin-top:7px;border:1px solid rgba(57,255,20,.6);border-radius:7px;background:rgba(57,255,20,.08);color:#39FF14;font-weight:600;font-size:12px;cursor:pointer;font-family:Consolas,'Courier New',monospace; }
      #hzMinesPanel button:hover { background:rgba(57,255,20,.18);box-shadow:0 0 12px rgba(57,255,20,.35); }
      #hzMinesStats { margin-top:12px;padding:10px 12px;border:1px solid rgba(57,255,20,.25);border-radius:8px;background:rgba(0,0,0,.4);font-size:11px;line-height:1.55;color:rgba(57,255,20,.78);white-space:pre-wrap; }
      #hzMinesSettings { position:fixed;inset:0;z-index:1000000000;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;font-family:Consolas,'Courier New',monospace;color:#c8ffda;backdrop-filter:blur(3px); }
      #hzMinesSettingsBox { width:430px;max-width:92vw;background:linear-gradient(160deg,#001208,#020702);border:1.5px solid rgba(57,255,20,.65);border-radius:14px;padding:26px 30px 22px;box-shadow:0 0 32px rgba(57,255,20,.35),0 4px 60px rgba(0,0,0,.8); }
      #hzMinesSettingsBox h1 { margin:0 0 6px;font-size:20px;color:#39FF14;text-shadow:0 0 10px rgba(57,255,20,.8);text-transform:uppercase; }
      #hzMinesSettingsBox p { margin:0 0 18px;font-size:11px;color:rgba(57,255,20,.45); }
      #hzMinesSettingsBox label { display:flex;align-items:center;justify-content:space-between;margin:16px 0;font-size:13px; }
      #hzMinesSettingsBox input, #hzMinesSettingsBox select { width:130px;background:rgba(0,0,0,.6);color:#39FF14;border:1px solid rgba(57,255,20,.45);border-radius:6px;padding:8px 10px;font-size:13px;outline:none;font-family:Consolas,'Courier New',monospace; }
      #hzMinesSettingsButtons { display:flex;gap:10px;margin-top:22px; }
      #hzMinesSettingsButtons button { flex:1;padding:10px;border-radius:7px;cursor:pointer;font-family:Consolas,'Courier New',monospace; }
      #hzMinesSave { background:rgba(57,255,20,.12);color:#39FF14;border:1px solid rgba(57,255,20,.6); }
      #hzMinesClose { background:transparent;color:rgba(57,255,20,.55);border:1px solid rgba(57,255,20,.25); }
    `;
    document.head.appendChild(style);
  }

  function createPanel() {
    if (!isMines()) {
      document.getElementById('hzMinesPanel')?.remove();
      document.getElementById('hzMinesSettings')?.remove();
      return;
    }
    if (document.getElementById('hzMinesPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'hzMinesPanel';
    panel.innerHTML = `
      <div id="hzMinesHeader">
        <h2 id="hzMinesTitle">Mines Math</h2>
        <span id="hzMinesVersion">v${VERSION}</span>
      </div>
      <button id="hzMinesSettingsBtn">Settings</button>
      <div id="hzMinesStats">Reading board...</div>
    `;
    document.body.appendChild(panel);
    document.getElementById('hzMinesSettingsBtn').onclick = openSettings;
  }

  function openSettings() {
    document.getElementById('hzMinesSettings')?.remove();
    const wrap = document.createElement('div');
    wrap.id = 'hzMinesSettings';
    wrap.innerHTML = `
      <div id="hzMinesSettingsBox">
        <h1>Mines Settings</h1>
        <p>Real chance math from visible board settings</p>
        <label><span>Planned clicks</span><input id="hzPlannedClicks" type="number" min="1" max="99" step="1"></label>
        <label><span>Auto update</span><select id="hzAutoUpdate"><option value="true">on</option><option value="false">off</option></select></label>
        <div id="hzMinesSettingsButtons"><button id="hzMinesSave">Save</button><button id="hzMinesClose">Close</button></div>
      </div>
    `;
    document.body.appendChild(wrap);
    document.getElementById('hzPlannedClicks').value = settings.plannedClicks;
    document.getElementById('hzAutoUpdate').value = String(settings.autoUpdate);
    document.getElementById('hzMinesClose').onclick = () => wrap.remove();
    document.getElementById('hzMinesSave').onclick = () => {
      settings.plannedClicks = clamp(document.getElementById('hzPlannedClicks').value, 1, 99);
      settings.autoUpdate = document.getElementById('hzAutoUpdate').value === 'true';
      saveSettings();
      wrap.remove();
      updateStats();
    };
    wrap.onclick = (e) => { if (e.target === wrap) wrap.remove(); };
  }

  function getBoard() {
    const container = document.querySelector('[class*="minesGameContainer"]');
    return { container, tiles: container ? [...container.querySelectorAll('[class*="minesGameItem"]')] : [] };
  }

  function getMineCount() {
    const groups = [...document.querySelectorAll('.customInput, .gameBetInput')];
    for (const group of groups) {
      if (/\bMines\b/i.test(group.innerText || '')) {
        const input = group.querySelector('input');
        const value = parseInt(input?.value, 10);
        if (Number.isFinite(value)) return value;
      }
    }
    return 3;
  }

  function isClosedTile(tile) {
    const label = tile.getAttribute('aria-label') || '';
    return /^Open mine/i.test(label) && !tile.disabled;
  }

  function getStats() {
    const board = getBoard();
    const totalTiles = board.tiles.length;
    const mines = clamp(getMineCount(), 1, Math.max(1, totalTiles - 1));
    const closedTiles = board.tiles.filter(isClosedTile).length;
    const openedTiles = Math.max(0, totalTiles - closedTiles);
    const tilesLeft = Math.max(1, totalTiles - openedTiles);
    const safeTilesTotal = totalTiles - mines;
    const safeTilesLeft = Math.max(0, safeTilesTotal - openedTiles);
    const plannedClicks = clamp(settings.plannedClicks, 1, Math.max(1, tilesLeft));
    const nextSafeChance = totalTiles ? (safeTilesLeft / tilesLeft) * 100 : 0;
    const nextBombChance = totalTiles ? (mines / tilesLeft) * 100 : 0;
    let surviveChance = 1;
    for (let i = 0; i < plannedClicks; i++) {
      const safe = safeTilesLeft - i;
      const total = tilesLeft - i;
      if (safe <= 0 || total <= 0) { surviveChance = 0; break; }
      surviveChance *= safe / total;
    }
    return { board, totalTiles, mines, closedTiles, openedTiles, tilesLeft, safeTilesLeft, plannedClicks, nextSafeChance, nextBombChance, surviveChance: surviveChance * 100 };
  }

  function updateStats() {
    const box = document.getElementById('hzMinesStats');
    if (!box) return;
    const s = getStats();
    if (!s.board.tiles.length) { box.textContent = 'Could not find Mines board.'; return; }
    const root = Math.sqrt(s.totalTiles);
    const grid = Number.isInteger(root) ? `${root}x${root}` : `${s.totalTiles} tiles`;
    box.textContent =
`Grid: ${grid}
Tiles: ${s.totalTiles}
Mines: ${s.mines}
Opened: ${s.openedTiles}
Tiles left: ${s.tilesLeft}
Safe left: ${s.safeTilesLeft}

Next safe: ${s.nextSafeChance.toFixed(2)}%
Next bomb: ${s.nextBombChance.toFixed(2)}%

Planned clicks: ${s.plannedClicks}
Chance to survive: ${s.surviveChance.toFixed(2)}%

Math only. Not a predictor.`;
  }

  function tick() {
    addCSS();
    createPanel();
    if (isMines() && settings.autoUpdate) updateStats();
  }

  setInterval(tick, 800);
  setTimeout(tick, 1000);
  addEventListener('resize', tick);
  addEventListener('scroll', tick, true);
})();