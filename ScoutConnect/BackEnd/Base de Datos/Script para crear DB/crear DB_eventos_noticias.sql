-- 1
CREATE TABLE regiones (
    id BIGSERIAL PRIMARY KEY,nombre VARCHAR(100) UNIQUE NOT NULL);
INSERT INTO regiones (nombre)
VALUES ('Arica y Parinacota'),('Tarapacá'),('Antofagasta'),('Atacama'),
('Coquimbo'),('Valparaíso'),('Metropolitana de Santiago'),
('Libertador General Bernardo OHiggins'),('Maule'),('Ñuble'),('Biobío'),
('Araucanía'),('Los Ríos'),('Los Lagos'),('Aysén del General Carlos Ibáñez del Campo'),
('Magallanes y de la Antártica Chilena');
select * from regiones order by id;

-- 2
CREATE TABLE comunas (
    id BIGSERIAL PRIMARY KEY, nombre VARCHAR(100) UNIQUE NOT NULL, region_id BIGINT,
	CONSTRAINT
	fk_comunas_regiones FOREIGN KEY (region_id) REFERENCES regiones(id) ON UPDATE CASCADE ON DELETE SET NULL);
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

--2
CREATE TABLE grupos (
    id BIGSERIAL PRIMARY KEY, nombre VARCHAR(100) NOT NULL, comuna_id BIGINT,
	CONSTRAINT fk_grupos_comunas FOREIGN KEY (comuna_id) REFERENCES comunas(id) ON UPDATE CASCADE ON DELETE SET NULL);
INSERT INTO grupos (nombre, comuna_id)
VALUES ('Reino Likankura',36),('Reino Anchimellen',35);
select * from grupos;

-- 3
CREATE TABLE estados_contenido (
    id SMALLSERIAL PRIMARY KEY,
    nombre VARCHAR(20) NOT NULL UNIQUE
);
INSERT INTO estados_contenido (nombre)
VALUES ('PENDIENTE'), ('EN_CURSO'), ('FINALIZADA');

-- 4
CREATE TABLE noticias (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    fecha_realizacion DATE NOT NULL,
    lugar VARCHAR(180) NOT NULL,
    estado_id SMALLINT NOT NULL,
    detalle VARCHAR(500) NOT NULL,
    creador_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	grupo_id BIGINT,
	comuna_id BIGINT,
    CONSTRAINT fk_noticia_estado FOREIGN KEY (estado_id) REFERENCES estados_contenido(id),
	CONSTRAINT fk_noticias_grupos FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT fk_noticias_comunas FOREIGN KEY (comuna_id) REFERENCES comunas(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT ck_noticia_detalle CHECK (char_length(detalle) BETWEEN 1 AND 500)

);

-- 5
CREATE TABLE eventos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    fecha_realizacion DATE NOT NULL,
    lugar VARCHAR(180) NOT NULL,
    estado_id SMALLINT NOT NULL,
    detalle VARCHAR(500) NOT NULL,
    creador_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	grupo_id BIGINT,
	comuna_id BIGINT,
    CONSTRAINT fk_evento_estado FOREIGN KEY (estado_id) REFERENCES estados_contenido(id),
	CONSTRAINT fk_eventos_grupos FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON UPDATE CASCADE ON DELETE SET NULL,
	CONSTRAINT fk_eventos_comunas FOREIGN KEY (comuna_id) REFERENCES comunas(id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT ck_evento_detalle CHECK (char_length(detalle) BETWEEN 1 AND 500)
);
select * from eventos;

-- 6
CREATE TABLE fotos_evento (
    id BIGSERIAL PRIMARY KEY,
    evento_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_contenido VARCHAR(100) NOT NULL,
    tamanio_bytes BIGINT NOT NULL,
    es_principal BOOLEAN NOT NULL DEFAULT FALSE,
    orden_visualizacion SMALLINT NOT NULL DEFAULT 1,
    fecha_carga TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_foto_evento FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
    CONSTRAINT ck_foto_tipo CHECK (tipo_contenido IN (
		'image/jpeg',
		'image/png',
		'image/heic',
		'image/heif',
		'image/heif-sequence'
        )
    ),
    CONSTRAINT ck_foto_orden CHECK (orden_visualizacion BETWEEN 1 AND 20)
);

-- indice para que una fotografia tenga un indice parcial para dejar 1 foto como principal.
CREATE UNIQUE INDEX ux_una_foto_principal_evento
ON fotos_evento (evento_id)
WHERE es_principal = TRUE;
