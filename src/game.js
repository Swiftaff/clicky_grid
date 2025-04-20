document.addEventListener("alpine:init", () => {
  Alpine.data("state", () => ({
    //constants
    cell_size: 50,
    size_row_1: [1, 2, 3, 4],
    size_row_2: [5, 6, 7, 8],
    //updateable but remain across games
    size: 2,
    games: { p1: 0, p2: 0 },
    //reset each game
    is_playing: false,
    edges: {},
    boxes: {},
    player: 1,
    scores: { p1: 0, p2: 0 },
    winner_message: "",
    winner_player: 0,
    restart_confirmed: false,
    restart_message: "Restart this game?",
    reset_game() {
      this.is_playing = false;
      this.edges = {};
      this.boxes = {};
      this.player = 1;
      this.scores = { p1: 0, p2: 0 };
      this.winner_message = "";
      this.winner_player = 0;
      this.restart_confirmed = false;
      this.restart_message = "Restart this game?";
    },
    restart_game() {
      if (this.restart_confirmed) {
        this.reset_game();
      } else {
        this.restart_confirmed = true;
        this.restart_message =
          "The grid will reset - but your game count will remain... click again to confirm within 10 seconds!";
        setTimeout(() => {
          if (this.restart_confirmed) {
            //cancel the restart
            this.restart_message = "Restart this game?";
            this.restart_confirmed = false;
          }
        }, 10000);
      }
    },
    size_update(val, e) {
      console.log("size_update", val, e);
      this.size = val;
      this.init_edge_and_box_data();
    },
    player_toggle() {
      this.player = this.player === 1 ? 2 : 1;
    },
    click_edge(e) {
      let id = e.target.id;
      if (this.edges[id]) {
        //nop if previously clicked
      } else {
        this.edges[id] = this.player;
        this.check_for_closed_box();
      }
    },
    start() {
      console.log("start game");
      this.is_playing = true;
    },
    init_edge_and_box_data() {
      this.edges = {};
      this.boxes = {};
      for (let row = 0; row <= this.size; row++) {
        for (let col = 0; col <= this.size; col++) {
          //don't need last column of horizontal edges
          if (col < this.size) this.edges[this.get_id("h", row, col)] = 0;

          //don't need last row of vertical edges
          if (row < this.size) this.edges[this.get_id("v", row, col)] = 0;

          //don't need last row OR col for boxes
          if (col < this.size && row < this.size)
            this.boxes[this.get_id("b", row, col)] = 0;
        }
      }
    },
    check_for_closed_box() {
      let a_box_was_enclosed = false;

      for (let col = 0; col <= this.size; col++) {
        for (let row = 0; row <= this.size; row++) {
          let a = this.get_id("h", row, col);
          let b = this.get_id("h", row + 1, col);
          let l = this.get_id("v", row, col);
          let r = this.get_id("v", row, col + 1);
          const above = this.edges[a];
          const below = this.edges[b];
          const left = this.edges[l];
          const right = this.edges[r];
          const box_id = this.get_id("b", row, col);
          const is_empty = !(box_id in this.boxes) || this.boxes[box_id] === 0;
          let this_box_was_enclosed =
            above && below && left && right && is_empty;
          if (this_box_was_enclosed) {
            a_box_was_enclosed = true;
            this.boxes[box_id] = this.player;
            this.scores[`p${this.player}`] = this.count_player_boxes();
            this.check_for_winner();
          }
        }
      }
      if (!a_box_was_enclosed) this.player_toggle();
    },
    check_for_winner() {
      this.winner_message = "";
      this.winner_player = 0;
      let winner = this.player;
      let all_boxes_enclosed =
        this.scores.p1 + this.scores.p2 === this.size * this.size;
      if (all_boxes_enclosed) {
        if (this.scores.p1 > this.scores.p2) {
          this.winner_message = "Player 1 wins! Play again?";
          this.games.p1 = this.games.p1 + 1;
          winner = 1;
        } else if (this.scores.p2 > this.scores.p1) {
          this.winner_message = "Player 2 wins! Play again?";
          this.games.p2 = this.games.p2 + 1;
          winner = 2;
        } else {
          this.winner_message = "It's a draw! Play again?";
        }
        this.winner_player = winner;
        setTimeout(() => document.getElementById("winner").focus(), 200);
        if (winner !== this.player) this.player_toggle();
      }
    },
    count_player_boxes() {
      return Object.values(this.boxes).reduce((count, value) => {
        return value === this.player ? count + 1 : count;
      }, 0);
    },
    get_row_col_from_id(id) {
      const parts = id.split("-"); // ["h", "row", "0", "col", "0"]
      const row = parseInt(parts[2], 10);
      const col = parseInt(parts[4], 10);

      let is_vertical = id[0] === "v";
      let box_row = row;
      let box_col = is_vertical ? col - 1 : col;

      return { row, col, box_row, box_col };
    },
    get_id(prefix, row, col) {
      return `${prefix}-row-${row}-col-${col}`;
    },
    style_square(row, col) {
      return `top:${row * this.cell_size}px; left:${col * this.cell_size}px; width:${this.cell_size}px; height:${this.cell_size}px;`;
    },
    style_edge_h(row, col) {
      return `top:${row * this.cell_size}px; left:${col * this.cell_size}px; width:${this.cell_size}px;`;
    },
    style_edge_v(row, col) {
      return `top:${row * this.cell_size}px; left:${col * this.cell_size - 2}px; height: ${this.cell_size}px;`;
    },
    style_vertex(row, col) {
      return `top: ${row * this.cell_size}px; left: ${col * this.cell_size}px;`;
    },
    class_edge_color(prefix, row, col) {
      return (
        (this.edges[this.get_id(prefix, row, col)] === 1 && "p1") ||
        (this.edges[this.get_id(prefix, row, col)] === 2 && "p2")
      );
    },
    class_box_color(prefix, row, col) {
      return (
        (this.boxes[this.get_id(prefix, row, col)] === 1 && "p1") ||
        (this.boxes[this.get_id(prefix, row, col)] === 2 && "p2")
      );
    },
    class_winner_color() {
      return (
        (this.winner_player === 1 && "p1") ||
        (this.winner_player === 2 && "p2") +
          (this.winner_message && " show_inline_block")
      );
    },
    get columns() {
      return Array.from({ length: this.size + 1 }, (_, index) => index);
    },
    get style_grid() {
      let s = this.size * this.cell_size;
      return `width:${s}px; height:${s}px;`;
    },
    get score_p1() {
      return "Player 1 score: " + this.scores.p1;
    },
    get score_p2() {
      return "Player 2 score: " + this.scores.p2;
    },
    get games_p1() {
      return this.games.p1;
    },
    get games_p2() {
      return this.games.p2;
    },
  }));
});
