import { useState } from "react";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const DISCIPLINAS = ["Civil", "Mecánica", "Eléctrica", "Instrumentación"];
const ESTADOS_PROYECTO = ["En curso", "Pausado", "Completado"];
const TIPOS_DOC = ["PET", "IPERC", "PMAO", "ATS", "Plano Redline", "Plano As-Built", "Protocolo de Prueba", "FR043", "Otro"];
const ESTADOS_DOC = ["En elaboración", "En revisión", "Aprobado", "Vencido"];
const ESTADOS_ACT = ["Pendiente", "En ejecución", "Completada", "Bloqueada"];
const TURNOS = ["Día", "Noche", "Guardia 12h"];

const disciplinaColor = {
  Civil: "#B45309", Mecánica: "#0369A1",
  Eléctrica: "#7C3AED", Instrumentación: "#059669",
};
const docColor = {
  "Aprobado": "#10B981", "En revisión": "#F59E0B",
  "En elaboración": "#60A5FA", "Vencido": "#EF4444",
};
const actColor = {
  "Pendiente": "#64748B", "En ejecución": "#60A5FA",
  "Completada": "#10B981", "Bloqueada": "#EF4444",
};

// ─── INITIAL DATA ─────────────────────────────────────────────────────────────
const initialProjects = [
  {
    id: 1,
    nombre: "Subestación Eléctrica Norte",
    descripcion: "Instalación de subestación 22.9kV",
    disciplinas: ["Eléctrica", "Civil"],
    estado: "En curso",
    fechaInicio: "2026-01-15",
    fechaFin: "2026-07-30",
    ssee: [
      { nombre: "Electrotec SAC", oc: "OC-2026-001", disciplina: "Eléctrica" },
      { nombre: "Cimentaciones Perú", oc: "OC-2026-002", disciplina: "Civil" },
    ],
    avanceProgramado: 48,
    avanceReal: 42,
    documentosProyecto: [
      { id: 1, tipo: "FR043", nombre: "FR043 - Subestación Norte", estado: "Aprobado", fecha: "2026-01-10" },
    ],
    semanas: [
      {
        id: 1,
        semana: "S20 - 2026",
        fechaInicio: "2026-05-12",
        fechaFin: "2026-05-18",
        actividades: [
          {
            id: 1,
            nombre: "Montaje de transformador 500kVA",
            disciplina: "Eléctrica",
            fechaInicio: "2026-05-12",
            fechaFin: "2026-05-20",
            estado: "En ejecución",
            observaciones: "SSEE consulta sobre torque de pernos de anclaje. Pendiente confirmación de ingeniería.",
            documentos: [
              { id: 1, tipo: "PET", nombre: "PET-001 Montaje Transformador", estado: "Aprobado", fecha: "2026-05-10" },
              { id: 2, tipo: "IPERC", nombre: "IPERC-001 Trabajo en altura", estado: "Aprobado", fecha: "2026-05-10" },
              { id: 3, tipo: "ATS", nombre: "ATS Montaje 12/05", estado: "Aprobado", fecha: "2026-05-12" },
            ],
          },
          {
            id: 2,
            nombre: "Excavación para cimentación tablero",
            disciplina: "Civil",
            fechaInicio: "2026-05-14",
            fechaFin: "2026-05-16",
            estado: "Completada",
            observaciones: "",
            documentos: [
              { id: 1, tipo: "ATS", nombre: "ATS Excavación 14/05", estado: "Aprobado", fecha: "2026-05-14" },
            ],
          },
        ],
        onCall: [
          {
            id: 1,
            actividad: "Tendido de cable 25mm²",
            fecha: "2026-05-17",
            turno: "Día",
            empleados: 6,
            responsable: "Ing. Carlos Quispe",
            cumplimiento: 85,
          },
        ],
      },
    ],
  },
  {
    id: 2,
    nombre: "Sistema HVAC Planta B",
    descripcion: "Instalación de equipos de climatización",
    disciplinas: ["Mecánica", "Instrumentación"],
    estado: "En curso",
    fechaInicio: "2026-02-01",
    fechaFin: "2026-09-15",
    ssee: [
      { nombre: "ClimaTec Ingenieros", oc: "OC-2026-010", disciplina: "Mecánica" },
      { nombre: "Instrumex SAC", oc: "OC-2026-011", disciplina: "Instrumentación" },
    ],
    avanceProgramado: 35,
    avanceReal: 37,
    documentosProyecto: [],
    semanas: [],
  },
];

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}55`,
      borderRadius: 4, padding: "2px 8px", fontSize: 11,
      fontWeight: 700, letterSpacing: 0.5, fontFamily: "monospace",
    }}>{label}</span>
  );
}

function ProgressBar({ programado, real }) {
  const desviacion = real - programado;
  const alerta = desviacion <= -5;
  const barColor = alerta ? "#EF4444" : desviacion >= 0 ? "#10B981" : "#F59E0B";
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#94A3B8", marginBottom: 4 }}>
        <span>Programado: <b style={{ color: "#CBD5E1" }}>{programado}%</b></span>
        <span>Real: <b style={{ color: barColor }}>{real}%</b></span>
        {alerta && <span style={{ color: "#EF4444", fontWeight: 700 }}>⚠ DESVÍO {desviacion}%</span>}
        {!alerta && desviacion !== 0 && <span style={{ color: barColor, fontWeight: 700 }}>{desviacion > 0 ? "▲" : "▼"} {Math.abs(desviacion)}%</span>}
      </div>
      <div style={{ background: "#1E293B", borderRadius: 4, height: 6, position: "relative", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(programado,100)}%`, background: "#334155", height: "100%", position: "absolute", borderRadius: 4 }} />
        <div style={{ width: `${Math.min(real,100)}%`, background: barColor, height: "100%", position: "absolute", borderRadius: 4, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function Modal({ title, onClose, children, wide }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "#00000090", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 16, padding: 28, width: "100%", maxWidth: wide ? 800 : 600, maxHeight: "92vh", overflowY: "auto", boxShadow: "0 25px 60px #000000aa" }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ color: "#F1F5F9", fontFamily: "'Syne', sans-serif", fontSize: 18, margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: "#94A3B8", fontSize: 11, fontWeight: 700, marginBottom: 5, letterSpacing: 0.5 }}>{label}</label>}
      <input {...props} style={{ width: "100%", background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", ...(props.style || {}) }} />
    </div>
  );
}

