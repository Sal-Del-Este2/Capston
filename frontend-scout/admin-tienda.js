let productos = [];
let pedidos = [];
let imagenTemporal = "";

const TIPOS_IMAGEN_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "image/webp"
];

const TAMANO_MAXIMO_IMAGEN =
    2 * 1024 * 1024;


/* ========================================
ELEMENTOS DEL HTML
======================================== */

const listaProductos =
    document.getElementById("lista-productos-admin");

const listaPedidos =
    document.getElementById("lista-pedidos-admin");

const productosActivos =
    document.getElementById("productos-activos-admin");

const productosStockBajo =
    document.getElementById("stock-bajo-admin");

const pedidosPendientes =
    document.getElementById("pedidos-pendientes-admin");

const totalVendido =
    document.getElementById("total-vendido-admin");

const pestanaProductos =
    document.getElementById("pestana-productos");

const pestanaPedidos =
    document.getElementById("pestana-pedidos");

const seccionProductos =
    document.getElementById("seccion-productos-admin");

const seccionPedidos =
    document.getElementById("seccion-pedidos-admin");

const buscarProducto =
    document.getElementById("buscar-producto");

const filtroCategoria =
    document.getElementById("filtro-categoria-producto");

const filtroEstadoProducto =
    document.getElementById("filtro-estado-producto");

const buscarPedido =
    document.getElementById("buscar-pedido");

const filtroEstadoPedido =
    document.getElementById("filtro-estado-pedido");

const sinResultadosProductos =
    document.getElementById("sin-resultados-productos");

const sinResultadosPedidos =
    document.getElementById("sin-resultados-pedidos");

const botonNuevoProducto =
    document.getElementById("boton-nuevo-producto");

const contenedorFormulario =
    document.getElementById(
        "contenedor-formulario-producto"
    );

const formularioProducto =
    document.getElementById("form-producto");

const tituloFormulario =
    document.getElementById(
        "titulo-formulario-producto"
    );

const cerrarFormulario =
    document.getElementById(
        "cerrar-formulario-producto"
    );

const cancelarFormulario =
    document.getElementById(
        "cancelar-formulario-producto"
    );

const inputImagen =
    document.getElementById("imagen-producto-admin");

const imagenActual =
    document.getElementById("imagen-producto-actual");

const contenedorVistaPrevia =
    document.getElementById("contenedor-vista-previa");

const vistaPrevia =
    document.getElementById("vista-previa-producto");

const botonEliminarImagen =
    document.getElementById("eliminar-imagen-producto");


/* ========================================
FUNCIONES GENERALES
======================================== */

function escaparHTML(texto) {
    const elemento = document.createElement("div");

    elemento.textContent = String(texto);

    return elemento.innerHTML;
}


function formatearMoneda(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}


/* ========================================
CARGA Y GUARDADO
======================================== */

