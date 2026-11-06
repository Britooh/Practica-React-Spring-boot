import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import 'dotenv/config';
import { pool } from './db.js';

import pacientesRoutes from './routes/pacientes.routes.js';
import medicosRoutes from './routes/medicos.routes.js';
import citasRoutes from './routes/citas.routes.js';
import historialRoutes from './routes/historial.routes.js';
import recetasRoutes from './routes/recetas.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Rutas de la API ----------
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/historial', historialRoutes);
app.use('/api/recetas', recetasRoutes);

app.get('/api/estadisticas', async (req, res) => {
  const [[stats]] = await pool.query(`
    SELECT (SELECT COUNT(*) FROM pacientes)                     AS pacientes,
           (SELECT COUNT(*) FROM medicos WHERE activo = 1)      AS medicos,
           (SELECT COUNT(*) FROM citas WHERE fecha = CURDATE()) AS citas_hoy,
           (SELECT COUNT(*) FROM recetas)                       AS recetas`);
  res.json(stats);
});

// ---------- Producción: servir el build de React ----------
const dist = path.join(import.meta.dirname, '../../frontend/dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(dist, 'index.html'));
    }
    next();
  });
}

// ---------- Manejo de errores ----------
app.use((err, req, res, next) => {
  console.error(err);
  const mensajes = {
    ER_DUP_ENTRY: [409, 'Registro duplicado (cédula, licencia u horario de cita ya ocupado)'],
    ER_ROW_IS_REFERENCED_2: [409, 'No se puede eliminar: tiene registros asociados'],
    ER_NO_REFERENCED_ROW_2: [400, 'El paciente o médico indicado no existe'],
    ER_BAD_NULL_ERROR: [400, 'Faltan campos obligatorios'],
  };
  const [status, error] = mensajes[err.code] || [500, 'Error interno del servidor'];
  res.status(status).json({ error });
});

// ---------- Iniciar (0.0.0.0 = aceptar conexiones de la red) ----------
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 API en http://localhost:${PORT}`);
  for (const redes of Object.values(os.networkInterfaces())) {
    for (const r of redes) {
      if (r.family === 'IPv4' && !r.internal) console.log(`   Red local: http://${r.address}:${PORT}`);
    }
  }
  if (process.argv.includes('--open')) {
    import('node:child_process').then(({ exec }) => exec(`start http://localhost:${PORT}`));
  }
  if (process.argv.includes('--public')) {
    (async () => {
      try {
        const { bin, install } = await import('cloudflared');
        if (!fs.existsSync(bin)) {
          console.log('⬇️ Preparando túnel Cloudflare (solo la primera vez)...');
          await install(bin);
        }
        const { spawn } = await import('node:child_process');
        console.log('🌐 Generando enlace público estable en Internet (Cloudflare)...');
        const cf = spawn(bin, ['tunnel', '--url', `http://127.0.0.1:${PORT}`], {
          stdio: ['ignore', 'pipe', 'pipe'],
        });
        let impreso = false;
        const mostrarUrl = (chunk) => {
          const txt = chunk.toString();
          const m = txt.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
          if (m && !impreso) {
            impreso = true;
            console.log(`\n======================================================`);
            console.log(`🌍 ENLACE PÚBLICO ESTABLE (cualquier red / datos móviles):`);
            console.log(`   👉 ${m[0]}`);
            console.log(`======================================================\n`);
          }
        };
        cf.stdout.on('data', mostrarUrl);
        cf.stderr.on('data', mostrarUrl);
        process.on('exit', () => cf.kill());
      } catch (err) {
        console.error('Error iniciando túnel público:', err.message);
      }
    })();
  }
});
