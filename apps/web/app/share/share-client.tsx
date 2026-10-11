"use client";

import { useCallback, useEffect, useState } from "react";

type Link = { id: string; scope: unknown; expiresAt: string; revokedAt: string | null; openCount: number; opened: boolean; createdAt: string };
type Req = { id: string; linkId: string; fromName: string; status: string };
type Block = { id: string; name: string };

export function ShareClient() {
  const [links, setLinks] = useState<Link[]>([]);
  const [requests, setRequests] = useState<Req[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [scope, setScope] = useState("6m");
  const [days, setDays] = useState(7);
  const [fresh, setFresh] = useState<{ id: string; code: string } | null>(null);
  const [blockName, setBlockName] = useState("");
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/share");
    if (!res.ok) return;
    const d = (await res.json()) as { links: Link[]; requests: Req[]; blocks: Block[] };
    setLinks(d.links);
    setRequests(d.requests);
    setBlocks(d.blocks);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function create() {
    setMsg("");
    const res = await fetch("/api/share", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ scope, days }),
    });
    const d = (await res.json().catch(() => ({}))) as { id?: string; code?: string; error?: string; reminder?: string };
    if (!res.ok || !d.id || !d.code) {
      setMsg(d.error ?? "Could not create.");
      return;
    }
    setFresh({ id: d.id, code: d.code });
    setMsg((d.reminder ?? "") + " Code shown once — copy it now.");
    await load();
  }

  async function revoke(id: string) {
    await fetch(`/api/share/${id}`, { method: "DELETE" });
    setFresh((f) => (f?.id === id ? null : f));
    await load();
  }

  async function decide(id: string, decision: string) {
    const res = await fetch(`/api/share/requests/${id}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision, days: 7 }),
    });
    const d = (await res.json().catch(() => ({}))) as { code?: string; error?: string };
    setMsg(d.code ? `Approved. New code for them (show once): ${d.code}` : (d.error ?? "Done."));
    await load();
  }

  async function block() {
    if (!blockName.trim()) return;
    await fetch("/api/share/blocks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: blockName.trim() }),
    });
    setBlockName("");
    await load();
  }

  async function unblock(id: string) {
    await fetch(`/api/share/blocks/${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <main>
      <h1>Share your record</h1>
      <p className="mc-muted">Links need a code, expire when you choose, and stop the moment you cancel them.</p>

      <section className="mc-card">
        <h2>New link</h2>
        <div className="mc-row">
          <select className="mc-select" value={scope} onChange={(e) => setScope(e.target.value)} aria-label="What to include">
            <option value="6m">Last 6 months</option>
            <option value="1y">Last 12 months</option>
            <option value="all">Everything</option>
          </select>
          <select className="mc-select" value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Link works for">
            <option value={1}>1 day</option>
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
          </select>
          <button type="button" className="mc-btn mc-btn-primary" onClick={create}>Create link</button>
        </div>
        {fresh ? (
          <p><strong>Code (once): {fresh.code}</strong> — link: <a className="mc-link" href={`/s/${fresh.id}`}>/s/{fresh.id}</a></p>
        ) : null}
      </section>

      {msg ? <p aria-live="polite">{msg}</p> : null}

      <section className="mc-card">
        <h2>Your links</h2>
        {links.length === 0 ? <p className="mc-muted">None yet.</p> : (
          <ul className="mc-summary">
            {links.map((l) => (
              <li key={l.id}>
                <div>
                  <div>Expires {new Date(l.expiresAt).toLocaleDateString()}{l.revokedAt ? " · cancelled" : ""}</div>
                  <div className="mc-muted">
                    {l.opened ? "Opened ✓ — cancel any time with one tap." : "Not opened yet."} ({l.openCount})
                  </div>
                </div>
                {!l.revokedAt ? (
                  <button type="button" className="mc-btn" onClick={() => revoke(l.id)}>Cancel this link</button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mc-card">
        <h2>Who is asking ({requests.filter((r) => r.status === "open").length})</h2>
        {requests.filter((r) => r.status === "open").map((r) => (
          <div key={r.id} className="mc-row">
            <span><strong>{r.fromName}</strong> asks for access</span>
            <button type="button" className="mc-btn" onClick={() => decide(r.id, "approve")}>Approve</button>
            <button type="button" className="mc-btn mc-btn-quiet" onClick={() => decide(r.id, "ignore")}>Ignore</button>
          </div>
        ))}
      </section>

      <section className="mc-card">
        <h2>Blocked</h2>
        <div className="mc-row">
          <input className="mc-input" value={blockName} onChange={(e) => setBlockName(e.target.value)} placeholder="Name to block" />
          <button type="button" className="mc-btn mc-btn-quiet" onClick={block}>Block</button>
        </div>
        {blocks.map((b) => (
          <div key={b.id} className="mc-row">
            <span>{b.name}</span>
            <button type="button" className="mc-btn mc-btn-quiet" onClick={() => unblock(b.id)}>Unblock</button>
          </div>
        ))}
      </section>
    </main>
  );
}
