# Atalanta Cybersecurity - Proyecto FFE DAM (Grupo 3)

Este es el repositorio oficial del proyecto Atalanta Cybersecurity, desarrollado por el Grupo 3. Este proyecto formativo consiste en el desarrollo de la web corporativa y el sistema de gestión interna de una empresa de ciberseguridad, recreando los desafíos del ámbito profesional.

---

## Estado del Proyecto: Primera Semana (Fase 1)

Durante la primera semana, el trabajo se centró en el diseño de la página, maquetación Frontend y la investigación inicial de la arquitectura Backend.

**Hitos alcanzados:**
* Análisis de competidores y diseño de estructura/plan de negocio.
* Desarrollo del Frontend (HTML, CSS, JS) con enfoque responsivo.
* Implementación de interacciones dinámicas como menús tipo hamburguesa, carruseles y animaciones de scroll.
* Creación del repositorio y definición de la estructura base del proyecto.

---

## Estado del Proyecto: Segunda Semana (Fase 2)

En esta fase, el sistema ha evolucionado para incluir una base de datos real, lógica de servidor y un sistema completo de gestión de incidencias.

**Hitos alcanzados:**
* Implementación de Base de Datos: Diseño y creación del modelo relacional en MySQL para gestionar usuarios, roles y tickets.
* Sistema de Autenticación: Registro y acceso funcional con validación de datos y almacenamiento de contraseñas hasheadas.
* Control de Acceso por Roles: Configuración de permisos específicos para los niveles de Cliente, Trabajador, Jefe y Administrador.
* Módulo de Incidencias: Desarrollo de la funcionalidad para crear, asignar y gestionar el ciclo de vida de los tickets.
* Integración Full-Stack: Conexión dinámica entre el cliente y el servidor mediante peticiones fetch para la gestión de datos en tiempo real.

---

## Sistema de Gestión de Incidencias (Tickets)

Se ha implementado un flujo de trabajo que cubre las necesidades operativas de la organización:
* Cliente: Puede crear tickets de incidencia incluyendo capturas de imagen o vídeo como evidencia.
* Jefe de Área: Gestiona la asignación de tickets a los trabajadores y supervisa el estado general.
* Trabajador: Tiene acceso a sus tickets asignados para cambiar su estado y añadir comentarios en el historial.
* Administrador: Posee control total sobre la base de datos y la gestión de roles de los usuarios.

---

## Decisiones de Diseño y Metodología

Para garantizar un código mantenible y escalable, el equipo adoptó las siguientes directrices:
1. Metodología BEM (Block, Element, Modifier): Utilizada para estructurar HTML, CSS y JavaScript de forma reutilizable.
2. Consolidación de Información: Se combinaron las áreas de ciberseguridad, digital y formación en una sección unificada de Servicios para mejorar la indexación.
3. Interfaz de Usuario (UI/UX): Se sustituyó el formulario fijo por un botón de llamada a la acción (CTA) que despliega el formulario de forma modal.

---

## Estructura del Proyecto

El código fuente se organiza de forma modular para separar las responsabilidades:
* blocks/: Archivos CSS individuales por cada componente.
* images/: Recursos gráficos y archivos multimedia.
* pages/: Archivo CSS principal que coordina la vinculación global.
* scripts/: Archivos JavaScript para la interactividad del frontend.
* vendor/: Librerías externas y estilos comunes.
* backend/: Lógica de servidor, rutas de API y conexión a base de datos.

---

## Stack Tecnológico y Paquetes

### Frontend
* HTML5 y CSS3: Desarrollo estructural y visual.
* Vanilla JavaScript: Control del DOM y validaciones de cliente.

### Backend y Base de Datos
* Node.js y Express: Servidor y creación de la API.
* MySQL y MySQL2: Motor de base de datos relacional y conector.
* Jsonwebtoken (JWT): Autenticación basada en tokens.
* Argon2: Hasheo seguro de credenciales.
* Multer: Gestión de subida de archivos para evidencias.

### Seguridad y Utilidades
* Helmet: Configuración de cabeceras de seguridad web.
* Cors: Control de políticas de acceso cruzado.
* Express-validator: Saneamiento y validación de datos en formularios.
* Express-rate-limit: Prevención de ataques de fuerza bruta y spam.
* Dotenv: Manejo de variables de entorno.
* Nodemailer: Envío de notificaciones por correo electrónico.

---

## Seguridad y Auditoría

Se han realizado pruebas de seguridad activa para mitigar riesgos en la plataforma:
* Verificación contra Inyección SQL en formularios de acceso y gestión de tickets.
* Control de ataques XSS en campos de comentarios y áreas visibles.
* Prevención de vulnerabilidades IDOR para asegurar que los usuarios solo accedan a sus propios datos.
* Revisión de permisos para evitar el acceso a endpoints sin el rol adecuado.

---

## Grupo 3

El proyecto se desarrolla bajo un modelo de asunción de perfiles profesionales, donde cada miembro participa en las áreas de Frontend, Backend, Base de Datos y Seguridad.