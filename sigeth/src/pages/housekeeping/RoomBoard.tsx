/* eslint-disable -- Inline styles necessary for dynamic status-based theming with computed colors and gradients */
import { useState, useMemo, type ReactNode } from "react";
import { useHotelData } from "../../context/HotelDataContext";
import type { RDF, RoomStatusCode } from "../../types";

/* ═══════════════  STATUS.dat — all 11 codes  ═══════════════ */
interface StatusCfg {
  label: string;
  desc: string;
  group: string;
  dot: string;
  bg: string;
  border: string;
  text: string;
  card: string;
}

const STATUS: Record<RoomStatusCode, StatusCfg> = {
  VC: {
    label: "VC",
    desc: "Vacant Clean",
    group: "available",
    dot: "#22c55e",
    bg: "#f0fdf4",
    border: "#86efac",
    text: "#166534",
    card: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
  },
  CC: {
    label: "CC",
    desc: "Checked Clean",
    group: "available",
    dot: "#16a34a",
    bg: "#f0fdf4",
    border: "#6ee7b7",
    text: "#166534",
    card: "linear-gradient(135deg,#f0fdf4,#d1fae5)",
  },
  ARR: {
    label: "ARR",
    desc: "Arrival Expected",
    group: "reserved",
    dot: "#eab308",
    bg: "#fefce8",
    border: "#fde047",
    text: "#854d0e",
    card: "linear-gradient(135deg,#fefce8,#fef9c3)",
  },
  DU: {
    label: "DU",
    desc: "Due-Out Today",
    group: "reserved",
    dot: "#f59e0b",
    bg: "#fffbeb",
    border: "#fcd34d",
    text: "#92400e",
    card: "linear-gradient(135deg,#fffbeb,#fef3c7)",
  },
  OCC: {
    label: "OCC",
    desc: "Occupied",
    group: "occupied",
    dot: "#ef4444",
    bg: "#fef2f2",
    border: "#fca5a5",
    text: "#991b1b",
    card: "linear-gradient(135deg,#fef2f2,#fee2e2)",
  },
  OD: {
    label: "OD",
    desc: "Occupied Dirty",
    group: "occupied",
    dot: "#dc2626",
    bg: "#fef2f2",
    border: "#f87171",
    text: "#7f1d1d",
    card: "linear-gradient(135deg,#fef2f2,#fecaca)",
  },
  DND: {
    label: "DND",
    desc: "Do Not Disturb",
    group: "occupied",
    dot: "#b91c1c",
    bg: "#fff1f2",
    border: "#fda4af",
    text: "#9f1239",
    card: "linear-gradient(135deg,#fff1f2,#ffe4e6)",
  },
  DL: {
    label: "DL",
    desc: "Double Lock",
    group: "occupied",
    dot: "#be123c",
    bg: "#fff1f2",
    border: "#fb7185",
    text: "#881337",
    card: "linear-gradient(135deg,#fff1f2,#fecdd3)",
  },
  VD: {
    label: "VD",
    desc: "Vacant Dirty",
    group: "cleaning",
    dot: "#f97316",
    bg: "#fff7ed",
    border: "#fdba74",
    text: "#9a3412",
    card: "linear-gradient(135deg,#fff7ed,#ffedd5)",
  },
  CO: {
    label: "CO",
    desc: "Checked-Out (clean needed)",
    group: "cleaning",
    dot: "#ea580c",
    bg: "#fff7ed",
    border: "#fb923c",
    text: "#7c2d12",
    card: "linear-gradient(135deg,#fff7ed,#fed7aa)",
  },
  "LC/O": {
    label: "LC/O",
    desc: "Late Check-Out",
    group: "cleaning",
    dot: "#c2410c",
    bg: "#fff7ed",
    border: "#f97316",
    text: "#7c2d12",
    card: "linear-gradient(135deg,#fff7ed,#fdba74)",
  },
  OOO: {
    label: "OOO",
    desc: "Out of Order",
    group: "maintenance",
    dot: "#6b7280",
    bg: "#f9fafb",
    border: "#d1d5db",
    text: "#374151",
    card: "linear-gradient(135deg,#f9fafb,#f3f4f6)",
  },
};

const GROUP: Record<string, { label: string; color: string }> = {
  available: { label: "Available", color: "#22c55e" },
  reserved: { label: "Reserved", color: "#eab308" },
  occupied: { label: "Occupied", color: "#ef4444" },
  cleaning: { label: "Cleaning", color: "#f97316" },
  maintenance: { label: "Maintenance", color: "#6b7280" },
};

const GROUP_BG: Record<string, string> = {
  available: "#f0fdf4",
  reserved: "#fefce8",
  occupied: "#fef2f2",
  cleaning: "#fff7ed",
  maintenance: "#f9fafb",
};

