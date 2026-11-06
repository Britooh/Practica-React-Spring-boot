CREATE DATABASE IF NOT EXISTS clinica
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE clinica;

-- ========== 1. MÉDICOS ==========
CREATE TABLE IF NOT EXISTS medicos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  nombre        VARCHAR(100) NOT NULL,
  apellido      VARCHAR(100) NOT NULL,
  especialidad  VARCHAR(100) NOT NULL,
  licencia      VARCHAR(50)  UNIQUE,
  telefono      VARCHAR(20),
  email         VARCHAR(100),
  activo        TINYINT NOT NULL DEFAULT 1,
  creado_en     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 2. PACIENTES ==========
CREATE TABLE IF NOT EXISTS pacientes (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  cedula            VARCHAR(20) UNIQUE,
  nombre            VARCHAR(100) NOT NULL,
  apellido          VARCHAR(100) NOT NULL,
  fecha_nacimiento  DATE,
  sexo              ENUM('M','F','O') DEFAULT 'M',
  telefono          VARCHAR(20),
  email             VARCHAR(100),
  direccion         VARCHAR(255),
  tipo_sangre       VARCHAR(5),
  alergias          TEXT,
  creado_en         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========== 3. CITAS ==========
CREATE TABLE IF NOT EXISTS citas (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id  INT NOT NULL,
  medico_id    INT NOT NULL,
  fecha        DATE NOT NULL,
  hora         TIME NOT NULL,
  motivo       VARCHAR(255),
  estado       ENUM('Programada','Completada','Cancelada') NOT NULL DEFAULT 'Programada',
  creado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_medico_horario (medico_id, fecha, hora),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id)   REFERENCES medicos(id)   ON DELETE RESTRICT
);

-- ========== 4. HISTORIAL CLÍNICO (consultas) ==========
CREATE TABLE IF NOT EXISTS historial (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id   INT NOT NULL,
  medico_id     INT NOT NULL,
  cita_id       INT NULL,
  fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  motivo        VARCHAR(255),
  presion       VARCHAR(20),
  peso          DECIMAL(5,2),
  temperatura   DECIMAL(4,1),
  diagnostico   TEXT NOT NULL,
  tratamiento   TEXT,
  notas         TEXT,
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id)   REFERENCES medicos(id)   ON DELETE RESTRICT,
  FOREIGN KEY (cita_id)     REFERENCES citas(id)     ON DELETE SET NULL
);

-- ========== 5. RECETAS ==========
CREATE TABLE IF NOT EXISTS recetas (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id   INT NOT NULL,
  medico_id     INT NOT NULL,
  historial_id  INT NULL,
  fecha         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  indicaciones  TEXT,
  FOREIGN KEY (paciente_id)  REFERENCES pacientes(id) ON DELETE CASCADE,
  FOREIGN KEY (medico_id)    REFERENCES medicos(id)   ON DELETE RESTRICT,
  FOREIGN KEY (historial_id) REFERENCES historial(id) ON DELETE SET NULL
);

-- ========== 6. DETALLE DE RECETAS (medicamentos) ==========
CREATE TABLE IF NOT EXISTS receta_detalle (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  receta_id    INT NOT NULL,
  medicamento  VARCHAR(150) NOT NULL,
  dosis        VARCHAR(100),
  frecuencia   VARCHAR(100),
  duracion     VARCHAR(100),
  FOREIGN KEY (receta_id) REFERENCES recetas(id) ON DELETE CASCADE
);

-- ========== DATOS DE PRUEBA (INSERT IGNORE evita duplicados al re-ejecutar) ==========
INSERT IGNORE INTO medicos (id, nombre, apellido, especialidad, licencia, telefono, email) VALUES
(1, 'Ana',   'Martínez', 'Medicina General', 'LIC-1001', '809-555-0101', 'ana@clinica.com'),
(2, 'Luis',  'Pérez',    'Pediatría',        'LIC-1002', '809-555-0102', 'luis@clinica.com'),
(3, 'Carla', 'Gómez',    'Cardiología',      'LIC-1003', '809-555-0103', 'carla@clinica.com');

INSERT IGNORE INTO pacientes (id, cedula, nombre, apellido, fecha_nacimiento, sexo, telefono, tipo_sangre, alergias) VALUES
(1, '001-0000001-1', 'Juan',  'Rodríguez', '1990-05-12', 'M', '809-555-1001', 'O+', 'Penicilina'),
(2, '001-0000002-2', 'María', 'López',     '1985-11-03', 'F', '809-555-1002', 'A+', NULL),
(3, '001-0000003-3', 'Pedro', 'Santos',    '2015-02-20', 'M', '809-555-1003', 'B-', NULL);

-- ========== CONSULTAS PARA VER LAS TABLAS ==========
SELECT * FROM pacientes;
SELECT * FROM medicos;
SELECT * FROM citas;
SELECT * FROM historial;
SELECT * FROM recetas;
SELECT * FROM receta_detalle;
