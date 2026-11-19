/* Validation for the local PA3 prototype. */
const F02 = (() => {
  const fields = [
    ["order_code", "Order code", "F02-001"],
    ["recipient_name", "Recipient name", "Demo Recipient 01"],
    ["recipient_phone", "Recipient phone", "0000000001"],
    ["destination_address", "Destination address", "100 Example Lane, Demo Ward"],
    ["window_start", "Window start", "2026-11-21T09:00+07:00"],
    ["window_end", "Window end", "2026-11-21T11:00+07:00"],
    ["weight_kg", "Weight (kg)", "1.25"],
    ["note", "Note (optional)", ""],
  ];
  const columns = fields.map(([key]) => key);
  const header = columns.join(",");
  const maxRecords = 500;
  const maxBytes = 1_000_000;
  const pageSize = 20;
  const keyOf = (value) => value.trim().toUpperCase();
  const count = (value) => Array.from(value).length;
  const cleanOrder = (order) => Object.fromEntries(columns.map((key) => [key, (order[key] ?? "").trim()]));
  const example = Object.fromEntries(fields.map(([key, , value]) => [key, value]));

  function isTimestamp(value) {
    const parts = /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):([0-5]\d)\+07:00$/.exec(value);
    if (!parts || parts[1] === "0000") return false;
    const date = new Date(value.slice(0, 10) + "T00:00:00Z");
    return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
  }

  function orderErrors(order) {
    const data = cleanOrder(order);
    const errors = {};
    if (!/^[A-Za-z0-9][A-Za-z0-9-]{0,31}$/.test(data.order_code)) {
      errors.order_code = "Enter 1–32 letters, digits or hyphens, starting with a letter or digit.";
    }
    if (!data.recipient_name || count(data.recipient_name) > 100) errors.recipient_name = "Enter a recipient name of 1–100 characters.";
    if (!/^(?:0|\+84)[0-9]{9}$/.test(data.recipient_phone)) errors.recipient_phone = "Use 0 or +84 followed by nine digits.";
    if (!data.destination_address || count(data.destination_address) > 250) errors.destination_address = "Enter a destination address of 1–250 characters.";
    if (!isTimestamp(data.window_start)) errors.window_start = "Enter a valid date and time with +07:00.";
    if (!isTimestamp(data.window_end)) errors.window_end = "Enter a valid date and time with +07:00.";
    else if (!errors.window_start && data.window_end <= data.window_start) errors.window_end = "Window end must be after window start.";
    if (!/^\d+(?:\.\d+)?$/.test(data.weight_kg) || !Number.isFinite(Number(data.weight_kg)) || Number(data.weight_kg) <= 0) {
      errors.weight_kg = "Enter a positive weight in kg, e.g. 1.25.";
    }
    if (count(data.note) > 500) errors.note = "Keep the note at 500 characters or fewer.";
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
    const validLength = heading.length === columns.length || heading.length === columns.length - 1;
    if (!validLength || !heading.every((value, i) => value === columns[i])) return { issue: "header" };
    if (!rows.length) return { issue: "empty-header" };
    if (rows.length > maxRecords) return { issue: "limit" };
    const wrongWidth = rows.findIndex((row) => row.length !== heading.length);
    if (wrongWidth >= 0) return { issue: "format-width", record: wrongWidth + 2 };
    const orders = rows.map((row) => cleanOrder(Object.fromEntries(heading.map((key, i) => [key, row[i]]))));
    const report = checkRows(orders, existingCodes);
    return { orders, report, created: report.length ? 0 : orders.length };
  }

  function checkRows(orders, existingCodes) {
    const existing = new Set(existingCodes.map(keyOf));
    const seen = new Set();
    return orders.flatMap((order, index) => {
      const errors = orderErrors(order);
      const code = keyOf(order.order_code);
      if (!errors.order_code) {
        if (seen.has(code)) errors.order_code = "Duplicate code in this file.";
        else if (existing.has(code)) errors.order_code = "Code already exists in this hub.";
        seen.add(code);
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
      && (!query || [order.order_code, order.recipient_name, order.destination_address].some((value) => value.toUpperCase().includes(query)))
    ).sort((a, b) => compare(a.window_start, b.window_start) || compare(keyOf(a.order_code), keyOf(b.order_code)));
    const pages = Math.max(1, Math.ceil(matching.length / pageSize));
    const current = Math.min(page, pages);
    return { orders: matching.slice((current - 1) * pageSize, current * pageSize), total: matching.length, pages, page: current };
  }

  return { columns, fields, header, example, keyOf, cleanOrder, orderErrors, csvCheck, checkRows, searchOrders, count };
})();

if (typeof module !== "undefined") module.exports = F02;
