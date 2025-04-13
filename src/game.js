const gridContainer = document.getElementById("grid");
const grid = document.getElementById("grid");
const grid1 = document.getElementById("grid1");
const grid2 = document.getElementById("grid2");
const grid3 = document.getElementById("grid3");
const grid5 = document.getElementById("grid5");
const grid10 = document.getElementById("grid10");
const grid_size = document.getElementById("grid_size");
const winner_el = document.getElementById("winner");
const box_count_p1 = document.getElementById(`box_count_p1`);
const box_count_p2 = document.getElementById(`box_count_p2`);
const play_button = document.getElementById(`play`);
const styleEl = document.createElement("style");

winner_el.addEventListener("click", play_again);
play_button.addEventListener("click", start);

const squareSize = 50;
const circle = 10;
let gridCount = 1;
let height = 0;

function clear_grid() {
  set_dynamic_style_variables();
  grid.innerHTML = "";
  gridContainer.style.width = `${height}px`;
}

function set_dynamic_style_variables() {
  height = squareSize * gridCount;
  const styleEl = document.createElement("style");
  document.head.appendChild(styleEl);
  styleEl.textContent = `
:root {
  --square: ${squareSize}px;
  --grid-height: ${height}px;
  --circle: ${circle}px;
}`;
}

function show_grid_size() {
  grid_size.className = "show";
  grid1.addEventListener("click", () => resize_grid(1));
  grid2.addEventListener("click", () => resize_grid(2));
  grid3.addEventListener("click", () => resize_grid(3));
  grid5.addEventListener("click", () => resize_grid(5));
  grid10.addEventListener("click", () => resize_grid(10));
  draw_grid();
}

function resize_grid(size) {
  grid1.className = "";
  grid2.className = "";
  grid3.className = "";
  grid5.className = "";
  grid10.className = "";
  document.getElementById(`grid${size}`).className = "highlight";
  gridCount = size;
  draw_grid();
}

function draw_grid_squares() {
  for (let row = 0; row < gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      const el = document.createElement("div");
      el.className = "grid-square";
      el.id = get_id("b", row, col);
      el.style.top = row * squareSize + "px";
      el.style.left = col * squareSize + "px";
      gridContainer.appendChild(el);
    }
  }
}

function draw_horizontal_edges() {
  // There are gridCount+1 horizontal edge lines, each having gridCount segments.
  for (let row = 0; row <= gridCount; row++) {
    for (let col = 0; col < gridCount; col++) {
      const el = document.createElement("div");
      el.className = "edge h-edge";
      el.id = get_id("h", row, col);
      // Position the edge at the i-th horizontal line.
      // Subtract half the edge's thickness (2px) to center it.
      el.style.top = row * squareSize - 2 + "px";
      el.style.left = col * squareSize + "px";
      el.style.width = squareSize + "px";
      el.addEventListener("click", click_edge);
      gridContainer.appendChild(el);
    }
  }
}

function draw_vertical_edges() {
  // There are gridCount+1 vertical edge lines, each having gridCount segments.
  for (let col = 0; col <= gridCount; col++) {
    for (let row = 0; row < gridCount; row++) {
      const el = document.createElement("div");
      el.className = "edge v-edge";
      el.id = get_id("v", row, col);
      // Position the edge at the col-th vertical line.
      // Subtract half the edge's thickness (2px) to center it.
      el.style.left = col * squareSize - 2 + "px";
      el.style.top = row * squareSize + "px";
      el.style.height = squareSize + "px";
      el.addEventListener("click", click_edge);
      gridContainer.appendChild(el);
    }
  }
}

function draw_vertices() {
  // There are (gridCount+1) x (gridCount+1) vertices.
  for (let row = 0; row <= gridCount; row++) {
    for (let col = 0; col <= gridCount; col++) {
      const el = document.createElement("div");
      el.className = "vertex";
      el.style.top = row * squareSize + "px";
      el.style.left = col * squareSize + "px";
      gridContainer.appendChild(el);
    }
  }
}

function click_edge(e) {
  color_edge(e);
  update_state(e);
  e.stopPropagation();
}

function get_id(prefix, row, col) {
  return `${prefix}-row-${row}-col-${col}`;
}

function get_row_col_from_id(id) {
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

function toggle_player() {
  player = player === 1 ? 2 : 1;
  document.body.className = `p${player}`;
}

function color_edge(e) {
  e.target.className = e.target.className + ` p${player}`;
}

function update_state(e) {
  let id = e.target.id;
  edges[id] = true;
  check_for_closed_box(id);
}

function check_for_closed_box(id) {
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
        scores[`p${player}`] = countPlayerBoxes();
        document.getElementById(`box_count_p${player}`).textContent =
          "" + scores[`p${player}`];

        //Check for winner
        let winner_message = "It's a draw!";
        if (scores.p1 + scores.p2 === gridCount * gridCount) {
          if (scores.p1 > scores.p2) {
            winner_message = "Player 1 wins! Play again?";
            games.p1 = games.p1 + 1;
          } else if (scores.p2 > scores.p1) {
            winner_message = "Player 2 wins! Play again?";
            games.p2 = games.p2 + 1;
          }

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

function countPlayerBoxes() {
  return Object.values(boxes).reduce((count, value) => {
    return value === player ? count + 1 : count;
  }, 0);
}

function init_edge_and_box_data() {
  for (let row = 0; row <= gridCount; row++) {
    for (let col = 0; col <= gridCount; col++) {
      //don't need last column of horizontal edges
      if (col < gridCount) {
        edges[get_id("h", row, col)] = false;
      }

      //don't need last row of vertical edges
      if (row < gridCount) {
        edges[get_id("v", row, col)] = false;
      }

      //don't need last row OR col for boxes
      if (col < gridCount && row < gridCount) {
        boxes[get_id("b", row, col)] = 0;
      }
    }
  }
}

function play_again() {
  grid.classname = "";
  scores = { p1: 0, p2: 0 };
  player = 1;
  document.body.className = `p${player}`;
  box_count_p1.textContent = "0";
  box_count_p2.textContent = "0";
  winner_el.className = "";
  init_edge_and_box_data();
  resize_grid(gridCount);
  show_grid_size();
}

function start() {
  grid.className = "grid-is-playable";
  grid_size.className = "hide";
}

function draw_grid() {
  clear_grid();
  draw_grid_squares();
  draw_horizontal_edges();
  draw_vertical_edges();
  draw_vertices();
}

// Game state setup
let player = 1;
let scores = {};
let games = { p1: 0, p2: 0 };
const edges = {};
const boxes = {};

play_again();