function cargarDatosTienda() {
    const productosGuardados =
        JSON.parse(
            localStorage.getItem("productosAdmin")
        ) || [];

    const pedidosGuardados =
        JSON.parse(
            localStorage.getItem("pedidosAdmin")
        ) || [];

    if (productosGuardados.length > 0) {
        productos = productosGuardados;
    } else {
        productos = [
            {
                id: 1,
                nombre: "Camisa Scout",
                categoria: "Vestuario",
                precio: 25990,
                stock: 12,
                estado: "activo",
                imagen: "",
                descripcion:
                    "Camisa oficial para actividades scout."
            },
            {
                id: 2,
                nombre: "Pañolín Scout",
                categoria: "Accesorios",
                precio: 12990,
                stock: 4,
                estado: "activo",
                imagen: "img/panolin.jpg",
                descripcion:
                    "Pañolín institucional de la comunidad."
            },
            {
                id: 3,
                nombre: "Insignia institucional",
                categoria: "Insignias",
                precio: 8990,
                stock: 20,
                estado: "activo",
                imagen: "",
                descripcion:
                    "Insignia bordada de la Comunidad Scout."
            },
            {
                id: 4,
                nombre: "Mochila de excursión",
                categoria: "Campismo",
                precio: 45990,
                stock: 0,
                estado: "inactivo",
                imagen: "",
                descripcion:
                    "Mochila para campamentos y excursiones."
            }
        ];
    }

    if (pedidosGuardados.length > 0) {
        pedidos = pedidosGuardados;
    } else {
        pedidos = [
            {
                id: "SC-2026-001",
                usuario: "Ana Martínez",
                nickname: "ana_scout",
                fecha: "15-03-2026",
                productos: [
                    {
                        nombre: "Pañolín Scout",
                        cantidad: 1
                    }
                ],
                total: 12990,
                estado: "Entregado"
            },
            {
                id: "SC-2026-002",
                usuario: "Cristóbal Ventura",
                nickname: "cristobal_ventura",
                fecha: "08-05-2026",
                productos: [
                    {
                        nombre: "Camisa Scout",
                        cantidad: 1
                    },
                    {
                        nombre: "Insignia institucional",
                        cantidad: 1
                    }
                ],
                total: 34980,
                estado: "En preparación"
            },
            {
                id: "SC-2026-003",
                usuario: "Felipe Cariz",
                nickname: "felipe_scout",
                fecha: "25-08-2026",
                productos: [
                    {
                        nombre: "Mochila de excursión",
                        cantidad: 1
                    }
                ],
                total: 45990,
                estado: "Pagado"
            }
        ];
    }

    guardarDatosTienda();
}


function guardarDatosTienda() {
    try {
        localStorage.setItem(
            "productosAdmin",
            JSON.stringify(productos)
        );

        localStorage.setItem(
            "pedidosAdmin",
            JSON.stringify(pedidos)
        );

        return true;

    } catch (error) {
        alert(
            "No fue posible guardar la imagen porque " +
            "el almacenamiento del navegador está lleno."
        );

        return false;
    }
}


/* ========================================
   IMÁGENES
======================================== */

function mostrarVistaPrevia(origen) {
    if (!origen) {
        ocultarVistaPrevia();
        return;
    }

    imagenTemporal = origen;
    imagenActual.value = origen;
    vistaPrevia.src = origen;

    contenedorVistaPrevia.hidden = false;
}


function ocultarVistaPrevia() {
    imagenTemporal = "";
    imagenActual.value = "";
    vistaPrevia.src = "";

    contenedorVistaPrevia.hidden = true;
    inputImagen.value = "";
}


function comprimirImagen(archivo) {
    return new Promise(function (resolver, rechazar) {
        const lector = new FileReader();

        lector.addEventListener("load", function () {
            const imagen = new Image();

            imagen.addEventListener("load", function () {
                const dimensionMaxima = 900;

                let ancho = imagen.width;
                let alto = imagen.height;

                if (
                    ancho > dimensionMaxima ||
                    alto > dimensionMaxima
                ) {
                    const proporcion = Math.min(
                        dimensionMaxima / ancho,
                        dimensionMaxima / alto
                    );

                    ancho = Math.round(ancho * proporcion);
                    alto = Math.round(alto * proporcion);
                }

                const canvas =
                    document.createElement("canvas");

                canvas.width = ancho;
                canvas.height = alto;

                const contexto =
                    canvas.getContext("2d");

                contexto.drawImage(
                    imagen,
                    0,
                    0,
                    ancho,
                    alto
                );

                const imagenComprimida =
                    canvas.toDataURL(
                        "image/webp",
                        0.8
                    );

                resolver(imagenComprimida);
            });

            imagen.addEventListener(
                "error",
                function () {
                    rechazar(
                        new Error(
                            "No fue posible leer la imagen."
                        )
                    );
                }
            );

            imagen.src = lector.result;
        });

        lector.addEventListener(
            "error",
            function () {
                rechazar(
                    new Error(
                        "No fue posible cargar el archivo."
                    )
                );
            }
        );

        lector.readAsDataURL(archivo);
    });
}


