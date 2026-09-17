let usuarios = [];
let cuotas = [];
let actividades = [];
let operaciones = [];
let datosExportacion = [];

const fechaDesde =
    document.getElementById("reporte-fecha-desde");

const fechaHasta =
    document.getElementById("reporte-fecha-hasta");

const tipoReporte =
    document.getElementById("tipo-reporte-admin");

const botonAplicar =
    document.getElementById("aplicar-filtros-reporte");

const botonLimpiar =
    document.getElementById("limpiar-filtros-reporte");

const botonExportar =
    document.getElementById("exportar-reporte-csv");

const indicadorUsuarios =
    document.getElementById("reporte-usuarios-activos");

const indicadorCuotas =
    document.getElementById("reporte-cuotas-pendientes");

const indicadorActividades =
    document.getElementById("reporte-actividades");

const indicadorRecaudacion =
    document.getElementById("reporte-total-recaudado");

const graficoCuotas =
    document.getElementById("grafico-cuotas");

const graficoOperaciones =
    document.getElementById("grafico-operaciones");

const tituloDetalle =
    document.getElementById("titulo-detalle-reporte");

const encabezadoTabla =
    document.getElementById("encabezado-tabla-reporte");

const detalleTabla =
    document.getElementById("detalle-tabla-reporte");

const sinDatos =
    document.getElementById("sin-datos-reporte");


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


function cargarDatos() {
    usuarios =
        JSON.parse(
            localStorage.getItem("usuariosAdmin")
        ) || [];

    cuotas =
        JSON.parse(
            localStorage.getItem("cuotasAdmin")
        ) || [];

    actividades =
        JSON.parse(
            localStorage.getItem("actividadesAdmin")
        ) || [];

    operaciones =
        JSON.parse(
            localStorage.getItem("operacionesAdmin")
        ) || [];
}


function fechaDentroDelRango(fecha) {
    if (!fecha) {
        return true;
    }

    const cumpleDesde =
        fechaDesde.value === "" ||
        fecha >= fechaDesde.value;

    const cumpleHasta =
        fechaHasta.value === "" ||
        fecha <= fechaHasta.value;

    return cumpleDesde && cumpleHasta;
}


function obtenerDatosFiltrados() {
    return {
        usuarios: usuarios,

        cuotas: cuotas.filter(
            function (cuota) {
                return fechaDentroDelRango(
                    cuota.vencimiento
                );
            }
        ),

        actividades: actividades.filter(
            function (actividad) {
                return fechaDentroDelRango(
                    actividad.fecha
                );
            }
        ),

        operaciones: operaciones.filter(
            function (operacion) {
                return fechaDentroDelRango(
                    operacion.fecha
                );
            }
        )
    };
}


function actualizarIndicadores(datos) {
    const usuariosActivos =
        datos.usuarios.filter(
            function (usuario) {
                return usuario.estado === "activo";
            }
        );

    const cuotasPendientes =
        datos.cuotas.filter(
            function (cuota) {
                return cuota.estado === "Pendiente";
            }
        );

    const actividadesProgramadas =
        datos.actividades.filter(
            function (actividad) {
                return actividad.estado === "Programada";
            }
        );

    const operacionesPagadas =
        datos.operaciones.filter(
            function (operacion) {
                return operacion.estado === "PAGADO";
            }
        );

    const totalRecaudado =
        operacionesPagadas.reduce(
            function (total, operacion) {
                return total + operacion.monto;
            },
            0
        );

    indicadorUsuarios.textContent =
        usuariosActivos.length;

    indicadorCuotas.textContent =
        cuotasPendientes.length;

    indicadorActividades.textContent =
        actividadesProgramadas.length;

    indicadorRecaudacion.textContent =
        formatearMoneda(totalRecaudado);
}


