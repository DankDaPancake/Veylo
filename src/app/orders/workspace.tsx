"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { AccountControl } from "../account-control";
import { orderPayload, orderIssues } from "./order-form.mjs";

const fields = {
  order_code: "Order code", recipient_name: "Recipient", recipient_phone: "Phone",
  delivery_address: "Address", window_start: "Window starts", window_end: "Window ends",
  weight_kg: "Weight (kg)", priority: "Priority", note: "Note",
  latitude: "Latitude", longitude: "Longitude",
};
type Field = keyof typeof fields;
type Order = Partial<Record<Field, string | number>> & { id: string; status: string; version: number; cancellation_reason?: string };
type OrderList = { orders: Order[]; total: number; page: number; pageSize: number };
type Mode = "list" | "detail" | "create" | "edit" | "cancel" | "import";
const required = Object.keys(fields).slice(0, 7);
const blankFilters = { q: "", status: "", from: "", to: "" };
const input = "block min-h-10 w-full rounded border border-slate-400 px-3 py-2";
const button = "inline-flex min-h-10 items-center rounded border border-emerald-800 px-4 py-2 font-medium hover:bg-emerald-50 disabled:opacity-50";
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

function formValue(field: Field, order?: Order) {
  const value = order?.[field];
  if (value == null) return field === "priority" ? "NORMAL" : "";
  if (!field.startsWith("window_")) return String(value);
  const text = String(value);
  const date = new Date(text);
  if (!/(Z|[+-]\d{2}:\d{2})$/.test(text) || Number.isNaN(date.getTime())) return text.replace(" ", "T").slice(0, 16);
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(date).replace(" ", "T");
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
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setError(undefined);
    try {
      let message = successMessages[mode] ?? "Saved.";
      if (mode === "create") await request("", json("POST", orderPayload(inputs)));
      else if (mode === "edit" && selected) await request(orderPath(selected), json("PATCH", orderPayload(inputs, selected.version)));
      else if (mode === "cancel" && selected) {
        await request(orderPath(selected) + "/cancel", json("POST", { reason: String(form.get("reason")).trim(), version: selected.version }));
      } else if (mode === "import") {
        const result = await request<{ imported: number }>("/import", { method: "POST", body: form });
        message = `Imported ${result.imported} orders.`;
      }
      setSelected(undefined);
      setMode("list");
      setNotice(message);
      setLoading(true); await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error("Unable to save."));
    } finally {
      setSaving(false);
    }
  }

  const body = error instanceof RequestError ? error.body : {};
  const { fieldErrors, rowErrors } = orderIssues(body.errors);
  const denied = error instanceof RequestError && (error.status === 401 || error.status === 403);
  const page = list?.page ?? 1;

  return <main className="mx-auto min-h-screen max-w-7xl px-6 py-10">
    <header className="mb-8 border-b border-emerald-900/20 pb-5">
      <div className="flex items-center justify-between">
        <Link href="/" className="font-semibold text-emerald-800">Veylo</Link>
        <AccountControl />
      </div>
      <h1 className="mt-2 text-3xl font-semibold">Orders</h1>
    </header>
    {notice && <p role="status" className="mb-4 text-emerald-800">{notice}</p>}
    {error && <p role="alert" className="mb-4 rounded border border-red-300 bg-red-50 p-3 text-red-900">{error.message}</p>}
    {denied && error instanceof RequestError && error.status === 401 && <Link className={button} href="/sign-in?next=/orders">Sign in</Link>}
    {mode === "list" && !denied && <section data-screen-id="S07-01">
      <div className="mb-4 flex flex-wrap gap-2">
        <button className={button} disabled={!list || loading} onClick={() => open("create")}>New order</button>
        <button className={button} disabled={!list || loading} onClick={() => open("import")}>Import CSV</button>
      </div>
      <form className="mb-5 grid gap-3 sm:grid-cols-5 sm:items-end" onSubmit={event => {
        event.preventDefault(); setError(undefined); setLoading(true); setQuery({ ...filters, page: 1 });
      }}>
        <label>Search<input className={input} value={filters.q} onChange={e => setFilters({ ...filters, q: e.target.value })} /></label>
        <label>Status<select className={input} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}><option value="">All</option><option>NEW</option><option>CANCELLED</option></select></label>
        <label>From<input className={input} type="date" value={filters.from} onChange={e => setFilters({ ...filters, from: e.target.value })} /></label>
        <label>To<input className={input} type="date" value={filters.to} onChange={e => setFilters({ ...filters, to: e.target.value })} /></label>
        <button className={button} disabled={loading}>Apply filters</button>
      </form>
      {loading ? <p role="status">Loading orders…</p> : list && (list.orders.length === 0 ? <p>No orders match these filters.</p> :
        <div className="overflow-x-auto rounded border border-slate-300 bg-white">
          <table className="w-full text-left"><thead className="bg-emerald-50"><tr>{["Code", "Recipient", "Delivery window", "Status", "Action"].map(title => <th className="p-3" key={title} scope="col">{title}</th>)}</tr></thead>
            <tbody>{list.orders.map(order => <tr key={order.id} className="border-t border-slate-200">
              <td className="p-3">{order.order_code}</td><td className="p-3">{order.recipient_name}</td>
              <td className="p-3">{formValue("window_start", order).replace("T", " ")} – {formValue("window_end", order).replace("T", " ")}</td>
              <td className="p-3">{order.status}</td><td className="p-3"><button className={button} disabled={saving} aria-label={`Open order ${order.order_code}`} onClick={() => void inspect(order)}>View</button></td>
            </tr>)}</tbody>
          </table>
        </div>)}
      {!loading && list && <nav aria-label="Order pages" className="mt-4 flex items-center gap-3">
        <button className={button} disabled={page <= 1 || saving} onClick={() => { setError(undefined); setLoading(true); setQuery({ ...query, page: page - 1 }); }}>Previous</button>
        <span>Page {page} · {list.total} orders</span>
        <button className={button} disabled={page * list.pageSize >= list.total || saving} onClick={() => { setError(undefined); setLoading(true); setQuery({ ...query, page: page + 1 }); }}>Next</button>
      </nav>}
    </section>}
    {mode !== "list" && <button className={`${button} mb-4`} disabled={saving} onClick={() => { open("list"); if (denied) { setLoading(true); void load(); } }}>Back to orders</button>}
    {!denied && mode === "detail" && selected && <section data-screen-id="S07-02">
      <h2 className="text-xl font-semibold">Order {selected.order_code}</h2>
      <p className="mt-2">Status: {selected.status}</p>
      <dl className="my-4 grid gap-3 sm:grid-cols-2">{(Object.keys(fields) as Field[]).map(key => <div key={key}><dt className="font-medium">{fields[key]}</dt><dd>{key.startsWith("window_") ? formValue(key, selected).replace("T", " ") : selected[key] ?? "—"}</dd></div>)}</dl>
      {selected.cancellation_reason && <p>Cancellation reason: {selected.cancellation_reason}</p>}
      {selected.status === "NEW" && <div className="mt-4 flex gap-2"><button className={button} onClick={() => open("edit")}>Edit order</button><button className={button} onClick={() => open("cancel")}>Cancel order</button></div>}
    </section>}
    {!denied && (mode === "create" || mode === "edit") && <form data-screen-id={mode === "edit" ? "S08-01" : "S05-01"} onSubmit={submit} className="grid max-w-3xl gap-4 sm:grid-cols-2">
      <h2 className="text-xl font-semibold sm:col-span-2">{mode === "edit" ? `Edit ${selected?.order_code}` : "New order"}</h2>
      <p className="sm:col-span-2">Delivery windows use Ho Chi Minh City local time.</p>
      {(Object.keys(fields) as Field[]).filter(key => mode !== "edit" || key !== "order_code").map(key => <div key={key}>
        <label htmlFor={key}>{fields[key]}</label>
        {key === "priority" ? <select id={key} className={input} value={inputs[key] ?? ""} onChange={e => setInputs({ ...inputs, [key]: e.target.value })}><option>NORMAL</option><option>HIGH</option></select> :
          <input id={key} className={input} type={key.startsWith("window_") ? "datetime-local" : key === "recipient_phone" ? "tel" : "text"}
            value={inputs[key] ?? ""} required={required.includes(key)} aria-invalid={Boolean(fieldErrors[key])} aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
            onChange={e => setInputs({ ...inputs, [key]: e.target.value })} />}
        {fieldErrors[key] && <p id={`${key}-error`} className="text-red-800">{String(fieldErrors[key])}</p>}
      </div>)}
      <div className="flex gap-2 sm:col-span-2">
        <button className={button} disabled={saving}>{saving ? "Saving…" : "Save order"}</button>
        {error instanceof RequestError && error.body.code === "ORDER_CONFLICT" && selected && <button type="button" className={button} disabled={saving} onClick={() => void inspect(selected)}>Reload details</button>}
      </div>
    </form>}
    {!denied && mode === "cancel" && selected && <form data-screen-id="S08-03" className="grid max-w-lg gap-3" onSubmit={submit}>
      <h2 className="text-xl font-semibold">Confirm cancellation of {selected.order_code}</h2>
      <label>Reason<textarea className={input} name="reason" minLength={5} maxLength={300} required /></label>
      {fieldErrors.reason && <p className="text-red-800">{String(fieldErrors.reason)}</p>}
      <button className={button} disabled={saving}>Confirm cancellation</button>
      {error instanceof RequestError && error.body.code === "ORDER_CONFLICT" && <button type="button" className={button} disabled={saving} onClick={() => void inspect(selected)}>Reload details</button>}
    </form>}
    {!denied && mode === "import" && <form data-screen-id="S06-01" className="grid max-w-2xl gap-3" onSubmit={submit}>
      <h2 className="text-xl font-semibold">Import orders from CSV</h2>
      <a href="/api/orders/template" download="order-template.csv" className="underline">Download CSV template</a>
      <label>CSV file<input className={input} type="file" name="file" accept=".csv,text/csv" required /></label>
      {fieldErrors.file && <p className="text-red-800">{String(fieldErrors.file)}</p>}
      {Array.isArray(rowErrors) && rowErrors.length > 0 && <ul className="list-disc pl-5 text-red-800">
        {rowErrors.map((issue, index) => <li key={index}>Row {issue.row}, {issue.field}: {issue.message}</li>)}
      </ul>}
      <button className={button} disabled={saving}>{saving ? "Importing…" : "Import orders"}</button>
    </form>}
  </main>;
}
