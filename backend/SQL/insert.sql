CREATE DATABASE ATALANTA_DB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ATALANTA_DB;

CREATE TABLE usuarios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  rol        ENUM('admin','jefe','trabajador','cliente') DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE noticias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  titulo      VARCHAR(255) NOT NULL,
  slug        VARCHAR(255) NOT NULL UNIQUE,
  contenido   TEXT NOT NULL,
  imagen_url  VARCHAR(500),
  categoria   VARCHAR(100),
  publicado   BOOLEAN DEFAULT FALSE,
  autor_id    INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE contactos_general (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  apellidos  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  empresa    VARCHAR(150) NOT NULL,
  cargo      VARCHAR(100) NOT NULL,
  mensaje    TEXT,
  leido      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contactos_servicios (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  apellidos  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  empresa    VARCHAR(150) NOT NULL,
  cargo      VARCHAR(100) NOT NULL,
  interes    VARCHAR(100) NOT NULL,
  mensaje    TEXT,
  leido      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE contactos_formacion (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nombre     VARCHAR(100) NOT NULL,
  apellidos  VARCHAR(100) NOT NULL,
  email      VARCHAR(150) NOT NULL,
  empresa    VARCHAR(150) NOT NULL,
  cargo      VARCHAR(100) NOT NULL,
  interes    VARCHAR(100) NOT NULL,
  tamaño     VARCHAR(30) NOT NULL,
  leido      BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  autor_id     INT,
  asignado_a   INT DEFAULT NULL,
  titulo       VARCHAR(255) NOT NULL,
  contenido    TEXT NOT NULL,
  final        TEXT,
  estatus      ENUM('Creado','Asignado','En_progreso','Cerrado') DEFAULT 'Creado',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id)   REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE adjuntos (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    ticket_id  INT NOT NULL,
    url        VARCHAR(255) NOT NULL,
    nombre     VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
);
CREATE TABLE comentarios (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id   INT,
  autor_id    INT,
  comentario  TEXT NOT NULL,
  tipo        ENUM('comentario','cambio_estado') DEFAULT 'comentario',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id)  REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (ticket_id) REFERENCES tickets(id)  ON DELETE CASCADE
);

INSERT INTO usuarios (nombre, email, password, rol) VALUES
('Carlos Martínez', 'carlos.martinez@atalanta.com', '$2b$10$hashedpassword1', 'admin'),
('Laura Sánchez', 'laura.sanchez@atalanta.com', '$2b$10$hashedpassword2', 'jefe'),
('Marcos Ruiz', 'marcos.ruiz@atalanta.com', '$2b$10$hashedpassword3', 'trabajador'),
('Ana Gómez', 'ana.gomez@atalanta.com', '$2b$10$hashedpassword4', 'trabajador'),
('Pedro Fernández', 'pedro.fernandez@gmail.com', '$2b$10$hashedpassword5', 'cliente');

INSERT INTO noticias (titulo, slug, contenido, imagen_url, categoria, publicado, autor_id) VALUES
('Atalanta lanza nueva plataforma', 'atalanta-lanza-nueva-plataforma', 'Contenido detallado sobre el lanzamiento.', 'https://cdn.atalanta.com/img1.jpg', 'Tecnología', TRUE, 1),
('Mejoras en ciberseguridad 2025', 'mejoras-ciberseguridad-2025', 'Resumen de las mejoras implementadas.', 'https://cdn.atalanta.com/img2.jpg', 'Seguridad', TRUE, 2),
('Formación corporativa Q1', 'formacion-corporativa-q1', 'Detalles del programa de formación.', NULL, 'Formación', FALSE, 2),
('Nuevo acuerdo con socio estratégico', 'nuevo-acuerdo-socio-estrategico', 'Descripción del acuerdo y beneficios.', 'https://cdn.atalanta.com/img4.jpg', 'Empresa', TRUE, 1),
('Tendencias en IA para empresas', 'tendencias-ia-empresas', 'Análisis de tendencias actuales en IA.', 'https://cdn.atalanta.com/img5.jpg', 'Tecnología', FALSE, 3);

INSERT INTO contactos_general (nombre, apellidos, email, empresa, cargo, mensaje, leido) VALUES
('Sofía', 'López Vega', 'sofia.lopez@empresa1.com', 'TechCorp S.L.', 'Directora de IT', 'Me gustaría recibir más información sobre sus servicios.', FALSE),
('Juan', 'Pérez Mora', 'juan.perez@empresa2.com', 'Innova Group', 'CEO', 'Estamos interesados en una demo.', TRUE),
('Elena', 'Torres Gil', 'elena.torres@empresa3.com', 'DataSys', 'Analista', 'Consulta sobre precios y planes.', FALSE),
('Roberto', 'Navarro Díaz', 'roberto.navarro@empresa4.com', 'CloudBase', 'CTO', 'Necesito contactar con el equipo comercial.', TRUE),
('Marta', 'Iglesias Ríos', 'marta.iglesias@empresa5.com', 'FinGroup', 'Responsable de Compras', 'Solicitud de presupuesto personalizado.', FALSE);

INSERT INTO contactos_formacion (nombre, apellidos, email, empresa, cargo, interes, tamaño, leido) VALUES
('Lucía', 'Vargas Soto', 'lucia.vargas@form1.com', 'EduCorp', 'RRHH Manager', 'Liderazgo', '50-100', FALSE),
('Miguel', 'Ortega Blanco', 'miguel.ortega@form2.com', 'BuildIt', 'Director de Operaciones', 'Gestión de proyectos', '100-250', TRUE),
('Sara', 'Jiménez Cano', 'sara.jimenez@form3.com', 'HealthNet', 'Formadora Interna', 'Ciberseguridad', '10-50', FALSE),
('Pablo', 'Santos Ramos', 'pablo.santos@form4.com', 'AutoGroup', 'CEO', 'Transformación Digital', '250-500', FALSE),
('Nuria', 'Fuentes Prado', 'nuria.fuentes@form5.com', 'LegalTech', 'Responsable de Formación', 'Compliance', '10-50', TRUE);

INSERT INTO tickets (autor_id, titulo, contenido, estatus) VALUES
(3, 'Error en acceso al sistema', 'No puedo iniciar sesión desde ayer por la mañana.', 'Creado'),
(4, 'Fallo en exportación de reportes', 'El botón de exportar PDF no responde.', 'Asignado'),
(5, 'Solicitud de nuevo usuario', 'Se necesita crear acceso para un nuevo empleado.', 'En_progreso'),
(3, 'Problema con notificaciones', 'Las notificaciones por email no llegan.', 'Cerrado'),
(4, 'Lentitud en la plataforma', 'La carga de páginas tarda más de 10 segundos.', 'Asignado');

INSERT INTO adjuntos (ticket_id,url) VALUES
(1,'https://cdn.atalanta.com/ev1.png'),
(2,'https://cdn.atalanta.com/ev4.png'),
(3,'https://cdn.atalanta.com/ev2.png'),
(4,'https://cdn.atalanta.com/ev3.png'),
(5,'https://cdn.atalanta.com/ev5.png');

INSERT INTO comentarios (autor_id, ticket_id, comentario) VALUES
(1, 1, 'Estamos revisando el problema de acceso, en breve os damos respuesta.'),
(2, 2, 'Asignado al equipo de frontend para su revisión.'),
(3, 3, 'He enviado los datos del nuevo empleado por correo.'),
(1, 4, 'Problema resuelto tras revisar la configuración SMTP.'),
(2, 5, 'Se está analizando la carga del servidor en horas pico.');