function crearBarra(
    etiqueta,
    valor,
    maximo,
    clase
) {
    const porcentaje =
        maximo > 0
            ? Math.round((valor / maximo) * 100)
            : 0;

    return `
        <div class="fila-grafico-admin">

            <div class="etiqueta-grafico-admin">
                <span>${escaparHTML(etiqueta)}</span>
                <strong>${valor}</strong>
            </div>

            <div class="fondo-barra-admin">
                <div
                    class="barra-admin ${clase}"
                    style="width: ${porcentaje}%"
                ></div>
            </div>

        </div>
    `;
}


function mostrarGraficoCuotas(datos) {
    const pagadas = datos.cuotas.filter(
        function (cuota) {
            return cuota.estado === "Pagada";
        }
    ).length;

    const pendientes = datos.cuotas.filter(
        function (cuota) {
            return cuota.estado === "Pendiente";
        }
    ).length;

    const maximo =
        Math.max(pagadas, pendientes, 1);

    graficoCuotas.innerHTML =
        crearBarra(
            "Pagadas",
            pagadas,
            maximo,
            "barra-verde"
        ) +
        crearBarra(
            "Pendientes",
            pendientes,
            maximo,
            "barra-amarilla"
        );
}


function mostrarGraficoOperaciones(datos) {
    const operacionesPagadas =
        datos.operaciones.filter(
            function (operacion) {
                return operacion.estado === "PAGADO";
            }
        );

    function sumarTipo(tipo) {
        return operacionesPagadas
            .filter(function (operacion) {
                return operacion.tipo === tipo;
            })
            .reduce(function (total, operacion) {
                return total + operacion.monto;
            }, 0);
    }

    const membresias =
        sumarTipo("MEMBRESIA");

    const donaciones =
        sumarTipo("DONACION");

    const compras =
        sumarTipo("PEDIDO");

    const maximo = Math.max(
        membresias,
        donaciones,
        compras,
        1
    );

    graficoOperaciones.innerHTML =
        crearBarra(
            "Membresías",
            membresias,
            maximo,
            "barra-verde",
        ) +
        crearBarra(
            "Donaciones",
            donaciones,
            maximo,
            "barra-amarilla"
        ) +
        crearBarra(
            "Compras",
            compras,
            maximo,
            "barra-azul"
        );

    graficoOperaciones
        .querySelectorAll(
            ".etiqueta-grafico-admin strong"
        )
        .forEach(function (elemento) {
            const valor =
                Number(elemento.textContent);

            elemento.textContent =
                formatearMoneda(valor);
        });
}


function establecerEncabezados(encabezados) {
    encabezadoTabla.innerHTML = `
        <tr>
            ${encabezados
                .map(function (encabezado) {
                    return `
                        <th>
                            ${escaparHTML(encabezado)}
                        </th>
                    `;
                })
                .join("")}
        </tr>
    `;
}


function mostrarReporteGeneral(datos) {
    tituloDetalle.textContent =
        "Resumen general";

    establecerEncabezados([
        "Indicador",
        "Resultado"
    ]);

    const cuotasPendientes =
        datos.cuotas.filter(
            function (cuota) {
                return cuota.estado === "Pendiente";
            }
        );

    const montoPendiente =
        cuotasPendientes.reduce(
            function (total, cuota) {
                return total + cuota.monto;
            },
            0
        );

    const totalPagado =
        datos.operaciones
            .filter(function (operacion) {
                return operacion.estado === "PAGADO";
            })
            .reduce(function (total, operacion) {
                return total + operacion.monto;
            }, 0);

    datosExportacion = [
        ["Usuarios registrados", datos.usuarios.length],
        ["Cuotas registradas", datos.cuotas.length],
        ["Cuotas pendientes", cuotasPendientes.length],
        ["Monto pendiente", montoPendiente],
        ["Actividades", datos.actividades.length],
        ["Operaciones", datos.operaciones.length],
        ["Total recaudado", totalPagado]
    ];

    detalleTabla.innerHTML =
        datosExportacion
            .map(function (fila) {
                const esMonto =
                    fila[0].includes("Monto") ||
                    fila[0].includes("recaudado");

                return `
                    <tr>
                        <td>${escaparHTML(fila[0])}</td>
                        <td>
                            ${
                                esMonto
                                    ? formatearMoneda(fila[1])
                                    : fila[1]
                            }
                        </td>
                    </tr>
                `;
            })
            .join("");
}


