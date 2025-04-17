//Library
const app = {
  init,
};

function init(obj) {
  app.components = obj;

  const templates = document.querySelectorAll("template[component]");

  app.templates = Array.from(templates).reduce((map, tpl) => {
    const name = tpl.getAttribute("component");
    if (name) map[name] = tpl;
    return map;
  }, {});
  console.log(app.templates);

  Object.keys(app.components).map((component_name) => {
    console.log("name", component_name);
    if (component_name in app.components) {
      let component_definition = app.components[component_name];
      console.log("component_definition", component_definition);

      if ("for_array" in component_definition) {
        let for_array = component_definition.for_array;
        console.log("for_array", for_array);

        let for_item = component_definition.for_item || "item";
        console.log("for_item", for_item);

        let for_index = component_definition.for_index || "index";
        console.log("for_index", for_index);

        let template_el = app.templates[component_name];
        console.log("template_el", template_el, template_el.innerHTML);

        let final_inner_html = for_array
          .map((item, index) =>
            template_el.innerHTML
              .replaceAll("$" + for_item, item)
              .replaceAll("$" + for_index, index),
          )
          .join("");
        console.log("final_inner_html", final_inner_html);
        template_el.innerHTML = final_inner_html;

        template_el.after(template_el.content.cloneNode(true));
      }
    }
  });
}

//App
app.init({
  testy: {
    for_array: [10, 20, 30],
    for_item: "thingy",
    for_index: "num",
  },
  testy2: {
    for_array: [2, 3, 4],
  },
  testy3: {
    for_array: [5, 6, 7],
  },
});
