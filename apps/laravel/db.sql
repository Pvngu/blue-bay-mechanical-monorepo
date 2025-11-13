-- #############################################################################
-- # 1. DEFINICIÓN DE TIPOS PERSONALIZADOS (ENUMS)
-- # Esto nos ayuda a restringir los valores de ciertas columnas.
-- #############################################################################

CREATE TYPE rol_usuario AS ENUM (
  'admin',
  'profesor',
  'alumno'
);

CREATE TYPE categoria_factor AS ENUM (
  'académicos',
  'psicosociales',
  'económicos',
  'institucionales',
  'tecnológicos',
  'contextuales'
);

CREATE TYPE estatus_asistencia AS ENUM (
  'presente',
  'ausente',
  'retardo'
);

CREATE TYPE genero_alumno AS ENUM (
  'masculino',
  'femenino',
  'otro'
);

CREATE TYPE modalidad_estudio AS ENUM (
  'presencial',
  'virtual',
  'híbrida'
);


-- #############################################################################
-- # 2. TABLAS DE CATÁLOGOS Y ENTIDADES PRINCIPALES
-- #############################################################################

-- Tabla para los ciclos escolares (Ej. "Otoño 2025")
CREATE TABLE Periodos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT false
);

-- Tabla para las carreras (Ej. "Ing. en Sistemas")
CREATE TABLE Carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  clave VARCHAR(20) UNIQUE
);

-- Tabla central de usuarios para login (Opcional pero recomendado)
CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_usuario NOT NULL
);

-- Catálogo de profesores
CREATE TABLE Profesores (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES Usuarios(id) ON DELETE SET NULL, -- El profesor puede tener un login
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  rfc VARCHAR(13) UNIQUE
);

-- Catálogo de alumnos con todos los campos requeridos
CREATE TABLE Alumnos (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES Usuarios(id) ON DELETE SET NULL, -- El alumno puede tener un login
  carrera_id INT NOT NULL REFERENCES Carreras(id) ON DELETE RESTRICT,
  matricula VARCHAR(50) NOT NULL UNIQUE, -- "Número de control"
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  semestre INT NOT NULL,
  genero genero_alumno,
  modalidad modalidad_estudio
);

-- Catálogo de materias
CREATE TABLE Materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  codigo_materia VARCHAR(50) UNIQUE,
  creditos INT
);

-- Unidades que componen una materia
CREATE TABLE Unidades (
  id SERIAL PRIMARY KEY,
  materia_id INT NOT NULL REFERENCES Materias(id) ON DELETE CASCADE, -- Si se borra la materia, se borran sus unidades
  numero_unidad INT NOT NULL,
  nombre_unidad VARCHAR(255),
  -- Asegura que no haya "Unidad 1" dos veces para la misma materia
  UNIQUE(materia_id, numero_unidad)
);

-- Catálogo de factores de riesgo para análisis de calidad
CREATE TABLE Factores_Riesgo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria categoria_factor NOT NULL
);


-- #############################################################################
-- # 3. TABLAS TRANSACCIONALES (EL CORAZÓN DEL SISTEMA)
-- #############################################################################

-- Grupos: Una materia impartida por un profesor en un periodo
CREATE TABLE Grupos (
  id SERIAL PRIMARY KEY,
  materia_id INT NOT NULL REFERENCES Materias(id) ON DELETE RESTRICT,
  profesor_id INT NOT NULL REFERENCES Profesores(id) ON DELETE RESTRICT,
  periodo_id INT NOT NULL REFERENCES Periodos(id) ON DELETE RESTRICT,
  carrera_id INT REFERENCES Carreras(id) ON DELETE RESTRICT, -- A qué carrera pertenece este grupo
  horario TEXT, -- Ej. "L-W-V 10:00-11:00"
  aula VARCHAR(50)
);

-- Inscripciones: Tabla pivote que une Alumnos y Grupos
CREATE TABLE Inscripciones (
  id SERIAL PRIMARY KEY,
  alumno_id INT NOT NULL REFERENCES Alumnos(id) ON DELETE CASCADE, -- Si se da de baja al alumno, se borra su inscripción
  grupo_id INT NOT NULL REFERENCES Grupos(id) ON DELETE RESTRICT,
  calificacion_final DECIMAL(5, 2), -- Se puede calcular o almacenar
  -- Asegura que un alumno no esté dos veces en el mismo grupo
  UNIQUE(alumno_id, grupo_id)
);

-- Calificaciones por unidad (depende de la inscripción)
CREATE TABLE Calificaciones (
  id SERIAL PRIMARY KEY,
  inscripcion_id INT NOT NULL REFERENCES Inscripciones(id) ON DELETE CASCADE, -- Si se borra la inscripción, se borran las notas
  unidad_id INT NOT NULL REFERENCES Unidades(id) ON DELETE RESTRICT,
  valor_calificacion DECIMAL(5, 2) NOT NULL,
  -- Asegura que un alumno no tenga dos notas para la misma unidad
  UNIQUE(inscripcion_id, unidad_id)
);

-- Asistencias por día (depende de la inscripción)
CREATE TABLE Asistencias (
  id SERIAL PRIMARY KEY,
  inscripcion_id INT NOT NULL REFERENCES Inscripciones(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estatus estatus_asistencia NOT NULL,
  -- Asegura que un alumno no tenga dos registros de asistencia el mismo día
  UNIQUE(inscripcion_id, fecha)
);

-- Factores de riesgo detectados (depende de la inscripción)
CREATE TABLE Alumnos_Factores (
  id SERIAL PRIMARY KEY,
  inscripcion_id INT NOT NULL REFERENCES Inscripciones(id) ON DELETE CASCADE, -- Sabe qué alumno y qué grupo/materia
  factor_id INT NOT NULL REFERENCES Factores_Riesgo(id) ON DELETE RESTRICT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  -- Evita registrar el mismo factor dos veces para la misma inscripción (opcional)
  UNIQUE(inscripcion_id, factor_id)
);


-- #############################################################################
-- # 4. ÍNDICES PARA MEJORAR EL RENDIMIENTO DE LAS CONSULTAS
-- #############################################################################

-- Índices en llaves foráneas comunes
CREATE INDEX idx_alumnos_carrera_id ON Alumnos(carrera_id);
CREATE INDEX idx_grupos_materia_id ON Grupos(materia_id);
CREATE INDEX idx_grupos_profesor_id ON Grupos(profesor_id);
CREATE INDEX idx_grupos_periodo_id ON Grupos(periodo_id);
CREATE INDEX idx_inscripciones_alumno_id ON Inscripciones(alumno_id);
CREATE INDEX idx_inscripciones_grupo_id ON Inscripciones(grupo_id);
CREATE INDEX idx_calificaciones_inscripcion_id ON Calificaciones(inscripcion_id);
CREATE INDEX idx_calificaciones_unidad_id ON Calificaciones(unidad_id);
CREATE INDEX idx_asistencias_inscripcion_id ON Asistencias(inscripcion_id);
CREATE INDEX idx_asistencias_fecha ON Asistencias(fecha);
CREATE INDEX idx_alumnos_factores_inscripcion_id ON Alumnos_Factores(inscripcion_id);
CREATE INDEX idx_alumnos_factores_factor_id ON Alumnos_Factores(factor_id);