"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import styles from "./workspace.module.css";
import { AccountControl } from "../account-control";
import { formValue, orderPayload, orderIssues } from "./order-form.mjs";

const fields = {
  order_code: "Order code", recipient_name: "Recipient", recipient_phone: "Phone",
  delivery_address: "Address", window_start: "Window starts", window_end: "Window ends",
  weight_kg: "Weight (kg)", priority: "Priority", note: "Note",
  latitude: "Latitude", longitude: "Longitude",
};
type Field = keyof typeof fields;
type Order = Partial<Record<Field, string | number>> & { id: string; status: string; version: number; cancellation_reason?: string };
type OrderList = { orders: Order[]; total: number; page: number; pageSize: number };
type ImportPreview = { orders: (Partial<Record<Field, string | number>> & { row: number })[]; total: number; valid: number; saved: number };
type Mode = "list" | "detail" | "create" | "edit" | "cancel" | "import";
const required = Object.keys(fields).slice(0, 7);
const blankFilters = { q: "", status: "", from: "", to: "" };
const input = styles.input;
const button = styles.button;
const successMessages: Partial<Record<Mode, string>> = {
  create: "Order created.", edit: "Order updated.", cancel: "Order cancelled.", import: "Orders imported.",
};

class RequestError extends Error {
  constructor(public status: number, public body: Record<string, unknown>) {
    super(typeof body.message === "string" ? body.message : ({
      401: "Sign in to continue.", 403: "You do not have permission to manage orders.",
      404: "The requested resource was not found.", 409: body.code === "DUPLICATE_ORDER_CODE" ? "An order code already exists in this hub." : "This order has changed. Reload its details before retrying.",
    }[status] ?? "The request failed. Please try again."));
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/orders" + path, { cache: "no-store", ...init });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new RequestError(response.status, body ?? {});
  return body as T;
}

const json = (method: string, data: unknown): RequestInit => ({
  method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
});

function orderPath(order: Order) {
  return "/" + encodeURIComponent(order.id);
}

export function OrdersWorkspace() {
  const [mode, setMode] = useState<Mode>("list");
  const [filters, setFilters] = useState(blankFilters);
  const [query, setQuery] = useState({ ...blankFilters, page: 1 });
  const [list, setList] = useState<OrderList>();
  const [selected, setSelected] = useState<Order>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<RequestError | Error>();
  const [notice, setNotice] = useState("");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [importPhase, setImportPhase] = useState<"pick" | "preview" | "report" | "complete">("pick");
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<ImportPreview>();
  const [imported, setImported] = useState(0);
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) summaryRef.current?.focus();
  }, [error]);

  const load = useCallback(async (signal?: AbortSignal) => {
    const params = new URLSearchParams({ page: String(query.page) });
    for (const field of Object.keys(blankFilters) as (keyof typeof blankFilters)[]) {
      if (query[field]) params.set(field, query[field]);
    }
    try {
      const result = await request<OrderList>("?" + params, { signal });
      if (!Array.isArray(result.orders) || typeof result.total !== "number" || typeof result.page !== "number" || typeof result.pageSize !== "number") {
        throw new Error("The server returned an unexpected order list.");
      }
      if (!signal?.aborted) setList(result);
    } catch (caught) {
      if (!signal?.aborted) {
        setList(undefined);
        setError(caught instanceof Error ? caught : new Error("Unable to load orders."));
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    const abort = new AbortController();
    queueMicrotask(() => {
      if (!abort.signal.aborted) void load(abort.signal);
    });
    return () => abort.abort();
  }, [load]);

  function open(next: Mode) {
    setError(undefined);
    setNotice("");
    if (next === "import") {
      setImportPhase("pick"); setPreview(undefined); setFile(undefined);
    }
    if (next === "create" || next === "edit") {
      setInputs(Object.fromEntries((Object.keys(fields) as Field[]).map(key =>
        [key, formValue(key, next === "edit" ? selected : undefined)])));
    }
    setMode(next);
  }

  async function inspect(order: Order) {
    setSaving(true);
    setError(undefined);
    try {
      setSelected(await request<Order>(orderPath(order)));
      setMode("detail");
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("Unable to open the order."));
    } finally {
      setSaving(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(undefined);
    try {
      let savedOrder: Order | undefined;
      const message = successMessages[mode] ?? "Saved.";
      if (mode === "create") savedOrder = await request<Order>("", json("POST", orderPayload(inputs)));
      else if (mode === "edit" && selected) savedOrder = await request<Order>(orderPath(selected), json("PATCH", orderPayload(inputs, selected.version)));
      else if (mode === "cancel" && selected) {
        savedOrder = await request<Order>(orderPath(selected) + "/cancel", json("POST", { reason: String(form.get("reason")).trim(), version: selected.version }));
      } else if (mode === "import") {
        if (!file) throw new RequestError(400, { errors: [{ field: "file", message: "Choose a CSV file" }] });
        const upload = new FormData(); upload.append("file", file);
        if (importPhase === "preview") {
          const result = await request<{ imported: number }>("/import", { method: "POST", body: upload });
          setImported(result.imported); setImportPhase("complete"); setPreview(undefined); setFile(undefined);
        } else {
          setPreview(await request<ImportPreview>("/import/preview", { method: "POST", body: upload }));
          setImportPhase("preview");
        }
        return;
      }
      if (savedOrder) {
        setSelected(savedOrder);
        setMode("detail");
        setNotice(message);
      } else {
        setSelected(undefined);
        setMode("list");
        setNotice(message);
        setLoading(true); await load();
      }
    } catch (caught) {
      if (mode === "import") {
        setPreview(undefined);
        setImportPhase(caught instanceof RequestError && Array.isArray(caught.body.errors) && caught.body.errors.some(issue => typeof issue.row === "number") ? "report" : "pick");
      }
      setError(caught instanceof Error ? caught : new Error("Unable to save."));
    } finally {
      setSaving(false);
    }
  }

  const body = error instanceof RequestError ? error.body : {};
  const { fieldErrors, rowErrors } = orderIssues(body.errors);
  const denied = error instanceof RequestError && (error.status === 401 || error.status === 403);
  const unavailable = error instanceof RequestError && error.status === 404;
  const page = list?.page ?? 1;

  return <div className={styles.shell}>
    <aside className={styles.sidebar} aria-label="Workspace navigation">
      <Link href="/" className={styles.brand}><span className={styles.mark} aria-hidden="true">V</span><span>Veylo<small>Dispatcher</small></span></Link>
      <p className={styles.hub}><span aria-hidden="true" />Dispatch workspace</p>
      <nav aria-label="Current workspace">
        <Link href="/orders" aria-current="page" className={styles.active}>Orders</Link>
        <ul className={styles.unavailable} aria-label="Other workspaces">
          <li>Shifts</li><li>Delivery attempts</li><li>Location guides</li><li>Reports</li>
        </ul>
      </nav>
      <div className={styles.account}><strong>Hub Dispatcher</strong><AccountControl /></div>
    </aside>
    <main className={styles.workspace}>
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Hub operations / Orders</p>
          <h1>Orders</h1>
          <p>Search and manage orders for your hub.</p>
        </div>
        {mode === "list" && !denied && !unavailable && <div className={styles.actions}>
          <button className={`${button} ${styles.primary}`} disabled={!list || loading} onClick={() => open("create")}>Create order</button>
          <button className={button} disabled={!list || loading} onClick={() => open("import")}>Import CSV</button>
        </div>}
      </header>
    {notice && <p role="status" className="mb-4 text-emerald-800">{notice}</p>}
    {error && <div ref={summaryRef} role="alert" tabIndex={-1} className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-900">
      <p>{error.message}</p>
      {Object.entries(fieldErrors).length > 0 && <ul className="list-disc pl-5">{Object.entries(fieldErrors).map(([field, message]) =>
        <li key={field}><a href={`#${field}`} className="underline" onClick={event => { event.preventDefault(); document.getElementById(field)?.focus(); }}>{fields[field as Field] ?? (field === "file" ? "CSV file" : field === "reason" ? "Reason" : field)}: {message}</a></li>)}</ul>}
      {mode === "import" && <p>{rowErrors.length > 0 ? `${rowErrors.length} issue(s) across ${new Set(rowErrors.map(issue => issue.row)).size} record(s). ` : ""}0 orders imported.</p>}
      {rowErrors.length > 0 && <div className={styles.table} role="region" aria-label="CSV diagnostics" tabIndex={0}>
          <table className="w-full text-left"><thead><tr>{["Record", "Column", "Reason"].map(label => <th key={label} className="p-3" scope="col">{label}</th>)}</tr></thead>
          <tbody>{rowErrors.map((issue, index) => <tr key={index}><td className="p-3">{issue.row}</td><td className="p-3">{issue.field}</td><td className="p-3">{issue.message}</td></tr>)}</tbody></table>
      </div>}
    </div>}
    {denied && error instanceof RequestError && error.status === 401 && <><p>Your previous action will not be replayed.</p><Link className={button} href="/sign-in?next=/orders">Sign in</Link></>}
    {denied && error instanceof RequestError && error.status === 403 && <Link className={button} href="/">Return to staff workspace</Link>}
    {unavailable && <button className={button} onClick={() => { setSelected(undefined); open("list"); setLoading(true); void load(); }}>Back to orders</button>}
    {mode === "list" && !denied && !unavailable && <section data-screen-id="S07-01">
      <form className={styles.filters} onSubmit={event => {
        event.preventDefault(); setError(undefined); setLoading(true); setQuery({ ...filters, page: 1 });
      }}>
        <label>Search orders<input placeholder="Code, recipient name or phone" className={input} value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} /></label>
        <label>Status<select className={input} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All statuses</option><option>NEW</option><option>CANCELLED</option></select></label>
        <label>Start date from<input className={input} type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></label>
        <label>Start date to<input className={input} type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></label>
        <button className={`${button} ${styles.primary}`} disabled={loading}>Apply filters</button>
      </form>
      {loading ? <p role="status">Loading orders…</p> : list && (list.orders.length === 0 ? <p>No orders match these filters.</p> :
        <div className={styles.table}>
          <table className="w-full text-left"><thead ><tr>{["Order / Recipient", "Delivery window (UTC+7)", "Weight", "Status"].map(title => <th className="p-3" key={title} scope="col">{title}</th>)}</tr></thead>
            <tbody>{list.orders.map(order => <tr key={order.id} className="border-t border-slate-200">
              <td className="p-3"><button type="button" className={styles.orderLink} disabled={saving} aria-label={`Open order ${order.order_code}`} onClick={() => void inspect(order)}>{order.order_code}</button> <strong>{order.recipient_name}</strong><span className={styles.address}>{order.delivery_address}</span></td>
              <td className="p-3">{formValue("window_start", order).replace("T", " ")} – {formValue("window_end", order).replace("T", " ")}</td>
              <td className="p-3">{order.weight_kg} kg</td><td className="p-3"><span className={styles.status} data-status={order.status}>{order.status}</span></td>
            </tr>)}</tbody>
          </table>
        </div>)}
      {!loading && list && <nav aria-label="Order pages" className="mt-4 flex items-center gap-3">
        <button className={button} disabled={page <= 1 || saving} onClick={() => { setError(undefined); setLoading(true); setQuery({ ...query, page: page - 1 }); }}>Previous</button>
        <span>Page {page} · {list.total} orders</span>
        <button className={button} disabled={page * list.pageSize >= list.total || saving} onClick={() => { setError(undefined); setLoading(true); setQuery({ ...query, page: page + 1 }); }}>Next</button>
      </nav>}
    </section>}
    {mode !== "list" && !unavailable && <button className={`${button} mb-4`} disabled={saving} onClick={() => {
      if (mode === "cancel") open("detail");
      else { open("list"); setLoading(true); void load(); }
    }}>{mode === "cancel" ? "Back to detail" : "Back to orders"}</button>}
    {!denied && !unavailable && mode === "detail" && selected && <section data-screen-id="S07-02" className={styles.card}>
      <h2 className="text-xl font-semibold">Order {selected.order_code}</h2>
      <p className="mt-2">Status: {selected.status}</p>
      <dl className="my-4 grid gap-3 sm:grid-cols-2">{(Object.keys(fields) as Field[]).map(key => <div key={key}><dt className="font-medium">{fields[key]}</dt><dd>{key.startsWith("window_") ? formValue(key, selected).replace("T", " ") : selected[key] ?? "—"}</dd></div>)}</dl>
      {selected.cancellation_reason && <p>Cancellation reason: {selected.cancellation_reason}</p>}
      {selected.status === "NEW" && <div className="mt-4 flex gap-2"><button className={button} onClick={() => open("edit")}>Edit order</button><button className={button} onClick={() => open("cancel")}>Cancel order</button></div>}
    </section>}
    {!denied && !unavailable && (mode === "create" || mode === "edit") && <form data-screen-id={mode === "edit" ? "S08-01" : "S05-01"} noValidate onSubmit={submit} className={`${styles.card} grid max-w-4xl gap-4 sm:grid-cols-2`}>
      <h2 className="text-xl font-semibold sm:col-span-2">{mode === "edit" ? `Edit ${selected?.order_code}` : "New order"}</h2>
      <p className="sm:col-span-2">Delivery windows use Ho Chi Minh City local time.</p>
      {(Object.keys(fields) as Field[]).map(key => <div key={key}>
        <label htmlFor={key}>{fields[key]}</label>
        {key === "priority" ? <select id={key} className={input} value={inputs[key] ?? ""} onChange={e => setInputs({ ...inputs, [key]: e.target.value })}><option>NORMAL</option><option>HIGH</option></select> :
          <input id={key} className={input} type={key.startsWith("window_") ? "datetime-local" : key === "recipient_phone" ? "tel" : "text"}
            value={inputs[key] ?? ""} readOnly={mode === "edit" && key === "order_code"} required={required.includes(key)} aria-invalid={Boolean(fieldErrors[key])} aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
            onChange={e => setInputs({ ...inputs, [key]: e.target.value })} />}
        {fieldErrors[key] && <p id={`${key}-error`} className="text-red-800">{String(fieldErrors[key])}</p>}
      </div>)}
      <div className="flex gap-2 sm:col-span-2">
        <button className={button} disabled={saving}>{saving ? "Saving…" : mode === "edit" ? "Save changes" : "Save order"}</button>
        {mode === "edit" && <button type="button" className={button} disabled={saving} onClick={() => open("detail")}>Discard and return</button>}
        {error instanceof RequestError && error.body.code === "ORDER_CONFLICT" && selected && <button type="button" className={button} disabled={saving} onClick={() => void inspect(selected)}>Reload order</button>}
      </div>
    </form>}
    {!denied && !unavailable && mode === "cancel" && selected && <form data-screen-id="S08-02" className={`${styles.card} grid max-w-lg gap-3`} noValidate onSubmit={submit}>
      <h2 className="text-xl font-semibold">Confirm cancellation of {selected.order_code}</h2>
      <label htmlFor="reason">Reason</label><textarea id="reason" className={input} name="reason" minLength={5} maxLength={300} required aria-invalid={Boolean(fieldErrors.reason)} aria-describedby={fieldErrors.reason ? "reason-error" : undefined} />
      {fieldErrors.reason && <p id="reason-error" className="text-red-800">{String(fieldErrors.reason)}</p>}
      <button className={button} disabled={saving}>Confirm cancellation</button>
      <button type="button" className={button} disabled={saving} onClick={() => open("detail")}>Keep order</button>
      {error instanceof RequestError && error.body.code === "ORDER_CONFLICT" && <button type="button" className={button} disabled={saving} onClick={() => void inspect(selected)}>Reload order</button>}
    </form>}
    {!denied && !unavailable && mode === "import" && <section data-screen-id={importPhase === "preview" ? "S06-02" : importPhase === "complete" ? "S06-03" : importPhase === "report" ? "S06-02-row-errors" : "S06-01"} className={`${styles.card} grid gap-3`}>
      <h2 className="text-xl font-semibold">{importPhase === "preview" ? "Review import" : importPhase === "complete" ? "Import complete" : importPhase === "report" ? "Import errors" : "Import orders from CSV"}</h2>
      {importPhase !== "complete" && <a href="/api/orders/template" download="order-template.csv" className="underline">Download CSV template</a>}
      {importPhase === "pick" && <form noValidate onSubmit={submit} className="grid gap-3">
        <p>CSV in UTF-8 · Up to 500 orders and 1,000,000 bytes.</p>
        <label htmlFor="file">CSV file</label><input id="file" className={input} type="file" name="file" accept=".csv,text/csv" required disabled={saving} aria-invalid={Boolean(fieldErrors.file)} aria-describedby={fieldErrors.file ? "file-error" : undefined} onChange={event => { setFile(event.target.files?.[0]); setPreview(undefined); setError(undefined); }} />
        {fieldErrors.file && <p id="file-error" className="text-red-800">{String(fieldErrors.file)}</p>}
        <button className={button} disabled={saving}>{saving ? "Checking…" : "Check CSV"}</button>
      </form>}
      {importPhase === "preview" && preview && <>
        <p>{file?.name} · {preview.valid} orders ready to import. 0 orders saved.</p>
        <div className={styles.table} role="region" aria-label="Preview records" tabIndex={0}>
          <table className="w-full text-left"><thead><tr><th scope="col" className="p-3">Record</th>{Object.entries(fields).map(([key, label]) => <th key={key} scope="col" className="p-3">{label}</th>)}</tr></thead>
          <tbody>{preview.orders.map(order => <tr key={order.row}><td className="p-3">{order.row}</td>{(Object.keys(fields) as Field[]).map(key => <td key={key} className="p-3">{String(order[key] ?? "—")}</td>)}</tr>)}</tbody></table>
        </div>
        <form onSubmit={submit}><button className={button} disabled={saving}>{saving ? "Importing…" : `Import ${preview.total} orders`}</button></form>
        <button className={button} disabled={saving} onClick={() => { open("list"); setFile(undefined); setPreview(undefined); setNotice("0 orders imported. Import cancelled."); }}>Cancel import</button>
        <button className={button} disabled={saving} onClick={() => open("import")}>Choose a replacement CSV</button>
      </>}
      {importPhase === "report" && <>
        <button className={button} disabled={saving} onClick={() => open("import")}>Choose a replacement CSV</button>
      </>}
      {importPhase === "complete" && <><p role="status">{imported} orders imported.</p><button className={button} onClick={() => { open("list"); setLoading(true); void load(); }}>View orders</button></>}
    </section>}
    </main>
  </div>;
}