async function procesarImagenSeleccionada() {
    const archivo = inputImagen.files[0];

    if (!archivo) {
        return;
    }

    if (
        !TIPOS_IMAGEN_PERMITIDOS.includes(
            archivo.type
        )
    ) {
        alert(
            "Selecciona una imagen JPG, PNG o WEBP."
        );

        inputImagen.value = "";
        return;
    }

    if (archivo.size > TAMANO_MAXIMO_IMAGEN) {
        alert(
            "La imagen no puede superar los 2 MB."
        );

        inputImagen.value = "";
        return;
    }

    try {
        const imagenComprimida =
            await comprimirImagen(archivo);

        mostrarVistaPrevia(imagenComprimida);

    } catch (error) {
        alert(error.message);
        inputImagen.value = "";
    }
}


/* ========================================
INDICADORES
======================================== */

function actualizarIndicadores() {
    const activos = productos.filter(
        function (producto) {
            return producto.estado === "activo";
        }
    );

    const stockBajo = productos.filter(
        function (producto) {
            return (
                producto.estado === "activo" &&
                producto.stock <= 5
            );
        }
    );

    const pendientes = pedidos.filter(
        function (pedido) {
            return (
                pedido.estado === "Pagado" ||
                pedido.estado === "En preparación"
            );
        }
    );

    const ventas = pedidos
        .filter(function (pedido) {
            return pedido.estado !== "Cancelado";
        })
        .reduce(function (total, pedido) {
            return total + pedido.total;
        }, 0);

    productosActivos.textContent =
        activos.length;

    productosStockBajo.textContent =
        stockBajo.length;

    pedidosPendientes.textContent =
        pendientes.length;

    totalVendido.textContent =
        formatearMoneda(ventas);
}


/* ========================================
PRODUCTOS
======================================== */

function obtenerProductosFiltrados() {
    const texto =
        buscarProducto.value
            .trim()
            .toLowerCase();

    return productos.filter(
        function (producto) {
            const coincideTexto =
                producto.nombre
                    .toLowerCase()
                    .includes(texto) ||
                producto.categoria
                    .toLowerCase()
                    .includes(texto);

            const coincideCategoria =
                filtroCategoria.value === "TODAS" ||
                producto.categoria ===
                    filtroCategoria.value;

            const coincideEstado =
                filtroEstadoProducto.value === "TODOS" ||
                producto.estado ===
                    filtroEstadoProducto.value;

            return (
                coincideTexto &&
                coincideCategoria &&
                coincideEstado
            );
        }
    );
}


function mostrarProductos() {
    const productosFiltrados =
        obtenerProductosFiltrados();

    listaProductos.innerHTML = "";

    sinResultadosProductos.hidden =
        productosFiltrados.length !== 0;

    productosFiltrados.forEach(
        function (producto) {
            const fila =
                document.createElement("tr");

            const claseEstado =
                producto.estado === "activo"
                    ? "estado-activo-admin"
                    : "estado-inactivo-admin";

            const claseStock =
                producto.stock <= 5
                    ? "stock-bajo"
                    : "stock-disponible";

            const imagenProducto =
                producto.imagen
                    ? `
                        <img
                            src="${escaparHTML(producto.imagen)}"
                            alt="${escaparHTML(producto.nombre)}"
                            class="miniatura-producto-admin"
                        >
                    `
                    : `
                        <span class="producto-sin-imagen">
                            Sin imagen
                        </span>
                    `;

            fila.innerHTML = `
                <td>${imagenProducto}</td>

                <td>
                    <strong>
                        ${escaparHTML(producto.nombre)}
                    </strong>
                </td>

                <td>
                    ${escaparHTML(producto.categoria)}
                </td>

                <td>
                    ${formatearMoneda(producto.precio)}
                </td>

                <td>
                    <span class="${claseStock}">
                        ${producto.stock} unidades
                    </span>
                </td>

                <td>
                    <span
                        class="estado-usuario-admin
                        ${claseEstado}"
                    >
                        ${
                            producto.estado === "activo"
                                ? "Activo"
                                : "Inactivo"
                        }
                    </span>
                </td>

                <td>
                    <div class="acciones-tabla-admin">

                        <button
                            type="button"
                            class="boton-editar-admin"
                            data-id="${producto.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="boton-estado-producto"
                            data-id="${producto.id}"
                        >
                            ${
                                producto.estado === "activo"
                                    ? "Desactivar"
                                    : "Activar"
                            }
                        </button>

                    </div>
                </td>
            `;

            listaProductos.appendChild(fila);
        }
    );

    activarBotonesProductos();
    actualizarIndicadores();
}


