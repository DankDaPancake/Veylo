/* BOOYAH-14 synthetic walkthrough states. No application routes or data. */
const WORK = "S11-01-assigned-work";
const STOP = "S11-02-stop-details";
const START = "S12-01-start-attempt";
const STARTED = "S12-02-started";
const ARRIVED = "S12-03-arrived";
const PHOTO = "S12-04-photo-proof";
const FAIL = "S12-05-failure-form";
const MONITOR = "S13-01-monitoring";
const HISTORY = "S13-02-failed-order-history";
const FILTERS = "S19-01-report-filters";
const RESULTS = "S19-02-report-results";
const DEFINITIONS = "S19-08-metric-definitions";

const action = (label, target) => [label, target];
const view = (title, lead, body, ...actions) => ({ title, lead, body, actions, tone: "info" });
const feedback = (title, lead, body, ...actions) => ({ ...view(title, lead, body, ...actions), tone: "error" });
const good = (title, lead, body, ...actions) => ({ ...view(title, lead, body, ...actions), tone: "success" });
const facts = (...rows) => `<dl class="booyah-facts">${rows.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join("")}</dl>`;
const card = (title, body) => `<section class="glass-panel booyah-card"><h2>${title}</h2>${body}</section>`;
const hint = (body) => `<p class="booyah-hint">${body}</p>`;
const disabled = (label) => `<button type="button" class="btn btn--glass" disabled>${label}</button>`;
const badge = (text, tone = "info") => `<span class="badge badge--${tone}">${text}</span>`;
const shift = facts(["Shift", "D-110 · 20 Nov · 09:00–12:00"], ["Rider", "R-17 · Synthetic"]);
const stop = facts(["Order", "DEMO-201"], ["Delivery point", "Atrium A · Demo campus"], ["Window", "09:00–10:30"]);
const currentAttempt = facts(["Attempt", "AT-201-01"], ["Started", "09:10 ICT"], ["Arrived", "09:15 ICT"]);
const reasonOptions = ["Recipient unreachable", "Recipient refused", "Address incorrect or not found", "Unsafe access", "Other"];
const rowLink = (id, label) => `<a class="booyah-link" href="?screen=${id}&amp;standalone=1">${label}</a>`;

function workList(suggestion, details) {
  return [
    suggestion ? card("Suggested next stop", `<p>DEMO-201 · Atrium A</p>${hint("Window closes at 10:30. Published stop order is unchanged.")}<details><summary>Why this stop? (UC14)</summary><p>Earlier closing window among eligible stops. This is a simulated UC14 handoff.</p></details>`) : hint("Next-stop suggestion unavailable. Select an eligible stop below."),
    card("Published sequence", `<ol class="booyah-stops"><li>${rowLink(details, "DEMO-201 · Atrium A")} ${badge("Eligible")}</li><li>${rowLink("S11-02-neither-context", "DEMO-202 · Demo Annex")} ${badge("Eligible")}</li></ol>`),
  ].join("");
}

function guide(available, secondStop = false) {
  const details = secondStop ? facts(["Order", "DEMO-202"], ["Delivery point", "Demo Annex"], ["Window", "10:00–11:30"]) : stop;
  return card("Assigned stop", details) + (available
    ? card("Published guide preview", '<p>Atrium A · Use the marked visitor entrance.</p><details><summary>Open full guide (UC15)</summary><p>Follow signs from the visitor entrance to the reception desk. Published in this hub. This is a simulated UC15 handoff.</p></details>')
    : hint("No published guide is available for this stop."));
}

