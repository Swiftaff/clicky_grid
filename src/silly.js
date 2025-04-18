const app = {
  init,
  reset_dom,
  templates: {},
  templates_new: [],
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

  remove_previous_silly_elements();
  find_silly_templates();
  render_silly_templates_into_dom();
}

function render_silly_templates_into_dom() {
  //render each template into the dom
  console.log();
  console.log("====");
  console.log("render templates");

  //new way using just templates
  Object.values(app.templates_new).forEach((t, i) => {
    console.log();
    console.log(i, "###", "name", t);
    if ("for" in t.attributes) {
      handle_for_loop_new(t);
    }
  });

  //old way - using js object
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

function collect_root_templates() {
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

function handle_for_loop_new(t) {
  console.log(t);
  let for_array = eval(t.attributes["for"].value);
  console.log("for_array", for_array);

  let item_key = "item";
  //  ("for_item" in t.attributes && t.attributes["for_item"].value) || "item";
  console.log("item_key", item_key);

  let item_index = "index";
  //  ("for_index" in t.attributes && t.attributes["for_index"].value) || "index";
  console.log("item_index", item_index);

  const fragment = document.createDocumentFragment();

  for_array.forEach((item, index) => {
    let content = t.content.cloneNode(true);
    content.firstElementChild.dataset.is_silly = true;

    replace_placeholders(content, (tmp) => {
      //these act on the contents of the temp div (containing any childNodes)
      html_replace_placeholders_for_loop(
        item_key,
        item_index,
        index,
        item,
        tmp,
      );
      html_replace_placeholders_store(tmp);
      //this acts on each of the childNodes
      get_el_with_conditional_classes_for_loop_new(tmp, item, index);
    });

    fragment.appendChild(content);
  });

  t.after(fragment);
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

  let template_el = app.templates[component_name].el;
  console.log("name", component_name);
  console.log("template_el", template_el, template_el.innerHTML);

  const fragment = document.createDocumentFragment();

  for_array.forEach((item, index) => {
    const content = get_el_with_conditional_classes_for_loop(
      template_el,
      component_definition,
      item,
      index,
    );
    fragment.appendChild(content);

    replace_placeholders(fragment, (tmp) => {
      html_replace_placeholders_for_loop(
        item_key,
        item_index,
        index,
        item,
        tmp,
      );
      html_replace_placeholders_store(tmp);
    });
  });

  template_el.after(fragment);
}

function replace_placeholders(fragment, fn) {
  //run a function on the fragment in a temp div, to search/replace for html placeholders like $index
  const tmp = document.createElement("div");
  tmp.append(...fragment.childNodes);
  fn(tmp);
  while (fragment.firstChild) {
    fragment.removeChild(fragment.firstChild);
  }
  fragment.append(...tmp.childNodes);
}

function get_el_with_conditional_classes_for_loop_new(tmp, item, index) {
  //console.log("#####get_el_with_conditional_classes_for_loop_new", tmp);
  tmp.childNodes.forEach((c) => {
    console.log("!!!!", c);

    if (c.nodeType !== 3 && "class_toggles" in c.attributes) {
      let class_toggles = eval(c.attributes["class_toggles"].value);
      //console.log(class_toggles);
      class_toggles.forEach(([class_name, fn]) => {
        console.log(class_name, fn, item, index, fn(item, index));
        if (fn(item, index)) c.classList.add(class_name);
      });
    }
  });
}

function get_el_with_conditional_classes_for_loop(
  template_el,
  component_definition,
  item,
  index,
) {
  let content = template_el.content.cloneNode(true);
  if ("class_toggles" in component_definition) {
    let class_toggles = component_definition.class_toggles;
    class_toggles.forEach(([class_name, fn]) => {
      if (fn(item, index)) content.firstElementChild.classList.add(class_name);
    });
  }
  content.firstElementChild.dataset.is_silly = true;
  return content;
}

function handle_default_template(component_definition, component_name) {
  console.log();
  console.log("====");
  console.log("b. handle default template");
  let template_el = app.templates[component_name].el;
  console.log("name", component_name);
  console.log("template_el", template_el);

  const fragment = document.createDocumentFragment();

  let content = template_el.content.cloneNode(true);
  content.firstElementChild.dataset.is_silly = true;
  fragment.appendChild(content);

  replace_placeholders(fragment, html_replace_placeholders_store);

  template_el.after(fragment);
}

function html_replace_placeholders_for_loop(
  item_key,
  item_index,
  index,
  item,
  tmp,
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

function find_silly_templates() {
  //find templates in the dom
  const { templates, nested_templates } = collect_root_templates();
  app.templates_new = [...nested_templates, ...templates];
  app.templates = Array.from(app.templates_new).reduce((map, el) => {
    const name = el.getAttribute("component");
    if (name) map[name] = { el };
    return map;
  }, {});
  console.log("templates", app.templates, app.templates_new);
}

function remove_previous_silly_elements() {
  const silly_els = document.querySelectorAll("[data-is_silly]");
  let silly_templates = Object.values(app.templates).flatMap((tpl) =>
    Array.from(tpl.el.content.querySelectorAll("[data-is_silly]")),
  );
  silly_templates = [...silly_templates, ...silly_els];
  console.log("silly templates", silly_templates);
  silly_templates.forEach((t) => t.remove());
}
