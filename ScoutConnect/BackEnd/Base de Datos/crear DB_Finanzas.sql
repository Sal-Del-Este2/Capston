-- 1 grupos scout
CREATE TABLE grupos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO grupos (nombre) VALUES
    ('Reino Likankura'),('Reino Anchimellen');
	
-- 2. Ramas scout
CREATE TABLE ramas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);
INSERT INTO ramas (nombre) VALUES
    ('Manada'), ('Tropa'), ('Avanzada'), ('Clan');

--3 estados
CREATE TABLE estados_orden (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_orden (nombre) VALUES
    ('PENDIENTE'),('EN_PROCESO'),('PENDIENTE_ENTREGA'),('ENTREGADO'),('CANCELADO');

-- 4 estado pago
CREATE TABLE estados_pago (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_pago (nombre) VALUES
    ('PENDIENTE'),('PAGADO'),('RECHAZADO'),('ANULADO');

-- 5 estado cuotas
CREATE TABLE estados_cuota (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_cuota (nombre) VALUES
    ('PENDIENTE'),('PAGADA');

-- 6 Tipos donacion
CREATE TABLE tipos_donacion (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO tipos_donacion (nombre) VALUES
    ('ANONIMA'),('IDENTIFICADA');

-- 7 productos
CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    detalle VARCHAR(1000) NOT NULL,
    precio DOUBLE PRECISION NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    grupo_id BIGINT NOT NULL,
    rama_id BIGINT NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_producto_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id),
    CONSTRAINT fk_producto_rama FOREIGN KEY (rama_id) REFERENCES ramas(id)
);

-- 8 fotos del producto
CREATE TABLE fotos_producto (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL UNIQUE,
    tipo_contenido VARCHAR(100) NOT NULL,
    tamanio_bytes BIGINT NOT NULL,
    orden_visualizacion SMALLINT NOT NULL CHECK (orden_visualizacion BETWEEN 1 AND 3),
    fecha_carga TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_foto_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT uq_foto_producto_orden UNIQUE (producto_id, orden_visualizacion),
	CONSTRAINT ck_foto_tipo CHECK (tipo_contenido IN (
		'image/jpeg',
		'image/png')
	)
);

-- 9 ordenes de la compra
CREATE TABLE ordenes_compra (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    total DOUBLE PRECISION NOT NULL,
    estado_id BIGINT NOT NULL, -- PENDIENTE, EN_PROCESO, PENDIENTE_ENTREGA, ENTREGADO, CANCELADO
    fecha TIMESTAMP WITHOUT TIME ZONE NULL,
    pago_id BIGINT NULL,
	CONSTRAINT fk_orden_estado FOREIGN KEY (estado_id) REFERENCES estados_orden(id)
);

-- 10 detalle de la compra
CREATE TABLE detalle_compra (
    id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DOUBLE PRECISION NOT NULL CHECK (precio_unitario >= 0),
	CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
	CONSTRAINT fk_detalle_orden FOREIGN KEY (orden_id) REFERENCES ordenes_compra(id)
);

-- 11 pagos
CREATE TABLE pagos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo_pago VARCHAR(255) NOT NULL,
    descripcion VARCHAR(255) NULL,
    monto DOUBLE PRECISION NOT NULL,
    estado_id BIGINT NOT NULL, -- PENDIENTE, PAGADO, RECHAZADO, ANULADO
    commerce_order VARCHAR(255) NULL,
    token_flow VARCHAR(255) NULL,
    flow_order VARCHAR(255) NULL,
    flow_status VARCHAR(255) NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NULL,
    fecha_pago TIMESTAMP WITHOUT TIME ZONE NULL,
    cuota_id BIGINT NULL,
	CONSTRAINT fk_pago_estado FOREIGN KEY (estado_id) REFERENCES estados_pago(id)
);
	
-- 12 cuotas
CREATE TABLE cuotas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    anio INTEGER NOT NULL,
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    monto DOUBLE PRECISION NOT NULL CHECK (monto >= 0),
    fecha_vencimiento DATE NOT NULL,
    estado_id BIGINT NOT NULL, -- PENDIENTE, PAGADA
    pago_id BIGINT NULL,
	CONSTRAINT fk_cuota_estado FOREIGN KEY (estado_id) REFERENCES estados_cuota(id),
	CONSTRAINT uq_cuota_usuario_periodo UNIQUE (usuario_id, anio, mes) -- una cuota por mes y año
);
	
-- 13 donaciones
CREATE TABLE donaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NULL, -- para incluir sin necesidad de iniciar sesion
    tipo_donacion_id BIGINT NOT NULL, -- ANONIMA, IDENTIFICADA
    monto DOUBLE PRECISION NOT NULL CHECK (monto >= 0),
    fecha TIMESTAMP WITHOUT TIME ZONE NULL,
    pago_id BIGINT NULL,
    grupo_id BIGINT NULL, -- para incluir sin necesidad de iniciar sesion
	CONSTRAINT fk_donacion_tipo FOREIGN KEY (tipo_donacion_id) REFERENCES tipos_donacion(id),
	CONSTRAINT fk_donacion_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id) 
);

-- 14 pagos backup
CREATE TABLE pagos_backup (
    id BIGINT NULL,
    comprobante VARCHAR(255) NULL,
    descripcion VARCHAR(255) NULL,
    estado VARCHAR(255) NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE NULL,
    metodo_pago VARCHAR(255) NULL,
    monto DOUBLE PRECISION NULL,
    observaciones VARCHAR(255) NULL,
    tipo VARCHAR(255) NULL,
    token_flow VARCHAR(255) NULL,
    transaction_id VARCHAR(255) NULL,
    url_retorno VARCHAR(255) NULL,
    usuario_id BIGINT NULL,
    commerce_order VARCHAR(255) NULL,
    flow_status VARCHAR(255) NULL
);

-- 15 pagos antiguos
CREATE TABLE pagos_old (
    id BIGINT NOT NULL PRIMARY KEY,
    comprobante VARCHAR(255) NULL,
    descripcion VARCHAR(255) NULL,
    estado VARCHAR(255) NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE NULL,
    metodo_pago VARCHAR(255) NULL,
    monto DOUBLE PRECISION NULL,
    observaciones VARCHAR(255) NULL,
    tipo VARCHAR(255) NULL,
    token_flow VARCHAR(255) NULL,
    transaction_id VARCHAR(255) NULL,
    url_retorno VARCHAR(255) NULL,
    usuario_id BIGINT NULL,
    commerce_order VARCHAR(255) NULL,
    flow_status VARCHAR(255) NULL
);

-- indexaciones para mejorar consultas
CREATE INDEX idx_productos_grupo ON productos(grupo_id);
CREATE INDEX idx_productos_rama ON productos(rama_id);
CREATE INDEX idx_detalle_orden ON detalle_compra(orden_id);
CREATE INDEX idx_detalle_producto ON detalle_compra(producto_id);
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_token ON pagos(token_flow);
CREATE INDEX idx_cuotas_usuario ON cuotas(usuario_id);
CREATE INDEX idx_donaciones_usuario ON donaciones(usuario_id);
CREATE INDEX idx_ordenes_usuario ON ordenes_compra(usuario_id);