// ✅ SUPABASE (OK)
const SUPABASE_URL = "https://egeqeghmseeufyupidgl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnZXFlZ2htc2VldWZ5dXBpZGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMDc1NDYsImV4cCI6MjA5MjY4MzU0Nn0.YGR21zsF8CQ2PeRUWjQjtMbGGosDgxqbWT-EAZd0vmw";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 🎮 CANVAS
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const ROUTE_Y = 220;
const DEBUG_HITBOXES = false;

ctx.imageSmoothingEnabled = false;

// 🏆 LEADERBOARD
let leaderboard = [];

async function loadScores() {
  const { data } = await supabase
    .from("scores")
    .select("*")
    .order("score", { ascending: false })
    .limit(10);

  if (data) leaderboard = data;
}

// 🖼️ IMAGES
function loadImage(fileName, fallbackName) {
  const img = new Image();
  img.src = "assets/" + fileName;

  if (fallbackName) {
    img.onerror = () => {
      img.onerror = null;
      img.src = "assets/" + fallbackName;
    };
  }
  return img;
}

const images = {
  home: loadImage("Canva.png"),
  logo: loadImage("logo.png"),
  button: loadImage("Bouton.png"),
  validate: loadImage("Valider.png"),
  arrowLeft: loadImage("Fleche_gauche.png"),
  arrowRight: loadImage("Fleche_droite.png"),
  route: loadImage("Route.png"),
  bike: loadImage("Velo_route.png"),
  bikeVtc: loadImage("VTC.png"),
  bikeVtt: loadImage("VTT.png"),
  backgrounds: [
    loadImage("Vercors.png"),
    loadImage("Belledonne.png"),
    loadImage("Chartreuse.png"),
    loadImage("Ecrins.png", "Écrins.png")
  ],
  obstacles: {
    pierre: loadImage("Pierre.png"),
    travaux: loadImage("Travaux.png"),
    immeuble: loadImage("Immeuble.png"),
    oiseau: loadImage("Oiseau.png")
  }
};

// 🎮 VARIABLES JEU
let state = "home";
let playerName = "";
let currentBackground = images.backgrounds[0];
let selectedBikeIndex = 0;
let selectedDecorIndex = 0;
let rankingChoice = 1;
let savedThisRun = false;

const player = {
  x: 105,
  y: ROUTE_Y,
  dy: 0,
  width: 60,
  height: 60,
  jumps: 0,
  maxJumps: 2
};

let obstacles = [];
let score = 0;
let speed = 2.5;

// 🚀 GAME START
function startGame() {
  obstacles = [];
  score = 0;
  speed = 2.5;
  player.y = ROUTE_Y;
  player.dy = 0;
  player.jumps = 0;
  savedThisRun = false;
  state = "game";
}

// 🏆 SAVE SCORE
function endGame() {
  if (!savedThisRun) {
    supabase.from("scores").insert([
      {
        name: playerName || "ANONYME",
        score: Math.floor(score)
      }
    ]).then(loadScores);

    savedThisRun = true;
  }
  state = "gameover";
}

// 🎮 UPDATE
function update() {
  score += 1;
}

// 🎨 DRAW
function draw() {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (state === "home") {
    ctx.drawImage(images.home, 0, 0, 900, 300);
  }

  if (state === "game") {
    ctx.drawImage(currentBackground, 0, 0, 900, 300);
    ctx.fillText("Score: " + Math.floor(score), 20, 30);
  }

  if (state === "ranking") {
    ctx.fillText("CLASSEMENT", 400, 50);

    leaderboard.slice(0, 5).forEach((entry, i) => {
      ctx.fillText(
        `${i + 1}. ${entry.name} - ${entry.score}`,
        400,
        100 + i * 30
      );
    });
  }
}

// 🔁 LOOP
function loop() {
  if (state === "game") update();
  draw();
  requestAnimationFrame(loop);
}

// 🎯 INIT
loadScores();
requestAnimationFrame(loop);
