import { useEffect, useState } from 'react';
import { api } from '../api';

const TABLAS = [
  { id: 'todas',     nombre: 'Todas las tablas' },
  { id: 'pacientes', nombre: 'Tabla: pacientes' },
  { id: 'medicos',   nombre: 'Tabla: medicos' },
  { id: 'citas',     nombre: 'Tabla: citas' },
  { id: 'recetas',   nombre: 'Tabla: recetas' },
];

export default function BaseDatos() {
  const [datos, setDatos] = useState({ pacientes: [], medicos: [], citas: [], recetas: [] });
  const [tablaActiva, setTablaActiva] = useState('todas');
  const [enVivo, setEnVivo] = useState(true);
  const [ultimaHora, setUltimaHora] = useState('');

  const cargarTodo = async () => {
    try {
      const [pacientes, medicos, citas, recetas] = await Promise.all([
        api.get('/pacientes'),
        api.get('/medicos'),
        api.get('/citas'),
        api.get('/recetas'),
      ]);
      setDatos({ pacientes, medicos, citas, recetas });
      setUltimaHora(new Date().toLocaleTimeString());
    } catch {
      // ignora errores transitorios de red
    }
  };

  useEffect(() => {
    cargarTodo();
    if (!enVivo) return;
    const timer = setInterval(cargarTodo, 2000);
    return () => clearInterval(timer);
  }, [enVivo]);

  const renderTablaSQL = (nombreTabla, filas, columnas) => {
    if (tablaActiva !== 'todas' && tablaActiva !== nombreTabla) return null;
    return (
      <section className="card" key={nombreTabla}>
        <div className="card-header">
          <div>
            <span className="eyebrow">SELECT * FROM {nombreTabla};</span>
            <h2>Tabla <code>{nombreTabla}</code></h2>
          </div>
          <span className="contador-pill">{filas.length} fila(s)</span>
        </div>

        <div className="tabla-scroll">
          <table>
            <thead>
              <tr>
                {columnas.map((col) => (
                  <th key={col} className="mono">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila) => (
                <tr key={fila.id}>
                  {columnas.map((col) => (
                    <td key={col} className={col === 'id' ? 'mono' : ''}>
                      {fila[col] === null || fila[col] === undefined || fila[col] === '' ? (
                        <span className="texto-suave mono">NULL</span>
                      ) : (
                        String(fila[col])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {!filas.length && (
                <tr>
                  <td colSpan={columnas.length} className="empty-state">
                    Tabla vacía (0 registros)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  };

  return (
    <>
      <header className="page-header">
        <div>
          <div className="eyebrow-row">
            <span className="eyebrow">06 / MONITOR DE BASE DE DATOS EN VIVO</span>
            <span className="fecha-tag">
              {enVivo ? '🟢 Sincronizando cada 2 seg' : '⏸ Sincronización en pausa'} · {ultimaHora}
            </span>
          </div>
          <h1>Visor de Base de Datos (`clinica.sqlite`)</h1>
          <p className="subtitulo">
            Deja esta pantalla abierta mientras creas o editas registros desde tu celular u otra pestaña: verás las filas actualizarse solas en tiempo real.
          </p>
        </div>

        <div className="acciones">
          <button type="button" onClick={cargarTodo} className="btn-sm secundario">
            ↻ Refrescar ahora
          </button>
          <button
            type="button"
            className={enVivo ? 'btn-sm secundario' : 'btn-sm'}
            onClick={() => setEnVivo(!enVivo)}
          >
            {enVivo ? '⏸ Pausar auto-refresco' : '▶ Activar auto-refresco'}
          </button>
        </div>
      </header>

      <div className="acciones" style={{ marginBottom: '1.25rem' }}>
        {TABLAS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`btn-sm ${tablaActiva === t.id ? '' : 'secundario'}`}
            onClick={() => setTablaActiva(t.id)}
          >
            {t.nombre}
          </button>
        ))}
      </div>

      {renderTablaSQL('pacientes', datos.pacientes, [
        'id', 'cedula', 'nombre', 'apellido', 'fecha_nacimiento', 'sexo', 'tipo_sangre', 'alergias', 'telefono', 'creado_en'
      ])}

      {renderTablaSQL('medicos', datos.medicos, [
        'id', 'nombre', 'apellido', 'especialidad', 'licencia', 'telefono', 'email', 'activo', 'creado_en'
      ])}

      {renderTablaSQL('citas', datos.citas, [
        'id', 'fecha', 'hora', 'paciente_id', 'paciente', 'medico_id', 'medico', 'motivo', 'estado'
      ])}

      {renderTablaSQL('recetas', datos.recetas, [
        'id', 'fecha', 'paciente', 'medico', 'total_medicamentos'
      ])}
    </>
  );
}
