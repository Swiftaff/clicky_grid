const gridContainer = document.getElementById("grid");
const squareSize = 50;
const gridCount = 6;
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

// Create grid squares
for (let row = 0; row < gridCount; row++) {
  for (let col = 0; col < gridCount; col++) {
    const square = document.createElement("div");
    square.className = "grid-square";
    square.style.top = row * squareSize + "px";
    square.style.left = col * squareSize + "px";
    gridContainer.appendChild(square);
  }
}

// Create horizontal edges.
// There are gridCount+1 horizontal edge lines, each having gridCount segments.
for (let i = 0; i <= gridCount; i++) {
  for (let j = 0; j < gridCount; j++) {
    const hEdge = document.createElement("div");
    hEdge.className = "edge h-edge";
    // Position the edge at the i-th horizontal line.
    // Subtract half the edge's thickness (2px) to center it.
    hEdge.style.top = i * squareSize - 2 + "px";
    hEdge.style.left = j * squareSize + "px";
    hEdge.style.width = squareSize + "px";
    hEdge.addEventListener("click", function (e) {
      console.log("clicked");
      // Stop propagation if you want to avoid any other click handlers from triggering
      e.stopPropagation();
    });
    gridContainer.appendChild(hEdge);
  }
}

// Create vertical edges.
// There are gridCount+1 vertical edge lines, each having gridCount segments.
for (let j = 0; j <= gridCount; j++) {
  for (let i = 0; i < gridCount; i++) {
    const vEdge = document.createElement("div");
    vEdge.className = "edge v-edge";
    // Position the edge at the j-th vertical line.
    // Subtract half the edge's thickness (2px) to center it.
    vEdge.style.left = j * squareSize - 2 + "px";
    vEdge.style.top = i * squareSize + "px";
    vEdge.style.height = squareSize + "px";
    vEdge.addEventListener("click", function (e) {
      console.log("clicked");
      e.stopPropagation();
    });
    gridContainer.appendChild(vEdge);
  }
}

// Create vertices.
// There are (gridCount+1) x (gridCount+1) vertices.
for (let i = 0; i <= gridCount; i++) {
  for (let j = 0; j <= gridCount; j++) {
    const vertex = document.createElement("div");
    vertex.className = "vertex";
    vertex.style.top = i * squareSize + "px";
    vertex.style.left = j * squareSize + "px";
    gridContainer.appendChild(vertex);
  }
}
