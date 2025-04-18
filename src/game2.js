app.init(
  {
    size_buttons1: {
      for_array: [2, 3, 4],
      //for_item: "thingy",
      //for_index: "num",
      class_toggles: [["highlight", (item, idx) => app.store.size == item]],
    },
    size_buttons2: {
      for_array: [5, 6, 7],
      class_toggles: [["highlight", (item, idx) => app.store.size == item]],
    },
    grid_new: {
      for_array: [0, 1, 2, 3],
    },
    outer_grid: {},
  },
  {
    size: 2,
  },
);
