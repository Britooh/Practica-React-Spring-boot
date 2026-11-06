import { useEffect, useState } from 'react';
import { api, iniciales, limpiarNulos } from '../api';

const VACIO = { nombre: '', apellido: '', especialidad: '', licencia: '', telefono: '', email: '', activo: 1 };

export default function Medicos() {
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [error, setError] = useState('');

  const cargar = () => api.get('/medicos').then(setMedicos).catch((e) => setError(e.message));
  useEffect(() => { cargar(); }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const cancelar = () => { setForm(VACIO); setEditId(null); setMostrarForm(false); };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/medicos/${editId}`, form);
      else await api.post('/medicos', form);
      cancelar();
      cargar();
    } catch (err) { setError(err.message); }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este médico?')) return;
    try { await api.del(`/medicos/${id}`); cargar(); }
    catch (err) { setError(err.message + '. Sugerencia: márquelo como inactivo.'); }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">04 / CUERPO FACULTATIVO</span>
          <h1>Especialistas y Personal Médico</h1>
          <p className="subtitulo">Credenciales profesionales, especialidades clínicas y disponibilidad para consulta.</p>
        </div>
        <div className="acciones">
          <span className="contador-pill">{medicos.length} especialistas</span>
          <button type="button" onClick={() => { if (mostrarForm && !editId) cancelar(); else setMostrarForm(true); }}>
            {mostrarForm && !editId ? '✕ Cerrar formulario' : '＋ Nuevo especialista'}
          </button>
        </div>
      </header>

      {error && <div className="error">⚠️ {error}</div>}

      {mostrarForm && (
        <form className="card form-grid studio-drawer" onSubmit={guardar}>
          <div className="full card-header-inline">
            <h3>{editId ? '✏️ Editar especialista' : '＋ Incorporar nuevo especialista'}</h3>
            <button type="button" className="btn-sm secundario" onClick={cancelar}>✕ Cerrar</button>
          </div>
          <label>Nombre*
            <input name="nombre" placeholder="Ej. Ana" value={form.nombre} onChange={cambiar} required />
          </label>
          <label>Apellido*
            <input name="apellido" placeholder="Ej. Martínez" value={form.apellido} onChange={cambiar} required />
          </label>
          <label>Especialidad médica*
            <input name="especialidad" placeholder="Ej. Pediatría, Cardiología..." value={form.especialidad} onChange={cambiar} required />
          </label>
          <label>N° Licencia / Exequátur
            <input name="licencia" placeholder="LIC-0000" value={form.licencia} onChange={cambiar} />
          </label>
          <label>Teléfono directo
            <input name="telefono" placeholder="809-555-0000" value={form.telefono} onChange={cambiar} />
          </label>
          <label>Correo institucional
            <input type="email" name="email" placeholder="medico@clinica.com" value={form.email} onChange={cambiar} />
          </label>
          <label className="full">Estado operativo
            <select name="activo" value={form.activo} onChange={cambiar}>
              <option value={1}>Activo — Disponible para agenda y recetas</option>
              <option value={0}>Inactivo — Fuera de turno</option>
            </select>
          </label>
          <div className="full acciones">
            <button type="submit">{editId ? 'Actualizar especialista' : 'Guardar especialista'}</button>
            <button type="button" className="secundario" onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="bento-grid">
        {medicos.map((m) => (
          <article key={m.id} className="patient-card">
            <div className="patient-card-top">
              <div className="celda-persona">
                <span className="avatar avatar-lg avatar-medico">{iniciales(m.nombre, m.apellido)}</span>
                <div>
                  <span className="pill-especialidad">{m.especialidad}</span>
                  <h3 className="patient-name">Dr(a). {m.nombre} {m.apellido}</h3>
                  <span className="mono texto-suave">Licencia: {m.licencia || '—'}</span>
                </div>
              </div>
              <span className={`badge ${m.activo ? 'completada' : 'cancelada'}`}>
                {m.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="patient-card-mid">
              <div className="patient-meta">
                <span>📞 {m.telefono || 'Sin teléfono'}</span>
                <span>✉️ {m.email || 'Sin correo'}</span>
              </div>
            </div>

            <div className="patient-card-foot">
              <button
                className="btn-sm secundario"
                onClick={() => {
                  setForm({ ...VACIO, ...limpiarNulos(m) });
                  setEditId(m.id);
                  setMostrarForm(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                Editar credenciales
              </button>
              <button className="btn-sm peligro" onClick={() => eliminar(m.id)} title="Eliminar">✕</button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
