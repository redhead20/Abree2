/* ============================
   TEST MODE
   true  = unlock today automatically
   false = normal behavior
   ============================ */
const FORCE_DATE = "2026-01-28";
const TEST_MODE = false;


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
   DATE HELPERS (DENVER TIME)
   ============================ */
function isoToday() {
  if (TEST_MODE && FORCE_DATE) {
    return FORCE_DATE;
  }

  // Force America/Denver (Mountain Time)
  const denverTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Denver"
  });

  const d = new Date(denverTime);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${y}-${m}-${day}`;
}


function daysBetween(a, b) {
  return Math.round(
    (new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000
  );
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

        <a href="coupon/coupon.html" class="checkBtn" target="_blank" style="display:inline-block; text-decoration:none;">
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
      <p style="font-size:1.2rem;">💖 PUT YOUR BIG REVEAL HERE</p>
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

  const thursday = "2026-01-29";
  const diff = daysBetween(today, thursday);

  countdown.textContent =
    diff === 0 ? "It’s Thursday 💖" : `${diff} days until Thursday`;

  // ✅ Test mode: auto-unlock today's reward
  if (TEST_MODE) unlock(today);

  const cur = surprises.find(s => s.date === today);

  todayBox.innerHTML = cur
    ? `<h3>${cur.title}</h3>` + (unlocked(today) ? cur.rewardHtml : quiz(cur))
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

  /* Trivia check */
  if (e.target.id === "checkQuizBtn") {
    const pick = document.querySelector("input[name=q]:checked");
    if (!pick) return;

    if (+pick.value === cur.trivia.correctIndex) {
      unlock(today);
      render();
    }
  }

  /* Day 3 — Love note */
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

  /* Day 4 — Reward reveal */
  if (e.target.id === "rewardBtn") {
    const box = document.getElementById("rewardBox");
    if (!box) return;

    box.style.display = "block";
    e.target.disabled = true;
    e.target.textContent = "Unlocked 🎉";
  }
});

/* ============================
   EASTER EGG (THURSDAY ONLY — DENVER TIME)
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
