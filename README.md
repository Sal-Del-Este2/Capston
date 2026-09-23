# Capstone.
## Proyecto de titulo para la asignatura de Capston DucUC 2026.

<img src="https://lh3.googleusercontent.com/d/1CM4vIOPxYje2GJSF4Y6ELI2MgostpvD0" width="400px">

## Proyecto ScoutConnect.
### Descripción.
Plataforma web de gestión y comunicación para una comunidad de scout, lo que permite centralizar la administración de usuarios, actividades, noticias, cuotas, donaciones y comunicación interna, mejorando la organización y el acceso a la información.
### A quién va dirigido.
A una comunidad de scout conformado por 2 grupos.
- Likankura ubicado en Peñalolén.
- Anchimellen ubicado en Pedro Aguirre Cerda.
### Problema que resuelve.
Ambos grupos gestionan sus actividades y comunicaciones informalmente mediante redes sociales y mensajería de WhatsApp, lo que dificulta la administración de la información y el seguimiento de los procesos internos.

## Tecnologías utilizadas.
- Lenguajes.
- Frameworks.
- base de datos: PostgreSQL
- cloud

## Instrucciones para ejecutar el proyecto localmente.
1. base de datos postgreSQL
    1. Asignar la contraseña Charmander.123
    2. crear la DB con nombre scout1
    2. Restaurar la Base de datos.
2. instaladores necesarios.
    1. Instalar Java DSK
        1. Guía de instalación: https://www.youtube.com/watch?v=Gc6laPSkk-E
        2. Validar instalación en simbolo de sistema
    2. instalar Maven en equipo.
        1. Guía de instalación: https://www.youtube.com/watch?v=L_cyquTFMMw
        2. Validar instalación en simbolo de sistema
    3. Visual studio Code.
        1. Guía de instalación: https://www.youtube.com/watch?v=kEdIIAoAHvA
        2. incluir extenciones:
            1. Live server
            2. Spring Boot tool, Dashboard y Extencion pack
            3. maver for java
3. correr servicio.
    1. ejecutar en la terminar de Visual studio code ```mvn spring-boot:run```
    2. ejecutar en el codigo "open with Live Server"
## Integrantes del equipo con sus roles.
1. Esteban Salas (Líder técnico y Backend).
   ```- Análisis y Gestión de: Levantamiento de requerimientos, historias de usuario, configuración y administración de Jira, planificación de Sprint y arquitectura de microservicios.
   - Desarrollo de: Microservicio de los usuarios y seguridad, autenticación, JWT, roles, gestión de usuarios, recuperación de contraseña e integración entre microservicios.
   - Base de Datos de: Modelo conceptual, modelo lógico, modelo físico y PostgreSQL.
   - Documentación en: Casos de uso, diagramas UML, manual técnico.```
3. Jason Venegas (Backend y Base de Datos).
   ```- Base de Datos de: Modelo conceptual, modelo lógico, modelo físico y PostgreSQL.
   - Desarrollo de: Microservicio de Contenido y financiero, CRUD de noticias, actividades, productos, cuotas y donaciones.
   - Infraestructura en: Docker, despliegue y scripts de base de datos
   - Pruebas: Pruebas de calidad.```
4. Felipe Cariz (Frontend y UX/UI).
   ```- Diseño en: Figma, wireframes y prototipos.
   - Desarrollo en: Frontend, dashboards, formularios, integración con APIs y diseño responsive.
   - Pruebas en: Usabilidad y experiencia de usuario.```
## Metodología de trabajo del equipo.
El desarrollo se realizará utilizando metodología ágil Scrum, permitiendo una implementación progresiva para validar los requerimientos y funcionalidades.
## Arquitectura de la solución.