function activarBotonesProductos() {
    const botonesEditar =
        document.querySelectorAll(
            ".boton-editar-admin"
        );

    const botonesEstado =
        document.querySelectorAll(
            ".boton-estado-producto"
        );

    botonesEditar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                abrirEdicionProducto(
                    Number(boton.dataset.id)
                );
            }
        );
    });

    botonesEstado.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                cambiarEstadoProducto(
                    Number(boton.dataset.id)
                );
            }
        );
    });
}


function abrirNuevoProducto() {
    formularioProducto.reset();

    document.getElementById(
        "producto-id"
    ).value = "";

    document.getElementById(
        "estado-producto-admin"
    ).value = "inactivo";

    tituloFormulario.textContent =
        "Nuevo producto";

    ocultarVistaPrevia();

    contenedorFormulario.hidden = false;

    document.getElementById(
        "nombre-producto-admin"
    ).focus();

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function abrirEdicionProducto(idProducto) {
    const producto = productos.find(
        function (elemento) {
            return elemento.id === idProducto;
        }
    );

    if (!producto) {
        return;
    }

    tituloFormulario.textContent =
        "Editar producto";

    document.getElementById(
        "producto-id"
    ).value = producto.id;

    document.getElementById(
        "nombre-producto-admin"
    ).value = producto.nombre;

    document.getElementById(
        "categoria-producto-admin"
    ).value = producto.categoria;

    document.getElementById(
        "precio-producto-admin"
    ).value = producto.precio;

    document.getElementById(
        "stock-producto-admin"
    ).value = producto.stock;

    document.getElementById(
        "estado-producto-admin"
    ).value = producto.estado;

    document.getElementById(
        "descripcion-producto-admin"
    ).value = producto.descripcion;

    inputImagen.value = "";

    if (producto.imagen) {
        mostrarVistaPrevia(producto.imagen);
    } else {
        ocultarVistaPrevia();
    }

    contenedorFormulario.hidden = false;

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function cerrarFormularioProducto() {
    formularioProducto.reset();
    ocultarVistaPrevia();

    contenedorFormulario.hidden = true;
}


function cambiarEstadoProducto(idProducto) {
    const producto = productos.find(
        function (elemento) {
            return elemento.id === idProducto;
        }
    );

    if (!producto) {
        return;
    }

    const nuevoEstado =
        producto.estado === "activo"
            ? "inactivo"
            : "activo";

    if (
        nuevoEstado === "activo" &&
        !producto.imagen
    ) {
        alert(
            "Debes cargar una imagen antes " +
            "de activar este producto."
        );

        abrirEdicionProducto(idProducto);
        return;
    }

    const confirmar = confirm(
        `¿Deseas cambiar "${producto.nombre}" ` +
        `al estado ${nuevoEstado}?`
    );

    if (!confirmar) {
        return;
    }

    producto.estado = nuevoEstado;

    guardarDatosTienda();
    mostrarProductos();
}


/* ========================================
PEDIDOS
======================================== */

function obtenerPedidosFiltrados() {
    const texto =
        buscarPedido.value
            .trim()
            .toLowerCase();

    return pedidos.filter(function (pedido) {
        const coincideTexto =
            pedido.id.toLowerCase().includes(texto) ||
            pedido.usuario.toLowerCase().includes(texto) ||
            pedido.nickname.toLowerCase().includes(texto);

        const coincideEstado =
            filtroEstadoPedido.value === "TODOS" ||
            pedido.estado === filtroEstadoPedido.value;

        return coincideTexto && coincideEstado;
    });
}


function obtenerClasePedido(estado) {
    if (estado === "Entregado") {
        return "estado-activo-admin";
    }

    if (estado === "Cancelado") {
        return "estado-inactivo-admin";
    }

    return "estado-pendiente-admin";
}


function mostrarPedidos() {
    const pedidosFiltrados =
        obtenerPedidosFiltrados();

    listaPedidos.innerHTML = "";

    sinResultadosPedidos.hidden =
        pedidosFiltrados.length !== 0;

    pedidosFiltrados.forEach(
        function (pedido) {
            const fila =
                document.createElement("tr");

            const productosPedido =
                pedido.productos
                    .map(function (producto) {
                        return (
                            `${producto.cantidad} × ` +
                            `${producto.nombre}`
                        );
                    })
                    .join(", ");

            const puedeAvanzar =
                pedido.estado === "Pagado" ||
                pedido.estado === "En preparación";

            const puedeCancelar =
                pedido.estado !== "Entregado" &&
                pedido.estado !== "Cancelado";

            fila.innerHTML = `
                <td>
                    <strong>${escaparHTML(pedido.id)}</strong>
                </td>

                <td>
                    ${escaparHTML(pedido.usuario)}
                    <br>
                    <small>
                        @${escaparHTML(pedido.nickname)}
                    </small>
                </td>

                <td>${escaparHTML(pedido.fecha)}</td>

                <td>${escaparHTML(productosPedido)}</td>

                <td>${formatearMoneda(pedido.total)}</td>

                <td>
                    <span
                        class="estado-usuario-admin
                        ${obtenerClasePedido(pedido.estado)}"
                    >
                        ${pedido.estado}
                    </span>
                </td>

                <td>
                    <div class="acciones-tabla-admin">

                        <button
                            type="button"
                            class="boton-detalle-pedido"
                            data-id="${pedido.id}"
                        >
                            Ver detalle
                        </button>

                        ${
                            puedeAvanzar
                                ? `
                                    <button
                                        type="button"
                                        class="boton-avanzar-pedido"
                                        data-id="${pedido.id}"
                                    >
                                        Avanzar estado
                                    </button>
                                `
                                : ""
                        }

                        ${
                            puedeCancelar
                                ? `
                                    <button
                                        type="button"
                                        class="boton-cancelar-pedido"
                                        data-id="${pedido.id}"
                                    >
                                        Cancelar
                                    </button>
                                `
                                : ""
                        }

                    </div>
                </td>
            `;

            listaPedidos.appendChild(fila);
        }
    );

    activarBotonesPedidos();
    actualizarIndicadores();
}


function activarBotonesPedidos() {
    document
        .querySelectorAll(".boton-detalle-pedido")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                verDetallePedido(boton.dataset.id);
            });
        });

    document
        .querySelectorAll(".boton-avanzar-pedido")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                avanzarEstadoPedido(boton.dataset.id);
            });
        });

    document
        .querySelectorAll(".boton-cancelar-pedido")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                cancelarPedido(boton.dataset.id);
            });
        });
}


