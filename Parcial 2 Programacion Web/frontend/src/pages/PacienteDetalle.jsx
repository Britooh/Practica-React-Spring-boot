import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, edad, iniciales } from '../api';

const VACIO = { medico_id: '', motivo: '', presion: '', peso: '', temperatura: '',
  diagnostico: '', tratamiento: '', notas: '' };

export default function PacienteDetalle() {
  const { id } = useParams();
  const [paciente, setPaciente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');

  const cargar = () => {
    api.get(`/pacientes/${id}`).then(setPaciente).catch((e) => setError(e.message));
    api.get(`/historial?paciente_id=${id}`).then(setHistorial);
    api.get(`/recetas?paciente_id=${id}`).then(setRecetas);
  };

  useEffect(() => {
    cargar();
    api.get('/medicos?activos=1').then(setMedicos);
  }, [id]);

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/historial', { ...form, paciente_id: id });
      setForm(VACIO);
      cargar();
    } catch (err) { setError(err.message); }
  };

  if (!paciente) return <p className="card">{error || 'Cargando expediente...'}</p>;

  return (
    <>
      <div className="acciones no-print">
        <Link to="/pacientes" className="btn secundario btn-sm">← Volver a pacientes</Link>
        <Link to={`/recetas/nueva?paciente=${id}`} className="btn btn-sm">💊 Nueva receta directa</Link>
      </div>

      {error && <div className="error">⚠️ {error}</div>}

      {/* Cabecera tipo Expediente Clínico */}
      <section className="card expediente-header">
        <div className="expediente-persona">
          <div className="avatar avatar-lg">{iniciales(paciente.nombre, paciente.apellido)}</div>
          <div>
            <span className="eyebrow">Expediente Clínico #{paciente.id}</span>
            <h1>{paciente.nombre} {paciente.apellido}</h1>
            <div className="ficha-pills">
              <span className="ficha-item">🪪 <b>Cédula:</b> {paciente.cedula || '—'}</span>
              <span className="ficha-item">🎂 <b>Edad:</b> {edad(paciente.fecha_nacimiento)}</span>
              <span className="ficha-item">⚧ <b>Sexo:</b> {paciente.sexo}</span>
              <span className="ficha-item">🩸 <b>Sangre:</b> {paciente.tipo_sangre || '—'}</span>
              <span className="ficha-item">📞 <b>Tel:</b> {paciente.telefono || '—'}</span>
              {paciente.direccion && <span className="ficha-item">📍 {paciente.direccion}</span>}
            </div>
          </div>
        </div>

        <div className={`alergia-banner ${paciente.alergias ? 'con-alergia' : 'sin-alergia'}`}>
          <b>{paciente.alergias ? '⚠️ ALERGIAS REGISTRADAS' : '✅ SIN ALERGIAS CONOCIDAS'}</b>
          <span>{paciente.alergias || 'El paciente no reporta alergias medicamentosas.'}</span>
        </div>
      </section>

      <div className="workspace-split">
        <form className="card form-grid" onSubmit={guardar}>
          <div className="full card-header-inline">
            <h3>🩺 Registrar nueva consulta médica</h3>
          </div>
          <label>Médico tratante*
            <select name="medico_id" value={form.medico_id} onChange={cambiar} required>
              <option value="">-- Seleccione el médico --</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>Dr(a). {m.nombre} {m.apellido} ({m.especialidad})</option>
              ))}
            </select>
          </label>
          <label>Motivo de consulta
            <input name="motivo" placeholder="Ej. Dolor de cabeza, control..." value={form.motivo} onChange={cambiar} />
          </label>
          <label>❤️ Presión arterial
            <input name="presion" placeholder="120/80 mmHg" value={form.presion} onChange={cambiar} />
          </label>
          <label>⚖️ Peso (kg)
            <input type="number" step="0.01" name="peso" placeholder="70.5" value={form.peso} onChange={cambiar} />
          </label>
          <label>🌡️ Temperatura (°C)
            <input type="number" step="0.1" name="temperatura" placeholder="36.8" value={form.temperatura} onChange={cambiar} />
          </label>
          <label className="full">Diagnóstico médico*
            <textarea name="diagnostico" placeholder="Describa el diagnóstico clínico..." value={form.diagnostico} onChange={cambiar} required />
          </label>
          <label className="full">Plan de tratamiento
            <textarea name="tratamiento" placeholder="Indicaciones terapéuticas y seguimiento..." value={form.tratamiento} onChange={cambiar} />
          </label>
          <label className="full">Notas adicionales / Observaciones
            <textarea name="notas" placeholder="Antecedentes o hallazgos relevantes..." value={form.notas} onChange={cambiar} />
          </label>
          <div className="full acciones">
            <button type="submit">💾 Guardar consulta en el historial</button>
          </div>
        </form>

        <div>
          <section className="card">
            <h2>📋 Historial de Consultas ({historial.length})</h2>
            <div className="timeline">
              {historial.map((h) => (
                <article key={h.id} className="consulta-card">
                  <div className="consulta-header">
                    <span className="pill-hora">📅 {h.fecha.slice(0, 16)}</span>
                    <span className="medico-tag">🩺 Dr(a). {h.medico} · <em>{h.especialidad}</em></span>
                  </div>

                  {h.motivo && <p className="consulta-motivo"><b>Motivo:</b> {h.motivo}</p>}

                  <div className="signos-grid">
                    <div className="signo-box">
                      <span>❤️ Presión</span>
                      <b>{h.presion || '—'}</b>
                    </div>
                    <div className="signo-box">
                      <span>⚖️ Peso</span>
                      <b>{h.peso ? `${h.peso} kg` : '—'}</b>
                    </div>
                    <div className="signo-box">
                      <span>🌡️ Temperatura</span>
                      <b>{h.temperatura ? `${h.temperatura} °C` : '—'}</b>
                    </div>
                  </div>

                  <div className="consulta-bloque">
                    <b>Diagnóstico:</b>
                    <p>{h.diagnostico}</p>
                  </div>
                  {h.tratamiento && (
                    <div className="consulta-bloque">
                      <b>Tratamiento:</b>
                      <p>{h.tratamiento}</p>
                    </div>
                  )}
                  {h.notas && <p className="texto-suave"><b>Notas:</b> {h.notas}</p>}

                  <div className="acciones">
                    <Link
                      className="btn btn-sm"
                      to={`/recetas/nueva?paciente=${id}&medico=${h.medico_id}&historial=${h.id}`}
                    >
                      💊 Crear receta de esta consulta
                    </Link>
                  </div>
                </article>
              ))}
              {!historial.length && (
                <div className="empty-state">Este paciente aún no tiene consultas registradas.</div>
              )}
            </div>
          </section>

          <section className="card">
            <h2>💊 Recetas Emitidas al Paciente ({recetas.length})</h2>
            <div className="lista-recetas">
              {recetas.map((r) => (
                <div key={r.id} className="receta-item">
                  <div>
                    <b>Receta #{r.id} · {r.fecha.slice(0, 10)}</b>
                    <div className="texto-suave">
                      Dr(a). {r.medico} · {r.total_medicamentos} medicamento(s)
                    </div>
                  </div>
                  <Link className="btn btn-sm" to={`/recetas/${r.id}/imprimir`}>
                    🖨️ Ver / Imprimir
                  </Link>
                </div>
              ))}
              {!recetas.length && <div className="empty-state">Sin recetas emitidas todavía.</div>}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