function SelectField({ label, options, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: "#94A3B8", fontSize: 11, fontWeight: 700, marginBottom: 5, letterSpacing: 0.5 }}>{label}</label>}
      <select {...props} style={{ width: "100%", background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, outline: "none", boxSizing: "border-box" }}>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function TextareaField({ label, ...props }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ display: "block", color: "#94A3B8", fontSize: 11, fontWeight: 700, marginBottom: 5, letterSpacing: 0.5 }}>{label}</label>}
      <textarea {...props} style={{ width: "100%", background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "9px 12px", color: "#F1F5F9", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", minHeight: 72, ...(props.style || {}) }} />
    </div>
  );
}

function SectionTitle({ children }) {
  return <div style={{ color: "#94A3B8", fontSize: 11, fontWeight: 700, letterSpacing: 1, marginBottom: 10, marginTop: 4, textTransform: "uppercase" }}>{children}</div>;
}

function Btn({ children, onClick, variant = "default", small }) {
  const variants = {
    default: { background: "#1E293B", border: "1px solid #334155", color: "#94A3B8" },
    primary: { background: "linear-gradient(135deg,#1E40AF,#7C3AED)", border: "none", color: "#fff" },
    danger: { background: "#EF444415", border: "1px solid #EF444440", color: "#EF4444" },
    success: { background: "#10B98115", border: "1px solid #10B98140", color: "#10B981" },
    ghost: { background: "none", border: "1px solid #334155", color: "#64748B" },
  };
  return (
    <button onClick={onClick} style={{ ...variants[variant], borderRadius: 7, padding: small ? "5px 12px" : "9px 16px", fontSize: small ? 11 : 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
      {children}
    </button>
  );
}

// ─── DOCUMENT LIST COMPONENT ──────────────────────────────────────────────────
function DocumentList({ docs, onAdd, onRemove, title }) {
  const [form, setForm] = useState({ tipo: TIPOS_DOC[0], nombre: "", estado: "Aprobado", fecha: "" });
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: "#0A1220", border: "1px solid #1E293B", borderRadius: 10, padding: 14, marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <SectionTitle>{title || "Documentos"}</SectionTitle>
        <Btn small variant="ghost" onClick={() => setOpen(o => !o)}>{open ? "✕ Cerrar" : "+ Agregar doc"}</Btn>
      </div>
      {docs.length === 0 && !open && <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "8px 0" }}>Sin documentos registrados</div>}
      {docs.map((d, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1E293B" }}>
          <div style={{ flex: 1 }}>
            <span style={{ color: "#F1F5F9", fontSize: 12, fontWeight: 600 }}>{d.nombre}</span>
            <div style={{ display: "flex", gap: 6, marginTop: 3, flexWrap: "wrap" }}>
              <Badge label={d.tipo} color="#60A5FA" />
              <Badge label={d.estado} color={docColor[d.estado] || "#94A3B8"} />
              {d.fecha && <span style={{ color: "#475569", fontSize: 11 }}>{d.fecha}</span>}
            </div>
          </div>
          {onRemove && <button onClick={() => onRemove(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: 14, marginLeft: 8 }}>✕</button>}
        </div>
      ))}
      {open && (
        <div style={{ marginTop: 12, background: "#1E293B", borderRadius: 8, padding: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <SelectField label="Tipo" options={TIPOS_DOC} value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} />
            <SelectField label="Estado" options={ESTADOS_DOC} value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} />
          </div>
          <InputField label="Nombre / Código" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: PET-001 Montaje..." />
          <InputField label="Fecha" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="ghost" onClick={() => setOpen(false)}>Cancelar</Btn>
            <Btn variant="success" onClick={() => { if (form.nombre) { onAdd({ ...form, id: Date.now() }); setForm({ tipo: TIPOS_DOC[0], nombre: "", estado: "Aprobado", fecha: "" }); setOpen(false); } }}>✓ Guardar</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PHASE 1: PROJECT CARD ────────────────────────────────────────────────────
function ProjectCard({ project, onEdit, onSelect }) {
  const desviacion = project.avanceReal - project.avanceProgramado;
  const alerta = desviacion <= -5;
  return (
    <div style={{ background: "#0F172A", border: `1px solid ${alerta ? "#EF444455" : "#1E293B"}`, borderRadius: 12, padding: 20, transition: "transform 0.2s", boxShadow: alerta ? "0 0 20px #EF444420" : "none" }}
      onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
      onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Syne', sans-serif", marginBottom: 3 }}>{project.nombre}</div>
          <div style={{ fontSize: 12, color: "#64748B" }}>{project.descripcion}</div>
        </div>
        <span style={{ background: project.estado === "En curso" ? "#10B98120" : "#F59E0B20", color: project.estado === "En curso" ? "#10B981" : "#F59E0B", border: `1px solid ${project.estado === "En curso" ? "#10B98140" : "#F59E0B40"}`, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>{project.estado}</span>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
        {project.disciplinas.map(d => <Badge key={d} label={d} color={disciplinaColor[d]} />)}
      </div>
      <ProgressBar programado={project.avanceProgramado} real={project.avanceReal} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 11, color: "#475569" }}>
        <span>📅 {project.fechaInicio} → {project.fechaFin}</span>
        <span>🏢 {project.ssee.length} SSEE</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Btn onClick={() => onSelect(project)}>📋 Registro</Btn>
        <Btn variant="primary" onClick={() => onEdit(project)}>✏ Editar</Btn>
      </div>
    </div>
  );
}

// ─── PHASE 1: PROJECT FORM ────────────────────────────────────────────────────
function ProjectForm({ initial, onSave, onCancel }) {
  const empty = { nombre: "", descripcion: "", disciplinas: [], estado: "En curso", fechaInicio: "", fechaFin: "", ssee: [], avanceProgramado: 0, avanceReal: 0, documentosProyecto: [], semanas: [] };
  const [form, setForm] = useState(initial ? { ...initial } : empty);
  const [sseeForm, setSseeForm] = useState({ nombre: "", oc: "", disciplina: DISCIPLINAS[0] });

  const toggleDisc = d => setForm(f => ({ ...f, disciplinas: f.disciplinas.includes(d) ? f.disciplinas.filter(x => x !== d) : [...f.disciplinas, d] }));
  const addSsee = () => { if (!sseeForm.nombre || !sseeForm.oc) return; setForm(f => ({ ...f, ssee: [...f.ssee, { ...sseeForm }] })); setSseeForm({ nombre: "", oc: "", disciplina: DISCIPLINAS[0] }); };
  const removeSsee = i => setForm(f => ({ ...f, ssee: f.ssee.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <InputField label="NOMBRE DEL PROYECTO" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Subestación Norte" />
      <InputField label="DESCRIPCIÓN" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
      <div style={{ marginBottom: 14 }}>
        <SectionTitle>Disciplinas</SectionTitle>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DISCIPLINAS.map(d => (
            <button key={d} onClick={() => toggleDisc(d)} style={{ padding: "6px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: "pointer", background: form.disciplinas.includes(d) ? disciplinaColor[d] + "30" : "#1E293B", border: `1px solid ${form.disciplinas.includes(d) ? disciplinaColor[d] : "#334155"}`, color: form.disciplinas.includes(d) ? disciplinaColor[d] : "#64748B" }}>{d}</button>
          ))}
        </div>
      </div>
      <SelectField label="ESTADO" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} options={ESTADOS_PROYECTO} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InputField label="FECHA INICIO" type="date" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
        <InputField label="FECHA FIN" type="date" value={form.fechaFin} onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))} />
        <InputField label="AVANCE PROGRAMADO (%)" type="number" min={0} max={100} value={form.avanceProgramado} onChange={e => setForm(f => ({ ...f, avanceProgramado: +e.target.value }))} />
        <InputField label="AVANCE REAL (%)" type="number" min={0} max={100} value={form.avanceReal} onChange={e => setForm(f => ({ ...f, avanceReal: +e.target.value }))} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <SectionTitle>Subcontratas (SSEE)</SectionTitle>
        {form.ssee.map((s, i) => (
          <div key={i} style={{ background: "#1E293B", borderRadius: 7, padding: "8px 12px", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>{s.nombre}</span>
              <span style={{ color: "#64748B", fontSize: 11 }}>{s.oc}</span>
              <Badge label={s.disciplina} color={disciplinaColor[s.disciplina]} />
            </div>
            <button onClick={() => removeSsee(i)} style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>✕</button>
          </div>
        ))}
        <div style={{ background: "#0A1220", border: "1px dashed #334155", borderRadius: 8, padding: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input placeholder="Nombre SSEE" value={sseeForm.nombre} onChange={e => setSseeForm(f => ({ ...f, nombre: e.target.value }))} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 6, padding: "8px 10px", color: "#F1F5F9", fontSize: 12, outline: "none" }} />
            <input placeholder="N° OC / Contrato" value={sseeForm.oc} onChange={e => setSseeForm(f => ({ ...f, oc: e.target.value }))} style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 6, padding: "8px 10px", color: "#F1F5F9", fontSize: 12, outline: "none" }} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <select value={sseeForm.disciplina} onChange={e => setSseeForm(f => ({ ...f, disciplina: e.target.value }))} style={{ flex: 1, background: "#1E293B", border: "1px solid #334155", borderRadius: 6, padding: "8px 10px", color: "#F1F5F9", fontSize: 12, outline: "none" }}>
              {DISCIPLINAS.map(d => <option key={d}>{d}</option>)}
            </select>
            <Btn variant="success" onClick={addSsee}>+ Agregar</Btn>
          </div>
        </div>
      </div>
      <DocumentList
        title="Documentos del Proyecto (FR043, etc.)"
        docs={form.documentosProyecto || []}
        onAdd={doc => setForm(f => ({ ...f, documentosProyecto: [...(f.documentosProyecto || []), doc] }))}
        onRemove={i => setForm(f => ({ ...f, documentosProyecto: f.documentosProyecto.filter((_, idx) => idx !== i) }))}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Btn onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => { if (form.nombre) onSave(form); }}>💾 Guardar Proyecto</Btn>
      </div>
    </div>
  );
}

// ─── PHASE 2: ACTIVITY FORM ───────────────────────────────────────────────────
function ActividadForm({ initial, disciplinas, onSave, onCancel }) {
  const empty = { nombre: "", disciplina: disciplinas[0] || DISCIPLINAS[0], fechaInicio: "", fechaFin: "", estado: "Pendiente", observaciones: "", documentos: [] };
  const [form, setForm] = useState(initial ? { ...initial } : empty);
  return (
    <div>
      <InputField label="NOMBRE DE LA ACTIVIDAD" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Montaje de tablero MCC-01" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <SelectField label="DISCIPLINA" value={form.disciplina} onChange={e => setForm(f => ({ ...f, disciplina: e.target.value }))} options={disciplinas.length ? disciplinas : DISCIPLINAS} />
        <SelectField label="ESTADO" value={form.estado} onChange={e => setForm(f => ({ ...f, estado: e.target.value }))} options={ESTADOS_ACT} />
        <InputField label="FECHA INICIO" type="date" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
        <InputField label="FECHA FIN" type="date" value={form.fechaFin} onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))} />
      </div>
      <TextareaField label="OBSERVACIONES DE CAMPO" value={form.observaciones} onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} placeholder="Problemas encontrados, consultas del SSEE, acuerdos, etc." />
      <DocumentList
        title="Documentos de la Actividad"
        docs={form.documentos}
        onAdd={doc => setForm(f => ({ ...f, documentos: [...f.documentos, doc] }))}
        onRemove={i => setForm(f => ({ ...f, documentos: f.documentos.filter((_, idx) => idx !== i) }))}
      />
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => { if (form.nombre) onSave(form); }}>💾 Guardar Actividad</Btn>
      </div>
    </div>
  );
}

