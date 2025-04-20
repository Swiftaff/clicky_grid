const gridContainer = document.getElementById("grid");
const grid = document.getElementById("grid");
const restart_button = document.getElementById("restart");
const grid_size = document.getElementById("grid_size");
const winner_el = document.getElementById("winner");
const score1 = document.getElementById(`score1`);
const score2 = document.getElementById(`score2`);
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

reset_game();

function reset_game(size = gridCount) {
  //console.log("reset_game");
  restart_confirmed = false;
  restart_button.textContent = "Restart this game?";
  restart_button.className = "hide";
  grid.className = "";
  score1.className = "hide";
  score2.className = "hide";
  scores = { p1: 0, p2: 0 };
  player = 1;
  document.body.className = `p${player}`;
  box_count_p1.textContent = "0";
  box_count_p2.textContent = "0";
  winner_el.className = "";
  resize_grid(size);
  //init_edge_and_box_data();
  show_grid_size();
  draw_grid();
}

function start() {
  //console.log("start");
  grid.className = "grid-is-playable";
  grid_size.className = "hide";
  restart_button.className = "";
  score1.className = "";
  score2.className = "";
}

function resize_grid(selected_size) {
  //console.log("resize_grid");
  gridCount = selected_size;
}

function show_grid_size() {
  //console.log("show_grid_size");
  grid_size.className = "";
}

function draw_grid() {
  //console.log("draw_grid");
  clear_grid();
  draw_grid_squares();
  draw_horizontal_edges();
  draw_vertical_edges();
  draw_vertices();
}

function clear_grid() {
  //console.log("clear_grid");
  height = squareSize * gridCount;
  styleEl.textContent = `
:root {
  --square: ${squareSize}px;
  --grid-height: ${height}px;
  --circle: ${circle}px;
}`;
  grid.innerHTML = "";
  gridContainer.style.width = `${height}px`;
}

function draw_grid_squares() {}

function draw_horizontal_edges() {}

function draw_vertical_edges() {}

function draw_vertices() {}

function click_edge(e) {
  //console.log("click_edge");
  e.stopPropagation();
  e.target.className = e.target.className + ` p${player}`;
  update_state(e);
}

function update_state(e) {
  //console.log("update_state");
  let id = e.target.id;
  edges[id] = true;
  check_for_closed_box(id);
}

function check_for_closed_box(id) {
  //console.log("check_for_closed_box");
  let { row, col, direction } = get_row_col_from_id(id);
  //console.log("clicked", id, direction);
  let a_box_was_enclosed = false;

  for (let row = 0; row <= gridCount; row++) {
    for (let col = 0; col <= gridCount; col++) {
      const above = edges[get_id("h", row, col)];
      const below = edges[get_id("h", row + 1, col)];
      const left = edges[get_id("v", row, col)];
      const right = edges[get_id("v", row, col + 1)];
      const box_id = get_id("b", row, col);
      const is_empty = boxes[box_id] === 0;
      let is_newly_enclosed = above && below && left && right && is_empty;
      //console.log({ above, right, below, left });

      if (is_newly_enclosed) {
        //console.log({ is_newly_enclosed, row, col, boxes });

        // update array
        boxes[box_id] = player;

        // Draw colored box
        const this_box = document.getElementById(box_id);
        this_box.className = `${this_box.className} p${player}`;

        //Update score
        scores[`p${player}`] = count_player_boxes();
        document.getElementById(`box_count_p${player}`).textContent =
          "" + scores[`p${player}`];

        //Check for winner
        let winner_message = "It's a draw! Play again?";
        let winner = player;
        if (scores.p1 + scores.p2 === gridCount * gridCount) {
          if (scores.p1 > scores.p2) {
            winner_message = "Player 1 wins! Play again?";
            games.p1 = games.p1 + 1;
            winner = 1;
          } else if (scores.p2 > scores.p1) {
            winner_message = "Player 2 wins! Play again?";
            games.p2 = games.p2 + 1;
            winner = 2;
          }
          if (winner !== player) toggle_player();
          winner_el.textContent = winner_message;
          winner_el.className = `p${player}`;
          document.getElementById(`games_p${player}`).textContent =
            games[`p${player}`];
        }

        a_box_was_enclosed = true;
      }
    }
  }
  if (!a_box_was_enclosed) toggle_player();
}

function get_row_col_from_id(id) {
  //console.log("get_row_col");
  const parts = id.split("-"); // ["h", "row", "0", "col", "0"]
  const row = parseInt(parts[2], 10);
  const col = parseInt(parts[4], 10);

  let is_vertical = id[0] === "v";
  let direction = is_vertical ? "vertical" : "horizontal";
  //console.log("get_id", { row, col });

  let box_row = row;
  let box_col = is_vertical ? col - 1 : col;

  return { row, col, box_row, box_col, is_vertical, direction };
}

function get_id(prefix, row, col) {
  //console.log("get_id");
  return `${prefix}-row-${row}-col-${col}`;
}

function toggle_player() {
  //console.log("toggle_player");
  player = player === 1 ? 2 : 1;
  document.body.className = `p${player}`;
}

function count_player_boxes() {
  //console.log("count_player_boxes");
  return Object.values(boxes).reduce((count, value) => {
    return value === player ? count + 1 : count;
  }, 0);
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
