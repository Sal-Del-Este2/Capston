let operaciones = [];

const listaPagos =
    document.getElementById("lista-pagos-admin");

const totalRecaudado =
    document.getElementById("total-recaudado-admin");

const totalMembresias =
    document.getElementById("total-membresias-admin");

const totalDonaciones =
    document.getElementById("total-donaciones-admin");

const operacionesPendientes =
    document.getElementById(
        "operaciones-pendientes-admin"
    );

const buscarOperacion =
    document.getElementById("buscar-operacion-admin");

const filtroTipo =
    document.getElementById(
        "filtro-tipo-operacion-admin"
    );

const filtroEstado =
    document.getElementById(
        "filtro-estado-pago-admin"
    );

const filtroFechaDesde =
    document.getElementById("filtro-fecha-desde");

const filtroFechaHasta =
    document.getElementById("filtro-fecha-hasta");

const sinResultados =
    document.getElementById(
        "sin-resultados-pagos-admin"
    );

const contenedorDetalle =
    document.getElementById(
        "detalle-operacion-admin"
    );

const contenidoDetalle =
    document.getElementById(
        "contenido-detalle-operacion"
    );

const cerrarDetalle =
    document.getElementById(
        "cerrar-detalle-operacion"
    );


function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

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


function formatearFecha(fecha) {
    if (!fecha) {
        return "";
    }

    const partes = fecha.split("-");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}


function cargarOperaciones() {
    const operacionesGuardadas =
        JSON.parse(
            localStorage.getItem("operacionesAdmin")
        ) || [];

    if (operacionesGuardadas.length > 0) {
        operaciones = operacionesGuardadas;
        return;
    }

    operaciones = [
        {
            id: 1,
            referencia: "PAY-2026-0001",
            transaccion: "TBK-846291",
            fecha: "2026-08-28",
            usuarioId: 101,
            nombreUsuario: "Ana Martínez",
            nickname: "ana_scout",
            tipo: "MEMBRESIA",
            detalle: "Cuota agosto 2026",
            monto: 15000,
            medioPago: "Webpay",
            estado: "PAGADO",
            fechaActualizacion: "2026-08-28 14:32"
        },
        {
            id: 2,
            referencia: "PAY-2026-0002",
            transaccion: "TBK-846307",
            fecha: "2026-08-29",
            usuarioId: 102,
            nombreUsuario: "Cristóbal Ventura",
            nickname: "cristobal_ventura",
            tipo: "DONACION",
            tipoDonacion: "IDENTIFICADA",
            detalle: "Donación identificada",
            monto: 25000,
            medioPago: "Webpay",
            estado: "PAGADO",
            fechaActualizacion: "2026-08-29 09:18"
        },
        {
            id: 3,
            referencia: "PAY-2026-0003",
            transaccion: "TBK-846315",
            fecha: "2026-08-29",
            usuarioId: null,
            nombreUsuario: "Anónimo",
            nickname: null,
            tipo: "DONACION",
            tipoDonacion: "ANONIMA",
            detalle: "Donación anónima",
            monto: 10000,
            medioPago: "Webpay",
            estado: "PAGADO",
            fechaActualizacion: "2026-08-29 11:45"
        },
        {
            id: 4,
            referencia: "PAY-2026-0004",
            transaccion: null,
            fecha: "2026-08-30",
            usuarioId: 103,
            nombreUsuario: "Felipe Cariz",
            nickname: "felipe_scout",
            tipo: "PEDIDO",
            detalle: "Pedido SC-2026-003",
            monto: 45990,
            medioPago: "Webpay",
            estado: "PENDIENTE",
            fechaActualizacion: "2026-08-30 16:10"
        },
        {
            id: 5,
            referencia: "PAY-2026-0005",
            transaccion: "TBK-846401",
            fecha: "2026-08-30",
            usuarioId: 104,
            nombreUsuario: "Marcela Soto",
            nickname: "marcela_scout",
            tipo: "MEMBRESIA",
            detalle: "Cuota agosto 2026",
            monto: 15000,
            medioPago: "Webpay",
            estado: "RECHAZADO",
            fechaActualizacion: "2026-08-30 17:22"
        }
    ];

    guardarOperaciones();
}


function guardarOperaciones() {
    localStorage.setItem(
        "operacionesAdmin",
        JSON.stringify(operaciones)
    );
}


