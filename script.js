/* ===== Ойын деректері ===== */
const PHISH_CARDS = [
  { from: "Бейтаныс", t: "Сен ұттың! Сыйлық алу үшін картаңның нөмірін жаз.", a: "delete", why: "Бұл алаяқтық. Мұндай хабарламаны жою керек." },
  { from: "Мұғалім", t: "Үй тапсырмасы мектептің ресми сайтында тұр.", a: "open", why: "Мұғалімнен келген ресми ақпарат — қауіпсіз." },
  { from: "Бейтаныс", t: "Сәлем! Кездесейік, мектебің мен мекенжайыңды жаз.", a: "tell", why: "Кездеспе. Ата-анаңа немесе мұғалімге айт." },
  { from: "SMS", t: "Ойынды жаңарту үшін белгісіз сілтемені бас.", a: "delete", why: "Белгісіз сілтеме — фишинг. Жой." },
  { from: "Сынып чаты", t: "Біреуді қорлап, қорқытып жатыр.", a: "tell", why: "Бұл кибербуллинг. Сенімді ересекке айт." },
  { from: "Ресми дүкен", t: "Қосымшаңа жаңарту бар.", a: "open", why: "Ресми дүкеннен жаңарту қауіпсіз." }
];
const PHISH_BTNS = [{ k: "delete", l: "← Жою", cls: "red" }, { k: "open", l: "↑ Ашу", cls: "green" }, { k: "tell", l: "Ересекке айт →", cls: "blue" }];
const DATA_CARDS = [
  { t: "Құпия сөз", a: "secret", why: "Құпия сөзді ешкімге айтпа." },
  { t: "Үй мекенжайы", a: "secret", why: "Мекенжай — жеке ақпарат." },
  { t: "Сүйікті кітап", a: "share", why: "Сүйікті кітапты айтуға болады." },
  { t: "Банк картасының нөмірі", a: "secret", why: "Карта деректері тек ата-анаға." },
  { t: "Сүйікті спорт түрі", a: "share", why: "Бұл қауіпсіз ақпарат." },
  { t: "Телефон нөмірі", a: "secret", why: "Бейтаныстарға нөмірді берме." }
];
const DATA_BTNS = [{ k: "share", l: "Бөлісуге болады", cls: "green" }, { k: "secret", l: "Құпия", cls: "red" }];
const BOSS_Q = [
  { q: "Құпия сөз қандай болуы керек?", o: ["Оңай және қысқа.", "Күрделі және жеке.", "Атыңмен бірдей."], correct: 1, why: "Күрделі құпия сөз аккаунтты қорғайды." },
  { q: "Бейтаныс сілтеме келсе, не істейсің?", o: ["Дереу басамын.", "Досыма жіберемін.", "Ашпай, ересекке айтамын."], correct: 2, why: "Бейтаныс сілтеме қауіпті болуы мүмкін." },
  { q: "Нені жарияламау керек?", o: ["Сүйікті спортты.", "Үй мекенжайын.", "Сүйікті кітапты."], correct: 1, why: "Үй мекенжайы — жеке ақпарат." },
  { q: "Қосымшаны қайдан жүктеген дұрыс?", o: ["Белгісіз сайттан.", "Ресми дүкеннен.", "Чаттағы сілтемеден."], correct: 1, why: "Ресми дүкен тексеріледі." },
  { q: "Нақты қауіп төнгенде қай нөмірге қоңырау шаласың?", o: ["102", "12345", "555"], correct: 0, why: "102 — шұғыл көмек нөмірі." }
];
const LEVELS = [
  { id: "phish", title: "Фишинг", badge: "Фишинг аңшысы", tone: "bad", run: lv => cardLevel(lv, { cards: PHISH_CARDS, time: 8, btns: PHISH_BTNS, swipe: true }) },
  { id: "data", title: "Жеке деректер", badge: "Деректер күзетшісі", tone: "acc", run: lv => cardLevel(lv, { cards: DATA_CARDS, time: 9, btns: DATA_BTNS, select: true }) },
  { id: "runner", title: "Желі жүгірісі", badge: "Желі жүгірушісі", tone: "ok", run: runnerLevel },
  { id: "boss", title: "Алаяқпен шайқас", badge: "Алаяқты жеңуші", tone: "warn", run: bossLevel }
];
const END_TEXTS = ["Мазмұнын қайта оқып, қайта ойнап көр.", "Жақсы нәтиже! Тағы бір рет қайталап, біліміңді нығайт.", "Жақсы нәтиже! Тағы бір рет қайталап, біліміңді нығайт.", "Тамаша! Сен цифрлық қауіпсіздікті жақсы білесің!"];
const LIVES = 3;
const SHIELD = '<svg viewBox="0 0 24 24"><path d="M12 2 4 5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10V5z"/></svg>';

