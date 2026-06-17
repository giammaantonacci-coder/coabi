import React, { useState, useMemo } from "react";
import {
  Home, Receipt, ShoppingBasket, User, Plus, X, Users,
  ArrowRight, Check, Bell, Wallet, Lock, CornerDownRight, Link2,
  Info, Phone, Mail, Clock, AlertTriangle
} from "lucide-react";

// ── Palette (domestic, calm, trustworthy — not a cold fintech ledger) ──
const C = {
  ink: "#1B201A", sub: "#6B7268", faint: "#9aa093",
  bg: "#FFFFFF", card: "#FFFFFF",
  sage: "#5C7E70", sageDeep: "#3A554C", sageSoft: "#E4EDE7",
  coral: "#CF5F49", coralSoft: "#F6E2DC",
  honey: "#CC8E2E", honeySoft: "#F4E8CF",
  line: "#E7E4D9",
};
const eur = (n) =>
  "€" + Number(n).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const r2 = (n) => Math.round(n * 100) / 100;

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400..700&family=Hanken+Grotesque:wght@400;500;600;700&display=swap');
* { -webkit-tap-highlight-color: transparent; }
.disp { font-family: 'Familjen Grotesk', sans-serif; letter-spacing: -0.02em; }
.body { font-family: 'Hanken Grotesque', sans-serif; }
.sheet-in { animation: sheetIn .26s cubic-bezier(.2,.8,.2,1); }
@keyframes sheetIn { from { transform: translateY(100%); } to { transform: translateY(0); } }
.fade-in { animation: fadeIn .2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.pop { animation: pop .25s cubic-bezier(.2,.9,.3,1.3); }
@keyframes pop { from { transform: scale(.9); opacity:.4 } to { transform: scale(1); opacity:1 } }
`;

const MEMBERS0 = [
  { id: "you",   name: "Tu",    short: "TU", color: "#5C7E70", room: "Stanza 1", rent: 420, agencyFeeAnnual: 150, exitFeeAgency: 80, contractEnd: "12 mar 2027" },
  { id: "marco", name: "Marco", short: "MA", color: "#CF5F49", room: "Stanza 2", rent: 360 },
  { id: "sofia", name: "Sofia", short: "SO", color: "#CC8E2E", room: "Stanza 3", rent: 300 },
];
const EXP0 = [
  { id: 1, kind: "comune", desc: "Spesa Esselunga",    amount: 36.40, paidBy: "sofia", date: "14 giu" },
  { id: 2, kind: "comune", desc: "Detersivi e pulizia",amount: 12.00, paidBy: "you",   date: "11 giu" },
  { id: 3, kind: "comune", desc: "Bolletta luce",      amount: 54.00, paidBy: "marco", date: "8 giu"  },
];
const SHOP0 = [
  { id: 1, item: "Carta igienica", tag: "comune",    by: "sofia" },
  { id: 2, item: "Birre",          tag: "personale", by: "marco" },
  { id: 3, item: "Caffè",          tag: "comune",    by: "you"   },
];

function computeNet(members, expenses, settlements) {
  const net = {}; members.forEach((m) => (net[m.id] = 0));
  const n = members.length;
  expenses.forEach((e) => {
    if (e.kind === "personale") { net[e.paidBy] += e.amount; net[e.owedBy] -= e.amount; }
    else { const s = e.amount / n; net[e.paidBy] += e.amount; members.forEach((m) => (net[m.id] -= s)); }
  });
  settlements.forEach((s) => { net[s.from] += s.amount; net[s.to] -= s.amount; });
  return net;
}
function settle(net) {
  const cred = [], deb = [];
  Object.entries(net).forEach(([id, v]) => {
    const x = r2(v);
    if (x > 0.009) cred.push({ id, amt: x });
    else if (x < -0.009) deb.push({ id, amt: -x });
  });
  cred.sort((a, b) => b.amt - a.amt); deb.sort((a, b) => b.amt - a.amt);
  const out = []; let i = 0, j = 0;
  while (i < deb.length && j < cred.length) {
    const p = Math.min(deb[i].amt, cred[j].amt);
    out.push({ from: deb[i].id, to: cred[j].id, amount: r2(p) });
    deb[i].amt -= p; cred[j].amt -= p;
    if (deb[i].amt < 0.009) i++; if (cred[j].amt < 0.009) j++;
  }
  return out;
}

export default function App() {
  const [tab, setTab] = useState("casa");
  const [members] = useState(MEMBERS0);
  const [expenses, setExpenses] = useState(EXP0);
  const [shop, setShop] = useState(SHOP0);
  const [settlements, setSettlements] = useState([]);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // invite | addExp | addShop | pay | bought | info
  const [payload, setPayload] = useState(null);

  const name = (id) => members.find((m) => m.id === id)?.name || id;
  const member = (id) => members.find((m) => m.id === id);
  const net = useMemo(() => computeNet(members, expenses, settlements), [members, expenses, settlements]);
  const suggestions = useMemo(() => settle(net), [net]);
  const youOwe = suggestions.filter((s) => s.from === "you");
  const oweYou = suggestions.filter((s) => s.to === "you");
  const youNet = r2(net.you);

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const addExpense = (desc, amount) => {
    setExpenses((p) => [{ id: Date.now(), kind: "comune", desc, amount, paidBy: "you", date: "oggi" }, ...p]);
    flash("Spesa aggiunta al comune");
  };
  const markPaid = (s) => {
    setSettlements((p) => [...p, { from: s.from, to: s.to, amount: s.amount }]);
    setModal(null);
    flash(`Segnato come pagato a ${name(s.to)}`);
  };
  const addShop = (item, tag) => {
    setShop((p) => [...p, { id: Date.now(), item, tag, by: "you" }]);
    flash("Richiesta aggiunta alla lista");
  };
  const confirmBought = (it, amount) => {
    if (it.tag === "comune")
      setExpenses((p) => [{ id: Date.now(), kind: "comune", desc: it.item, amount, paidBy: "you", date: "oggi" }, ...p]);
    else
      setExpenses((p) => [{ id: Date.now(), kind: "personale", desc: it.item, amount, paidBy: "you", owedBy: it.by, date: "oggi" }, ...p]);
    setShop((p) => p.filter((x) => x.id !== it.id));
    setModal(null);
    flash(it.tag === "comune" ? "Preso → diviso tra tutti" : `Preso → a carico di ${name(it.by)}`);
  };

  return (
    <div className="body" style={{ minHeight: "100vh", background: "#dcdacf", display: "flex", justifyContent: "center", color: C.ink }}>
      <style>{FONTS}</style>
      {/* Phone frame */}
      <div style={{ width: "100%", maxWidth: 412, minHeight: "100vh", background: C.bg, position: "relative", overflow: "hidden", boxShadow: "0 0 60px rgba(0,0,0,.18)" }}>
        <Header tab={tab} onInvite={() => setModal("invite")} onInfo={() => setModal("info")} members={members} />

        <div style={{ padding: "0 18px 120px" }}>
          {tab === "casa" && (
            <Casa {...{ youNet, youOwe, oweYou, name, member, expenses, members, net, onPay: (s) => { setPayload(s); setModal("pay"); } }} />
          )}
          {tab === "spese" && (
            <Spese {...{ expenses, members, name, member, youOwe, oweYou, onAdd: () => setModal("addExp"), onPay: (s) => { setPayload(s); setModal("pay"); } }} />
          )}
          {tab === "spesa" && (
            <Spesa {...{ shop, name, member, onAdd: () => setModal("addShop"), onBought: (it) => { setPayload(it); setModal("bought"); } }} />
          )}
          {tab === "profilo" && <Profilo {...{ me: member("you"), youNet }} />}
        </div>

        <BottomNav tab={tab} setTab={setTab} />

        {/* Add buttons via tab context handled inside screens; modals below */}
        {modal === "invite" && <InviteSheet onClose={() => setModal(null)} onCopy={() => { setModal(null); flash("Link copiato — mandalo ai coinquilini"); }} />}
        {modal === "info" && <InfoSheet onClose={() => setModal(null)} />}
        {modal === "addExp" && <AmountForm title="Nuova spesa comune" label="Cosa avete preso?" cta="Aggiungi spesa" withDesc onClose={() => setModal(null)} onSubmit={(d, a) => { addExpense(d, a); setModal(null); }} />}
        {modal === "addShop" && <ShopForm onClose={() => setModal(null)} onSubmit={(item, tag) => { addShop(item, tag); setModal(null); }} />}
        {modal === "pay" && payload && <PaySheet s={payload} name={name} member={member} onClose={() => setModal(null)} onPaid={() => markPaid(payload)} />}
        {modal === "bought" && payload && <AmountForm title={`Preso · ${payload.item}`} label="Quanto hai speso?" cta="Conferma" onClose={() => setModal(null)} onSubmit={(_, a) => confirmBought(payload, a)} note={payload.tag === "comune" ? "Verrà diviso tra tutti i coinquilini" : `Verrà messo a carico di ${name(payload.by)}`} />}

        {toast && (
          <div className="fade-in" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 96, background: C.ink, color: "#fff", padding: "10px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 500, zIndex: 60, maxWidth: 360, textAlign: "center", boxShadow: "0 8px 24px rgba(0,0,0,.25)" }}>
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function Wordmark({ size = 20 }) {
  const aw = size * 0.56, ah = size * 0.5;
  return (
    <div className="disp" style={{ display: "inline-flex", alignItems: "baseline", fontWeight: 700, fontSize: size, color: C.sageDeep, letterSpacing: "-0.02em" }}>
      co
      <span style={{ position: "relative", display: "inline-block", width: aw, height: ah, margin: `0 ${size * 0.03}px` }}>
        <span style={{ position: "absolute", inset: 0, background: C.coral, clipPath: "polygon(50% 0%, 100% 38%, 100% 100%, 0% 100%, 0% 38%)", borderRadius: 2 }} />
      </span>
      bi
    </div>
  );
}

function Header({ tab, onInvite, onInfo, members }) {
  const titles = { casa: "Via Saluzzo 12", spese: "Spese comuni", spesa: "Lista della spesa", profilo: "Il tuo profilo" };
  return (
    <div style={{ padding: "20px 18px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div>
        {tab === "casa" ? (
          <Wordmark size={19} />
        ) : (
          <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 600, letterSpacing: ".02em" }}>VIA SALUZZO 12</div>
        )}
        <div className="disp" style={{ fontSize: 25, fontWeight: 700, marginTop: 4 }}>{titles[tab]}</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onInfo} aria-label="Info casa" style={iconBtn}>
          <Info size={18} color={C.sageDeep} />
        </button>
        <button onClick={onInvite} aria-label="Invita" style={iconBtn}>
          <Users size={19} color={C.sageDeep} />
        </button>
        <div style={{ ...iconBtn, position: "relative" }}>
          <Bell size={18} color={C.sageDeep} />
          <span style={{ position: "absolute", top: 9, right: 9, width: 7, height: 7, borderRadius: 9, background: C.coral }} />
        </div>
      </div>
    </div>
  );
}
const iconBtn = { width: 40, height: 40, borderRadius: 13, background: C.card, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" };

function Avatars({ members, size = 30 }) {
  return (
    <div style={{ display: "flex" }}>
      {members.map((m, i) => (
        <div key={m.id} style={{ width: size, height: size, borderRadius: 99, background: m.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, marginLeft: i ? -8 : 0, border: "2px solid #fff" }}>
          {m.short}
        </div>
      ))}
    </div>
  );
}

function Casa({ youNet, youOwe, oweYou, name, member, expenses, members, onPay }) {
  const inPari = Math.abs(youNet) < 0.01;
  const owes = youNet < 0;
  return (
    <div>
      {/* Hero — the signature: your position, said like a human */}
      <div style={{ background: C.sageDeep, borderRadius: 26, padding: "22px 22px 18px", color: "#fff", marginTop: 4 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12.5, opacity: .8, fontWeight: 600, letterSpacing: ".03em" }}>LA TUA POSIZIONE</span>
          <Avatars members={members} size={26} />
        </div>
        <div className="disp" style={{ fontSize: 33, fontWeight: 700, marginTop: 12, lineHeight: 1.05 }}>
          {inPari ? "Sei in pari 🎉" : owes ? `Devi ${eur(Math.abs(youNet))}` : `Ti spettano ${eur(youNet)}`}
        </div>
        <div style={{ fontSize: 13.5, opacity: .85, marginTop: 6 }}>
          {inPari ? "Nessun conto in sospeso con la casa." : owes ? "In totale verso i coinquilini." : "In totale dai coinquilini."}
        </div>

        {(youOwe.length > 0 || oweYou.length > 0) && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            {youOwe.map((s, i) => (
              <button key={"o" + i} onClick={() => onPay(s)} style={debtRow(true)}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Dot c={member(s.to).color} /> Tu <ArrowRight size={13} /> {name(s.to)}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>{eur(s.amount)} <span style={saldaTag}>Salda</span></span>
              </button>
            ))}
            {oweYou.map((s, i) => (
              <div key={"y" + i} style={debtRow(false)}>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Dot c={member(s.from).color} /> {name(s.from)} <ArrowRight size={13} /> Tu
                </span>
                <span style={{ fontWeight: 700 }}>{eur(s.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conguaglio peek removed — vive solo nel Profilo, per non invogliare l'uscita dalla schermata principale */}

      <SectionLabel>Ultimi movimenti</SectionLabel>
      <div style={card(0)}>
        {expenses.slice(0, 3).map((e, i) => (
          <ExpRow key={e.id} e={e} member={member} name={name} members={members} last={i === Math.min(2, expenses.length - 1)} />
        ))}
      </div>
    </div>
  );
}

function Spese({ expenses, members, name, member, youOwe, oweYou, onAdd, onPay }) {
  return (
    <div>
      {(youOwe.length || oweYou.length) ? (
        <>
          <SectionLabel>Chi deve a chi</SectionLabel>
          <div style={card()}>
            {youOwe.map((s, i) => (
              <SettleRow key={"o" + i} left="Tu" right={name(s.to)} amount={s.amount} action onClick={() => onPay(s)} color={member(s.to).color} owe />
            ))}
            {oweYou.map((s, i) => (
              <SettleRow key={"y" + i} left={name(s.from)} right="Tu" amount={s.amount} color={member(s.from).color} />
            ))}
          </div>
        </>
      ) : (
        <div style={{ ...card(), textAlign: "center", color: C.sub }}>Tutti in pari. Niente conti aperti ✦</div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "22px 2px 10px" }}>
        <span style={secLabel}>Movimenti</span>
        <button onClick={onAdd} style={addPill}><Plus size={15} /> Aggiungi</button>
      </div>
      <div style={card(0)}>
        {expenses.map((e, i) => (
          <ExpRow key={e.id} e={e} member={member} name={name} members={members} last={i === expenses.length - 1} />
        ))}
      </div>
    </div>
  );
}

function Spesa({ shop, name, member, onAdd, onBought }) {
  return (
    <div>
      <div style={{ ...card(), background: C.sageSoft, border: "none", display: "flex", gap: 10, alignItems: "flex-start", marginTop: 6 }}>
        <ShoppingBasket size={18} color={C.sageDeep} style={{ marginTop: 1 }} />
        <span style={{ fontSize: 13.5, color: C.sageDeep, lineHeight: 1.4 }}>
          Chi va a fare la spesa prende ciò che serve e segna il costo. Diventa una spesa <b>comune</b> o <b>personale</b>, in automatico.
        </span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "22px 2px 10px" }}>
        <span style={secLabel}>Serve in casa</span>
        <button onClick={onAdd} style={addPill}><Plus size={15} /> Richiedi</button>
      </div>

      {shop.length === 0 ? (
        <div style={{ ...card(), textAlign: "center", color: C.sub }}>Lista vuota. Niente da comprare 👍</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shop.map((it) => (
            <div key={it.id} className="pop" style={{ ...card(), display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 11, background: it.tag === "comune" ? C.sageSoft : C.honeySoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShoppingBasket size={16} color={it.tag === "comune" ? C.sageDeep : C.honey} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{it.item}</div>
                  <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>
                    <span style={{ color: it.tag === "comune" ? C.sageDeep : C.honey, fontWeight: 600 }}>{it.tag}</span> · da {name(it.by)}
                  </div>
                </div>
              </div>
              <button onClick={() => onBought(it)} style={{ ...addPill, background: C.sage, color: "#fff", border: "none" }}>
                <Check size={15} /> L'ho preso
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Profilo({ me, youNet }) {
  const Row = ({ label, value, strong }) => (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ color: C.sub, fontSize: 14 }}>{label}</span>
      <span className={strong ? "disp" : ""} style={{ fontWeight: strong ? 700 : 600, fontSize: strong ? 16 : 14.5 }}>{value}</span>
    </div>
  );
  return (
    <div>
      <div style={{ ...card(), display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
        <div style={{ width: 52, height: 52, borderRadius: 99, background: me.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 19 }}>{me.short}</div>
        <div>
          <div className="disp" style={{ fontSize: 19, fontWeight: 700 }}>Gianmarco</div>
          <div style={{ fontSize: 13, color: C.sub }}>{me.room} · in casa da set 2025</div>
        </div>
      </div>

      <SectionLabel>Le tue voci fisse</SectionLabel>
      <div style={card()}>
        <Row label="Affitto (la tua stanza)" value={eur(me.rent) + "/mese"} />
        <Row label="Quota utenze (stima)" value={"~ " + eur(38) + "/mese"} />
        <Row label="Spese agenzia" value={eur(me.agencyFeeAnnual) + "/anno"} />
        <Row label="Saldo attuale con la casa" value={youNet < 0 ? "− " + eur(Math.abs(youNet)) : eur(youNet)} strong />
      </div>

      <SectionLabel>Alla tua uscita</SectionLabel>
      <div style={card()}>
        <div style={{ display: "flex", gap: 10 }}>
          <MiniStat label="Certo, ora" value={eur(2.13)} tone="sage" sub="saldo + quote note" />
          <MiniStat label="Stimato" value={"± " + eur(15)} tone="honey" sub="bollette non arrivate" />
        </div>

        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}` }}>
          <Row label="Scadenza contratto" value={me.contractEnd} />
          <Row label="Cauzione versata" value={eur(420)} />
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginTop: 10 }}>
          <Lock size={14} color={C.sub} style={{ marginTop: 2, flexShrink: 0 }} />
          <span style={{ fontSize: 12.5, color: C.sub }}>Torna per intero a fine contratto — non quando esci.</span>
        </div>

        {me.exitFeeAgency && (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.line}`, display: "flex", gap: 9, alignItems: "flex-start" }}>
            <AlertTriangle size={15} color={C.honey} style={{ marginTop: 2, flexShrink: 0 }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Spese di uscita richieste dall'agenzia</div>
              <div style={{ fontSize: 12.5, color: C.sub, marginTop: 2 }}>{eur(me.exitFeeAgency)}, da versare al rilascio dell'immobile.</div>
            </div>
          </div>
        )}
      </div>
      <div style={{ height: 8 }} />
    </div>
  );
}

// ── Small pieces ──
const Dot = ({ c }) => <span style={{ width: 8, height: 8, borderRadius: 9, background: c, display: "inline-block" }} />;
function SectionLabel({ children }) { return <div style={{ ...secLabel, margin: "22px 2px 10px" }}>{children}</div>; }
const secLabel = { fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase" };
function card(pad = 16) { return { background: C.card, border: `1px solid ${C.line}`, borderRadius: 20, padding: pad, marginTop: 0 }; }

function MiniStat({ label, value, tone, sub }) {
  const bg = tone === "sage" ? C.sageSoft : C.honeySoft;
  const fg = tone === "sage" ? C.sageDeep : C.honey;
  return (
    <div style={{ flex: 1, background: bg, borderRadius: 15, padding: "12px 14px" }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: fg, letterSpacing: ".02em", textTransform: "uppercase" }}>{label}</div>
      <div className="disp" style={{ fontSize: 22, fontWeight: 700, color: C.ink, marginTop: 3 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
function debtRow(owe) {
  return { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,.12)", border: "none", color: "#fff", padding: "11px 13px", borderRadius: 13, fontSize: 14, cursor: owe ? "pointer" : "default", width: "100%" };
}
const saldaTag = { background: "#fff", color: C.sageDeep, fontSize: 11.5, fontWeight: 700, padding: "3px 9px", borderRadius: 99 };

function SettleRow({ left, right, amount, action, onClick, color, owe }) {
  return (
    <div onClick={onClick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", cursor: action ? "pointer" : "default", borderBottom: `1px solid ${C.line}` }}>
      <span style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 14.5 }}>
        <Dot c={color} /> <b>{left}</b> <ArrowRight size={14} color={C.faint} /> {right}
      </span>
      <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <b style={{ fontSize: 15 }}>{eur(amount)}</b>
        {action && <span style={{ background: C.sage, color: "#fff", fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: 99 }}>Salda</span>}
      </span>
    </div>
  );
}

function ExpRow({ e, member, name, members, last }) {
  const personale = e.kind === "personale";
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 16px", borderBottom: last ? "none" : `1px solid ${C.line}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 11, background: member(e.paidBy).color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
          {member(e.paidBy).short}
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14.5 }}>{e.desc}</div>
          <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>
            {name(e.paidBy)} · {e.date} · {personale ? <span style={{ color: C.honey, fontWeight: 600 }}>a {name(e.owedBy)}</span> : `diviso ÷${members.length}`}
          </div>
        </div>
      </div>
      <div className="disp" style={{ fontWeight: 700, fontSize: 15.5 }}>{eur(e.amount)}</div>
    </div>
  );
}