function failureForm(error = "", beforeArrival = false) {
  const options = beforeArrival ? reasonOptions.slice(2, 4) : reasonOptions;
  const selected = error === "comment" ? "Other" : beforeArrival ? options[0] : error ? "" : options[0];
  return `<form data-simulation="failure" data-before-arrival="${beforeArrival}">
    <div class="field-group"><label class="field-label" for="reason">Reason</label><select class="input-glass" name="reason" id="reason">
    <option value="">Select a reason</option>${options.map((option) => `<option${option === selected ? " selected" : ""}>${option}</option>`).join("")}</select></div>
    ${error === "reason" ? '<p class="field-error" role="alert">Select a failure reason.</p>' : ""}
    <div class="field-group"><label class="field-label" for="comment">Comment</label><textarea class="input-glass" id="comment" name="comment" rows="2">${error === "comment" ? "" : "Entry could not be completed on this visit."}</textarea></div>
    ${error === "comment" ? '<p class="field-error" role="alert">A comment is required for this reason.</p>' : ""}
    <button class="btn btn--primary btn--lg-touch">Save failed attempt</button>
  </form>`;
}

function proofForm() {
  return `<form data-simulation="photo">
    <div class="field-group"><label class="field-label" for="proof">Photo proof</label><input class="input-glass" id="proof" name="proof" type="file" accept="image/jpeg,image/png"></div>
    <p class="booyah-hint">One readable JPEG or PNG up to 5 MB. Files are inspected locally for the simulation and are not uploaded.</p>
    <button class="btn btn--primary btn--lg-touch">Validate selected photo</button>
  </form>`;
}

function terminalForm(error = false) {
  return `<form data-simulation="terminal"><div class="field-group">
    <label class="field-label" for="terminal-reason">Closure reason</label><textarea class="input-glass" id="terminal-reason" name="reason" rows="2">${error ? "" : "Recipient declined another delivery visit."}</textarea></div>
    ${error ? '<p class="field-error" role="alert">Enter a closure reason.</p>' : ""}
    <button class="btn btn--primary">Confirm terminal closure</button></form>`;
}

const failedHistory = card("Attempt history · DEMO-201", `<table class="orders-table"><thead><tr><th>Attempt</th><th>Rider and shift</th><th>Started / arrived / ended</th><th>Outcome</th></tr></thead><tbody><tr><td>AT-201-01</td><td>R-17 · D-110</td><td>09:10 / 09:15 / 09:25 ICT</td><td>${badge("Failed", "error")} · Recipient unreachable</td></tr></tbody></table><p>Comment: No reply at the visitor entrance.</p>`);
const monitoring = card("Published shift D-110 · Synthetic", `<table class="orders-table"><thead><tr><th>Order</th><th>Latest attempt</th><th>Order outcome</th><th>Next action</th></tr></thead><tbody>
  <tr><td>DEMO-201</td><td>AT-201-01 · Failed</td><td>${badge("Awaiting resolution", "pending")}</td><td>${rowLink(HISTORY, "Inspect history")}</td></tr>
  <tr><td>DEMO-202</td><td>AT-202-01 · Successful</td><td>${badge("Delivered", "success")}</td><td>No decision required</td></tr>
  </tbody></table>${hint("2 of 2 stops worked. A failed attempt does not close its order.")}`);
const photoError = (title, message) => feedback(title, message, card("Evidence remains pending", proofForm()), action("Return to attempt", ARRIVED));

