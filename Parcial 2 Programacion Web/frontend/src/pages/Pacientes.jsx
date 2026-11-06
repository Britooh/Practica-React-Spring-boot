import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, edad, iniciales, limpiarNulos } from '../api';

const VACIO = { cedula: '', nombre: '', apellido: '', fecha_nacimiento: '', sexo: 'M',
  telefono: '', email: '', direccion: '', tipo_sangre: '', alergias: '' };
const SANGRE = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [buscar, setBuscar] = useState('');
  const [error, setError] = useState('');

  const cargar = () =>
    api.get(`/pacientes?buscar=${encodeURIComponent(buscar)}`)
      .then(setPacientes)
      .catch((e) => setError(e.message));

  useEffect(() => { cargar(); }, [buscar]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const cancelar = () => { setForm(VACIO); setEditId(null); setMostrarForm(false); };

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/pacientes/${editId}`, form);
      else await api.post('/pacientes', form);
      cancelar();
      cargar();
    } catch (err) { setError(err.message); }
  };

  const editar = (p) => {
    setForm({ ...VACIO, ...limpiarNulos(p) });
    setEditId(p.id);
    setMostrarForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este paciente y todo su historial?')) return;
    try { await api.del(`/pacientes/${id}`); cargar(); }
    catch (err) { setError(err.message); }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">02 / EXPEDIENTES DE PACIENTES</span>
          <h1>Directorio Clínico de Pacientes</h1>
          <p className="subtitulo">Fichas individuales con grupo sanguíneo, alertas de alergias y acceso directo a la historia médica.</p>
        </div>
        <div className="acciones">
          <span className="contador-pill">{pacientes.length} registrados</span>
          <button type="button" onClick={() => { if (mostrarForm && !editId) cancelar(); else setMostrarForm(true); }}>
            {mostrarForm && !editId ? '✕ Cerrar formulario' : '＋ Nuevo paciente'}
          </button>
        </div>
      </header>

      {error && <div className="error">⚠️ {error}</div>}

      {mostrarForm && (
        <form className="card form-grid studio-drawer" onSubmit={guardar}>
          <div className="full card-header-inline">
            <h3>{editId ? '✏️ Editando ficha del paciente' : '＋ Alta de nuevo paciente'}</h3>
            <button type="button" className="btn-sm secundario" onClick={cancelar}>✕ Cerrar</button>
          </div>

          <label>Cédula / Documento
            <input name="cedula" placeholder="001-0000000-0" value={form.cedula} onChange={cambiar} />
          </label>
          <label>Nombre*
            <input name="nombre" placeholder="Ej. Juan" value={form.nombre} onChange={cambiar} required />
          </label>
          <label>Apellido*
            <input name="apellido" placeholder="Ej. Rodríguez" value={form.apellido} onChange={cambiar} required />
          </label>
          <label>Fecha de nacimiento
            <input type="date" name="fecha_nacimiento" value={form.fecha_nacimiento} onChange={cambiar} />
          </label>
          <label>Sexo
            <select name="sexo" value={form.sexo} onChange={cambiar}>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </label>
          <label>Grupo sanguíneo
            <select name="tipo_sangre" value={form.tipo_sangre} onChange={cambiar}>
              {SANGRE.map((t) => <option key={t} value={t}>{t || 'Sin especificar'}</option>)}
            </select>
          </label>
          <label>Teléfono
            <input name="telefono" placeholder="809-555-0000" value={form.telefono} onChange={cambiar} />
          </label>
          <label>Correo electrónico
            <input type="email" name="email" placeholder="paciente@correo.com" value={form.email} onChange={cambiar} />
          </label>
          <label className="full">Dirección de residencia
            <input name="direccion" placeholder="Calle, número y sector" value={form.direccion} onChange={cambiar} />
          </label>
          <label className="full">⚠️ Alergias medicamentosas o alimentarias (se mostrará en recetas)
            <textarea name="alergias" placeholder="Ej. Penicilina, AINEs, sulfas..." value={form.alergias} onChange={cambiar} />
          </label>
          <div className="full acciones">
            <button type="submit">{editId ? 'Guardar cambios' : 'Registrar paciente'}</button>
            <button type="button" className="secundario" onClick={cancelar}>Cancelar</button>
          </div>
        </form>
      )}

      <div className="search-box">
        <span className="search-ico">⌕</span>
        <input
          className="buscador"
          placeholder="Filtrar por nombre, apellido o número de cédula..."
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        {buscar && (
          <button type="button" className="btn-sm secundario" onClick={() => setBuscar('')}>Limpiar</button>
        )}
      </div>

      <div className="bento-grid">
        {pacientes.map((p) => (
          <article key={p.id} className="patient-card">
            <div className="patient-card-top">
              <div className="celda-persona">
                <span className="avatar avatar-lg">{iniciales(p.nombre, p.apellido)}</span>
                <div>
                  <span className="mono texto-suave">ID #{String(p.id).padStart(3, '0')} · {p.cedula || 'S/C'}</span>
                  <h3 className="patient-name">{p.nombre} {p.apellido}</h3>
                  <span className="texto-suave">{edad(p.fecha_nacimiento)} · Sexo {p.sexo}</span>
                </div>
              </div>
              {p.tipo_sangre && <span className="pill-sangre">{p.tipo_sangre}</span>}
            </div>

            <div className="patient-card-mid">
              {p.alergias ? (
                <div className="pill-alergia">⚠️ Alergia: <b>{p.alergias}</b></div>
              ) : (
                <div className="pill-ok">✓ Sin alergias reportadas</div>
              )}
              <div className="patient-meta">
                <span>📞 {p.telefono || 'Sin teléfono'}</span>
                {p.direccion && <span>📍 {p.direccion}</span>}
              </div>
            </div>

            <div className="patient-card-foot">
              <Link className="btn btn-sm" to={`/pacientes/${p.id}`}>
                Abrir expediente clínico →
              </Link>
              <div className="acciones">
                <button className="btn-sm secundario" onClick={() => editar(p)}>Editar</button>
                <button className="btn-sm peligro" onClick={() => eliminar(p.id)} title="Eliminar">✕</button>
              </div>
            </div>
          </article>
        ))}
        {!pacientes.length && (
          <div className="card empty-state full">No se encontraron pacientes con ese criterio.</div>
        )}
      </div>
    </>
  );
}
