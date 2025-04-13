const gridContainer = document.getElementById("grid");
const grid = document.getElementById("grid");
const grid_buttons = {};
const size_row_1 = document.getElementById("size_row_1");
const size_row_2 = document.getElementById("size_row_2");
let grid_min = 2;
let grid_max = 9;
for (let size = grid_min; size <= grid_max; size++) {
  const btn = document.createElement("style");
  grid_buttons[`grid${size}`] = document.createElement("div");
  grid_buttons[`grid${size}`].id = `grid${size}`;
  grid_buttons[`grid${size}`].textContent = `${size} x ${size}`;
  grid_buttons[`grid${size}`].addEventListener("click", () => reset_game(size));
  if (size <= 5) {
    size_row_1.appendChild(grid_buttons[`grid${size}`]);
  } else {
    size_row_2.appendChild(grid_buttons[`grid${size}`]);
  }
}
const grid_size = document.getElementById("grid_size");
const winner_el = document.getElementById("winner");
const box_count_p1 = document.getElementById(`box_count_p1`);
const box_count_p2 = document.getElementById(`box_count_p2`);
const play_button = document.getElementById(`play`);
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
winner_el.addEventListener("click", () => reset_game(gridCount));
play_button.addEventListener("click", start);

reset_game();

function reset_game(size = gridCount) {
  //console.log("reset_game");
  grid.className = "";
  scores = { p1: 0, p2: 0 };
  player = 1;
  document.body.className = `p${player}`;
  box_count_p1.textContent = "0";
  box_count_p2.textContent = "0";
  winner_el.className = "";
  play_button.className = "";
  resize_grid(size);
  init_edge_and_box_data();
  show_grid_size();
  draw_grid();
}

function start() {
  //console.log("start");
  grid.className = "grid-is-playable";
  grid_size.className = "hide";
  play_button.className = "hide";
}

function resize_grid(selected_size) {
  //console.log("resize_grid");
  gridCount = selected_size;
  for (let size = grid_min; size <= grid_max; size++) {
    grid_buttons[`grid${size}`].className = "";
  }
  grid_buttons[`grid${selected_size}`].className = "highlight";
}

function init_edge_and_box_data() {
  //console.log("init_data");
  edges = {};
  boxes = {};
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

function draw_grid_squares() {
  //console.log("draw_grid_squares");
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
  //console.log("draw_hor_edges");
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
  //console.log("draw_vert_edges");
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
  //console.log("draw_vertices");
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