// ─── PHASE 2: ON CALL FORM ────────────────────────────────────────────────────
function OnCallForm({ initial, onSave, onCancel }) {
  const empty = { actividad: "", fecha: "", turno: "Día", empleados: 1, responsable: "", cumplimiento: 0 };
  const [form, setForm] = useState(initial ? { ...initial } : empty);
  return (
    <div>
      <InputField label="ACTIVIDAD ON CALL" value={form.actividad} onChange={e => setForm(f => ({ ...f, actividad: e.target.value }))} placeholder="Ej: Tendido de cable 25mm²" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InputField label="FECHA" type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} />
        <SelectField label="TURNO" value={form.turno} onChange={e => setForm(f => ({ ...f, turno: e.target.value }))} options={TURNOS} />
        <InputField label="N° EMPLEADOS" type="number" min={1} value={form.empleados} onChange={e => setForm(f => ({ ...f, empleados: +e.target.value }))} />
        <InputField label="% CUMPLIMIENTO" type="number" min={0} max={100} value={form.cumplimiento} onChange={e => setForm(f => ({ ...f, cumplimiento: +e.target.value }))} />
      </div>
      <InputField label="RESPONSABLE" value={form.responsable} onChange={e => setForm(f => ({ ...f, responsable: e.target.value }))} placeholder="Ing. Nombre Apellido" />
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => { if (form.actividad) onSave(form); }}>💾 Guardar On Call</Btn>
      </div>
    </div>
  );
}

