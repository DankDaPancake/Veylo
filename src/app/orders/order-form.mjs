import { localInput } from "../../lib/orders/validation.ts";

/** @param {string} field @param {Partial<Record<string, string | number>>} [order] */
export function formValue(field, order) {
  const value = order?.[field];
  if (value == null) return field === "priority" ? "NORMAL" : "";
  if (!field.startsWith("window_")) return String(value);
  const text = String(value);
  const date = new Date(text);
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(text) || Number.isNaN(date.getTime())) return text.replace(" ", "T").slice(0, 16);
  return localInput(date).replace(" ", "T");
}

/** @param {Record<string, string>} fields @param {number} [version] */
export function orderPayload(fields, version) {
  const payload = Object.fromEntries(Object.entries(fields).flatMap(([field, raw]) => {
    const value = raw.trim();
    if (field === "order_code" && version !== undefined) return [];
    if (["latitude", "longitude"].includes(field) && value === "") return [];
    if (["weight_kg", "latitude", "longitude"].includes(field)) return [[field, value === "" ? "" : Number(value)]];
    return [[field, field.startsWith("window_") ? value.replace("T", " ") : value]];
  }));
  return version === undefined ? payload : { ...payload, version };
}

/** @param {unknown} errors */
export function orderIssues(errors) {
  /** @type {Record<string, string>} */
  const fieldErrors = {};
  /** @type {{row: number, field: string, message: string}[]} */
  const rowErrors = [];
  if (Array.isArray(errors)) {
    for (const issue of errors) {
      if (!issue || typeof issue.field !== "string" || typeof issue.message !== "string") continue;
      if (typeof issue.row === "number") rowErrors.push(issue);
      else fieldErrors[issue.field] = issue.message;
    }
  }
  return { fieldErrors, rowErrors };
}