const BOOYAH_FRAMES = {
  "S11-01-assigned-work": { ...view("Assigned deliveries", "Published shift D-110 · 20 November", workList(true, STOP), action("Open suggested stop", STOP)) },
  "S11-01-suggestion-only": { ...view("Next stop available", "Published work stays available without a guide.", workList(true, "S11-02-guide-unavailable"), action("Open suggested stop", "S11-02-guide-unavailable")) },
  "S11-01-no-suggestion": { ...view("Choose an assigned stop", "The recommendation service returned no suggestion.", workList(false, "S11-02-guide-only")) },
  "S11-02-stop-details": { ...view("Atrium A", "Published assignment · DEMO-201", guide(true), action("Start delivery", START), action("Back to deliveries", WORK)) },
  "S11-02-guide-only": { ...view("Stop details", "Guide available; no suggested next stop.", guide(true), action("Start delivery", START), action("Back to deliveries", "S11-01-no-suggestion")) },
  "S11-02-neither-context": { ...view("Demo Annex", "No recommendation or guide. Delivery details are available.", guide(false, true), action("Start delivery", START), action("Back to deliveries", WORK)) },
  "S11-02-guide-unavailable": { ...view("Guide unavailable", "The suggestion is available; guidance is not available here.", guide(false), action("Start delivery", START), action("Back to deliveries", "S11-01-suggestion-only")) },
  "S11-03-no-published-work": { ...view("No published work", "No published shift is currently assigned to you.", card("Assigned deliveries", "<p>Check again when your dispatcher publishes your assignment.</p>"), action("Check again", WORK)) },
  "S11-04-sign-in": { ...feedback("Sign in to view work", "Your rider session has expired.", "", action("Simulate sign-in", WORK)) },
  "S11-04-access-denied": { ...feedback("Assignment unavailable", "You cannot view this assignment with your current access.", "", action("My assignments", WORK)) },
  "S11-05-load-failed": { ...feedback("Could not load deliveries", "Check the connection and try again.", "", action("Retry loading", WORK)) },
  "S11-06-stop-unavailable": { ...feedback("This stop was removed", "The assignment was updated. Refresh the list before starting work.", "", action("Refresh assignments", WORK)) },
  "S11-07-no-eligible-stops": { ...good("No eligible stops remain", "You have worked all available stops in this shift.", card("Shift status", shift + hint("Failed attempts stay in history for your dispatcher.")), action("Review shift", "S11-07-no-eligible-stops")) },
  "S12-01-start-attempt": { ...view("Start delivery attempt", "Review the current assignment before starting.", card("Assigned stop", stop), action("Start attempt", STARTED), action("Back to stop", STOP)) },
  "S12-02-started": { ...view("Attempt started", "AT-201-01 · started at 09:10 ICT. Arrival is still pending.", card("In progress", stop + facts(["Arrival", "Awaiting confirmation"])), action("Confirm arrival", ARRIVED), action("Unable to arrive", "S12-02-pre-arrival-failure"), action("Abort attempt", "S12-07-abort-confirmation")) },
  "S12-02-resume-active": { ...view("Resume the active attempt", "AT-201-01 already exists. No second attempt was created.", card("Recorded start", facts(["Started", "09:10 ICT"])), action("Confirm arrival", ARRIVED)) },
  "S12-02-pre-arrival-failure": { ...view("Record failure before arrival", "Arrival is unconfirmed. An incorrect address or unsafe access requires a comment.", card("Permitted failure details", failureForm("", true)) + disabled("Record success before arrival"), action("Return to attempt", STARTED)) },
  "S12-03-arrived": { ...good("Arrival confirmed", "Choose the outcome for this attempt.", card("Recorded timestamps", currentAttempt), action("Record success with photo", PHOTO), action("Record failed attempt", FAIL), action("Abort attempt", "S12-07-abort-confirmation")) },
  "S12-04-photo-proof": { ...view("Attach photo proof", "The outcome stays open until both the photo and result are accepted.", card("Synthetic photo preview", '<div class="booyah-pod"><svg viewBox="0 0 105 66" aria-label="Illustrated synthetic parcel evidence" role="img"><rect x="13" y="10" width="79" height="47" rx="7" fill="#e1b77d" stroke="#624d35"/><path d="M51 10v47" stroke="#765538"/><rect x="58" y="20" width="23" height="14" rx="2" fill="#fffbf2"/></svg><p>parcel-demo.jpg · 1.4 MB · Sample</p></div>') + card("Replace photo", proofForm()), action("Save successful delivery", "S12-06-success-saved"), action("Back to attempt", ARRIVED)) },
  "S12-04-photo-missing": { ...photoError("Add a photo first", "Success was not recorded because photo proof is missing.") },
  "S12-05-failure-form": { ...view("Record failed attempt", "Select a structured reason and add an operational comment.", card("Failure details", failureForm()), action("Close form", "S12-05-form-dismissed"), action("Abort attempt", "S12-07-abort-confirmation")) },
  "S12-05-reason-required": { ...feedback("Select a reason", "No outcome has been recorded. Your comment is retained.", card("Failure details", failureForm("reason")), action("Back to attempt", ARRIVED)) },
  "S12-05-comment-required": { ...feedback("Comment required", "Explain the selected reason before submitting failure.", card("Failure details", failureForm("comment")), action("Back to attempt", ARRIVED)) },
  "S12-05-form-dismissed": { ...view("Outcome form closed", "Attempt AT-201-01 is still active. No outcome was recorded.", card("Current attempt", currentAttempt), action("Reopen failure form", FAIL), action("Back to attempt", ARRIVED)) },
  "S12-06-success-saved": { ...good("Successful delivery saved", "Photo proof accepted. The order is delivered and does not need dispatcher resolution.", card("Saved result", currentAttempt + facts(["Outcome", "Successful · 09:25 ICT"], ["Photo", "parcel-demo.jpg"])), action("Next assigned stop", "S11-02-neither-context"), action("Return when no work remains", "S11-07-no-eligible-stops")) },
  "S12-06-failure-saved": { ...view("Failed attempt saved", "The dispatcher will resolve the order. The order is still open.", card("Saved result", facts(["Attempt", "AT-201-01"], ["Outcome", "Failed · Recipient unreachable"], ["Order", "Awaiting dispatcher resolution"])), action("Next assigned stop", "S11-02-neither-context"), action("No remaining stops", "S11-07-no-eligible-stops")) },
  "S12-07-abort-confirmation": { ...view("Abort this attempt?", "An Aborted attempt is retained. It does not count as Failed or use a retry slot.", card("Attempt AT-201-01", facts(["Order", "DEMO-201"], ["Recorded outcome", "None"])), action("Confirm abort", "S12-07-attempt-aborted"), action("Keep attempt active", ARRIVED)) },
  "S12-07-attempt-aborted": { ...view("Attempt aborted", "The stop is eligible again because the assignment is still active.", card("Attempt AT-201-01", facts(["Outcome", "Aborted"], ["Retry slots consumed", "0"])), action("Return to assignments", WORK)) },
  "S12-08-stale-assignment": { ...feedback("Assignment changed", "This stop was removed, transferred or cancelled. No attempt was started.", "", action("Refresh assignments", WORK)) },
  "S12-08-active-attempt-conflict": { ...feedback("Attempt already active", "Start was recorded before the competing change. Continue the existing attempt.", card("Retained attempt", facts(["Attempt", "AT-201-01"], ["Starts recorded", "1"])), action("Resume active attempt", "S12-02-resume-active")) },
  "S12-09-photo-too-large": { ...photoError("Photo exceeds 5 MB", "Replace the photo with a smaller JPEG or PNG.") },
  "S12-09-photo-unsupported": { ...photoError("Unsupported photo format", "Select a JPEG or PNG. The attempt remains open.") },
  "S12-09-photo-unreadable": { ...photoError("Photo cannot be read", "Select an intact JPEG or PNG and try again.") },
  "S12-09-upload-failed": { ...photoError("Photo upload failed", "The simulated upload did not finish. Retry from the same attempt.") },
  "S12-10-duplicate-action": { ...view("Action already recorded", "A repeated tap returned the same result.", card("Recorded once", facts(["Attempt", "AT-201-01"], ["Starts / arrivals / outcomes", "1 / 1 / 1"])), action("View saved result", "S12-06-success-saved")) },
  "S12-10-action-unsent": { ...feedback("Action not sent", "The connection dropped before the action was submitted.", "", action("Retry same action", ARRIVED)) },
  "S12-10-result-unknown": { ...feedback("Result not yet known", "The action was sent before the connection dropped. Refresh before submitting again.", "", action("Check saved result", "S12-10-result-recovered")) },
  "S12-10-result-recovered": { ...good("Saved result recovered", "The recorded outcome returned without creating a duplicate.", card("Current attempt", currentAttempt), action("View saved result", "S12-06-success-saved")) },
  "S12-11-sign-in": { ...feedback("Sign in again", "Your session expired before the action could be confirmed.", "", action("Simulate sign-in", WORK)) },
  "S12-11-access-denied": { ...feedback("Attempt access denied", "Your current assignment does not permit this action.", "", action("Return to assignments", WORK)) },
  "S13-01-monitoring": { ...view("Delivery attempt monitoring", "Hub West · Published shift D-110", monitoring, action("Inspect failed order", HISTORY), action("Open shift report", RESULTS)) },
  "S13-01-monitoring-min": { ...view("Delivery attempt monitoring", "Hub West · Published shift D-110", monitoring, action("Inspect failed order", HISTORY), action("Open shift report", RESULTS)) },
  "S13-02-failed-order-history": { ...view("Resolve order DEMO-201", "One Failed attempt. The Order remains open.", failedHistory, action("Review re-dispatch", "S13-03-redispatch-confirmation"), action("Review terminal closure", "S13-05-terminal-confirmation"), action("Back to monitoring", MONITOR)) },
  "S13-02-already-resolved": { ...view("Order decision already recorded", "The latest failure was resolved. Another decision is unavailable.", failedHistory + card("Existing decision", "<p>Re-dispatch to D-111 was recorded by the dispatcher.</p>" + disabled("Resolve again")), action("Return to monitoring", MONITOR)) },
  "S13-03-redispatch-confirmation": { ...view("Confirm re-dispatch", "The same order will be handed back to F03. The next attempt starts only when its rider starts work.", card("Eligible assignment", facts(["Destination shift", "D-111"], ["Assigned rider", "R-23 · Synthetic"], ["Eligibility", "Same hub · Capacity available · No active attempt"])), action("Confirm re-dispatch", "S13-04-redispatch-confirmed"), action("Cancel", "S13-09-confirmation-dismissed")) },
  "S13-04-redispatch-confirmed": { ...good("Re-dispatch recorded", "Order DEMO-201 retains its history. F03 handles the new assignment and publication.", failedHistory + hint("New attempt count: 0 until the rider starts the reassigned stop."), action("Preview published re-dispatch", WORK), action("Return to monitoring", MONITOR)) },
  "S13-04-terminal-confirmed": { ...good("Order closed by dispatcher", "Order DEMO-201 · Closed after failed delivery. Attempt history is retained.", failedHistory + hint("Closure reason: Recipient declined another delivery visit."), action("Return to monitoring", MONITOR)) },
  "S13-05-terminal-confirmation": { ...view("Confirm terminal closure", "This decision ends the order after failed delivery. A reason is required.", card("Dispatcher decision", terminalForm()), action("Cancel", "S13-09-confirmation-dismissed")) },
  "S13-05-terminal-reason-required": { ...feedback("Closure reason required", "The order remains open until a valid closure decision is confirmed.", card("Dispatcher decision", terminalForm(true)), action("Cancel", "S13-09-confirmation-dismissed")) },
  "S13-06-empty-shift": { ...view("Nothing assigned to this shift", "There are no assigned stops or attempts for this shift.", "", action("Choose another shift", MONITOR)) },
  "S13-06-empty-failure-queue": { ...good("No failed orders awaiting a decision", "Delivered and resolved orders are available in monitoring history.", "", action("Back to monitoring", MONITOR)) },
  "S13-07-load-failed": { ...feedback("Could not load monitoring", "No dispatcher action was recorded.", "", action("Retry loading", MONITOR)) },
  "S13-08-sign-in": { ...feedback("Sign in to monitor attempts", "Your dispatcher session has expired.", "", action("Simulate sign-in", MONITOR)) },
  "S13-08-access-denied": { ...feedback("Monitoring access denied", "This shift is outside your hub or role scope.", "", action("Return to your hub", MONITOR)) },
  "S13-09-active-attempt-lock": { ...feedback("Resolution locked", "The rider has an active attempt. Wait for the current result before resolving the order.", card("Active attempt", facts(["Order", "DEMO-201"], ["State", "Started"]) + disabled("Re-dispatch")), action("Refresh order", HISTORY)) },
  "S13-09-no-eligible-destination": { ...feedback("No eligible destination", "No available rider or destination shift meets the current F03 capacity, hub and assignment constraints.", card("Assignment unchanged", disabled("Confirm re-dispatch")), action("Review other resolution options", HISTORY)) },
  "S13-09-retry-limit": { ...feedback("Re-dispatch limit reached", "Three distinct Failed attempts have used the proposed allowance. The order is still open until the dispatcher confirms closure.", card("Attempt history", facts(["Failed attempts", "AT-201-01, AT-201-02, AT-201-03"], ["Retry slots remaining", "0"]) + disabled("Re-dispatch")), action("Review terminal closure", "S13-05-terminal-confirmation")) },
  "S13-09-confirmation-dismissed": { ...view("Decision cancelled", "The order remains open. Assignment and attempt history are unchanged.", failedHistory, action("Return to order", HISTORY)) },
  "S13-10-concurrent-decision": { ...feedback("Decision changed", "Another dispatcher resolved the latest failure before your confirmation.", card("Current outcome", facts(["Order", "DEMO-201"], ["Decision", "Re-dispatch to D-111"])), action("View recorded decision", "S13-02-already-resolved")) },
  "S13-10-result-unknown": { ...feedback("Resolution status unknown", "The connection dropped after submission. Check the current decision before trying again.", "", action("Check current decision", "S13-10-result-recovered")) },
  "S13-10-result-recovered": { ...good("Recorded decision recovered", "One re-dispatch decision exists. The retry did not create another assignment.", failedHistory, action("Return to monitoring", MONITOR)) },
};

