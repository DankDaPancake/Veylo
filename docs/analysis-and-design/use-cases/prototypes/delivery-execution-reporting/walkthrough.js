function dayAfter(value) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

const pageQuery = new URLSearchParams(location.search);
const visit = (screen, data = {}) => {
  const query = new URLSearchParams({ screen, standalone: "1", ...data });
  if (pageQuery.get("theme") === "dark") query.set("theme", "dark");
  return `?${query}`;
};
function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}
const secondOrder = (id) => id === "S11-02-neither-context" || pageQuery.get("stop") === "202";
const permittedShift = (value) => ["", "D-110", "D-111"].includes(value);
const permittedRider = (value) => ["", "R-17", "R-23"].includes(value);

function renderWalkthrough(id, frame, desktopShell) {
  const rider = /^S1[12]/.test(id);
  const rawFrom = pageQuery.get("from");
  const rawTo = pageQuery.get("to");
  const hasRange = validDate(rawFrom) && validDate(rawTo) && rawFrom <= rawTo;
  const filtered = id.startsWith("S19-02") && hasRange;
  const filters = hasRange ? {
    from: `${rawFrom}T00:00:00+07:00`, until: `${dayAfter(rawTo)}T00:00:00+07:00`,
    shift: pageQuery.get("shift") || "", rider: pageQuery.get("rider") || "",
  } : null;
  const denied = filtered && (!permittedShift(filters.shift) || !permittedRider(filters.rider));
  const lead = denied ? "The selected scope is outside your hub or role."
    : filtered ? `${rawFrom} to ${rawTo} · ICT · ${filters.shift || "All shifts"} · ${filters.rider || "All riders"}` : frame.lead;
  let body = denied ? "<p>Report data was withheld.</p>"
    : frame.report ? reportContent(VeyloReport.fixture[frame.report.fixture], filtered ? filters : frame.report.selection) : frame.body;
  let actions = denied ? [action("Return to permitted filters", FILTERS)] : frame.actions;
  const redispatched = pageQuery.get("redispatch") === "1";
  if (id === "S12-06-failure-saved") {
    const reason = reasonOptions[Number(pageQuery.get("reason"))] || reasonOptions[0];
    const arrival = pageQuery.get("before") === "true" ? "Not confirmed" : "09:15 ICT";
    body = card("Saved result", facts(["Attempt", "AT-201-01"], ["Outcome", `Failed · ${reason}`],
      ["Arrived", arrival], ["Comment", "Operational comment recorded in this simulation."], ["Order", "Awaiting dispatcher resolution"]));
  }
  if (id.startsWith("S12-06")) actions = secondOrder(id) ? [action("Finish shift", "S11-07-no-eligible-stops")] : actions;
  if (rider && id.startsWith("S12") && secondOrder(id)) {
    body = body.replaceAll("DEMO-201", "DEMO-202").replaceAll("AT-201-01", "AT-202-01")
      .replaceAll("Atrium A · Demo campus", "Demo Annex").replaceAll("09:00–10:30", "10:00–11:30");
  }
  if (rider && redispatched) {
    body = body.replaceAll("AT-201-01", "AT-201-02").replaceAll("D-110", "D-111");
    if (id === WORK) {
      body = card("Published re-dispatch · F03", facts(["Shift", "D-111 · 13:00–16:00"], ["Rider", "R-23 · Synthetic"],
        ["Order", "DEMO-201"], ["Attempt", "No new attempt until Start"]));
      actions = [action("Open reassigned stop", STOP)];
    }
    if (id.startsWith("S12-06")) actions = [action("Finish reassigned work", "S11-07-no-eligible-stops")];
  }
  if (id === STOP || id === "S11-02-guide-only") {
    const query = new URLSearchParams({ screen: "S15-02", standalone: "1", from: id });
    if (redispatched) query.set("redispatch", "1");
    if (pageQuery.get("theme") === "dark") query.set("theme", "dark");
    body = body.replace("../guide-screens.html?screen=S15-02&amp;standalone=1",
      `../guide-screens.html?${query.toString().replaceAll("&", "&amp;")}`);
  }
  const buttons = actions.map(([label, target], i) => {
    const data = secondOrder(id) && /^S12/.test(target) ? { stop: "202" } : {};
    if (redispatched || (id === "S13-04-redispatch-confirmed" && target === WORK)) data.redispatch = "1";
    const filterData = [FILTERS, RESULTS].includes(target) && filters && !denied
      ? { from: rawFrom, to: rawTo, shift: filters.shift, rider: filters.rider } : {};
    const destination = target === STOP && secondOrder(id) ? "S11-02-neither-context" : target;
    return `<a class="btn ${i === 0 ? "btn--primary" : "btn--glass"} ${rider ? "btn--lg-touch" : ""}" href="${visit(destination, { ...data, ...filterData }).replaceAll("&", "&amp;")}">${label}</a>`;
  }).join("");
  const header = `<header class="booyah-heading"><p class="eyebrow">${id.slice(0, 6)} · Synthetic walkthrough</p>
    <h1 class="${rider ? "mobile-title" : "page-title"}">${denied ? "Report access denied" : frame.title}</h1>
    <p class="booyah-lead ${frame.tone === "error" ? "booyah-error" : ""}">${rider && redispatched ? lead.replaceAll("AT-201-01", "AT-201-02").replaceAll("D-110", "D-111") : lead}</p></header>`;
  const nav = buttons ? `<nav class="booyah-actions" aria-label="Screen actions">${buttons}</nav>` : "";
  if (rider) return `<section class="veylo-canvas veylo-canvas--mobile"><div class="mobile-shell booyah-shell">
    <div class="mobile-topbar glass-chrome"><strong>Veylo</strong><span>Rider · Demo</span></div>
    <main class="mobile-body">${header}${body}${nav}</main>
    <p class="mobile-footer-note">BOOYAH-14 · Proposed rules for review</p></div></section>`;
  return desktopShell(`<main class="booyah-desktop">${header}${body}${nav}</main>`,
    id.endsWith("-min") ? "veylo-canvas--min" : "veylo-canvas--desktop", id.startsWith("S19") ? "Reports" : "Delivery attempts");
}