function obtenerNombreTipo(tipo) {
    if (tipo === "MEMBRESIA") {
        return "Membresía";
    }

    if (tipo === "DONACION") {
        return "Donación";
    }

    return "Compra";
}


function obtenerClaseEstado(estado) {
    if (estado === "PAGADO") {
        return "estado-activo-admin";
    }

    if (estado === "PENDIENTE") {
        return "estado-pendiente-admin";
    }

    return "estado-inactivo-admin";
}


function actualizarIndicadores() {
    const operacionesPagadas = operaciones.filter(
        function (operacion) {
            return operacion.estado === "PAGADO";
        }
    );

    const membresiasPagadas =
        operacionesPagadas.filter(
            function (operacion) {
                return operacion.tipo === "MEMBRESIA";
            }
        );

    const donacionesPagadas =
        operacionesPagadas.filter(
            function (operacion) {
                return operacion.tipo === "DONACION";
            }
        );

    const pendientes = operaciones.filter(
        function (operacion) {
            return operacion.estado === "PENDIENTE";
        }
    );

    const montoTotal = operacionesPagadas.reduce(
        function (total, operacion) {
            return total + operacion.monto;
        },
        0
    );

    const montoMembresias =
        membresiasPagadas.reduce(
            function (total, operacion) {
                return total + operacion.monto;
            },
            0
        );

    const montoDonaciones =
        donacionesPagadas.reduce(
            function (total, operacion) {
                return total + operacion.monto;
            },
            0
        );

    totalRecaudado.textContent =
        formatearMoneda(montoTotal);

    totalMembresias.textContent =
        formatearMoneda(montoMembresias);

    totalDonaciones.textContent =
        formatearMoneda(montoDonaciones);

    operacionesPendientes.textContent =
        pendientes.length;
}


function obtenerOperacionesFiltradas() {
    const texto =
        buscarOperacion.value
            .trim()
            .toLowerCase();

    const fechaDesde =
        filtroFechaDesde.value;

    const fechaHasta =
        filtroFechaHasta.value;

    return operaciones.filter(
        function (operacion) {
            const nickname =
                operacion.nickname || "";

            const coincideTexto =
                operacion.referencia
                    .toLowerCase()
                    .includes(texto) ||
                operacion.nombreUsuario
                    .toLowerCase()
                    .includes(texto) ||
                nickname
                    .toLowerCase()
                    .includes(texto);

            const coincideTipo =
                filtroTipo.value === "TODOS" ||
                operacion.tipo === filtroTipo.value;

            const coincideEstado =
                filtroEstado.value === "TODOS" ||
                operacion.estado === filtroEstado.value;

            const coincideDesde =
                fechaDesde === "" ||
                operacion.fecha >= fechaDesde;

            const coincideHasta =
                fechaHasta === "" ||
                operacion.fecha <= fechaHasta;

            return (
                coincideTexto &&
                coincideTipo &&
                coincideEstado &&
                coincideDesde &&
                coincideHasta
            );
        }
    );
}


function mostrarOperaciones() {
    const operacionesFiltradas =
        obtenerOperacionesFiltradas();

    listaPagos.innerHTML = "";

    sinResultados.hidden =
        operacionesFiltradas.length !== 0;

    operacionesFiltradas.forEach(
        function (operacion) {
            const fila =
                document.createElement("tr");

            const usuarioVisible =
                operacion.nickname
                    ? `
                        ${escaparHTML(
                            operacion.nombreUsuario
                        )}
                        <br>
                        <small>
                            @${escaparHTML(
                                operacion.nickname
                            )}
                        </small>
                    `
                    : `
                        <span class="donacion-anonima">
                            Donante anónimo
                        </span>
                    `;

            const botonAnular =
                operacion.estado === "PENDIENTE"
                    ? `
                        <button
                            type="button"
                            class="boton-anular-operacion"
                            data-id="${operacion.id}"
                        >
                            Anular
                        </button>
                    `
                    : "";

            fila.innerHTML = `
                <td>
                    <strong>
                        ${escaparHTML(
                            operacion.referencia
                        )}
                    </strong>
                </td>

                <td>
                    ${formatearFecha(
                        operacion.fecha
                    )}
                </td>

                <td>${usuarioVisible}</td>

                <td>
                    ${obtenerNombreTipo(
                        operacion.tipo
                    )}
                </td>

                <td>
                    ${escaparHTML(
                        operacion.detalle
                    )}
                </td>

                <td>
                    ${formatearMoneda(
                        operacion.monto
                    )}
                </td>

                <td>
                    <span
                        class="estado-usuario-admin
                        ${obtenerClaseEstado(
                            operacion.estado
                        )}"
                    >
                        ${operacion.estado}
                    </span>
                </td>

                <td>
                    <div class="acciones-tabla-admin">

                        <button
                            type="button"
                            class="boton-detalle-operacion"
                            data-id="${operacion.id}"
                        >
                            Ver detalle
                        </button>

                        ${botonAnular}

                    </div>
                </td>
            `;

            listaPagos.appendChild(fila);
        }
    );

    activarBotonesOperaciones();
    actualizarIndicadores();
}


