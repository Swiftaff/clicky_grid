const gridContainer = document.getElementById("grid");
const grid = document.getElementById("grid");
const restart_button = document.getElementById("restart");
const grid_size = document.getElementById("grid_size");
const winner_el = document.getElementById("winner");
const box_count_p1 = document.getElementById(`box_count_p1`);
const box_count_p2 = document.getElementById(`box_count_p2`);
const styleEl = document.createElement("style");
document.head.appendChild(styleEl);
const squareSize = 50;
const circle = 10;
let gridCount = 2;
let height = 0;
let player = 1;
let scores = {};
let games = { p1: 0, p2: 0 };
let edges = {};
let boxes = {};
let restart_confirmed = false;
winner_el.addEventListener("click", () => reset_game(gridCount));
restart_button.addEventListener("click", restart);

//reset_game();

function start() {
  //console.log("start");
  grid.className = "grid-is-playable";
  grid_size.className = "hide";
  restart_button.className = "";
}

function restart() {
  if (restart_confirmed) {
    reset_game();
  } else {
    restart_confirmed = true;
    restart_button.textContent =
      "The grid will reset - but your game count will remain... click again to confirm within 10 seconds!";
    setTimeout(() => {
      if (restart_confirmed) {
        restart_button.textContent = "Restart this game?";
        restart_confirmed = false;
      }
    }, 10000);
  }
}