// ─── PHASE 2: SEMANA FORM ─────────────────────────────────────────────────────
function SemanaForm({ initial, onSave, onCancel }) {
  const empty = { semana: "", fechaInicio: "", fechaFin: "", actividades: [], onCall: [] };
  const [form, setForm] = useState(initial ? { ...initial } : empty);
  return (
    <div>
      <InputField label="SEMANA" value={form.semana} onChange={e => setForm(f => ({ ...f, semana: e.target.value }))} placeholder="Ej: S21 - 2026" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <InputField label="FECHA INICIO" type="date" value={form.fechaInicio} onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
        <InputField label="FECHA FIN" type="date" value={form.fechaFin} onChange={e => setForm(f => ({ ...f, fechaFin: e.target.value }))} />
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <Btn onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" onClick={() => { if (form.semana) onSave({ ...form, id: Date.now(), actividades: form.actividades || [], onCall: form.onCall || [] }); }}>💾 Crear Semana</Btn>
      </div>
    </div>
  );
}

// ─── PHASE 2: REGISTRO SEMANAL VIEW ──────────────────────────────────────────
function RegistroSemanal({ project, onBack, onUpdate }) {
  const [semanaActiva, setSemanaActiva] = useState(project.semanas[0]?.id || null);
  const [modal, setModal] = useState(null);
  const [editTarget, setEditTarget] = useState(null);
  const [actTab, setActTab] = useState("actividades");

  const semana = project.semanas.find(s => s.id === semanaActiva);

  const updateProject = (updater) => onUpdate(p => ({ ...p, semanas: updater(p.semanas) }));

  const addSemana = (data) => {
    updateProject(semanas => [...semanas, data]);
    setSemanaActiva(data.id);
    setModal(null);
  };

  const addActividad = (data) => {
    updateProject(semanas => semanas.map(s => s.id === semanaActiva ? { ...s, actividades: [...s.actividades, { ...data, id: Date.now() }] } : s));
    setModal(null);
  };

  const editActividad = (data) => {
    updateProject(semanas => semanas.map(s => s.id === semanaActiva ? { ...s, actividades: s.actividades.map(a => a.id === editTarget.id ? { ...data, id: editTarget.id } : a) } : s));
    setModal(null); setEditTarget(null);
  };

  const removeActividad = (id) => {
    updateProject(semanas => semanas.map(s => s.id === semanaActiva ? { ...s, actividades: s.actividades.filter(a => a.id !== id) } : s));
  };

  const addOnCall = (data) => {
    updateProject(semanas => semanas.map(s => s.id === semanaActiva ? { ...s, onCall: [...s.onCall, { ...data, id: Date.now() }] } : s));
    setModal(null);
  };

  const editOnCall = (data) => {
    updateProject(semanas => semanas.map(s => s.id === semanaActiva ? { ...s, onCall: s.onCall.map(o => o.id === editTarget.id ? { ...data, id: editTarget.id } : o) } : s));
    setModal(null); setEditTarget(null);
  };

  const removeOnCall = (id) => {
    updateProject(semanas => semanas.map(s => s.id === semanaActiva ? { ...s, onCall: s.onCall.filter(o => o.id !== id) } : s));
  };

  const docEstadoStyle = (estado) => ({ background: (docColor[estado] || "#94A3B8") + "22", color: docColor[estado] || "#94A3B8", border: `1px solid ${(docColor[estado] || "#94A3B8")}44`, borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700, fontFamily: "monospace" });

  return (
    <div style={{ minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', sans-serif", color: "#F1F5F9" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid #1E293B", padding: "16px 24px", display: "flex", alignItems: "center", gap: 14 }}>
        <button onClick={onBack} style={{ background: "#1E293B", border: "1px solid #334155", color: "#94A3B8", borderRadius: 7, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>← Proyectos</button>
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'Syne', sans-serif", color: "#F1F5F9" }}>{project.nombre}</div>
          <div style={{ fontSize: 11, color: "#475569", marginTop: 1 }}>REGISTRO SEMANAL</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <ProgressBar programado={project.avanceProgramado} real={project.avanceReal} />
        </div>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 65px)" }}>
        {/* Sidebar semanas */}
        <div style={{ width: 200, borderRight: "1px solid #1E293B", padding: 16, overflowY: "auto", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <SectionTitle>Semanas</SectionTitle>
          </div>
          {project.semanas.map(s => (
            <div key={s.id} onClick={() => setSemanaActiva(s.id)} style={{ padding: "10px 12px", borderRadius: 8, marginBottom: 6, cursor: "pointer", background: semanaActiva === s.id ? "#1E40AF20" : "#0F172A", border: `1px solid ${semanaActiva === s.id ? "#3B82F660" : "#1E293B"}`, transition: "all 0.15s" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: semanaActiva === s.id ? "#60A5FA" : "#CBD5E1" }}>{s.semana}</div>
              <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{s.fechaInicio} → {s.fechaFin}</div>
              <div style={{ fontSize: 10, color: "#334155", marginTop: 3 }}>{s.actividades.length} act · {s.onCall.length} on call</div>
            </div>
          ))}
          <button onClick={() => setModal("semana")} style={{ width: "100%", background: "#0F172A", border: "1px dashed #334155", color: "#475569", borderRadius: 8, padding: "8px 0", fontSize: 12, cursor: "pointer", marginTop: 4 }}>+ Nueva semana</button>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!semana ? (
            <div style={{ textAlign: "center", color: "#334155", padding: 80 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 14 }}>Selecciona o crea una semana para comenzar</div>
            </div>
          ) : (
            <>
              {/* Docs del proyecto */}
              <DocumentList
                title="📁 Documentos del Proyecto"
                docs={project.documentosProyecto || []}
                onAdd={doc => onUpdate(p => ({ ...p, documentosProyecto: [...(p.documentosProyecto || []), doc] }))}
                onRemove={i => onUpdate(p => ({ ...p, documentosProyecto: p.documentosProyecto.filter((_, idx) => idx !== i) }))}
              />

              {/* Tabs */}
              <div style={{ display: "flex", gap: 0, marginBottom: 20, borderBottom: "1px solid #1E293B" }}>
                {[["actividades", "📋 Look Ahead / Actividades"], ["oncall", "📞 On Call"]].map(([key, label]) => (
                  <div key={key} onClick={() => setActTab(key)} style={{ padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: actTab === key ? "#60A5FA" : "#475569", borderBottom: actTab === key ? "2px solid #60A5FA" : "2px solid transparent" }}>{label}</div>
                ))}
              </div>

              {/* ACTIVIDADES TAB */}
              {actTab === "actividades" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, color: "#94A3B8" }}>{semana.actividades.length} actividades · semana <b style={{ color: "#F1F5F9" }}>{semana.semana}</b></div>
                    <Btn variant="primary" onClick={() => { setEditTarget(null); setModal("actividad"); }}>+ Actividad</Btn>
                  </div>
                  {semana.actividades.length === 0 && (
                    <div style={{ textAlign: "center", color: "#334155", padding: 40, border: "1px dashed #1E293B", borderRadius: 10 }}>Sin actividades registradas esta semana</div>
                  )}
                  {semana.actividades.map(act => (
                    <div key={act.id} style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>{act.nombre}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <Badge label={act.disciplina} color={disciplinaColor[act.disciplina] || "#60A5FA"} />
                            <span style={{ ...docEstadoStyle(null), background: (actColor[act.estado] || "#94A3B8") + "22", color: actColor[act.estado] || "#94A3B8", border: `1px solid ${(actColor[act.estado] || "#94A3B8")}44` }}>{act.estado}</span>
                            <span style={{ color: "#475569", fontSize: 11 }}>📅 {act.fechaInicio} → {act.fechaFin}</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                          <Btn small onClick={() => { setEditTarget(act); setModal("actividad"); }}>✏</Btn>
                          <Btn small variant="danger" onClick={() => removeActividad(act.id)}>✕</Btn>
                        </div>
                      </div>
                      {act.observaciones && (
                        <div style={{ background: "#F59E0B10", border: "1px solid #F59E0B30", borderRadius: 7, padding: "8px 12px", fontSize: 12, color: "#FCD34D", marginBottom: 10 }}>
                          ⚠ <b>Obs:</b> {act.observaciones}
                        </div>
                      )}
                      {act.documentos.length > 0 && (
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {act.documentos.map((d, i) => (
                            <div key={i} style={{ background: "#1E293B", borderRadius: 6, padding: "4px 10px", fontSize: 11 }}>
                              <span style={{ color: "#60A5FA", fontWeight: 700 }}>{d.tipo}</span>
                              <span style={{ color: "#64748B", marginLeft: 4 }}>{d.nombre}</span>
                              <span style={{ marginLeft: 6, ...docEstadoStyle(d.estado) }}>{d.estado}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* ON CALL TAB */}
              {actTab === "oncall" && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 14, color: "#94A3B8" }}>{semana.onCall.length} actividades on call</div>
                    <Btn variant="primary" onClick={() => { setEditTarget(null); setModal("oncall"); }}>+ On Call</Btn>
                  </div>
                  {semana.onCall.length === 0 && (
                    <div style={{ textAlign: "center", color: "#334155", padding: 40, border: "1px dashed #1E293B", borderRadius: 10 }}>Sin actividades on call esta semana</div>
                  )}
                  {semana.onCall.map(oc => {
                    const cumColor = oc.cumplimiento >= 80 ? "#10B981" : oc.cumplimiento >= 50 ? "#F59E0B" : "#EF4444";
                    return (
                      <div key={oc.id} style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 10, padding: 16, marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>{oc.actividad}</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px,1fr))", gap: 8 }}>
                              <div style={{ background: "#1E293B", borderRadius: 7, padding: "6px 10px" }}><div style={{ fontSize: 10, color: "#64748B" }}>FECHA</div><div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>{oc.fecha}</div></div>
                              <div style={{ background: "#1E293B", borderRadius: 7, padding: "6px 10px" }}><div style={{ fontSize: 10, color: "#64748B" }}>TURNO</div><div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>{oc.turno}</div></div>
                              <div style={{ background: "#1E293B", borderRadius: 7, padding: "6px 10px" }}><div style={{ fontSize: 10, color: "#64748B" }}>EMPLEADOS</div><div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>{oc.empleados} personas</div></div>
                              <div style={{ background: "#1E293B", borderRadius: 7, padding: "6px 10px" }}><div style={{ fontSize: 10, color: "#64748B" }}>RESPONSABLE</div><div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>{oc.responsable}</div></div>
                            </div>
                            <div style={{ marginTop: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                                <span style={{ color: "#64748B" }}>Cumplimiento</span>
                                <span style={{ color: cumColor, fontWeight: 700 }}>{oc.cumplimiento}%</span>
                              </div>
                              <div style={{ background: "#1E293B", borderRadius: 4, height: 6 }}>
                                <div style={{ width: `${oc.cumplimiento}%`, background: cumColor, height: "100%", borderRadius: 4, transition: "width 0.4s" }} />
                              </div>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 6, marginLeft: 12 }}>
                            <Btn small onClick={() => { setEditTarget(oc); setModal("oncall"); }}>✏</Btn>
                            <Btn small variant="danger" onClick={() => removeOnCall(oc.id)}>✕</Btn>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {modal === "semana" && <Modal title="Nueva Semana" onClose={() => setModal(null)}><SemanaForm onSave={addSemana} onCancel={() => setModal(null)} /></Modal>}
      {modal === "actividad" && <Modal wide title={editTarget ? "Editar Actividad" : "Nueva Actividad"} onClose={() => { setModal(null); setEditTarget(null); }}>
        <ActividadForm initial={editTarget} disciplinas={project.disciplinas} onSave={editTarget ? editActividad : addActividad} onCancel={() => { setModal(null); setEditTarget(null); }} />
      </Modal>}
      {modal === "oncall" && <Modal title={editTarget ? "Editar On Call" : "Nueva On Call"} onClose={() => { setModal(null); setEditTarget(null); }}>
        <OnCallForm initial={editTarget} onSave={editTarget ? editOnCall : addOnCall} onCancel={() => { setModal(null); setEditTarget(null); }} />
      </Modal>}
    </div>
  );
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function getSemaforo(project) {
  const d = project.avanceReal - project.avanceProgramado;
  if (d >= 0) return { color: "#10B981", label: "Al día", emoji: "🟢" };
  if (d > -5) return { color: "#F59E0B", label: "Leve desvío", emoji: "🟡" };
  return { color: "#EF4444", label: "Desvío crítico", emoji: "🔴" };
}

function getCriticas(project) {
  const today = new Date().toISOString().slice(0, 10);
  const criticas = [];
  project.semanas.forEach(s => {
    s.actividades.forEach(a => {
      const bloqueada = a.estado === "Bloqueada";
      const vencida = a.fechaFin && a.fechaFin < today && a.estado !== "Completada";
      const docPendiente = a.documentos.some(d => d.estado !== "Aprobado");
      if (bloqueada || vencida || docPendiente) {
        criticas.push({
          ...a,
          proyectoNombre: project.nombre,
          proyectoId: project.id,
          semana: s.semana,
          razon: [bloqueada && "Bloqueada", vencida && "Fecha vencida", docPendiente && "Doc. sin aprobar"].filter(Boolean).join(", "),
        });
      }
    });
  });
  return criticas;
}

// ─── PHASE 3: DASHBOARD ───────────────────────────────────────────────────────
function Dashboard({ projects, onGoToProject }) {
  const [detailProject, setDetailProject] = useState(null);

  const enCurso = projects.filter(p => p.estado === "En curso");
  const avancePromedio = enCurso.length ? Math.round(enCurso.reduce((a, p) => a + p.avanceReal, 0) / enCurso.length) : 0;
  const conDesvio = projects.filter(p => p.avanceReal - p.avanceProgramado <= -5).length;
  const todasCriticas = projects.flatMap(p => getCriticas(p));
  const verde = projects.filter(p => getSemaforo(p).color === "#10B981").length;
  const amarillo = projects.filter(p => getSemaforo(p).color === "#F59E0B").length;
  const rojo = projects.filter(p => getSemaforo(p).color === "#EF4444").length;

  const KpiCard = ({ label, value, sub, color, icon }) => (
    <div style={{ background: "#0F172A", border: `1px solid ${color}33`, borderRadius: 14, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: color, borderRadius: "14px 14px 0 0" }} />
      <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 900, color, fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600, marginTop: 6 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: "28px" }}>
      {/* KPI Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 14, marginBottom: 28 }}>
        <KpiCard icon="📈" label="Avance Promedio" value={`${avancePromedio}%`} sub={`${enCurso.length} proyectos en curso`} color="#60A5FA" />
        <KpiCard icon="⚠️" label="Con Desvío Crítico" value={conDesvio} sub="Desvío ≥ 5% sobre programado" color="#EF4444" />
        <KpiCard icon="🚨" label="Actividades Críticas" value={todasCriticas.length} sub="Bloqueadas, vencidas o sin docs" color="#F59E0B" />
        <div style={{ background: "#0F172A", border: "1px solid #10B98133", borderRadius: 14, padding: "20px 24px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "#10B981", borderRadius: "14px 14px 0 0" }} />
          <div style={{ fontSize: 28, marginBottom: 8 }}>🚦</div>
          <div style={{ fontSize: 12, color: "#94A3B8", fontWeight: 700, marginBottom: 10, letterSpacing: 0.5 }}>SEMÁFORO CARTERA</div>
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: "#10B981", fontFamily: "'Syne', sans-serif" }}>{verde}</div><div style={{ fontSize: 10, color: "#64748B" }}>🟢 Al día</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: "#F59E0B", fontFamily: "'Syne', sans-serif" }}>{amarillo}</div><div style={{ fontSize: 10, color: "#64748B" }}>🟡 Leve</div></div>
            <div style={{ textAlign: "center" }}><div style={{ fontSize: 22, fontWeight: 900, color: "#EF4444", fontFamily: "'Syne', sans-serif" }}>{rojo}</div><div style={{ fontSize: 10, color: "#64748B" }}>🔴 Crítico</div></div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
        {/* Project semaforo table */}
        <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Syne', sans-serif" }}>Estado por Proyecto</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{projects.length} proyectos</div>
          </div>
          {projects.map((p, i) => {
            const sem = getSemaforo(p);
            const desv = p.avanceReal - p.avanceProgramado;
            return (
              <div key={p.id} onClick={() => setDetailProject(detailProject?.id === p.id ? null : p)}
                style={{ padding: "14px 20px", borderBottom: i < projects.length - 1 ? "1px solid #0F1929" : "none", cursor: "pointer", background: detailProject?.id === p.id ? "#1E293B" : "transparent", transition: "background 0.15s" }}
                onMouseEnter={e => { if (detailProject?.id !== p.id) e.currentTarget.style.background = "#0A1220"; }}
                onMouseLeave={e => { if (detailProject?.id !== p.id) e.currentTarget.style.background = "transparent"; }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{sem.emoji}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{p.nombre}</span>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: sem.color, fontWeight: 700 }}>{desv > 0 ? "+" : ""}{desv}%</span>
                    <button onClick={e => { e.stopPropagation(); onGoToProject(p); }} style={{ background: "#1E293B", border: "1px solid #334155", color: "#60A5FA", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600 }}>Ver →</button>
                  </div>
                </div>
                <div style={{ background: "#1E293B", borderRadius: 3, height: 5, position: "relative", overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(p.avanceProgramado, 100)}%`, background: "#334155", height: "100%", position: "absolute" }} />
                  <div style={{ width: `${Math.min(p.avanceReal, 100)}%`, background: sem.color, height: "100%", position: "absolute", transition: "width 0.4s" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#475569", marginTop: 4 }}>
                  <span>Prog: {p.avanceProgramado}%</span><span>Real: {p.avanceReal}%</span>
                </div>
                {/* Expanded detail */}
                {detailProject?.id === p.id && (
                  <div style={{ marginTop: 12, padding: "12px", background: "#0A1220", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, color: "#94A3B8", fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>DETALLE DEL PROYECTO</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                      <div style={{ background: "#1E293B", borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "#64748B" }}>SSEE</div>
                        {p.ssee.map((s, si) => <div key={si} style={{ fontSize: 11, color: "#CBD5E1", marginTop: 2 }}>{s.nombre} <span style={{ color: "#475569" }}>({s.disciplina})</span></div>)}
                      </div>
                      <div style={{ background: "#1E293B", borderRadius: 7, padding: "8px 10px" }}>
                        <div style={{ fontSize: 10, color: "#64748B" }}>FECHAS</div>
                        <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 2 }}>{p.fechaInicio}</div>
                        <div style={{ fontSize: 11, color: "#CBD5E1" }}>→ {p.fechaFin}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {p.disciplinas.map(d => <Badge key={d} label={d} color={disciplinaColor[d]} />)}
                    </div>
                    {getCriticas(p).length > 0 && (
                      <div style={{ marginTop: 8, background: "#EF444410", border: "1px solid #EF444430", borderRadius: 7, padding: "6px 10px" }}>
                        <span style={{ color: "#EF4444", fontSize: 11, fontWeight: 700 }}>⚠ {getCriticas(p).length} actividad(es) crítica(s)</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Critical activities */}
        <div style={{ background: "#0F172A", border: "1px solid #1E293B", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E293B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", fontFamily: "'Syne', sans-serif" }}>Actividades Críticas Pendientes</div>
            {todasCriticas.length > 0 && <span style={{ background: "#EF444420", color: "#EF4444", border: "1px solid #EF444440", borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>{todasCriticas.length}</span>}
          </div>
          {todasCriticas.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✅</div>
              <div style={{ fontSize: 13, color: "#10B981", fontWeight: 600 }}>Sin actividades críticas</div>
              <div style={{ fontSize: 11, color: "#475569", marginTop: 4 }}>Todo en orden</div>
            </div>
          ) : (
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              {todasCriticas.map((a, i) => (
                <div key={i} style={{ padding: "12px 20px", borderBottom: "1px solid #0F1929" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 5 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9" }}>{a.nombre}</div>
                      <div style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>{a.proyectoNombre} · {a.semana}</div>
                    </div>
                    <button onClick={() => onGoToProject({ id: a.proyectoId })} style={{ background: "#1E293B", border: "1px solid #334155", color: "#60A5FA", borderRadius: 5, padding: "3px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600, marginLeft: 8 }}>Ver →</button>
                  </div>
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                    {a.razon.split(", ").map((r, ri) => (
                      <span key={ri} style={{ background: "#EF444415", color: "#EF4444", border: "1px solid #EF444430", borderRadius: 4, padding: "2px 7px", fontSize: 10, fontWeight: 700 }}>⚠ {r}</span>
                    ))}
                    {a.fechaFin && <span style={{ color: "#475569", fontSize: 10, alignSelf: "center" }}>Vence: {a.fechaFin}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [projects, setProjects] = useState(initialProjects);
  const [view, setView] = useState("projects"); // 'projects' | 'registro' | 'dashboard'
  const [activeProject, setActiveProject] = useState(null);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterDisc, setFilterDisc] = useState("Todos");

  const filtered = projects.filter(p => {
    const matchSearch = p.nombre.toLowerCase().includes(search.toLowerCase());
    const matchDisc = filterDisc === "Todos" || p.disciplinas.includes(filterDisc);
    return matchSearch && matchDisc;
  });

  const alertas = projects.filter(p => p.avanceReal - p.avanceProgramado <= -5).length;
  const enCurso = projects.filter(p => p.estado === "En curso").length;

  const handleSave = (form) => {
    if (modal === "new") {
      setProjects(p => [...p, { ...form, id: Date.now() }]);
    } else {
      setProjects(p => p.map(x => x.id === selected.id ? { ...form, id: selected.id } : x));
    }
    setModal(null); setSelected(null);
  };

  const openRegistro = (proj) => {
    const live = projects.find(p => p.id === proj.id) || proj;
    setActiveProject(live);
    setView("registro");
  };

  const updateActiveProject = (updater) => {
    setProjects(ps => ps.map(p => p.id === activeProject.id ? updater(p) : p));
    setActiveProject(prev => updater(prev));
  };

  const FONT = <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet" />;

  if (view === "registro" && activeProject) {
    const liveProject = projects.find(p => p.id === activeProject.id) || activeProject;
    return <>{FONT}<RegistroSemanal project={liveProject} onBack={() => setView("projects")} onUpdate={updateActiveProject} /></>;
  }

  const TABS = ["Proyectos", "Dashboard KPIs"];

  return (
    <>
      {FONT}
      <div style={{ minHeight: "100vh", background: "#020817", fontFamily: "'DM Sans', sans-serif", color: "#F1F5F9" }}>
        {/* Header */}
        <div style={{ borderBottom: "1px solid #1E293B", padding: "18px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Syne', sans-serif", letterSpacing: -0.5 }}>
              <span style={{ color: "#60A5FA" }}>SUPER</span><span style={{ color: "#F1F5F9" }}>VISIÓN</span>
            </div>
            <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1.5, marginTop: 2 }}>GESTIÓN DE PROYECTOS ELECTROMECÁNICOS</div>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {alertas > 0 && <div style={{ background: "#EF444415", border: "1px solid #EF444440", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#EF4444", fontWeight: 700 }}>⚠ {alertas} desvío{alertas > 1 ? "s" : ""} crítico{alertas > 1 ? "s" : ""}</div>}
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#94A3B8" }}>{enCurso} en curso · {projects.length} total</div>
          </div>
        </div>

        {/* Nav */}
        <div style={{ borderBottom: "1px solid #1E293B", padding: "0 28px", display: "flex" }}>
          {TABS.map((tab, i) => {
            const active = (i === 0 && view === "projects") || (i === 1 && view === "dashboard");
            return (
              <div key={tab} onClick={() => setView(i === 0 ? "projects" : "dashboard")}
                style={{ padding: "14px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: active ? "#60A5FA" : "#475569", borderBottom: active ? "2px solid #60A5FA" : "2px solid transparent", transition: "color 0.15s" }}>
                {tab}
              </div>
            );
          })}
        </div>

        {/* DASHBOARD VIEW */}
        {view === "dashboard" && (
          <Dashboard projects={projects} onGoToProject={openRegistro} />
        )}

        {/* PROJECTS VIEW */}
        {view === "projects" && (
          <div style={{ padding: "24px 28px" }}>
            <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
              <input placeholder="🔍 Buscar proyecto..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1, minWidth: 200, background: "#0F172A", border: "1px solid #1E293B", borderRadius: 8, padding: "10px 14px", color: "#F1F5F9", fontSize: 13, outline: "none" }} />
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["Todos", ...DISCIPLINAS].map(d => (
                  <button key={d} onClick={() => setFilterDisc(d)} style={{ padding: "8px 14px", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", background: filterDisc === d ? "#1E40AF" : "#0F172A", border: `1px solid ${filterDisc === d ? "#3B82F6" : "#1E293B"}`, color: filterDisc === d ? "#fff" : "#64748B" }}>{d}</button>
                ))}
              </div>
              <button onClick={() => { setSelected(null); setModal("new"); }} style={{ background: "linear-gradient(135deg,#1E40AF,#7C3AED)", border: "none", color: "#fff", borderRadius: 8, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>+ Nuevo Proyecto</button>
            </div>
            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", color: "#334155", padding: 60, fontSize: 14 }}>No se encontraron proyectos</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px,1fr))", gap: 16 }}>
                {filtered.map(p => (
                  <ProjectCard key={p.id} project={p}
                    onEdit={(proj) => { setSelected(proj); setModal("edit"); }}
                    onSelect={openRegistro}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {(modal === "new" || modal === "edit") && (
          <Modal wide title={modal === "new" ? "Nuevo Proyecto" : "Editar Proyecto"} onClose={() => setModal(null)}>
            <ProjectForm initial={modal === "edit" ? selected : null} onSave={handleSave} onCancel={() => setModal(null)} />
          </Modal>
        )}
      </div>
    </>
  );
}
