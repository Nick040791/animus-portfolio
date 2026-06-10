// make-screenshot.js — generate a styled terminal PNG from raw ANSI output.
//
// Usage:
//   node make-screenshot.js <input.txt> <output.png> [title]
//
// Reads a file containing ANSI escape codes (produced by `ts-node src/cli.ts demo`
// with FORCE_COLOR=1) and renders it to a styled PNG that looks like a real
// terminal window. Uses a built-in ANSI-to-HTML converter (no deps) and the
// headless Edge browser for the screenshot.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const inputFile = process.argv[2];
const outputFile = process.argv[3];
const title = process.argv[4] || 'animus';

if (!inputFile || !outputFile) {
  console.error('usage: node make-screenshot.js <input.txt> <output.png> [title]');
  process.exit(1);
}

// ---------- ANSI -> HTML ----------
// Supports the common SGR codes: colors, bold, dim, italic, underline, reset.
const ANSI_RE = /\x1b\[((?:\d+;?)+)m/g;

function ansiToHtml(input) {
  // We accumulate spans and a "current style" state.
  let html = '';
  let styleStack = [];
  let i = 0;
  let match;
  let lastIdx = 0;
  const state = { fg: null, bg: null, bold: false, dim: false, italic: false, underline: false, inverse: false };

  function pushStyle(s) {
    styleStack.push(s);
    return renderSpan();
  }
  function renderSpan() {
    if (!styleStack.length) return '';
    return `<span style="${styleStack.join(';')}">`;
  }

  // Replace each ANSI SGR with a span close/open.
  // Simpler approach: walk the string, build a state, emit a span on every
  // change.
  const parts = [];
  let cursor = 0;
  let cur = { ...state };
  function styleToCss(s) {
    const css = [];
    if (s.fg) css.push(`color:${s.fg}`);
    if (s.bg) css.push(`background:${s.bg}`);
    if (s.bold) css.push('font-weight:700');
    if (s.dim) css.push('opacity:0.6');
    if (s.italic) css.push('font-style:italic');
    if (s.underline) css.push('text-decoration:underline');
    if (s.inverse) css.push('filter:invert(1)');
    return css.join(';');
  }
  function emit(text) {
    if (!text) return;
    const css = styleToCss(cur);
    parts.push(css ? `<span style="${css}">${escapeHtml(text)}</span>` : escapeHtml(text));
  }

  let s = input;
  while ((match = ANSI_RE.exec(s)) !== null) {
    if (match.index > cursor) emit(s.substring(cursor, match.index));
    const codes = match[1].split(';').map((c) => Number(c) || 0);
    for (const code of codes) {
      if (code === 0) cur = { fg: null, bg: null, bold: false, dim: false, italic: false, underline: false, inverse: false };
      else if (code === 1) cur.bold = true;
      else if (code === 2) cur.dim = true;
      else if (code === 3) cur.italic = true;
      else if (code === 4) cur.underline = true;
      else if (code === 7) cur.inverse = true;
      else if (code === 22) { cur.bold = false; cur.dim = false; }
      else if (code === 23) cur.italic = false;
      else if (code === 24) cur.underline = false;
      else if (code === 27) cur.inverse = false;
      else if (code >= 30 && code <= 37) cur.fg = BASIC_COLORS[code - 30];
      else if (code === 38) {
        // skip extended color for simplicity
      } else if (code === 39) cur.fg = null;
      else if (code >= 40 && code <= 47) cur.bg = BASIC_COLORS[code - 40];
      else if (code === 49) cur.bg = null;
      else if (code >= 90 && code <= 97) cur.fg = BRIGHT_COLORS[code - 90];
      else if (code >= 100 && code <= 107) cur.bg = BRIGHT_COLORS[code - 100];
    }
    cursor = match.index + match[0].length;
  }
  if (cursor < s.length) emit(s.substring(cursor));
  return parts.join('');
}

const BASIC_COLORS = ['#1d1d1d', '#e74c3c', '#2ecc71', '#f1c40f', '#3498db', '#9b59b6', '#1abc9c', '#ecf0f1'];
const BRIGHT_COLORS = ['#666666', '#ff6b5b', '#5ffb87', '#ffe25f', '#5fc7ff', '#d27bff', '#5fffea', '#ffffff'];

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

// Build HTML
const raw = fs.readFileSync(inputFile, 'utf8');
// Skip the noisy "npm >" wrapper lines. Heuristic: drop lines that start with
// ">" or contain "ts-node/dist/bin.js" or "C:\\Program Files" or end with the
// "at createTSError" stack.
const cleaned = raw
  .split(/\r?\n/)
  .filter((line) => {
    const t = line.trim();
    if (t.startsWith('> ')) return false;
    if (t.includes('node_modules')) return false;
    if (t.includes('Program Files')) return false;
    if (t.startsWith('at ')) return false;
    if (t.startsWith('+ ')) return false;
    if (t === 'return new TSError(diagnosticText, diagnosticCodes, diagnostics);') return false;
    if (t === '^') return false;
    return true;
  })
  .join('\n');

const inner = ansiToHtml(cleaned);

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { margin: 0; padding: 0; background: #1a1a1a; font-family: ui-monospace, "SF Mono", "Cascadia Mono", "Consolas", "Liberation Mono", monospace; }
  .terminal {
    width: 1100px;
    box-sizing: border-box;
    padding: 22px 28px;
    background: #0a0e14;
    color: #d6d6d6;
    font-size: 16px;
    line-height: 1.45;
    white-space: pre;
    overflow: hidden;
  }
  .titlebar {
    background: #1e1e1e;
    color: #aaa;
    font-size: 13px;
    padding: 8px 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .titlebar .dot { width: 12px; height: 12px; border-radius: 50%; }
  .dot.r { background: #ff5f56; }
  .dot.y { background: #ffbd2e; }
  .dot.g { background: #27c93f; }
  .titlebar .name { margin-left: 12px; }
</style>
</head>
<body>
<div class="titlebar">
  <span class="dot r"></span><span class="dot y"></span><span class="dot g"></span>
  <span class="name">${escapeHtml(title)} — bash — 120×30</span>
</div>
<div class="terminal">${inner}</div>
</body>
</html>`;

const htmlPath = path.join(path.dirname(outputFile), path.basename(outputFile, '.png') + '.html');
fs.writeFileSync(htmlPath, html);

// Render to PNG using headless Edge
const edge = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
try {
  const htmlPathAbs = path.resolve(htmlPath);
  const outputFileAbs = path.resolve(outputFile);
  execFileSync(edge, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--hide-scrollbars',
    '--default-background-color=00000000',
    `--screenshot=${outputFileAbs}`,
    `--window-size=1100,${computeHeight(cleaned, 16)}`,
    `file:///${htmlPathAbs.replace(/\\/g, '/')}`
  ], { stdio: 'inherit' });
} catch (err) {
  console.error('Edge failed:', err.message);
  process.exit(1);
}

function computeHeight(text, fontSize) {
  // Roughly: 1.45 line height, plus titlebar ~32, plus terminal padding 22+22=44
  const lines = text.split('\n').length;
  const height = 32 + 44 + Math.ceil(lines * fontSize * 1.45);
  return Math.min(2400, Math.max(400, height));
}

console.log(`OK: ${outputFile} (HTML: ${htmlPath})`);
