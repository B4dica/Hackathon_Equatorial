import { useEffect, useMemo, useState } from "react";

type AgentId = "physical" | "technical" | "administrative";
type HotspotId = "usb" | "email" | "documents";
type Feedback = "success" | "error" | null;

type IconName =
  | "badge"
  | "building"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "code"
  | "document"
  | "key"
  | "lock"
  | "mail"
  | "shield"
  | "usb"
  | "warning";

const iconPaths: Record<IconName, React.ReactNode> = {
  badge: <><circle cx="12" cy="8" r="3" /><path d="M6.5 20v-2.5A5.5 5.5 0 0 1 12 12a5.5 5.5 0 0 1 5.5 5.5V20M8 3h8" /></>,
  building: <><path d="M4 21V5l8-3 8 3v16M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M9 21v-5h6v5" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  close: <path d="m6 6 12 12M18 6 6 18" />,
  code: <><path d="m8 9-4 3 4 3m8-6 4 3-4 3m-2-9-4 12" /></>,
  document: <><path d="M6 2h8l4 4v16H6zM14 2v5h4M9 12h6M9 16h6" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8m-3 3 2 2" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  shield: <path d="M12 2 4 5v6c0 5.2 3.4 9 8 11 4.6-2 8-5.8 8-11V5z" />,
  usb: <><path d="M12 3v12m0-12-2 2m2-2 2 2M7 8v5l5 3 5-3V9m0 0-2 2m2-2 2 2" /><circle cx="12" cy="19" r="2" /></>,
  warning: <><path d="M12 3 2.8 20h18.4z" /><path d="M12 9v5m0 3h.01" /></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg className="icon" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {iconPaths[name]}
      </g>
    </svg>
  );
}

const agents = [
  {
    id: "physical" as const,
    index: "01",
    title: "Agente Físico",
    english: "Physical Security",
    icon: "badge" as const,
    description: "Proteja o espaço de trabalho, dispositivos e credenciais físicas.",
    tags: ["Hardware", "Clean desk", "Crachás"],
    color: "cyan",
  },
  {
    id: "technical" as const,
    index: "02",
    title: "Agente Técnico",
    english: "Technical Security",
    icon: "code" as const,
    description: "Investigue ameaças digitais antes que comprometam a rede.",
    tags: ["Phishing", "Logs", "Network"],
    color: "violet",
  },
  {
    id: "administrative" as const,
    index: "03",
    title: "Agente Administrativo",
    english: "Administrative Security",
    icon: "document" as const,
    description: "Garanta conformidade e fluxos seguros de informação.",
    tags: ["LGPD", "Arquivos", "Workflows"],
    color: "green",
  },
];

const inspections: Record<HotspotId, {
  label: string;
  eyebrow: string;
  icon: IconName;
  description: string;
  question: string;
  options: string[];
  answer: number;
  success: string;
  error: string;
}> = {
  usb: {
    label: "USB desconhecido",
    eyebrow: "Inspeção física · USB-01",
    icon: "usb",
    description: "Um dispositivo USB sem identificação foi encontrado próximo ao mouse de uma estação desbloqueada.",
    question: "Você encontrou um pendrive desconhecido perto do mouse. O que faz?",
    options: [
      "Conectar para verificar quem é o proprietário",
      "Entregar à TI/Segurança sem conectar",
    ],
    answer: 1,
    success: "Dispositivo entregue com segurança. Nenhum sistema foi exposto.",
    error: "Mídias desconhecidas podem executar malware assim que conectadas.",
  },
  email: {
    label: "E-mail suspeito",
    eyebrow: "Inspeção técnica · MSG-07",
    icon: "mail",
    description: "E-mail urgente da TI solicitando redefinição de senha via link externo.",
    question: "Como você deve responder a esta solicitação?",
    options: [
      "Clicar no link imediatamente",
      "Verificar o cabeçalho e reportar pelo canal oficial",
    ],
    answer: 1,
    success: "Cabeçalhos validados. A tentativa de phishing foi contida.",
    error: "Links externos urgentes podem capturar suas credenciais.",
  },
  documents: {
    label: "Contrato exposto",
    eyebrow: "Inspeção administrativa · DOC-12",
    icon: "document",
    description: "Um contrato marcado como confidencial permanece visível em uma mesa compartilhada.",
    question: "Documento com dados pessoais de clientes exposto sem supervisão.",
    options: [
      "Deixar o documento sobre a mesa",
      "Guardar em gaveta trancada e seguir a política LGPD",
    ],
    answer: 1,
    success: "Documento protegido. A exposição indevida foi eliminada.",
    error: "Deixar dados pessoais expostos viola os controles de privacidade.",
  },
};

