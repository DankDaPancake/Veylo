/* Global inputs come from the local kit, manifest and contract scripts. */
(() => {
  const stage = document.querySelector("#stage");
  const screenSelect = document.querySelector("#gallery-screen");
  const simulation = document.querySelector("#simulate");
  const themeButton = document.querySelector("#toggle-theme");
  const params = new URLSearchParams(location.search);
  const screenMap = new Map(SCREENS.map((entry) => [entry.id, entry]));
  const blankFilters = { keyword: "", status: "", from: "", to: "" };
  const importErrors = {
    type: ["S06-01-file-type", "Choose a CSV file", "This file type is unsupported. Select a file ending in .csv."],
    empty: ["S06-01-file-empty", "The file is empty", "Select a CSV with a header and at least one data record."],
    "empty-header": ["S06-01-file-empty-header", "The file contains only a header", "Add at least one order record below the header."],
    header: ["S06-01-file-header", "The header does not match the template", "Use the seven required columns in template order. The final note column is optional."],
    limit: ["S06-01-file-limit", "Too many order records", "The maximum is 500 data records per file. Reduce the number of records and try again."],
    "limit-bytes": ["S06-01-file-limit-bytes", "The CSV is too large", "The maximum file size is 1,000,000 bytes. Select a smaller file."],
    format: ["S06-01-file-format", "Malformed CSV", "Check quotes, commas and record breaks."],
    "format-encoding": ["S06-01-file-format-encoding", "The file is not valid UTF-8", "Save as UTF-8 with or without a BOM and select it again."],
    "format-width": ["S06-01-file-format-width", "A record has the wrong number of columns", "Check the number of fields against the header."],
  };
  const errorsByScreen = new Map(Object.values(importErrors).map((error) => [error[0], error]));
  const seed = Array.from({ length: 24 }, (_, i) => ({
    ...F02.example,
    order_code: `F02-${101 + i}`,
    recipient_name: `Demo Recipient ${101 + i}`,
    recipient_phone: `0000000${101 + i}`,
    destination_address: `${10 + i} Example Lane, Demo Ward`,
    status: i === 5 ? "CANCELLED" : "NEW",
    reason: i === 5 ? "Synthetic recipient requested cancellation." : "",
  })).reverse();
  seed.push({ ...seed.at(-1), order_code: "F02-500", recipient_name: "Demo Existing Recipient", status: "NEW" });
  const demoBatch = Array.from({ length: 20 }, (_, i) => ({
    ...F02.example,
    order_code: `F02-${String(i + 1).padStart(3, "0")}`,
    recipient_name: `Demo Recipient ${String(i + 1).padStart(2, "0")}`,
  }));
  const demoInvalid = [
    F02.example,
    { ...demoBatch[1], order_code: " f02-001 ", recipient_phone: "abc", destination_address: "", window_end: F02.example.window_start, weight_kg: "0" },
    { ...demoBatch[1], order_code: "F02-500" },
  ];

  const esc = (value = "") => String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[ch]);
  const button = (label, action, style = "glass", icon = "") =>
    `<button class="btn btn--${style}" type="button" data-action="${action}">${icon}${label}</button>`;
  const submit = (label, style = "primary") => `<button class="btn btn--${style}" type="submit">${label}</button>`;
  const row = (...actions) => `<div class="action-row">${actions.join("")}</div>`;
  const badge = (status) => `<span class="badge badge--${status === "NEW" ? "success" : "error"}">${status}</span>`;
  const card = (html) => `<section class="glass-elevated f02-card">${html}</section>`;
  const fileLink = (label, file) => `<a class="btn btn--glass" href="../../fixtures/order-intake/orders-${file}.csv" download>${label}</a>`;
  const listButton = (label = "Back to orders") => button(label, "orders", "glass", ICONS.arrowLeft);
  const newButton = () => button("Create order", "create", "primary", ICONS.plus);
  const importButton = () => button("Import CSV", "import", "glass", ICONS.upload);

  let screen;
  let orders;
  let selected;
  let values;
  let fieldErrors;
  let filters;
  let pageNumber;
  let batch;
  let report;
  let fileName;
  let fileRecord;
  let imported;
  let reason;
  let conflictKind;
  let listNotice;
  let exited = false;

  function header(title, subtitle = "", actions = "") {
    return `<header class="page-header"><div><p class="eyebrow">Hub operations / Orders</p>
      <h1 class="page-title" tabindex="-1">${esc(title)}</h1>
      ${subtitle ? `<p class="page-subtitle">${esc(subtitle)}</p>` : ""}</div>${actions}</header>`;
  }

  function sidebar(restricted) {
    const links = [
      ["Orders", ICONS.package], ["Shifts", ICONS.calendar], ["Delivery attempts", ICONS.route],
      ["Location guides", ICONS.mapPin], ["Reports", ICONS.barChart],
    ];
    return `<div class="sidebar-wrap"><aside class="sidebar glass-chrome" aria-label="Workspace navigation">
      <div class="sidebar-brand"><div class="brand-lockup"><span class="brand-logo">${ICONS.truck}</span>
      <div><div class="brand-name">Veylo</div><div class="brand-role">${restricted ? "Staff workspace" : "Dispatcher"}</div></div></div></div>
      ${restricted ? "" : `<div class="hub-chip"><span class="hub-dot" aria-hidden="true"></span>Demo Hub · Synthetic</div>
      <ul class="nav-list">${links.map(([label, icon], i) => `<li>${i === 0
        ? `<button class="nav-item nav-item--active" data-action="orders" aria-current="page">${icon}<span>${label}</span></button>`
        : `<span class="nav-item" aria-disabled="true">${icon}<span>${label}</span></span>`}</li>`).join("")}</ul>
      <div class="sidebar-footer"><span class="avatar-glass" aria-hidden="true">DP</span><div><strong>Dispatcher Demo</strong><div>Role: Hub Dispatcher</div></div></div>`}
      </aside></div>`;
  }

  function banner(title, message, links = []) {
    return `<div class="alert-banner alert-banner--error" role="alert" tabindex="-1">${ICONS.alert}
      <div><p class="alert-banner-title">${esc(title)}</p><p class="alert-banner-body">${esc(message)}</p>
      ${links.length ? `<div class="alert-links">${links.map(([id, label]) => `<a class="alert-link" href="#${id}" data-field="${id}">${esc(label)}</a>`).join("")}</div>` : ""}
      </div></div>`;
  }

  function stateCard(title, text, actions, kind = "info") {
    const icon = kind === "error" ? ICONS.shieldAlert : kind === "success" ? ICONS.check : ICONS.package;
    return `<section class="glass-elevated state-card"><span class="state-icon-badge state-icon-badge--${kind}">${icon}</span>
      <div><h2 class="state-card-title">${esc(title)}</h2><p class="state-card-body">${esc(text)}</p></div>${actions}</section>`;
  }

  function editor(edit) {
    const title = edit ? "Edit order" : "Create order";
    const errors = Object.entries(fieldErrors);
    const summary = errors.length ? banner("Correct the highlighted fields",
      "Your other entries are still available.",
      errors.map(([key]) => [key, F02.fields.find(([field]) => field === key)[1]])) : "";
    return header(title, edit ? `${selected.order_code} · Demo Hub` : "Enter the recipient, destination and delivery window.", row(listButton()))
      + card(`${summary}<form id="order-form" data-edit="${edit}" novalidate><div class="field-grid">${F02.fields.map(([key, label, example]) => {
        const error = fieldErrors[key];
        const value = values[key] ?? "";
        const required = key !== "note";
        const classes = `input-glass${error ? " input-glass--error" : ""}`;
        const attrs = `id="${key}" name="${key}" class="${classes}"${error ? ` aria-invalid="true" aria-describedby="${key}-error"` : ""}${required ? " required" : ""}`;
        const input = key === "note" ? `<textarea ${attrs} rows="2">${esc(value)}</textarea>`
          : `<input ${attrs} value="${esc(value)}" placeholder="${esc(example)}"${edit && key === "order_code" ? " readonly" : ""}${key === "weight_kg" ? ' inputmode="decimal"' : ""}>`;
        return `<div class="field-group${key === "note" ? " full-field" : ""}"><label class="field-label" for="${key}">${label}</label>${input}
          ${error ? `<p class="field-error" id="${key}-error">${esc(error)}</p>` : ""}</div>`;
      }).join("")}</div>${row(submit(edit ? "Save changes" : "Save order"), button("Discard and return", edit ? "detail" : "orders"))}</form>`);
  }

  function displayValue(key, value) {
    if (key === "window_start" || key === "window_end") return value.replace("T", " ").replace("+07:00", " (UTC+7)");
    if (key === "weight_kg") return `${value} kg`;
    return value || "—";
  }

  function detail(notice = "") {
    return header(selected.order_code, "Order detail · Demo Hub", row(listButton()))
      + (notice ? `<div class="f02-status" role="status"><span class="badge badge--success">${esc(notice)}</span></div>` : "")
      + card(`<h2>Order details</h2>${badge(selected.status)}
      <dl class="detail-grid">${F02.fields.slice(1).map(([key, label]) =>
        `<div class="glass-subtle"><dt>${label}</dt><dd>${esc(displayValue(key, selected[key]))}</dd></div>`).join("")}
        ${selected.status === "CANCELLED" ? `<div class="glass-subtle"><dt>Cancellation reason</dt><dd>${esc(selected.reason)}</dd></div>` : ""}</dl>
        ${selected.status === "NEW" ? row(button("Edit order", "edit", "primary"), button("Cancel order", "cancel-order", "danger"))
          : row(button("Check edit availability", "edit"))}`);
  }

  function cancelScreen() {
    const error = screen === "S08-02-error";
    return header("Cancel order", `${selected.order_code} · Demo Hub`, row(button("Back to detail", "detail", "glass", ICONS.arrowLeft)))
      + card(`<h2>Confirm cancellation</h2><p>The order will remain in the list with status CANCELLED and the reason you enter.</p>
        ${error ? banner("Enter a cancellation reason", "Use 1–250 characters.", [["reason", "Cancellation reason"]]) : ""}
        <form id="reason-form" novalidate><div class="field-group"><label class="field-label" for="reason">Cancellation reason</label>
        <textarea class="input-glass${error ? " input-glass--error" : ""}" name="reason" id="reason" rows="3" required${error ? ' aria-invalid="true" aria-describedby="reason-error"' : ""}>${esc(reason)}</textarea>
        ${error ? '<p id="reason-error" class="field-error">Enter a reason of 1–250 characters.</p>' : ""}</div>
        ${row(submit("Confirm cancellation", "danger"), button("Keep order", "detail"))}</form>`);
  }

  function orderTable(records, label, preview = false) {
    return `<div class="glass-panel table-card f02-table${preview ? " import-table" : ""}" role="region" aria-label="${label}" tabindex="0">
      <table class="orders-table"><thead><tr>${preview ? '<th scope="col">Record</th>' : ""}
      <th scope="col">Order / Recipient</th><th scope="col">Delivery window (UTC+7)</th><th scope="col">Weight</th>
      ${preview ? "" : '<th scope="col">Status</th>'}</tr></thead>
      <tbody>${records.map((order, i) => `<tr>${preview ? `<td class="tabular">${i + 2}</td>` : ""}
        <td><div class="order-title-row">${preview ? `<strong class="order-id">${esc(order.order_code)}</strong>`
          : `<button type="button" class="order-id code-link" data-action="open" data-code="${esc(order.order_code)}">${esc(order.order_code)}</button>`}
          <span class="order-recipient">${esc(order.recipient_name)}</span></div><span class="order-address">${esc(order.destination_address)}</span></td>
        <td class="tabular">${esc(order.window_start.slice(0, 10))}<br>${esc(order.window_start.slice(11, 16))}–${esc(order.window_end.slice(11, 16))}</td>
        <td class="tabular">${esc(order.weight_kg)} kg</td>${preview ? "" : `<td>${badge(order.status)}</td>`}</tr>`).join("")}</tbody></table></div>`;
  }

  function filterForm(error) {
    return `<form class="glass-panel filters" id="filters">
      <div class="field-group"><label class="field-label" for="keyword">Search orders</label><input class="input-glass" type="search" id="keyword" name="keyword" value="${esc(filters.keyword)}" placeholder="Code, recipient or address"></div>
      <div class="field-group"><label class="field-label" for="filter-status">Status</label><select class="input-glass" name="status" id="filter-status">
      ${[["", "All statuses"], ["NEW", "NEW"], ["CANCELLED", "CANCELLED"]].map(([value, title]) =>
        `<option value="${value}"${filters.status === value ? " selected" : ""}>${title}</option>`).join("")}</select></div>
      <div class="field-group"><label class="field-label" for="from">Start date from</label><input class="input-glass" type="date" name="from" id="from" value="${esc(filters.from)}"></div>
      <div class="field-group"><label class="field-label" for="to">Start date to</label><input class="input-glass${error ? " input-glass--error" : ""}" type="date" name="to" id="to" value="${esc(filters.to)}"${error ? ' aria-invalid="true" aria-describedby="date-error"' : ""}></div>
      <div class="filter-submit">${submit("Apply filters")}</div>
      ${error ? '<p class="field-error full-field" id="date-error">End date must be on or after the start date.</p>' : ""}
      ${Object.values(filters).some(Boolean) ? row(button("Clear filters", "clear-filters")) : ""}
      </form>`;
  }

  function list() {
    const data = F02.searchOrders(orders, filters, pageNumber);
    const title = header("Orders", "Search and manage orders for Demo Hub.", row(newButton(), importButton()));
    if (!orders.length) return title + stateCard("No orders yet", "Create an order or import a CSV to start populating Demo Hub.", "");
    const filterError = screen === "S07-01-filter-error";
    const feedback = filterError ? banner("Check the date range", "End date must be on or after the start date.", [["to", "Start date to"]]) : "";
    const summary = listNotice ? `<p class="f02-status" role="status"><span class="badge badge--info">${esc(listNotice)}</span></p>` : "";
    if (filterError) return title + feedback + filterForm(true);
    if (!data.orders.length) return title + summary + filterForm(false) + stateCard("No matching orders", "Clear or change the active filters to see more orders.", row(button("Clear filters", "clear-filters")));
    const first = (data.page - 1) * 20 + 1;
    return title + summary + filterForm(false) + orderTable(data.orders, "Orders")
      + `<div class="table-footer"><span>${first}–${first + data.orders.length - 1} of ${data.total} orders · Page ${data.page} of ${data.pages}</span>
        ${row(data.page > 1 ? button("Previous page", "previous") : "", data.page < data.pages ? button("Next page", "next") : "")}</div>`;
  }

  function picker() {
    const error = errorsByScreen.get(screen);
    const details = fileRecord ? ` Record ${fileRecord} is affected.` : "";
    const feedback = error ? banner(error[1], `${fileName ? fileName + " · " : ""}${error[2]}${details}`) : "";
    return header("Import CSV", "Validate every record before confirming the import.", row(listButton()))
      + card(`${feedback}<h2>Select an order file</h2><p>CSV in UTF-8 · Up to 500 orders and 1,000,000 bytes.</p>
        <form id="import-form"><div class="glass-subtle import-zone"><label class="field-label" for="csv-file">CSV file</label>
        <input id="csv-file" name="file" type="file" required></div>
        ${row(submit("Check CSV"), fileLink("Download CSV template", "template"))}</form>
        ${row(fileLink("Download valid sample", "valid"), fileLink("Download invalid sample", "invalid"))}`);
  }

  function importPreview() {
    return header("Review import", "Confirm the batch after checking its contents.", row(listButton()))
      + card(`<h2>${batch.length} orders ready to import</h2><p>${esc(fileName)} · All records passed the preview check.</p>
        ${orderTable(batch, "Preview records", true)}
        ${row(button(`Import ${batch.length} orders`, "confirm-import", "primary"), button("Cancel import", "abandon-import"))}`);
  }

  function importReport() {
    const conflict = screen === "S06-02-conflict";
    return header("Import errors", "Correct the CSV and check the entire batch again.", row(listButton()))
      + card(`${banner(conflict ? "An order code was claimed after preview" : "The batch contains invalid records",
        `${fileName} · 0 orders imported.`)}
        <div class="glass-panel table-card f02-table error-table" role="region" aria-label="CSV diagnostics" tabindex="0">
          <table class="orders-table"><thead><tr><th scope="col">Record</th><th scope="col">Column</th><th scope="col">Reason</th></tr></thead>
          <tbody>${report.map((entry) => `<tr><td class="tabular">${entry.record}</td><td><code>${esc(entry.column)}</code></td><td>${esc(entry.reason)}</td></tr>`).join("")}</tbody></table>
        </div>${row(button("Choose a replacement CSV", "import", "primary"), fileLink("Download CSV template", "template"))}`);
  }

  function screenContent() {
    if (exited) return header("Staff workspace") + stateCard("Returned to workspace", "Order information is restricted.", "");
    if (screen.startsWith("S07-01") && !["S07-01-denied", "S07-01-session-expired"].includes(screen)) return list();
    if (screen.startsWith("S05-01")) return editor(false);
    if (screen === "S06-01" || errorsByScreen.has(screen)) return picker();
    if (screen === "S06-02") return importPreview();
    if (["S06-02-row-errors", "S06-02-conflict"].includes(screen)) return importReport();
    if (screen === "S06-03") return header("Import complete") + stateCard(`${imported} orders imported`, "The new orders are available in Demo Hub.", row(button("View orders", "orders", "primary")), "success");
    if (screen === "S07-02") return detail();
    if (screen === "S07-02-created") return detail("Order created");
    if (screen === "S07-02-updated") return detail("Order updated");
    if (screen === "S08-01" || screen === "S08-01-error") return editor(true);
    if (screen === "S08-02" || screen === "S08-02-error") return cancelScreen();
    if (screen === "S08-03") return detail("Order cancelled");
    if (screen === "S08-01-blocked") return header("Edit unavailable") + stateCard("This order cannot be edited", "Only a NEW order may be edited. This order is CANCELLED.", row(button("View order details", "detail", "primary")), "error");
    if (["S08-01-conflict", "S08-01-conflict-cancel"].includes(screen)) return header("Order changed") + stateCard("A newer version is available",
      `The ${conflictKind} was not saved. Reload the latest order before trying again.`,
      row(button("Reload order", "detail", "primary"), listButton()), "error");
    if (screen === "S08-03-already-cancelled") return header("Order already cancelled") + stateCard("The order is CANCELLED",
      `Original reason: ${selected.reason}`, row(button("View order details", "detail", "primary")), "error");
    if (screen === "S07-01-session-expired") return header("Session expired") + stateCard("Sign in to continue", "Your previous action will not be replayed.", row(button("Sign in", "sign-in", "primary")), "error");
    return header("Access restricted") + stateCard("This workspace is restricted", "Your account cannot access this order or action.", row(button("Return to staff workspace", "safe-exit", "primary")), "error");
  }

  function go(id, focus = true) {
    screen = id;
    screenSelect.value = id;
    stage.dataset.screen = id;
    const restricted = exited || id === "S07-01-denied" || id === "S07-01-session-expired";
    stage.innerHTML = `<section class="veylo-canvas veylo-canvas--desktop">${MAP_BACKDROP_SVG}
      <div class="app-shell">${sidebar(restricted)}<div class="workspace">${screenContent()}
      <footer class="workspace-footer"><span>PA3 · Section D</span><span>Synthetic prototype</span></footer></div></div></section>`;
    if (focus) {
      (stage.querySelector('[role="alert"]') ?? stage.querySelector("h1")).focus();
      window.scrollTo(0, 0);
    }
  }

  function openScenario(id, focus) {
    orders = seed.map((order) => ({ ...order }));
    selected = orders.find((order) => order.order_code === "F02-101");
    filters = { ...blankFilters };
    pageNumber = 1;
    values = { ...F02.example };
    fieldErrors = {};
    batch = demoBatch;
    report = [];
    fileName = "orders-valid.csv";
    fileRecord = 0;
    imported = 20;
    reason = "";
    conflictKind = "update";
    listNotice = "";
    simulation.value = "";
    exited = false;
    if (["S05-01-error", "S08-01-error"].includes(id)) {
      values = {
        ...(id === "S08-01-error" ? selected : F02.example),
        recipient_phone: "abc", destination_address: "", window_end: F02.example.window_start, weight_kg: "0",
      };
      fieldErrors = F02.orderErrors(values);
    }
    if (id === "S05-01-duplicate") {
      values.order_code = "f02-500";
      fieldErrors = { order_code: "Code already exists in this hub." };
    }
    if (id === "S08-01") values = F02.cleanOrder(selected);
    if (id === "S08-02") reason = "Synthetic recipient requested cancellation.";
    if (id === "S07-02-created") selected = { ...F02.example, status: "NEW" };
    if (["S07-02-updated", "S08-01-conflict", "S08-01-conflict-cancel"].includes(id)) selected.destination_address = "125 Example Lane, Demo Ward";
    if (id === "S08-01-conflict-cancel") conflictKind = "cancellation";
    if (["S08-03", "S08-03-already-cancelled", "S08-01-blocked"].includes(id)) selected = orders.find((order) => order.status === "CANCELLED");
    if (id === "S07-01-filtered") filters = { keyword: "F02-10", status: "NEW", from: "2026-11-21", to: "2026-11-21" };
    if (id === "S07-01-filter-error") filters = { ...blankFilters, from: "2026-11-22", to: "2026-11-21" };
    if (id === "S07-01-no-results") filters.keyword = "Example Z";
    if (id === "S07-01-import-cancelled") listNotice = "Import cancelled · 0 orders imported";
    if (id === "S07-01-page-2") pageNumber = 2;
    if (id === "S07-01-empty") orders = [];
    if (id === "S06-02-row-errors") {
      fileName = "orders-invalid.csv";
      report = F02.checkRows(demoInvalid.map(F02.cleanOrder), orders.map((order) => order.order_code));
    }
    if (id === "S06-02-conflict") report = F02.checkRows(batch, ["F02-001"]);
    if (id === "S06-01-file-format-width") fileRecord = 2;
    if (id === "S06-01-file-type") fileName = "orders.xlsx";
    go(id, focus);
  }

  function gate() {
    const mode = simulation.value;
    simulation.value = "";
    if (mode === "role" || mode === "hub") {
      go("S07-01-denied");
      return null;
    }
    if (mode === "expired") {
      go("S07-01-session-expired");
      return null;
    }
    return mode;
  }

  function showList() {
    const results = F02.searchOrders(orders, filters, pageNumber);
    if (!orders.length) go("S07-01-empty");
    else if (!results.total) go("S07-01-no-results");
    else if (results.page > 1) go("S07-01-page-2");
    else if (Object.values(filters).some(Boolean)) go("S07-01-filtered");
    else go("S07-01");
  }

  function orderByCode(code) {
    return orders.find((order) => F02.keyOf(order.order_code) === F02.keyOf(code));
  }

  function cancelPreviously() {
    selected.status = "CANCELLED";
    selected.reason = "Synthetic recipient requested cancellation.";
    go("S08-03-already-cancelled");
  }

  const actions = {
    orders: () => {
      listNotice = "";
      showList();
    },
    "safe-exit": () => {
      exited = true;
      go("S07-01-denied");
    },
    "sign-in": () => {
      simulation.value = "";
      batch = [];
      values = {};
      reason = "";
      showList();
    },
    create: () => {
      values = {};
      fieldErrors = {};
      go("S05-01");
    },
    import: () => {
      batch = [];
      go("S06-01");
    },
    edit: () => {
      if (selected.status !== "NEW") return go("S08-01-blocked");
      values = F02.cleanOrder(selected);
      fieldErrors = {};
      go("S08-01");
    },
    detail: () => go("S07-02"),
    "cancel-order": () => {
      if (selected.status !== "NEW") return go("S08-03-already-cancelled");
      reason = "";
      go("S08-02");
    },
    next: () => {
      pageNumber += 1;
      showList();
    },
    previous: () => {
      pageNumber -= 1;
      showList();
    },
    "clear-filters": () => {
      filters = { ...blankFilters };
      pageNumber = 1;
      showList();
    },
    open: (_, control) => {
      selected = orderByCode(control.dataset.code);
      go(selected ? "S07-02" : "S07-01-denied");
    },
    "abandon-import": () => {
      batch = [];
      listNotice = "Import cancelled · 0 orders imported";
      go("S07-01-import-cancelled");
    },
    "confirm-import": (mode) => {
      if (mode === "duplicate") orders.push({ ...batch[0], status: "NEW" });
      report = F02.checkRows(batch, orders.map((order) => order.order_code));
      if (report.length) return go("S06-02-conflict");
      imported = batch.length;
      orders.push(...batch.map((order) => ({ ...order, status: "NEW" })));
      batch = [];
      filters = { ...blankFilters };
      pageNumber = 1;
      go("S06-03");
    },
  };

  const formActions = {
    "order-form": (form, data, mode) => {
      const edit = form.dataset.edit === "true";
      values = F02.cleanOrder(data);
      if (edit && mode === "cancelled") return cancelPreviously();
      if (edit && selected.status !== "NEW") return go("S08-01-blocked");
      if (edit && mode === "stale") {
        selected.destination_address = "125 Example Lane, Demo Ward";
        conflictKind = "update";
        return go("S08-01-conflict");
      }
      fieldErrors = F02.orderErrors(values);
      if (!edit && !fieldErrors.order_code && orderByCode(values.order_code)) {
        fieldErrors.order_code = "Code already exists in this hub.";
        return go("S05-01-duplicate");
      }
      if (Object.keys(fieldErrors).length) return go(edit ? "S08-01-error" : "S05-01-error");
      if (edit) {
        Object.assign(selected, values, { order_code: selected.order_code });
        return go("S07-02-updated");
      }
      selected = { ...values, status: "NEW" };
      orders.push(selected);
      filters = { ...blankFilters };
      pageNumber = 1;
      go("S07-02-created");
    },
    "reason-form": (_, data, mode) => {
      reason = data.reason;
      if (mode === "cancelled") return cancelPreviously();
      if (selected.status === "CANCELLED") return go("S08-03-already-cancelled");
      if (mode === "stale") {
        selected.destination_address = "125 Example Lane, Demo Ward";
        conflictKind = "cancellation";
        return go("S08-01-conflict-cancel");
      }
      const cleaned = reason.trim();
      if (!cleaned || F02.count(cleaned) > 250) return go("S08-02-error");
      selected.status = "CANCELLED";
      selected.reason = cleaned;
      go("S08-03");
    },
    filters: (_, data) => {
      filters = data;
      pageNumber = 1;
      if (data.from && data.to && data.from > data.to) return go("S07-01-filter-error");
      showList();
    },
    "import-form": async (form, data) => {
      const file = data.file;
      fileName = file.name;
      const checkButton = form.querySelector('[type="submit"]');
      checkButton.disabled = true;
      try {
        const bytes = file.size > 1_000_000 ? { byteLength: file.size } : await file.arrayBuffer();
        if (!form.isConnected) return;
        const result = F02.csvCheck(fileName, bytes, orders.map((order) => order.order_code));
        fileRecord = result.record ?? 0;
        if (result.issue) return go(importErrors[result.issue][0]);
        report = result.report;
        batch = result.orders;
        go(report.length ? "S06-02-row-errors" : "S06-02");
      } finally {
        checkButton.disabled = false;
      }
    },
  };

  stage.addEventListener("click", (event) => {
    const field = event.target.closest("[data-field]");
    if (field) {
      event.preventDefault();
      document.getElementById(field.dataset.field).focus();
      return;
    }
    const control = event.target.closest("[data-action]");
    if (!control) return;
    const mode = gate();
    if (mode !== null) actions[control.dataset.action](mode, control);
  });
  stage.addEventListener("submit", (event) => {
    event.preventDefault();
    const mode = gate();
    if (mode === null) return;
    const form = event.target;
    formActions[form.id](form, Object.fromEntries(new FormData(form)), mode);
  });

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    const dark = theme === "dark";
    themeButton.textContent = dark ? "Light theme" : "Dark theme";
    themeButton.setAttribute("aria-pressed", String(dark));
  }

  for (const group of new Set(SCREENS.map((entry) => entry.group))) {
    const options = document.createElement("optgroup");
    options.label = group;
    for (const entry of SCREENS.filter((item) => item.group === group)) {
      options.append(new Option(`${entry.id} · ${entry.title}`, entry.id));
    }
    screenSelect.append(options);
  }
  screenSelect.addEventListener("change", () => openScenario(screenSelect.value, true));
  themeButton.addEventListener("click", () => setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark"));
  document.querySelector("#gallery").hidden = params.get("standalone") === "1";
  setTheme(params.get("theme") === "dark" ? "dark" : "light");
  const requested = screenMap.has(params.get("screen")) ? params.get("screen") : "S07-01";
  const restricted = params.has("hub") && params.get("hub") !== "demo" || ["administrator", "rider"].includes(params.get("role"));
  openScenario(params.has("expired") ? "S07-01-session-expired" : restricted ? "S07-01-denied" : requested, false);
  if (!restricted && !params.has("expired") && requested === "S07-02" && params.has("code")) {
    selected = orderByCode(params.get("code"));
    go(selected ? "S07-02" : "S07-01-denied", false);
  }
})();