function mostrarReporteUsuarios(datos) {
    tituloDetalle.textContent =
        "Reporte de usuarios";

    establecerEncabezados([
        "Nombre",
        "Nickname",
        "Correo",
        "Rol",
        "Estado"
    ]);

    datosExportacion = datos.usuarios.map(
        function (usuario) {
            return [
                usuario.nombre,
                usuario.nickname,
                usuario.correo,
                usuario.rol,
                usuario.estado
            ];
        }
    );

    detalleTabla.innerHTML =
        datos.usuarios
            .map(function (usuario) {
                return `
                    <tr>
                        <td>${escaparHTML(usuario.nombre)}</td>
                        <td>@${escaparHTML(usuario.nickname)}</td>
                        <td>${escaparHTML(usuario.correo)}</td>
                        <td>${escaparHTML(usuario.rol)}</td>
                        <td>${escaparHTML(usuario.estado)}</td>
                    </tr>
                `;
            })
            .join("");
}


function mostrarReporteCuotas(datos) {
    tituloDetalle.textContent =
        "Reporte de cuotas y membresías";

    establecerEncabezados([
        "Usuario",
        "Nickname",
        "Periodo",
        "Vencimiento",
        "Monto",
        "Estado"
    ]);

    datosExportacion = datos.cuotas.map(
        function (cuota) {
            return [
                cuota.nombreUsuario,
                cuota.nickname,
                cuota.periodo,
                cuota.vencimiento,
                cuota.monto,
                cuota.estado
            ];
        }
    );

    detalleTabla.innerHTML =
        datos.cuotas
            .map(function (cuota) {
                return `
                    <tr>
                        <td>${escaparHTML(cuota.nombreUsuario)}</td>
                        <td>@${escaparHTML(cuota.nickname)}</td>
                        <td>${escaparHTML(cuota.periodo)}</td>
                        <td>${formatearFecha(cuota.vencimiento)}</td>
                        <td>${formatearMoneda(cuota.monto)}</td>
                        <td>${escaparHTML(cuota.estado)}</td>
                    </tr>
                `;
            })
            .join("");
}


function mostrarReporteActividades(datos) {
    tituloDetalle.textContent =
        "Reporte de actividades";

    establecerEncabezados([
        "Actividad",
        "Tipo",
        "Fecha",
        "Lugar",
        "Inscritos",
        "Cupos",
        "Estado"
    ]);

    datosExportacion = datos.actividades.map(
        function (actividad) {
            return [
                actividad.nombre,
                actividad.tipo,
                actividad.fecha,
                actividad.lugar,
                actividad.inscritos,
                actividad.cupos,
                actividad.estado
            ];
        }
    );

    detalleTabla.innerHTML =
        datos.actividades
            .map(function (actividad) {
                return `
                    <tr>
                        <td>${escaparHTML(actividad.nombre)}</td>
                        <td>${escaparHTML(actividad.tipo)}</td>
                        <td>${formatearFecha(actividad.fecha)}</td>
                        <td>${escaparHTML(actividad.lugar)}</td>
                        <td>${actividad.inscritos}</td>
                        <td>${actividad.cupos}</td>
                        <td>${escaparHTML(actividad.estado)}</td>
                    </tr>
                `;
            })
            .join("");
}