function Brand() {
  return (
    <div className="brand">
      <div className="brand-mark"><Icon name="shield" size={23} /><span /></div>
      <div>
        <strong>Equatorial</strong>
        <small>CyberShield</small>
      </div>
    </div>
  );
}

function CharacterSelection({ onSelect }: { onSelect: (id: AgentId) => void }) {
  const [selected, setSelected] = useState<AgentId | null>(null);
  return (
    <div className="selection-screen">
      <div className="grid-backdrop" />
      <header className="landing-nav">
        <Brand />
        <div className="secure-chip"><span className="status-dot" /> Ambiente seguro <Icon name="lock" size={14} /></div>
      </header>

      <section className="selection-content">
        <div className="mission-kicker"><span>MISSÃO 01</span><i /> VIRTUAL ESCAPE ROOM</div>
        <div className="selection-heading">
          <p className="overline">PROTOCOLO DE ACESSO</p>
          <h1>Escolha seu <em>perfil de agente</em></h1>
          <p>Seu perfil define a perspectiva da investigação. Identifique as vulnerabilidades e fortaleça o escudo antes que o tempo acabe.</p>
        </div>

        <div className="agent-grid">
          {agents.map((agent) => (
            <button
              className={`agent-card ${agent.color} ${selected === agent.id ? "selected" : ""}`}
              key={agent.id}
              onClick={() => setSelected(agent.id)}
              type="button"
            >
              <span className="card-topline"><span>{agent.index}</span><span className="select-indicator"><Icon name={selected === agent.id ? "check" : "chevron"} size={16} /></span></span>
              <span className="agent-icon"><Icon name={agent.icon} size={34} /></span>
              <span className="agent-title">{agent.title}</span>
              <span className="agent-english">{agent.english}</span>
              <span className="agent-description">{agent.description}</span>
              <span className="tag-row">{agent.tags.map((tag) => <span key={tag}>{tag}</span>)}</span>
            </button>
          ))}
        </div>

        <div className="launch-row">
          <div className="classification"><Icon name="shield" size={16} /> CLASSIFICAÇÃO: TREINAMENTO INTERNO</div>
          <button className="primary-button" disabled={!selected} onClick={() => selected && onSelect(selected)} type="button">
            Iniciar missão <Icon name="chevron" size={18} />
          </button>
          <div className="player-count"><span>3</span> PERFIS DISPONÍVEIS</div>
        </div>
      </section>
    </div>
  );
}

