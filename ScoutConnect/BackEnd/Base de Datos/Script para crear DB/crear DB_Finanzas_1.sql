-- 1 Estados grupo
CREATE TABLE estados_grupo (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_grupo (nombre) VALUES
    ('ACTIVO'),('INACTIVO');

-- 2 Estados rama
CREATE TABLE estados_rama (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_rama (nombre) VALUES
    ('ACTIVO'),('INACTIVO');

-- 3 Estados producto
CREATE TABLE estados_producto (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_producto (nombre) VALUES
    ('ACTIVO'),('PAUSADO');

-- 4 Estados configuración de cuotas
CREATE TABLE estados_configuracion_cuota (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_configuracion_cuota (nombre) VALUES
    ('ACTIVA'),('INACTIVA');

-- 5 estados orden
CREATE TABLE estados_orden (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_orden (nombre) VALUES
    ('PENDIENTE'),('EN_PROCESO'),('PENDIENTE_ENTREGA'),('ENTREGADO'),('CANCELADO');

-- 6 estado pago
CREATE TABLE estados_pago (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_pago (nombre) VALUES
    ('PENDIENTE'),('PAGADO'),('RECHAZADO'),('ANULADO');

-- 7 estado cuotas
CREATE TABLE estados_cuota (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_cuota (nombre) VALUES
    ('PENDIENTE'),('PAGADA');

-- 8 Tipos donación
CREATE TABLE tipos_donacion (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO tipos_donacion (nombre) VALUES
    ('ANONIMA'),('IDENTIFICADA');

-- 9 Estado impuesto
CREATE TABLE estados_impuesto (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO estados_impuesto (nombre) VALUES
    ('ACTIVO'),('INACTIVO');

-- 10 impuesto iva
CREATE TABLE impuestos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    porcentaje NUMERIC(5,2) NOT NULL CHECK (porcentaje >= 0 AND porcentaje <= 100),
    vigente_desde DATE NOT NULL,
    estado_impuesto_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_impuesto_estado FOREIGN KEY (estado_impuesto_id) REFERENCES estados_impuesto(id)
);
INSERT INTO impuestos (
    nombre, codigo, porcentaje, vigente_desde, estado_impuesto_id
)
VALUES (
    'IVA','IVA',19.00,DATE '2003-10-01',
	(SELECT id FROM estados_impuesto
	WHERE nombre = 'ACTIVO')
);

-- 11 Grupos scout
CREATE TABLE grupos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado_grupo_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_grupo_estado FOREIGN KEY (estado_grupo_id) REFERENCES estados_grupo(id)
);
INSERT INTO grupos (nombre, estado_grupo_id)
VALUES
    ('Reino Likankura', 1),('Reino Anchimellen', 1);

-- 12 Ramas scout
CREATE TABLE ramas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    estado_rama_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_rama_estado FOREIGN KEY (estado_rama_id) REFERENCES estados_rama(id)
);
INSERT INTO ramas (nombre, estado_rama_id)
VALUES
    ('Manada', 1),('Tropa', 1),('Avanzada', 1),('Clan', 1);

-- 13 productos
CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(180) NOT NULL,
    detalle VARCHAR(200) NOT NULL,
    precio NUMERIC(12,0) NOT NULL CHECK (precio >= 0 AND precio <= 99999999), -- neto sin IVA
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    grupo_id BIGINT NOT NULL,
    rama_id BIGINT NOT NULL,
    estado_producto_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_producto_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id),
    CONSTRAINT fk_producto_rama FOREIGN KEY (rama_id) REFERENCES ramas(id),
    CONSTRAINT fk_producto_estado FOREIGN KEY (estado_producto_id) REFERENCES estados_producto(id)
);
CREATE INDEX idx_productos_grupo ON productos(grupo_id);
CREATE INDEX idx_productos_rama ON productos(rama_id);
CREATE INDEX idx_productos_estado ON productos(estado_producto_id);
CREATE INDEX idx_productos_grupo_estado ON productos(grupo_id, estado_producto_id);

-- 14 fotos del producto
CREATE TABLE fotos_producto (
    id BIGSERIAL PRIMARY KEY,
    producto_id BIGINT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL UNIQUE,
    tipo_contenido VARCHAR(100) NOT NULL,
    tamanio_bytes BIGINT NOT NULL CHECK (tamanio_bytes > 0),
    orden_visualizacion SMALLINT NOT NULL CHECK (orden_visualizacion BETWEEN 1 AND 3),
    fecha_carga TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_foto_producto FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
    CONSTRAINT uq_foto_producto_orden UNIQUE (producto_id, orden_visualizacion),
    CONSTRAINT ck_foto_tipo CHECK (tipo_contenido IN ('image/jpeg', 'image/png'))
);
CREATE INDEX idx_fotos_producto ON fotos_producto(producto_id);

-- 15 pagos genéricos (cuota, donación, orden de compra)
CREATE TABLE pagos (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NULL,
    monto NUMERIC(12,0) NOT NULL CHECK (monto > 0),
    descripcion VARCHAR(255) NULL,
    estado_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_pago TIMESTAMP WITHOUT TIME ZONE NULL,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_pago_estado FOREIGN KEY (estado_id) REFERENCES estados_pago(id)
);
CREATE INDEX idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX idx_pagos_estado ON pagos(estado_id);
CREATE INDEX idx_pagos_fecha ON pagos(fecha_creacion DESC);

-- 16 webpay plus
CREATE TABLE transacciones_webpay (
    id BIGSERIAL PRIMARY KEY,
    pago_id BIGINT NOT NULL,
    token_ws VARCHAR(64) NOT NULL UNIQUE,
    url_webpay VARCHAR(500) NOT NULL,
    buy_order VARCHAR(100) NOT NULL UNIQUE,
    session_id VARCHAR(100) NOT NULL,
    monto NUMERIC(12,0) NOT NULL CHECK (monto > 0),
    estado_webpay VARCHAR(50) NULL,
    vci VARCHAR(10) NULL,
    response_code INTEGER NULL,
    authorization_code VARCHAR(50) NULL,
    payment_type_code VARCHAR(10) NULL,
    installments_number INTEGER NULL,
    installments_amount NUMERIC(12,0) NULL,
    card_number VARCHAR(20) NULL,
    accounting_date VARCHAR(10) NULL,
    transaction_date TIMESTAMP WITHOUT TIME ZONE NULL,
    respuesta_completa JSONB NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_transaccion_pago FOREIGN KEY (pago_id) REFERENCES pagos(id) ON DELETE CASCADE,
    CONSTRAINT ck_transaccion_monto CHECK (monto > 0)
);
CREATE INDEX idx_transacciones_pago ON transacciones_webpay(pago_id);
CREATE INDEX idx_transacciones_buy_order ON transacciones_webpay(buy_order);
CREATE INDEX idx_transacciones_estado ON transacciones_webpay(estado_webpay);

-- 17 ordenes de la compra
CREATE TABLE ordenes_compra (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    total NUMERIC(12,0) NOT NULL CHECK (total >= 0), -- neto + monto_impuesto
    neto NUMERIC(12,0) NOT NULL CHECK (neto >= 0), -- suma de subtotales sin IVA
    monto_impuesto NUMERIC(12,0) NOT NULL CHECK (monto_impuesto >= 0), -- IVA 19%
    impuesto_id BIGINT NOT NULL,
    estado_id BIGINT NOT NULL,
    pago_id BIGINT NULL,
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_orden_estado FOREIGN KEY (estado_id) REFERENCES estados_orden(id),
    CONSTRAINT fk_orden_pago FOREIGN KEY (pago_id) REFERENCES pagos(id),
    CONSTRAINT fk_orden_impuesto FOREIGN KEY (impuesto_id) REFERENCES impuestos(id),
    CONSTRAINT ck_orden_totales CHECK (total = neto + monto_impuesto)
);
CREATE INDEX idx_ordenes_usuario ON ordenes_compra(usuario_id);
CREATE INDEX idx_ordenes_estado ON ordenes_compra(estado_id);
CREATE INDEX idx_ordenes_fecha ON ordenes_compra(fecha DESC);
CREATE INDEX idx_ordenes_pago ON ordenes_compra(pago_id);
CREATE INDEX idx_ordenes_impuesto ON ordenes_compra(impuesto_id);

-- 18 detalle de la compra
CREATE TABLE detalle_compra (
    id BIGSERIAL PRIMARY KEY,
    orden_id BIGINT NOT NULL,
    producto_id BIGINT NOT NULL,
    nombre_producto VARCHAR(180) NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12,0) NOT NULL CHECK (precio_unitario >= 0), -- netos
    subtotal NUMERIC(12,0) NOT NULL CHECK (subtotal >= 0), -- netos
    neto NUMERIC(12,0) NOT NULL CHECK (neto >= 0),
    monto_impuesto NUMERIC(12,0) NOT NULL CHECK (monto_impuesto >= 0), -- IVA calculado sobre el subtotal
    impuesto_id BIGINT NOT NULL,
    CONSTRAINT fk_detalle_orden FOREIGN KEY (orden_id) REFERENCES ordenes_compra(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_detalle_impuesto FOREIGN KEY (impuesto_id) REFERENCES impuestos(id),
    CONSTRAINT uq_detalle_orden_producto UNIQUE (orden_id, producto_id),
    CONSTRAINT ck_detalle_subtotal CHECK (subtotal = cantidad * precio_unitario),
    CONSTRAINT ck_detalle_totales CHECK (neto >= 0 AND monto_impuesto >= 0 AND subtotal = neto + monto_impuesto)
);
CREATE INDEX idx_detalle_orden ON detalle_compra(orden_id);
CREATE INDEX idx_detalle_producto ON detalle_compra(producto_id);
CREATE INDEX idx_detalle_impuesto ON detalle_compra(impuesto_id);

-- 19 definir cuotas
CREATE TABLE configuracion_cuotas (
    id BIGSERIAL PRIMARY KEY,
    monto NUMERIC(12,0) NOT NULL CHECK (monto >= 0),
    vigente_desde DATE NOT NULL,
    estado_configuracion_id BIGINT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_configuracion_estado FOREIGN KEY (estado_configuracion_id) REFERENCES estados_configuracion_cuota(id)
);
CREATE INDEX idx_configuracion_cuotas_estado ON configuracion_cuotas(estado_configuracion_id, vigente_desde DESC);

-- 20 pago cuotas
CREATE TABLE cuotas (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    anio INTEGER NOT NULL CHECK (anio BETWEEN 2000 AND 2100),
    mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
    monto NUMERIC(12,0) NOT NULL CHECK (monto >= 0),
    fecha_vencimiento DATE NOT NULL,
    estado_id BIGINT NOT NULL,
    pago_id BIGINT NULL,
    grupo_id BIGINT NULL,
    rama_id BIGINT NULL,
    fecha_pago TIMESTAMP WITHOUT TIME ZONE NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_cuota_estado FOREIGN KEY (estado_id) REFERENCES estados_cuota(id),
    CONSTRAINT fk_cuota_pago FOREIGN KEY (pago_id) REFERENCES pagos(id),
    CONSTRAINT fk_cuota_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id),
    CONSTRAINT fk_cuota_rama FOREIGN KEY (rama_id) REFERENCES ramas(id),
    CONSTRAINT uq_cuota_usuario_periodo UNIQUE (usuario_id, anio, mes)
);
CREATE INDEX idx_cuotas_usuario ON cuotas(usuario_id);
CREATE INDEX idx_cuotas_estado ON cuotas(estado_id);
CREATE INDEX idx_cuotas_grupo ON cuotas(grupo_id);
CREATE INDEX idx_cuotas_rama ON cuotas(rama_id);
CREATE INDEX idx_cuotas_vencimiento ON cuotas(fecha_vencimiento);
CREATE INDEX idx_cuotas_pago ON cuotas(pago_id);

-- 21 donaciones
CREATE TABLE donaciones (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NULL,
    tipo_donacion_id BIGINT NOT NULL,
    nombre_donante VARCHAR(180) NULL,
    correo_donante VARCHAR(180) NULL,
    monto NUMERIC(12,0) NOT NULL CHECK (monto > 0),
    fecha TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    pago_id BIGINT NULL,
    grupo_id BIGINT NULL,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_donacion_tipo FOREIGN KEY (tipo_donacion_id) REFERENCES tipos_donacion(id),
    CONSTRAINT fk_donacion_pago FOREIGN KEY (pago_id) REFERENCES pagos(id),
    CONSTRAINT fk_donacion_grupo FOREIGN KEY (grupo_id) REFERENCES grupos(id)
);
CREATE INDEX idx_donaciones_usuario ON donaciones(usuario_id);
CREATE INDEX idx_donaciones_grupo ON donaciones(grupo_id);
CREATE INDEX idx_donaciones_fecha ON donaciones(fecha DESC);
CREATE INDEX idx_donaciones_pago ON donaciones(pago_id);


