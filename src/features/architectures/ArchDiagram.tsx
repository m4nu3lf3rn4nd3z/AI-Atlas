import type { CSSProperties, ReactNode } from 'react'

// ─── Color tokens per node type ──────────────────────────────────
const C = {
  user:      'var(--fg-subtle)',
  llm:       'var(--l0)',
  embed:     'var(--l2)',
  store:     'var(--l1)',
  processor: 'var(--l3)',
  cache:     'var(--l4)',
  tool:      'var(--l5)',
  agent:     'var(--l6)',
  eval:      'var(--l7)',
  guard:     'var(--bad)',
} as const

type NT = keyof typeof C

// ─── Primitives ───────────────────────────────────────────────────

function N({
  x, y, w = 105, h = 42, label, sub, type = 'processor', dashed,
}: {
  x: number; y: number; w?: number; h?: number
  label: string; sub?: string; type?: NT; dashed?: boolean
}) {
  const color = C[type]
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx={7}
        strokeWidth={1.5}
        strokeDasharray={dashed ? '5 3' : undefined}
        style={{ fill: `color-mix(in oklab, ${color} 10%, var(--surface-2))`, stroke: color } as CSSProperties}
      />
      <text
        x={x + w / 2} y={sub ? y + h / 2 - 4 : y + h / 2 + 4}
        textAnchor="middle" fontSize={11} fontWeight="500"
        style={{ fill: 'var(--fg)', fontFamily: 'inherit' } as CSSProperties}
      >{label}</text>
      {sub && (
        <text
          x={x + w / 2} y={y + h / 2 + 11}
          textAnchor="middle" fontSize={9.5}
          style={{ fill: 'var(--fg-muted)', fontFamily: 'inherit' } as CSSProperties}
        >{sub}</text>
      )}
    </g>
  )
}

function E({
  d, mk, label, lx, ly, dashed,
}: {
  d: string; mk: string
  label?: string; lx?: number; ly?: number; dashed?: boolean
}) {
  return (
    <g>
      <path
        d={d} fill="none" strokeWidth={1.5}
        strokeDasharray={dashed ? '5 3' : undefined}
        markerEnd={`url(#${mk})`}
        style={{ stroke: 'var(--border-strong)', color: 'var(--border-strong)' } as CSSProperties}
      />
      {label != null && lx != null && ly != null && (
        <text
          x={lx} y={ly} textAnchor="middle" fontSize={9.5}
          style={{ fill: 'var(--fg-subtle)', fontFamily: 'inherit' } as CSSProperties}
        >{label}</text>
      )}
    </g>
  )
}

function Band({
  x, y, w, h, label,
}: { x: number; y: number; w: number; h: number; label: string }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={4}
        style={{ fill: 'var(--surface-3)', opacity: 0.5 } as CSSProperties}
      />
      <text
        x={x + 6} y={y + 12} fontSize={8.5} fontWeight="600"
        style={{ fill: 'var(--fg-subtle)', fontFamily: 'inherit', textTransform: 'uppercase', letterSpacing: '0.08em' } as CSSProperties}
      >{label}</text>
    </g>
  )
}