function BottomNav({ tab, setTab }) {
  const items = [
    { id: "casa", label: "Casa", icon: Home },
    { id: "spese", label: "Spese", icon: Receipt },
    { id: "spesa", label: "Spesa", icon: ShoppingBasket },
    { id: "profilo", label: "Profilo", icon: User },
  ];
  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 412, background: "rgba(255,255,255,.92)", backdropFilter: "blur(10px)", borderTop: `1px solid ${C.line}`, display: "flex", padding: "8px 8px 22px", zIndex: 40 }}>
      {items.map((it) => {
        const on = tab === it.id; const I = it.icon;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{ flex: 1, background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", padding: "6px 0" }}>
            <I size={22} color={on ? C.sageDeep : C.faint} strokeWidth={on ? 2.4 : 2} />
            <span style={{ fontSize: 11, fontWeight: on ? 700 : 500, color: on ? C.sageDeep : C.faint }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Sheets / modals ──
function Backdrop({ onClose, children }) {
  return (
    <div className="fade-in" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(20,24,18,.45)", zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div className="sheet-in" onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 412, background: C.bg, borderRadius: "26px 26px 0 0", padding: "10px 20px 30px" }}>
        <div style={{ width: 38, height: 4, borderRadius: 9, background: C.line, margin: "6px auto 16px" }} />
        {children}
      </div>
    </div>
  );
}
function SheetHead({ title, onClose }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <span className="disp" style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>
      <button onClick={onClose} style={{ ...iconBtn, width: 34, height: 34 }}><X size={17} color={C.sub} /></button>
    </div>
  );
}

function InviteSheet({ onClose, onCopy }) {
  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Invita in casa" onClose={onClose} />
      <p style={{ fontSize: 14, color: C.sub, marginTop: -4, marginBottom: 16, lineHeight: 1.45 }}>
        Manda il link ai tuoi coinquilini. Entrano nella casa e i conti tornano giusti per tutti.
      </p>
      <div style={{ background: C.card, border: `1px dashed ${C.sage}`, borderRadius: 16, padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 11.5, color: C.sub, fontWeight: 700, letterSpacing: ".04em" }}>CODICE CASA</div>
          <div className="disp" style={{ fontSize: 24, fontWeight: 700, letterSpacing: ".06em" }}>7X2Q·KM</div>
        </div>
        <Link2 size={22} color={C.sage} />
      </div>
      <button onClick={onCopy} style={primaryBtn}>Copia link d'invito</button>
    </Backdrop>
  );
}

function InfoSheet({ onClose }) {
  const rules = [
    "Silenzio dalle 22:00 alle 8:00",
    "Raccolta rifiuti: martedì e venerdì",
    "Vietato fumare negli spazi comuni",
    "Visite ospiti: avvisare nel gruppo casa",
  ];
  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Info casa" onClose={onClose} />

      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "2px 2px 10px" }}>Numeri utili</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <InfoRow icon={AlertTriangle} label="Emergenza" value="112" tone="coral" />
        <InfoRow icon={Phone} label="Agenzia Casa Serena" value="011 234 5678" />
        <InfoRow icon={Mail} label="Email agenzia" value="info@casaserena.it" />
        <InfoRow icon={Clock} label="Orari ufficio" value="Lun–Ven, 9:00–18:00" />
      </div>

      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.sub, letterSpacing: ".04em", textTransform: "uppercase", margin: "20px 2px 10px" }}>Regole della casa e del condominio</div>
      <div style={card(0)}>
        {rules.map((r, i) => (
          <div key={i} style={{ padding: "12px 16px", fontSize: 14, borderBottom: i < rules.length - 1 ? `1px solid ${C.line}` : "none" }}>{r}</div>
        ))}
      </div>
    </Backdrop>
  );
}
function InfoRow({ icon: I, label, value, tone }) {
  const fg = tone === "coral" ? C.coral : C.sageDeep;
  const bg = tone === "coral" ? C.coralSoft : C.sageSoft;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 14 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <I size={16} color={fg} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: C.sub }}>{label}</div>
        <div style={{ fontWeight: 600, fontSize: 14.5 }}>{value}</div>
      </div>
    </div>
  );
}

