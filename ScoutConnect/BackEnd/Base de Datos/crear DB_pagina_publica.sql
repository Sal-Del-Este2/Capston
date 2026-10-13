-- 1.
CREATE TABLE regiones (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO regiones (nombre)
VALUES ('Arica y Parinacota'),('Tarapacá'),('Antofagasta'),('Atacama'),
('Coquimbo'),('Valparaíso'),('Metropolitana de Santiago'),
('Libertador General Bernardo OHiggins'),('Maule'),('Ñuble'),('Biobío'),
('Araucanía'),('Los Ríos'),('Los Lagos'),('Aysén del General Carlos Ibáñez del Campo'),
('Magallanes y de la Antártica Chilena')
select * from regiones order by id;

-- 2
CREATE TABLE comunas (
    id BIGSERIAL PRIMARY KEY,
    region_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT fk_comuna_region FOREIGN KEY (region_id) REFERENCES regiones(id),
    CONSTRAINT uq_comuna_por_region UNIQUE (region_id, nombre)
);
INSERT INTO comunas (nombre, region_id)
VALUES ('Colina',7),('Lampa',7),('Til Til',7),('Pirque',7),('Puente Alto',7),('San José de Maipo',7),('Buin',7),
('Calera de Tango',7),('Paine',7),('San Bernardo',7),('Alhué',7),('Curacaví',7),('María Pinto',7),('Melipilla',7),
('San Pedro',7),('Cerrillos',7),('Cerro Navia',7),('Conchalí',7),('El Bosque',7),('Estación Central',7),
('Huechuraba',7),('Independencia',7),('La Cisterna',7),('La Granja',7),('La Florida',7),('La Pintana',7),
('La Reina',7),('Las Condes',7),('Lo Barnechea',7),('Lo Espejo',7),('Lo Prado',7),('Macul',7),('Maipú',7),
('Ñuñoa',7),('Pedro Aguirre Cerda',7),('Peñalolén',7),('Providencia',7),('Pudahuel',7),('Quilicura',7),
('Quinta Normal',7),('Recoleta',7),('Renca',7),('San Miguel',7),('San Joaquín',7),('San Ramón',7),('Santiago',7),
('Vitacura',7),('El Monte',7),('Isla de Maipo',7),('Padre Hurtado',7),('Peñaflor',7),('Talagante',7);
select * from comunas order by id;

-- 3
CREATE TABLE reinos (
    id BIGSERIAL PRIMARY KEY,
    comuna_id BIGINT NOT NULL,
    nombre VARCHAR(120) NOT NULL UNIQUE,
    descripcion VARCHAR(500),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reino_comuna FOREIGN KEY (comuna_id) REFERENCES comunas(id)
);
INSERT INTO reinos (comuna_id, nombre, descripcion)
VALUES
(36, 'Reino Likankura', 'Grupo Scout ubicado en la comuna de Peñalolén.'),
(35, 'Reino Anchimellen', 'Grupo Scout ubicado en la comuna de Pedro Aguirre Cerda.');

-- 4
CREATE TABLE ubicaciones (
    id BIGSERIAL PRIMARY KEY,
    comuna_id BIGINT NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(500),
    direccion VARCHAR(255),
    latitud NUMERIC(10,7),
    longitud NUMERIC(10,7),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ubicacion_comuna FOREIGN KEY (comuna_id) REFERENCES comunas(id),
    CONSTRAINT uq_ubicacion_nombre UNIQUE (nombre)
);

-- 5
CREATE TABLE informacion_institucional (
    id BIGSERIAL PRIMARY KEY,
    nombre_institucion VARCHAR(200) NOT NULL,
    mision TEXT,
    vision TEXT,
    historia TEXT,
    valores TEXT,
    correo_contacto VARCHAR(150),
    telefono_contacto VARCHAR(30),
    sitio_web VARCHAR(255),
    logo_url VARCHAR(500),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_informacion_unica UNIQUE (id)
);
INSERT INTO informacion_institucional (
    nombre_institucion, mision, vision, historia, valores
)
VALUES (
    'Comunidad Scout',
    'Misión institucional inicial.',
    'Visión institucional inicial.',
    'Historia institucional inicial.',
    'Valores institucionales iniciales.'
);

-- 6
CREATE TABLE contactos_reino (
    id BIGSERIAL PRIMARY KEY,
    reino_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    cargo VARCHAR(120),
    correo VARCHAR(150),
    telefono VARCHAR(30),
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_asignacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_desactivacion TIMESTAMP,
    CONSTRAINT fk_contacto_reino FOREIGN KEY (reino_id) REFERENCES reinos(id),
    -- El usuario pertenece al microservicio de usuarios.
    CONSTRAINT uq_contacto_usuario_reino_activo UNIQUE (reino_id, usuario_id, activo)
);

-- 7
CREATE TABLE tipos_politica (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(300)
);
INSERT INTO tipos_politica (nombre, descripcion)
VALUES
('Privacidad', 'Políticas relacionadas con el tratamiento de datos personales.'),
('Uso de la plataforma', 'Reglas de uso de la plataforma.'),
('Convivencia', 'Normas de convivencia y comportamiento.'),
('Seguridad', 'Políticas de seguridad y prevención.');

-- 8. POLÍTICAS
CREATE TABLE politicas (
    id BIGSERIAL PRIMARY KEY,
    tipo_politica_id BIGINT NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    publicada BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_publicacion TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_politica_tipo FOREIGN KEY (tipo_politica_id) REFERENCES tipos_politica(id)
);
INSERT INTO politicas (tipo_politica_id, titulo, contenido, publicada)
VALUES
(1, 'Política de privacidad', 'Contenido inicial de la política de privacidad.', FALSE),
(2, 'Política de uso de la plataforma', 'Contenido inicial de la política de uso.', FALSE);
select * from politicas order by id;

-- selec general
SELECT
    r.id AS reino_id,
    r.nombre AS reino,
    c.nombre AS comuna,
    reg.nombre AS region,
    r.activo AS reino_activo
FROM reinos r
INNER JOIN comunas c ON c.id = r.comuna_id
INNER JOIN regiones reg ON reg.id = c.region_id
ORDER BY r.id;