function Base({ mk, height = 220, children }: { mk: string; height?: number; children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 640 ${height}`}
      className="w-full"
      aria-hidden
      style={{ fontFamily: 'var(--font-sans)', display: 'block' } as CSSProperties}
    >
      <defs>
        <marker id={mk} viewBox="0 0 10 10" refX={9} refY={5} markerWidth={5} markerHeight={5} orient="auto-start-reverse">
          <path d="M 1 1 L 9 5 L 1 9 z" fill="currentColor" />
        </marker>
      </defs>
      {children}
    </svg>
  )
}

// ─── 1. Chat básico ───────────────────────────────────────────────

export function ChatBasicDiagram() {
  const mk = 'a1'
  return (
    <Base mk={mk} height={195}>
      <N x={15}  y={95}  w={85}  h={42} label="Usuario"       type="user" />
      <N x={220} y={20}  w={130} h={38} label="System Prompt" sub="instrucciones globales" type="processor" dashed />
      <N x={215} y={82}  w={145} h={58} label="LLM API"       sub="claude / gpt / gemini" type="llm" />
      <N x={475} y={95}  w={115} h={42} label="Respuesta"     type="processor" />
      {/* edges */}
      <E d="M 100,116 L 215,111" mk={mk} label="prompt" lx={159} ly={108} />
      <E d="M 285,58 L 285,82"   mk={mk} label="system"  lx={299} ly={72} dashed />
      <E d="M 360,111 L 475,116" mk={mk} label="completion" lx={419} ly={108} />
    </Base>
  )
}

// ─── 2. RAG Pipeline ─────────────────────────────────────────────

export function RagPipelineDiagram() {
  const mk = 'a2'
  return (
    <Base mk={mk} height={230}>
      <Band x={8}  y={10} w={623} h={75}  label="Indexación offline" />
      <Band x={8}  y={115} w={623} h={100} label="Consulta online" />

      {/* offline path */}
      <N x={22}  y={30}  w={85}  h={40} label="Documentos"  sub="corpus"       type="store" />
      <N x={130} y={30}  w={90}  h={40} label="Chunker"     sub="segmentación" type="processor" />
      <N x={245} y={30}  w={95}  h={40} label="Embedder"    sub="dense vector" type="embed" />
      <N x={380} y={22}  w={115} h={56} label="Vector DB"   sub="HNSW / IVF"   type="store" />

      {/* online path */}
      <N x={22}  y={145} w={80}  h={40} label="Usuario"    type="user" />
      <N x={120} y={145} w={95}  h={40} label="Embed query" sub="mismo modelo" type="embed" />
      <N x={310} y={145} w={105} h={40} label="Context"    sub="chunks + query" type="processor" />
      <N x={435} y={138} w={95}  h={52} label="LLM"        sub="generación"     type="llm" />
      <N x={550} y={145} w={82}  h={40} label="Respuesta"  type="processor" />

      {/* offline edges */}
      <E d="M 107,50 L 130,50" mk={mk} />
      <E d="M 220,50 L 245,50" mk={mk} />
      <E d="M 340,50 L 380,50" mk={mk} />

      {/* embed query → vector DB (up-right curve) */}
      <E d="M 215,145 C 295,145 380,80 380,70" mk={mk} label="query vector" lx={305} ly={120} />
      {/* vector DB → context (down-left curve) */}
      <E d="M 437,64 C 437,145 415,165 415,165" mk={mk} label="top-K chunks" lx={452} ly={125} />

      {/* user → embed */}
      <E d="M 102,165 L 120,165" mk={mk} />
      {/* context → llm → response */}
      <E d="M 415,165 L 435,165" mk={mk} />
      <E d="M 530,164 L 550,164" mk={mk} />
    </Base>
  )
}

// ─── 3. Agente ReAct ─────────────────────────────────────────────

export function AgentReactDiagram() {
  const mk = 'a3'
  return (
    <Base mk={mk} height={230}>
      <N x={15}  y={90}  w={80}  h={42} label="Usuario"     type="user" />
      <N x={155} y={70}  w={135} h={62} label="LLM"         sub="razona + planifica" type="llm" />
      <N x={360} y={70}  w={120} h={62} label="Ejecutor"    sub="tool dispatcher"    type="agent" />
      <N x={510} y={38}  w={105} h={36} label="API externa" type="tool" />
      <N x={510} y={82}  w={105} h={36} label="Base de datos" type="store" />
      <N x={510} y={126} w={105} h={36} label="Código / shell" type="tool" />
      <N x={155} y={170} w={135} h={38} label="Respuesta final" type="processor" />

      {/* user → llm */}
      <E d="M 95,111 L 155,101" mk={mk} label="tarea" lx={127} ly={102} />
      {/* llm → executor */}
      <E d="M 290,96 L 360,96"  mk={mk} label="tool_use" lx={326} ly={90} />
      {/* executor → tools */}
      <E d="M 480,84  L 510,56" mk={mk} />
      <E d="M 480,101 L 510,100" mk={mk} />
      <E d="M 480,118 L 510,144" mk={mk} />
      {/* executor → llm (result loop) */}
      <E
        d="M 420,132 C 420,158 240,158 240,132"
        mk={mk} label="tool_result" lx={330} ly={168}
      />
      {/* llm → response */}
      <E d="M 222,132 L 222,170" mk={mk} label="done" lx={236} ly={155} />
    </Base>
  )
}

// ─── 4. Multi-agente ─────────────────────────────────────────────

export function MultiAgentDiagram() {
  const mk = 'a4'
  return (
    <Base mk={mk} height={230}>
      <N x={10}  y={88}  w={80}  h={42}  label="Usuario"        type="user" />
      <N x={155} y={72}  w={140} h={56}  label="Orchestrator"   sub="LLM coordinador"  type="llm" />
      <N x={90}  y={170} w={95}  h={40}  label="Agente A"       sub="investigación"    type="agent" />
      <N x={210} y={170} w={95}  h={40}  label="Agente B"       sub="redacción"        type="agent" />
      <N x={330} y={170} w={95}  h={40}  label="Agente C"       sub="revisión"         type="agent" />
      <N x={460} y={72}  w={120} h={56}  label="Agregador"      sub="sintetiza outputs" type="processor" />
      <N x={555} y={88} w={75}  h={42}  label="Respuesta"      type="processor" />

      {/* user → orchestrator */}
      <E d="M 90,109 L 155,100" mk={mk} />
      {/* orchestrator → agents */}
      <E d="M 225,128 C 225,170 185,170 185,170" mk={mk} label="subtarea A" lx={200} ly={158} />
      <E d="M 225,128 L 257,170"                 mk={mk} />
      <E d="M 255,128 C 290,128 378,170 378,170" mk={mk} label="subtarea C" lx={332} ly={155} />
      {/* agents → aggregator */}
      <E d="M 185,210 C 185,245 520,245 520,128" mk={mk} />
      <E d="M 257,210 C 310,245 520,245 520,128" mk={mk} />
      <E d="M 378,210 C 415,245 520,245 520,128" mk={mk} />
      {/* aggregator → response */}
      <E d="M 580,100 L 555,109" mk={mk} />
    </Base>
  )
}

// ─── 5. Pipeline de evaluación ───────────────────────────────────

export function EvalPipelineDiagram() {
  const mk = 'a5'
  return (
    <Base mk={mk} height={210}>
      <N x={15}  y={35}  w={100} h={42} label="Test inputs"   sub="dataset curado"    type="store" />
      <N x={175} y={35}  w={120} h={42} label="LLM Pipeline"  sub="sistema bajo eval" type="llm" />
      <N x={360} y={35}  w={100} h={42} label="Outputs"       sub="respuestas reales" type="processor" />
      <N x={15}  y={130} w={100} h={42} label="Ground truth"  sub="respuestas ideales" type="store" />
      <N x={245} y={120} w={115} h={52} label="LLM Judge"     sub="eval-as-judge"     type="eval" />
      <N x={430} y={130} w={100} h={42} label="Score / Report" sub="métricas + ejemplos" type="eval" />
      <N x={550} y={130} w={80}  h={42} label="Iteración"     sub="próx. versión"     type="processor" />

      {/* inputs → pipeline → outputs */}
      <E d="M 115,56 L 175,56"    mk={mk} />
      <E d="M 295,56 L 360,56"    mk={mk} />
      {/* outputs → judge */}
      <E d="M 410,77 C 410,120 355,146 360,146" mk={mk} label="predicciones" lx={403} ly={116} />
      {/* ground truth → judge */}
      <E d="M 115,151 C 185,151 245,146 245,146" mk={mk} label="esperado" lx={182} ly={143} />
      {/* judge → score */}
      <E d="M 360,146 L 430,151" mk={mk} />
      {/* score → iteration */}
      <E d="M 530,151 L 550,151" mk={mk} />
    </Base>
  )
}

// ─── 6. Gateway de producción ────────────────────────────────────

export function ProdGatewayDiagram() {
  const mk = 'a6'
  return (
    <Base mk={mk} height={225}>
      <Band x={8} y={8}  w={623} h={80}  label="Ingress" />
      <Band x={8} y={130} w={623} h={80} label="Egress" />

      {/* ingress row */}
      <N x={20}  y={25} w={72}  h={42} label="Usuario"     type="user" />
      <N x={107} y={25} w={100} h={42} label="Auth / RL"   sub="rate limiter"      type="guard" />
      <N x={222} y={25} w={100} h={42} label="Guard in"    sub="input guardrail"   type="guard" />
      <N x={337} y={25} w={105} h={42} label="Sem. Cache"  sub="prompt similarity" type="cache" />

      {/* LLM cluster center */}
      <N x={270} y={110} w={110} h={52} label="LLM Cluster" sub="+ load balancer"  type="llm" />

      {/* egress row */}
      <N x={200} y={148} w={100} h={42} label="Guard out"   sub="output guardrail" type="guard" />
      <N x={315} y={148} w={100} h={42} label="Respuesta"   type="processor" />
      <N x={430} y={148} w={100} h={42} label="OTel / Logs" sub="tracing + métricas" type="processor" />

      {/* ingress edges */}
      <E d="M 92,46  L 107,46"  mk={mk} />
      <E d="M 207,46 L 222,46"  mk={mk} />
      <E d="M 322,46 L 337,46"  mk={mk} />
      {/* cache miss → LLM */}
      <E d="M 389,67 C 389,111 380,136 380,136" mk={mk} label="cache miss" lx={415} ly={107} />
      {/* cache hit arrow (dashed, going to response) */}
      <E d="M 337,67 C 310,110 315,148 315,148" mk={mk} label="hit" lx={300} ly={118} dashed />
      {/* LLM → guard out → response */}
      <E d="M 300,162 L 300,190" mk={mk} />
      <E d="M 415,169 L 430,169" mk={mk} />
      {/* LLM → OTel (parallel monitoring) */}
      <E d="M 345,162 C 445,162 480,162 480,162" mk={mk} label="spans" lx={415} ly={156} dashed />
    </Base>
  )
}
