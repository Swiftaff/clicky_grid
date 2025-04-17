app.init(
  {
    testy2: {
      for_array: [2, 3, 4],
      //for_item: "thingy",
      //for_index: "num",
      class_toggles: [["highlight", (item, idx) => app.store.size == item]],
    },
    testy3: {
      for_array: [5, 6, 7],
      class_toggles: [["highlight", (item, idx) => app.store.size == item]],
    },
  },
  {
    size: 2,
  },
);