function verDetallePedido(idPedido) {
    const pedido = pedidos.find(
        function (elemento) {
            return elemento.id === idPedido;
        }
    );

    if (!pedido) {
        return;
    }

    const detalle = pedido.productos
        .map(function (producto) {
            return `${producto.cantidad} × ${producto.nombre}`;
        })
        .join("\n");

    alert(
        `Pedido: ${pedido.id}\n` +
        `Usuario: ${pedido.usuario}\n` +
        `Nickname: @${pedido.nickname}\n` +
        `Fecha: ${pedido.fecha}\n\n` +
        `${detalle}\n\n` +
        `Total: ${formatearMoneda(pedido.total)}\n` +
        `Estado: ${pedido.estado}`
    );
}


function avanzarEstadoPedido(idPedido) {
    const pedido = pedidos.find(
        function (elemento) {
            return elemento.id === idPedido;
        }
    );

    if (!pedido) {
        return;
    }

    const nuevoEstado =
        pedido.estado === "Pagado"
            ? "En preparación"
            : "Entregado";

    if (
        !confirm(
            `¿Deseas cambiar el pedido ${pedido.id} ` +
            `a "${nuevoEstado}"?`
        )
    ) {
        return;
    }

    pedido.estado = nuevoEstado;

    guardarDatosTienda();
    mostrarPedidos();
}


