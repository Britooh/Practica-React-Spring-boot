import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { api } from '../api';

const FILA = { medicamento: '', dosis: '', frecuencia: '', duracion: '' };

export default function NuevaReceta() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    paciente_id: params.get('paciente') || '',
    medico_id: params.get('medico') || '',
    historial_id: params.get('historial') || '',
    indicaciones: '',
  });
  const [meds, setMeds] = useState([{ ...FILA }]);

  useEffect(() => {
    api.get('/pacientes').then(setPacientes);
    api.get('/medicos?activos=1').then(setMedicos);
  }, []);

  const pacienteSeleccionado = pacientes.find((p) => String(p.id) === String(form.paciente_id));

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const cambiarMed = (i, campo, valor) =>
    setMeds(meds.map((m, idx) => (idx === i ? { ...m, [campo]: valor } : m)));
  const agregarFila = () => setMeds([...meds, { ...FILA }]);
  const quitarFila = (i) => setMeds(meds.filter((_, idx) => idx !== i));

  const guardar = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const medicamentos = meds.filter((m) => m.medicamento.trim());
      const { id } = await api.post('/recetas', { ...form, medicamentos });
      navigate(`/recetas/${id}/imprimir`);
    } catch (err) { setError(err.message); }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">💊 Nueva Prescripción</span>
          <h1>Emitir Receta Médica</h1>
          <p className="subtitulo">Selecciona el paciente y el médico, agrega los medicamentos con su dosis y genera la hoja imprimible.</p>
        </div>
        <Link to="/recetas" className="btn secundario">← Volver a recetas</Link>
      </header>

      {error && <div className="error">⚠️ {error}</div>}

      <form className="card" onSubmit={guardar}>
        <div className="form-grid">
          <label>1. Paciente*
            <select name="paciente_id" value={form.paciente_id} onChange={cambiar} required>
              <option value="">-- Seleccione el paciente --</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>{p.apellido}, {p.nombre} ({p.cedula || 'Sin cédula'})</option>
              ))}
            </select>
          </label>
          <label>2. Médico prescriptor*
            <select name="medico_id" value={form.medico_id} onChange={cambiar} required>
              <option value="">-- Seleccione el médico --</option>
              {medicos.map((m) => (
                <option key={m.id} value={m.id}>Dr(a). {m.nombre} {m.apellido} ({m.especialidad})</option>
              ))}
            </select>
          </label>
        </div>

        {pacienteSeleccionado?.alergias && (
          <div className="alergia-banner con-alergia" style={{ marginTop: '1rem' }}>
            <b>⚠️ ATENCIÓN — Paciente alérgico a:</b>
            <span>{pacienteSeleccionado.alergias}</span>
          </div>
        )}

        <div className="card-header" style={{ marginTop: '1.5rem' }}>
          <h3>3. Medicamentos recetados</h3>
          <button type="button" className="btn-sm secundario" onClick={agregarFila}>
            ➕ Agregar otro medicamento
          </button>
        </div>

        {meds.map((m, i) => (
          <div key={i} className="med-card">
            <div className="med-num">#{i + 1}</div>
            <label>Medicamento*
              <input placeholder="Ej. Amoxicilina / Paracetamol" value={m.medicamento} onChange={(e) => cambiarMed(i, 'medicamento', e.target.value)} required />
            </label>
            <label>Dosis
              <input placeholder="Ej. 500 mg / 1 tableta" value={m.dosis} onChange={(e) => cambiarMed(i, 'dosis', e.target.value)} />
            </label>
            <label>Frecuencia
              <input placeholder="Ej. Cada 8 horas" value={m.frecuencia} onChange={(e) => cambiarMed(i, 'frecuencia', e.target.value)} />
            </label>
            <label>Duración
              <input placeholder="Ej. Por 7 días" value={m.duracion} onChange={(e) => cambiarMed(i, 'duracion', e.target.value)} />
            </label>
            {meds.length > 1 && (
              <button type="button" className="btn-sm peligro" onClick={() => quitarFila(i)} title="Quitar fila">
                🗑️
              </button>
            )}
          </div>
        ))}

        <label className="bloque">4. Indicaciones generales y recomendaciones para el paciente
          <textarea
            name="indicaciones"
            placeholder="Ej. Tomar con las comidas, mantener hidratación, acudir a control en 7 días..."
            value={form.indicaciones}
            onChange={cambiar}
          />
        </label>

        <div className="acciones">
          <button type="submit">🖨️ Guardar receta y abrir vista de impresión</button>
        </div>
      </form>
    </>
  );
}