/* ===== Көмекшілер ===== */
const app = document.getElementById("app");
const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x !== undefined) n.textContent = x; return n; };
const btn = (l, c, f) => { const b = el("button", c, l); b.type = "button"; b.onclick = f; return b; };
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const KEY = "qcw-mobile";
let save = { done: {}, badges: [], sound: true, vib: true };
try { save = Object.assign(save, JSON.parse(localStorage.getItem(KEY))); } catch {}
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch {} };
const buzz = p => { if (save.vib && navigator.vibrate) navigator.vibrate(p); };
let audio;
function beep(f, d) {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!save.sound || !AC) return;
  audio = audio || new AC();
  const o = audio.createOscillator(), g = audio.createGain();
  g.gain.value = .07; o.frequency.value = f; o.connect(g); g.connect(audio.destination); o.start(); o.stop(audio.currentTime + d);
}
const sfx = { ok() { beep(660, .1); setTimeout(() => beep(880, .12), 90); }, bad() { beep(170, .25); } };
const starsEl = n => { const s = el("div", "stars"); s.innerHTML = "★".repeat(n) + "<i>" + "★".repeat(3 - n) + "</i>"; return s; };
function confetti() {
  const box = el("div", "confetti"), n = (navigator.hardwareConcurrency || 4) <= 4 ? 5 : 10;
  ["#1E5AA8", "#1F8A5B", "#E7B449", "#C6453B"].forEach(c => { for (let i = 0; i < n; i++) { const p = el("i"); p.style.cssText = `left:${Math.random() * 100}%;background:${c};animation-delay:${Math.random() * .6}s`; box.append(p); } });
  return box;
}
function toggle(label, key) {
  const b = btn("", "btn light", () => { save[key] = !save[key]; persist(); upd(); });
  const upd = () => (b.textContent = `${label}: ${save[key] ? "Қосу" : "Өшіру"}`);
  upd(); return b;
}
function overlay(title, items) {
  const o = el("div", "overlay"), box = el("div", "sheet");
  box.append(el("h2", "", title), ...items); o.append(box); app.append(o); return o;
}

/* ===== Басты мәзір ===== */
function showMenu() {
  cur = null; app.replaceChildren(); app.className = "";
  const top = el("div", "top"), chip = el("div", "chip");
  chip.textContent = `Значок: ${save.badges.length} / ${LEVELS.length}`;
  const set = btn("⚙", "icon-btn", () => { const o = overlay("Баптаулар", [toggle("Дыбыс", "sound"), toggle("Діріл", "vib"), btn("Жабу", "btn", () => o.remove())]); });
  top.append(chip, el("div", "ttl"), set);
  app.append(top, el("h1", "title", "Қауіпсіз цифрлық әлем"),
    el("p", "sub", "Интернет — пайдалы кеңістік, бірақ онда қауіптер де кездеседі. Ойнап, біліп, қауіпсіз бол!"));
  const path = el("div", "path");
  LEVELS.forEach((L, i) => {
    const open = i === 0 || save.done[LEVELS[i - 1].id];
    const n = el("button", "node " + L.tone + (open ? "" : " locked")); n.type = "button";
    const info = el("div"); info.append(el("b", "", L.title), starsEl(save.done[L.id] || 0));
    if (save.badges.includes(L.id)) info.append(el("small", "", L.badge));
    n.append(el("div", "orb", open ? String(i + 1) : "🔒"), info);
    n.onclick = open ? () => play(L) : () => {};
    path.append(n);
  });
  const sos = el("div", "sos"); sos.innerHTML = "Есте сақта: қауіп төнгенде <strong>102</strong> нөміріне қоңырау шал";
  app.append(path, sos);
}

