const app = {
  init,
  reset_dom,
  templates: [], //[{ t: actual template dom ref, id: hierarchy "0.3.1" }]
  hoisted: {},
  store: {},
  store_set: (key, val) => {
    app.store[key] = val;
    reset_dom();
  },
};

function init(store = {}) {
  console.log("====");
  console.log("init", store);
  app.store = { ...store };
  reset_dom();
}

function reset_dom() {
  //console.log("- reset_dom");
  remove_previous_silly_elements(document);
  find_silly_templates();
  hoist_scoped_variables();
  render_silly_templates_into_dom();
}

function hoist_scoped_variables() {
  //iterate from top to bottom to store all for loop variables
  //so they are available when rendering from bottom to top
  Object.values(app.templates.reverse()).forEach((t, i) => {
    if ("for" in t.t.attributes) hoist_variables_from__for_loop(t);
  });
}

function render_silly_templates_into_dom() {
  //render each template into the dom
  //from bottom to top, so they are properly nested into parent templates
  //console.log("- - render templates");
  Object.values(app.templates).forEach((t, i) => {
    //console.log(t);
    let is_if = "if" in t.t.attributes;
    let is_for = "for" in t.t.attributes;
    if (!is_if || (is_if && handle_template__if(t))) {
      if (is_for) handle_template__for_loop(t);
      else handle_template__default(t);
    }
  });
}

function hoist_variables_from__for_loop(t) {
  //Only checks for key/index nam clash.
  //Doesn't check for parent or store name clashes.
  //This allows for the same named items at each scope level if needed.
  let { item_key, item_index } = get_item_index_from_attributes(t);
  console.log("hoist_variables_from__for_loop", item_key, item_index);
  let h_item_key = `${item_key}[${t.id}]`;
  let h_item_index = `${item_index}[${t.id}]`;
  app.hoisted[h_item_key] = null;
  app.hoisted[h_item_index] = null;
  if (item_key === item_index)
    console.error(`"${item_key}"`, "name conflict: for loop key and index");
}

function get_item_index_from_attributes(t) {
  let item_key =
    "for_item" in t.t.attributes ? t.t.attributes.for_item.value : "item";
  let item_index =
    "for_index" in t.t.attributes ? t.t.attributes.for_index.value : "index";
  return { item_key, item_index };
}

function collect_root_templates() {
  //console.log("- - - collect root templates");
  const templates = Array.from(
    document.querySelectorAll("template[component]"),
  ).map((t, i) => {
    return {
      t,
      id: "0." + i,
    };
  });
  let nested_templates = [];
  templates.forEach(
    (t) =>
      (nested_templates = [
        ...nested_templates,
        ...collect_nested_templates(t.t.content, t.id),
      ]),
  );
  console.log({ templates, nested_templates });
  return { templates, nested_templates };
}

function collect_nested_templates(fragment, parent_id = "0") {
  //console.log("- - - - collect nested templates");
  let nested_templates = [];
  Array.from(fragment.querySelectorAll("template[component]")).forEach(
    (t, i) => {
      let id = parent_id + "." + i;
      nested_templates.push({ t, id });
      nested_templates = [
        //deeper templates need to come first so they are processed first
        ...collect_nested_templates(t.content, id),
        ...nested_templates,
      ];
    },
  );
  return nested_templates;
}

function handle_template__if(t) {
  console.log("- - - handle_template__if", t.t.attributes.if.value);
  let replaced = html_replace_placeholders_store(t.t.attributes.if.value);
  replaced = html_replace_placeholders_hoisted(replaced, t.id);
  console.log(replaced);
  let e = eval(replaced);
  console.log(e);
  return e;
}

function handle_template__for_loop(t) {
  //console.log("- - - handle_template__for_loop", t.t.attributes.for.value);
  let for_array = eval(
    html_replace_placeholders_store(t.t.attributes.for.value),
  );
  if (typeof for_array === "number") for_array = [...Array(for_array).keys()];
  //console.log("####", for_array);
  let { item_key, item_index } = get_item_index_from_attributes(t);

  const fragment = document.createDocumentFragment();
  for_array.forEach((item, index) => {
    let content = t.t.content.cloneNode(true);
    //console.log(content);
    content.firstElementChild.dataset.is_silly = true;
    //console.log(content.firstElementChild);
    replace_placeholders(content, (tmp) => {
      //these act on the contents of the temp div (containing any childNodes)
      //and set app.hoisted variables for use below
      html_replace_placeholders_for_loop(
        item_key,
        item_index,
        index,
        item,
        tmp,
        t.id,
      );
      html_replace_placeholders_store(tmp);
      html_replace_placeholders_hoisted(tmp, t.id),
        //this acts on each of the childNodes
        get_el_with_conditional_classes_for_loop_new(tmp, item, index);
      //t.t.content = content;
    });
    //console.log(content.firstElementChild);
    fragment.appendChild(content);
  });
  remove_child_templates_and_silly_items(fragment, t.id);
  t.t.after(fragment);
}

