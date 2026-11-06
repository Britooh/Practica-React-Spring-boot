import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, hoy, iniciales } from '../api';

const VACIO = { paciente_id: '', medico_id: '', fecha: hoy(), hora: '09:00', motivo: '' };

export default function Citas() {
  const [citas, setCitas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState(hoy());
  const [error, setError] = useState('');

  const cargar = () =>
    api.get(`/citas${filtroFecha ? `?fecha=${filtroFecha}` : ''}`).then(setCitas).catch((e) => setError(e.message));

  useEffect(() => { cargar(); }, [filtroFecha]);
  useEffect(() => {
    api.get('/pacientes').then(setPacientes);
    api.get('/medicos?activos=1').then(setMedicos);
  }, []);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/citas', form);
      setForm({ ...VACIO, fecha: form.fecha });
      setFiltroFecha(form.fecha);
      setMostrarForm(false);
      cargar();
    } catch (err) { setError(err.message); }
  };

  const cambiarEstado = (id, estado) => api.patch(`/citas/${id}/estado`, { estado }).then(cargar);
  const eliminar = (id) => confirm('¿Eliminar la cita?') && api.del(`/citas/${id}`).then(cargar);

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">03 / AGENDA Y TURNOS</span>
          <h1>Cronograma de Citas Médicas</h1>
          <p className="subtitulo">Control de horarios por especialista con validación automática contra citas duplicadas.</p>
        </div>
        <div className="acciones">
          <span className="contador-pill">{citas.length} turno(s)</span>
          <button type="button" onClick={() => setMostrarForm(!mostrarForm)}>
            {mostrarForm ? '✕ Cerrar formulario' : '＋ Agendar nueva cita'}
          </button>
        </div>
      </header>

      {error && <div className="error">⚠️ {error}</div>}

      {mostrarForm && (
        <form className="card form-grid studio-drawer" onSubmit={guardar}>
          <div className="full card-header-inline">
            <h3>＋ Programar nuevo turno médico</h3>
            <button type="button" className="btn-sm secundario" onClick={() => setMostrarForm(false)}>✕ Cerrar</button>
          </div>
          <label>1. Paciente*
            <select name="paciente_id" value={form.paciente_id} onChange={cambiar} required>
              <option value="">-- Seleccione paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} ({p.cedula || 'S/C'})</option>
              ))}
            </select>
          </label>
          <label>2. Especialista*
            <select name="medico_id" value={form.medico_id} onChange={cambiar} required>
              <option value="">-- Seleccione especialista --</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>Dr(a). {m.nombre} {m.apellido} — {m.especialidad}</option>
              ))}
            </select>
          </label>
          <label>3. Fecha*
            <input type="date" name="fecha" value={form.fecha} onChange={cambiar} required />
          </label>
          <label>4. Hora*
            <input type="time" name="hora" value={form.hora} onChange={cambiar} required />
          </label>
          <label className="full">5. Motivo de consulta
            <input name="motivo" placeholder="Ej. Control cardiológico, chequeo general..." value={form.motivo} onChange={cambiar} />
          </label>
          <div className="full acciones">
            <button type="submit">Confirmar reserva de turno</button>
          </div>
        </form>
      )}

      <section className="card">
        <div className="filtros">
          <label>Fecha de agenda:
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} />
          </label>
          <button type="button" className="btn-sm secundario" onClick={() => setFiltroFecha(hoy())}>
            Hoy ({hoy()})
          </button>
          <button type="button" className="btn-sm secundario" onClick={() => setFiltroFecha('')}>
            Mostrar todas las fechas
          </button>
        </div>

        <div className="tickets-list">
          {citas.map((c) => (
            <div key={c.id} className="cita-ticket">
              <div className="ticket-hora">
                <span className="mono">{c.hora.slice(0, 5)}</span>
                <small>{c.fecha}</small>
              </div>

              <div className="ticket-body">
                <div className="celda-persona">
                  <span className="avatar">{iniciales(c.paciente)}</span>
                  <div>
                    <Link to={`/pacientes/${c.paciente_id}`} className="ticket-title">
                      <b>{c.paciente}</b>
                    </Link>
                    <div className="texto-suave">{c.motivo || 'Consulta general'}</div>
                  </div>
                </div>
              </div>

              <div className="ticket-doctor">
                <span className="pill-especialidad">{c.especialidad}</span>
                <div className="texto-suave">Dr(a). {c.medico}</div>
              </div>

              <div className="ticket-actions">
                <span className={`badge ${c.estado.toLowerCase()}`}>{c.estado}</span>
                {c.estado === 'Programada' && (
                  <>
                    <button className="btn-sm" onClick={() => cambiarEstado(c.id, 'Completada')}>
                      ✓ Completar
                    </button>
                    <button className="btn-sm secundario" onClick={() => cambiarEstado(c.id, 'Cancelada')}>
                      Cancelar
                    </button>
                  </>
                )}
                <button className="btn-sm peligro" onClick={() => eliminar(c.id)} title="Eliminar">✕</button>
              </div>
            </div>
          ))}
          {!citas.length && (
            <div className="empty-state">No hay citas registradas para este filtro.</div>
          )}
        </div>
      </section>
    </>
  );
}
