import { useEffect, useMemo, useState } from "react";
import escritorioImg from './assets/Escritorio.jpeg';
import React from 'react';

type AgentId = "physical" | "technical" | "administrative";
type HotspotId = "email" | "usb" | "documents";

type Feedback = "success" | "error" | null;
type IconName = "badge" | "building" | "check" | "chevron" | "clock" | "close" | "code" | "document" | "key" | "lock" | "mail" | "shield" | "usb" | "warning";
const iconPaths: Record<string, React.ReactNode> = {
  badge: <React.Fragment><circle cx="12" cy="8" r="3" /><path d="M6.5 20v-2.5A5.5 5.5 0 0 1 12 12a5.5 5.5 0 0 1 5.5 5.5V20M8 3h8" /></React.Fragment>,
  building: <React.Fragment><path d="M4 21V5l8-3 8 3v16M8 8h.01M12 8h.01M16 8h.01M8 12h.01M12 12h.01M16 12h.01M9 21v-5h6v5" /></React.Fragment>,
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
            <div className="question">{data.question}</div>
            <div className="options">
              {data.options.map((opt, idx) => (
                <label key={idx} className={choice === idx ? "selected" : ""}>
                  <input
                    type="radio"
                    name="option"
                    value={idx}
                    checked={choice === idx}
                    onChange={() => setChoice(idx)}
                    disabled={completed}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div className="modal-footer">
            {completed ? (
              <button onClick={onClose} type="button">Fechar</button>
            ) : (
              <>
                <button onClick={submit} disabled={choice === null} type="button">Responder</button>
                <button onClick={onClose} type="button">Desistir</button>
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

// -------------------------------------------------
// 2️⃣ Paths exportados do Figma (substitua pelos valores reais se necessário)
// -------------------------------------------------
const HOTSPOTS: Record<HotspotId, { d: string }> = {
  email: {
    d: 'M1150.06 37.9982L554.688 31.0393C548.754 30.97 544.065 36.0544 544.614 41.9638L573.239 350.056C573.71 355.126 577.915 359.032 583.006 359.129L1112.83 369.213C1117.97 369.311 1122.35 365.497 1122.95 360.393L1159.88 49.1757C1160.58 43.274 1156 38.0677 1150.06 37.9982Z',
  },
  usb: {
    d: 'M1338.96 636.174L1334.49 638.928C1332.22 640.323 1330.6 642.564 1330 645.154L1328.43 651.798C1327.98 653.711 1328.11 655.714 1328.79 657.558L1335.52 675.762L1347.72 711.304L1357.39 738.125C1357.81 739.302 1358.45 740.388 1359.27 741.328L1370.11 753.688C1371.02 754.723 1372.13 755.56 1373.38 756.146L1388.94 763.46L1398.33 766.716C1398.94 766.928 1399.57 767.08 1400.21 767.171L1414.18 769.138H1431.39C1431.97 769.138 1432.55 769.088 1433.12 768.988L1442.13 767.406C1443.53 767.162 1444.86 766.623 1446.03 765.826L1452.99 761.093C1454.16 760.296 1455.15 759.26 1455.89 758.053L1458.76 753.377C1459.86 751.592 1460.36 749.507 1460.21 747.417L1459.18 733.386L1457.01 718.999C1456.92 718.405 1456.78 717.82 1456.58 717.251L1447.5 690.759C1447.33 690.276 1447.13 689.806 1446.89 689.354L1431.33 659.712C1430.72 658.549 1429.89 657.523 1428.88 656.685C1425.1 653.56 1415.36 645.553 1411.86 643.165C1407.87 640.437 1378.53 635.633 1373.41 634.811C1372.9 634.729 1372.39 634.69 1371.87 634.69H1344.2C1342.35 634.69 1340.54 635.204 1338.96 636.174Z',
  },
  documents: {
    d: 'M339.394 555.177L242.417 552.356C241.122 552.319 239.833 552.533 238.62 552.987L233.055 555.071C231.215 555.76 229.619 556.975 228.466 558.565L170.345 638.698L82.6011 752.109L3.95591 852.256C2.57259 854.017 1.82068 856.192 1.82068 858.432V880.972C1.82068 886.263 5.94145 890.638 11.2225 890.954L54.9448 893.574L177.11 898.548H397.211C401.175 898.548 404.765 896.207 406.363 892.58L441.338 813.192L493.069 689.832L510.976 648.646L521.894 621.832C522.175 621.14 522.379 620.419 522.5 619.682L530.159 573.042C531.158 566.954 526.46 561.422 520.291 561.422H464.064L339.394 555.177Z',
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

function OfficeScene({
  inspected,
  assigned,
  onInspect,
}: {
  inspected: Set<HotspotId>;
  assigned: HotspotId;
  onInspect: (id: HotspotId) => void;
}) {
  const [hovered, setHovered] = useState<HotspotId | null>(null);
 

  return (
    <div className="scene-wrap">
      {/* 1️⃣ Foto de fundo */}
      <img
        src={escritorioImg}
        alt="Escritório corporativo com estação de trabalho"
        className="office-photo"
        draggable={false}
      />

      {/* 2️⃣ Sobreposição SVG com os contornos (pointer‑events:none para não bloquear os botões) */}
      <svg
        className="office-hotspots"
        viewBox="0 0 1600 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {(Object.keys(HOTSPOTS) as HotspotId[]).map((id) => {
          const isHovered = hovered === id;
          const isInspected = inspected.has(id);
          const isActive = assigned === id;

          return (
            <path
              key={id}
              d={HOTSPOTS[id].d}
              className={[
                'hotspot-path',
                isHovered && isActive ? 'is-hovered' : '',
                isInspected ? 'is-complete' : '',
                !isActive ? 'is-inactive' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onMouseEnter={() => isActive && setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => isActive && onInspect(id)}
            />
          );
        })}
      </svg>

      {/* 3️⃣ Botões HTML – exatamente como antes (mantendo pulse‑ring, core e label) */}
      <button
        className={`hotspot email ${assigned !== "email" ? "inactive" : ""} ${inspected.has("email") ? "complete" : ""}`}
        disabled={assigned !== "email"}
        onClick={() => onInspect("email")}
        type="button"
      >
        <span className="pulse-ring" />
        <span className="hotspot-core">
          <Icon name={inspected.has("email") ? "check" : "mail"} size={17} />
        </span>
        <span className="hotspot-label">E‑mail suspeito</span>
      </button>

      <button
        className={`hotspot usb ${assigned !== "usb" ? "inactive" : ""} ${inspected.has("usb") ? "complete" : ""}`}
        disabled={assigned !== "usb"}
        onClick={() => onInspect("usb")}
        type="button"
      >
        <span className="pulse-ring" />
        <span className="hotspot-core">
          <Icon name={inspected.has("usb") ? "check" : "usb"} size={17} />
        </span>
        <span className="hotspot-label">USB desconhecido</span>
      </button>

      <button
        className={`hotspot docs ${assigned !== "documents" ? "inactive" : ""} ${inspected.has("documents") ? "complete" : ""}`}
        disabled={assigned !== "documents"}
        onClick={() => onInspect("documents")}
        type="button"
      >
        <span className="pulse-ring" />
        <span className="hotspot-core">
          <Icon name={inspected.has("documents") ? "check" : "document"} size={17} />
        </span>
        <span className="hotspot-label">Contrato exposto</span>
      </button>
    </div>
  );
}

function EscapeRoom({ agentId, onExit }: { agentId: AgentId; onExit: () => void }) {
  const [active, setActive] = useState<HotspotId | null>(null);
  const [inspected, setInspected] = useState<Set<HotspotId>>(new Set());
  const [shield, setShield] = useState<number>(100);
  const [time, setTime] = useState<number>(180);
  const [missionComplete, setMissionComplete] = useState<boolean>(false);
  const [hackerAlert, setHackerAlert] = useState<boolean>(false);
  const [objective, setObjective] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);

  const agentToHotspot: Record<AgentId, HotspotId> = {
    physical: 'usb',
    technical: 'email',
    administrative: 'documents',
  };
  const agentObj = agents.find(a => a.id === agentId)!;
  const assigned = agentObj ? agentToHotspot[agentId] : null;

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
            <div className="key-progress"><i className={progress ? "filled" : ""}><Icon name={progress ? "check" : "key"} size={14} /></i></div>
          </div>
        </div>
        <button className="profile-control" onClick={onExit} type="button">
          <span className={`mini-avatar ${agentObj?.color ?? ''}`}><Icon name={agentObj?.icon ?? "shield"} size={18} /></span>
           <span><strong>PERFIL ATIVO</strong>{agentObj?.title ?? ''}</span>
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
        <OfficeScene assigned={assigned!} inspected={inspected} onInspect={setActive} />
        <aside className="objective-panel">
          <p className="panel-kicker">OBJETIVOS DA MISSÃO</p>
          <h2>Varredura de segurança</h2>
          <p>Investigue a evidência indicada para o seu perfil e neutralize a vulnerabilidade.</p>
          <div className="objective-list">
            <button className={inspected.has(assigned!) ? "done" : ""} onClick={() => setActive(assigned!)} type="button">
              <span>{inspected.has(assigned!) ? <Icon name="check" size={16} /> : "01"}</span>
              <span><strong>{inspections[assigned!].label}</strong><small>{inspected.has(assigned!) ? "RISCO NEUTRALIZADO" : "AGUARDANDO INSPEÇÃO"}</small></span>
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
          <div><strong>MISSÃO CONCLUÍDA</strong><small>Escudo corporativo restaurado</small></div>
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
