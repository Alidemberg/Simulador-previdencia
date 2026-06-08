import { useState, useEffect, useRef } from "react";

const YELLOW = "#F5C518";
const DARK = "#0d0d0d";
const CARD = "#161616";
const CARD2 = "#1e1e1e";
const MUTED = "#666";
const TEXT = "#f0f0f0";
const RED = "#e05252";
const GREEN = "#52c97a";
const BLUE = "#5299e0";

const fmt = (v) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtPct = (v) => `${v.toFixed(1)}%`;

const Input = ({ label, value, onChange, min, max, step = 1, unit = "" }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <label style={{ color: MUTED, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>{label}</label>
      <span style={{ color: YELLOW, fontFamily: "'DM Mono', monospace", fontSize: 13 }}>
        {typeof value === "number" ? value : value}{unit}
      </span>
    </div>
    <input
      type="range" min={min} max={max} step={step} value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: "100%", accentColor: YELLOW, height: 4, cursor: "pointer" }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
      <span style={{ color: "#444", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{min}{unit}</span>
      <span style={{ color: "#444", fontSize: 10, fontFamily: "'DM Mono', monospace" }}>{max}{unit}</span>
    </div>
  </div>
);

const Badge = ({ children, color = YELLOW }) => (
  <span style={{
    background: color + "22", color, border: `1px solid ${color}44`,
    borderRadius: 4, padding: "2px 8px", fontSize: 11,
    fontFamily: "'DM Mono', monospace", letterSpacing: 0.5
  }}>{children}</span>
);

const Divider = () => (
  <div style={{ height: 1, background: "#2a2a2a", margin: "20px 0" }} />
);

function calcEspecial(anosEspecial, mediaContrib, sexo) {
  // mínimo: 25 anos para risco médio/baixo (homem)
  const minAnos = sexo === "M" ? 20 : 15;
  const excedente = Math.max(0, anosEspecial - minAnos);
  const coef = Math.min(1.0, 0.60 + excedente * 0.02);
  return { coef, valor: mediaContrib * coef };
}

function calcComum(anosContrib, mediaContrib, sexo) {
  const minAnos = sexo === "M" ? 20 : 15;
  const excedente = Math.max(0, anosContrib - minAnos);
  const coef = Math.min(1.0, 0.60 + excedente * 0.02);
  return { coef, valor: mediaContrib * coef };
}

function anosPara100(sexo) {
  return sexo === "M" ? 40 : 35;
}

function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? YELLOW : "transparent",
      color: active ? DARK : MUTED,
      border: "none", padding: "10px 18px",
      fontFamily: "'DM Mono', monospace", fontSize: 12,
      letterSpacing: 0.5, cursor: "pointer",
      borderRadius: 6, fontWeight: active ? 700 : 400,
      transition: "all 0.2s"
    }}>{label}</button>
  );
}

function ResultRow({ label, value, highlight, color }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "10px 14px", borderRadius: 6,
      background: highlight ? "#1a1a1a" : "transparent",
      border: highlight ? `1px solid ${color || YELLOW}33` : "1px solid transparent",
      marginBottom: 6
    }}>
      <span style={{ color: MUTED, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{label}</span>
      <span style={{ color: color || TEXT, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: highlight ? 700 : 400 }}>
        {value}
      </span>
    </div>
  );
}

