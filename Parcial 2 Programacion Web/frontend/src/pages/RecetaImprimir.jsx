import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, edad } from '../api';

export default function RecetaImprimir() {
  const { id } = useParams();
  const [r, setR] = useState(null);

  useEffect(() => { api.get(`/recetas/${id}`).then(setR); }, [id]);

  if (!r) return <p className="card">Cargando receta...</p>;

  return (
    <>
      <div className="no-print page-header">
        <div>
          <span className="eyebrow">🖨️ Vista previa de impresión</span>
          <h1>Receta Médica #{String(r.id).padStart(4, '0')}</h1>
          <p className="subtitulo">Al pulsar Imprimir, los menús y botones se ocultan automáticamente.</p>
        </div>
        <div className="acciones">
          <button onClick={() => window.print()}>🖨️ Imprimir / Guardar PDF</button>
          <Link className="btn secundario" to="/recetas">← Volver a recetas</Link>
        </div>
      </div>

      <div className="receta">
        <header className="receta-header">
          <div>
            <h2>🏥 Clínica San Rafael</h2>
            <p>Centro de Especialidades Médicas · Av. Principal #123 · Tel. (809) 555-0000</p>
          </div>
          <div className="receta-folio">
            <div className="rx">℞</div>
            <small>Folio #{String(r.id).padStart(4, '0')}</small>
          </div>
        </header>

        <section className="receta-datos">
          <p><b>Paciente:</b> {r.p_nombre} {r.p_apellido}</p>
          <p><b>Cédula:</b> {r.cedula || '—'}</p>
          <p><b>Edad:</b> {edad(r.fecha_nacimiento)}</p>
          <p><b>Fecha de emisión:</b> {r.fecha.slice(0, 10)}</p>
          {r.alergias && (
            <p className="alerta full">
              <b>⚠️ Alergias conocidas:</b> {r.alergias}
            </p>
          )}
        </section>

        <h4 className="receta-seccion-titulo">Prescripción de Medicamentos</h4>
        <table className="receta-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Medicamento</th>
              <th>Dosis</th>
              <th>Frecuencia</th>
              <th>Duración</th>
            </tr>
          </thead>
          <tbody>
            {r.medicamentos.map((m, i) => (
              <tr key={m.id}>
                <td>{i + 1}</td>
                <td><b>{m.medicamento}</b></td>
                <td>{m.dosis}</td>
                <td>{m.frecuencia}</td>
                <td>{m.duracion}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {r.indicaciones && (
          <div className="indicaciones">
            <b>📋 Indicaciones generales para el paciente:</b>
            <p>{r.indicaciones}</p>
          </div>
        )}

        <footer className="firma">
          <div className="linea" />
          <p><b>Dr(a). {r.m_nombre} {r.m_apellido}</b></p>
          <p>{r.especialidad} · Licencia Médica: {r.licencia || '—'}</p>
        </footer>
      </div>
    </>
  );
}
