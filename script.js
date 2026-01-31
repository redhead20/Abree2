/* ============================
   TEST MODE
   true  = allow FORCE_DATE testing + auto-unlock today
   false = normal behavior
   ============================ */
const TEST_MODE = true;
const FORCE_DATE = "2026-01-28"; // only used if TEST_MODE = true

/* ============================
   THURSDAY UNLOCK SETTINGS
   Denver time (America/Denver)
   Format: "HH:MM" in 24-hour time
   Example: "15:30" = 3:30 PM
   ============================ */
const THURSDAY_DATE = "2026-01-29";
const THURSDAY_UNLOCK_TIME = "15:30";

/* ============================
   RESET ON EVERY RELOAD
   (only in test mode)
   ============================ */
if (TEST_MODE) {
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith("quiz_unlocked_")) localStorage.removeItem(k);
  });
}

/* ============================
   DENVER DATE/TIME (RELIABLE)
   ============================ */
function getDenverParts() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).formatToParts(new Date());

  const map = {};
  for (const p of parts) {
    if (p.type !== "literal") map[p.type] = p.value;
  }

  return {
    y: map.year,          // "2026"
    m: map.month,         // "01"
    d: map.day,           // "29"
    hh: Number(map.hour), // 0-23
    mm: Number(map.minute) // 0-59
  };
}

/* ============================
   DATE HELPERS
   ============================ */
function isoToday() {
  if (TEST_MODE && FORCE_DATE) return FORCE_DATE;

  const t = getDenverParts();
  return `${t.y}-${t.m}-${t.d}`;
}

