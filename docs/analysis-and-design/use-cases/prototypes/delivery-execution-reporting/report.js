/* P06 draft calculations for the BOOYAH-14 synthetic fixtures. */
const VeyloReport = (() => {
  const at = (day, time) => `2026-11-${day}T${time}:00+07:00`;
  const start = at(20, "00:00");
  const end = at(21, "00:00");
  const final = ({ outcome }) => outcome === "Successful" || outcome === "Failed";
  const valid = (value) => typeof value === "string" && Number.isFinite(Date.parse(value));
  const before = (value, cutoff) => valid(value) && Date.parse(value) < Date.parse(cutoff);
  const duration = (attempt) => valid(attempt.start) && valid(attempt.end) && Date.parse(attempt.end) >= Date.parse(attempt.start)
    ? (Date.parse(attempt.end) - Date.parse(attempt.start)) / 60000
    : null;

  const make = (id, order, stop, shift, rider, start, end, outcome, reason) => ({
    id, order, stop, shift, rider, start, end, outcome, reason,
  });
  const a1 = make("AT-201-01", "DEMO-201", "P-201", "D-110", "R-17", at(20, "09:10"), at(20, "09:25"), "Failed", "Recipient unreachable");
  const a2 = make("AT-201-02", "DEMO-201", "P-203", "D-111", "R-23", at(20, "13:00"), at(20, "13:20"), "Successful");
  const b1 = make("AT-202-01", "DEMO-202", "P-202", "D-110", "R-17", at(20, "09:35"), at(20, "09:45"), "Failed", "Unsafe access");
  const active = make("AT-201-01", "DEMO-201", "P-201", "D-110", "R-17", at(20, "09:10"), null, "Active");
  const aborted = make("AT-201-00", "DEMO-201", "P-201", "D-110", "R-17", at(20, "09:05"), at(20, "09:06"), "Aborted");
  const invalidStart = make("AT-202-02", "DEMO-202", "P-202", "D-110", "R-17", null, at(20, "09:45"), "Failed");
  const invalidEnd = make("AT-202-03", "DEMO-202", "P-202", "D-110", "R-17", at(20, "09:35"), null, "Failed");
  const reversed = { ...b1, start: at(20, "09:50") };
  const shifts = [
    { id: "D-110", rider: "R-17", start: at(20, "09:00"), end: at(20, "12:00") },
    { id: "D-111", rider: "R-23", start: at(20, "13:00"), end: at(20, "16:00") },
  ];
  const stops = [
    { id: "P-201", shift: "D-110", assigned: at(20, "08:30") },
    { id: "P-202", shift: "D-110", assigned: at(20, "08:30") },
    { id: "P-203", shift: "D-111", assigned: at(20, "12:15") },
    { id: "P-withdrawn", shift: "D-110", assigned: at(20, "08:30"), withdrawn: at(20, "08:45") },
  ];
  const base = { attempts: [a1, a2, b1], closures: [], shifts, stops };
  const fixture = {
    base,
    empty: { attempts: [], closures: [], shifts: [], stops: [] },
    incomplete: { ...base, attempts: [active, aborted], shifts: [shifts[0]], stops: stops.filter((stop) => stop.shift === "D-110") },
    quality: { ...base, attempts: [a1, a2, reversed, invalidStart, invalidEnd] },
    missing: { ...base, attempts: [a1, a2, { ...b1, reason: undefined }] },
    closed: { ...base, closures: [{ order: "DEMO-202", end: at(20, "11:00") }] },
    boundary: { ...base, attempts: [
      { ...a1, start, end: at(20, "00:10") },
      { ...a2, start: at(20, "23:50"), end },
      b1, b1,
    ] },
  };

  function calculate(data, { from = start, until = end, shift, rider } = {}) {
    const inWindow = (time) => valid(time) && Date.parse(time) >= Date.parse(from) && before(time, until);
    const matches = (row) => (!shift || row.shift === shift) && (!rider || row.rider === rider);
    const attempts = [...new Map(data.attempts.map((attempt) => [attempt.id, attempt])).values()];
    const first = new Map();
    attempts.filter((attempt) => valid(attempt.start)).sort((left, right) => Date.parse(left.start) - Date.parse(right.start))
      .forEach((attempt) => { if (!first.has(attempt.order)) first.set(attempt.order, attempt); });
    const cohort = [...first.values()].filter((attempt) => inWindow(attempt.start) && matches(attempt));
    const delivered = new Set(attempts.filter((attempt) => attempt.outcome === "Successful" && before(attempt.end, until)).map((attempt) => attempt.order));
    const closed = new Set(data.closures.filter((closure) => before(closure.end, until)).map((closure) => closure.order));
    const orderSuccess = cohort.filter(({ order }) => delivered.has(order)).length;
    const terminal = cohort.filter(({ order }) => closed.has(order) && !delivered.has(order)).length;
    const completed = attempts.filter((attempt) => final(attempt) && matches(attempt) && inWindow(attempt.end));
    const successes = completed.filter((attempt) => attempt.outcome === "Successful").length;
    const failures = completed.filter((attempt) => attempt.outcome === "Failed");
    const durations = completed.map(duration).filter((value) => value !== null);
    const reasons = new Map();
    for (const { reason } of failures) if (reason) reasons.set(reason, (reasons.get(reason) || 0) + 1);
    const scopedShifts = data.shifts.filter((s) => matches({ shift: s.id, rider: s.rider })
      && before(s.start, until) && Date.parse(s.end) > Date.parse(from));
    const byShift = scopedShifts.map((s) => {
      const eligible = data.stops.filter((stop) => stop.shift === s.id && before(stop.assigned, until)
        && (!before(stop.withdrawn, until) || attempts.some((a) => a.stop === stop.id && a.shift === s.id && before(a.start, stop.withdrawn))));
      const worked = eligible.filter((stop) => attempts.some((a) => a.stop === stop.id && a.shift === s.id && final(a) && before(a.end, until))).length;
      return { id: s.id, rider: s.rider, worked, total: eligible.length };
    });
    return {
      orders: cohort.length, delivered: orderSuccess, terminal, open: cohort.length - orderSuccess - terminal,
      finalized: completed.length, successful: successes, failed: failures.length,
      active: attempts.filter((a) => matches(a) && inWindow(a.start) && (!valid(a.end) || !before(a.end, until))
        && (a.outcome === "Active" || valid(a.end))).length,
      aborted: attempts.filter((a) => matches(a) && a.outcome === "Aborted" && inWindow(a.end)).length,
      average: durations.length ? durations.reduce((sum, value) => sum + value, 0) / durations.length : null,
      included: durations.length, excluded: completed.length - durations.length,
      invalidEnd: attempts.filter((a) => matches(a) && final(a) && !valid(a.end) && inWindow(a.start)).length,
      missingReason: failures.filter((a) => !a.reason).length,
      reasons: [...reasons].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "en")),
      byShift,
    };
  }

  const percent = (numerator, denominator) => denominator ? `${Number((100 * numerator / denominator).toFixed(1))}%` : "—";
  const definitions = [
    ["Shift progress", "Stops with a Successful or Failed outcome by cutoff ÷ assigned stops by cutoff. Exclude withdrawals before Start. Failed stops count as worked.", "stops and %"],
    ["Order success", "Delivered ÷ distinct orders whose first valid Start is in scope. Attribute by first Start shift/rider; evaluate the outcome at cutoff across the hub.", "orders and %"],
    ["Order closure", "(Delivered + terminal failure) ÷ the same order cohort. Open orders remain in the denominator.", "orders and %"],
    ["Attempt success", "Successful ÷ (Successful + Failed). Deduplicate by attempt ID, use outcome time and executing rider/shift. Active and Aborted are separate.", "attempts and %"],
    ["Average duration", "Sum of valid outcome minus Start ÷ included final attempts. Missing or reversed times are excluded. No valid outcome time means no report-window attribution.", "min/attempt"],
    ["Failure causes", "Count unique in-scope Failed attempts per known reason; sort by count and retain ties. Flag missing reasons separately.", "attempts"],
    ["Date range", "Hub time (ICT). Start at first midnight; exclude midnight after the last day. A dash means the denominator or sample is empty.", "calendar days"],
  ];
  return { calculate, definitions, fixture, percent, start, end };
})();
if (typeof module !== "undefined") module.exports = VeyloReport;
