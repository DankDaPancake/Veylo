import { OrderError, optionalFields, requiredFields, validateOrder, type FieldError } from "./validation.ts";

export const csvHeader = [...requiredFields, ...optionalFields].join(",");
export const csvTemplate = csvHeader + '\nCSV-EXAMPLE-001,Synthetic Recipient,0900000001,"1 Synthetic Street, Demo",2026-11-20 09:00,2026-11-20 11:00,1,NORMAL,,,\n';

function fileError(message: string): never {
  throw new OrderError(400, "INVALID_CSV", [{ field: "file", message }]);
}

function records(text: string, maxRecords: number): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  let closed = false;
  const pushRow = () => {
    rows.push(row);
    if (rows.length > maxRecords) fileError("Use 1–500 data records");
    row = [];
    field = "";
    closed = false;
  };
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { quoted = false; closed = true; }
      } else field += char;
    } else if (char === '"') {
      if (field || closed) fileError("Malformed quoted field");
      quoted = true;
    } else if (char === ",") {
      row.push(field); field = ""; closed = false;
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[++i] !== "\n") fileError("Use LF or CRLF line endings");
      row.push(field); pushRow();
    } else {
      if (closed) fileError("Unexpected text after closing quote");
      field += char;
    }
  }
  if (quoted) fileError("Unterminated quoted field");
  if (row.length || field || closed) { row.push(field); pushRow(); }
  return rows;
}

export function parseOrdersCsv(bytes: Uint8Array, filename: string) {
  if (!filename.toLowerCase().endsWith(".csv")) fileError("Upload a .csv file");
  if (!bytes.length || bytes.length > 1_000_000) fileError("File must contain 1–1,000,000 bytes");
  let text: string;
  try { text = new TextDecoder("utf-8", { fatal: true }).decode(bytes); }
  catch { fileError("File must use UTF-8"); }
  const rows = records(text!, 501);
  const header = rows.shift() ?? [];
  const allowed: readonly string[] = [...requiredFields, ...optionalFields];
  if (new Set(header).size !== header.length || requiredFields.some((key) => !header.includes(key)) || header.some((key) => !allowed.includes(key))) fileError("Headers must be unique and contain only the required and optional template columns");
  if (rows.length < 1 || rows.length > 500) fileError("Use 1–500 data records");
  if (rows.some((row) => row.length !== header.length)) fileError("Every record must match the header column count");
  const errors: FieldError[] = [];
  const parsed: { row: number; data: ReturnType<typeof validateOrder> }[] = [];
  const codes = new Map<string, number[]>();
  for (const [index, values] of rows.entries()) {
    const row = index + 2;
    const body = Object.fromEntries(header.map((key, i) => [key, values[i]]));
    const code = String(body.order_code).trim().toLowerCase();
    if (/^[a-z0-9_-]{1,40}$/.test(code)) codes.set(code, [...(codes.get(code) ?? []), row]);
    try { parsed.push({ row, data: validateOrder(body) }); }
    catch (error) {
      if (!(error instanceof OrderError)) throw error;
      errors.push(...error.errors.map((item) => ({ ...item, row })));
    }
  }
  for (const occurrences of codes.values()) {
    if (occurrences.length > 1) errors.push(...occurrences.map((row) => ({ row, field: "order_code", message: "Duplicate order code within file" })));
  }
  if (errors.length) throw new OrderError(400, "VALIDATION_ERROR", errors);
  return parsed;
}