function reportFilters(invalid = false) {
  return `<form data-simulation="report" class="booyah-filters">
    <label>From <input class="input-glass" name="from" type="date" value="2026-11-20"></label>
    <label>To <input class="input-glass" name="to" type="date" value="${invalid ? "2026-11-19" : "2026-11-20"}"></label>
    <label>Shift <select class="input-glass" name="shift"><option value="">All shifts</option><option>D-110</option><option>D-111</option></select></label>
    <label>Rider <select class="input-glass" name="rider"><option value="">All riders</option><option>R-17</option><option>R-23</option></select></label>
    <button class="btn btn--primary">Apply filters</button>
    ${invalid ? '<p class="field-error" role="alert">Enter both dates. End must be on or after start.</p>' : ""}
  </form>`;
}

function reportContent(model, selection = {}) {
  const result = VeyloReport.calculate(model, selection);
  const ratio = (num, den) => `${num} / ${den} · ${VeyloReport.percent(num, den)}`;
  const kpis = [
    ["Order success", ratio(result.delivered, result.orders)],
    ["Order closure", ratio(result.delivered + result.terminal, result.orders)],
    ["Attempt success", ratio(result.successful, result.finalized)],
    ["Avg. attempt duration", result.average === null ? "—" : `${result.average.toFixed(1)} min`],
  ];
  const cards = `<div class="booyah-kpis">${kpis.map(([name, value]) => `<div class="kpi-card glass-panel"><span>${name}</span><strong>${value}</strong></div>`).join("")}</div>`;
  const progress = result.byShift.map(({ id, rider, worked, total }) => [id, rider, ratio(worked, total)]);
  const rows = (data) => data.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("");
  const progressTable = progress.length
    ? `<table class="orders-table"><thead><tr><th>Shift</th><th>Rider</th><th>Worked stops / assigned stops</th></tr></thead><tbody>${rows(progress)}</tbody></table>`
    : "<p>No matching shift workload.</p>";
  const reasonTable = result.reasons.length
    ? `<table class="orders-table"><thead><tr><th>Reason</th><th>Failed attempts</th></tr></thead><tbody>${rows(result.reasons)}</tbody></table>`
    : "<p>No eligible failure reasons to show.</p>";
  return cards + `<div class="booyah-split">${card("Shift and rider progress", progressTable)}
    ${card("Frequent failure causes", reasonTable + hint(`Missing reasons: ${result.missingReason}. Equal counts are tied.`))}</div>`
    + card("Event accounting", facts(
      ["Orders", `${result.delivered} delivered · ${result.terminal} terminal failures · ${result.open} open`],
      ["Attempts", `${result.successful} successful · ${result.failed} failed · ${result.active} active · ${result.aborted} aborted`],
      ["Duration quality", `${result.included} included · ${result.excluded} excluded · ${result.invalidEnd} without attributable outcome time`],
    )) + hint("A dash means insufficient data. Counts and rates use different order and attempt cohorts.");
}