function activarBotonesOperaciones() {
    document
        .querySelectorAll(
            ".boton-detalle-operacion"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    mostrarDetalleOperacion(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".boton-anular-operacion"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    anularOperacion(
                        Number(boton.dataset.id)
                    );
                }
            );
        });
}


function mostrarDetalleOperacion(idOperacion) {
    const operacion = operaciones.find(
        function (elemento) {
            return elemento.id === idOperacion;
        }
    );

    if (!operacion) {
        return;
    }

    const usuarioVisible =
        operacion.nickname
            ? `
                ${escaparHTML(
                    operacion.nombreUsuario
                )}
                (@${escaparHTML(
                    operacion.nickname
                )})
            `
            : "Donante anónimo";

    contenidoDetalle.innerHTML = `
        <div class="dato-detalle-operacion">
            <span>Referencia</span>
            <strong>
                ${escaparHTML(
                    operacion.referencia
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Transacción</span>
            <strong>
                ${escaparHTML(
                    operacion.transaccion ||
                    "Pendiente de asignación"
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Fecha</span>
            <strong>
                ${formatearFecha(
                    operacion.fecha
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Usuario</span>
            <strong>${usuarioVisible}</strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Operación</span>
            <strong>
                ${obtenerNombreTipo(
                    operacion.tipo
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Detalle</span>
            <strong>
                ${escaparHTML(
                    operacion.detalle
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Monto</span>
            <strong>
                ${formatearMoneda(
                    operacion.monto
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Medio de pago</span>
            <strong>
                ${escaparHTML(
                    operacion.medioPago
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Estado</span>
            <strong>
                ${escaparHTML(
                    operacion.estado
                )}
            </strong>
        </div>

        <div class="dato-detalle-operacion">
            <span>Última actualización</span>
            <strong>
                ${escaparHTML(
                    operacion.fechaActualizacion
                )}
            </strong>
        </div>
    `;

    contenedorDetalle.hidden = false;

    contenedorDetalle.scrollIntoView({
        behavior: "smooth"
    });
}


function anularOperacion(idOperacion) {
    const operacion = operaciones.find(
        function (elemento) {
            return elemento.id === idOperacion;
        }
    );

    if (!operacion) {
        return;
    }

    if (operacion.estado !== "PENDIENTE") {
        alert(
            "Solo se pueden anular operaciones pendientes."
        );
        return;
    }

    const confirmar = confirm(
        `¿Deseas anular la operación ` +
        `${operacion.referencia}?`
    );

    if (!confirmar) {
        return;
    }

    operacion.estado = "ANULADO";

    operacion.fechaActualizacion =
        new Date().toLocaleString("es-CL");

    guardarOperaciones();
    mostrarOperaciones();

    contenedorDetalle.hidden = true;
}


function validarRangoFechas() {
    if (
        filtroFechaDesde.value !== "" &&
        filtroFechaHasta.value !== "" &&
        filtroFechaDesde.value >
            filtroFechaHasta.value
    ) {
        alert(
            "La fecha inicial no puede ser posterior " +
            "a la fecha final."
        );

        filtroFechaHasta.value = "";
    }

    mostrarOperaciones();
}


buscarOperacion.addEventListener(
    "input",
    mostrarOperaciones
);

filtroTipo.addEventListener(
    "change",
    mostrarOperaciones
);

filtroEstado.addEventListener(
    "change",
    mostrarOperaciones
);

filtroFechaDesde.addEventListener(
    "change",
    validarRangoFechas
);

filtroFechaHasta.addEventListener(
    "change",
    validarRangoFechas
);

cerrarDetalle.addEventListener(
    "click",
    function () {
        contenedorDetalle.hidden = true;
    }
);


cargarOperaciones();
mostrarOperaciones();