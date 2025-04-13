const gridContainer = document.getElementById("grid");
const squareSize = 50;
const gridCount = 5;
const circle = 10;
const height = squareSize * gridCount;
gridContainer.style.width = `${height}px`;

// Set style variables
const styleEl = document.createElement("style");
document.head.appendChild(styleEl);
styleEl.textContent = `
:root {
  --square: ${squareSize}px;
  --grid-height: ${height}px;
  --circle: ${circle}px;
}`;

// Draw grid squares
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

// Draw horizontal edges.
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

// Draw vertical edges.
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

// Draw vertices.
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

function click_edge(e) {
  update_state(e);
  color_edge(e);
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
  console.log("get_id", { row, col });

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
  console.log("clicked", id, direction);
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
      console.log({ above, right, below, left });

      if (is_newly_enclosed) {
        console.log({ is_newly_enclosed, row, col, boxes });

        // update array
        boxes[box_id] = player;

        // Draw colored box
        const this_box = document.getElementById(box_id);
        this_box.className = `${this_box.className} p${player}`;

        //Update score
        document.getElementById(`box_count_p${player}`).textContent =
          "" + countPlayerBoxes();

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

// Game setup

// Setup state
let player = 1;
let scores = { p1: 0, p2: 0 };

// init edges and boxes together
const edges = {};
const boxes = {};
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
console.log(edges);
