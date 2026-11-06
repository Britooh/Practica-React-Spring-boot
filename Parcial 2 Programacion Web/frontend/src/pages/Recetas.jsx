import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, iniciales } from '../api';

export default function Recetas() {
  const [recetas, setRecetas] = useState([]);
  useEffect(() => { api.get('/recetas').then(setRecetas); }, []);

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">05 / RECETARIO OFICIAL · ℞</span>
          <h1>Archivo de Prescripciones Médicas</h1>
          <p className="subtitulo">Cada receta genera un folio oficial listo para imprimirse en papel o exportarse a PDF.</p>
        </div>
        <Link className="btn" to="/recetas/nueva">＋ Emitir nueva receta</Link>
      </header>

      <div className="bento-grid">
        {recetas.map((r) => (
          <article key={r.id} className="patient-card">
            <div className="patient-card-top">
              <div className="celda-persona">
                <span className="avatar avatar-lg">{iniciales(r.paciente)}</span>
                <div>
                  <span className="mono texto-suave">FOLIO ℞ #{String(r.id).padStart(4, '0')}</span>
                  <h3 className="patient-name">{r.paciente}</h3>
                  <span className="texto-suave">Emitida el {r.fecha.slice(0, 16)}</span>
                </div>
              </div>
              <span className="pill-especialidad">{r.total_medicamentos} fármaco(s)</span>
            </div>

            <div className="patient-card-mid">
              <div className="patient-meta">
                <span>🩺 Prescrita por: <b>Dr(a). {r.medico}</b></span>
              </div>
            </div>

            <div className="patient-card-foot">
              <Link className="btn btn-sm" to={`/recetas/${r.id}/imprimir`}>
                🖨️ Abrir formato de impresión →
              </Link>
            </div>
          </article>
        ))}
        {!recetas.length && (
          <div className="card empty-state full">No hay recetas registradas todavía.</div>
        )}
      </div>
    </>
  );
}
