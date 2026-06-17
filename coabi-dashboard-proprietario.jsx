import React, { useState, useMemo } from "react";
import {
  Building2, ChevronDown, X, FileText, Calendar, Clock, AlertTriangle,
  Lock, ShieldCheck, Download, Eye, Users, Check, Home, ArrowLeft
} from "lucide-react";

const C = {
  ink: "#1B201A", sub: "#6B7268", faint: "#9aa093",
  page: "#FFFFFF", card: "#FFFFFF",
  sage: "#5C7E70", sageDeep: "#3A554C", sageSoft: "#E4EDE7",
  coral: "#CF5F49", coralSoft: "#F6E2DC",
  honey: "#CC8E2E", honeySoft: "#F4E8CF",
  line: "#E7E4D9",
};
const eur = (n) => "€" + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const eur2 = (n) => "€" + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400..700&family=Hanken+Grotesque:wght@400;500;600;700&display=swap');
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
.disp{font-family:'Familjen Grotesk',sans-serif;letter-spacing:-0.02em;}
.body{font-family:'Hanken Grotesque',sans-serif;}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;}
.panel{transform:translateX(100%);transition:transform .3s cubic-bezier(.2,.8,.2,1);}
.panel.open{transform:translateX(0);}
.fade{animation:fade .2s ease;}
@keyframes fade{from{opacity:0}to{opacity:1}}
@media(max-width:560px){ .panel{width:100% !important;} }
`;

const PROPS = [
  {
    id: "saluzzo", address: "Via Saluzzo 12", city: "Torino", type: "Trilocale",
    start: "set 2025", end: "ago 2027", monthsLeft: 14, nearExpiry: false,
    tenants: [
      { id: "gm", name: "Gianmarco Russo", short: "GR", color: "#5C7E70", room: "Singola grande", rent: 420, deposit: 840, paid: true, idDate: "12 set 2025", ctrDate: "12 set 2025" },
      { id: "ma", name: "Marco Bianchi", short: "MB", color: "#CF5F49", room: "Singola", rent: 360, deposit: 720, paid: true, idDate: "12 set 2025", ctrDate: "12 set 2025" },
      { id: "so", name: "Sofia Greco", short: "SG", color: "#CC8E2E", room: "Doppia", rent: 300, deposit: 600, paid: true, idDate: "14 set 2025", ctrDate: "14 set 2025" },
    ],
  },
  {
    id: "vinzaglio", address: "Corso Vinzaglio 8", city: "Torino", type: "Bilocale",
    start: "lug 2024", end: "lug 2026", monthsLeft: 1, nearExpiry: true,
    tenants: [
      { id: "lu", name: "Luca Ferrari", short: "LF", color: "#5C7E70", room: "Camera A", rent: 480, deposit: 960, paid: false, idDate: "28 giu 2024", ctrDate: "1 lug 2024" },
      { id: "an", name: "Anna Conti", short: "AC", color: "#CC8E2E", room: "Camera B", rent: 460, deposit: 920, paid: true, idDate: "28 giu 2024", ctrDate: "1 lug 2024" },
    ],
  },
  {
    id: "po", address: "Via Po 34", city: "Torino", type: "Monolocale",
    start: "gen 2026", end: "gen 2028", monthsLeft: 19, nearExpiry: false,
    tenants: [
      { id: "el", name: "Elena Marino", short: "EM", color: "#5C7E70", room: "Intero", rent: 650, deposit: 1300, paid: true, idDate: "10 gen 2026", ctrDate: "10 gen 2026" },
    ],
  },
];

export default function App() {
  const [open, setOpen] = useState("saluzzo");
  const [sel, setSel] = useState(null); // {prop, tenant}
  const [toast, setToast] = useState(null);
  const flash = (m) => { setToast(m); setTimeout(() => setToast(null), 1800); };

  const kpi = useMemo(() => {
    let tenants = 0, deposits = 0, expiring = 0;
    PROPS.forEach((p) => { tenants += p.tenants.length; p.tenants.forEach((t) => (deposits += t.deposit)); if (p.nearExpiry) expiring++; });
    return { props: PROPS.length, tenants, deposits, expiring };
  }, []);

  return (
    <div className="body" style={{ minHeight: "100vh", background: C.page, color: C.ink }}>
      <style>{STYLE}</style>

      {/* Top bar */}
      <div style={{ borderBottom: `1px solid ${C.line}`, position: "sticky", top: 0, background: "rgba(255,255,255,.92)", backdropFilter: "blur(8px)", zIndex: 20 }}>
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Wordmark size={22} />
            <span style={{ fontSize: 12.5, color: C.sub, fontWeight: 600, borderLeft: `1px solid ${C.line}`, paddingLeft: 12 }}>Area proprietario</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>Carla De Santis</span>
            <div style={{ width: 34, height: 34, borderRadius: 99, background: C.sageDeep, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>CD</div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "26px 20px 80px" }}>
        <h1 className="disp" style={{ fontSize: 26, fontWeight: 700 }}>I tuoi immobili</h1>
        <p style={{ fontSize: 14, color: C.sub, marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <ShieldCheck size={15} color={C.sage} /> Vista in sola lettura — invitata dai tuoi inquilini.
        </p>

        {/* KPIs */}
        <div className="kpis" style={{ marginTop: 22 }}>
          <Kpi label="Immobili" value={kpi.props} icon={Building2} />
          <Kpi label="Inquilini" value={kpi.tenants} icon={Users} />
          <Kpi label="Contratti in scadenza" value={kpi.expiring} icon={AlertTriangle} tone={kpi.expiring ? "honey" : "sage"} sub="entro 90 giorni" />
          <Kpi label="Cauzioni in custodia" value={eur(kpi.deposits)} icon={Lock} sub="nei fondi casa" />
        </div>

        {/* Properties */}
        <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 14 }}>
          {PROPS.map((p) => {
            const isOpen = open === p.id;
            const rentTot = p.tenants.reduce((s, t) => s + t.rent, 0);
            return (
              <div key={p.id} style={{ border: `1px solid ${C.line}`, borderRadius: 18, overflow: "hidden", background: C.card, boxShadow: "0 1px 2px rgba(20,30,20,.03)" }}>
                <button onClick={() => setOpen(isOpen ? null : p.id)} style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "18px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: C.sageSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Home size={20} color={C.sageDeep} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="disp" style={{ fontSize: 17, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.address}</div>
                      <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{p.city} · {p.type} · {p.tenants.length} inquilini · {eur(rentTot)}/mese</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    {p.nearExpiry
                      ? <Tag tone="honey"><Clock size={12} /> Scade tra {p.monthsLeft} mese</Tag>
                      : <Tag tone="sage"><Check size={12} /> In regola</Tag>}
                    <ChevronDown size={20} color={C.faint} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
                  </div>
                </button>

                {isOpen && (
                  <div className="fade" style={{ borderTop: `1px solid ${C.line}` }}>
                    {p.tenants.map((t, i) => (
                      <button key={t.id} onClick={() => setSel({ prop: p, tenant: t })} style={{ width: "100%", textAlign: "left", background: "none", border: "none", borderTop: i ? `1px solid ${C.line}` : "none", cursor: "pointer", padding: "13px 18px 13px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 99, background: t.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5 }}>{t.short}</div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14.5 }}>{t.name}</div>
                            <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{t.room} · {eur(t.rent)}/mese</div>
                          </div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          {t.paid
                            ? <span style={{ fontSize: 12, color: C.sage, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Dot c={C.sage} /> Giugno ok</span>
                            : <span style={{ fontSize: 12, color: C.coral, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Dot c={C.coral} /> In attesa</span>}
                          <ChevronDown size={18} color={C.faint} style={{ transform: "rotate(-90deg)" }} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Tenant detail slide-over */}
      {sel && <Backdrop onClose={() => setSel(null)} />}
      <div className={"panel" + (sel ? " open" : "")} style={{ position: "fixed", top: 0, right: 0, height: "100%", width: 440, maxWidth: "100%", background: C.card, borderLeft: `1px solid ${C.line}`, boxShadow: "-10px 0 40px rgba(20,30,20,.12)", zIndex: 40, overflowY: "auto" }}>
        {sel && <TenantDetail prop={sel.prop} t={sel.tenant} onClose={() => setSel(null)} flash={flash} />}
      </div>

      {toast && (
        <div className="fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 28, background: C.ink, color: "#fff", padding: "10px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 500, zIndex: 60 }}>{toast}</div>
      )}
    </div>
  );
}

function TenantDetail({ prop, t, onClose, flash }) {
  const arretrati = t.paid ? 0 : t.rent;
  const recupero = t.deposit - arretrati;
  return (
    <div>
      <div style={{ position: "sticky", top: 0, background: "rgba(255,255,255,.95)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.line}`, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, border: `1px solid ${C.line}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}><ArrowLeft size={17} color={C.sub} /></button>
        <span style={{ fontSize: 13, color: C.sub }}>{prop.address}</span>
      </div>

      <div style={{ padding: "22px 18px 40px" }}>
        {/* Identity */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 56, height: 56, borderRadius: 99, background: t.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 19 }}>{t.short}</div>
          <div>
            <div className="disp" style={{ fontSize: 21, fontWeight: 700 }}>{t.name}</div>
            <div style={{ fontSize: 13, color: C.sub, marginTop: 1 }}>{t.room} · {prop.type}</div>
          </div>
        </div>

        {/* Locazione */}
        <SecLabel>Locazione</SecLabel>
        <div style={card()}>
          <Row label="Affitto mensile" value={eur2(t.rent)} strong />
          <Row label="Pagamento di giugno"
            valueEl={t.paid
              ? <span style={{ color: C.sage, fontWeight: 600 }}>Pagato</span>
              : <span style={{ color: C.coral, fontWeight: 600 }}>In attesa</span>} />
          <div style={{ fontSize: 11.5, color: C.faint, marginTop: 8, display: "flex", alignItems: "center", gap: 5 }}>
            <AlertTriangle size={12} /> Stato autodichiarato dall'inquilino — non una verifica del pagamento.
          </div>
        </div>

        {/* Contratto */}
        <SecLabel>Contratto</SecLabel>
        <div style={card()}>
          <Row label="Inizio" value={t.ctrDate} />
          <Row label="Scadenza" value={prop.end} />
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 12, background: prop.nearExpiry ? C.honeySoft : C.sageSoft, display: "flex", alignItems: "center", gap: 9 }}>
            {prop.nearExpiry ? <Clock size={16} color={C.honey} /> : <Calendar size={16} color={C.sageDeep} />}
            <span style={{ fontSize: 13, color: prop.nearExpiry ? "#8a5f1c" : C.sageDeep, fontWeight: 600 }}>
              {prop.nearExpiry ? `Scade tra ${prop.monthsLeft} mese — valuta rinnovo o disdetta` : `Mancano ${prop.monthsLeft} mesi alla scadenza`}
            </span>
          </div>
        </div>

        {/* Conguaglio + caparra */}
        <SecLabel>Conguaglio verso di te</SecLabel>
        <div style={card()}>
          <div style={{ fontSize: 13, color: C.sub, marginBottom: 12 }}>Se l'inquilino uscisse oggi:</div>
          <Row label="Caparra da restituire" value={eur2(t.deposit)} />
          <Row label="Arretrati affitto" valueEl={<span style={{ color: arretrati ? C.coral : C.ink }}>{arretrati ? "− " + eur2(arretrati) : eur2(0)}</span>} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}` }}>
            <span style={{ fontWeight: 600, fontSize: 14.5 }}>Gli spetta a fine contratto</span>
            <span className="disp" style={{ fontWeight: 700, fontSize: 19 }}>{eur2(recupero)}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.line}`, fontSize: 12.5 }}>
            <Lock size={14} color={C.sub} />
            <span style={{ color: C.sub }}>La caparra resta nel fondo casa fino a {prop.end}.</span>
          </div>
        </div>

        {/* Documenti */}
        <SecLabel>Documenti caricati alla registrazione</SecLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DocCard label="Carta d'identità" date={t.idDate} flash={flash} />
          <DocCard label="Contratto di locazione" date={t.ctrDate} flash={flash} />
        </div>

        {/* Privacy note */}
        <div style={{ marginTop: 22, padding: "13px 15px", borderRadius: 13, background: C.sageSoft, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <ShieldCheck size={17} color={C.sageDeep} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: C.sageDeep, lineHeight: 1.5 }}>
            I conti tra coinquilini (spese, lista della spesa, chi deve a chi) restano <b>privati</b>. Qui vedi solo ciò che riguarda la locazione.
          </span>
        </div>
      </div>
    </div>
  );
}

function DocCard({ label, date, flash }) {
  return (
    <div style={{ ...card(0), padding: "13px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: C.coralSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={18} color={C.coral} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{label}</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginTop: 1 }}>Caricato il {date} · PDF</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={() => flash("Apertura anteprima…")} style={docBtn}><Eye size={16} color={C.sub} /></button>
        <button onClick={() => flash("Download avviato")} style={docBtn}><Download size={16} color={C.sub} /></button>
      </div>
    </div>
  );
}

// ── bits ──
function Wordmark({ size = 22 }) {
  const aw = size * 0.56, ah = size * 0.5;
  return (
    <div className="disp" style={{ display: "inline-flex", alignItems: "baseline", fontWeight: 700, fontSize: size, color: C.sageDeep }}>
      co
      <span style={{ position: "relative", display: "inline-block", width: aw, height: ah, margin: `0 ${size * 0.03}px` }}>
        <span style={{ position: "absolute", inset: 0, background: C.coral, clipPath: "polygon(50% 0%, 100% 38%, 100% 100%, 0% 100%, 0% 38%)", borderRadius: 2 }} />
      </span>
      bi
    </div>
  );
}
const Dot = ({ c }) => <span style={{ width: 7, height: 7, borderRadius: 9, background: c, display: "inline-block" }} />;

function Kpi({ label, value, icon: I, tone, sub }) {
  const accent = tone === "honey" ? C.honey : C.sage;
  return (
    <div style={{ border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 16px", background: C.card }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12.5, color: C.sub, fontWeight: 600 }}>{label}</span>
        <I size={16} color={accent} />
      </div>
      <div className="disp" style={{ fontSize: 27, fontWeight: 700, marginTop: 8 }}>{value}</div>
      {sub && <div style={{ fontSize: 11.5, color: C.faint, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Tag({ tone, children }) {
  const bg = tone === "honey" ? C.honeySoft : C.sageSoft;
  const fg = tone === "honey" ? "#8a5f1c" : C.sageDeep;
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: bg, color: fg, fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 99, whiteSpace: "nowrap" }}>{children}</span>;
}

function SecLabel({ children }) {
  return <div style={{ fontSize: 11.5, fontWeight: 700, color: C.sub, letterSpacing: ".07em", textTransform: "uppercase", margin: "24px 0 10px" }}>{children}</div>;
}
function card(pad = 16) { return { background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: pad }; }
function Row({ label, value, valueEl, strong }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "none" }}>
      <span style={{ color: C.sub, fontSize: 14 }}>{label}</span>
      <span className={strong ? "disp" : ""} style={{ fontWeight: strong ? 700 : 600, fontSize: strong ? 16 : 14.5 }}>{valueEl || value}</span>
    </div>
  );
}
const docBtn = { width: 34, height: 34, borderRadius: 9, border: `1px solid ${C.line}`, background: C.card, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

function Backdrop({ onClose }) {
  return <div className="fade" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,24,18,.4)", zIndex: 35 }} />;
}
