const app = {
  init,
  reset_dom,
  templates: [],
};

function init(obj, store = {}) {
  console.log();
  console.log("====");
  console.log("init");
  //create hoisted div to temporarily contain nested templates later
  app.hoisted = document.createElement("div");
  app.hoisted.style = "display: none; visibility:hidden;";
  document.body.appendChild(app.hoisted);

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
  console.log();
  console.log("====");
  console.log("reset_dom");

  //find and delete previously added dom elements
  console.log(app.templates);
  const silly_els = document.querySelectorAll("[data-is_silly]");
  let silly_templates = Object.values(app.templates).flatMap((tpl) =>
    Array.from(tpl.content.querySelectorAll("[data-is_silly]")),
  );
  silly_templates = [...silly_templates, ...silly_els];
  console.log("silly templates", silly_templates);
  silly_templates.forEach((t) => t.remove());

  //find templates in the dom
  const { templates, nested_templates } = collect_templates();
  console.log("templates", templates, nested_templates);
  app.templates = Array.from([...nested_templates, ...templates]).reduce(
    (map, tpl) => {
      const name = tpl.getAttribute("component");
      if (name) map[name] = tpl;
      return map;
    },
    {},
  );
  console.log(app.templates);

  //render each template into the dom
  console.log();
  console.log("====");
  console.log("render templates");
  Object.keys(app.components).map((component_name, i) => {
    console.log();
    console.log(i, ".", "name", component_name);
    if (component_name in app.components) {
      let component_definition = app.components[component_name];
      console.log("component_definition", component_definition);
      if ("for_array" in component_definition) {
        handle_for_loop(component_definition, component_name);
      } else {
        handle_default_template(component_definition, component_name);
      }
    }
  });
}

function collect_templates() {
  const templates = Array.from(document.querySelectorAll("template"));
  let nested_templates = [];
  templates.forEach(
    (tpl) =>
      (nested_templates = [
        ...nested_templates,
        ...collect_nested_templates(tpl.content),
      ]),
  );
  return { templates, nested_templates };
}

function collect_nested_templates(fragment) {
  let nested_templates = [];
  Array.from(fragment.querySelectorAll("template")).forEach((tpl) => {
    nested_templates.push(tpl);
    // dig deeper in case of multi‑level nesting
    nested_templates = [
      ...nested_templates,
      ...collect_nested_templates(tpl.content),
    ];
  });
  return nested_templates;
}

function handle_for_loop(component_definition, component_name) {
  console.log();
  console.log("====");
  console.log("a. handle for loop");
  let for_array = component_definition.for_array;
  console.log("for_array", for_array);

  let item_key = component_definition.item_key || "item";
  console.log("item_key", item_key);

  let item_index = component_definition.item_index || "index";
  console.log("item_index", item_index);

  let template_el = app.templates[component_name];
  console.log("name", component_name);
  console.log("template_el", template_el, template_el.innerHTML);

  const fragment = document.createDocumentFragment();

  for_array.forEach((item, index) => {
    //add conditional classes
    let content = template_el.content.cloneNode(true);
    if ("class_toggles" in component_definition) {
      let class_toggles = component_definition.class_toggles;
      class_toggles.forEach(([class_name, fn]) => {
        if (fn(item, index))
          content.firstElementChild.classList.add(class_name);
      });
    }
    content.firstElementChild.dataset.is_silly = true;
    fragment.appendChild(content);

    //replace for loop variables
    const tmp = document.createElement("div");
    tmp.append(...fragment.childNodes);

    html_replace_placeholders_for_loop(tmp, item_key, item_index, index, item);
    html_replace_placeholders_store(tmp);

    while (fragment.firstChild) fragment.removeChild(fragment.firstChild);
    fragment.append(...tmp.childNodes);
  });

  template_el.after(fragment);
}

function handle_default_template(component_definition, component_name) {
  console.log();
  console.log("====");
  console.log("b. handle default template");
  let template_el = app.templates[component_name];
  console.log("name", component_name);
  console.log("template_el", template_el);

  const fragment = document.createDocumentFragment();

  let content = template_el.content.cloneNode(true);
  content.firstElementChild.dataset.is_silly = true;
  fragment.appendChild(content);

  //replace state variables
  const tmp = document.createElement("div");
  tmp.append(...fragment.childNodes);

  html_replace_placeholders_store(tmp);

  while (fragment.firstChild) fragment.removeChild(fragment.firstChild);
  fragment.append(...tmp.childNodes);

  template_el.after(fragment);
}

function html_replace_placeholders_for_loop(
  tmp,
  item_key,
  item_index,
  index,
  item,
) {
  tmp.innerHTML = tmp.innerHTML
    .replaceAll("$" + item_key, item)
    .replaceAll("$" + item_index, index);
}

function html_replace_placeholders_store(tmp) {
  Object.keys(app.store).forEach((k) => {
    const v = app.store[k];
    tmp.innerHTML = tmp.innerHTML.replaceAll("$" + k, v);
  });
}
