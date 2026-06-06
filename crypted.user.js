(() => {
  'use strict';

  const VERSION = '2.0.0';
  const THEME_STORE = 'coolui_theme';
  const THEME_PRESET_STORE = 'coolui_preset';
  const USERS_STORE = 'coolui_users';
  const SESSION_STORE = 'coolui_session';
  const SETTINGS_STORE = 'coolui_settings';
  const API_BASE = 'https://crypted-wlc2.onrender.com';

  let currentUser = null;
  let adminToken = '';
  const DEFAULT_SETTINGS = {
    autoVisuals: true,
    toasts: true,
    logoutConfirm: true,
    clickThrough: true,
    visualOpacity: 10,
    visualSize: 100,
    refreshDelay: 750
  };
  let appSettings = { ...DEFAULT_SETTINGS };

  // ─── User Storage Helpers ────────────────────────────────────────────────────
  function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_STORE) || '[]');
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_STORE, JSON.stringify(users));
  }

  function getSession() {
    const raw = localStorage.getItem(SESSION_STORE);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return { username: raw };
    }
  }

  function setSession(user) {
    localStorage.setItem(SESSION_STORE, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(SESSION_STORE);
  }

  function findUser(username) {
    return getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  function isBanned(username) {
    const u = findUser(username);
    return u ? u.banned : false;
  }

  async function apiRequest(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
    return data;
  }

  function authHeaders() {
    return { Authorization: `Bearer ${adminToken}` };
  }

  // ─── Theme Presets ───────────────────────────────────────────────────────────
  const themePresets = {
    neon: {
      name: 'Neon Green',
      vars: {
        '--cx-accent': '#39FF14',
        '--cx-accent2': '#00ff88',
        '--cx-text': '#f3f4f6',
        '--cx-border': '#1e293b',
        '--cx-bg': '#070b12',
        '--cx-card': '#0d1527',
        '--cx-side': '#090f18',
        '--cx-head': '#0b1322',
        '--cx-glow': 'rgba(57,255,20,0.18)'
      }
    },
    cyber: {
      name: 'Cyber Purple',
      vars: {
        '--cx-accent': '#c026d3',
        '--cx-accent2': '#e879f9',
        '--cx-text': '#faf5ff',
        '--cx-border': '#581c87',
        '--cx-bg': '#100015',
        '--cx-card': '#1c0826',
        '--cx-side': '#17051f',
        '--cx-head': '#240733',
        '--cx-glow': 'rgba(192,38,211,0.18)'
      }
    },
    ocean: {
      name: 'Abyss Ocean',
      vars: {
        '--cx-accent': '#00aaff',
        '--cx-accent2': '#00eeff',
        '--cx-text': '#ccffff',
        '--cx-border': '#003366',
        '--cx-bg': '#001122',
        '--cx-card': '#002244',
        '--cx-side': '#001a33',
        '--cx-head': '#002b55',
        '--cx-glow': 'rgba(0,170,255,0.18)'
      }
    },
    blood: {
      name: 'Blood Moon',
      vars: {
        '--cx-accent': '#ff0033',
        '--cx-accent2': '#ff6666',
        '--cx-text': '#ffe4e6',
        '--cx-border': '#7f1d1d',
        '--cx-bg': '#150000',
        '--cx-card': '#250000',
        '--cx-side': '#1e0000',
        '--cx-head': '#300000',
        '--cx-glow': 'rgba(255,0,51,0.18)'
      }
    },
    gold: {
      name: 'Royal Gold',
      vars: {
        '--cx-accent': '#facc15',
        '--cx-accent2': '#fde68a',
        '--cx-text': '#fff7ed',
        '--cx-border': '#854d0e',
        '--cx-bg': '#120b00',
        '--cx-card': '#211400',
        '--cx-side': '#1a1000',
        '--cx-head': '#2d1b00',
        '--cx-glow': 'rgba(250,204,21,0.18)'
      }
    },
    ice: {
      name: 'Ice Blue',
      vars: {
        '--cx-accent': '#67e8f9',
        '--cx-accent2': '#a5f3fc',
        '--cx-text': '#ecfeff',
        '--cx-border': '#155e75',
        '--cx-bg': '#06131a',
        '--cx-card': '#0a2430',
        '--cx-side': '#081c26',
        '--cx-head': '#0e3342',
        '--cx-glow': 'rgba(103,232,249,0.18)'
      }
    },
    matrix: {
      name: 'Matrix Lime',
      vars: {
        '--cx-accent': '#00ff41',
        '--cx-accent2': '#39ff80',
        '--cx-text': '#d8ffe0',
        '--cx-border': '#14532d',
        '--cx-bg': '#000a03',
        '--cx-card': '#001707',
        '--cx-side': '#000f05',
        '--cx-head': '#00210b',
        '--cx-glow': 'rgba(0,255,65,0.18)'
      }
    },
    sunset: {
      name: 'Sunset',
      vars: {
        '--cx-accent': '#f97316',
        '--cx-accent2': '#fb923c',
        '--cx-text': '#fff7ed',
        '--cx-border': '#7c2d12',
        '--cx-bg': '#150800',
        '--cx-card': '#1f0f00',
        '--cx-side': '#180b00',
        '--cx-head': '#2a1200',
        '--cx-glow': 'rgba(249,115,22,0.18)'
      }
    },
    midnight: {
      name: 'Midnight Blue',
      vars: {
        '--cx-accent': '#38bdf8',
        '--cx-accent2': '#818cf8',
        '--cx-text': '#e0f2fe',
        '--cx-border': '#1e40af',
        '--cx-bg': '#020617',
        '--cx-card': '#0f172a',
        '--cx-side': '#07111f',
        '--cx-head': '#111c32',
        '--cx-glow': 'rgba(56,189,248,0.18)'
      }
    },
    emerald: {
      name: 'Emerald Core',
      vars: {
        '--cx-accent': '#10b981',
        '--cx-accent2': '#5eead4',
        '--cx-text': '#ecfdf5',
        '--cx-border': '#065f46',
        '--cx-bg': '#02130d',
        '--cx-card': '#04251a',
        '--cx-side': '#031c14',
        '--cx-head': '#063324',
        '--cx-glow': 'rgba(16,185,129,0.18)'
      }
    },
    rose: {
      name: 'Rose Neon',
      vars: {
        '--cx-accent': '#fb7185',
        '--cx-accent2': '#f0abfc',
        '--cx-text': '#fff1f2',
        '--cx-border': '#9f1239',
        '--cx-bg': '#18030a',
        '--cx-card': '#2a0711',
        '--cx-side': '#21050d',
        '--cx-head': '#3b0a18',
        '--cx-glow': 'rgba(251,113,133,0.18)'
      }
    },
    steel: {
      name: 'Steel Cyan',
      vars: {
        '--cx-accent': '#22d3ee',
        '--cx-accent2': '#94a3b8',
        '--cx-text': '#f8fafc',
        '--cx-border': '#334155',
        '--cx-bg': '#0b1120',
        '--cx-card': '#111827',
        '--cx-side': '#0f172a',
        '--cx-head': '#172033',
        '--cx-glow': 'rgba(34,211,238,0.16)'
      }
    }
  };

  // ─── SVG Logos ───────────────────────────────────────────────────────────────
  const svgLogos = {
    hex: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="hex" x="0" y="0" width="40" height="46" patternUnits="userSpaceOnUse">
        <polygon points="20,2 38,12 38,34 20,44 2,34 2,12" fill="none" stroke="currentColor" stroke-width="0.8"/>
      </pattern></defs>
      <rect width="200" height="200" fill="url(#hex)"/>
    </svg>`,
    circuit: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <line x1="10" y1="20" x2="80" y2="20" stroke="currentColor" stroke-width="1"/>
      <line x1="80" y1="20" x2="80" y2="60" stroke="currentColor" stroke-width="1"/>
      <line x1="80" y1="60" x2="140" y2="60" stroke="currentColor" stroke-width="1"/>
      <line x1="140" y1="60" x2="140" y2="100" stroke="currentColor" stroke-width="1"/>
      <line x1="140" y1="100" x2="190" y2="100" stroke="currentColor" stroke-width="1"/>
      <line x1="30" y1="80" x2="30" y2="140" stroke="currentColor" stroke-width="1"/>
      <line x1="30" y1="140" x2="110" y2="140" stroke="currentColor" stroke-width="1"/>
      <line x1="110" y1="140" x2="110" y2="170" stroke="currentColor" stroke-width="1"/>
      <line x1="110" y1="170" x2="180" y2="170" stroke="currentColor" stroke-width="1"/>
      <circle cx="80" cy="20" r="3" fill="currentColor"/>
      <circle cx="80" cy="60" r="3" fill="currentColor"/>
      <circle cx="140" cy="60" r="3" fill="currentColor"/>
      <circle cx="140" cy="100" r="3" fill="currentColor"/>
      <circle cx="30" cy="140" r="3" fill="currentColor"/>
      <circle cx="110" cy="140" r="3" fill="currentColor"/>
    </svg>`,
    diamond: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="dia" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
        <rect x="15" y="0" width="21" height="21" fill="none" stroke="currentColor" stroke-width="0.7" transform="rotate(45 15 10.5)"/>
      </pattern></defs>
      <rect width="200" height="200" fill="url(#dia)"/>
    </svg>`,
    orbit: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="4 3"/>
      <circle cx="100" cy="100" r="50" fill="none" stroke="currentColor" stroke-width="0.8" stroke-dasharray="4 3"/>
      <circle cx="100" cy="100" r="30" fill="none" stroke="currentColor" stroke-width="0.8"/>
      <circle cx="100" cy="100" r="5" fill="currentColor"/>
      <circle cx="170" cy="100" r="5" fill="currentColor"/>
      <circle cx="100" cy="30" r="4" fill="currentColor"/>
    </svg>`,
    wave: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,40 Q25,20 50,40 Q75,60 100,40 Q125,20 150,40 Q175,60 200,40" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M0,70 Q25,50 50,70 Q75,90 100,70 Q125,50 150,70 Q175,90 200,70" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M0,100 Q25,80 50,100 Q75,120 100,100 Q125,80 150,100 Q175,120 200,100" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M0,130 Q25,110 50,130 Q75,150 100,130 Q125,110 150,130 Q175,150 200,130" fill="none" stroke="currentColor" stroke-width="1"/>
      <path d="M0,160 Q25,140 50,160 Q75,180 100,160 Q125,140 150,160 Q175,180 200,160" fill="none" stroke="currentColor" stroke-width="1"/>
    </svg>`,
    grid: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" stroke-width="0.5"/>
      </pattern></defs>
      <rect width="200" height="200" fill="url(#grid)"/>
    </svg>`,
    cross: `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs><pattern id="cross" x="0" y="0" width="25" height="25" patternUnits="userSpaceOnUse">
        <line x1="12.5" y1="5" x2="12.5" y2="20" stroke="currentColor" stroke-width="0.8"/>
        <line x1="5" y1="12.5" x2="20" y2="12.5" stroke="currentColor" stroke-width="0.8"/>
        <circle cx="12.5" cy="12.5" r="1.5" fill="currentColor"/>
      </pattern></defs>
      <rect width="200" height="200" fill="url(#cross)"/>
    </svg>`,
    none: ``
  };

  let currentLogo = localStorage.getItem('coolui_logo') || 'hex';
  let userPasswordVisible = false;

  function getStoredThemeVars() {
    const presetKey = localStorage.getItem(THEME_PRESET_STORE) || 'ocean';
    const saved = JSON.parse(localStorage.getItem(THEME_STORE) || '{}');
    const preset = themePresets[presetKey]?.vars || themePresets.ocean.vars;
    return { ...preset, ...saved };
  }

  function applyVarsTo(el, vars) {
    Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v));
  }

  // ─── CSS ─────────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #coolui-wrap {
      all: initial;
      --cx-accent: #00aaff;
      --cx-accent2: #00eeff;
      --cx-text: #ccffff;
      --cx-border: #003366;
      --cx-bg: #001122;
      --cx-card: #002244;
      --cx-side: #001a33;
      --cx-head: #002b55;
      --cx-glow: rgba(0,170,255,0.18);
    }

    /* ── Login Overlay ── */
    #cx-login-overlay {
      position: fixed !important;
      inset: 0;
      background: rgba(0,0,0,0.92);
      z-index: 2147483646 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    #cx-login-box {
      background: #0d1527;
      border: 1px solid #1e293b;
      border-radius: 18px;
      padding: 36px 40px;
      width: 360px;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 25px 60px rgba(0,0,0,.9), 0 0 24px var(--cx-glow);
    }

    #cx-login-box::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      border-radius: 0 0 18px 18px;
      background: linear-gradient(90deg, transparent, var(--cx-accent), var(--cx-accent2), transparent);
    }

    .cx-login-logo {
      font-size: 22px;
      font-weight: 900;
      letter-spacing: 1px;
      color: #f3f4f6;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cx-login-logo .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cx-accent); box-shadow: 0 0 8px var(--cx-accent); animation: pulse 2s infinite; }
    .cx-login-logo .accent { color: var(--cx-accent); text-shadow: 0 0 14px var(--cx-accent); }

    .cx-login-sub {
      font-size: 13px;
      color: #f3f4f6;
      opacity: 0.45;
      margin-bottom: 28px;
    }

    .cx-auth-tabs {
      display: flex;
      gap: 6px;
      margin-bottom: 22px;
    }

    .cx-auth-tab {
      flex: 1;
      padding: 9px;
      border-radius: 10px;
      border: 1px solid #1e293b;
      background: #070b12;
      color: #f3f4f6;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      transition: all .2s;
      opacity: 0.6;
    }
    .cx-auth-tab.active { border-color: var(--cx-accent); color: var(--cx-accent); opacity: 1; background: var(--cx-glow); }
    .cx-auth-tab:hover { opacity: 0.9; }

    .cx-login-field {
      margin-bottom: 14px;
    }
    .cx-login-field label {
      display: block;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #f3f4f6;
      opacity: 0.5;
      margin-bottom: 6px;
    }
    .cx-login-field input {
      width: 100%;
      box-sizing: border-box;
      background: #070b12;
      border: 1px solid #1e293b;
      border-radius: 10px;
      color: #f3f4f6;
      font-size: 14px;
      font-weight: 600;
      padding: 11px 14px;
      outline: none;
      transition: border-color .2s;
      font-family: inherit;
    }
    .cx-login-field input:focus { border-color: var(--cx-accent); box-shadow: 0 0 0 2px var(--cx-glow); }

    .cx-login-btn {
      width: 100%;
      background: var(--cx-accent);
      border: 0;
      border-radius: 10px;
      color: #000;
      font-weight: 900;
      font-size: 14px;
      padding: 13px;
      cursor: pointer;
      margin-top: 6px;
      box-shadow: 0 4px 18px var(--cx-glow);
      transition: filter .2s, transform .1s;
      font-family: inherit;
    }
    .cx-login-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
    .cx-login-btn:active { transform: translateY(0); }

    .cx-login-err {
      color: #ff4466;
      font-size: 12px;
      font-weight: 700;
      margin-top: 10px;
      min-height: 18px;
      text-align: center;
    }

    /* ── Hidden admin trigger ── */
    #cx-admin-trigger {
      position: absolute;
      bottom: 18px;
      right: 18px;
      width: 16px;
      height: 16px;
      border-radius: 5px;
      background: #1e293b;
      border: 1px solid #2d3f5a;
      cursor: pointer;
      transition: all .2s;
      opacity: 0.4;
    }
    #cx-admin-trigger:hover { opacity: 1; background: var(--cx-glow); border-color: var(--cx-accent); box-shadow: 0 0 8px var(--cx-glow); }

    /* ── Admin Modal ── */
    #cx-admin-modal {
      position: fixed !important;
      inset: 0;
      background: rgba(0,0,0,0.95);
      z-index: 2147483647 !important;
      display: none;
      align-items: center;
      justify-content: center;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    #cx-admin-modal.open { display: flex; }

    #cx-admin-box {
      background: #0d1527;
      border: 1px solid #300000;
      border-radius: 18px;
      padding: 32px 36px;
      width: 520px;
      max-height: 80vh;
      overflow-y: auto;
      box-sizing: border-box;
      position: relative;
      box-shadow: 0 25px 60px rgba(0,0,0,.9), 0 0 24px rgba(255,0,51,0.2);
    }
    #cx-admin-box::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 2px;
      border-radius: 0 0 18px 18px;
      background: linear-gradient(90deg, transparent, #ff0033, #ff6666, transparent);
    }

    .cx-admin-title {
      font-size: 18px;
      font-weight: 900;
      color: #ff4455;
      letter-spacing: 1px;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .cx-admin-sub { font-size: 12px; color: #f3f4f6; opacity: 0.4; margin-bottom: 22px; }

    #cx-admin-pass-section { }
    #cx-admin-panel-section { display: none; }
    #cx-admin-panel-section.visible { display: block; }

    .cx-admin-field input {
      width: 100%;
      box-sizing: border-box;
      background: #070b12;
      border: 1px solid #300000;
      border-radius: 10px;
      color: #f3f4f6;
      font-size: 14px;
      font-weight: 600;
      padding: 11px 14px;
      outline: none;
      font-family: inherit;
      margin-bottom: 10px;
      transition: border-color .2s;
    }
    .cx-admin-field input:focus { border-color: #ff0033; box-shadow: 0 0 0 2px rgba(255,0,51,0.12); }

    .cx-admin-btn {
      width: 100%;
      background: #ff0033;
      border: 0;
      border-radius: 10px;
      color: #fff;
      font-weight: 900;
      font-size: 14px;
      padding: 12px;
      cursor: pointer;
      font-family: inherit;
      transition: filter .2s;
    }
    .cx-admin-btn:hover { filter: brightness(1.15); }

    .cx-admin-close {
      position: absolute;
      top: 18px; right: 18px;
      width: 28px; height: 28px;
      border-radius: 8px;
      border: 1px solid #300000;
      background: #150000;
      color: #ff4455;
      font-size: 16px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }
    .cx-admin-close:hover { background: #300000; }

    .cx-admin-err { color: #ff4466; font-size: 12px; font-weight: 700; margin: 8px 0; min-height: 18px; }

    /* ── User Table ── */
    .cx-user-table { width: 100%; border-collapse: collapse; table-layout: fixed; margin-top: 10px; }
    .cx-user-table th:nth-child(1), .cx-user-table td:nth-child(1) { width: 26%; }
    .cx-user-table th:nth-child(2), .cx-user-table td:nth-child(2) { width: 20%; }
    .cx-user-table th:nth-child(3), .cx-user-table td:nth-child(3) { width: 18%; }
    .cx-user-table th:nth-child(4), .cx-user-table td:nth-child(4) { width: 36%; }
    .cx-user-table th {
      font-size: 10px;
      font-weight: 900;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #f3f4f6;
      opacity: 0.4;
      text-align: left;
      padding: 0 8px 8px;
    }
    .cx-user-table td {
      padding: 10px 8px;
      font-size: 13px;
      color: #f3f4f6;
      border-top: 1px solid #1e293b;
      vertical-align: middle;
    }
    .cx-user-table tr:hover td { background: rgba(255,255,255,0.03); }

    .cx-status-badge {
      display: inline-block;
      padding: 2px 8px;
      white-space: nowrap;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 900;
      letter-spacing: .5px;
    }
    .cx-status-badge.active { background: rgba(57,255,20,0.12); color: #39FF14; border: 1px solid #39FF14; }
    .cx-status-badge.banned { background: rgba(255,0,51,0.12); color: #ff4455; border: 1px solid #ff0033; }

    .cx-user-action {
      background: transparent;
      border: 1px solid #1e293b;
      border-radius: 7px;
      color: #f3f4f6;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      cursor: pointer;
      font-family: inherit;
      transition: all .2s;
    }
    .cx-user-action.ban { border-color: #ff0033; color: #ff4455; }
    .cx-user-action.ban:hover { background: rgba(255,0,51,0.12); }
    .cx-user-action.unban { border-color: #39FF14; color: #39FF14; }
    .cx-user-action.unban:hover { background: rgba(57,255,20,0.12); }
    .cx-user-action.info { border-color: #00aaff; color: #67e8f9; }
    .cx-user-action.info:hover { background: rgba(0,170,255,0.12); }
    .cx-user-action.delete { border-color: #7f1d1d; color: #ff6666; }
    .cx-user-action.delete:hover { background: rgba(255,0,51,0.08); }
    .cx-user-actions { display: flex; align-items: center; gap: 6px; flex-wrap: nowrap; }

    .cx-admin-user-view { display: none; }
    .cx-admin-user-view.visible { display: block; }
    .cx-admin-list-view.hidden { display: none; }
    .cx-admin-info-card {
      background: #070b12;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 14px;
      margin-top: 12px;
    }
    .cx-admin-info-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      padding: 10px 0;
      border-bottom: 1px solid #1e293b;
      color: #f3f4f6;
      font-size: 13px;
    }
    .cx-admin-info-row:last-child { border-bottom: 0; }
    .cx-admin-info-row span { opacity: .45; font-size: 10px; font-weight: 900; letter-spacing: 1.2px; text-transform: uppercase; }
    .cx-admin-info-row strong { font-size: 13px; text-align: right; word-break: break-word; }
    .cx-admin-back { margin-top: 14px; }

    .cx-admin-stats {
      display: flex;
      gap: 10px;
      margin-bottom: 18px;
    }
    .cx-admin-stat-card {
      flex: 1;
      background: #070b12;
      border: 1px solid #1e293b;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .cx-admin-stat-card .label { font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; color: #f3f4f6; opacity: 0.4; margin-bottom: 4px; }
    .cx-admin-stat-card .value { font-size: 22px; font-weight: 900; color: #ff4455; }
    .cx-admin-stat-card .value.green { color: #39FF14; }

    .cx-divider-admin { height: 1px; background: #1e293b; margin: 16px 0; }

    /* ── Main UI (same as before) ── */
    #coolui {
      --cx-accent: #00aaff;
      --cx-accent2: #00eeff;
      --cx-text: #ccffff;
      --cx-border: #003366;
      --cx-bg: #001122;
      --cx-card: #002244;
      --cx-side: #001a33;
      --cx-head: #002b55;
      --cx-glow: rgba(0,170,255,0.18);

      position: fixed !important;
      top: 60px; left: 60px;
      width: 780px; height: 540px;
      background: var(--cx-bg);
      color: var(--cx-text);
      z-index: 2147483645 !important;
      border: 1px solid var(--cx-border);
      border-radius: 18px;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 25px 60px -12px rgba(0,0,0,.9), 0 0 24px var(--cx-accent);
      overflow: hidden;
      transition: height .25s ease, width .25s ease, box-shadow .4s ease;
      display: none;
    }

    #coolui.visible { display: block; }
    #coolui.minimized { height: 56px !important; width: 360px !important; box-shadow: 0 8px 24px rgba(0,0,0,.6), 0 0 12px var(--cx-accent); }

    #cx-head {
      height: 56px; background: var(--cx-head);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 22px; cursor: move; border-bottom: 1px solid var(--cx-border);
      user-select: none; box-sizing: border-box; position: relative; overflow: hidden;
    }
    #cx-head::after {
      content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, transparent, var(--cx-accent), var(--cx-accent2), transparent);
    }
    #cx-logo { font-size: 20px; font-weight: 900; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; white-space: nowrap; line-height: 1; flex: 0 0 auto; }
    #cx-logo .accent { color: var(--cx-accent); text-shadow: 0 0 14px var(--cx-accent); }
    #cx-logo .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--cx-accent); box-shadow: 0 0 8px var(--cx-accent); animation: pulse 2s infinite; }
    #coolui.minimized #cx-head { padding: 0 14px; }
    #coolui.minimized #cx-logo { font-size: 18px; gap: 7px; }

    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(.75); } }

    #cx-controls { display: flex; gap: 8px; align-items: center; justify-content: flex-end; min-width: 0; flex: 1 1 auto; margin-left: 14px; flex-wrap: nowrap; }

    .cx-ctrl {
      width: 28px; height: 28px; border-radius: 8px;
      border: 1px solid var(--cx-border); background: var(--cx-bg);
      color: var(--cx-text); font-size: 14px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; transition: all .2s; flex: 0 0 28px;
    }
    .cx-ctrl:hover { border-color: var(--cx-accent); color: var(--cx-accent); box-shadow: 0 0 8px var(--cx-accent); }

    #cx-body { display: flex; height: calc(100% - 56px); }
    #coolui.minimized #cx-body { display: none; }

    #cx-side {
      width: 210px; border-right: 1px solid var(--cx-border);
      padding: 16px 10px; background: var(--cx-side);
      display: flex; flex-direction: column; box-sizing: border-box; gap: 2px;
    }

    .cx-section-label { font-size: 10px; color: var(--cx-text); opacity: .4; font-weight: 900; letter-spacing: 2px; margin: 14px 0 6px 12px; text-transform: uppercase; }

    .cx-nav {
      padding: 10px 14px; border-radius: 10px; color: var(--cx-text); opacity: .65;
      cursor: pointer; font-weight: 700; font-size: 14px; transition: all .2s;
      display: flex; align-items: center; gap: 10px; position: relative;
    }
    .cx-nav:hover { background: var(--cx-card); opacity: 1; }
    .cx-nav.active { background: var(--cx-glow); color: var(--cx-accent); opacity: 1; box-shadow: inset 3px 0 0 var(--cx-accent); }
    .cx-nav .cx-nav-icon { width: 28px; height: 28px; border-radius: 8px; background: var(--cx-card); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: background .2s, border-color .2s; border: 1px solid var(--cx-border); color: var(--cx-text); opacity: .9; }
    .cx-nav.active .cx-nav-icon { background: var(--cx-glow); }
    .cx-nav-icon svg { width: 15px; height: 15px; stroke: currentColor; stroke-width: 2; fill: none; stroke-linecap: round; stroke-linejoin: round; }
    .cx-nav.active .cx-nav-icon { border-color: var(--cx-accent); color: var(--cx-accent); }

    #cx-main { flex: 1; padding: 20px; overflow-y: auto; box-sizing: border-box; scrollbar-width: thin; scrollbar-color: var(--cx-border) transparent; }

    .cx-panel { display: none; }
    .cx-panel.active { display: block; }

    .cx-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .cx-wide { grid-column: span 2; }

    .cx-card {
      background: var(--cx-card); border: 1px solid var(--cx-border);
      border-radius: 14px; padding: 16px; box-sizing: border-box;
      position: relative; overflow: hidden; transition: border-color .2s, box-shadow .2s;
    }
    .cx-card:hover { border-color: var(--cx-accent); box-shadow: 0 0 0 1px var(--cx-accent), 0 0 20px var(--cx-glow); }

    .cx-card p { margin: 0 0 10px; font-size: 10px; font-weight: 900; color: var(--cx-text); opacity: .5; letter-spacing: 1.5px; text-transform: uppercase; }
    .cx-stat { font-size: 32px; font-weight: 900; color: var(--cx-accent); text-shadow: 0 0 20px var(--cx-accent); line-height: 1.2; }
    .cx-small { font-size: 13px; line-height: 1.6; color: var(--cx-text); opacity: .8; white-space: pre-wrap; }

    .cx-btn { background: var(--cx-accent); border: 0; border-radius: 10px; color: #000; font-weight: 900; font-size: 14px; padding: 12px 18px; width: 100%; cursor: pointer; box-shadow: 0 4px 18px var(--cx-glow); transition: filter .2s, transform .1s; margin-top: 10px; font-family: inherit; }
    .cx-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }
    .cx-btn:active { transform: translateY(0); }
    .cx-btn-ghost { background: transparent; color: var(--cx-text); border: 1px solid var(--cx-border); box-shadow: none; }
    .cx-btn-ghost:hover { border-color: var(--cx-accent); color: var(--cx-accent); filter: none; }

    .cx-row { display: flex; align-items: center; justify-content: space-between; margin: 10px 0; gap: 12px; }
    .cx-row label { font-size: 13px; font-weight: 700; opacity: .9; }
    .cx-user-pass-wrap { display: flex; align-items: center; justify-content: flex-end; gap: 8px; min-width: 0; }
    .cx-user-pass-wrap .cx-small { max-width: 210px; overflow-wrap: anywhere; }
    .cx-mini-btn {
      background: transparent;
      border: 1px solid var(--cx-border);
      border-radius: 8px;
      color: var(--cx-text);
      font-size: 11px;
      font-weight: 800;
      padding: 6px 9px;
      cursor: pointer;
      font-family: inherit;
      transition: all .2s;
      white-space: nowrap;
    }
    .cx-mini-btn:hover { border-color: var(--cx-accent); color: var(--cx-accent); background: var(--cx-glow); }
    .cx-admin-only { display: none !important; }
    #coolui.admin-user .cx-admin-only { display: flex !important; }
    .cx-key-line {
      padding: 9px 0;
      border-bottom: 1px solid var(--cx-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 12px;
    }
    .cx-key-line:last-child { border-bottom: 0; }
    .cx-key-code { font-weight: 900; color: var(--cx-accent); overflow-wrap: anywhere; }
    .cx-key-muted { opacity: .55; font-size: 11px; }
    .cx-helper-outline {
      position: fixed;
      z-index: 2147483000;
      pointer-events: var(--cx-helper-pointer, none);
      transform: translate3d(var(--cx-helper-x, 0px), var(--cx-helper-y, 0px), 0);
      border: 2px solid var(--cx-accent, #00aaff);
      border-radius: 6px;
      box-shadow: 0 0 7px var(--cx-accent, #00aaff), 0 0 18px var(--cx-glow, rgba(0,170,255,.35)), inset 0 0 8px rgba(255,255,255,.08);
      background: rgba(0,170,255,.08);
      box-sizing: border-box;
      will-change: transform, width, height;
    }
    .cx-helper-outline.mine { border-style: dashed; }

    .cx-input, .cx-select { background: var(--cx-bg); border: 1px solid var(--cx-border); border-radius: 8px; color: var(--cx-text); font-weight: 700; font-size: 13px; outline: none; padding: 8px 12px; width: 150px; box-sizing: border-box; transition: border-color .2s; font-family: inherit; }
    .cx-input:focus, .cx-select:focus { border-color: var(--cx-accent); box-shadow: 0 0 0 2px var(--cx-glow); }
    .cx-select option { background: var(--cx-bg); }
    .cx-tools-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
    .cx-tool-card {
      min-height: 230px; border-radius: 12px; border: 1px solid var(--cx-border);
      background: linear-gradient(180deg, var(--cx-card), rgba(0,0,0,.12));
      padding: 16px; box-sizing: border-box; display: flex; flex-direction: column; gap: 14px;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.04);
    }
    .cx-tool-card:hover { border-color: var(--cx-accent); box-shadow: 0 0 0 1px var(--cx-accent), 0 0 22px var(--cx-glow); }
    .cx-tool-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .cx-tool-head p { margin: 0 0 5px; font-size: 10px; font-weight: 900; opacity: .5; letter-spacing: 1.5px; text-transform: uppercase; }
    .cx-tool-title { font-size: 22px; font-weight: 900; color: var(--cx-accent); text-shadow: 0 0 18px var(--cx-glow); line-height: 1.15; }
    .cx-tool-chip { border: 1px solid var(--cx-border); border-radius: 999px; padding: 5px 9px; color: var(--cx-text); background: var(--cx-bg); font-size: 11px; font-weight: 900; opacity: .85; white-space: nowrap; }
    .cx-tool-chip.active { color: var(--cx-accent); border-color: var(--cx-accent); background: var(--cx-glow); opacity: 1; }
    .cx-tool-control { display: grid; grid-template-columns: 1fr; gap: 10px; padding: 12px; border: 1px solid rgba(255,255,255,.06); border-radius: 10px; background: rgba(0,0,0,.12); }
    .cx-tool-control label { font-size: 12px; font-weight: 900; opacity: .9; white-space: nowrap; letter-spacing: .2px; }
    .cx-stepper { display: grid; grid-template-columns: 34px minmax(58px, 1fr) 34px; gap: 7px; align-items: center; }
    .cx-step-btn { height: 34px; border-radius: 8px; border: 1px solid var(--cx-border); background: var(--cx-bg); color: var(--cx-text); font-size: 18px; font-weight: 900; cursor: pointer; font-family: inherit; }
    .cx-step-btn:hover { border-color: var(--cx-accent); color: var(--cx-accent); background: var(--cx-glow); }
    .cx-tool-number { width: 72px; height: 34px; text-align: center; padding: 6px 8px; }
    .cx-tool-number::-webkit-outer-spin-button, .cx-tool-number::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    .cx-tool-action { margin-top: 0; }
    .cx-tool-output { min-height: 86px; margin-top: auto; border-radius: 10px; border: 1px solid rgba(255,255,255,.06); background: rgba(0,0,0,.14); padding: 12px; color: var(--cx-text); opacity: .82; font-size: 12px; line-height: 1.55; white-space: pre-wrap; box-sizing: border-box; }
    .cx-toggle-row { min-height: 42px; border-bottom: 1px solid rgba(255,255,255,.04); }
    .cx-switch { position: relative; width: 52px; height: 28px; flex: 0 0 auto; }
    .cx-switch input { opacity: 0; width: 0; height: 0; }
    .cx-slider-toggle { position: absolute; inset: 0; cursor: pointer; border-radius: 999px; background: rgba(148,163,184,.18); border: 1px solid var(--cx-border); transition: all .2s; }
    .cx-slider-toggle::before { content: ""; position: absolute; width: 20px; height: 20px; left: 4px; top: 3px; border-radius: 50%; background: rgba(226,232,240,.75); transition: all .2s; box-shadow: 0 2px 6px rgba(0,0,0,.35); }
    .cx-switch input:checked + .cx-slider-toggle { background: var(--cx-glow); border-color: var(--cx-accent); box-shadow: 0 0 16px var(--cx-glow); }
    .cx-switch input:checked + .cx-slider-toggle::before { transform: translateX(24px); background: var(--cx-accent); }
    .cx-range-wrap { display: flex; align-items: center; gap: 10px; min-width: 230px; justify-content: flex-end; }
    .cx-range {
      width: 165px; height: 18px; appearance: none; -webkit-appearance: none;
      background: transparent; cursor: pointer;
    }
    .cx-range::-webkit-slider-runnable-track {
      height: 8px; border-radius: 999px; border: 1px solid var(--cx-border);
      background: linear-gradient(90deg, var(--cx-accent) var(--range-fill, 50%), rgba(148,163,184,.18) var(--range-fill, 50%));
      box-shadow: inset 0 0 8px rgba(0,0,0,.24);
    }
    .cx-range::-webkit-slider-thumb {
      -webkit-appearance: none; width: 18px; height: 18px; margin-top: -6px;
      border-radius: 50%; border: 2px solid var(--cx-bg); background: var(--cx-accent);
      box-shadow: 0 0 12px var(--cx-glow), 0 2px 8px rgba(0,0,0,.35);
    }
    .cx-range::-moz-range-track {
      height: 8px; border-radius: 999px; border: 1px solid var(--cx-border);
      background: rgba(148,163,184,.18);
    }
    .cx-range::-moz-range-progress { height: 8px; border-radius: 999px; background: var(--cx-accent); }
    .cx-range::-moz-range-thumb {
      width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--cx-bg);
      background: var(--cx-accent); box-shadow: 0 0 12px var(--cx-glow);
    }
    .cx-range-value { width: 48px; text-align: right; font-size: 12px; font-weight: 900; color: var(--cx-accent); }
    .cx-danger-btn { background: rgba(255,60,88,.12); color: #ff4765; border-color: rgba(255,60,88,.45); }

    .cx-color { width: 48px; height: 36px; border-radius: 8px; border: 1px solid var(--cx-border); padding: 2px; cursor: pointer; background: var(--cx-bg); }

    .cx-logo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-top: 10px; }
    .cx-logo-btn { aspect-ratio: 1; border-radius: 10px; border: 2px solid var(--cx-border); background: var(--cx-bg); cursor: pointer; padding: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; transition: all .2s; color: var(--cx-text); }
    .cx-logo-btn svg { width: 100%; height: 60%; color: var(--cx-accent); opacity: .7; }
    .cx-logo-btn span { font-size: 10px; font-weight: 700; opacity: .6; letter-spacing: .5px; }
    .cx-logo-btn:hover { border-color: var(--cx-accent); background: var(--cx-card); }
    .cx-logo-btn.active { border-color: var(--cx-accent); background: var(--cx-glow); box-shadow: 0 0 12px var(--cx-glow); }
    .cx-logo-btn.active svg { opacity: 1; }
    .cx-logo-btn.active span { opacity: 1; color: var(--cx-accent); }

    #cx-bg-logo { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; overflow: hidden; }
    #cx-bg-logo svg { width: 100%; height: 100%; color: var(--cx-accent); opacity: .025; }

    .cx-badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight: 900; background: var(--cx-glow); color: var(--cx-accent); border: 1px solid var(--cx-accent); letter-spacing: .5px; }
    .cx-divider { height: 1px; background: var(--cx-border); margin: 14px 0; }

    #cx-toast { position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px); background: var(--cx-card); border: 1px solid var(--cx-accent); color: var(--cx-accent); padding: 10px 22px; border-radius: 999px; font-size: 13px; font-weight: 700; z-index: 2147483648; opacity: 0; transition: all .3s; pointer-events: none; box-shadow: 0 0 18px var(--cx-glow); white-space: nowrap; }
    #cx-toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
    #cx-logout-pop {
      position: fixed; z-index: 2147483648; top: 76px; right: 36px;
      width: 220px; padding: 14px; border-radius: 12px;
      background: var(--cx-card); border: 1px solid var(--cx-accent);
      box-shadow: 0 0 24px var(--cx-glow), 0 16px 40px rgba(0,0,0,.45);
      color: var(--cx-text); display: none;
    }
    #cx-logout-pop.open { display: block; }
    #cx-logout-pop .title { font-weight: 900; color: var(--cx-accent); margin-bottom: 4px; }
    #cx-logout-pop .sub { font-size: 12px; opacity: .7; margin-bottom: 12px; line-height: 1.4; }
    .cx-pop-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .cx-pop-btn { border-radius: 8px; border: 1px solid var(--cx-border); padding: 8px 10px; background: transparent; color: var(--cx-text); font-family: inherit; font-weight: 900; cursor: pointer; }
    .cx-pop-btn.yes { background: var(--cx-accent); color: #000; border-color: var(--cx-accent); }

    /* ── Logout button in header ── */
    #cx-logout { font-size: 11px; padding: 5px 12px; }
    #cx-username-display { font-size: 12px; opacity: 0.6; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
    #coolui.minimized #cx-username-display { max-width: 72px; }
  `;
  document.head.appendChild(style);

  // ─── Login Overlay HTML ───────────────────────────────────────────────────────
  const wrap = document.createElement('div');
  wrap.id = 'coolui-wrap';
  applyVarsTo(wrap, getStoredThemeVars());
  wrap.innerHTML = `
    <div id="cx-toast"></div>
    <div id="cx-logout-pop">
      <div class="title">Logout?</div>
      <div class="sub">Your settings stay saved. You will need to log in again.</div>
      <div class="cx-pop-actions">
        <button class="cx-pop-btn" id="cx-logout-cancel">Cancel</button>
        <button class="cx-pop-btn yes" id="cx-logout-confirm">Logout</button>
      </div>
    </div>

    <!-- Admin Modal -->
    <div id="cx-admin-modal">
      <div id="cx-admin-box">
        <div class="cx-admin-close" id="cx-admin-close">✕</div>
        <div class="cx-admin-title">⚠ Admin Panel</div>
        <div class="cx-admin-sub" id="cx-admin-sub">Restricted access — enter admin password</div>

        <div id="cx-admin-pass-section">
          <div class="cx-admin-field">
            <input type="password" id="cx-admin-pass-input" placeholder="Admin password..." autocomplete="off">
          </div>
          <button class="cx-admin-btn" id="cx-admin-pass-btn">Enter</button>
          <div class="cx-admin-err" id="cx-admin-err"></div>
        </div>

        <div id="cx-admin-panel-section">
          <div class="cx-admin-stats">
            <div class="cx-admin-stat-card">
              <div class="label">Total Users</div>
              <div class="value green" id="cx-stat-total">0</div>
            </div>
            <div class="cx-admin-stat-card">
              <div class="label">Banned</div>
              <div class="value" id="cx-stat-banned">0</div>
            </div>
            <div class="cx-admin-stat-card">
              <div class="label">Active</div>
              <div class="value green" id="cx-stat-active">0</div>
            </div>
          </div>
          <div class="cx-divider-admin"></div>
                    <div class="cx-admin-list-view" id="cx-admin-list-view">
          <table class="cx-user-table" id="cx-user-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="cx-user-tbody"></tbody>
          </table>
          <div style="color:#f3f4f6;opacity:.3;font-size:12px;margin-top:14px;text-align:center;" id="cx-no-users" style="display:none">No registered users yet.</div>
                  </div>
          <div class="cx-admin-user-view" id="cx-admin-user-view">
            <div class="cx-admin-title" id="cx-admin-user-title">User Info</div>
            <div class="cx-admin-sub">Saved login details and account status</div>
            <div class="cx-admin-info-card" id="cx-admin-user-info"></div>
            <button class="cx-admin-btn cx-admin-back" id="cx-admin-back-btn">Back to Users</button>
          </div></div>
      </div>
    </div>

    <!-- Login Overlay -->
    <div id="cx-login-overlay">
      <div id="cx-login-box">
        <div class="cx-login-logo"><div class="dot"></div>CRYPTED<span class="accent">UI</span></div>
        <div class="cx-login-sub">Sign in to continue</div>

        <div class="cx-auth-tabs">
          <div class="cx-auth-tab active" id="tab-login">Login</div>
          <div class="cx-auth-tab" id="tab-register">Register</div>
        </div>

        <div id="cx-login-form">
          <div class="cx-login-field"><label>Username</label><input type="text" id="cx-l-user" placeholder="Enter username..." autocomplete="off"></div>
          <div class="cx-login-field"><label>Password</label><input type="password" id="cx-l-pass" placeholder="Enter password..." autocomplete="off"></div>
          <button class="cx-login-btn" id="cx-login-btn">Login</button>
          <div class="cx-login-err" id="cx-login-err"></div>
        </div>

        <div id="cx-register-form" style="display:none;">
          <div class="cx-login-field"><label>Username</label><input type="text" id="cx-r-user" placeholder="Choose a username..." autocomplete="off"></div>
          <div class="cx-login-field"><label>Password</label><input type="password" id="cx-r-pass" placeholder="Choose a password..." autocomplete="off"></div>
          <div class="cx-login-field"><label>Confirm Password</label><input type="password" id="cx-r-pass2" placeholder="Repeat password..." autocomplete="off"></div>
          <div class="cx-login-field"><label>Access Key</label><input type="text" id="cx-r-key" placeholder="CRYPT-XXXXXX-XXXXXX-XXXXXX" autocomplete="off"></div>
          <button class="cx-login-btn" id="cx-register-btn">Create Account</button>
          <div class="cx-login-err" id="cx-register-err"></div>
        </div>

        <!-- Hidden admin trigger -->
        <div id="cx-admin-trigger" title=""></div>
      </div>
    </div>

    <!-- Main UI -->
    <div id="coolui">
      <div id="cx-bg-logo">${svgLogos[currentLogo] || ''}</div>
      <div id="cx-head">
        <div id="cx-logo"><div class="dot"></div>CRYPTED<span class="accent">UI</span></div>
        <div id="cx-controls">
          <span id="cx-username-display"></span>
          <div class="cx-ctrl cx-btn-ghost" id="cx-logout" title="Logout">⏏</div>
          <div class="cx-ctrl" id="cx-min" title="Minimize">−</div>
        </div>
      </div>

      <div id="cx-body">
        <div id="cx-side">
          <div class="cx-section-label">Menu</div>
          <div class="cx-nav active" data-panel="cx-home"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 13h6v7H4z"/><path d="M14 4h6v16h-6z"/><path d="M4 4h6v5H4z"/></svg></div>Dashboard</div>
          <div class="cx-nav" data-panel="cx-tools"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><path d="M14 7l3 3-7 7H7v-3z"/><path d="M16 5l3 3"/><path d="M5 19h14"/></svg></div>Tools</div>
          <div class="cx-nav" data-panel="cx-appearance"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a1.8 1.8 0 0 1 0-3.6h2a7 7 0 0 0-2-9.4z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="14" cy="7.5" r="1"/></svg></div>Appearance</div>
          <div class="cx-nav" data-panel="cx-user"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg></div>User</div>
          <div class="cx-nav" data-panel="cx-key"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><circle cx="7.5" cy="14.5" r="3.5"/><path d="M10.5 12l8-8"/><path d="M15 7l2 2"/><path d="M17 5l2 2"/></svg></div>Key</div>
          <div class="cx-nav cx-admin-only" data-panel="cx-admin-tab"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/><path d="M9 12l2 2 4-5"/></svg></div>Admin</div>
          <div class="cx-nav cx-admin-only" data-panel="cx-keygen"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><path d="M4 14a4 4 0 1 0 4-4"/><path d="M8 10l8-8"/><path d="M14 4l3 3"/><path d="M16 2l4 4"/><path d="M5 20h14"/></svg></div>Key Generator</div>
          <div class="cx-nav" data-panel="cx-settings"><div class="cx-nav-icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a8 8 0 0 0 .1-2l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.7-1L15 5.5h-4l-.4 2.6a8 8 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.5a8 8 0 0 0 .1 2l-2.1 1.5 2 3.4 2.4-1a8 8 0 0 0 1.7 1l.4 2.6h4l.4-2.6a8 8 0 0 0 1.7-1l2.4 1 2-3.4z"/></svg></div>Settings</div>
        </div>

        <div id="cx-main">
          <!-- Dashboard -->
          <div id="cx-home" class="cx-panel active">
            <div class="cx-grid">
              <div class="cx-card"><p>Status</p><div class="cx-stat">Active</div></div>
              <div class="cx-card"><p>Balance</p><div class="cx-stat" id="cx-balance">Syncing</div><div class="cx-small" id="cx-balance-sub" style="margin-top:6px;">Watching Bloxflip</div></div>
              <div class="cx-card"><p>Version</p><div class="cx-stat">v${VERSION}</div></div>
              <div class="cx-card"><p>Uptime</p><div id="cx-uptime" class="cx-stat" style="font-size:20px;">0s</div></div>
              <div class="cx-card cx-wide"><p>Output</p><div id="cx-output" class="cx-small">Welcome to Crypted UI. Use the sidebar to navigate.</div></div>
              <div class="cx-card cx-wide"><p>Page</p><div id="cx-page" class="cx-small" style="font-weight:700;font-size:14px;"></div></div>
            </div>
          </div>

          <!-- Tools -->
          <div id="cx-tools" class="cx-panel">
            <div class="cx-tools-grid">
              <div class="cx-tool-card">
                <div class="cx-tool-head">
                  <div>
                    <p>Mines Helper</p>
                    <div class="cx-tool-title">Tile Marker</div>
                  </div>
                  <span class="cx-tool-chip" id="cx-mines-chip">Idle</span>
                </div>
                <div class="cx-tool-control">
                  <label>Tiles to show</label>
                  <div class="cx-stepper">
                    <button type="button" class="cx-step-btn" data-target="cx-mines-clicks" data-step="-1">−</button>
                    <input class="cx-input cx-tool-number" id="cx-mines-clicks" type="number" min="1" max="24" value="3">
                    <button type="button" class="cx-step-btn" data-target="cx-mines-clicks" data-step="1">+</button>
                  </div>
                </div>
                <button class="cx-btn cx-tool-action" id="cx-mines-visual-btn">Show Mines Visual</button>
                <div id="cx-mines-helper-output" class="cx-tool-output">Open Mines to show random marked tiles.</div>
              </div>
              <div class="cx-tool-card">
                <div class="cx-tool-head">
                  <div>
                    <p>Towers Helper</p>
                    <div class="cx-tool-title">Path Marker</div>
                  </div>
                  <span class="cx-tool-chip" id="cx-towers-chip">Idle</span>
                </div>
                <div class="cx-tool-control">
                  <label>Rows to show</label>
                  <div class="cx-stepper">
                    <button type="button" class="cx-step-btn" data-target="cx-towers-rows" data-step="-1">−</button>
                    <input class="cx-input cx-tool-number" id="cx-towers-rows" type="number" min="1" max="8" value="8">
                    <button type="button" class="cx-step-btn" data-target="cx-towers-rows" data-step="1">+</button>
                  </div>
                </div>
                <button class="cx-btn cx-tool-action" id="cx-towers-visual-btn">Show Towers Visual</button>
                <div id="cx-towers-helper-output" class="cx-tool-output">Open Towers to show a random marked path.</div>
              </div>
            </div>
          </div>

          <!-- User -->
          <div id="cx-user" class="cx-panel">
            <div class="cx-grid">
              <div class="cx-card cx-wide">
                <p>User</p>
                <div class="cx-row"><label>Username</label><div id="cx-user-tab-name" class="cx-small" style="font-weight:900;text-align:right;"></div></div>
                <div class="cx-row"><label>Password</label><div class="cx-user-pass-wrap"><div id="cx-user-tab-pass" class="cx-small" style="font-weight:900;text-align:right;"></div><button class="cx-mini-btn" id="cx-user-toggle-pass">Server Secured</button></div></div>
                <div class="cx-row"><label>Status</label><div id="cx-user-tab-status" class="cx-small" style="font-weight:900;text-align:right;"></div></div>
                <div class="cx-row"><label>Created</label><div id="cx-user-tab-created" class="cx-small" style="font-weight:900;text-align:right;"></div></div>
              </div>
            </div>
          </div>

          <!-- Key -->
          <div id="cx-key" class="cx-panel">
            <div class="cx-grid">
              <div class="cx-card cx-wide">
                <p>Access Key</p>
                <div class="cx-row"><label>Current Key</label><div id="cx-current-key" class="cx-small" style="font-weight:900;text-align:right;">None</div></div>
                <div class="cx-row"><label>Expires</label><div id="cx-current-key-expiry" class="cx-small" style="font-weight:900;text-align:right;">None</div></div>
                <div id="cx-key-message" class="cx-small" style="margin-top:10px;">Keys are entered when an account is registered.</div>
              </div>
            </div>
          </div>

          <!-- Admin -->
          <div id="cx-admin-tab" class="cx-panel">
            <div class="cx-grid">
              <div class="cx-card cx-wide">
                <p>Admin Hub</p>
                <div class="cx-small">Manage users, bans, resets, and account monitoring.</div>
                <button class="cx-btn" id="cx-open-admin-tab">Open Admin Hub</button>
              </div>
            </div>
          </div>

          <!-- Key Generator -->
          <div id="cx-keygen" class="cx-panel">
            <div class="cx-grid">
              <div class="cx-card cx-wide">
                <p>Key Generator</p>
                <div class="cx-row"><label>Admin Secret</label><input class="cx-input" id="cx-keygen-secret" type="password" placeholder="admin secret" style="width:260px;"></div>
                <div class="cx-row"><label>Amount</label><input class="cx-input" id="cx-keygen-count" type="number" min="1" max="25" value="1"></div>
                <div class="cx-row"><label>Expires</label><select class="cx-select" id="cx-keygen-expiry"><option value="never">Never</option><option value="1d">1 Day</option><option value="7d">7 Days</option><option value="30d">30 Days</option><option value="90d">90 Days</option></select></div>
                <button class="cx-btn" id="cx-generate-key-btn">Generate Key</button>
                <div id="cx-keygen-output" class="cx-small" style="margin-top:10px;"></div>
              </div>
              <div class="cx-card cx-wide">
                <p>Recent Keys</p>
                <button class="cx-btn cx-btn-ghost" id="cx-refresh-keys-btn">Refresh Keys</button>
                <div id="cx-key-list" class="cx-small" style="margin-top:10px;"></div>
              </div>
            </div>
          </div>

          <!-- Appearance -->
          <div id="cx-appearance" class="cx-panel">
            <div class="cx-grid">
              <div class="cx-card cx-wide">
                <p>Background Logo</p>
                <div class="cx-logo-grid" id="cx-logo-grid">
                  ${Object.keys(svgLogos).map(key => `
                    <div class="cx-logo-btn${key === currentLogo ? ' active' : ''}" data-logo="${key}">
                      ${key !== 'none' ? svgLogos[key] : '<svg viewBox="0 0 24 24"><line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2"/><line x1="20" y1="4" x2="4" y2="20" stroke="currentColor" stroke-width="2"/></svg>'}
                      <span>${key}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
              <div class="cx-card cx-wide">
                <p>Theme Preset</p>
                <div class="cx-row">
                  <label>Preset</label>
                  <select id="cx-preset" class="cx-select">
                    ${Object.entries(themePresets).map(([k, v]) => `<option value="${k}">${v.name}</option>`).join('')}
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <button class="cx-btn cx-btn-ghost" id="cx-apply-preset">Apply Preset</button>
              </div>
              <div class="cx-card cx-wide">
                <p>Custom Colors</p>
                <div class="cx-row"><label>Accent</label><input type="color" class="cx-color" data-var="--cx-accent" value="#00aaff"></div>
                <div class="cx-row"><label>Accent 2</label><input type="color" class="cx-color" data-var="--cx-accent2" value="#00eeff"></div>
                <div class="cx-row"><label>Text</label><input type="color" class="cx-color" data-var="--cx-text" value="#f3f4f6"></div>
                <div class="cx-row"><label>Border</label><input type="color" class="cx-color" data-var="--cx-border" value="#1e293b"></div>
                <div class="cx-row"><label>Background</label><input type="color" class="cx-color" data-var="--cx-bg" value="#070b12"></div>
                <div class="cx-row"><label>Card</label><input type="color" class="cx-color" data-var="--cx-card" value="#0d1527"></div>
                <div class="cx-row"><label>Sidebar</label><input type="color" class="cx-color" data-var="--cx-side" value="#090f18"></div>
                <div class="cx-row"><label>Header</label><input type="color" class="cx-color" data-var="--cx-head" value="#0b1322"></div>
              </div>
            </div>
          </div>

          <!-- Settings -->
          <div id="cx-settings" class="cx-panel">
            <div class="cx-grid">
              <div class="cx-card cx-wide">
                <p>Tool Settings</p>
                <div class="cx-row cx-toggle-row"><label>Auto Visuals</label><label class="cx-switch"><input type="checkbox" id="cx-set-auto-visuals"><span class="cx-slider-toggle"></span></label></div>
                <div class="cx-row cx-toggle-row"><label>Click Through Boxes</label><label class="cx-switch"><input type="checkbox" id="cx-set-click-through"><span class="cx-slider-toggle"></span></label></div>
                <div class="cx-row cx-toggle-row"><label>Helper Popups</label><label class="cx-switch"><input type="checkbox" id="cx-set-toasts"><span class="cx-slider-toggle"></span></label></div>
                <div class="cx-row">
                  <label>Visual Opacity</label>
                  <div class="cx-range-wrap"><input class="cx-range" id="cx-set-opacity" type="range" min="0" max="35" step="1"><span class="cx-range-value" id="cx-set-opacity-value">10%</span></div>
                </div>
                <div class="cx-row">
                  <label>Visual Size</label>
                  <div class="cx-range-wrap"><input class="cx-range" id="cx-set-size" type="range" min="25" max="100" step="5"><span class="cx-range-value" id="cx-set-size-value">100%</span></div>
                </div>
                <div class="cx-row">
                  <label>Refresh Delay</label>
                  <div class="cx-range-wrap"><input class="cx-range" id="cx-set-delay" type="range" min="250" max="1500" step="50"><span class="cx-range-value" id="cx-set-delay-value">750ms</span></div>
                </div>
              </div>
              <div class="cx-card cx-wide">
                <p>UI Settings</p>
                <div class="cx-row cx-toggle-row"><label>Logout Confirmation</label><label class="cx-switch"><input type="checkbox" id="cx-set-logout-confirm"><span class="cx-slider-toggle"></span></label></div>
                <button class="cx-btn cx-btn-ghost" id="cx-reset-tool-settings">Reset Tool Settings</button>
                <button class="cx-btn cx-btn-ghost cx-danger-btn" id="cx-clear-local-settings">Clear Saved UI Data</button>
                <div class="cx-divider"></div>
                <div class="cx-small">Crypted UI v${VERSION}\nSettings save automatically.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(wrap);

  // ─── Auth Logic ───────────────────────────────────────────────────────────────
  const loginOverlay = document.getElementById('cx-login-overlay');
  const ui = document.getElementById('coolui');

  function showMain(user) {
    currentUser = typeof user === 'string' ? { username: user } : user;
    loginOverlay.style.display = 'none';
    ui.classList.add('visible');
    ui.classList.toggle('admin-user', currentUser.username?.toLowerCase() === 'admin');
    const disp = document.getElementById('cx-username-display');
    if (disp) disp.textContent = currentUser.username;
    updateUserTab(currentUser.username);
    loadCurrentKey();
    loadTheme();
    setLogo(currentLogo);
  }

  function doLogout() {
    hideLogoutConfirm();
    currentUser = null;
    clearSession();
    ui.classList.remove('admin-user');
    ui.classList.remove('visible');
    loginOverlay.style.display = 'flex';
    document.getElementById('cx-login-err').textContent = '';
    document.getElementById('cx-l-user').value = '';
    document.getElementById('cx-l-pass').value = '';
  }

  function hideLogoutConfirm() {
    document.getElementById('cx-logout-pop')?.classList.remove('open');
  }

  function askLogout() {
    if (!appSettings.logoutConfirm) {
      doLogout();
      return;
    }
    document.getElementById('cx-logout-pop')?.classList.add('open');
  }

  // Check existing session against the server before showing the UI.
  async function restoreExistingSession() {
    const existingSession = getSession();
    if (!existingSession?.id || !existingSession?.username) {
      if (existingSession?.username) clearSession();
      return;
    }

    try {
      const { user } = await apiRequest(`/api/users/${encodeURIComponent(existingSession.id)}/status`);
      if (user.banned) {
        clearSession();
        document.getElementById('cx-login-err').textContent = 'You are banned.';
        return;
      }
      if (user.key_expired) {
        clearSession();
        document.getElementById('cx-login-err').textContent = 'Your key expired.';
        return;
      }
      setSession(user);
      showMain(user);
    } catch (error) {
      clearSession();
    }
  }
  restoreExistingSession();

  // ─── Tab switching ────────────────────────────────────────────────────────────
  document.getElementById('tab-login').addEventListener('click', () => {
    document.getElementById('tab-login').classList.add('active');
    document.getElementById('tab-register').classList.remove('active');
    document.getElementById('cx-login-form').style.display = 'block';
    document.getElementById('cx-register-form').style.display = 'none';
  });
  document.getElementById('tab-register').addEventListener('click', () => {
    document.getElementById('tab-register').classList.add('active');
    document.getElementById('tab-login').classList.remove('active');
    document.getElementById('cx-login-form').style.display = 'none';
    document.getElementById('cx-register-form').style.display = 'block';
  });

  // ─── Login ────────────────────────────────────────────────────────────────────
  async function doLogin() {
    const username = document.getElementById('cx-l-user').value.trim();
    const password = document.getElementById('cx-l-pass').value;
    const err = document.getElementById('cx-login-err');
    err.textContent = '';

    if (!username || !password) { err.textContent = 'Fill in all fields.'; return; }
    try {
      const { user } = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
      });
      setSession(user);
      showMain(user);
    } catch (error) {
      err.textContent = error.message;
    }
  }

  document.getElementById('cx-login-btn').addEventListener('click', doLogin);
  document.getElementById('cx-l-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

  // ─── Register ─────────────────────────────────────────────────────────────────
  async function doRegister() {
    const username = document.getElementById('cx-r-user').value.trim();
    const password = document.getElementById('cx-r-pass').value;
    const password2 = document.getElementById('cx-r-pass2').value;
    const key = document.getElementById('cx-r-key').value.trim();
    const err = document.getElementById('cx-register-err');
    err.textContent = '';

    if (!username || !password || !password2) { err.textContent = 'Fill in all fields.'; return; }
    if (username.length < 3) { err.textContent = 'Username must be at least 3 characters.'; return; }
    if (password.length < 4) { err.textContent = 'Password must be at least 4 characters.'; return; }
    if (password !== password2) { err.textContent = 'Passwords do not match.'; return; }
    if (username.toLowerCase() !== 'admin' && !key) { err.textContent = 'Access key is required.'; return; }

    try {
      const { user } = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, key })
      });
      setSession(user);
      showMain(user);
    } catch (error) {
      err.textContent = error.message;
    }
  }

  document.getElementById('cx-register-btn').addEventListener('click', doRegister);
  document.getElementById('cx-r-pass2').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });
  document.getElementById('cx-r-key').addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

  // ─── Logout ───────────────────────────────────────────────────────────────────
  document.getElementById('cx-logout').addEventListener('click', askLogout);
  document.getElementById('cx-logout-cancel')?.addEventListener('click', hideLogoutConfirm);
  document.getElementById('cx-logout-confirm')?.addEventListener('click', () => {
    hideLogoutConfirm();
    doLogout();
  });

  async function checkCurrentUserBanStatus() {
    if (!currentUser?.id || !ui.classList.contains('visible')) return;
    try {
      const { user } = await apiRequest(`/api/users/${encodeURIComponent(currentUser.id)}/status`);
      currentUser = { ...currentUser, ...user };
      setSession(currentUser);
      if (user.banned) {
        doLogout();
        document.getElementById('cx-login-err').textContent = 'You were banned.';
      }
      if (user.key_expired) {
        doLogout();
        document.getElementById('cx-login-err').textContent = 'Your key expired.';
      }
    } catch (error) {
      // Keep the UI usable during brief Render wakeups/network hiccups.
    }
  }

  setInterval(checkCurrentUserBanStatus, 5000);

  // ─── Admin trigger ────────────────────────────────────────────────────────────
  const adminModal = document.getElementById('cx-admin-modal');

  document.getElementById('cx-admin-trigger').addEventListener('click', () => {
    adminModal.classList.add('open');
    document.getElementById('cx-admin-pass-section').style.display = 'block';
    document.getElementById('cx-admin-panel-section').classList.remove('visible');
    document.getElementById('cx-admin-pass-input').value = '';
    document.getElementById('cx-admin-err').textContent = '';
    document.getElementById('cx-admin-sub').textContent = 'Restricted access — enter admin password';
    setTimeout(() => document.getElementById('cx-admin-pass-input').focus(), 100);
  });

  document.getElementById('cx-admin-close').addEventListener('click', () => {
    adminModal.classList.remove('open');
  });

  // Enter admin pass
  async function tryAdminPass() {
    const val = document.getElementById('cx-admin-pass-input').value;
    if (!val) {
      document.getElementById('cx-admin-err').textContent = 'Enter admin password.';
      return;
    }
    adminToken = val;
    try {
      document.getElementById('cx-admin-pass-section').style.display = 'none';
      document.getElementById('cx-admin-sub').textContent = 'Manage registered users';
      document.getElementById('cx-admin-panel-section').classList.add('visible');
      await renderAdminPanel();
    } catch (error) {
      adminToken = '';
      document.getElementById('cx-admin-pass-section').style.display = 'block';
      document.getElementById('cx-admin-panel-section').classList.remove('visible');
      document.getElementById('cx-admin-err').textContent = error.message || 'Wrong password.';
      document.getElementById('cx-admin-pass-input').value = '';
    }
  }

  document.getElementById('cx-admin-pass-btn').addEventListener('click', tryAdminPass);
  document.getElementById('cx-admin-pass-input').addEventListener('keydown', e => { if (e.key === 'Enter') tryAdminPass(); });

  // ─── Admin Panel Render ───────────────────────────────────────────────────────
  async function renderAdminPanel() {
    const { users } = await apiRequest('/api/admin/users', {
      headers: authHeaders()
    });
    const banned = users.filter(u => u.banned).length;
    const active = users.length - banned;

    document.getElementById('cx-stat-total').textContent = users.length;
    document.getElementById('cx-stat-banned').textContent = banned;
    document.getElementById('cx-stat-active').textContent = active;
    showAdminListView();

    const tbody = document.getElementById('cx-user-tbody');
    const noUsers = document.getElementById('cx-no-users');

    if (users.length === 0) {
      tbody.innerHTML = '';
      noUsers.style.display = 'block';
      return;
    }
    noUsers.style.display = 'none';

    tbody.innerHTML = users.map((u, i) => {
      const date = new Date(u.created_at);
      const dateStr = formatDate(date);
      const statusBadge = u.banned
        ? `<span class="cx-status-badge banned">Banned</span>`
        : `<span class="cx-status-badge active">Active</span>`;
      const infoBtn = `<button class="cx-user-action info" data-id="${u.id}" data-idx="${i}" data-action="info">Info</button>`;
      const toggleBtn = u.banned
        ? `<button class="cx-user-action unban" data-id="${u.id}" data-idx="${i}" data-action="unban">Unban</button>`
        : `<button class="cx-user-action ban" data-id="${u.id}" data-idx="${i}" data-action="ban">Ban</button>`;
      return `
        <tr>
          <td style="font-weight:700">${escapeHtml(u.username)}</td>
          <td style="opacity:.6;font-size:12px">${dateStr}</td>
          <td>${statusBadge}</td>
          <td><div class="cx-user-actions">${infoBtn}${toggleBtn}<button class="cx-user-action delete" data-id="${u.id}" data-idx="${i}" data-action="delete">Del</button></div></td>
        </tr>
      `;
    }).join('');

    tbody.querySelectorAll('.cx-user-action').forEach(btn => {
      btn.addEventListener('click', async () => {
        const idx = parseInt(btn.dataset.idx);
        const action = btn.dataset.action;
        const user = users[idx];

        if (!user) return;

        if (action === 'info') {
          showAdminUserInfo(user);
          return;
        }

        try {
          if (action === 'ban' || action === 'unban') {
            await apiRequest(`/api/admin/users/${encodeURIComponent(user.id)}/ban`, {
              method: 'PATCH',
              headers: authHeaders(),
              body: JSON.stringify({ banned: action === 'ban' })
            });
            if (action === 'ban' && currentUser?.id === user.id) {
              doLogout();
              document.getElementById('cx-login-err').textContent = 'You were banned.';
              return;
            }
          } else if (action === 'delete') {
            await apiRequest(`/api/admin/users/${encodeURIComponent(user.id)}`, {
              method: 'DELETE',
              headers: authHeaders()
            });
            if (currentUser?.id === user.id) {
              doLogout();
              document.getElementById('cx-login-err').textContent = 'Account deleted.';
              return;
            }
          }
          await renderAdminPanel();
        } catch (error) {
          document.getElementById('cx-admin-sub').textContent = error.message;
        }
      });
    });
  }

  function showAdminListView() {
    document.getElementById('cx-admin-list-view')?.classList.remove('hidden');
    document.getElementById('cx-admin-user-view')?.classList.remove('visible');
    document.getElementById('cx-admin-sub').textContent = 'Manage registered users';
  }

  function showAdminUserInfo(user) {
    const status = user.banned ? 'Banned' : 'Active';
    const created = user.created_at ? formatDate(new Date(user.created_at)) : 'Unknown';
    const lastLogin = user.last_login ? formatDate(new Date(user.last_login)) : 'Never';
    const key = user.access_key;
    const keyExpired = key?.expires_at && new Date(key.expires_at).getTime() <= Date.now();
    const keyStatus = !key ? 'No key' : key.revoked ? 'Revoked' : keyExpired ? 'Expired' : 'Active';
    const keyCode = key?.key_code || 'None';
    const keyExpiry = key?.expires_at ? formatDate(new Date(key.expires_at)) : key ? 'Never' : 'None';
    const keyRedeemed = key?.redeemed_at ? formatDate(new Date(key.redeemed_at)) : key ? 'Not used' : 'None';
    document.getElementById('cx-admin-list-view')?.classList.add('hidden');
    document.getElementById('cx-admin-user-view')?.classList.add('visible');
    document.getElementById('cx-admin-sub').textContent = 'Viewing user details';
    document.getElementById('cx-admin-user-title').textContent = `${user.username} Info`;
    document.getElementById('cx-admin-user-info').innerHTML = `
      <div class="cx-admin-info-row"><span>Username</span><strong>${escapeHtml(user.username)}</strong></div>
      <div class="cx-admin-info-row"><span>Status</span><strong>${status}</strong></div>
      <div class="cx-admin-info-row"><span>Key</span><strong>${escapeHtml(keyCode)}</strong></div>
      <div class="cx-admin-info-row"><span>Key Status</span><strong>${escapeHtml(keyStatus)}</strong></div>
      <div class="cx-admin-info-row"><span>Key Expires</span><strong>${escapeHtml(keyExpiry)}</strong></div>
      <div class="cx-admin-info-row"><span>Key Used</span><strong>${escapeHtml(keyRedeemed)}</strong></div>
      <div class="cx-admin-info-row"><span>Created</span><strong>${created}</strong></div>
      <div class="cx-admin-info-row"><span>Last Login</span><strong>${lastLogin}</strong></div>
      <button class="cx-admin-btn cx-admin-back" id="cx-admin-reset-pass-btn">Reset Password</button>
    `;
    document.getElementById('cx-admin-reset-pass-btn')?.addEventListener('click', async () => {
      const newPassword = prompt(`New password for ${user.username}:`);
      if (!newPassword) return;
      try {
        await apiRequest(`/api/admin/users/${encodeURIComponent(user.id)}/reset-password`, {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ newPassword })
        });
        document.getElementById('cx-admin-sub').textContent = 'Password reset saved.';
      } catch (error) {
        document.getElementById('cx-admin-sub').textContent = error.message;
      }
    });
  }

  document.getElementById('cx-admin-back-btn')?.addEventListener('click', showAdminListView);
  function escapeHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatDate(date) {
    if (Number.isNaN(date.getTime())) return 'Unknown';
    return `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()}`;
  }

  function maskPassword(password) {
    return '*'.repeat(String(password || '').length);
  }

  function updateUserTab(username) {
    const user = currentUser?.username === username ? currentUser : getSession();
    if (!user) return;
    const name = document.getElementById('cx-user-tab-name');
    const pass = document.getElementById('cx-user-tab-pass');
    const toggle = document.getElementById('cx-user-toggle-pass');
    const status = document.getElementById('cx-user-tab-status');
    const created = document.getElementById('cx-user-tab-created');
    const password = 'Stored securely';
    if (name) name.textContent = user.username;
    if (pass) pass.textContent = password;
    if (toggle) toggle.textContent = 'Reset by admin';
    if (status) status.textContent = user.banned ? 'Banned' : 'Active';
    if (created) created.textContent = user.created_at ? formatDate(new Date(user.created_at)) : 'Unknown';
  }

  async function loadCurrentKey() {
    const el = document.getElementById('cx-current-key');
    const expiryEl = document.getElementById('cx-current-key-expiry');
    if (!el || !currentUser?.id) return;
    if (currentUser.username?.toLowerCase() === 'admin') {
      el.textContent = 'Admin account';
      if (expiryEl) expiryEl.textContent = 'Never';
      return;
    }
    try {
      const { key } = await apiRequest(`/api/users/${encodeURIComponent(currentUser.id)}/key`);
      el.textContent = key ? key.key_code : 'None';
      if (expiryEl) {
        const expired = key?.expires_at && new Date(key.expires_at).getTime() <= Date.now();
        expiryEl.textContent = !key ? 'None' : key.expires_at ? `${formatDate(new Date(key.expires_at))}${expired ? ' (Expired)' : ''}` : 'Never';
      }
    } catch {
      el.textContent = 'Unavailable';
      if (expiryEl) expiryEl.textContent = 'Unavailable';
    }
  }

  async function loadGeneratedKeys() {
    const list = document.getElementById('cx-key-list');
    const secret = document.getElementById('cx-keygen-secret').value.trim();
    if (!list) return;
    if (!secret) { list.textContent = 'Enter admin secret first.'; return; }
    adminToken = secret;
    try {
      const { keys } = await apiRequest('/api/admin/keys', { headers: authHeaders() });
      if (!keys.length) {
        list.textContent = 'No keys generated yet.';
        return;
      }
      list.innerHTML = keys.map(k => {
        const expired = k.expires_at && new Date(k.expires_at).getTime() <= Date.now();
        const state = k.revoked ? 'Revoked' : expired ? 'Expired' : k.assigned_user_id ? 'Used' : 'Unused';
        const expiry = k.expires_at ? `Expires ${formatDate(new Date(k.expires_at))}` : 'Never expires';
        return `<div class="cx-key-line"><span class="cx-key-code">${escapeHtml(k.key_code)}</span><span class="cx-key-muted">${state} | ${escapeHtml(expiry)}</span></div>`;
      }).join('');
    } catch (error) {
      list.textContent = error.message;
    }
  }

  async function generateKeys() {
    const secret = document.getElementById('cx-keygen-secret').value.trim();
    const count = parseInt(document.getElementById('cx-keygen-count').value, 10) || 1;
    const expiresIn = document.getElementById('cx-keygen-expiry').value;
    const output = document.getElementById('cx-keygen-output');
    if (!secret) { output.textContent = 'Enter admin secret first.'; return; }
    adminToken = secret;
    try {
      const { keys } = await apiRequest('/api/admin/keys', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ count, expiresIn, createdBy: currentUser?.username || 'Admin' })
      });
      output.innerHTML = keys.map(k => {
        const expiry = k.expires_at ? `Expires ${formatDate(new Date(k.expires_at))}` : 'Never expires';
        return `<div class="cx-key-line"><span class="cx-key-code">${escapeHtml(k.key_code)}</span><span class="cx-key-muted">New | ${escapeHtml(expiry)}</span></div>`;
      }).join('');
      await loadGeneratedKeys();
    } catch (error) {
      output.textContent = error.message;
    }
  }

  document.getElementById('cx-user-toggle-pass')?.addEventListener('click', () => {
    toast('Passwords are stored securely on the server.');
  });
  document.getElementById('cx-generate-key-btn')?.addEventListener('click', generateKeys);
  document.getElementById('cx-refresh-keys-btn')?.addEventListener('click', loadGeneratedKeys);
  document.getElementById('cx-open-admin-tab')?.addEventListener('click', () => {
    document.getElementById('cx-admin-trigger')?.click();
  });

  // ─── Drag ─────────────────────────────────────────────────────────────────────
  let dragging = false, dragX = 0, dragY = 0;
  const head = document.getElementById('cx-head');
  head.addEventListener('mousedown', e => {
    if (e.target.closest('.cx-ctrl')) return;
    dragging = true;
    dragX = e.clientX - ui.offsetLeft;
    dragY = e.clientY - ui.offsetTop;
  });
  document.addEventListener('mouseup', () => dragging = false);
  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    ui.style.left = `${e.clientX - dragX}px`;
    ui.style.top = `${e.clientY - dragY}px`;
  });

  // ─── Nav ──────────────────────────────────────────────────────────────────────
  document.querySelectorAll('.cx-nav').forEach(nav => {
    nav.addEventListener('click', () => {
      document.querySelectorAll('.cx-nav').forEach(n => n.classList.remove('active'));
      document.querySelectorAll('.cx-panel').forEach(p => p.classList.remove('active'));
      nav.classList.add('active');
      document.getElementById(nav.dataset.panel).classList.add('active');
    });
  });

  document.getElementById('cx-min').addEventListener('click', () => {
    ui.classList.toggle('minimized');
  });

  // ─── Logo picker ──────────────────────────────────────────────────────────────
  document.getElementById('cx-logo-grid').addEventListener('click', e => {
    const btn = e.target.closest('.cx-logo-btn');
    if (!btn) return;
    setLogo(btn.dataset.logo);
    toast(`Logo: ${btn.dataset.logo}`);
  });

  // ─── Theme ────────────────────────────────────────────────────────────────────
  function toast(msg, duration = 2000) {
    if (!appSettings.toasts) return;
    const t = document.getElementById('cx-toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), duration);
  }

  function loadSettings() {
    try {
      appSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_STORE) || '{}') };
    } catch {
      appSettings = { ...DEFAULT_SETTINGS };
    }
    appSettings.visualOpacity = clampNumber(appSettings.visualOpacity, 0, 35, DEFAULT_SETTINGS.visualOpacity);
    appSettings.visualSize = clampNumber(appSettings.visualSize, 25, 100, DEFAULT_SETTINGS.visualSize);
    appSettings.refreshDelay = clampNumber(appSettings.refreshDelay, 250, 1500, DEFAULT_SETTINGS.refreshDelay);
  }

  function saveSettings() {
    localStorage.setItem(SETTINGS_STORE, JSON.stringify(appSettings));
  }

  function syncSettingsControls() {
    const pairs = [
      ['cx-set-auto-visuals', 'autoVisuals'],
      ['cx-set-click-through', 'clickThrough'],
      ['cx-set-toasts', 'toasts'],
      ['cx-set-logout-confirm', 'logoutConfirm']
    ];
    pairs.forEach(([id, key]) => {
      const el = document.getElementById(id);
      if (el) el.checked = Boolean(appSettings[key]);
    });

    const opacity = document.getElementById('cx-set-opacity');
    const size = document.getElementById('cx-set-size');
    const delay = document.getElementById('cx-set-delay');
    if (opacity) opacity.value = appSettings.visualOpacity;
    if (size) size.value = appSettings.visualSize;
    if (delay) delay.value = appSettings.refreshDelay;
    [opacity, size, delay].forEach(updateRangeFill);
    document.getElementById('cx-set-opacity-value').textContent = `${appSettings.visualOpacity}%`;
    document.getElementById('cx-set-size-value').textContent = `${appSettings.visualSize}%`;
    document.getElementById('cx-set-delay-value').textContent = `${appSettings.refreshDelay}ms`;
  }

  function applySettings() {
    document.documentElement.style.setProperty('--cx-helper-pointer', appSettings.clickThrough ? 'none' : 'auto');
  }

  function updateRangeFill(el) {
    if (!el) return;
    const min = Number(el.min || 0);
    const max = Number(el.max || 100);
    const value = Number(el.value || 0);
    const pct = max > min ? ((value - min) / (max - min)) * 100 : 0;
    el.style.setProperty('--range-fill', `${Math.max(0, Math.min(100, pct))}%`);
  }

  function wireSettingToggle(id, key) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      appSettings[key] = el.checked;
      saveSettings();
      applySettings();
      if (key === 'autoVisuals') {
        if (!appSettings.autoVisuals) {
          clearGameVisuals();
          activeVisualHelper = '';
          resetVisualState();
        } else {
          refreshVisualOnNewGame();
        }
      }
      toast('Settings updated.');
    });
  }

  function wireSettingRange(id, key, suffix) {
    const el = document.getElementById(id);
    const value = document.getElementById(`${id}-value`);
    if (!el || !value) return;
    el.addEventListener('input', () => {
      appSettings[key] = Number(el.value);
      value.textContent = `${appSettings[key]}${suffix}`;
      updateRangeFill(el);
      saveSettings();
      applySettings();
      if (activeVisualHelper === 'mines') drawMinesVisual();
      if (activeVisualHelper === 'towers') drawTowersVisual();
    });
  }

  function applyTheme(vars, save = true, presetKey = 'custom') {
    applyVarsTo(ui, vars);
    applyVarsTo(wrap, vars);
    syncPickers(vars);
    const ps = document.getElementById('cx-preset');
    if (ps) ps.value = presetKey;
    if (save) {
      localStorage.setItem(THEME_STORE, JSON.stringify(vars));
      localStorage.setItem(THEME_PRESET_STORE, presetKey);
    }
  }

  function syncPickers(vars) {
    document.querySelectorAll('.cx-color').forEach(p => {
      const v = vars[p.dataset.var];
      if (v) p.value = v;
    });
  }

  function loadTheme() {
    const presetKey = localStorage.getItem(THEME_PRESET_STORE) || 'ocean';
    const saved = JSON.parse(localStorage.getItem(THEME_STORE) || '{}');
    const preset = themePresets[presetKey]?.vars || themePresets.ocean.vars;
    applyTheme({ ...preset, ...saved }, false, presetKey);
  }

  function setLogo(key) {
    currentLogo = key;
    localStorage.setItem('coolui_logo', key);
    const bg = document.getElementById('cx-bg-logo');
    if (bg) bg.innerHTML = svgLogos[key] || '';
    document.querySelectorAll('.cx-logo-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.logo === key);
    });
  }

  document.getElementById('cx-apply-preset').addEventListener('click', () => {
    const key = document.getElementById('cx-preset').value;
    if (key === 'custom') { toast('Pick a preset first.'); return; }
    applyTheme(themePresets[key].vars, true, key);
    toast(`Theme: ${themePresets[key].name}`);
  });

  document.querySelectorAll('.cx-color').forEach(picker => {
    picker.addEventListener('input', e => {
      const key = e.target.dataset.var;
      ui.style.setProperty(key, e.target.value);
      const saved = JSON.parse(localStorage.getItem(THEME_STORE) || '{}');
      saved[key] = e.target.value;
      localStorage.setItem(THEME_STORE, JSON.stringify(saved));
      localStorage.setItem(THEME_PRESET_STORE, 'custom');
      const ps = document.getElementById('cx-preset');
      if (ps) ps.value = 'custom';
    });
  });

  // ─── Mines / Towers helpers ──────────────────────────────────────────────────
  function isMinesPage() {
    return location.pathname.includes('/mines');
  }

  function isTowersPage() {
    return location.pathname.includes('/towers');
  }

  function clampNumber(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.floor(n)));
  }

  loadSettings();
  syncSettingsControls();
  applySettings();
  wireSettingToggle('cx-set-auto-visuals', 'autoVisuals');
  wireSettingToggle('cx-set-click-through', 'clickThrough');
  wireSettingToggle('cx-set-toasts', 'toasts');
  wireSettingToggle('cx-set-logout-confirm', 'logoutConfirm');
  wireSettingRange('cx-set-opacity', 'visualOpacity', '%');
  wireSettingRange('cx-set-size', 'visualSize', '%');
  wireSettingRange('cx-set-delay', 'refreshDelay', 'ms');
  document.getElementById('cx-reset-tool-settings')?.addEventListener('click', () => {
    appSettings = { ...DEFAULT_SETTINGS };
    saveSettings();
    syncSettingsControls();
    applySettings();
    if (activeVisualHelper === 'mines') showMinesVisualHelper({ force: true });
    if (activeVisualHelper === 'towers') showTowersVisualHelper({ force: true });
    toast('Tool settings reset.');
  });
  document.getElementById('cx-clear-local-settings')?.addEventListener('click', () => {
    if (!confirm('Clear saved theme, logo, and settings? Your account stays on the server.')) return;
    localStorage.removeItem(THEME_STORE);
    localStorage.removeItem(THEME_PRESET_STORE);
    localStorage.removeItem(SETTINGS_STORE);
    localStorage.removeItem('coolui_logo');
    appSettings = { ...DEFAULT_SETTINGS };
    loadTheme();
    setLogo('hex');
    syncSettingsControls();
    applySettings();
    toast('Saved UI data cleared.');
  });

  function formatPercent(value) {
    return `${value.toFixed(1)}%`;
  }

  function minesBoard() {
    const container = document.querySelector('[class*="minesGameContainer"]');
    return {
      container,
      tiles: container ? [...container.querySelectorAll('[class*="minesGameItem"]')] : []
    };
  }

  function getPageMineCount() {
    const groups = [...document.querySelectorAll('.customInput,.gameBetInput,[class*="formField"]')];
    for (const group of groups) {
      if (!/\bMines\b/i.test(group.innerText || '')) continue;
      const input = group.querySelector('input');
      const value = parseInt(input?.value, 10);
      if (Number.isFinite(value)) return value;
    }
    return null;
  }

  function isClosedMineTile(tile) {
    const label = tile.getAttribute('aria-label') || '';
    const cls = String(tile.className || '').toLowerCase();
    const revealed = cls.includes('minesgameitemwin') || cls.includes('minesgameitemothermine');
    return /^Open mine/i.test(label) && !tile.disabled && !revealed;
  }

  function minesStatsFromPage(fallbackMines, fallbackClicks) {
    const board = minesBoard();
    if (!board.tiles.length) return null;

    const totalTiles = board.tiles.length;
    const mines = clampNumber(getPageMineCount() ?? fallbackMines, 1, Math.max(1, totalTiles - 1), fallbackMines);
    const closedTiles = board.tiles.filter(isClosedMineTile).length || totalTiles;
    const openedTiles = Math.max(0, totalTiles - closedTiles);
    const tilesLeft = Math.max(1, totalTiles - openedTiles);
    const safeTilesTotal = totalTiles - mines;
    const safeTilesLeft = Math.max(0, safeTilesTotal - openedTiles);
    const plannedClicks = clampNumber(fallbackClicks, 1, Math.max(1, tilesLeft), fallbackClicks);
    const nextSafeChance = totalTiles ? (safeTilesLeft / tilesLeft) * 100 : 0;
    const nextBombChance = totalTiles ? ((tilesLeft - safeTilesLeft) / tilesLeft) * 100 : 0;
    let surviveChance = 1;

    for (let i = 0; i < plannedClicks; i++) {
      const safe = safeTilesLeft - i;
      const total = tilesLeft - i;
      if (safe <= 0 || total <= 0) {
        surviveChance = 0;
        break;
      }
      surviveChance *= safe / total;
    }

    return {
      totalTiles,
      mines,
      openedTiles,
      tilesLeft,
      safeTilesLeft,
      plannedClicks,
      nextSafeChance,
      nextBombChance,
      surviveChance: surviveChance * 100
    };
  }

  function getTowersTiles(row) {
    const containers = [...row.querySelectorAll('[class*="towersGameRowContainer"]')].filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10;
    });
    if (containers.length >= 3) return containers;

    const buttons = [...row.querySelectorAll('[class*="towersGameButton"]')].filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10;
    });
    if (buttons.length >= 3) return buttons;

    return [...row.children].filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 10 && rect.height > 10;
    });
  }

  function findTowersGrid() {
    const game = document.querySelector('[class*="towersGame"]');
    if (!game) return [];

    const rows = [...game.querySelectorAll('[class*="towersGameRow"]')]
      .filter(row => {
        const rect = row.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0 && rect.bottom >= 0 && rect.top <= innerHeight;
      })
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);

    return rows.map(row => getTowersTiles(row)
      .slice(0, 3)
      .sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left))
      .filter(row => row.length >= 3);
  }

  function clearGameVisuals() {
    document.querySelectorAll('.cx-helper-outline').forEach(el => el.remove());
  }

  let activeVisualHelper = '';
  const visualState = {
    mines: { indexes: [], lastOpened: 0 },
    towers: { indexes: [], lastOpened: 0, lastRows: 0 }
  };

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function randomItems(items, amount) {
    const pool = [...items];
    const picks = [];
    while (pool.length && picks.length < amount) {
      const index = Math.floor(Math.random() * pool.length);
      picks.push(pool.splice(index, 1)[0]);
    }
    return picks;
  }

  function mineOpenedCount() {
    const board = minesBoard();
    if (!board.tiles.length) return 0;
    return board.tiles.filter(tile => !isClosedMineTile(tile)).length;
  }

  function towerTileLooksOpened(tile) {
    const cls = String(tile?.className || '').toLowerCase();
    const aria = String(tile?.getAttribute?.('aria-label') || '').toLowerCase();
    const state = `${cls} ${aria}`;
    return tile?.disabled ||
      tile?.getAttribute?.('disabled') !== null ||
      /(active|selected|opened|win|loss|lose|cash|current|disabled|revealed)/.test(state);
  }

  function towersOpenedCount() {
    const grid = findTowersGrid();
    return grid.reduce((total, row) => total + row.filter(towerTileLooksOpened).length, 0);
  }

  function resetVisualState(kind) {
    if (!kind || kind === 'mines') {
      visualState.mines.indexes = [];
      visualState.mines.lastOpened = 0;
    }
    if (!kind || kind === 'towers') {
      visualState.towers.indexes = [];
      visualState.towers.lastOpened = 0;
      visualState.towers.lastRows = 0;
    }
  }

  function addVisualBox(rect, kind) {
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const uiStyles = getComputedStyle(document.getElementById('coolui') || document.documentElement);
    const accent = uiStyles.getPropertyValue('--cx-accent').trim() || '#00aaff';
    const glow = uiStyles.getPropertyValue('--cx-glow').trim() || 'rgba(0,170,255,.35)';
    const opacity = Math.max(0, Math.min(0.35, appSettings.visualOpacity / 100));
    const box = document.createElement('div');
    box.className = `cx-helper-outline ${kind || ''}`.trim();
    box.style.left = '0';
    box.style.top = '0';
    box.style.setProperty('--cx-helper-x', `${rect.left}px`);
    box.style.setProperty('--cx-helper-y', `${rect.top}px`);
    box.style.width = `${rect.width}px`;
    box.style.height = `${rect.height}px`;
    box.style.borderColor = accent;
    box.style.boxShadow = `0 0 7px ${accent}, 0 0 18px ${glow}, inset 0 0 8px rgba(255,255,255,.08)`;
    box.style.background = kind === 'mine' ? `rgba(0,170,255,${opacity})` : `rgba(57,255,20,${opacity})`;
    document.body.appendChild(box);
  }

  function drawMinesVisual() {
    clearGameVisuals();
    const board = minesBoard();
    let count = 0;
    for (const index of visualState.mines.indexes) {
      const tile = board.tiles[index];
      if (!tile) continue;
      const rect = tile.getBoundingClientRect();
      if (rect.width <= 25 || rect.height <= 25 || rect.bottom < 0 || rect.top > innerHeight) continue;
      const scale = appSettings.visualSize / 100;
      const size = Math.max(28, Math.min(64, rect.width * 0.72 * scale, rect.height * 0.72 * scale));
      addVisualBox({
        left: rect.left + (rect.width - size) / 2,
        top: rect.top + (rect.height - size) / 2,
        width: size,
        height: size
      }, 'mine');
      count++;
    }
    return count;
  }

  function showMinesVisualHelper(options = {}) {
    clearGameVisuals();
    activeVisualHelper = 'mines';
    const out = document.getElementById('cx-mines-helper-output');
    if (!isMinesPage()) {
      if (out) out.textContent = 'Open Mines first to show the visual helper.';
      return;
    }

    const board = minesBoard();
    if (!board.container || !board.tiles.length) {
      if (out) out.textContent = 'Mines board not found yet.';
      return;
    }

    const tilesInput = document.getElementById('cx-mines-clicks');
    const tilesToShow = clampNumber(tilesInput?.value, 1, 24, 3);
    if (tilesInput) tilesInput.value = tilesToShow;

    if (options.force || visualState.mines.indexes.length !== tilesToShow || visualState.mines.indexes.some(index => !board.tiles[index])) {
      const visible = board.tiles
        .map((tile, index) => ({ tile, index }))
        .filter(item => {
          const rect = item.tile.getBoundingClientRect();
          return rect.width > 25 && rect.height > 25 && rect.bottom >= 0 && rect.top <= innerHeight && isClosedMineTile(item.tile);
        });
      const picks = randomItems(visible.length ? visible : board.tiles.map((tile, index) => ({ tile, index })), tilesToShow);
      visualState.mines.indexes = picks.map(pick => pick.index);
    }

    const count = drawMinesVisual();
    visualState.mines.lastOpened = mineOpenedCount();

    updateMinesHelper();
    if (out) out.textContent += `\nVisual helper: randomly outlined ${count} tile${count === 1 ? '' : 's'}.`;
  }

  function drawTowersVisual() {
    clearGameVisuals();
    const grid = findTowersGrid();
    if (!grid.length) return 0;
    const rowsInput = document.getElementById('cx-towers-rows');
    const rowsToShow = Math.min(clampNumber(rowsInput?.value, 1, 8, 8), grid.length);
    if (rowsInput) rowsInput.value = rowsToShow;

    let count = 0;
    for (let rowIndex = 0; rowIndex < rowsToShow; rowIndex++) {
      const row = grid[rowIndex];
      const tileIndex = visualState.towers.indexes[rowIndex] ?? 0;
      const tile = row[Math.min(tileIndex, row.length - 1)];
      if (!tile) continue;
      const rect = tile.getBoundingClientRect();
      const scale = appSettings.visualSize / 100;
      const width = Math.max(30, Math.min(96, rect.width * scale));
      const height = Math.max(18, Math.min(40, rect.height * scale));
      addVisualBox({
        left: rect.left + (rect.width - width) / 2,
        top: rect.top + (rect.height - height) / 2,
        width,
        height
      }, 'tower');
      count++;
    }
    return count;
  }

  function showTowersVisualHelper(options = {}) {
    clearGameVisuals();
    activeVisualHelper = 'towers';
    const out = document.getElementById('cx-towers-helper-output');
    if (!isTowersPage()) {
      if (out) out.textContent = 'Open Towers first to show the visual helper.';
      return;
    }

    const grid = findTowersGrid();
    if (!grid.length) {
      if (out) out.textContent = 'Towers grid not found yet.';
      return;
    }

    const rowsInput = document.getElementById('cx-towers-rows');
    const rowsToShow = Math.min(clampNumber(rowsInput?.value, 1, 8, 8), grid.length);
    if (rowsInput) rowsInput.value = rowsToShow;

    if (options.force || visualState.towers.indexes.length !== rowsToShow) {
      visualState.towers.indexes = grid.slice(0, rowsToShow).map(row => Math.floor(Math.random() * row.length));
    }

    const count = drawTowersVisual();
    visualState.towers.lastOpened = towersOpenedCount();
    visualState.towers.lastRows = grid.length;

    updateTowersHelper();
    if (out) out.textContent += `\nVisual helper: randomly outlined 1 tile per row (${count} total).`;
  }

  function calculateMinesOdds(mines, plannedClicks) {
    let safeRemaining = 25 - mines;
    let closedRemaining = 25;
    let surviveChance = 1;

    for (let i = 0; i < plannedClicks; i++) {
      if (safeRemaining <= 0 || closedRemaining <= 0) {
        surviveChance = 0;
        break;
      }
      surviveChance *= safeRemaining / closedRemaining;
      safeRemaining--;
      closedRemaining--;
    }

    const nextSafeChance = ((25 - mines) / 25) * 100;
    return {
      nextSafeChance,
      nextBombChance: 100 - nextSafeChance,
      surviveChance: surviveChance * 100
    };
  }

  function updateMinesHelper() {
    const clicksInput = document.getElementById('cx-mines-clicks');
    const out = document.getElementById('cx-mines-helper-output');
    const chip = document.getElementById('cx-mines-chip');
    if (!clicksInput || !out) return;

    const tilesToShow = clampNumber(clicksInput.value, 1, 24, 3);
    clicksInput.value = tilesToShow;

    const board = isMinesPage() ? minesBoard() : null;
    const closed = board?.tiles?.filter(isClosedMineTile).length ?? 0;
    if (chip) {
      chip.textContent = isMinesPage() ? 'Ready' : 'Idle';
      chip.classList.toggle('active', isMinesPage());
    }
    out.textContent =
      `${isMinesPage() ? 'Mines detected' : 'Open Mines first'}\n` +
      `${board?.tiles?.length ? `Board: ${board.tiles.length} tiles | Closed: ${closed}\n` : ''}` +
      `Will mark ${tilesToShow} random tile${tilesToShow === 1 ? '' : 's'}.`;
  }

  function updateTowersHelper() {
    const rowsInput = document.getElementById('cx-towers-rows');
    const out = document.getElementById('cx-towers-helper-output');
    const chip = document.getElementById('cx-towers-chip');
    if (!rowsInput || !out) return;

    const liveRows = isTowersPage() ? findTowersGrid().length : 0;
    const rows = liveRows || clampNumber(rowsInput.value, 1, 8, 8);
    const rowsToShow = Math.min(clampNumber(rowsInput.value, 1, 8, 8), rows);
    rowsInput.value = rowsToShow;
    if (chip) {
      chip.textContent = isTowersPage() ? 'Ready' : 'Idle';
      chip.classList.toggle('active', isTowersPage());
    }

    out.textContent =
      `${isTowersPage() ? 'Towers detected' : 'Open Towers first'}\n` +
      `${liveRows ? `Rows found: ${liveRows}\n` : ''}` +
      `Will mark ${rowsToShow} random row${rowsToShow === 1 ? '' : 's'}.`;
  }

  function refreshCurrentGameHelper() {
    if (isMinesPage()) {
      showMinesVisualHelper({ force: true });
      toast('Mines visual refreshed.');
      return;
    }
    if (isTowersPage()) {
      showTowersVisualHelper({ force: true });
      toast('Towers visual refreshed.');
      return;
    }
    updateMinesHelper();
    updateTowersHelper();
    toast('Open Mines or Towers first.');
  }

  function refreshVisualOnNewGame() {
    if (!appSettings.autoVisuals) return;

    if (!activeVisualHelper) {
      if (isMinesPage()) {
        showMinesVisualHelper({ force: true });
        return;
      }
      if (isTowersPage()) {
        showTowersVisualHelper({ force: true });
      }
      return;
    }

    if (activeVisualHelper === 'mines') {
      if (!isMinesPage()) {
        clearGameVisuals();
        activeVisualHelper = '';
        resetVisualState('mines');
        return;
      }
      const opened = mineOpenedCount();
      visualState.mines.lastOpened = opened;
      return;
    }

    if (activeVisualHelper === 'towers') {
      if (!isTowersPage()) {
        clearGameVisuals();
        activeVisualHelper = '';
        resetVisualState('towers');
        return;
      }
      const grid = findTowersGrid();
      const opened = towersOpenedCount();
      if (visualState.towers.lastRows && grid.length !== visualState.towers.lastRows) {
        showTowersVisualHelper({ force: true });
        return;
      }
      visualState.towers.lastOpened = opened;
      visualState.towers.lastRows = grid.length;
    }
  }

  let visualFramePending = false;
  function redrawActiveVisual() {
    if (activeVisualHelper === 'mines' && isMinesPage()) drawMinesVisual();
    if (activeVisualHelper === 'towers' && isTowersPage()) drawTowersVisual();
  }

  function scheduleVisualRedraw() {
    if (!activeVisualHelper || visualFramePending) return;
    visualFramePending = true;
    requestAnimationFrame(() => {
      visualFramePending = false;
      redrawActiveVisual();
    });
  }

  window.addEventListener('scroll', scheduleVisualRedraw, { passive: true, capture: true });
  document.addEventListener('scroll', scheduleVisualRedraw, { passive: true, capture: true });
  window.addEventListener('resize', scheduleVisualRedraw, { passive: true });

  let gameStartVisualTimer = null;

  function rerollVisualAfterGameStart(kind) {
    if (!appSettings.autoVisuals) return;
    clearTimeout(gameStartVisualTimer);
    gameStartVisualTimer = setTimeout(() => {
      if (kind === 'mines' && isMinesPage()) showMinesVisualHelper({ force: true });
      if (kind === 'towers' && isTowersPage()) showTowersVisualHelper({ force: true });
    }, appSettings.refreshDelay);
  }

  function isGameStartClick(target) {
    if (!target || target.closest?.('#coolui, #cx-login-overlay, #cx-toast, #cx-admin-modal')) return false;
    if (target.closest?.('[class*="minesGameItem"], [class*="towersGameRow"], [class*="towersGameButton"], [class*="towersGameRowContainer"]')) return false;
    const control = target.closest?.('button, [role="button"], [class*="Button"], [class*="button"]');
    if (!control) return false;
    const text = String(control.textContent || '').replace(/\s+/g, ' ').trim().toLowerCase();
    if (!text || /(cash|withdraw|deposit|cancel|close|settings|auto|half|double)/.test(text)) return false;
    return /\b(bet|start|play|create)\b/.test(text);
  }

  document.addEventListener('click', event => {
    if (!isGameStartClick(event.target)) return;
    if (isMinesPage()) rerollVisualAfterGameStart('mines');
    if (isTowersPage()) rerollVisualAfterGameStart('towers');
  }, true);

  document.getElementById('cx-mines-calc-btn')?.addEventListener('click', updateMinesHelper);
  document.getElementById('cx-mines-visual-btn')?.addEventListener('click', showMinesVisualHelper);
  document.getElementById('cx-towers-calc-btn')?.addEventListener('click', updateTowersHelper);
  document.getElementById('cx-towers-visual-btn')?.addEventListener('click', showTowersVisualHelper);
  document.getElementById('cx-mines-clicks')?.addEventListener('input', () => {
    updateMinesHelper();
    if (isMinesPage()) showMinesVisualHelper({ force: true });
  });
  document.getElementById('cx-towers-rows')?.addEventListener('input', () => {
    updateTowersHelper();
    if (isTowersPage()) showTowersVisualHelper({ force: true });
  });
  document.querySelectorAll('.cx-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const step = Number(btn.dataset.step || 0);
      const min = Number(input.min || 0);
      const max = Number(input.max || 999);
      input.value = clampNumber(Number(input.value) + step, min, max, min);
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
  updateMinesHelper();
  updateTowersHelper();

  // Bloxflip balance sync.
  let lastKnownBalance = null;
  let balanceObserver = null;
  let bodyBalanceObserver = null;

  function parseBalanceText(text) {
    const cleaned = String(text || '').replace(/,/g, '').trim();
    const match = cleaned.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;
    const value = Number(match[0]);
    return Number.isFinite(value) ? value : null;
  }

  function findBloxflipBalanceElement() {
    const containers = [
      ...document.querySelectorAll('[class*="headerUserBalance"], [class*="headerUserContent"], [class*="headerUser"]')
    ];

    for (const container of containers) {
      const candidates = [container, ...container.querySelectorAll('span, div, button')];
      for (const candidate of candidates) {
        const value = parseBalanceText(candidate.textContent);
        if (value !== null && candidate.textContent.trim().length <= 30) return candidate;
      }
    }

    return null;
  }

  function renderBloxflipBalance(value, found) {
    const el = document.getElementById('cx-balance');
    const sub = document.getElementById('cx-balance-sub');
    if (!el || !sub) return;

    if (value === null) {
      el.textContent = 'Hidden';
      sub.textContent = found ? 'Could not read balance' : 'Open Bloxflip header';
      return;
    }

    const previous = lastKnownBalance;
    lastKnownBalance = value;
    el.textContent = `R$ ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (previous === null || previous === value) {
      sub.textContent = 'Synced with Bloxflip';
      return;
    }

    const diff = value - previous;
    const sign = diff > 0 ? '+' : '';
    sub.textContent = `${sign}${diff.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} since last update`;
  }

  function syncBloxflipBalance() {
    const source = findBloxflipBalanceElement();
    const value = source ? parseBalanceText(source.textContent) : null;
    renderBloxflipBalance(value, Boolean(source));

    if (source && (!balanceObserver || balanceObserver.target !== source)) {
      balanceObserver?.disconnect();
      balanceObserver = new MutationObserver(syncBloxflipBalance);
      balanceObserver.observe(source, { characterData: true, childList: true, subtree: true });
      balanceObserver.target = source;
    }
  }

  bodyBalanceObserver = new MutationObserver(mutations => {
    const onlyCryptedUiChanged = mutations.every(mutation => {
      const node = mutation.target.nodeType === Node.ELEMENT_NODE ? mutation.target : mutation.target.parentElement;
      return node?.closest?.('#coolui, #cx-login-overlay, #cx-toast, #cx-admin-modal');
    });
    if (onlyCryptedUiChanged) return;

    clearTimeout(bodyBalanceObserver.timer);
    bodyBalanceObserver.timer = setTimeout(syncBloxflipBalance, 100);
  });
  bodyBalanceObserver.observe(document.body, { childList: true, subtree: true });
  syncBloxflipBalance();
  setInterval(syncBloxflipBalance, 1000);

  // ─── Uptime ───────────────────────────────────────────────────────────────────
  const startTime = Date.now();
  let lastHelperPath = location.pathname;
  function formatUptime(ms) {
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    return `${Math.floor(m / 60)}h ${m % 60}m`;
  }
  setInterval(() => {
    const el = document.getElementById('cx-uptime');
    const pg = document.getElementById('cx-page');
    if (el) el.textContent = formatUptime(Date.now() - startTime);
    if (pg) pg.textContent = location.hostname + location.pathname;
    if (location.pathname !== lastHelperPath) {
      lastHelperPath = location.pathname;
      clearGameVisuals();
      activeVisualHelper = '';
      resetVisualState();
    }
    updateMinesHelper();
    updateTowersHelper();
    refreshVisualOnNewGame();
  }, 1000);

})();






