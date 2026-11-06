import { Router } from 'express';
import { pool } from '../db.js';
import { pick } from '../utils.js';

const router = Router();
const CAMPOS = ['paciente_id', 'medico_id', 'fecha', 'hora', 'motivo', 'estado'];

// GET /api/citas?fecha=2026-11-03&medico_id=1&paciente_id=2
router.get('/', async (req, res) => {
  const { fecha, medico_id, paciente_id } = req.query;
  let sql = `
    SELECT c.*,
           CONCAT(p.nombre, ' ', p.apellido) AS paciente,
           CONCAT(m.nombre, ' ', m.apellido) AS medico,
           m.especialidad
    FROM citas c
    JOIN pacientes p ON p.id = c.paciente_id
    JOIN medicos   m ON m.id = c.medico_id
    WHERE 1 = 1`;
  const params = [];
  if (fecha)       { sql += ' AND c.fecha = ?';       params.push(fecha); }
  if (medico_id)   { sql += ' AND c.medico_id = ?';   params.push(medico_id); }
  if (paciente_id) { sql += ' AND c.paciente_id = ?'; params.push(paciente_id); }
  sql += ' ORDER BY c.fecha, c.hora';

  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const [r] = await pool.query('INSERT INTO citas SET ?', [pick(req.body, CAMPOS)]);
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', async (req, res) => {
  await pool.query('UPDATE citas SET ? WHERE id = ?', [pick(req.body, CAMPOS), req.params.id]);
  res.json({ ok: true });
});

// Cambiar solo el estado: PATCH /api/citas/5/estado  { "estado": "Completada" }
router.patch('/:id/estado', async (req, res) => {
  await pool.query('UPDATE citas SET estado = ? WHERE id = ?', [req.body.estado, req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM citas WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
