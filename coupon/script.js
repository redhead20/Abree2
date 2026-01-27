const coupons = [
    {
        id: "c1",
        tag: "Anytime",
        code: "LOVE-001",
        title: "One Slow Dance 💃🕺",
        desc: "A slow dance wherever we are.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c2",
        tag: "Anytime",
        code: "LOVE-002",
        title: "Till You Let Go Hug 🫂",
        desc: "A warm hug until you feel ready to let go. ",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c3",
        tag: "Anytime",
        code: "LOVE-003",
        title: "Till you're Done Cuddle session",
        desc: "A cozy cuddle session until you're ready to get up.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c4",
        tag: "Anytime",
        code: "LOVE-004",
        title: "Pick My Outfit 👔",
        desc: "You get to choose my outfit for the day.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c5",
        tag: "Anytime",
        code: "LOVE-005",
        title: "Custom",
        desc: "You Get to Pick",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c6",
        tag: "Anytime",
        code: "LOVE-006",
        title: "Photo Together 📸",
        desc: "We take a cute picture together.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c7",
        tag: "This Weekend",
        code: "LOVE-007",
        title: "Uninterrupted Attention 💛",
        desc: "My phone stays away and you get my full attention.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c8",
        tag: "This Weekend",
        code: "LOVE-008",
        title: "Lie Down Together 🛌",
        desc: "We lay down and just exist together.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c9",
        tag: "This Weekend",
        code: "LOVE-009",
        title: "Dance Battle 💃🔥🕺",
        desc: "An all-out dance battle wherever we are. Winner gets bragging rights.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c10",
        tag: "This Weekend",
        code: "LOVE-010",
        title: "Floor Is Lava (1 Hour) 🌋🦶",
        desc: "For one full hour after you redeem this coupon, every time you say \"the floor is lava\", we have to get off the ground.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c11",
        tag: "This Weekend",
        code: "LOVE-011",
        title: "Love Confession Anywhere 💖📣",
        desc: "I give you a heartfelt love confession no matter where we are.",
        fine: "Valid This Weekend Only."
    },
    {
        id: "c12",
        tag: "This Weekend",
        code: "LOVE-012",
        title: "5 Mins Of Nothing",
        desc: "When Used I can't talk for 5 mins, if i do I owe you a kiss for each time i talk.",
        fine: "Valid This Weekend Only."
    },

];

const grid = document.getElementById("grid");
const LS_KEY = "coupon_used";
let used = new Set(JSON.parse(localStorage.getItem(LS_KEY) || "[]"));

function save() {
    localStorage.setItem(LS_KEY, JSON.stringify([...used]));
}

function render(filterUnused = false) {
    grid.innerHTML = coupons
        .filter(c => !filterUnused || !used.has(c.id))
        .map(c => `
      <article class="coupon ${used.has(c.id) ? "used" : ""}">
        <div class="topbar">
          <span class="tag">${c.tag}</span>
          <span>${c.code}</span>
        </div>
        <div class="content">
          <h2 class="title">${c.title}</h2>
          <p class="desc">${c.desc}</p>
          <p class="fine">${c.fine}</p>
        </div>
        <div class="actions">
          <button class="btn primary" onclick="redeem('${c.id}')">
            ${used.has(c.id) ? "Redeemed" : "Redeem"}
          </button>
        </div>
        <div class="stamp">USED</div>
      </article>
    `).join("");
}

function redeem(id) {
    used.add(id);
    save();
    render();
}

render();
