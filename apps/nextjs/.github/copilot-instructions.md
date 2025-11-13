# Proyecto: Sistema de Análisis de Deserción y Reprobación (SADR)

Este repositorio contiene el código fuente para un sistema web integral desarrollado para el Instituto Tecnológico de Tijuana, enfocado en la gestión académica y el análisis de indicadores de calidad.

## 1. Objetivo del Proyecto

El objetivo principal es diseñar y desarrollar un programa que apoye a los docentes a **identificar, analizar y visualizar** la problemática de reprobación y deserción de estudiantes. El sistema busca ser una herramienta clave para la toma de decisiones y la mejora de los indicadores de calidad de la institución.

---

## 2. Librerías Clave y Patrones de Implementación

Al generar código nuevo, prioriza el uso de las siguientes librerías para sus tareas específicas:

### Gestión del Estado del Servidor (API Data)

* **Librería:** **Tanstack Query** (`@tanstack/react-query`).
* **Regla:** Utiliza `useQuery` para todas las llamadas `GET` a la API de Laravel. Utiliza `useMutation` para las operaciones `POST`, `PUT`, y `DELETE`.
* **Objetivo:** Manejar el *caching*, *refetching* (invalidación) y los estados de carga/error de la API de forma centralizada.

### Gestión de Formularios

* **Librería:** **React Hook Form** (`react-hook-form`).
* **Regla:** Utiliza `React Hook Form` para manejar el estado, el envío y la validación de todos los formularios de la aplicación.
* **Objetivo:** Evitar el uso de `useState` para cada campo del formulario y obtener un manejo de estado de formulario optimizado.

### Validaciones

* **Librería:** **Zod**.
* **Regla:** Define un esquema de `Zod` para cada formulario.
* **Integración:** Usa `@hookform/resolvers/zod` para conectar tus esquemas de `Zod` directamente con `React Hook Form`.

## 3. Arquitectura y Stack Tecnológico 🚀

El sistema está diseñado con una arquitectura moderna de cliente-servidor, separando el frontend (presentación) del backend (lógica de negocio y datos).

### Frontend (Cliente Web)
* **Framework:** **Next.js** (App Router)
* **UI/Estilos:** **Tailwind CSS**
* **Componentes:** **shadcn/ui**
* **Gestión de Estado y Cache de API:** **Tanstack Query** (React Query)
* **Gestión de Formularios:** **Tanstack Form**
* **Validación:** **Zod** (usado en conjunto con Tanstack Form para validaciones de formularios)

### Backend (API)
* **Framework:** **Laravel (PHP)**
* **Función:** Sirve como una **API RESTful** que maneja toda la lógica de negocio, cálculos y comunicación con la base de datos.

### Base de Datos
* **Plataforma:** **Supabase**
* **Función:** Se utiliza como el proveedor de la base de datos **PostgreSQL**. La API de Laravel se conecta directamente a la base de datos de Supabase para persistir y consultar la información.

---

## 4. Funcionalidades Principales

El sistema se divide en dos macro-componentes: un SIS (Sistema de Información Escolar) para la operación diaria y un Módulo de Análisis para la inteligencia de negocio.

### Módulo de Administración (SIS)
* **Gestión de Catálogos:** CRUD para `Periodos` escolares, `Carreras`, `Materias` (con sus `Unidades`), `Profesores` y `Alumnos`.
* **Gestión de Grupos:** Creación de grupos asignando materia, profesor y horario por periodo.
* **Inscripción:** Asignación de alumnos a los diferentes grupos.
* **Gestión de Factores:** Catálogo para dar de alta los `Factores de Riesgo` (académicos, psicosociales, económicos, etc.).

### Módulo de Docentes (SIS)
* **Captura de Calificaciones:** Registro de calificaciones de los alumnos por cada unidad de sus materias.
* **Captura de Asistencias:** Registro de asistencias diarias de los alumnos.
* **Registro de Factores:** Interfaz para que el docente marque los factores de riesgo que detecta en sus estudiantes.

### Módulo de Alumnos (SIS)
* **Consulta:** Portal de solo lectura para que el alumno pueda ver su horario, calificaciones desglosadas por unidad y su historial de asistencias.

### Módulo de Análisis y Calidad (SADR)
* **Importación de Datos:**
    * Carga masiva de datos de estudiantes y calificaciones desde **Excel/CSV**, con **validación de datos** para evitar registros nulos o sucios.
* **Herramientas de Calidad y Visualización:**
    * **Estratificación:** Filtros globales (semestre, carrera, género, modalidad) para todos los reportes.
    * **Análisis de Pareto:** Gráfico de barras de los factores de riesgo más frecuentes.
    * **Histogramas:** Para visualizar la distribución de calificaciones.
    * **Diagrama de Ishikawa:** Plantilla para analizar las causas de la reprobación.
    * **Diagrama de Dispersión:** Para analizar la correlación (ej. asistencias vs. calificación).
    * **Gráficos de Control:** Para monitorear la evolución de los indicadores a lo largo de los semestres.
* **Reportes y Exportación:**
    * Capacidad de **exportar** los datos y gráficos a formatos **Excel, CSV y/o PDF**.
    * Generación de **reportes automáticos** con resúmenes y recomendaciones.

---

## 5. Esquema de la Base de Datos (PostgreSQL)

