const app = {
  init,
  reset_dom,
};

function init(obj, store = {}) {
  app.components = obj;
  app.store = {
    ...store,
    set: (key, val) => {
      app.store[key] = val;
      app.reset_dom();
    },
  };
  app.reset_dom();
}

function reset_dom() {
  console.log("reset_dom");

  //find and delete previously added dom elements
  const silly_templates = document.querySelectorAll("[data-is_silly]");
  console.log(silly_templates);
  silly_templates.forEach((t) => t.remove());

  //find templates in the dom
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

      //handle for loop
      if ("for_array" in component_definition) {
        let for_array = component_definition.for_array;
        console.log("for_array", for_array);

        let for_item = component_definition.for_item || "item";
        console.log("for_item", for_item);

        let for_index = component_definition.for_index || "index";
        console.log("for_index", for_index);

        let template_el = app.templates[component_name];
        console.log("template_el", template_el, template_el.innerHTML);

        const fragment = document.createDocumentFragment();

        for_array.forEach((item, idx) => {
          //add conditional classes
          let content = template_el.content.cloneNode(true);
          if ("class_toggles" in component_definition) {
            let class_toggles = component_definition.class_toggles;
            class_toggles.forEach(([class_name, fn]) => {
              if (fn(item, idx))
                content.firstElementChild.classList.add(class_name);
            });
          }
          content.firstElementChild.dataset.is_silly = true;
          fragment.appendChild(content);

          //replace for loop variables
          const tmp = document.createElement("div");
          tmp.append(...fragment.childNodes);
          tmp.innerHTML = tmp.innerHTML
            .replaceAll("$" + for_item, item)
            .replaceAll("$" + for_index, idx);
          while (fragment.firstChild) fragment.removeChild(fragment.firstChild);
          fragment.append(...tmp.childNodes);
        });

        template_el.after(fragment);
      }
    }
  });
}
