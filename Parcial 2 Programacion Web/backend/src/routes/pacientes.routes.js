import { Router } from 'express';
import { pool } from '../db.js';
import { pick } from '../utils.js';

const router = Router();
const CAMPOS = ['cedula', 'nombre', 'apellido', 'fecha_nacimiento', 'sexo',
  'telefono', 'email', 'direccion', 'tipo_sangre', 'alergias'];

// Listar / buscar: GET /api/pacientes?buscar=juan
router.get('/', async (req, res) => {
  const q = `%${req.query.buscar || ''}%`;
  const [rows] = await pool.query(
    `SELECT * FROM pacientes
     WHERE nombre LIKE ? OR apellido LIKE ? OR cedula LIKE ?
     ORDER BY apellido, nombre`,
    [q, q, q]
  );
  res.json(rows);
});

// Obtener uno
router.get('/:id', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM pacientes WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Paciente no encontrado' });
  res.json(rows[0]);
});

// Crear
router.post('/', async (req, res) => {
  const [r] = await pool.query('INSERT INTO pacientes SET ?', [pick(req.body, CAMPOS)]);
  res.status(201).json({ id: r.insertId });
});

// Actualizar
router.put('/:id', async (req, res) => {
  await pool.query('UPDATE pacientes SET ? WHERE id = ?', [pick(req.body, CAMPOS), req.params.id]);
  res.json({ ok: true });
});

// Eliminar
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM pacientes WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
