/* extras.js — load AFTER your main inline script. Edit the settings below. */

/* 8 photos of the two of you: photo 1 is the background of reason 1, and so on */
const PHOTOS = [
  { src: "image/images/1.jpg" },
  { src: "image/images/2.jpg" },
  { src: "image/images/3.jpg" },
  { src: "image/images/4.jpg" },
  { src: "image/images/5.jpg" },
  { src: "image/images/6.jpg" },
  { src: "image/images/7.jpg" },
  { src: "image/images/8.jpg" }
];
const LETTER_PHOTO = "image/images/9.jpg";    // your photo (his favorite): background of the letter

/* PAGE 2: your voice + synced text. Record it, save as audio/greeting.mp3, then set GREETING_AUDIO.
   Leave "" to show the text typing on its own (no voice). */
const GREETING_AUDIO = "audio/greeting.mp3";
const GREETING_LINES = [
  "Molo Bab' Ntuli,",
  "Tshezi,",
  "Mbotho,",
  "Tenza,",
  "Fakade,",
  "Saliwa,",
  "Jalamba,",
  "Mkhabela,",
  "Citshane!,",
  "Yalo",
  "Ntsindane,",
  "Dutywayo!,",
  "iNkonjane emnyama ebhab’emafini!,",
  "Njilo-njilo kuya ngaselwandle!,",
  "iinzwana zakwaBomvana!,",
  "into ezinomkhitha kodwa zimithond’wemide!!,",
  "iNyoka emnyama ecanda isiziba!!,",
  "uMkhontobomvu osika macalonke!!,",
  "uMalala nentombi ivuke isithi bhuti ndizeke noba ngesheleni!!,",
  "Inkosi ezingazange,",
  "zibutheng’ubokhosi!,",
  "iZinto ezityafileyo ingathi,",
  "zidla umcuku!!,",
  "Mqal’ongangenduku!,",
  "Omabelemade abancelis'umntana phesheya kweNciba!,",
  "NgamaBomvana ke ooTshezi,",
  { text: "I made something just for you.", gap: true },
  "You do so much for everybody else...",
  "so this one is all yours."
];
/* The second each line STARTS in your recording (one number per line, 29 in total).
   Get them by opening index.html#sync, playing the audio and tapping "Mark line" at each line. */
const GREETING_CUES = [0.70, 3.05, 4.70, 6.35, 8.20, 10.00, 11.85, 13.55, 15.25, 17.35, 18.85, 20.75, 22.50, 26.05, 29.95, 32.90, 38.45, 41.45, 45.55, 53.00, 54.55, 56.55, 61.45, 63.15, 65.35, 70.05, 74.55, 77.60, 80.70];

/* SONG: plays from the game page until the letter */
const YT_ID = "qG2ii8poOjg";             // YouTube video id
const SONG_FILE = "";                    // or your own mp3, e.g. "audio/song.mp3" (used if YT_ID is "")
const SONG_TITLE = "Song title - Artist";

const MY_NUMBER = "";                    // optional WhatsApp button at the end of the letter. Leave "" if the repo is public.
const DEV = true;                        // previews: index.html#greeting / #sync / #game / #reasons / #letter. SET TO false BEFORE SENDING.