Este es el script SQL completo utilizado para generar la estructura de la base de datos en Supabase (Postgres).

```sql
-- #############################################################################
-- # 1. DEFINICIÓN DE TIPOS PERSONALIZADOS (ENUMS)
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

CREATE TYPE estatus_alumno AS ENUM (
  'activo',
  'baja_temporal',
  'baja_definitiva',
  'egresado'
);


-- #############################################################################
-- # 2. TABLAS DE CATÁLOGOS Y ENTIDADES PRINCIPALES
-- #############################################################################

CREATE TABLE Periodos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  activo BOOLEAN DEFAULT false
);

CREATE TABLE Carreras (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  clave VARCHAR(20) UNIQUE
);

CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol rol_usuario NOT NULL
);

CREATE TABLE Profesores (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES Usuarios(id) ON DELETE SET NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  rfc VARCHAR(13) UNIQUE
);

CREATE TABLE Alumnos (
  id SERIAL PRIMARY KEY,
  usuario_id INT UNIQUE REFERENCES Usuarios(id) ON DELETE SET NULL,
  carrera_id INT NOT NULL REFERENCES Carreras(id) ON DELETE RESTRICT,
  matricula VARCHAR(50) NOT NULL UNIQUE, -- "Número de control"
  nombre VARCHAR(100) NOT NULL,
  apellido_paterno VARCHAR(100) NOT NULL,
  apellido_materno VARCHAR(100),
  semestre INT NOT NULL,
  genero genero_alumno,
  modalidad modalidad_estudio,
  estatus_alumno estatus_alumno DEFAULT 'activo',
);

CREATE TABLE Materias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  codigo_materia VARCHAR(50) UNIQUE,
  creditos INT
);

CREATE TABLE Unidades (
  id SERIAL PRIMARY KEY,
  materia_id INT NOT NULL REFERENCES Materias(id) ON DELETE CASCADE,
  numero_unidad INT NOT NULL,
  nombre_unidad VARCHAR(255),
  UNIQUE(materia_id, numero_unidad)
);

CREATE TABLE Factores_Riesgo (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  categoria categoria_factor NOT NULL
);


-- #############################################################################
-- # 3. TABLAS TRANSACCIONALES (EL CORAZÓN DEL SISTEMA)
-- #############################################################################

CREATE TABLE Grupos (
  id SERIAL PRIMARY KEY,
  materia_id INT NOT NULL REFERENCES Materias(id) ON DELETE RESTRICT,
  profesor_id INT NOT NULL REFERENCES Profesores(id) ON DELETE RESTRICT,
  periodo_id INT NOT NULL REFERENCES Periodos(id) ON DELETE RESTRICT,
  carrera_id INT REFERENCES Carreras(id) ON DELETE RESTRICT,
  horario TEXT,
  aula VARCHAR(50)
);

CREATE TABLE Inscripciones (
  id SERIAL PRIMARY KEY,
  alumno_id INT NOT NULL REFERENCES Alumnos(id) ON DELETE CASCADE,
  grupo_id INT NOT NULL REFERENCES Grupos(id) ON DELETE RESTRICT,
  calificacion_final DECIMAL(5, 2),
  UNIQUE(alumno_id, grupo_id)
);

CREATE TABLE Calificaciones (
  id SERIAL PRIMARY KEY,
  inscripcion_id INT NOT NULL REFERENCES Inscripciones(id) ON DELETE CASCADE,
  unidad_id INT NOT NULL REFERENCES Unidades(id) ON DELETE RESTRICT,
  valor_calificacion DECIMAL(5, 2) NOT NULL,
  UNIQUE(inscripcion_id, unidad_id)
);

CREATE TABLE Asistencias (
  id SERIAL PRIMARY KEY,
  inscripcion_id INT NOT NULL REFERENCES Inscripciones(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  estatus estatus_asistencia NOT NULL,
  UNIQUE(inscripcion_id, fecha)
);

CREATE TABLE Alumnos_Factores (
  id SERIAL PRIMARY KEY,
  inscripcion_id INT NOT NULL REFERENCES Inscripciones(id) ON DELETE CASCADE,
  factor_id INT NOT NULL REFERENCES Factores_Riesgo(id) ON DELETE RESTRICT,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  observaciones TEXT,
  UNIQUE(inscripcion_id, factor_id)
);


-- #############################################################################
-- # 4. ÍNDICES PARA MEJORAR EL RENDIMIENTO DE LAS CONSULTAS
-- #############################################################################

CREATE INDEX idx_alumnos_carrera_id ON Alumnos(carrera_id);
CREATE INDEX idx_grupos_materia_id ON Grupos(materia_id);
CREATE INDEX idx_grupos_profesor_id ON Grupos(profesor_id);
CREATE INDEX idx_grupos_periodo_id ON Grupos(periodo_id);
CREATE INDEX idx_inscripciones_alumno_id ON Inscripciones(alumno_id);
CREATE INDEX idx_inscripciones_grupo_id ON Inscripciones(grupo_id);
CREATE INDEX idx_calificaciones_inscripcion_id ON Calificaciones(inscripcion_id);
CREATE INDEX idx_asistencias_inscripcion_id ON Asistencias(inscripcion_id);
CREATE INDEX idx_alumnos_factores_inscripcion_id ON Alumnos_Factores(inscripcion_id);