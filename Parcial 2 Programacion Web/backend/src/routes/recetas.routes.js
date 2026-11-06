import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

// GET /api/recetas?paciente_id=1
router.get('/', async (req, res) => {
  const params = [];
  let where = '';
  if (req.query.paciente_id) { where = 'WHERE r.paciente_id = ?'; params.push(req.query.paciente_id); }
  const [rows] = await pool.query(
    `SELECT r.id, r.fecha,
            CONCAT(p.nombre, ' ', p.apellido) AS paciente,
            CONCAT(m.nombre, ' ', m.apellido) AS medico,
            (SELECT COUNT(*) FROM receta_detalle d WHERE d.receta_id = r.id) AS total_medicamentos
     FROM recetas r
     JOIN pacientes p ON p.id = r.paciente_id
     JOIN medicos   m ON m.id = r.medico_id
     ${where}
     ORDER BY r.fecha DESC`,
    params
  );
  res.json(rows);
});

// GET /api/recetas/5 -> receta completa para imprimir
router.get('/:id', async (req, res) => {
  const [[receta]] = await pool.query(
    `SELECT r.*,
            p.nombre AS p_nombre, p.apellido AS p_apellido, p.cedula, p.fecha_nacimiento, p.alergias,
            m.nombre AS m_nombre, m.apellido AS m_apellido, m.especialidad, m.licencia
     FROM recetas r
     JOIN pacientes p ON p.id = r.paciente_id
     JOIN medicos   m ON m.id = r.medico_id
     WHERE r.id = ?`,
    [req.params.id]
  );
  if (!receta) return res.status(404).json({ error: 'Receta no encontrada' });

  const [medicamentos] = await pool.query(
    'SELECT * FROM receta_detalle WHERE receta_id = ?', [req.params.id]
  );
  res.json({ ...receta, medicamentos });
});

// POST /api/recetas
router.post('/', async (req, res) => {
  const { paciente_id, medico_id, historial_id, indicaciones, medicamentos = [] } = req.body;
  if (!medicamentos.length) {
    return res.status(400).json({ error: 'La receta debe tener al menos un medicamento' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO recetas (paciente_id, medico_id, historial_id, indicaciones) VALUES (?, ?, ?, ?)',
      [paciente_id, medico_id, historial_id || null, indicaciones || null]
    );
    const filas = medicamentos.map((m) => [r.insertId, m.medicamento, m.dosis, m.frecuencia, m.duracion]);
    await conn.query(
      'INSERT INTO receta_detalle (receta_id, medicamento, dosis, frecuencia, duracion) VALUES ?',
      [filas]
    );
    await conn.commit();
    res.status(201).json({ id: r.insertId });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM recetas WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
