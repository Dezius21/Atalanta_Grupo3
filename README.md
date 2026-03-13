# 🛡️ Atalanta Cybersecurity - Proyecto FFE DAM_1 (Grupo 3)

Bienvenido al repositorio oficial del proyecto **Atalanta Cybersecurity**, desarrollado por el **Grupo 3**. Este proyecto formativo consiste en el desarrollo de la web corporativa y el sistema de gestión interna de una empresa ficticia de ciberseguridad, recreando los desafíos auténticos del ámbito profesional.

El proyecto abarca el diseño Frontend y la preparación de un Backend robusto y seguro.

---

## 🎯 Estado del Proyecto: Primera Semana (Fase 1)

Durante esta primera semana, nos hemos centrado en el diseño de la página, maquetación Frontend y la investigación/desarrollo inicial de la arquitectura Backend.

**Hitos alcanzados:**
- [x] Análisis de competidores y diseño de estructura/plan de negocio.
- [x] Desarrollo del Frontend (HTML, CSS, JS) con enfoque 100% responsivo.
- [x] Implementación de interacciones dinámicas (Menú responsive tipo hamburguesa, carruseles infinitos, animaciones al hacer scroll).
- [x] Investigación y sentada de bases para el servidor Backend y seguridad.

---

## 🏗️ Decisiones de Diseño y Metodología

Para garantizar un código limpio, mantenible y escalable, el equipo ha adoptado las siguientes directrices:

1. **Metodología BEM (Block, Element, Modifier):** Utilizada rigurosamente para estructurar las secciones de HTML, CSS y JavaScript, permitiendo que el diseño y los componentes sean reutilizables en todo el ecosistema.
2. **Consolidación de Arquitectura de la Información:** Tras analizar a la competencia y el mercado, se determinó que es más eficiente y funcional combinar las áreas de ciberseguridad, digital y formación dentro de una estructura unificada para mejorar la presentación e indexación.
3. **Limpieza Visual (UI/UX):** Se ha reemplazado el clásico formulario al final de cada página por un botón **Call to Action (CTA)** que despliega el formulario en una ventana modal, manteniendo así la armonía visual general.

---

## 📂 Estructura del Proyecto

El código fuente Frontend se ha organizado modularmente de la siguiente manera:

* `blocks/`: Archivos CSS individuales correspondientes a cada bloque o componente de la página.
* `images/`: Recursos gráficos (imágenes, logos, iconos) de uso general y específico.
* `pages/`: Archivo CSS principal que importa y coordina todos los módulos para su vinculación global.
* `scripts/`: Archivos JavaScript que controlan la interactividad y los elementos comunes.
* `vendor/`: Elementos CSS comunes o librerías de terceros (ej. `normalize.css`).

---

## 🛠️ Stack Tecnológico y Paquetes

Aunque nos encontramos en la Fase 1, el equipo ya ha definido y configurado el ecosistema tecnológico completo para cubrir tanto el cliente como el servidor:

### Frontend (UI/UX & Cliente)
* **HTML5 & CSS3:** Desarrollo estructural y manejo de elementos visuales responsivos.
* **Vanilla JavaScript:** Control del DOM, validaciones visuales e interacciones del cliente.

### Backend & Base de Datos (Core & Lógica)
* **Node.js & Express:** Control interno de la plataforma, creación del servidor y despliegue de APIs RESTful.
* **MySQL & MySQL2:** Creación, manejo de la base de datos relacional y facilitación de *queries*.

### Seguridad, Autenticación y Utilidades (AppSec)
* **Jsonwebtoken (JWT) & Bcryptjs:** Autenticación por tokens y hasheo seguro de contraseñas.
* **Helmet & Cors:** Configuración de cabeceras de seguridad web y verificación de políticas de acceso cruzado.
* **Express-rate-limit:** Protección contra ataques de fuerza bruta y Spam.
* **Express-validator:** Saneamiento y validación robusta de los datos recibidos en formularios.
* **Dotenv:** Manejo seguro de variables de entorno (preparado para la implementación de 2FA).
* **Nodemailer & Multer:** Servicio de envío de correos transaccionales y manejo seguro de subida de archivos.

---

## 👥 Equipo (Grupo 3)

El proyecto se desarrolla bajo un modelo de asunción de perfiles profesionales dentro de una empresa de ciberseguridad, asegurando que todos los miembros participen activamente en las diferentes áreas (Frontend, Backend, DBA, AppSec y Documentación).