function OfficeScene({ inspected, assigned, onInspect }: { inspected: Set<HotspotId>; assigned: HotspotId; onInspect: (id: HotspotId) => void }) {
  return (
    <div className="scene-wrap">
      <svg className="office-scene" viewBox="0 0 1200 680" role="img" aria-label="Escritório isométrico com pontos de inspeção">
        <defs>
          <linearGradient id="roomBg" x1="100" y1="0" x2="1100" y2="680">
            <stop stopColor="#10273a" /><stop offset="1" stopColor="#07111e" />
          </linearGradient>
          <linearGradient id="deskWood" x1="250" y1="260" x2="970" y2="560">
            <stop stopColor="#c78a54" /><stop offset=".55" stopColor="#9c6039" /><stop offset="1" stopColor="#704029" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#123d58" /><stop offset="1" stopColor="#071d30" />
          </linearGradient>
          <filter id="sceneShadow" x="-30%" y="-30%" width="160%" height="180%">
            <feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="#000814" floodOpacity=".5" />
          </filter>
          <pattern id="floorGrid" width="55" height="31.75" patternUnits="userSpaceOnUse" patternTransform="skewY(-30)">
            <path d="M55 0H0V31.75" fill="none" stroke="#1d5266" strokeOpacity=".24" />
          </pattern>
        </defs>
        <rect width="1200" height="680" fill="url(#roomBg)" />
        <path d="M0 480 600 132l600 348v200H0Z" fill="#091b2a" />
        <path d="M0 480 600 132l600 348v200H0Z" fill="url(#floorGrid)" />
        <path d="M0 0h1200v88L600 435 0 88Z" fill="#0d2233" opacity=".45" />
        <path d="m70 139 247-93 140 81-247 94Z" fill="#14354a" />
        <path d="m210 221 247-94v139l-247 95Z" fill="#0a1e2d" />
        <path d="m239 229 179-68v63l-179 69Z" fill="#22cce1" opacity=".1" />
        <path d="m963 72 172 99v175l-172-100Z" fill="#0a1c2a" stroke="#1d4b60" />
        <path d="m987 127 123 71m-123-24 123 71m-123-24 82 48" stroke="#23637a" strokeWidth="7" opacity=".52" />

        <g filter="url(#sceneShadow)">
          <path d="m164 340 616-141 302 175-617 157Z" fill="url(#deskWood)" stroke="#e1ad75" strokeWidth="3" />
          <path d="m465 531 617-157v35L465 570Z" fill="#5c3225" />
          <path d="m164 340 301 191v39L164 378Z" fill="#75452e" />
          <path d="m202 394 48 30-10 190-43 25Zm780 30 48-12-2 161-42 25Z" fill="#132d3c" />

          {/* lamp */}
          <path d="m926 287 61-14 42 25-62 15Z" fill="#243d4b" />
          <path d="m967 283-2-113 13-3 3 114Z" fill="#334f5d" />
          <path d="m973 169-63-42 9-12 64 44Z" fill="#365665" />
          <path d="m875 95 75 8 18 34-64 7-39-25Z" fill="#1b3545" stroke="#5c7f8f" strokeWidth="2" />
          <path d="m884 105 58 7 10 18-47 5-31-19Z" fill="#d7fbff" opacity=".85" />

          {/* monitor */}
          <path d="m406 132 403 73-4 202-401-77Z" fill="#132d3e" stroke="#5a7989" strokeWidth="4" />
          <path d="m426 154 362 66-3 164-360-70Z" fill="url(#screenGlow)" />
          <path d="m426 154 362 66v25l-362-66Z" fill="#082539" />
          <circle cx="765" cy="229" r="6" fill="#43d7e9" />
          <path d="m445 193 66 12-2 91-64-13Z" fill="#0b2b42" />
          <path d="m458 212 38 7m-38 17 43 8m-43 16 30 6" stroke="#719cab" strokeWidth="6" />
          <path d="m530 209 235 43-2 27-233-44Z" fill="#13445e" />
          <path d="m546 251 100 19-2 59-99-19Zm113 21 104 19-1 59-103-20Z" fill="#0d3048" stroke="#1e6078" />
          <path d="m562 280 55 10m-55 12 38 7m114-9 29 5v22l-29-6Z" stroke="#42d6e7" strokeWidth="6" />
          <path d="m594 371 58 11 1 53-57-4Z" fill="#263f4d" />
          <path d="m543 427 146-8 47 25-151 12Z" fill="#1b3342" stroke="#607c8a" strokeWidth="2" />
          {/* sticky */}
          <path d="m720 193 58 11-2 51-57-11Z" fill="#f2d267" />
          <path d="m731 219 32 6m-32 7 23 5" stroke="#866a2b" strokeWidth="3" />

          {/* keyboard */}
          <path d="m496 421 286-36 105 62-291 43Z" fill="#172d3b" stroke="#617d89" strokeWidth="3" />
          <path d="m524 430 238-29 85 49-242 34Z" fill="#091b27" />
          {[0, 1, 2, 3].map((row) => (
            <g key={row}>
              {[0, 1, 2, 3, 4, 5, 6, 7].map((key) => (
                <path key={key} d={`m${540 + key * 29 + row * 9} ${432 + row * 11} 20-2 9 5-21 3Z`} fill="#486572" />
              ))}
            </g>
          ))}

          {/* mouse + USB */}
          <path d="M884 415c25-7 55 7 59 26 4 18-15 33-38 34-23 0-43-13-44-28-2-14 7-26 23-32Z" fill="#193646" stroke="#668b9a" strokeWidth="2" />
          <path d="m907 417 1 23" stroke="#3de1ee" strokeWidth="3" />
          <path d="m837 475 58 17-13 22-60-17Z" fill="#0588a5" stroke="#55e1ec" strokeWidth="2" />
          <path d="m812 471 26 7-11 18-25-7Z" fill="#c6d7d9" />

          {/* paper */}
          <path d="m264 391 195-47 123 72-198 50Z" fill="#e8efee" stroke="#fff" strokeWidth="2" />
          <path d="m289 397 92-22m-77 37 125-30m-108 44 96-24" stroke="#8da2a9" strokeWidth="5" />
          <path d="m411 407 91 53-60 15-89-53Z" fill="none" stroke="#c23e49" strokeWidth="4" />
          <text x="398" y="404" fill="#b8313d" fontFamily="Arial" fontSize="15" fontWeight="700" transform="rotate(30 398 404)">CONFIDENCIAL</text>

          {/* mug */}
          <path d="m259 315 74 7-7 72c-2 15-65 10-66-7Z" fill="#e7f1ef" />
          <ellipse cx="296" cy="319" rx="37" ry="12" fill="#533626" />
          <path d="M330 337c45-7 46 44-3 39" fill="none" stroke="#e7f1ef" strokeWidth="12" />
          <path d="m273 342 44 4-3 12-41-4Z" fill="#16bad0" />

          {/* badge */}
          <path d="m704 506 109-28 70 42-109 29Z" fill="#e8f1ef" />
          <path d="m704 506 109-28 20 12-110 28Z" fill="#16bdd2" />
          <circle cx="749" cy="522" r="14" fill="#7f9fa9" />
          <path d="m777 510 59-15m-49 25 58-15m-49 24 33-9" stroke="#76919a" strokeWidth="5" />
        </g>
      </svg>

      <button className={`hotspot email ${assigned !== "email" ? "inactive" : ""} ${inspected.has("email") ? "complete" : ""}`} disabled={assigned !== "email"} onClick={() => onInspect("email")} type="button">
        <span className="pulse-ring" /><span className="hotspot-core"><Icon name={inspected.has("email") ? "check" : "mail"} size={17} /></span><span className="hotspot-label">E-mail suspeito</span>
      </button>
      <button className={`hotspot usb ${assigned !== "usb" ? "inactive" : ""} ${inspected.has("usb") ? "complete" : ""}`} disabled={assigned !== "usb"} onClick={() => onInspect("usb")} type="button">
        <span className="pulse-ring" /><span className="hotspot-core"><Icon name={inspected.has("usb") ? "check" : "usb"} size={17} /></span><span className="hotspot-label">USB desconhecido</span>
      </button>
      <button className={`hotspot docs ${assigned !== "documents" ? "inactive" : ""} ${inspected.has("documents") ? "complete" : ""}`} disabled={assigned !== "documents"} onClick={() => onInspect("documents")} type="button">
        <span className="pulse-ring" /><span className="hotspot-core"><Icon name={inspected.has("documents") ? "check" : "document"} size={17} /></span><span className="hotspot-label">Contrato exposto</span>
      </button>
    </div>
  );
}