(() => {
  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };
  const area = () => $("game-area");
  const setSub = (t) => { document.querySelector("#game .sub").textContent = t; };
  const setProgress = (n, goal, label) => {
    $("progress-fill").style.width = (n / goal * 100) + "%";
    $("game-count").textContent = `${label}: ${n} / ${goal}`;
  };
  let timers = [], spawnIv = null;
  const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };

  /* ---------- Page 1 ---------- */
  document.querySelector("#gate h1").textContent = "Hey, Handsome";

  /* ---------- Photo background layer (reasons + letter) ---------- */
  const scene = el("div");
  scene.id = "scene";
  document.body.appendChild(scene);
  function setScene(url) {
    scene.classList.remove("on");
    if (!url) { scene.style.removeProperty("--photo"); return; }
    scene.style.setProperty("--photo", `url('${url}')`);
    void scene.offsetWidth;
    scene.classList.add("on");
  }
  const origShow = window.show;
  window.show = (id) => {
    origShow(id);
    document.body.dataset.screen = id;
    if (id === "letter") setScene(LETTER_PHOTO);
    else if (id !== "reasons") setScene(null);
  };

  /* ---------- Page 2: voice + synced text ---------- */
  const GL = GREETING_LINES.map((l) => (typeof l === "string" ? { text: l } : l));
  const synced = !!GREETING_AUDIO && GREETING_CUES.length === GL.length;

  function paint(out, t, total, final) {
    out.innerHTML = "";
    GL.forEach((l, i) => {
      const start = GREETING_CUES[i];
      if (!final && t < start) return;
      const end = i + 1 < GL.length ? GREETING_CUES[i + 1] : total;
      const span = Math.max(0.4, (end - start) * 0.85);
      const n = final ? l.text.length : Math.ceil(l.text.length * Math.min(1, (t - start) / span));
      const s = el("span", "ln" + (l.gap ? " gap" : ""));
      s.textContent = l.text.slice(0, n);
      out.appendChild(s);
    });
    out.scrollTop = out.scrollHeight;
  }

  window.typeGreeting = async () => {
    const out = $("typed"), go = $("to-game");
    out.textContent = "";
    out.classList.add("long");
    out.classList.remove("caret");
    go.classList.add("hidden");

    const g = GREETING_AUDIO ? new Audio(GREETING_AUDIO) : null;
    const dead = g ? new Promise((r) => { g.onerror = r; }) : null;
    if (g) {                                         // his tap is what lets the audio play
      const start = el("button", "", "Tap to hear me 🤍");
      $("greeting").insertBefore(start, out);
      await new Promise((r) => { start.onclick = r; });
      start.remove();
      g.play().catch(() => {});
    }
    if (synced && g) {
      const iv = setInterval(() => paint(out, g.currentTime, g.duration || g.currentTime + 1, false), 80);
      await Promise.race([new Promise((r) => { g.onended = r; }), dead]);
      clearInterval(iv);
      paint(out, 0, 0, true);
    } else {
      for (const l of GL) {
        const line = el("span", "ln" + (l.gap ? " gap" : ""));
        out.appendChild(line);
        for (const ch of l.text) { line.textContent += ch; await wait(40); }
        out.scrollTop = out.scrollHeight;
        await wait(450);
      }
      if (g && !g.ended && !g.error) await Promise.race([new Promise((r) => { g.onended = r; }), dead]);
    }
    go.classList.remove("hidden");
  };

  function syncTool() {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const s = el("section", "screen active");
    s.innerHTML = `<h2>Sync tool</h2><p class="sub">Press Play. Tap "Mark line" the moment each line STARTS in your recording.</p>` +
      `<p id="sy-next" class="typed"></p><button id="sy-play">Play</button><button id="sy-mark" disabled>Mark line</button>` +
      `<textarea id="sy-out" rows="5" readonly style="width:min(30rem,100%)"></textarea>`;
    document.body.appendChild(s);
    const a = new Audio(GREETING_AUDIO), marks = [];
    const next = () => {
      $("sy-next").textContent = marks.length < GL.length ? `Next line: ${GL[marks.length].text}` : "Done! Copy the box below into extras.js";
    };
    next();
    $("sy-play").onclick = () => { a.play(); $("sy-mark").disabled = false; $("sy-play").disabled = true; };
    $("sy-mark").onclick = () => {
      if (marks.length >= GL.length) return;
      marks.push(Math.max(0, a.currentTime - 0.2).toFixed(2));
      next();
      $("sy-out").value = `const GREETING_CUES = [${marks.join(", ")}];`;
    };
  }

  /* ---------- Page 3: game (one game: Everyone needs Cheeky Bones) ---------- */
  function panel(text, label, onClick) {
    const a = area();
    a.className = "";
    a.innerHTML = "";
    const p = el("div", "panel", `<p>${text}</p>`);
    const b = el("button", "", label);
    b.onclick = onClick;
    p.appendChild(b);
    a.appendChild(p);
  }
  function toast(t) {
    const e = el("div", "toast", t);
    area().appendChild(e);
    later(() => e.remove(), 1700);
  }

  const ASKS = ["Quick favor?", "Are you free?", "Can you help me?", "Sorry to bother you, but...",
    "One tiny thing?", "Are you busy?", "You're the only one who can...", "Do you have a minute?"];
  const LOVE = ["I'm proud of you", "Rest, my love", "You deserve this", "I love you, Cheeky Bones",
    "Thank you for everything", "You're my favorite", "Come here, hug?", "Breathe. I've got you"];

  /* Everyone needs Cheeky Bones: send requests away, catch my hearts to recharge */
  function playGame(startHearts = 0) {
    const a = area();
    a.className = "";
    a.innerHTML = `<div class="energy"><span>⚡ Energy</span><div class="etrack"><i id="efill"></i></div></div>`;
    setSub("Everyone needs Cheeky Bones. Send the requests away and catch my hearts to recharge.");
    const GOAL = 8;
    let energy = 100, hearts = startHearts, spawned = 0, over = false;

    const setEnergy = (v) => {
      energy = Math.max(0, Math.min(100, v));
      const f = $("efill");
      if (!f) return;
      f.style.width = energy + "%";
      f.classList.toggle("low", energy < 35);
    };
    const burst = (b) => {
      const r = b.getBoundingClientRect(), ar = a.getBoundingClientRect();
      const x = r.left - ar.left + r.width / 2, y = r.top - ar.top + r.height / 2;
      ["🤍", "💛", "✨", "🤍", "💛", "✨"].forEach((g) => {
        const s = el("span", "burst", g);
        s.style.left = x + "px";
        s.style.top = y + "px";
        s.style.setProperty("--bx", (Math.random() * 100 - 50) + "px");
        s.style.setProperty("--by", (-20 - Math.random() * 60) + "px");
        s.style.setProperty("--bdur", (0.5 + Math.random() * 0.4) + "s");
        a.appendChild(s);
        later(() => s.remove(), 900);
      });
    };
    const speed = () => {
      clearInterval(spawnIv);
      spawnIv = setInterval(spawn, Math.max(450, 820 - hearts * 45));
    };
    const finish = () => {
      over = true;
      clearInterval(spawnIv);
      a.querySelectorAll(".ask").forEach((b) => b.remove());
    };
    const win = () => {
      finish();
      if (typeof confetti === "function") confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      later(() => panel("Can I do something for you? 🤍", "Yes, please", goToReasons), 700);
    };
    const lose = () => {
      finish();
      later(() => panel("Everyone took everything out of you... let me recharge you 🤍", "Try again", () => playGame(hearts)), 400);
    };

    function spawn() {
      if (over) return;
      spawned++;
      const love = spawned % 4 === 0 || Math.random() < 0.15;
      const b = el("button", love ? "ask love" : "ask",
        love ? "🤍 " + LOVE[Math.floor(Math.random() * LOVE.length)] : ASKS[Math.floor(Math.random() * ASKS.length)]);
      b.style.left = (4 + Math.random() * 42) + "%";
      b.style.top = (14 + Math.random() * 66) + "%";
      let done = false;
      b.onclick = () => {
        if (done || over) return;
        done = true;
        if (love) {
          burst(b);
          b.remove();
          setProgress(++hearts, GOAL, "Love collected");
          setEnergy(energy + 15);
          if (hearts >= GOAL) win(); else speed();
        } else {
          b.disabled = true;
          b.textContent = "Not now 😌";
          later(() => b.remove(), 350);
        }
      };
      a.appendChild(b);
      later(() => {
        if (done || over) { return; }
        done = true;
        if (love) { b.remove(); return; }          // a heart that got away: nothing lost
        b.classList.add("hit");                    // a request nobody answered drains him
        if (navigator.vibrate) navigator.vibrate(60);
        setEnergy(energy - 12);
        later(() => b.remove(), 300);
        if (energy <= 0) lose();
      }, love ? 3000 : 3400);
    }

    setProgress(hearts, GOAL, "Love collected");
    setEnergy(100);
    spawn();
    speed();
  }

  window.startGame = () => { window.stopGame(); playGame(); };
  window.stopGame = () => {
    clearInterval(spawnIv);
    timers.forEach(clearTimeout);
    timers = [];
  };

  /* ---------- Page 4: each reason has its photo as the background ---------- */
  const origShowReason = window.showReason;
  window.showReason = () => {
    origShowReason();
    const p = PHOTOS[reasonIndex];
    setScene(p ? p.src : null);
    const next = PHOTOS[reasonIndex + 1];
    if (next) new Image().src = next.src;
  };

  /* ---------- Music: starts when he taps "Okay, I'm ready", plays to the end ---------- */
  const HAS_MUSIC = !!(YT_ID || SONG_FILE);

  function makeMusic() {
    if (YT_ID) {
      let p, ready = false, want = false;
      const host = el("div");
      host.id = "yt";
      host.style.cssText = "position:fixed;left:-9999px;top:0;width:200px;height:200px";
      document.body.appendChild(host);
      const s = document.createElement("script");
      s.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(s);
      window.onYouTubeIframeAPIReady = () => {
        p = new YT.Player("yt", {
          videoId: YT_ID,
          playerVars: { playsinline: 1, controls: 0, loop: 1, playlist: YT_ID },
          events: { onReady: () => { ready = true; if (want) p.playVideo(); }, onStateChange: syncDisc }
        });
      };
      return {
        play() { want = true; if (ready) p.playVideo(); },
        pause() { want = false; if (ready) p.pauseVideo(); },
        playing: () => ready && p.getPlayerState() === 1,
        vol(v) { if (ready) p.setVolume(v * 100); }
      };
    }
    const a = new Audio(SONG_FILE);
    a.loop = true;
    a.onplay = a.onpause = syncDisc;
    return {
      play: () => a.play().catch(() => {}),
      pause: () => a.pause(),
      playing: () => !a.paused,
      vol(v) { a.volume = v; }
    };
  }

  const music = HAS_MUSIC ? makeMusic() : null;
  const disc = el("button", "disc");
  disc.setAttribute("aria-label", "Music on or off");
  disc.style.display = "none";
  document.body.appendChild(disc);

  function syncDisc() { disc.classList.toggle("spin", !!music && music.playing()); }
  function startMusic() {
    if (!music || music.playing()) return;
    music.vol(0);
    music.play();
    disc.style.display = "block";
    const pill = el("div", "pill", `♪ ${SONG_TITLE}`);
    document.body.appendChild(pill);
    setTimeout(() => pill.remove(), 5000);
    let v = 0;
    const fade = setInterval(() => {
      v = Math.min(0.8, v + 0.04);
      music.vol(v);
      if (v >= 0.8) clearInterval(fade);
    }, 150);
  }
  disc.onclick = () => { if (music.playing()) music.pause(); else music.play(); setTimeout(syncDisc, 300); };
  $("to-game").addEventListener("click", startMusic);
  if (HAS_MUSIC) setInterval(syncDisc, 700);

  /* ---------- Page 5: letter ---------- */
  const origReveal = window.revealLetter;
  window.revealLetter = async () => {
    await origReveal();
    if (MY_NUMBER && !$("letter").querySelector(".btn")) {
      const a = el("a", "btn", "Send me a message 🤍");
      a.href = `https://wa.me/${MY_NUMBER}?text=${encodeURIComponent("I loved it 🤍")}`;
      $("letter").appendChild(a);
    }
  };

  if (DEV) {
    const h = location.hash.slice(1);
    if (h === "sync" && GREETING_AUDIO) syncTool();
    else if (h === "greeting") { show("greeting"); typeGreeting(); }
    else if (h === "game") { show("game"); startGame(); }
    else if (h === "reasons") { goToReasons(); }
    else if (h === "letter") { show("letter"); revealLetter(); }
  }
})();