function PaySheet({ s, name, member, onClose, onPaid }) {
  const App = ({ label, color }) => (
    <button onClick={onPaid} style={{ flex: 1, background: C.card, border: `1px solid ${C.line}`, borderRadius: 16, padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 17 }}>{label[0]}</div>
      <span style={{ fontSize: 13, fontWeight: 600 }}>{label}</span>
    </button>
  );
  return (
    <Backdrop onClose={onClose}>
      <SheetHead title={`Paga ${name(s.to)}`} onClose={onClose} />
      <div style={{ textAlign: "center", marginBottom: 18 }}>
        <div className="disp" style={{ fontSize: 40, fontWeight: 700 }}>{eur(s.amount)}</div>
        <div style={{ fontSize: 13.5, color: C.sub, marginTop: 2 }}>Il pagamento avviene fuori dall'app</div>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <App label="Revolut" color="#0a1a2f" />
        <App label="PayPal" color="#1b3a8a" />
      </div>
      <button onClick={onPaid} style={{ ...primaryBtn, background: "none", color: C.sageDeep, border: `1px solid ${C.sage}` }}>
        <Check size={17} style={{ marginRight: 6, verticalAlign: -3 }} /> Segna come già pagato
      </button>
    </Backdrop>
  );
}

function AmountForm({ title, label, cta, withDesc, onClose, onSubmit, note }) {
  const [desc, setDesc] = useState("");
  const [amt, setAmt] = useState("");
  const ok = (!withDesc || desc.trim()) && Number(amt) > 0;
  return (
    <Backdrop onClose={onClose}>
      <SheetHead title={title} onClose={onClose} />
      {withDesc && (
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder={label} style={input} />
      )}
      <div style={{ position: "relative", marginTop: withDesc ? 12 : 0 }}>
        <span style={{ position: "absolute", left: 16, top: 15, fontSize: 18, color: C.sub, fontWeight: 600 }}>€</span>
        <input value={amt} onChange={(e) => setAmt(e.target.value.replace(",", "."))} placeholder="0,00" inputMode="decimal" style={{ ...input, paddingLeft: 34, fontSize: 20, fontWeight: 700 }} className="disp" />
      </div>
      {!withDesc && <div style={{ fontSize: 13, color: C.sub, marginTop: 8, marginLeft: 2 }}>{label}</div>}
      {note && <div style={{ fontSize: 12.5, color: C.honey, marginTop: 10, fontWeight: 600 }}>{note}</div>}
      <button disabled={!ok} onClick={() => onSubmit(desc.trim(), r2(Number(amt)))} style={{ ...primaryBtn, opacity: ok ? 1 : .4 }}>{cta}</button>
    </Backdrop>
  );
}