/* ===== Деңгей контейнері ===== */
let cur = null;
function play(L) {
  const S = { lives: LIVES, stars: 0, paused: false, over: false };
  app.replaceChildren(); app.className = L.tone;
  const top = el("div", "top"), starC = el("div", "chip"), lifeC = el("div", "chip");
  top.append(btn("❚❚", "icon-btn", () => pause(true)), el("div", "ttl", L.title), starC, lifeC);
  const stage = el("div", "stage"), bottom = el("div", "bottom");
  app.append(top, stage, bottom);
  const hud = () => { starC.innerHTML = `<span class="star">★</span> ${S.stars}`; lifeC.innerHTML = SHIELD + " " + S.lives; };
  let hintTimer;
  const lv = {
    stage, bottom, S,
    hint(t) { stage.querySelector(".hint")?.remove(); const h = el("div", "hint", t); stage.append(h); clearTimeout(hintTimer); hintTimer = setTimeout(() => h.remove(), 2500); },
    good() { S.stars++; sfx.ok(); buzz(40); hud(); },
    bad() { S.lives--; sfx.bad(); buzz([80, 40, 80]); hud(); if (S.lives <= 0) lv.end(false); },
    end(win) { if (S.over) return; S.over = true; setTimeout(() => result(L, win, S), 900); }
  };
  function pause(on) {
    if (S.over) return;
    S.paused = on; app.querySelector(".overlay")?.remove();
    if (on) { const o = overlay("Үзіліс", [btn("Жалғастыру", "btn", () => pause(false)), btn("Қайта бастау", "btn light", () => play(L)),
      toggle("Дыбыс", "sound"), toggle("Діріл", "vib"), btn("Мәзір", "btn light", showMenu)]); }
  }
  hud();
  cur = { S, pause, update: L.run(lv) };
}
function result(L, win, S) {
  if (!cur || cur.S !== S) return;
  const stars = win ? Math.max(1, S.lives) : 0, first = win && !save.badges.includes(L.id);
  if (win) { save.done[L.id] = Math.max(save.done[L.id] || 0, stars); if (first) save.badges.push(L.id); persist(); buzz([60, 40, 60, 40, 150]); }
  cur = null; app.replaceChildren();
  const res = el("div", "result");
  res.append(el("h2", "", win ? "Деңгей өтті!" : "Қалқан таусылды"), starsEl(stars), el("p", "", END_TEXTS[stars]));
  if (first) res.append(el("p", "badge", "Жаңа значок: " + L.badge));
  if (stars === 3) res.append(confetti());
  app.append(res);
  const next = LEVELS[LEVELS.indexOf(L) + 1], g = el("div", "bottom");
  if (win && next) g.append(btn("Келесі деңгей", "btn", () => play(next)));
  g.append(btn("Қайта ойнау", "btn light", () => play(L)), btn("Мәзір", "btn light", showMenu));
  app.append(g);
}