const reportFrame = (title, lead, fixture, selection = {}) => ({
  ...view(title, lead, "", action("Edit filters", FILTERS), action("Metric definitions", DEFINITIONS)),
  report: { fixture, selection },
});
const defsTable = `<table class="orders-table booyah-definitions"><thead><tr><th>Metric</th><th>Draft formula and valid events</th><th>Unit</th></tr></thead>
  <tbody>${VeyloReport.definitions.map(([name, formula, unit]) => `<tr><td><strong>${name}</strong></td><td>${formula}</td><td>${unit}</td></tr>`).join("")}</tbody></table>`;

Object.assign(BOOYAH_FRAMES, {
  "S19-01-report-filters": { ...view("Shift and rider reports", "Hub West · Choose an inclusive calendar range in ICT.", card("Report scope", reportFilters()), action("View synthetic sample", RESULTS)) },
  "S19-02-report-results": { ...reportFrame("Shift and rider reports", "20 Nov 2026 · ICT · All shifts and riders · Synthetic events", "base") },
  "S19-02-report-results-min": { ...reportFrame("Shift and rider reports", "20 Nov 2026 · ICT · All shifts and riders · Synthetic events", "base") },
  "S19-03-invalid-range": { ...feedback("Check the date range", "The request was not submitted. Correct the dates below.", card("Report scope", reportFilters(true))) },
  "S19-04-sign-in": { ...feedback("Sign in to view reports", "Your dispatcher session has expired. Report results are hidden.", "", action("Simulate sign-in", FILTERS)) },
  "S19-04-access-denied": { ...feedback("Report access denied", "The selected scope is outside your hub or role.", "", action("Return to permitted filters", FILTERS)) },
  "S19-05-no-data": { ...reportFrame("No matching report data", "The selected scope has no matching activity. An empty sample cannot establish a success rate.", "empty") },
  "S19-06-incomplete-attempts": { ...reportFrame("Only incomplete and aborted activity", "Active and Aborted counts are visible. Neither enters the final attempt rate.", "incomplete") },
  "S19-06-invalid-timestamps": { ...reportFrame("Attempt timestamp quality", "Valid outcome times enter their window. Invalid duration samples are excluded and missing outcome times are counted separately.", "quality") },
  "S19-07-load-failed": { ...feedback("Could not load reports", "The request failed. The selected scope is preserved.", card("Selected scope", reportFilters()), action("Retry last request", RESULTS)) },
  "S19-08-metric-definitions": { ...view("How the report counts work", "P06 · Proposed / Pending PR Review · Local hub time", card("Metric definitions", defsTable), action("Return to report", RESULTS)) },
  "S19-08-cross-shift-retry": { ...reportFrame("Retry outcome across shifts", "Filter D-110 · R-17. Order DEMO-201 was started here and delivered in D-111 by R-23. The later attempt belongs to D-111.", "base", { shift: "D-110", rider: "R-17" }) },
  "S19-08-zero-denominator": { ...reportFrame("No valid denominator", "A dash appears when there are no final attempts or eligible duration samples.", "incomplete") },
  "S19-08-no-failures": { ...reportFrame("No failures in scope", "D-111 · Only one Successful attempt. No failure reasons to group.", "base", { shift: "D-111" }) },
  "S19-08-missing-reasons": { ...reportFrame("Failure data with missing reasons", "Uncoded failures are visible separately from known causes.", "missing") },
  "S19-08-tied-reasons": { ...reportFrame("Tied failure causes", "Both known reasons occur once. The report retains both.", "base") },
});