function mostrarReporteOperaciones(datos) {
    tituloDetalle.textContent =
        "Reporte de pagos y donaciones";

    establecerEncabezados([
        "Referencia",
        "Fecha",
        "Usuario",
        "Tipo",
        "Detalle",
        "Monto",
        "Estado"
    ]);

    datosExportacion = datos.operaciones.map(
        function (operacion) {
            return [
                operacion.referencia,
                operacion.fecha,
                operacion.nombreUsuario,
                operacion.tipo,
                operacion.detalle,
                operacion.monto,
                operacion.estado
            ];
        }
    );

    detalleTabla.innerHTML =
        datos.operaciones
            .map(function (operacion) {
                return `
                    <tr>
                        <td>${escaparHTML(operacion.referencia)}</td>
                        <td>${formatearFecha(operacion.fecha)}</td>
                        <td>${escaparHTML(operacion.nombreUsuario)}</td>
                        <td>${escaparHTML(operacion.tipo)}</td>
                        <td>${escaparHTML(operacion.detalle)}</td>
                        <td>${formatearMoneda(operacion.monto)}</td>
                        <td>${escaparHTML(operacion.estado)}</td>
                    </tr>
                `;
            })
            .join("");
}


function generarReporte() {
    if (
        fechaDesde.value !== "" &&
        fechaHasta.value !== "" &&
        fechaDesde.value > fechaHasta.value
    ) {
        alert(
            "La fecha inicial no puede ser posterior " +
            "a la fecha final."
        );

        return;
    }

    cargarDatos();

    const datos =
        obtenerDatosFiltrados();

    actualizarIndicadores(datos);
    mostrarGraficoCuotas(datos);
    mostrarGraficoOperaciones(datos);

    if (tipoReporte.value === "USUARIOS") {
        mostrarReporteUsuarios(datos);
    } else if (tipoReporte.value === "CUOTAS") {
        mostrarReporteCuotas(datos);
    } else if (
        tipoReporte.value === "ACTIVIDADES"
    ) {
        mostrarReporteActividades(datos);
    } else if (
        tipoReporte.value === "OPERACIONES"
    ) {
        mostrarReporteOperaciones(datos);
    } else {
        mostrarReporteGeneral(datos);
    }

    sinDatos.hidden =
        datosExportacion.length !== 0;

    botonExportar.disabled =
        datosExportacion.length === 0;
}


function limpiarFiltros() {
    fechaDesde.value = "";
    fechaHasta.value = "";
    tipoReporte.value = "GENERAL";

    generarReporte();
}


function escaparCSV(valor) {
    const texto = String(valor ?? "");

    return `"${texto.replace(/"/g, '""')}"`;
}


function exportarCSV() {
    if (datosExportacion.length === 0) {
        alert("No existen datos para exportar.");
        return;
    }

    const encabezados = Array.from(
        encabezadoTabla.querySelectorAll("th")
    ).map(function (elemento) {
        return elemento.textContent.trim();
    });

    const filasCSV = [
        encabezados,
        ...datosExportacion
    ];

    const contenidoCSV = filasCSV
        .map(function (fila) {
            return fila
                .map(escaparCSV)
                .join(";");
        })
        .join("\n");

    const archivo = new Blob(
        [
            "\uFEFF",
            contenidoCSV
        ],
        {
            type:
                "text/csv;charset=utf-8;"
        }
    );

    const enlace =
        document.createElement("a");

    enlace.href =
        URL.createObjectURL(archivo);

    enlace.download =
        `reporte-${tipoReporte.value.toLowerCase()}-` +
        `${new Date().toISOString().slice(0, 10)}.csv`;

    enlace.click();

    URL.revokeObjectURL(enlace.href);
}


botonAplicar.addEventListener(
    "click",
    generarReporte
);

botonLimpiar.addEventListener(
    "click",
    limpiarFiltros
);

tipoReporte.addEventListener(
    "change",
    generarReporte
);

botonExportar.addEventListener(
    "click",
    exportarCSV
);


cargarDatos();
generarReporte();