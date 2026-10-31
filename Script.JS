/* ===== Content: edit all the words here ===== */

// SHA-256 of his birthday code (DDMMYYYY). To change it, see README note below.
const CODE_HASH = "483cff56822c17da3cb58b8a039a4c12286e8ef84bd630df933c8a2157f148d9";

const GREETING = [
  "Hi, Cheeky Bones.",
  "I made something just for you.",
  "You do so much for everybody else...",
  "so this one is all yours."
];

const REASONS = [
  "You're the person I've been longing and praying for.",
  "You pray for me, and for my family.",
  "You comfort me and wipe my tears when I cry.",
  "You want to see me happy in everything I do.",
  "You go all out for me.",
  "You're kind, loving, and you adore me.",
  "I feel safe and secure with you.",
  "You love me so much, and I love that you love me."
];

const LETTER = [
  "My Cheeky Bones,",
  "I wanted to do something just for you, because you do so much for everyone else.",
  "You didn't get anything on your birthday, and that has been sitting on my heart. You show up for everybody, you go all out for the people you love, and you never ask for anything back. So today, you're the one being celebrated.",
  "Thank you for being the person I've been praying and longing for. Thank you for praying over me and my family, for wiping my tears, and for wanting to see me happy in everything I do. I'll never forget the evening I was crying, scared for my friend, and you came straight after work, tired as you were, and held me and told me it would be okay. I felt safe. I always feel safe with you.",
  "We've only been together a few months, but you've already helped me through so much.",
  "What I hope for us is that it's you and me, against all odds, against anything that tries to come between us. That we keep choosing each other, grow together, travel, laugh, and enjoy this life. I don't see my life without you in it.",
  "You're amazing, and you deserve to hear it more often.",
  "With all my love,",
  { sign: "Female version of you 🤍" }
];

/* ===== Screen flow ===== */

const $ = (id) => document.getElementById(id);

function show(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  $(id).classList.add("active");
}

/* ===== 1. Password gate ===== */

async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function tryUnlock() {
  // Strip anything that isn't a digit so "04-09-1997" and "04091997" both work
  const entered = $("code").value.replace(/\D/g, "");
  if ((await sha256(entered)) === CODE_HASH) {
    show("greeting");
    typeGreeting();
  } else {
    $("gate-error").textContent = "Hmm, that's not it. Try again, Cheeky Bones.";
  }
}

$("unlock").addEventListener("click", tryUnlock);
$("code").addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });

/* ===== 2. Typed greeting ===== */

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function typeGreeting() {
  const out = $("typed");
  out.textContent = "";
  for (const line of GREETING) {
    for (const ch of line) {
      out.textContent += ch;
      await wait(45);
    }
    out.textContent += "\n";
    await wait(700);
  }
  $("to-game").classList.remove("hidden");
}

$("to-game").addEventListener("click", () => show("game"));

/* ===== 3. Mini game (placeholder) ===== */

$("to-reasons").addEventListener("click", () => {
  show("reasons");
  showReason();
});

/* ===== 4. Reasons ===== */

let reasonIndex = 0;

function showReason() {
  $("reason-card").textContent = REASONS[reasonIndex];
  $("reason-count").textContent =
    reasonIndex < REASONS.length - 1
      ? `Tap the card for another (${reasonIndex + 1} of ${REASONS.length})`
      : "That's the last one... for now.";
}

$("reason-card").addEventListener("click", () => {
  if (reasonIndex < REASONS.length - 1) {
    reasonIndex++;
    showReason();
  } else {
    show("letter");
    revealLetter();
  }
});

/* ===== 5. Letter + confetti ===== */

async function revealLetter() {
  const body = $("letter-body");
  body.innerHTML = "";
  for (const item of LETTER) {
    const p = document.createElement("p");
    if (typeof item === "string") {
      p.textContent = item;
    } else {
      p.textContent = item.sign;
      p.className = "sign";
    }
    body.appendChild(p);
    await wait(50);
    p.classList.add("show");
    await wait(1800);
  }
  if (typeof confetti === "function") {
    confetti({ particleCount: 160, spread: 80, origin: { y: 0.7 } });
  }
}

/*
  README note: to change the code, run in a terminal:
    printf '04091997' | sha256sum
  (replace the digits with the new DDMMYYYY) and paste the result into CODE_HASH.
  Note: crypto.subtle needs https or localhost, so test with VS Code "Live Server",
  not by double-clicking index.html. GitHub Pages is https, so it works there.
*/