// ─── SIMULAÇÃO 1: APOSENTADORIA ESPECIAL ───────────────────────────────────────
function SimEspecial() {
  const [sexo, setSexo] = useState("M");
  const [idadeInicio, setIdadeInicio] = useState(18);
  const [anosEspecial, setAnosEspecial] = useState(25);
  const [media, setMedia] = useState(3000);
  const teto = 8475.55;

  const minEsp = sexo === "M" ? 20 : 15;
  const idadeAposentadoria = idadeInicio + anosEspecial;
  const { coef, valor } = calcEspecial(anosEspecial, Math.min(media, teto), sexo);
  const anosParaCem = anosPara100(sexo);
  const idadeParaCem = idadeInicio + anosParaCem;
  const valorCem = Math.min(media, teto);
  const diferenca = valorCem - valor;
  const excedente = Math.max(0, anosEspecial - minEsp);

  // projeção acumulada
  const mesesEspecial = (80 - idadeAposentadoria) * 12;
  const mesesCem = (80 - idadeParaCem) * 12;
  const acumEspecial = mesesEspecial * valor;
  const acumCem = mesesCem * valorCem;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: MUTED, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>Sexo</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Masculino"], ["F", "Feminino"]].map(([v, l]) => (
            <button key={v} onClick={() => setSexo(v)} style={{
              flex: 1, padding: "10px", background: sexo === v ? YELLOW + "22" : CARD2,
              color: sexo === v ? YELLOW : MUTED, border: `1px solid ${sexo === v ? YELLOW : "#333"}`,
              borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12
            }}>{l}</button>
          ))}
        </div>
      </div>

      <Input label="Idade de início no trabalho especial" value={idadeInicio} onChange={setIdadeInicio} min={14} max={35} unit=" anos" />
      <Input label="Anos de contribuição especial" value={anosEspecial} onChange={setAnosEspecial} min={minEsp} max={45} unit=" anos" />
      <Input label="Média salarial de contribuição" value={media} onChange={setMedia} min={1621} max={8476} step={100} unit=" R$" />

      <Divider />

      <div style={{ background: "#0a0a0a", border: `1px solid ${YELLOW}33`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ color: YELLOW, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          ⚡ Aposentadoria Especial (STF Jun/2026)
        </div>
        <ResultRow label="Idade ao se aposentar" value={`${idadeAposentadoria} anos`} highlight color={YELLOW} />
        <ResultRow label="Coeficiente aplicado" value={fmtPct(coef * 100)} highlight color={coef < 0.85 ? RED : GREEN} />
        <ResultRow label="Valor do benefício" value={fmt(valor)} highlight color={YELLOW} />
        <ResultRow label="Excedente sobre mínimo" value={`${excedente} anos × 2% = +${fmtPct(excedente * 2)}`} />
      </div>

      <div style={{ background: "#0a0a0a", border: `1px solid ${BLUE}33`, borderRadius: 8, padding: 16, marginBottom: 16 }}>
        <div style={{ color: BLUE, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          🎯 Para receber 100% da média
        </div>
        <ResultRow label="Anos de contribuição necessários" value={`${anosParaCem} anos`} highlight color={BLUE} />
        <ResultRow label="Idade ao atingir 100%" value={`${idadeParaCem} anos`} highlight color={BLUE} />
        <ResultRow label="Diferença de valor/mês" value={`+ ${fmt(diferenca)}`} highlight color={GREEN} />
      </div>

      <div style={{ background: "#0a0a0a", border: `1px solid #555`, borderRadius: 8, padding: 16 }}>
        <div style={{ color: MUTED, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>
          📊 Projeção acumulada até 80 anos
        </div>
        <ResultRow label={`Especial (${anosEspecial} anos) — ${mesesEspecial} meses`} value={fmt(acumEspecial)} highlight color={YELLOW} />
        <ResultRow label={`100% (${anosParaCem} anos) — ${mesesCem} meses`} value={fmt(acumCem)} highlight color={BLUE} />
        <ResultRow
          label="Diferença total"
          value={acumEspecial > acumCem ? `+ ${fmt(acumEspecial - acumCem)} a favor da especial` : `+ ${fmt(acumCem - acumEspecial)} a favor de esperar`}
          highlight
          color={acumEspecial > acumCem ? GREEN : RED}
        />
      </div>

      <div style={{ marginTop: 16, padding: 12, background: "#111", borderRadius: 6, borderLeft: `3px solid ${YELLOW}` }}>
        <p style={{ color: MUTED, fontSize: 11, fontFamily: "'DM Mono', monospace", margin: 0, lineHeight: 1.7 }}>
          ⚠️ <strong style={{ color: TEXT }}>Análise:</strong> Aposentar-se com {anosEspecial} anos especial ({fmtPct(coef * 100)}) aos {idadeAposentadoria} anos
          {acumEspecial > acumCem
            ? ` é financeiramente vantajoso se você viver até os 80 anos — recebe mais no total.`
            : ` pode não compensar financeiramente se você viver mais de ${Math.round((acumCem - acumEspecial) > 0 ? idadeParaCem + 5 : 80)} anos.`}
          {" "}Aposentar mais tarde com 100% só supera a especial após {idadeParaCem} anos, e só se o trabalhador viver o suficiente.
        </p>
      </div>
    </div>
  );
}

// ─── SIMULAÇÃO 2: COMPARATIVO ESPECIAL vs COMUM ──────────────────────────────
function SimComparativo() {
  const [sexo, setSexo] = useState("M");
  const [idadeAtual, setIdadeAtual] = useState(40);
  const [anosContrib, setAnosContrib] = useState(22);
  const [media, setMedia] = useState(4000);
  const [expectativa, setExpectativa] = useState(78);

  const teto = 8475.55;
  const mediaReal = Math.min(media, teto);

  // Especial: pode pedir agora (se tiver >= 20 para H ou 15 para M de especial)
  const minEsp = sexo === "M" ? 20 : 15;
  const podeEspecialAgora = anosContrib >= minEsp;
  const coefEsp = Math.min(1.0, 0.60 + Math.max(0, anosContrib - minEsp) * 0.02);
  const valorEsp = mediaReal * coefEsp;

  // Comum: esperar mais
  const idadeMinimaComum = sexo === "M" ? 65 : 62;
  const anosRestComum = Math.max(0, idadeMinimaComum - idadeAtual);
  const anosContribComum = anosContrib + anosRestComum;
  const minComum = sexo === "M" ? 20 : 15;
  const coefComum = Math.min(1.0, 0.60 + Math.max(0, anosContribComum - minComum) * 0.02);
  const valorComum = mediaReal * coefComum;

  // Acumulados
  const mesesEsp = Math.max(0, (expectativa - idadeAtual) * 12);
  const mesesComum = Math.max(0, (expectativa - idadeMinimaComum) * 12);
  const acumEsp = mesesEsp * valorEsp;
  const acumComum = mesesComum * valorComum;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: MUTED, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>Sexo</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Masculino"], ["F", "Feminino"]].map(([v, l]) => (
            <button key={v} onClick={() => setSexo(v)} style={{
              flex: 1, padding: "10px", background: sexo === v ? YELLOW + "22" : CARD2,
              color: sexo === v ? YELLOW : MUTED, border: `1px solid ${sexo === v ? YELLOW : "#333"}`,
              borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12
            }}>{l}</button>
          ))}
        </div>
      </div>

      <Input label="Idade atual" value={idadeAtual} onChange={setIdadeAtual} min={30} max={65} unit=" anos" />
      <Input label="Anos de contribuição especial (já cumpridos)" value={anosContrib} onChange={setAnosContrib} min={1} max={45} unit=" anos" />
      <Input label="Média salarial" value={media} onChange={setMedia} min={1621} max={8476} step={100} unit=" R$" />
      <Input label="Expectativa de vida" value={expectativa} onChange={setExpectativa} min={60} max={100} unit=" anos" />

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: "#0a0a0a", border: `1px solid ${podeEspecialAgora ? YELLOW : RED}44`, borderRadius: 8, padding: 14 }}>
          <div style={{ color: YELLOW, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
            ⚡ Especial AGORA
          </div>
          {podeEspecialAgora ? (
            <>
              <div style={{ color: YELLOW, fontSize: 22, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtPct(coefEsp * 100)}</div>
              <div style={{ color: GREEN, fontSize: 14, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{fmt(valorEsp)}/mês</div>
              <div style={{ color: MUTED, fontSize: 10, fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
                {mesesEsp} meses recebendo<br />
                <strong style={{ color: TEXT }}>Total: {fmt(acumEsp)}</strong>
              </div>
            </>
          ) : (
            <div style={{ color: RED, fontSize: 11, fontFamily: "'DM Mono', monospace" }}>
              Ainda não elegível.<br />Faltam {minEsp - anosContrib} anos de especial.
            </div>
          )}
        </div>

        <div style={{ background: "#0a0a0a", border: `1px solid ${BLUE}44`, borderRadius: 8, padding: 14 }}>
          <div style={{ color: BLUE, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
            🧓 Comum (idade {idadeMinimaComum})
          </div>
          <div style={{ color: BLUE, fontSize: 22, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{fmtPct(coefComum * 100)}</div>
          <div style={{ color: GREEN, fontSize: 14, fontFamily: "'DM Mono', monospace", marginTop: 4 }}>{fmt(valorComum)}/mês</div>
          <div style={{ color: MUTED, fontSize: 10, fontFamily: "'DM Mono', monospace", marginTop: 8 }}>
            {mesesComum} meses recebendo<br />
            <strong style={{ color: TEXT }}>Total: {fmt(acumComum)}</strong>
          </div>
        </div>
      </div>

      {podeEspecialAgora && (
        <div style={{
          padding: 16, borderRadius: 8,
          background: acumEsp > acumComum ? GREEN + "11" : RED + "11",
          border: `1px solid ${acumEsp > acumComum ? GREEN : RED}44`
        }}>
          <div style={{ color: acumEsp > acumComum ? GREEN : RED, fontFamily: "'DM Mono', monospace", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
            {acumEsp > acumComum
              ? `✅ Vantagem Especial: + ${fmt(acumEsp - acumComum)}`
              : `⚠️ Vantagem em esperar: + ${fmt(acumComum - acumEsp)}`}
          </div>
          <p style={{ color: MUTED, fontSize: 11, fontFamily: "'DM Mono', monospace", margin: 0, lineHeight: 1.7 }}>
            Considerando expectativa de vida de {expectativa} anos, a aposentadoria
            {acumEsp > acumComum
              ? ` especial agora é mais vantajosa. Você começa a receber imediatamente e compensa a diferença de valor com mais tempo de benefício.`
              : ` pela regra comum (esperar até ${idadeMinimaComum} anos) gera mais renda total, apesar de começar mais tarde com valor maior.`}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── SIMULAÇÃO 3: TEMPO PARA CHEGAR A 100% ───────────────────────────────────
function SimProgressao() {
  const [sexo, setSexo] = useState("M");
  const [media, setMedia] = useState(3500);
  const [idadeInicio, setIdadeInicio] = useState(18);
  const teto = 8475.55;
  const mediaReal = Math.min(media, teto);
  const minEsp = sexo === "M" ? 20 : 15;
  const passos = [];

  for (let anos = minEsp; anos <= 45; anos++) {
    const exc = Math.max(0, anos - minEsp);
    const coef = Math.min(1.0, 0.60 + exc * 0.02);
    passos.push({ anos, coef, valor: mediaReal * coef, idade: idadeInicio + anos });
  }

  const max = Math.max(...passos.map(p => p.valor));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: MUTED, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>Sexo</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Masculino"], ["F", "Feminino"]].map(([v, l]) => (
            <button key={v} onClick={() => setSexo(v)} style={{
              flex: 1, padding: "10px", background: sexo === v ? YELLOW + "22" : CARD2,
              color: sexo === v ? YELLOW : MUTED, border: `1px solid ${sexo === v ? YELLOW : "#333"}`,
              borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12
            }}>{l}</button>
          ))}
        </div>
      </div>
      <Input label="Média salarial" value={media} onChange={setMedia} min={1621} max={8476} step={100} unit=" R$" />
      <Input label="Idade de início na atividade especial" value={idadeInicio} onChange={setIdadeInicio} min={14} max={35} unit=" anos" />

      <Divider />

      <div style={{ fontFamily: "'DM Mono', monospace" }}>
        <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 70px 80px", gap: 6, padding: "4px 8px", marginBottom: 6 }}>
          <span style={{ color: MUTED, fontSize: 9, textTransform: "uppercase" }}>Anos</span>
          <span style={{ color: MUTED, fontSize: 9, textTransform: "uppercase" }}>Progressão</span>
          <span style={{ color: MUTED, fontSize: 9, textTransform: "uppercase" }}>%</span>
          <span style={{ color: MUTED, fontSize: 9, textTransform: "uppercase" }}>Valor</span>
        </div>
        {passos.map(({ anos, coef, valor, idade }) => {
          const pct = valor / max;
          const isMin = anos === minEsp;
          const isCem = coef >= 1.0;
          const color = isCem ? GREEN : coef < 0.75 ? RED : YELLOW;
          return (
            <div key={anos} style={{
              display: "grid", gridTemplateColumns: "60px 1fr 70px 80px",
              gap: 6, padding: "5px 8px", borderRadius: 4, alignItems: "center",
              background: isMin ? YELLOW + "0a" : isCem ? GREEN + "0a" : "transparent",
              border: isMin ? `1px solid ${YELLOW}22` : isCem ? `1px solid ${GREEN}22` : "1px solid transparent",
              marginBottom: 2
            }}>
              <span style={{ color: color, fontSize: 11 }}>
                {anos}a {isMin ? "⚡" : isCem ? "✅" : ""}
              </span>
              <div style={{ background: "#222", borderRadius: 3, height: 8, position: "relative" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0,
                  width: `${pct * 100}%`, background: color,
                  borderRadius: 3, transition: "width 0.3s"
                }} />
              </div>
              <span style={{ color, fontSize: 11 }}>{fmtPct(coef * 100)}</span>
              <span style={{ color: TEXT, fontSize: 10 }}>{fmt(valor)}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Badge color={RED}>⚡ Mínimo elegível</Badge>
        <Badge color={YELLOW}>Progressão</Badge>
        <Badge color={GREEN}>✅ 100%</Badge>
      </div>
    </div>
  );
}

// ─── SIMULAÇÃO 4: PONTO DE EQUILÍBRIO ────────────────────────────────────────
function SimEquilibrio() {
  const [sexo, setSexo] = useState("M");
  const [idadeInicio, setIdadeInicio] = useState(18);
  const [anosEspecial, setAnosEspecial] = useState(25);
  const [media, setMedia] = useState(3000);

  const teto = 8475.55;
  const mediaReal = Math.min(media, teto);
  const minEsp = sexo === "M" ? 20 : 15;
  const anosParaCem = anosPara100(sexo);

  const idadeEsp = idadeInicio + anosEspecial;
  const idadeCem = idadeInicio + anosParaCem;

  const coefEsp = Math.min(1.0, 0.60 + Math.max(0, anosEspecial - minEsp) * 0.02);
  const valorEsp = mediaReal * coefEsp;
  const valorCem = mediaReal;

  // Ponto de equilíbrio: a partir de quando o total da especial supera a de 100%
  // acum_esp(t) = (t - idadeEsp)*12*valorEsp
  // acum_cem(t) = (t - idadeCem)*12*valorCem
  // equilíbrio quando acum_esp = acum_cem
  // (t - idadeEsp)*valorEsp = (t - idadeCem)*valorCem
  // t*valorEsp - idadeEsp*valorEsp = t*valorCem - idadeCem*valorCem
  // t*(valorEsp - valorCem) = idadeEsp*valorEsp - idadeCem*valorCem
  // t = (idadeEsp*valorEsp - idadeCem*valorCem) / (valorEsp - valorCem)
  let idadeEquilibrio = null;
  if (valorEsp !== valorCem) {
    idadeEquilibrio = (idadeEsp * valorEsp - idadeCem * valorCem) / (valorEsp - valorCem);
  }

  const pontos = [];
  for (let idade = idadeEsp; idade <= 100; idade += 1) {
    const acumEsp = Math.max(0, (idade - idadeEsp) * 12 * valorEsp);
    const acumCem = idadeCem <= idade ? Math.max(0, (idade - idadeCem) * 12 * valorCem) : 0;
    pontos.push({ idade, acumEsp, acumCem });
  }

  const maxAcum = Math.max(...pontos.map(p => Math.max(p.acumEsp, p.acumCem)));

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ color: MUTED, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 8 }}>Sexo</div>
        <div style={{ display: "flex", gap: 8 }}>
          {[["M", "Masculino"], ["F", "Feminino"]].map(([v, l]) => (
            <button key={v} onClick={() => setSexo(v)} style={{
              flex: 1, padding: "10px", background: sexo === v ? YELLOW + "22" : CARD2,
              color: sexo === v ? YELLOW : MUTED, border: `1px solid ${sexo === v ? YELLOW : "#333"}`,
              borderRadius: 6, cursor: "pointer", fontFamily: "'DM Mono', monospace", fontSize: 12
            }}>{l}</button>
          ))}
        </div>
      </div>

      <Input label="Idade de início" value={idadeInicio} onChange={setIdadeInicio} min={14} max={35} unit=" anos" />
      <Input label="Anos de contribuição especial" value={anosEspecial} onChange={setAnosEspecial} min={minEsp} max={45} unit=" anos" />
      <Input label="Média salarial" value={media} onChange={setMedia} min={1621} max={8476} step={100} unit=" R$" />

      <Divider />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ background: YELLOW + "0f", border: `1px solid ${YELLOW}33`, borderRadius: 8, padding: 12 }}>
          <div style={{ color: YELLOW, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>⚡ Especial</div>
          <div style={{ color: YELLOW, fontSize: 18, fontFamily: "'DM Mono', monospace", fontWeight: 700, marginTop: 6 }}>{fmt(valorEsp)}</div>
          <div style={{ color: MUTED, fontSize: 10, fontFamily: "'DM Mono', monospace" }}>a partir dos {idadeEsp} anos</div>
        </div>
        <div style={{ background: BLUE + "0f", border: `1px solid ${BLUE}33`, borderRadius: 8, padding: 12 }}>
          <div style={{ color: BLUE, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace" }}>🎯 100% da média</div>
          <div style={{ color: BLUE, fontSize: 18, fontFamily: "'DM Mono', monospace", fontWeight: 700, marginTop: 6 }}>{fmt(valorCem)}</div>
          <div style={{ color: MUTED, fontSize: 10, fontFamily: "'DM Mono', monospace" }}>a partir dos {idadeCem} anos</div>
        </div>
      </div>

      {idadeEquilibrio !== null && (() => {
        const eq = Math.round(idadeEquilibrio);
        const anosVantagem = idadeCem - idadeEsp;
        const acumuladoVantagem = anosVantagem * 12 * valorEsp;
        const difMensal = valorCem - valorEsp;
        const vantajosa = idadeEquilibrio > 80 || idadeEquilibrio < 0;
        // Veredicto
        let veredicto, detalhe, cor;
        if (idadeEquilibrio <= 0 || valorEsp >= valorCem) {
          veredicto = "✅ A especial já é vantajosa desde o início";
          detalhe = `Você recebe o mesmo ou mais pela especial, sem precisar esperar.`;
          cor = GREEN;
        } else if (idadeEquilibrio <= 80) {
          veredicto = `✅ Vale muito a pena pegar a especial`;
          detalhe = `Quem pega a especial aos ${idadeEsp} anos acumula ${fmt(acumuladoVantagem)} de vantagem antes de quem esperou até ${idadeCem} anos. Esse atraso só seria recuperado aos ${eq} anos — e antes disso, a especial é sempre melhor no total.`;
          cor = GREEN;
        } else {
          veredicto = `✅ A especial ainda é a melhor escolha na prática`;
          detalhe = `Quem pega a especial aos ${idadeEsp} anos já recebeu ${fmt(acumuladoVantagem)} antes de quem esperou até ${idadeCem} anos. Para quem esperou recuperar esse dinheiro (recebendo ${fmt(difMensal)}/mês a mais), precisaria viver até os ${eq} anos — o que é improvável para a maioria. Na prática, a aposentadoria especial é financeiramente vantajosa nesse cenário.`;
          cor = YELLOW;
        }
        return (
          <div style={{
            background: "#0a0a0a", border: `1px solid ${cor}44`,
            borderRadius: 8, padding: 16, marginBottom: 16
          }}>
            <div style={{ color: MUTED, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>
              O que isso significa na prática?
            </div>
            <div style={{ color: cor, fontSize: 14, fontFamily: "'DM Mono', monospace", fontWeight: 700, marginBottom: 10 }}>
              {veredicto}
            </div>
            <div style={{ color: "#aaa", fontSize: 12, fontFamily: "'DM Mono', monospace", lineHeight: 1.8 }}>
              {detalhe}
            </div>
            {idadeEquilibrio > 0 && idadeEquilibrio < 200 && (
              <div style={{
                marginTop: 12, padding: "8px 12px", background: "#111", borderRadius: 6,
                borderLeft: `3px solid ${MUTED}`, fontFamily: "'DM Mono', monospace"
              }}>
                <span style={{ color: MUTED, fontSize: 10 }}>PONTO DE EQUILÍBRIO TÉCNICO: </span>
                <span style={{ color: TEXT, fontSize: 11 }}>
                  Só a partir dos {eq} anos o total acumulado de quem esperou superaria o de quem se aposentou cedo.
                </span>
              </div>
            )}
          </div>
        );
      })()}

      {/* Gráfico ASCII / visual simples */}
      <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, overflowX: "auto" }}>
        <div style={{ color: MUTED, marginBottom: 8, letterSpacing: 1, textTransform: "uppercase", fontSize: 9 }}>Acumulado por idade</div>
        {pontos.filter((_, i) => i % 5 === 0).map(({ idade, acumEsp, acumCem }) => {
          const wEsp = maxAcum > 0 ? (acumEsp / maxAcum) * 120 : 0;
          const wCem = maxAcum > 0 ? (acumCem / maxAcum) * 120 : 0;
          const isEquil = idadeEquilibrio && Math.abs(idade - Math.round(idadeEquilibrio)) <= 2;
          return (
            <div key={idade} style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: isEquil ? GREEN : MUTED, width: 26, textAlign: "right", flexShrink: 0 }}>{idade}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ height: 7, background: "#222", borderRadius: 2, position: "relative", marginBottom: 2 }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(wEsp / 120) * 100}%`, background: YELLOW, borderRadius: 2 }} />
                  </div>
                  <div style={{ height: 7, background: "#222", borderRadius: 2, position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(wCem / 120) * 100}%`, background: BLUE, borderRadius: 2 }} />
                  </div>
                </div>
                <span style={{ color: isEquil ? GREEN : "#333", fontSize: 9, flexShrink: 0 }}>{isEquil ? "← EQUIL." : ""}</span>
              </div>
            </div>
          );
        })}
        <div style={{ display: "flex", gap: 16, marginTop: 10 }}>
          <span style={{ color: YELLOW }}>■ Especial</span>
          <span style={{ color: BLUE }}>■ 100% (esperar)</span>
        </div>
      </div>
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
const TABS = [
  { id: "especial", label: "⚡ Aposentadoria Especial" },
  { id: "comparativo", label: "⚖️ Especial vs. Comum" },
  { id: "progressao", label: "📈 Progressão do Benefício" },
  { id: "equilibrio", label: "🎯 Ponto de Equilíbrio" },
];

export default function App() {
  const [tab, setTab] = useState("especial");

  return (
    <div style={{
      minHeight: "100vh", background: DARK, color: TEXT,
      fontFamily: "'DM Mono', monospace",
      padding: "0 0 60px 0"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;700&family=Bebas+Neue&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{
        background: "#0a0a0a", borderBottom: `1px solid #222`,
        padding: "24px 24px 20px"
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ color: YELLOW, fontSize: 9, letterSpacing: 4, textTransform: "uppercase", marginBottom: 6 }}>
              PREVIDÊNCIA SOCIAL · STF JUN/2026
            </div>
            <h1 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 32, letterSpacing: 2, color: TEXT, margin: 0, lineHeight: 1
            }}>
              SIMULADOR DE<br />
              <span style={{ color: YELLOW }}>APOSENTADORIA ESPECIAL</span>
            </h1>
          </div>
          <div style={{ textAlign: "right" }}>
            <Badge color={GREEN}>✅ Decisão vigente</Badge>
            <div style={{ color: MUTED, fontSize: 9, marginTop: 6 }}>ADI 6309 · Plenário STF</div>
            <div style={{ color: MUTED, fontSize: 9 }}>Sem idade mínima · cálculo 60%+2%/ano</div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginTop: 20, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <Tab key={t.id} label={t.label} active={tab === t.id} onClick={() => setTab(t.id)} />
          ))}
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "28px 20px" }}>
        {tab === "especial" && <SimEspecial />}
        {tab === "comparativo" && <SimComparativo />}
        {tab === "progressao" && <SimProgressao />}
        {tab === "equilibrio" && <SimEquilibrio />}
      </div>

      {/* Footer */}
      <div style={{
        textAlign: "center", padding: "16px 24px",
        borderTop: "1px solid #1a1a1a",
        color: MUTED, fontSize: 9, letterSpacing: 1
      }}>
        SIMULAÇÃO EDUCACIONAL · NÃO SUBSTITUI ASSESSORIA JURÍDICA PREVIDENCIÁRIA · TETO INSS 2026: R$ 8.475,55
      </div>
    </div>
  );
}