function InspectionModal({ id, completed, onClose, onSolve, onWrong }: { id: HotspotId; completed: boolean; onClose: () => void; onSolve: () => void; onWrong: () => void }) {
  const data = inspections[id];
  const [choice, setChoice] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(completed ? "success" : null);

  const submit = () => {
    if (choice === null) return;
    if (choice === data.answer) {
      setFeedback("success");
      onSolve();
    } else {
      setFeedback("error");
      onWrong();
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="inspection-modal" role="dialog" aria-modal="true" aria-label={`Inspeção: ${data.label}`}>
        <div className="modal-accent" />
        <header className="modal-header">
          <div><p>{data.eyebrow}</p><h2>{data.label}</h2></div>
          <button className="icon-button" onClick={onClose} type="button" aria-label="Fechar inspeção"><Icon name="close" /></button>
        </header>
        <div className="modal-body">
          <div className={`object-preview ${id}`}>
            <span className="scan-line" />
            <span className="preview-grid" />
            <div className="preview-icon"><Icon name={data.icon} size={64} /></div>
            <div className="object-id">OBJETO // {id.toUpperCase()}-SCAN</div>
          </div>
          <div className="question-panel">
            <div className="scenario-label"><span>01</span> CENÁRIO IDENTIFICADO</div>
            <p className="scenario-copy">{data.description}</p>
            <h3>{data.question}</h3>
            <div className="answer-list">
              {data.options.map((option, index) => (
                <button
                  className={`answer ${choice === index ? "chosen" : ""} ${feedback && index === data.answer ? "correct" : ""}`}
                  disabled={feedback === "success"}
                  key={option}
                  onClick={() => { setChoice(index); setFeedback(null); }}
                  type="button"
                >
                  <span>{String.fromCharCode(65 + index)}</span>{option}<i />
                </button>
              ))}
            </div>
          </div>
        </div>

        {feedback && (
          <div className={`feedback-card ${feedback}`}>
            <div className="feedback-icon"><Icon name={feedback === "success" ? "check" : "warning"} size={26} /></div>
            <div>
              <strong>{feedback === "success" ? "SHIELD RESTORED" : "HACKER ALERT"}</strong>
              <p>{feedback === "success" ? data.success : data.error}</p>
            </div>
          </div>
        )}
        <footer className="modal-footer">
          <span><Icon name="shield" size={15} /> PROTOCOLO EQUATORIAL CS-24</span>
          {feedback === "success" ? (
            <button className="primary-button success" onClick={onClose} type="button">Continuar missão <Icon name="chevron" size={17} /></button>
          ) : (
            <button className="primary-button" disabled={choice === null} onClick={submit} type="button">Validar resposta <Icon name="check" size={17} /></button>
          )}
        </footer>
      </section>
    </div>
  );
}

function EscapeRoom({ agentId, onExit }: { agentId: AgentId; onExit: () => void }) {
  const agent = agents.find((item) => item.id === agentId)!;
  const [seconds, setSeconds] = useState(180);
  const [shield, setShield] = useState(70);
  const [inspected, setInspected] = useState<Set<HotspotId>>(new Set());
  const [active, setActive] = useState<HotspotId | null>(null);
  const [hackerAlert, setHackerAlert] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const time = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
  const progress = inspected.size;
  const assigned: HotspotId = {
    physical: "usb",
    technical: "email",
    administrative: "documents",
  }[agentId] as HotspotId;
  const missionComplete = progress === 1;
  const objective = useMemo(() => ({
    physical: "Localize dispositivos e credenciais expostos",
    technical: "Analise indicadores de comprometimento",
    administrative: "Proteja dados e valide a conformidade",
  }[agentId]), [agentId]);

  const solve = () => {
    if (!active || inspected.has(active)) return;
    setInspected((previous) => new Set(previous).add(active));
    setShield((value) => Math.min(100, value + 30));
  };

  const triggerHackerAlert = () => {
    setShield((value) => Math.max(0, value - 20));
    setHackerAlert(true);
    window.setTimeout(() => setHackerAlert(false), 1400);
  };

  return (
    <div className="game-screen">
      <header className="hud">
        <Brand />
        <div className="hud-center">
          <div className="readiness">
            <div className="hud-label"><span>SHIELD READINESS</span><span>ESCUDO DE PRONTIDÃO</span></div>
            <div className="readiness-value">{shield}<small>%</small></div>
            <div className="readiness-bar"><i style={{ width: `${shield}%` }} /></div>
          </div>
          <div className="timer-widget">
            <Icon name="clock" size={20} /><div><span>TEMPO RESTANTE</span><strong>{time}</strong></div>
          </div>
          <div className="key-widget">
            <div><span>CHAVE DE INSPEÇÃO</span><strong>{progress}<small>/ 1</small></strong></div>
            <div className="key-progress">
              <i className={progress ? "filled" : ""}><Icon name={progress ? "check" : "key"} size={14} /></i>
            </div>
          </div>
        </div>
        <button className="profile-control" onClick={onExit} type="button">
          <span className={`mini-avatar ${agent.color}`}><Icon name={agent.icon} size={18} /></span>
          <span><small>PERFIL ATIVO</small><strong>{agent.title}</strong></span>
          <Icon name="chevron" size={16} />
        </button>
      </header>

      <div className="mission-bar">
        <span className="live-dot" /> MISSÃO EM CURSO
        <i />
        <strong>{objective}</strong>
        <span className="sector">SETOR 04 · ESTAÇÃO CORPORATIVA</span>
      </div>

      <main className="game-main">
        <OfficeScene assigned={assigned} inspected={inspected} onInspect={setActive} />
        <aside className="objective-panel">
          <p className="panel-kicker">OBJETIVOS DA MISSÃO</p>
          <h2>Varredura de segurança</h2>
          <p>Investigue a evidência indicada para o seu perfil e neutralize a vulnerabilidade.</p>
          <div className="objective-list">
            <button className={inspected.has(assigned) ? "done" : ""} onClick={() => setActive(assigned)} type="button">
              <span>{inspected.has(assigned) ? <Icon name="check" size={16} /> : "01"}</span>
              <span><strong>{inspections[assigned].label}</strong><small>{inspected.has(assigned) ? "RISCO NEUTRALIZADO" : "AGUARDANDO INSPEÇÃO"}</small></span>
            </button>
          </div>
          <div className="tip-card"><Icon name="key" size={18} /><p><strong>DICA DE CAMPO</strong> Clique nos marcadores pulsantes para analisar cada evidência.</p></div>
        </aside>
      </main>

      <footer className="game-footer">
        <span><i /> CANAL SEGURO · AES-256</span>
        <span>EQUATORIAL CYBERSHIELD / SIMULAÇÃO v2.4</span>
        <span>SISTEMA OPERACIONAL <i /></span>
      </footer>

      {missionComplete && !active && (
        <div className="completion-banner">
          <span><Icon name="shield" size={28} /></span>
          <div><small>MISSÃO CONCLUÍDA</small><strong>Escudo corporativo restaurado</strong></div>
          <button onClick={onExit} type="button">Selecionar novo agente <Icon name="chevron" size={16} /></button>
        </div>
      )}

      {hackerAlert && (
        <div className="hacker-flash" role="alert">
          <div className="hacker-flash-card">
            <span><Icon name="warning" size={40} /></span>
            <small>ACESSO HOSTIL DETECTADO</small>
            <strong>HACKER ALERT!</strong>
            <p>Ops! Seu escudo perdeu 20% de proteção.</p>
          </div>
        </div>
      )}

      {active && (
        <InspectionModal
          completed={inspected.has(active)}
          id={active}
          onClose={() => setActive(null)}
          onSolve={solve}
          onWrong={triggerHackerAlert}
        />
      )}
    </div>
  );
}

export default function App() {
  const [agent, setAgent] = useState<AgentId | null>(null);
  return agent ? <EscapeRoom agentId={agent} onExit={() => setAgent(null)} /> : <CharacterSelection onSelect={setAgent} />;
}