function ShopForm({ onClose, onSubmit }) {
  const [item, setItem] = useState("");
  const [tag, setTag] = useState("comune");
  return (
    <Backdrop onClose={onClose}>
      <SheetHead title="Cosa serve?" onClose={onClose} />
      <input value={item} onChange={(e) => setItem(e.target.value)} placeholder="Es. carta igienica, latte…" style={input} />
      <div style={{ fontSize: 12.5, color: C.sub, fontWeight: 700, margin: "16px 2px 8px", letterSpacing: ".03em" }}>CHI LA PAGA?</div>
      <div style={{ display: "flex", gap: 10 }}>
        {[
          { id: "comune", t: "Comune", s: "diviso tra tutti" },
          { id: "personale", t: "Personale", s: "la pago io" },
        ].map((o) => {
          const on = tag === o.id;
          return (
            <button key={o.id} onClick={() => setTag(o.id)} style={{ flex: 1, textAlign: "left", padding: "12px 14px", borderRadius: 15, cursor: "pointer", background: on ? (o.id === "comune" ? C.sageSoft : C.honeySoft) : C.card, border: `1.5px solid ${on ? (o.id === "comune" ? C.sage : C.honey) : C.line}` }}>
              <div style={{ fontWeight: 700, fontSize: 14.5 }}>{o.t}</div>
              <div style={{ fontSize: 12, color: C.sub, marginTop: 1 }}>{o.s}</div>
            </button>
          );
        })}
      </div>
      <button disabled={!item.trim()} onClick={() => onSubmit(item.trim(), tag)} style={{ ...primaryBtn, opacity: item.trim() ? 1 : .4 }}>Aggiungi alla lista</button>
    </Backdrop>
  );
}

const input = { width: "100%", boxSizing: "border-box", padding: "13px 16px", borderRadius: 14, border: `1px solid ${C.line}`, background: C.card, fontSize: 15, outline: "none", color: C.ink, fontFamily: "'Hanken Grotesque', sans-serif" };
const primaryBtn = { width: "100%", marginTop: 20, padding: "15px 0", borderRadius: 15, background: C.sage, color: "#fff", border: "none", fontSize: 15.5, fontWeight: 700, cursor: "pointer", fontFamily: "'Hanken Grotesque', sans-serif" };
const addPill = { display: "flex", alignItems: "center", gap: 5, background: C.card, border: `1px solid ${C.line}`, color: C.ink, fontSize: 13, fontWeight: 600, padding: "7px 13px", borderRadius: 99, cursor: "pointer" };