/* ===== Карточкалы деңгейлер (фишинг, деректер) ===== */
function swipeCard(card, cb) {
  let sx, sy, on = false;
  card.onpointerdown = e => { on = true; sx = e.clientX; sy = e.clientY; card.setPointerCapture(e.pointerId); card.style.transition = ""; };
  card.onpointermove = e => { if (on) card.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px) rotate(${(e.clientX - sx) / 25}deg)`; };
  const reset = () => { on = false; card.style.transition = "transform .2s"; card.style.transform = ""; };
  card.onpointercancel = reset;
  card.onpointerup = e => {
    if (!on) return; const dx = e.clientX - sx, dy = e.clientY - sy; reset();
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) < 70) return;
    if (ay > ax) { if (dy < 0) cb("open"); } else cb(dx < 0 ? "delete" : "tell");
  };
}
function cardLevel(lv, cfg) {
  const cards = shuffle(cfg.cards);
  let i = 0, t = cfg.time, locked = false, selected = false, card;
  const bar = el("div", "timer"), fill = el("i"), area = el("div", "cardarea");
  bar.append(fill); lv.stage.append(bar, area);
  lv.bottom.style.gridTemplateColumns = `repeat(${cfg.btns.length},1fr)`;
  cfg.btns.forEach(b => lv.bottom.append(btn(b.l, "btn " + b.cls, () => answer(b.k))));
  function show() {
    area.replaceChildren(); selected = false; locked = false; t = cfg.time;
    const d = cards[i]; card = el("div", "qcard");
    if (d.from) card.append(el("small", "", d.from));
    card.append(document.createTextNode(d.t));
    area.append(card, el("div", "count", `${i + 1} / ${cards.length}`));
    if (cfg.swipe) swipeCard(card, answer);
    else { card.onclick = () => { selected = true; card.classList.add("sel"); }; if (i === 0) lv.hint("Картаны бас, сосын сандықты таңда"); }
  }
  function answer(k) {
    if (locked || lv.S.over) return;
    if (cfg.select && k !== null && !selected) { lv.hint("Алдымен картаны бас"); return; }
    locked = true;
    const ok = k === cards[i].a;
    if (ok) lv.good(); else { lv.hint((k === null ? "Уақыт бітті. " : "") + cards[i].why); lv.bad(); }
    card.classList.add(ok ? "yes" : "no");
    setTimeout(() => { if (lv.S.over) return; if (++i >= cards.length) lv.end(true); else show(); }, ok ? 400 : 1500);
  }
  if (cfg.swipe) lv.hint("Свайп: ← жою · ↑ ашу · → ересекке айту");
  show();
  return dt => { if (locked) return; t -= dt; fill.style.width = Math.max(0, t / cfg.time * 100) + "%"; if (t <= 0) answer(null); };
}

/* ===== Раннер ===== */
function runnerLevel(lv) {
  const cv = el("canvas"), g = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1);
  lv.stage.append(cv);
  let W, H, G;
  const fit = () => { if (!cv.isConnected) return; W = lv.stage.clientWidth; H = lv.stage.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cv.style.cssText = `position:absolute;inset:0;width:${W}px;height:${H}px`; g.setTransform(dpr, 0, 0, dpr, 0, 0); G = H * .72; };
  fit(); window.addEventListener("resize", fit);
  const DUR = 60, HX = 60, MAXP = (navigator.hardwareConcurrency || 4) <= 4 ? 8 : 20;
  let t = 0, y = 0, vy = 0, duck = 0, inv = 0, sh = 0, cool = 0, spawn = 1, obs = [], parts = [], sx = 0, sy = 0;
  const shieldBtn = btn("Қалқан", "btn green", () => { if (cool <= 0 && !lv.S.paused) { sh = 1.3; cool = 4; buzz(30); } });
  lv.bottom.append(shieldBtn);
  lv.stage.onpointerdown = e => { sx = e.clientX; sy = e.clientY; };
  lv.stage.onpointerup = e => { if (lv.S.paused || lv.S.over) return; if (e.clientY - sy > 50) duck = .7; else if (y <= 0) vy = 640; };
  lv.hint("Тап — секіру · төмен свайп — еңкею · Қалқан — сілтемеге қарсы");
  const burst = (x, yy, c) => { for (let i = 0; i < MAXP / 2; i++) parts.push({ x, y: yy, vx: (Math.random() - .5) * 240, vy: -Math.random() * 200, l: .5, c }); };
  const labels = { box: "Вирус", ban: "Жарнама", fish: "Сілтеме" };
  return dt => {
    if (lv.S.over) return;
    t += dt; spawn -= dt; inv -= dt; sh -= dt; cool -= dt; duck -= dt;
    vy -= 1800 * dt; y = Math.max(0, y + vy * dt); if (y === 0) vy = 0;
    const sp = 240 + t * 1.5;
    if (spawn <= 0) { const r = Math.random(); obs.push(Object.assign(r < .4 ? { k: "box", w: 40, h: 40, b: 0 } : r < .7 ? { k: "ban", w: 80, h: 22, b: 34 } : { k: "fish", w: 38, h: 34, b: 18 }, { x: W + 20 })); spawn = 1.1 + Math.random() * .7; }
    const hh = duck > 0 ? 30 : 56;
    obs.forEach(o => {
      o.x -= (sp + (o.k === "fish" ? 60 : 0)) * dt;
      if (o.dead || !(HX + 30 > o.x && HX < o.x + o.w && y < o.b + o.h && y + hh > o.b)) return;
      if (o.k === "fish" && sh > 0) { o.dead = true; lv.good(); burst(o.x, G - o.b - 17, "#1F8A5B"); }
      else if (inv <= 0) { inv = 1.2; o.dead = true; lv.bad(); lv.hint(o.k === "fish" ? "Сілтемеге қалқан қой!" : "Секір немесе еңкей!"); burst(o.x, G - o.b - 17, "#C6453B"); }
    });
    obs = obs.filter(o => o.x > -100 && !o.dead);
    parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.l -= dt; }); parts = parts.filter(p => p.l > 0).slice(-MAXP);
    shieldBtn.textContent = cool > 0 && sh <= 0 ? `Қалқан ${Math.ceil(cool)}` : "Қалқан"; shieldBtn.disabled = cool > 0;
    /* сурет */
    g.clearRect(0, 0, W, H);
    g.fillStyle = "#B7CCE6"; g.fillRect(0, G, W, H - G); g.fillStyle = "#1E5AA8"; g.fillRect(0, G, W, 4);
    g.fillStyle = "#fff"; g.fillRect(8, 6, W - 16, 8); g.fillStyle = "#1F8A5B"; g.fillRect(8, 6, (W - 16) * Math.min(1, t / DUR), 8);
    obs.forEach(o => {
      g.fillStyle = o.k === "box" ? "#C6453B" : o.k === "ban" ? "#E7B449" : "#1F2933";
      g.fillRect(o.x, G - o.b - o.h, o.w, o.h);
      g.fillStyle = o.k === "ban" ? "#1F2933" : "#fff"; g.font = "700 11px Manrope,sans-serif"; g.textAlign = "center"; g.fillText(labels[o.k], o.x + o.w / 2, G - o.b - o.h / 2 + 4);
    });
    if (inv <= 0 || Math.floor(t * 12) % 2) { g.fillStyle = "#1E5AA8"; g.fillRect(HX, G - y - hh, 30, hh); g.fillStyle = "#fff"; g.fillRect(HX + 18, G - y - hh + 8, 7, 7); }
    if (sh > 0) { g.strokeStyle = "#1F8A5B"; g.lineWidth = 4; g.beginPath(); g.arc(HX + 15, G - y - hh / 2, 38, 0, 7); g.stroke(); }
    parts.forEach(p => { g.fillStyle = p.c; g.fillRect(p.x, p.y, 5, 5); });
    if (t >= DUR) lv.end(true);
  };
}

/* ===== Босс ===== */
function bossLevel(lv) {
  const qs = [...shuffle(BOSS_Q)], TIME = 8, MAXHP = BOSS_Q.length;
  let hp = MAXHP, t = TIME, locked = false, q;
  const boss = el("div", "boss"), hpBar = el("div", "hpbar"), fill = el("i"), qEl = el("div", "bq"), bar = el("div", "timer"), tf = el("i");
  boss.innerHTML = '<svg viewBox="0 0 100 100"><path d="M50 8C28 8 14 26 14 52v36h72V52C86 26 72 8 50 8z" fill="#C6453B"/><circle cx="50" cy="48" r="26" fill="#1F2933"/><circle cx="40" cy="46" r="5" fill="#E7B449"/><circle cx="60" cy="46" r="5" fill="#E7B449"/><path d="M38 62q12 8 24 0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  hpBar.append(fill); bar.append(tf); boss.append(hpBar);
  lv.stage.append(bar, boss, qEl);
  function show() {
    q = qs.shift(); qEl.textContent = q.q; locked = false; t = TIME; fill.style.width = hp / MAXHP * 100 + "%";
    lv.bottom.replaceChildren(...q.o.map((o, k) => { const b = btn(o, "btn blue", () => answer(k, b)); b.dataset.k = k; return b; }));
  }
  function answer(k, b) {
    if (locked || lv.S.over) return; locked = true;
    const ok = k === q.correct;
    [...lv.bottom.children].forEach(x => (x.disabled = true));
    lv.bottom.children[q.correct].classList.add("right");
    if (ok) { hp--; fill.style.width = hp / MAXHP * 100 + "%"; lv.good(); boss.classList.add("hit"); setTimeout(() => boss.classList.remove("hit"), 400); if (hp <= 0) { lv.end(true); return; } }
    else { if (b) b.classList.add("wrong"); qs.push(q); lv.hint((k < 0 ? "Уақыт бітті. " : "") + q.why); lv.bad(); }
    setTimeout(() => { if (!lv.S.over) show(); }, ok ? 700 : 1700);
  }
  lv.hint("Дұрыс жауап алаяққа соққы береді");
  show();
  return dt => { if (locked) return; t -= dt; tf.style.width = Math.max(0, t / TIME * 100) + "%"; if (t <= 0) answer(-1, null); };
}

/* ===== Цикл, пауза, іске қосу ===== */
let last = 0;
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (cur && !cur.S.paused && !cur.S.over) cur.update(dt);
  requestAnimationFrame(loop);
}
document.addEventListener("visibilitychange", () => { if (document.hidden && cur && !cur.S.over && !cur.S.paused) cur.pause(true); });
window.addEventListener("blur", () => { if (cur && !cur.S.over && !cur.S.paused) cur.pause(true); });
document.addEventListener("gesturestart", e => e.preventDefault());
document.addEventListener("contextmenu", e => e.preventDefault());
showMenu();
requestAnimationFrame(t => { last = t; loop(t); });