async function handleSimulation(event) {
  const form = event.target.closest("form[data-simulation]");
  if (!form) return;
  event.preventDefault();
  const mode = form.dataset.simulation;
  const fields = new FormData(form);
  const stopData = pageQuery.get("stop") === "202" ? { stop: "202" } : {};
  if (pageQuery.get("redispatch") === "1") stopData.redispatch = "1";
  const navigate = (id, data = stopData) => { location.href = visit(id, data); };
  const showError = (message) => {
    let error = form.querySelector("[role=alert]");
    if (!error) {
      error = document.createElement("p");
      error.className = "field-error";
      error.setAttribute("role", "alert");
      form.append(error);
    }
    error.textContent = message;
  };
  if (mode === "failure") {
    const reason = fields.get("reason");
    if (!reason) return showError("Select a failure reason.");
    if ((reason === "Other" || form.dataset.beforeArrival === "true") && !fields.get("comment").trim()) {
      return showError("A comment is required for this reason.");
    }
    // The actual free-form comment stays in the current form.
    navigate("S12-06-failure-saved", { ...stopData, reason: String(reasonOptions.indexOf(reason)), before: form.dataset.beforeArrival });
  } else if (mode === "terminal") {
    if (!fields.get("reason").trim()) return showError("Enter a closure reason.");
    navigate("S13-04-terminal-confirmed");
  } else if (mode === "photo") {
    const file = fields.get("proof");
    if (!file || !file.name) return navigate("S12-04-photo-missing");
    if (!["image/jpeg", "image/png"].includes(file.type)) return navigate("S12-09-photo-unsupported");
    if (file.size > 5_000_000) return navigate("S12-09-photo-too-large");
    try {
      const decoded = await createImageBitmap(file);
      decoded.close();
      navigate(PHOTO);
    } catch {
      navigate("S12-09-photo-unreadable");
    }
  } else if (mode === "report") {
    const { from, to, shift, rider } = Object.fromEntries(fields);
    if (!validDate(from) || !validDate(to) || from > to) return showError("Enter two valid dates. End must be on or after start.");
    if (!permittedShift(shift) || !permittedRider(rider)) return navigate("S19-04-access-denied", {});
    navigate(RESULTS, { from, to, shift, rider });
  }
}

function restoreFilters(stage) {
  const form = stage.querySelector('form[data-simulation="report"]');
  if (!form) return;
  for (const name of ["from", "to", "shift", "rider"]) {
    if (pageQuery.has(name)) form.elements[name].value = pageQuery.get(name);
  }
}
