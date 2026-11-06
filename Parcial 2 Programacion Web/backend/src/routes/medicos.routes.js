import { Router } from 'express';
import { pool } from '../db.js';
import { pick } from '../utils.js';

const router = Router();
const CAMPOS = ['nombre', 'apellido', 'especialidad', 'licencia', 'telefono', 'email', 'activo'];

// GET /api/medicos?activos=1
router.get('/', async (req, res) => {
  const where = req.query.activos ? 'WHERE activo = 1' : '';
  const [rows] = await pool.query(`SELECT * FROM medicos ${where} ORDER BY apellido, nombre`);
  res.json(rows);
});

router.post('/', async (req, res) => {
  const [r] = await pool.query('INSERT INTO medicos SET ?', [pick(req.body, CAMPOS)]);
  res.status(201).json({ id: r.insertId });
});

router.put('/:id', async (req, res) => {
  await pool.query('UPDATE medicos SET ? WHERE id = ?', [pick(req.body, CAMPOS), req.params.id]);
  res.json({ ok: true });
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM medicos WHERE id = ?', [req.params.id]);
  res.json({ ok: true });
});

export default router;