const CATS: Record<number, string> = {
  1: "Executive Room",
  2: "Suite",
  3: "Superior",
  4: "Ambassador",
  5: "Presidential",
};
const CATS_SHORT: Record<number, string> = {
  1: "Exec",
  2: "Suite",
  3: "Sup",
  4: "Amb",
  5: "Pres",
};

function getFloor(num: string): number {
  return parseInt(num.charAt(0), 10) || 0;
}

/* ═══════════════  DetailModal  ═══════════════ */
function DetailModal({ room, onClose }: { room: RDF; onClose: () => void }) {
  const s = STATUS[room.status];
  const TODAY = new Date();
  const nightsLeft = room.depart_date
    ? Math.max(
        0,
        Math.ceil(
          (new Date(room.depart_date).getTime() - TODAY.getTime()) / 86400000,
        ),
      )
    : 0;
  const stayCost = room.qty * room.puv;
  const balance = stayCost - room.deposit;

  const Section = ({
    title,
    children,
  }: {
    title: string;
    children: ReactNode;
  }) => (
    <div style={{ marginBottom: 18 }}>
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "#94a3b8",
          marginBottom: 6,
          fontFamily: "'Sora',sans-serif",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );

  const Row = ({
    label,
    value,
    accent,
  }: {
    label: string;
    value: string | number;
    accent?: boolean;
  }) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "5px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <span
        style={{
          fontSize: 13,
          color: "#64748b",
          fontFamily: "'Sora',sans-serif",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 13,
          fontWeight: 600,
          color: accent ? "#2563eb" : "#1e293b",
          fontFamily: "'Lora',serif",
        }}
      >
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(15,23,42,.45)",
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 16,
          width: "95%",
          maxWidth: 420,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 25px 50px rgba(0,0,0,.15)",
          animation: "modalIn .25s ease",
        }}
        className="rb-scroll"
      >
        {/* header */}
        <div
          style={{
            background: s.card,
            padding: "20px 24px",
            borderBottom: `2px solid ${s.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 800,
                  color: s.text,
                  fontFamily: "'Lora',serif",
                }}
              >
                Room {room.room_num}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                {CATS[room.categorie] ?? `Cat ${room.categorie}`} ·{" "}
                {room.designation}
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 10px",
                  borderRadius: 20,
                  background: s.bg,
                  color: s.text,
                  border: `1px solid ${s.border}`,
                }}
              >
                {s.label} — {s.desc}
              </span>
              <button
                onClick={onClose}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,.08)",
                  cursor: "pointer",
                  fontSize: 16,
                  lineHeight: "28px",
                  textAlign: "center",
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        {/* body */}
        <div style={{ padding: "20px 24px" }}>
          <Section title="Room">
            <Row label="Room_num" value={room.room_num} />
            <Row
              label="Catégorie"
              value={`${room.categorie} — ${CATS[room.categorie] ?? ""}`}
            />
            <Row label="Designation" value={room.designation} />
          </Section>
          <Section title="Guest">
            <Row label="Guest_name" value={room.guest_name} />
            <Row label="Twin_name" value={room.twin_name} />
            <Row label="Twin_num" value={room.twin_num} />
          </Section>
          <Section title="Dates">
            <Row label="Arrival_date" value={room.arrival_date} />
            <Row label="Depart_date" value={room.depart_date} />
            <Row label="Qty (nights booked)" value={room.qty} />
            <Row label="Nights left" value={nightsLeft} accent />
          </Section>
          <Section title="Financial">
            <Row label="Current_mon" value={room.current_mon} />
            <Row
              label="Price_1 Single/Night"
              value={room.price_1?.toLocaleString()}
            />
            <Row
              label="Price_2 Double/Night"
              value={room.price_2?.toLocaleString()}
            />
            <Row
              label="PUV (applied rate)"
              value={room.puv?.toLocaleString()}
            />
            <Row
              label={`Stay cost (${room.qty} × ${room.puv?.toLocaleString()})`}
              value={stayCost.toLocaleString()}
              accent
            />
            <Row label="Deposit" value={room.deposit?.toLocaleString()} />
            <Row label="Balance" value={balance.toLocaleString()} accent />
          </Section>
          <Section title="Record">
            <Row label="Date" value={room.date} />
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════  RoomCard  ═══════════════ */
function RoomCard({
  room,
  onClick,
  idx,
}: {
  room: RDF;
  onClick: () => void;
  idx: number;
}) {
  const s = STATUS[room.status];
  return (
    <button
      onClick={onClick}
      style={{
        all: "unset",
        cursor: "pointer",
        background: s.card,
        border: `1.5px solid ${s.border}`,
        borderRadius: 14,
        padding: "14px 10px 12px",
        textAlign: "center",
        position: "relative",
        transition: "transform .15s, box-shadow .15s",
        animation: `fadeUp .35s ease ${idx * 30}ms both`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "";
        e.currentTarget.style.boxShadow = "";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: s.dot,
        }}
      />
      <div
        style={{
          fontSize: 20,
          fontWeight: 800,
          color: s.text,
          fontFamily: "'Lora',serif",
        }}
      >
        {room.room_num}
      </div>
      <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>
        {CATS_SHORT[room.categorie] ?? `Cat${room.categorie}`}
      </div>
      <div
        style={{
          fontSize: 9,
          fontWeight: 600,
          marginTop: 4,
          padding: "2px 8px",
          borderRadius: 20,
          display: "inline-block",
          background: s.bg,
          color: s.text,
          border: `1px solid ${s.border}`,
        }}
      >
        {s.label}
      </div>
      {room.guest_name && (
        <div
          style={{
            fontSize: 10,
            color: "#475569",
            marginTop: 6,
            maxWidth: "100%",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {room.guest_name}
        </div>
      )}
    </button>
  );
}

/* ═══════════════  Pill / Sel  ═══════════════ */
interface PillProps {
  n: number;
  l: string;
  c: string;
  bg: string;
  bc: string;
  onClick: () => void;
  active: boolean;
}
function Pill({ n, l, c, bg, bc, onClick, active }: PillProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 18px",
        borderRadius: 12,
        background: bg,
        border: `1.5px solid ${active ? c : bc}`,
        cursor: "pointer",
        transition: "border-color .2s, transform .15s",
        transform: active ? "scale(1.04)" : undefined,
        boxShadow: active ? `0 0 0 3px ${c}33` : undefined,
      }}
    >
      <span
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: c,
          fontFamily: "'Lora',serif",
        }}
      >
        {n}
      </span>
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#475569",
          fontFamily: "'Sora',sans-serif",
        }}
      >
        {l}
      </span>
    </button>
  );
}

interface SelProps {
  lbl: string;
  val: string;
  onChange: (v: string) => void;
  opts: { value: string; label: string }[];
}
function Sel({ lbl, val, onChange, opts }: SelProps) {
  return (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      aria-label={lbl}
      style={{
        padding: "8px 14px",
        borderRadius: 10,
        border: "1.5px solid #cbd5e1",
        fontSize: 13,
        fontFamily: "'Sora',sans-serif",
        color: "#334155",
        background: "#fff",
        cursor: "pointer",
        minWidth: 140,
      }}
    >
      <option value="">{lbl}</option>
      {opts.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export default function RoomBoard() {
  const { rooms } = useHotelData();
  const [selected, setSelected] = useState<RDF | null>(null);
  const [fFloor, setFFloor] = useState("");
  const [fCat, setFCat] = useState("");
  const [fStatus, setFStatus] = useState("");
  const [fGroup, setFGroup] = useState("");

  const FLOORS = useMemo(
    () =>
      [...new Set(rooms.map((r) => getFloor(r.room_num)))].sort(
        (a, b) => a - b,
      ),
    [rooms],
  );

  const filtered = useMemo(() => {
    let list = rooms;
    if (fFloor)
      list = list.filter((r) => getFloor(r.room_num) === Number(fFloor));
    if (fCat) list = list.filter((r) => r.categorie === Number(fCat));
    if (fStatus) list = list.filter((r) => r.status === fStatus);
    if (fGroup) list = list.filter((r) => STATUS[r.status]?.group === fGroup);
    return list;
  }, [rooms, fFloor, fCat, fStatus, fGroup]);

  const byFloor = useMemo(() => {
    const m: Record<number, RDF[]> = {};
    for (const r of filtered) {
      const fl = getFloor(r.room_num);
      (m[fl] ??= []).push(r);
    }
    return Object.entries(m)
      .map(([f, rs]) => [Number(f), rs] as [number, RDF[]])
      .sort(([a], [b]) => a - b);
  }, [filtered]);

  const stats = useMemo(() => {
    const g: Record<string, number> = {
      available: 0,
      reserved: 0,
      occupied: 0,
      cleaning: 0,
      maintenance: 0,
    };
    for (const r of rooms) {
      const grp = STATUS[r.status]?.group;
      if (grp) g[grp]++;
    }
    return g;
  }, [rooms]);

  const occPct = rooms.length
    ? Math.round((stats.occupied / rooms.length) * 100)
    : 0;
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const anyFilter = fFloor || fCat || fStatus || fGroup;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Sora:wght@300;400;600;700;800&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
        .rb-scroll::-webkit-scrollbar{width:6px}
        .rb-scroll::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
      `}</style>
      <div
        style={{
          minHeight: "100vh",
          background: "#eef2f7",
          fontFamily: "'Sora',sans-serif",
        }}
      >
        {/* ── Header banner ── */}
        <header
          style={{
            background: "linear-gradient(135deg,#1e293b,#334155)",
            color: "#fff",
            padding: "18px 32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                opacity: 0.6,
              }}
            >
              SIGETH · Front Office Administration
            </div>
            <div
              style={{
                fontSize: 22,
                fontWeight: 800,
                fontFamily: "'Lora',serif",
                marginTop: 2,
              }}
            >
              Visual Room Board
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 800,
                fontFamily: "'Lora',serif",
              }}
            >
              {occPct}%
            </div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>
              Occupancy · {today}
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 28px" }}>
          {/* ── Stat cards ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 20,
            }}
          >
            <Pill
              n={rooms.length}
              l="Total"
              c="#334155"
              bg="#f8fafc"
              bc="#e2e8f0"
              onClick={() => {
                setFGroup("");
                setFStatus("");
              }}
              active={!fGroup}
            />
            {Object.entries(GROUP).map(([k, v]) => (
              <Pill
                key={k}
                n={stats[k]}
                l={v.label}
                c={v.color}
                bg={GROUP_BG[k]}
                bc="#e2e8f0"
                onClick={() => setFGroup((g) => (g === k ? "" : k))}
                active={fGroup === k}
              />
            ))}
          </div>

          {/* ── Filters ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Sel
              lbl="All Floors"
              val={fFloor}
              onChange={setFFloor}
              opts={FLOORS.map((f) => ({
                value: String(f),
                label: `Floor ${f}`,
              }))}
            />
            <Sel
              lbl="All Categories"
              val={fCat}
              onChange={setFCat}
              opts={Object.entries(CATS).map(([k, v]) => ({
                value: k,
                label: v,
              }))}
            />
            <Sel
              lbl="All Statuses"
              val={fStatus}
              onChange={setFStatus}
              opts={(Object.keys(STATUS) as RoomStatusCode[]).map((k) => ({
                value: k,
                label: `${STATUS[k].label} — ${STATUS[k].desc}`,
              }))}
            />
            <Sel
              lbl="All Groups"
              val={fGroup}
              onChange={setFGroup}
              opts={Object.entries(GROUP).map(([k, v]) => ({
                value: k,
                label: v.label,
              }))}
            />
            {anyFilter && (
              <button
                onClick={() => {
                  setFFloor("");
                  setFCat("");
                  setFStatus("");
                  setFGroup("");
                }}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: "1.5px solid #fca5a5",
                  background: "#fef2f2",
                  color: "#dc2626",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>

          {/* ── STATUS legend ── */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 24,
              padding: "10px 16px",
              background: "#fff",
              borderRadius: 12,
              border: "1px solid #e2e8f0",
            }}
          >
            {(Object.keys(STATUS) as RoomStatusCode[]).map((k) => {
              const st = STATUS[k];
              return (
                <div
                  key={k}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 11,
                    color: "#475569",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: st.dot,
                      display: "inline-block",
                    }}
                  />
                  {st.label} {st.desc}
                </div>
              );
            })}
          </div>

          {/* ── Floor sections ── */}
          {byFloor.map(([floor, fRooms]) => {
            const mini: Record<string, number> = {};
            for (const r of fRooms) {
              const g = STATUS[r.status]?.group ?? "?";
              mini[g] = (mini[g] ?? 0) + 1;
            }
            return (
              <div key={floor} style={{ marginBottom: 28 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 12,
                    marginBottom: 10,
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: "#1e293b",
                      fontFamily: "'Lora',serif",
                    }}
                  >
                    Floor {floor}
                  </span>
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>
                    {fRooms.length} rooms
                  </span>
                  <span style={{ fontSize: 11, color: "#94a3b8" }}>
                    {Object.entries(mini)
                      .map(([g, n]) => `${GROUP[g]?.label ?? g} ${n}`)
                      .join(" · ")}
                  </span>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))",
                    gap: 12,
                  }}
                >
                  {fRooms
                    .sort((a, b) => a.room_num.localeCompare(b.room_num))
                    .map((r, i) => (
                      <RoomCard
                        key={r.room_num}
                        room={r}
                        onClick={() => setSelected(r)}
                        idx={i}
                      />
                    ))}
                </div>
              </div>
            );
          })}

          {byFloor.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "48px 0",
                color: "#94a3b8",
                fontSize: 14,
              }}
            >
              No rooms match the current filters.
            </div>
          )}
        </div>

        {selected && (
          <DetailModal room={selected} onClose={() => setSelected(null)} />
        )}
      </div>
    </>
  );
}
