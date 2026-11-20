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
