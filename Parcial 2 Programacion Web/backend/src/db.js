import path from 'node:path';
import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config({ path: path.join(import.meta.dirname, '../.env') });

const dbDir = path.join(import.meta.dirname, '../../database');
fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'clinica.sqlite');

const sqlite = new DatabaseSync(dbPath);
sqlite.exec('PRAGMA foreign_keys = ON;');

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS medicos (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre        TEXT NOT NULL,
    apellido      TEXT NOT NULL,
    especialidad  TEXT NOT NULL,
    licencia      TEXT UNIQUE,
    telefono      TEXT,
    email         TEXT,
    activo        INTEGER NOT NULL DEFAULT 1,
    creado_en     TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS pacientes (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    cedula            TEXT UNIQUE,
    nombre            TEXT NOT NULL,
    apellido          TEXT NOT NULL,
    fecha_nacimiento  TEXT,
    sexo              TEXT DEFAULT 'M',
    telefono          TEXT,
    email             TEXT,
    direccion         TEXT,
    tipo_sangre       TEXT,
    alergias          TEXT,
    creado_en         TEXT DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS citas (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id  INTEGER NOT NULL,
    medico_id    INTEGER NOT NULL,
    fecha        TEXT NOT NULL,
    hora         TEXT NOT NULL,
    motivo       TEXT,
    estado       TEXT NOT NULL DEFAULT 'Programada',
    creado_en    TEXT DEFAULT (datetime('now', 'localtime')),
    UNIQUE (medico_id, fecha, hora),
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id)   REFERENCES medicos(id)   ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS historial (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id   INTEGER NOT NULL,
    medico_id     INTEGER NOT NULL,
    cita_id       INTEGER NULL,
    fecha         TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    motivo        TEXT,
    presion       TEXT,
    peso          REAL,
    temperatura   REAL,
    diagnostico   TEXT NOT NULL,
    tratamiento   TEXT,
    notas         TEXT,
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id)   REFERENCES medicos(id)   ON DELETE RESTRICT,
    FOREIGN KEY (cita_id)     REFERENCES citas(id)     ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS recetas (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    paciente_id   INTEGER NOT NULL,
    medico_id     INTEGER NOT NULL,
    historial_id  INTEGER NULL,
    fecha         TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    indicaciones  TEXT,
    FOREIGN KEY (paciente_id)  REFERENCES pacientes(id) ON DELETE CASCADE,
    FOREIGN KEY (medico_id)    REFERENCES medicos(id)   ON DELETE RESTRICT,
    FOREIGN KEY (historial_id) REFERENCES historial(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS receta_detalle (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    receta_id    INTEGER NOT NULL,
    medicamento  TEXT NOT NULL,
    dosis        TEXT,
    frecuencia   TEXT,
    duracion     TEXT,
    FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE
  );
`);

const { total } = sqlite.prepare('SELECT COUNT(*) AS total FROM medicos').get();
if (total === 0) {
  sqlite.exec(`
    INSERT INTO medicos (nombre, apellido, especialidad, licencia, telefono, email) VALUES
      ('Ana',   'Martínez', 'Medicina General', 'LIC-1001', '809-555-0101', 'ana@clinica.com'),
      ('Luis',  'Pérez',    'Pediatría',        'LIC-1002', '809-555-0102', 'luis@clinica.com'),
      ('Carla', 'Gómez',    'Cardiología',      'LIC-1003', '809-555-0103', 'carla@clinica.com');

    INSERT INTO pacientes (cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias) VALUES
      ('001-0000001-1', 'Juan',  'Rodríguez', '1990-05-12', 'M', '809-555-1001', 'juan@correo.com',  'Calle Sol #12',   'O+', 'Penicilina'),
      ('001-0000002-2', 'María', 'López',     '1985-11-03', 'F', '809-555-1002', 'maria@correo.com', 'Av. Duarte #45',  'A+', NULL),
      ('001-0000003-3', 'Pedro', 'Santos',    '2015-02-20', 'M', '809-555-1003', 'pedro@correo.com', 'Calle Luna #8',   'B-', NULL);
  `);
}

// ---------- Conexión automática a MySQL Workbench (localhost:3306) ----------
let mysqlPool = null;

async function conectarMySQL() {
  const clavesCandidatas = [
    process.env.DB_PASSWORD ?? '',
    '',
    'root',
    '1234',
    '123456',
    '12345',
    'admin',
    'mysql',
    '12345678',
  ];

  for (const password of [...new Set(clavesCandidatas)]) {
    try {
      const p = mysql.createPool({
        host: process.env.DB_HOST || '127.0.0.1',
        port: Number(process.env.DB_PORT || 3306),
        user: process.env.DB_USER || 'root',
        password,
        database: process.env.DB_NAME || 'clinica',
        waitForConnections: true,
        connectionLimit: 10,
        dateStrings: true,
        connectTimeout: 2000,
      });
      await p.query('SELECT 1');
      mysqlPool = p;
      console.log('✅ Conectado en vivo a MySQL Server (MySQL Workbench -> BD clinica)');
      await sincronizarSQLiteHaciaMySQL(p);
      return;
    } catch (err) {
      if (err.code !== 'ER_ACCESS_DENIED_ERROR') {
        break;
      }
    }
  }
  console.log('ℹ️ MySQL requiere tu contraseña en backend/.env (DB_PASSWORD=tu_clave). Usando respaldo local SQLite.');
}

async function sincronizarSQLiteHaciaMySQL(p) {
  try {
    const pacientes = sqlite.prepare('SELECT * FROM pacientes').all();
    for (const r of pacientes) {
      await p.query(
        `INSERT IGNORE INTO pacientes (id, cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, email, direccion, tipo_sangre, alergias)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [r.id, r.cedula, r.nombre, r.apellido, r.fecha_nacimiento, r.sexo, r.telefono, r.email, r.direccion, r.tipo_sangre, r.alergias]
      );
    }
    const medicos = sqlite.prepare('SELECT * FROM medicos').all();
    for (const m of medicos) {
      await p.query(
        `INSERT IGNORE INTO medicos (id, nombre, apellido, especialidad, licencia, telefono, email, activo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [m.id, m.nombre, m.apellido, m.especialidad, m.licencia, m.telefono, m.email, m.activo]
      );
    }
    const citas = sqlite.prepare('SELECT * FROM citas').all();
    for (const c of citas) {
      await p.query(
        `INSERT IGNORE INTO citas (id, paciente_id, medico_id, fecha, hora, motivo, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [c.id, c.paciente_id, c.medico_id, c.fecha, c.hora, c.motivo, c.estado]
      );
    }
    const historial = sqlite.prepare('SELECT * FROM historial').all();
    for (const h of historial) {
      await p.query(
        `INSERT IGNORE INTO historial (id, paciente_id, medico_id, cita_id, fecha, motivo, presion, peso, temperatura, diagnostico, tratamiento, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [h.id, h.paciente_id, h.medico_id, h.cita_id, h.fecha, h.motivo, h.presion, h.peso, h.temperatura, h.diagnostico, h.tratamiento, h.notas]
      );
    }
    const recetas = sqlite.prepare('SELECT * FROM recetas').all();
    for (const rec of recetas) {
      await p.query(
        `INSERT IGNORE INTO recetas (id, paciente_id, medico_id, historial_id, fecha, indicaciones)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [rec.id, rec.paciente_id, rec.medico_id, rec.historial_id, rec.fecha, rec.indicaciones]
      );
    }
    const detalles = sqlite.prepare('SELECT * FROM receta_detalle').all();
    for (const d of detalles) {
      await p.query(
        `INSERT IGNORE INTO receta_detalle (id, receta_id, medicamento, dosis, frecuencia, duracion)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [d.id, d.receta_id, d.medicamento, d.dosis, d.frecuencia, d.duracion]
      );
    }
    console.log('🔄 Registros existentes sincronizados hacia MySQL Workbench.');
  } catch (e) {
    console.error('Aviso sincronizando a MySQL:', e.message);
  }
}

await conectarMySQL();

function traducirSQL(sql, params = []) {
  let q = sql
    .replace(/CONCAT\(([^,]+),\s*' ',\s*([^)]+)\)/gi, '($1 || \' \' || $2)')
    .replace(/CURDATE\(\)/gi, "date('now', 'localtime')");

  const mInsert = q.match(/^\s*INSERT\s+INTO\s+(\w+)\s+SET\s+\?\s*$/i);
  if (mInsert && params[0] && typeof params[0] === 'object') {
    const keys = Object.keys(params[0]);
    q = `INSERT INTO ${mInsert[1]} (${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`;
    params = Object.values(params[0]);
  }

  const mUpdate = q.match(/^\s*UPDATE\s+(\w+)\s+SET\s+\?\s+WHERE\s+id\s*=\s*\?\s*$/i);
  if (mUpdate && params[0] && typeof params[0] === 'object') {
    const keys = Object.keys(params[0]);
    q = `UPDATE ${mUpdate[1]} SET ${keys.map((k) => `${k} = ?`).join(', ')} WHERE id = ?`;
    params = [...Object.values(params[0]), params[1]];
  }

  if (/VALUES\s+\?\s*$/i.test(q) && Array.isArray(params[0]) && Array.isArray(params[0][0])) {
    const filas = params[0];
    const placeholders = filas.map((f) => `(${f.map(() => '?').join(', ')})`).join(', ');
    q = q.replace(/VALUES\s+\?\s*$/i, `VALUES ${placeholders}`);
    params = filas.flat();
  }

  const cleanParams = params.map((p) =>
    p === undefined ? null : typeof p === 'boolean' ? (p ? 1 : 0) : p
  );
  return [q, cleanParams];
}

async function ejecutarQuerySQLite(sql, params = []) {
  const [q, cleanParams] = traducirSQL(sql, params);
  try {
    const stmt = sqlite.prepare(q);
    if (/^\s*SELECT\b/i.test(q)) {
      const rows = stmt.all(...cleanParams).map((r) => ({ ...r }));
      return [rows];
    }
    const info = stmt.run(...cleanParams);
    return [{ insertId: Number(info.lastInsertRowid), affectedRows: Number(info.changes) }];
  } catch (err) {
    const msg = err.message || '';
    if (msg.includes('UNIQUE constraint failed')) err.code = 'ER_DUP_ENTRY';
    else if (msg.includes('FOREIGN KEY constraint failed')) {
      err.code = /^\s*DELETE\b/i.test(q) ? 'ER_ROW_IS_REFERENCED_2' : 'ER_NO_REFERENCED_ROW_2';
    } else if (msg.includes('NOT NULL constraint failed')) err.code = 'ER_BAD_NULL_ERROR';
    throw err;
  }
}

async function ejecutarQuery(sql, params = []) {
  if (mysqlPool) {
    const res = await mysqlPool.query(sql, params);
    // Espejo en SQLite local por respaldo
    if (!/^\s*SELECT\b/i.test(sql)) {
      ejecutarQuerySQLite(sql, params).catch(() => {});
    }
    return res;
  }
  return ejecutarQuerySQLite(sql, params);
}

export const pool = {
  query: ejecutarQuery,
  async getConnection() {
    if (mysqlPool) return mysqlPool.getConnection();
    return {
      query: ejecutarQuerySQLite,
      async beginTransaction() { sqlite.exec('BEGIN'); },
      async commit()           { sqlite.exec('COMMIT'); },
      async rollback()         { sqlite.exec('ROLLBACK'); },
      release() {},
    };
  },
};
