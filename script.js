const ROWS = [12, 11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
const COLS = 80;


const code = { " ": [] };
"0123456789".split("").forEach(d => code[d] = [+d]);
"ABCDEFGHI".split("").forEach((c, i) => code[c] = [12, i + 1]);
"JKLMNOPQR".split("").forEach((c, i) => code[c] = [11, i + 1]);
"STUVWXYZ".split("").forEach((c, i) => code[c] = [0, i + 2]);
Object.assign(code, {
  "&": [12], "-": [11], "/": [0, 1], ".": [12, 3, 8], ",": [0, 3, 8],
  "$": [11, 3, 8], "*": [11, 4, 8], "+": [12, 6, 8], "=": [6, 8],
  "(": [12, 5, 8], ")": [11, 5, 8], "'": [5, 8]
});
const keyOf = rows => [...rows].sort((a, b) => a - b).join();
const reverse = {};
for (const [ch, rs] of Object.entries(code)) reverse[keyOf(rs)] = ch;

const state = Array.from({ length: COLS }, () => new Set());
const columns = Array.from({ length: COLS }, () => []);
const card = document.getElementById("card");
const input = document.getElementById("txt");
const info = document.getElementById("info");
const out = document.getElementById("out");
const INFO_DEFAULT = info.textContent;

function el(tag, cls, html) {
  const e = document.createElement(tag);
  e.className = cls; e.innerHTML = html; return e;
}


const print = el("div", "print", "<span></span>" + "<span></span>".repeat(COLS));
const nums = el("div", "nums", "<span></span>" + Array.from({ length: COLS }, (_, i) =>
  `<span>${(i + 1) % 5 === 0 || i === 0 ? i + 1 : ""}</span>`).join(""));
card.append(print, nums);

ROWS.forEach(r => {
  const row = el("div", "row", `<span class="label">${r}</span>`);
  for (let c = 0; c < COLS; c++) {
    const b = el("button", "hole", r);
    b.type = "button";
    b.dataset.r = r; b.dataset.c = c;
    b.setAttribute("aria-label", `Fila ${r}, columna ${c + 1}`);
    b.onclick = () => { toggle(c, r); draw(); showInfo(c); };
    b.onmouseenter = b.onfocus = () => highlight(c);
    row.append(b);
    columns[c].push(b);
  }
  card.append(row);
});
card.addEventListener("mouseleave", () => highlight(-1));

function toggle(c, r) { state[c].has(r) ? state[c].delete(r) : state[c].add(r); }

function punch(text) {
  state.forEach(s => s.clear());
  [...text.toUpperCase()].slice(0, COLS).forEach((ch, c) =>
    (code[ch] || []).forEach(r => state[c].add(r)));
}

function charAt(c) {
  if (!state[c].size) return " ";
  return reverse[keyOf(state[c])] ?? "?";
}

let current = -1;
function highlight(c) {
  if (current >= 0) columns[current].forEach(b => b.classList.remove("hl"));
  current = c;
  if (c >= 0) columns[c].forEach(b => b.classList.add("hl"));
  showInfo(c);
}

function showInfo(c) {
  if (c < 0) { info.textContent = INFO_DEFAULT; return; }
  const rows = ROWS.filter(r => state[c].has(r));
  const ch = charAt(c);
  if (!rows.length) info.textContent = `Columna ${c + 1}: sin huecos, es un espacio.`;
  else if (ch === "?") info.textContent = `Columna ${c + 1}: huecos en ${rows.join(" y ")}. Esa combinación no corresponde a ningún carácter.`;
  else info.textContent = `Columna ${c + 1}: «${ch}». Huecos en ${rows.join(" y ")}.`;
}

function draw() {
  const printed = print.querySelectorAll("span");
  let text = "";
  for (let c = 0; c < COLS; c++) {
    const ch = charAt(c);
    printed[c + 1].textContent = ch.trim();
    text += ch;
  }
  out.textContent = text.trimEnd() || "(tarjeta en blanco)";
  card.querySelectorAll(".hole").forEach(b =>
    b.classList.toggle("on", state[+b.dataset.c].has(+b.dataset.r)));
}

function setText(t) { input.value = t; punch(t); draw(); showInfo(current); }

input.addEventListener("input", () => setText(input.value));
document.getElementById("clear").onclick = () => { setText(""); input.focus(); };
document.querySelectorAll(".chip").forEach(b => b.onclick = () => setText(b.dataset.t));

setText("HOLA MUNDO");