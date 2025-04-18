const app = {
  init,
  reset_dom,
  templates: [],
};

function init(store = {}) {
  console.log("====");
  console.log("init");
  app.store = {
    ...store,
    set: (key, val) => {
      app.store[key] = val;
      reset_dom();
    },
  };
  reset_dom();
}

function reset_dom() {
  console.log("- reset_dom");
  remove_previous_silly_elements();
  find_silly_templates();
  render_silly_templates_into_dom();
}

function render_silly_templates_into_dom() {
  //render each template into the dom
  console.log("- - render templates");
  Object.values(app.templates).forEach((t, i) => {
    if ("for" in t.attributes) handle_template__for_loop(t);
    else handle_template__default(t);
  });
}

function collect_root_templates() {
  console.log("- - - collect root templates");
  const templates = Array.from(
    document.querySelectorAll("template[component]"),
  );
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
  console.log("- - - - collect nested templates");
  let nested_templates = [];
  Array.from(fragment.querySelectorAll("template[component]")).forEach(
    (tpl) => {
      nested_templates.push(tpl);
      nested_templates = [
        ...nested_templates,
        ...collect_nested_templates(tpl.content),
      ];
    },
  );
  return nested_templates;
}

function handle_template__for_loop(t) {
  console.log("- - - handle_template__for_loop", t.attributes["for"].value);
  let for_array = eval(
    html_replace_placeholders_store(t.attributes["for"].value),
  );
  if (typeof for_array === "number") for_array = [...Array(for_array).keys()];
  console.log("####", for_array);
  let item_key = "item";
  let item_index = "index";

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

function handle_template__default(t) {
  console.log("- - - handle_template__default");
  const fragment = document.createDocumentFragment();
  let content = t.content.cloneNode(true);
  content.firstElementChild.dataset.is_silly = true;
  replace_placeholders(
    content,
    html_replace_placeholders_store,
    //TODO conditional classes (not for loop - just store?);
  );
  fragment.appendChild(content);
  t.after(fragment);
}

function replace_placeholders(fragment, fn) {
  console.log("- - - - replace placeholders");
  //run a function on the fragment in a temp div, to search/replace for html placeholders like $index
  const tmp = document.createElement("div");
  tmp.append(...fragment.childNodes);
  fn(tmp);
  while (fragment.firstChild) fragment.removeChild(fragment.firstChild);
  fragment.append(...tmp.childNodes);
}

function get_el_with_conditional_classes_for_loop_new(tmp, item, index) {
  tmp.childNodes.forEach((c) => {
    if (c.nodeType !== 3 && "class_toggles" in c.attributes) {
      let class_toggles = eval(c.attributes["class_toggles"].value);
      class_toggles.forEach(([class_name, fn]) => {
        if (fn(item, index)) c.classList.add(class_name);
      });
    }
  });
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
  console.log(Object.keys(app.store), tmp);
  Object.keys(app.store).forEach((k) => {
    const v = app.store[k];
    //return value for replacing simple values in attributes
    if (typeof tmp === "string") tmp = tmp.replaceAll("$" + k, v);
    //else replace any occurrence across the html contents of a parent div
    else tmp.innerHTML = tmp.innerHTML.replaceAll("$" + k, v);
  });
  return tmp;
}

function find_silly_templates() {
  console.log("- - find silly templates");
  const { templates, nested_templates } = collect_root_templates();
  app.templates = [...nested_templates, ...templates];
  console.log("    ", app.templates);
}

function remove_previous_silly_elements() {
  console.log("- - remove previous silly elements");
  const silly_els = document.querySelectorAll("[data-is_silly]");
  let silly_templates = Object.values(app.templates).flatMap((tpl) =>
    Array.from(tpl.content.querySelectorAll("[data-is_silly]")),
  );
  silly_templates = [...silly_templates, ...silly_els];
  console.log("    ", silly_templates);
  silly_templates.forEach((t) => t.remove());
}