function daysBetween(a, b) {
  return Math.round(
    (new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000
  );
}

/* ============================
   TIME GATE HELPER
   ============================ */
function isAfterUnlockTime(dateIso, timeStr) {
  // Only enforce the time gate on the target date
  if (isoToday() !== dateIso) return true;

  const [unlockH, unlockM] = timeStr.split(":").map(Number);
  const now = getDenverParts();

  return now.hh > unlockH || (now.hh === unlockH && now.mm >= unlockM);
}

/* ============================
   SURPRISES
   ============================ */
const surprises = [
  {
    date: "2026-01-25",
    title: "Day 1 — Photo Memory",
    trivia: {
      q: "What do I notice first?",
      options: ["Eyes", "Smile", "Hair", "Shoes"],
      correctIndex: 1
    },
    rewardHtml: `
      <p>💛 Your smile.</p>
      <img src="images/day1.jpg" style="max-width:100%;border-radius:14px;">
    `
  },
  {
    date: "2026-01-26",
    title: "Day 2 — Voice Message",
    trivia: {
      q: "What do I want most?",
      options: ["Text", "Call", "Nap", "Food"],
      correctIndex: 1
    },
    rewardHtml: `
      <audio controls src="audio/day2.mp3"></audio>
    `
  },
  {
    date: "2026-01-27",
    title: "Day 3 — A Note From Me",
    trivia: {
      q: "Finish this sentence: We work because we both ____.",
      options: ["try", "care", "communicate", "all of these"],
      correctIndex: 3
    },
    rewardHtml: `
      <p>💛 Click to read my note:</p>
      <button id="noteBtn" class="checkBtn">Read next line</button>
      <div id="noteBox" style="margin-top:12px;"></div>
    `
  },
  {
    date: "2026-01-28",
    title: "Day 4 — Your Reward",
    trivia: {
      q: "What’s my favorite thing to do with you when we’re together?",
      options: ["Talk for hours", "Dance", "Watch a movie", "All of these"],
      correctIndex: 3
    },
    rewardHtml: `
      <p>🎁 You unlocked a reward.</p>

      <button id="rewardBtn" class="checkBtn">Reveal reward</button>

      <div id="rewardBox"
        style="
          margin-top:12px;
          padding:12px;
          border-radius:14px;
          background:rgba(46,229,157,.08);
          border:1px solid rgba(46,229,157,.25);
          display:none;
        "
      >
        <p style="margin:0 0 10px 0;">💛 Your Day 4 surprise is a whole page I made just for you:</p>

        <a href="coupon/coupon.html"
           class="checkBtn"
           target="_blank"
           rel="noopener noreferrer"
           style="display:inline-block; text-decoration:none;">
          Open Surprise 💖
        </a>
      </div>
    `
  },
  {
    date: "2026-01-29",
    title: "Thursday — Big Reveal",
    trivia: {
      q: "Final question?",
      options: ["Loved", "Proud", "Safe", "All"],
      correctIndex: 3
    },
    rewardHtml: `
      <p style="font-size:1.2rem;">💖 You Get Me!!! </p>
    `
  }
];

/* ============================
   STORAGE
   ============================ */
const key = d => `quiz_unlocked_${d}`;
const unlocked = d => localStorage.getItem(key(d)) === "yes";
const unlock = d => localStorage.setItem(key(d), "yes");

/* ============================
   RENDER
   ============================ */
function render() {
  const today = isoToday();
  const todayBox = document.getElementById("todayBox");
  const days = document.getElementById("days");
  const countdown = document.getElementById("countdown");

  const diff = daysBetween(today, THURSDAY_DATE);
  countdown.textContent = diff === 0 ? "It’s Thursday 💖" : `${diff} days until Thursday`;

  // Test mode: auto-unlock today's reward
  if (TEST_MODE) unlock(today);

  let cur = surprises.find(s => s.date === today);

  const thursdayLocked =
    today === THURSDAY_DATE &&
    !isAfterUnlockTime(THURSDAY_DATE, THURSDAY_UNLOCK_TIME);

  if (thursdayLocked) cur = null;

  todayBox.innerHTML = cur
    ? `<h3>${cur.title}</h3>` + (unlocked(today) ? cur.rewardHtml : quiz(cur))
    : thursdayLocked
      ? `<p>⏳ Come back at <strong>${THURSDAY_UNLOCK_TIME}</strong> (Denver time) 💖</p>`
      : `<p>No surprise today 💛</p>`;

  days.innerHTML = "";
  surprises.forEach(s => {
    days.innerHTML += `
      <div class="day">
        <div class="badge ${s.date > today ? "locked" : "open"}">
          ${s.date > today ? "LOCKED" : "AVAILABLE"}
        </div>
        <h3>${s.title}</h3>
        <p>See top section</p>
      </div>
    `;
  });
}

function quiz(s) {
  return `
    <p>${s.trivia.q}</p>
    ${s.trivia.options.map(
      (o, i) =>
        `<label class="opt">
           <input type="radio" name="q" value="${i}"> ${o}
         </label>`
    ).join("")}
    <button id="checkQuizBtn" class="checkBtn">Check</button>
  `;
}

render();

/* ============================
   EVENTS
   ============================ */
const noteLines = [
  "I know long distance isn’t easy.",
  "But I choose you — every day.",
  "Even when it’s hard.",
  "Especially when it’s hard.",
  "I’m always here for you.",
  "I love you 💛"
];
let noteIndex = 0;

document.addEventListener("click", e => {
  const today = isoToday();
  const cur = surprises.find(s => s.date === today);
  if (!cur) return;

  if (e.target.id === "checkQuizBtn") {
    const pick = document.querySelector("input[name=q]:checked");
    if (!pick) return;

    if (+pick.value === cur.trivia.correctIndex) {
      unlock(today);
      render();
    }
  }

  if (e.target.id === "noteBtn") {
    const box = document.getElementById("noteBox");
    if (!box || noteIndex >= noteLines.length) return;

    box.innerHTML += `<p>${noteLines[noteIndex]}</p>`;
    noteIndex++;

    if (noteIndex === noteLines.length) {
      e.target.disabled = true;
      e.target.textContent = "💛";
    }
  }

  if (e.target.id === "rewardBtn") {
    const box = document.getElementById("rewardBox");
    if (!box) return;

    box.style.display = "block";
    e.target.disabled = true;
    e.target.textContent = "Unlocked 🎉";
  }
});

/* ============================
   EASTER EGG
   ============================ */
const title = document.getElementById("title");
const egg = document.getElementById("eggMsg");
let clicks = 0;

title.addEventListener("click", () => {
  clicks++;
  if (clicks === 5) {
    egg.hidden = false;
    egg.classList.add("show");
  }
});
