import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, hoy, fechaLarga, iniciales } from '../api';
import { EcgLine } from '../icons';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [citas, setCitas] = useState([]);

  useEffect(() => {
    api.get('/estadisticas').then(setStats).catch(() => {});
    api.get(`/citas?fecha=${hoy()}`).then(setCitas).catch(() => {});
  }, []);

  return (
    <>
      <header className="page-header hero-banner">
        <div className="hero-copy">
          <div className="eyebrow-row">
            <span className="eyebrow">01 / PANORAMA CLÍNICO</span>
            <span className="fecha-tag">{fechaLarga()}</span>
          </div>
          <h1>Centro de Control Clínico</h1>
          <p className="subtitulo">
             Flujo de pacientes en tiempo real, expedientes médicos e impresión de recetas.
          </p>
        </div>

        <div className="hero-right">
          <EcgLine className="hero-ecg" />
          <div className="acciones">
            <Link to="/citas" className="btn">＋ Agendar cita</Link>
            <Link to="/pacientes" className="btn secundario">＋ Paciente</Link>
            <Link to="/recetas/nueva" className="btn secundario">℞ Emitir receta</Link>
          </div>
        </div>
      </header>

      <div className="stats">
        <Link to="/pacientes" className="stat">
          <div className="stat-top">
            <span className="stat-tag">EXPEDIENTES</span>
            <span className="stat-arrow">↗</span>
          </div>
          <b>{stats?.pacientes ?? '…'}</b>
          <span>Pacientes activos</span>
          <small>Fichas clínicas e historial</small>
        </Link>

        <Link to="/medicos" className="stat">
          <div className="stat-top">
            <span className="stat-tag">CUERPO MÉDICO</span>
            <span className="stat-arrow">↗</span>
          </div>
          <b>{stats?.medicos ?? '…'}</b>
          <span>Especialistas</span>
          <small>Disponibles para consulta</small>
        </Link>

        <Link to="/citas" className="stat">
          <div className="stat-top">
            <span className="stat-tag">JORNADA HOY</span>
            <span className="stat-arrow">↗</span>
          </div>
          <b>{stats?.citas_hoy ?? '…'}</b>
          <span>Citas de hoy</span>
          <small>Turnos del día {hoy()}</small>
        </Link>

        <Link to="/recetas" className="stat">
          <div className="stat-top">
            <span className="stat-tag">FARMACIA · ℞</span>
            <span className="stat-arrow">↗</span>
          </div>
          <b>{stats?.recetas ?? '…'}</b>
          <span>Recetas emitidas</span>
          <small>Listas para imprimir</small>
        </Link>
      </div>

      <section className="card">
        <div className="card-header">
          <div>
            <span className="eyebrow">CRONOGRAMA DEL DÍA</span>
            <h2>Pacientes citados hoy</h2>
          </div>
          <Link to="/citas" className="btn secundario btn-sm">Ver agenda completa →</Link>
        </div>

        <div className="tickets-list">
          {citas.map((c) => (
            <div key={c.id} className="cita-ticket">
              <div className="ticket-hora">
                <span className="mono">{c.hora.slice(0, 5)}</span>
                <small>HRS</small>
              </div>

              <div className="ticket-body">
                <div className="celda-persona">
                  <span className="avatar">{iniciales(c.paciente)}</span>
                  <div>
                    <b className="ticket-title">{c.paciente}</b>
                    <div className="texto-suave">{c.motivo || 'Consulta médica programada'}</div>
                  </div>
                </div>
              </div>

              <div className="ticket-doctor">
                <span className="pill-especialidad">{c.especialidad}</span>
                <div className="texto-suave">Dr(a). {c.medico}</div>
              </div>

              <div className="ticket-actions">
                <span className={`badge ${c.estado.toLowerCase()}`}>{c.estado}</span>
                <Link className="btn btn-sm" to={`/pacientes/${c.paciente_id}`}>
                  Abrir expediente →
                </Link>
              </div>
            </div>
          ))}
          {!citas.length && (
            <div className="empty-state">
              No hay citas programadas para hoy. Usa <b>＋ Agendar cita</b> para programar un turno.
            </div>
          )}
        </div>
      </section>
    </>
  );
}