function handle_template__default(t) {
  //console.log("- - - handle_template__default", t.id);
  const fragment = document.createDocumentFragment();
  let content = t.t.content.cloneNode(true);
  content.firstElementChild.dataset.is_silly = true;
  replace_placeholders(
    content,
    html_replace_placeholders_store,
    //TODO conditional classes (not for loop - just store?);
  );
  fragment.appendChild(content);
  //if (t.t.id === "a") console.log("#!#!#!#!#!#!# a", t);
  remove_child_templates_and_silly_items(fragment);
  t.t.after(fragment);
}

function replace_placeholders(fragment, fn) {
  //console.log("- - - - replace placeholders");
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
      let class_toggles = eval(c.attributes.class_toggles.value);
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
  id,
) {
  tmp.innerHTML = tmp.innerHTML
    .replaceAll("$" + item_key, item)
    .replaceAll("$" + item_index, index);
  let h_item_key = `${item_key}[${id}]`;
  let h_item_index = `${item_index}[${id}]`;
  app.hoisted[h_item_key] = item;
  app.hoisted[h_item_index] = index;
  //console.log(h_item_key, h_item_index, app.hoisted);
}

function html_replace_placeholders_store(tmp) {
  //console.log(Object.keys(app.store), tmp);
  Object.keys(app.store).forEach((k) => {
    const v = app.store[k];
    //return value for replacing simple values in attributes
    if (typeof tmp === "string") tmp = tmp.replaceAll("$" + k, v);
    //else replace any occurrence across the html contents of a parent div
    else tmp.innerHTML = tmp.innerHTML.replaceAll("$" + k, v);
  });
  return tmp;
}

function html_replace_placeholders_hoisted(tmp, id) {
  //console.log("html_replace_placeholders_hoisted", app.hoisted, tmp, id);
  Object.keys(app.hoisted)
    .filter((name_id) => has_this_or_parent_id(name_id, id))
    .forEach((name_id) => {
      let k = get_name_from_name_id(name_id);
      let v = app.hoisted[name_id];
      //console.log(k, v);
      //return value for replacing simple values in attributes
      if (typeof tmp === "string") tmp = tmp.replaceAll("$" + k, v);
      //else replace any occurrence across the html contents of a parent div
      else tmp.innerHTML = tmp.innerHTML.replaceAll("$" + k, v);
    });
  return tmp;
}

function has_this_or_parent_id(name_id, id) {
  id = "" + id;
  let hoisted_id = get_id_from_name_id(name_id);
  let bool = id.startsWith(hoisted_id);
  //console.log(name_id, id, bool);
  // e.g. true: id="0.3.2", name_id="0.3.2" // yes if same scope level
  // e.g. true: id="0.3.2", name_id="0.3" //yes if ancestor scope level
  // e.g. false: id="0.3.2", name_id="0.3.1" // no if siblings
  // e.g. false: id="0.3.2", name_id="0.3.2.1" // no if children
  return bool;
}

function get_name_from_name_id(name_id) {
  let split = name_id.split("[");
  let name = "ERROR";
  if (split.length) {
    name = split[0];
  }
  return name;
}

function get_id_from_name_id(name_id) {
  // e.g. get "0.3.2" from "my_key[0.3.2]"
  let id = "ERROR";
  let split = name_id.split("[");
  if (split.length > 1) {
    let split2 = split[1].split("]");
    if (split2.length) {
      id = split2[0];
    }
  }
  return id;
}

function find_silly_templates() {
  //console.log("- - find silly templates");
  const { templates, nested_templates } = collect_root_templates();
  app.templates = [...nested_templates, ...templates];
  //console.log("    ", app.templates);
}

function remove_previous_silly_elements(el) {
  //console.log("- - remove previous silly elements");
  const silly_els = el.querySelectorAll("[data-is_silly]");
  let silly_templates = Object.values(app.templates).flatMap((t) =>
    Array.from(t.t.content.querySelectorAll("[data-is_silly]")),
  );
  silly_templates = [...silly_templates, ...silly_els];
  //console.log("    ", silly_templates);
  silly_templates.forEach((t) => t.remove());
}

function remove_child_templates_and_silly_items(fragment, parent_id) {
  let nested = collect_nested_templates(fragment, parent_id);
  nested.forEach((n) => {
    //remove_previous_silly_elements(n);
    //  console.log(n);
    n.t.remove();
  });
}
