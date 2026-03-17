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
  evidence_url VARCHAR(255),
  estatus      ENUM('Creado','Asignado','En_progreso','Cerrado') DEFAULT 'Creado',
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (autor_id)   REFERENCES usuarios(id) ON DELETE SET NULL,
  FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL
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