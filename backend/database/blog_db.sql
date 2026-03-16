CREATE DATABASE IF NOT EXISTS blog_db;
USE blog_db;

CREATE TABLE usuarios (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  usuario     VARCHAR(50)  NOT NULL UNIQUE,
  correo        VARCHAR(100) NOT NULL UNIQUE,
  clave     VARCHAR(255) NOT NULL,         -- store bcrypt hash, never plaintext
  rol        ENUM('user', 'admin') NOT NULL DEFAULT 'user', -- enumeracion para controlar los roles
  fecha_alta   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  titulo        VARCHAR(255) NOT NULL,
  contenido      TEXT         NOT NULL,
  destino_imagen   VARCHAR(255), -- Permite opcion null en caso de subida sin imagen
  id_autor    INT,
  fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_autor) REFERENCES usuarios(id) ON DELETE SET NULL
);

SHOW TABLES;
DESCRIBE usuarios;
DESCRIBE posts;
