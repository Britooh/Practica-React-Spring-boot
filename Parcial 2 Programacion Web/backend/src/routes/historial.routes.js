import { Router } from 'express';
import { pool } from '../db.js';
import { pick } from '../utils.js';

const router = Router();
const CAMPOS = ['paciente_id', 'medico_id', 'cita_id', 'motivo', 'presion', 'peso',
  'temperatura', 'diagnostico', 'tratamiento', 'notas'];

// GET /api/historial?paciente_id=1
router.get('/', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT h.*, CONCAT(m.nombre, ' ', m.apellido) AS medico, m.especialidad
     FROM historial h
     JOIN medicos m ON m.id = h.medico_id
     WHERE h.paciente_id = ?
     ORDER BY h.fecha DESC`,
    [req.query.paciente_id]
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const datos = pick(req.body, CAMPOS);
  const [r] = await pool.query('INSERT INTO historial SET ?', [datos]);
  if (datos.cita_id) {
    await pool.query("UPDATE citas SET estado = 'Completada' WHERE id = ?", [datos.cita_id]);
  }
  res.status(201).json({ id: r.insertId });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM historial WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
