/* Validation for the local PA3 prototype. */
const F02 = (() => {
  const fields = [
    ["order_code", "Order code", "F02-001"],
    ["recipient_name", "Recipient name", "Demo Recipient 01"],
    ["recipient_phone", "Recipient phone", "0900000001"],
    ["delivery_address", "Delivery address", "100 Example Lane, Demo Ward"],
    ["window_start", "Window start (hub time)", "2026-11-21 09:00"],
    ["window_end", "Window end (hub time)", "2026-11-21 11:00"],
    ["weight_kg", "Weight (kg)", "1.25"],
    ["priority", "Priority (optional)", "NORMAL"],
    ["latitude", "Latitude (optional)", ""],
    ["longitude", "Longitude (optional)", ""],
    ["note", "Note (optional)", ""],
  ];
  const requiredColumns = fields.slice(0, 7).map(([key]) => key);
  const columns = [...requiredColumns, "priority", "note", "latitude", "longitude"];
  const header = columns.join(",");
  const maxRecords = 500;
  const maxBytes = 1_000_000;
  const pageSize = 20;
  const keyOf = (value) => value.trim().toLowerCase();
  const count = (value) => Array.from(value).length;
  const cleanOrder = (order) => Object.fromEntries(columns.map((key) => [key, (order[key] ?? "").trim()]));
  const example = Object.fromEntries(fields.map(([key, , value]) => [key, value]));
  const codeFormat = /^[A-Za-z0-9_-]{1,40}$/;
  const numeric = (value) => /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(value) ? Number(value) : NaN;
  const validText = (value, min, max) => !value.includes("\0") && count(value) >= min && count(value) <= max;
  const reasonError = "Use 5–300 characters after trimming, without NUL.";
  const validReason = (value) => validText(value.trim(), 5, 300);
  const withDefaults = (order) => ({ ...order, priority: order.priority || "NORMAL" });

  function isTimestamp(value) {
    if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(value)) return false;
    const date = new Date(value.replace(" ", "T") + ":00+07:00");
    if (!Number.isFinite(date.getTime()) || date.getUTCFullYear() < 1 || date.getUTCFullYear() > 9999) return false;
    const hubTime = new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString();
    return hubTime.slice(0, 16).replace("T", " ") === value;
  }

  function orderErrors(order) {
    const data = cleanOrder(order);
    const errors = {};
    if (!codeFormat.test(data.order_code)) errors.order_code = "Use 1–40 ASCII letters, digits, underscores or hyphens.";
    if (!validText(data.recipient_name, 1, 100)) errors.recipient_name = "Use 1–100 characters without NUL.";
    if (!/^0\d{9}$/.test(data.recipient_phone)) errors.recipient_phone = "Use exactly 10 digits starting with 0.";
    if (!validText(data.delivery_address, 5, 255)) errors.delivery_address = "Use 5–255 characters after trimming, without NUL.";
    if (!isTimestamp(data.window_start)) errors.window_start = "Use YYYY-MM-DD HH:mm in hub-local time.";
    if (!isTimestamp(data.window_end)) errors.window_end = "Use YYYY-MM-DD HH:mm in hub-local time.";
    else if (!errors.window_start && data.window_end <= data.window_start) errors.window_end = "Window end must be after window start.";
    const weight = numeric(data.weight_kg);
    if (!Number.isFinite(weight) || weight <= 0) {
      errors.weight_kg = "Enter a positive weight in kg, e.g. 1.25.";
    }
    if (data.priority && !["NORMAL", "HIGH"].includes(data.priority)) errors.priority = "Choose NORMAL or HIGH.";
    if (data.note.includes("\0")) errors.note = "Use text without NUL.";
    if (data.latitude || data.longitude) {
      for (const [column, max] of [["latitude", 90], ["longitude", 180]]) {
        const coordinate = numeric(data[column]);
        if (!Number.isFinite(coordinate) || Math.abs(coordinate) > max) {
          errors[column] = "Supply both coordinates within " + column + " range [" + -max + ", " + max + "].";
        }
      }
    }
    return errors;
  }

  function parseCsv(text) {
    const records = [];
    let row = [];
    let field = "";
    let mode = "start";
    for (let i = 0; i < text.length; i += 1) {
      const ch = text[i];
      if (mode === "quoted") {
        if (ch === '"' && text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else if (ch === '"') {
          mode = "closed";
        } else {
          field += ch;
        }
      } else if (ch === "," || ch === "\n" || (ch === "\r" && text[i + 1] === "\n")) {
        row.push(field);
        if (ch !== ",") {
          records.push(row);
          row = [];
          if (ch === "\r") i += 1;
        }
        field = "";
        mode = "start";
      } else if (ch === '"' && mode === "start") {
        mode = "quoted";
      } else if (ch === '"' || ch === "\r" || mode === "closed") {
        throw new Error("Malformed CSV. Check quotes and record breaks.");
      } else {
        field += ch;
        mode = "plain";
      }
    }
    if (mode === "quoted") throw new Error("Malformed CSV. Close the quoted field.");
    if (row.length || mode !== "start") records.push([...row, field]);
    return records;
  }

  function csvCheck(name, bytes, existingCodes = []) {
    if (!/\.csv$/i.test(name)) return { issue: "type" };
    if (bytes.byteLength > maxBytes) return { issue: "limit-bytes" };
    let text;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      return { issue: "format-encoding" };
    }
    if (!text.trim()) return { issue: "empty" };
    let records;
    try {
      records = parseCsv(text);
    } catch {
      return { issue: "format" };
    }
    const [heading, ...rows] = records;
    const issues = [];
    if (requiredColumns.some((column) => !heading.includes(column))) issues.push("Required columns are missing.");
    if (new Set(heading).size !== heading.length) issues.push("Header names are duplicated.");
    if (heading.some((column) => !columns.includes(column))) issues.push("Unrecognized columns are present.");
    if (issues.length) return { issue: "header", detail: issues.join(" ") };
    if (!rows.length) return { issue: "empty-header" };
    if (rows.length > maxRecords) return { issue: "limit" };
    const wrongWidth = rows.findIndex((row) => row.length !== heading.length);
    if (wrongWidth >= 0) return { issue: "format-width", record: wrongWidth + 2 };
    const orders = rows.map((row) => withDefaults(cleanOrder(Object.fromEntries(heading.map((key, i) => [key, row[i]])))));
    const report = checkRows(orders, existingCodes);
    return { orders, report, ready: report.length ? 0 : orders.length };
  }

  function checkRows(orders, existingCodes) {
    const existing = new Set(existingCodes.map(keyOf));
    const counts = new Map();
    for (const order of orders) {
      const code = keyOf(order.order_code);
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return orders.flatMap((order, index) => {
      const errors = orderErrors(order);
      const code = keyOf(order.order_code);
      if (!errors.order_code) {
        if (counts.get(code) > 1) errors.order_code = "Duplicate code in this file.";
        else if (existing.has(code)) errors.order_code = "Code already exists in this hub.";
      }
      return Object.entries(errors).map(([column, reason]) => ({ record: index + 2, column, reason }));
    });
  }

  const compare = (left, right) => (left > right) - (left < right);

  function searchOrders(orders, filters, page) {
    const query = filters.keyword.trim().toUpperCase();
    const matching = orders.filter((order) =>
      (!filters.status || filters.status === order.status)
      && (!filters.from || order.window_start.slice(0, 10) >= filters.from)
      && (!filters.to || order.window_start.slice(0, 10) <= filters.to)
      && (!query || [order.order_code, order.recipient_name, order.recipient_phone].some((value) => value.toUpperCase().includes(query)))
    ).sort((a, b) => compare(a.window_start, b.window_start) || compare(a.order_code, b.order_code));
    const pages = Math.max(1, Math.ceil(matching.length / pageSize));
    const current = page > pages ? 1 : page;
    return { orders: matching.slice((current - 1) * pageSize, current * pageSize), total: matching.length, pages, page: current };
  }

  return { columns, requiredColumns, fields, header, example, keyOf, cleanOrder, orderErrors, csvCheck, checkRows, searchOrders,
    validReason, reasonError, withDefaults };
})();

if (typeof module !== "undefined") module.exports = F02;