function cancelarPedido(idPedido) {
    const pedido = pedidos.find(
        function (elemento) {
            return elemento.id === idPedido;
        }
    );

    if (!pedido) {
        return;
    }

    if (
        !confirm(
            `¿Deseas cancelar el pedido ${pedido.id}?`
        )
    ) {
        return;
    }

    pedido.estado = "Cancelado";

    guardarDatosTienda();
    mostrarPedidos();
}


/* ========================================
GUARDAR PRODUCTO
======================================== */

formularioProducto.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        const idProducto = Number(
            document.getElementById("producto-id").value
        );

        const nombre = document
            .getElementById("nombre-producto-admin")
            .value
            .trim();

        const categoria =
            document.getElementById(
                "categoria-producto-admin"
            ).value;

        const precio = Number(
            document.getElementById(
                "precio-producto-admin"
            ).value
        );

        const stock = Number(
            document.getElementById(
                "stock-producto-admin"
            ).value
        );

        const estado =
            document.getElementById(
                "estado-producto-admin"
            ).value;

        const descripcion = document
            .getElementById(
                "descripcion-producto-admin"
            )
            .value
            .trim();

        if (!Number.isInteger(precio) || precio <= 0) {
            alert("Ingresa un precio válido.");
            return;
        }

        if (!Number.isInteger(stock) || stock < 0) {
            alert("Ingresa un stock válido.");
            return;
        }

        if (estado === "activo" && !imagenTemporal) {
            alert(
                "Debes cargar una imagen antes " +
                "de publicar el producto."
            );

            return;
        }

        let respaldoProductos =
            JSON.stringify(productos);

        if (idProducto) {
            const producto = productos.find(
                function (elemento) {
                    return elemento.id === idProducto;
                }
            );

            if (producto) {
                producto.nombre = nombre;
                producto.categoria = categoria;
                producto.precio = precio;
                producto.stock = stock;
                producto.estado = estado;
                producto.imagen = imagenTemporal;
                producto.descripcion = descripcion;
            }
        } else {
            productos.push({
                id: Date.now(),
                nombre: nombre,
                categoria: categoria,
                precio: precio,
                stock: stock,
                estado: estado,
                imagen: imagenTemporal,
                descripcion: descripcion
            });
        }

        if (!guardarDatosTienda()) {
            productos =
                JSON.parse(respaldoProductos);

            return;
        }

        cerrarFormularioProducto();
        mostrarProductos();

        alert(
            idProducto
                ? "Producto actualizado correctamente."
                : "Producto registrado correctamente."
        );
    }
);


/* ========================================
EVENTOS
======================================== */

inputImagen.addEventListener(
    "change",
    procesarImagenSeleccionada
);

botonEliminarImagen.addEventListener(
    "click",
    ocultarVistaPrevia
);

pestanaProductos.addEventListener(
    "click",
    function () {
        seccionProductos.hidden = false;
        seccionPedidos.hidden = true;

        pestanaProductos.classList.add("activa");
        pestanaPedidos.classList.remove("activa");
    }
);

pestanaPedidos.addEventListener(
    "click",
    function () {
        seccionProductos.hidden = true;
        seccionPedidos.hidden = false;
        contenedorFormulario.hidden = true;

        pestanaProductos.classList.remove("activa");
        pestanaPedidos.classList.add("activa");

        mostrarPedidos();
    }
);

buscarProducto.addEventListener(
    "input",
    mostrarProductos
);

filtroCategoria.addEventListener(
    "change",
    mostrarProductos
);

filtroEstadoProducto.addEventListener(
    "change",
    mostrarProductos
);

buscarPedido.addEventListener(
    "input",
    mostrarPedidos
);

filtroEstadoPedido.addEventListener(
    "change",
    mostrarPedidos
);

botonNuevoProducto.addEventListener(
    "click",
    abrirNuevoProducto
);

cerrarFormulario.addEventListener(
    "click",
    cerrarFormularioProducto
);

cancelarFormulario.addEventListener(
    "click",
    cerrarFormularioProducto
);


/* ========================================
INICIO
======================================== */

cargarDatosTienda();
mostrarProductos();