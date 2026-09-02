let cuotas = [];
let usuarios = [];

const MESES = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre"
];

const listaCuotas =
    document.getElementById("lista-cuotas-admin");

const totalCuotas =
    document.getElementById("total-cuotas-admin");

const cuotasPagadas =
    document.getElementById("cuotas-pagadas-admin");

const cuotasPendientes =
    document.getElementById("cuotas-pendientes-admin");

const montoPendiente =
    document.getElementById("monto-pendiente-admin");

const buscarCuota =
    document.getElementById("buscar-cuota");

const filtroPeriodo =
    document.getElementById("filtro-periodo-cuota");

const filtroEstado =
    document.getElementById("filtro-estado-cuota");

const sinResultados =
    document.getElementById("sin-resultados-cuotas");

const botonNuevaCuota =
    document.getElementById("boton-nueva-cuota");

const contenedorFormulario =
    document.getElementById("contenedor-formulario-cuota");

const formularioCuota =
    document.getElementById("form-cuota");

const tituloFormulario =
    document.getElementById("titulo-formulario-cuota");

const cerrarFormulario =
    document.getElementById("cerrar-formulario-cuota");

const cancelarFormulario =
    document.getElementById("cancelar-formulario-cuota");

const selectorUsuario =
    document.getElementById("usuario-cuota");


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


function convertirPeriodo(valorMes) {
    const partes = valorMes.split("-");

    if (partes.length !== 2) {
        return valorMes;
    }

    const anio = partes[0];
    const numeroMes = Number(partes[1]);

    return `${MESES[numeroMes - 1]} ${anio}`;
}


function convertirPeriodoAInput(periodo) {
    const partes = periodo.split(" ");

    const nombreMes = partes[0];
    const anio = partes[1];

    const indiceMes =
        MESES.indexOf(nombreMes) + 1;

    return (
        `${anio}-` +
        String(indiceMes).padStart(2, "0")
    );
}


function formatearFecha(fecha) {
    if (!fecha) {
        return "";
    }

    const partes = fecha.split("-");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}


function cargarUsuarios() {
    usuarios =
        JSON.parse(
            localStorage.getItem("usuariosAdmin")
        ) || [];

    usuarios = usuarios.filter(
        function (usuario) {
            return (
                usuario.estado === "activo" &&
                usuario.rol === "usuario"
            );
        }
    );

    selectorUsuario.innerHTML = `
        <option value="">
            Selecciona un usuario
        </option>
    `;

    usuarios.forEach(function (usuario) {
        const opcion =
            document.createElement("option");

        opcion.value = usuario.id;

        opcion.textContent =
            `${usuario.nombre} (@${usuario.nickname})`;

        selectorUsuario.appendChild(opcion);
    });
}


function cargarCuotas() {
    const cuotasGuardadas =
        JSON.parse(
            localStorage.getItem("cuotasAdmin")
        ) || [];

    if (cuotasGuardadas.length > 0) {
        cuotas = cuotasGuardadas;
        return;
    }

    const usuarioEjemplo =
        usuarios.length > 0
            ? usuarios[0]
            : {
                id: 100,
                nombre: "Usuario de prueba",
                nickname: "scout_demo"
            };

    cuotas = [
        {
            id: 1,
            usuarioId: usuarioEjemplo.id,
            nombreUsuario: usuarioEjemplo.nombre,
            nickname: usuarioEjemplo.nickname,
            periodo: "Abril 2026",
            vencimiento: "2026-04-10",
            monto: 15000,
            estado: "Pagada"
        },
        {
            id: 2,
            usuarioId: usuarioEjemplo.id,
            nombreUsuario: usuarioEjemplo.nombre,
            nickname: usuarioEjemplo.nickname,
            periodo: "Mayo 2026",
            vencimiento: "2026-05-10",
            monto: 15000,
            estado: "Pendiente"
        },
        {
            id: 3,
            usuarioId: usuarioEjemplo.id,
            nombreUsuario: usuarioEjemplo.nombre,
            nickname: usuarioEjemplo.nickname,
            periodo: "Junio 2026",
            vencimiento: "2026-06-10",
            monto: 15000,
            estado: "Pendiente"
        }
    ];

    guardarCuotas();
}


function guardarCuotas() {
    localStorage.setItem(
        "cuotasAdmin",
        JSON.stringify(cuotas)
    );
}


function actualizarFiltroPeriodos() {
    const periodoSeleccionado =
        filtroPeriodo.value;

    const periodos = [
        ...new Set(
            cuotas.map(function (cuota) {
                return cuota.periodo;
            })
        )
    ];

    filtroPeriodo.innerHTML = `
        <option value="TODOS">
            Todos
        </option>
    `;

    periodos.forEach(function (periodo) {
        const opcion =
            document.createElement("option");

        opcion.value = periodo;
        opcion.textContent = periodo;

        filtroPeriodo.appendChild(opcion);
    });

    if (periodos.includes(periodoSeleccionado)) {
        filtroPeriodo.value =
            periodoSeleccionado;
    }
}


function actualizarIndicadores() {
    const pagadas = cuotas.filter(
        function (cuota) {
            return cuota.estado === "Pagada";
        }
    );

    const pendientes = cuotas.filter(
        function (cuota) {
            return cuota.estado === "Pendiente";
        }
    );

    const totalPendiente = pendientes.reduce(
        function (total, cuota) {
            return total + cuota.monto;
        },
        0
    );

    totalCuotas.textContent = cuotas.length;
    cuotasPagadas.textContent = pagadas.length;
    cuotasPendientes.textContent =
        pendientes.length;

    montoPendiente.textContent =
        formatearMoneda(totalPendiente);
}


function obtenerCuotasFiltradas() {
    const texto =
        buscarCuota.value.trim().toLowerCase();

    return cuotas.filter(function (cuota) {
        const coincideUsuario =
            cuota.nombreUsuario
                .toLowerCase()
                .includes(texto) ||
            cuota.nickname
                .toLowerCase()
                .includes(texto);

        const coincidePeriodo =
            filtroPeriodo.value === "TODOS" ||
            cuota.periodo === filtroPeriodo.value;

        const coincideEstado =
            filtroEstado.value === "TODOS" ||
            cuota.estado === filtroEstado.value;

        return (
            coincideUsuario &&
            coincidePeriodo &&
            coincideEstado
        );
    });
}


function mostrarCuotas() {
    const cuotasFiltradas =
        obtenerCuotasFiltradas();

    listaCuotas.innerHTML = "";

    sinResultados.hidden =
        cuotasFiltradas.length !== 0;

    cuotasFiltradas.forEach(function (cuota) {
        const fila =
            document.createElement("tr");

        const claseEstado =
            cuota.estado === "Pagada"
                ? "estado-activo-admin"
                : "estado-pendiente-admin";

        const botonPagar =
            cuota.estado === "Pendiente"
                ? `
                    <button
                        type="button"
                        class="boton-pagar-admin"
                        data-id="${cuota.id}"
                    >
                        Marcar pagada
                    </button>
                `
                : "";

        fila.innerHTML = `
            <td>
                ${escaparHTML(cuota.nombreUsuario)}
            </td>

            <td>
                @${escaparHTML(cuota.nickname)}
            </td>

            <td>
                ${escaparHTML(cuota.periodo)}
            </td>

            <td>
                ${formatearFecha(cuota.vencimiento)}
            </td>

            <td>
                ${formatearMoneda(cuota.monto)}
            </td>

            <td>
                <span
                    class="estado-usuario-admin
                    ${claseEstado}"
                >
                    ${cuota.estado}
                </span>
            </td>

            <td>
                <div class="acciones-tabla-admin">

                    <button
                        type="button"
                        class="boton-editar-admin"
                        data-id="${cuota.id}"
                    >
                        Editar
                    </button>

                    ${botonPagar}

                </div>
            </td>
        `;

        listaCuotas.appendChild(fila);
    });

    activarBotonesTabla();
    actualizarIndicadores();
}


function activarBotonesTabla() {
    const botonesEditar =
        document.querySelectorAll(
            ".boton-editar-admin"
        );

    const botonesPagar =
        document.querySelectorAll(
            ".boton-pagar-admin"
        );

    botonesEditar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                abrirEdicionCuota(
                    Number(boton.dataset.id)
                );
            }
        );
    });

    botonesPagar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                marcarCuotaPagada(
                    Number(boton.dataset.id)
                );
            }
        );
    });
}


function abrirNuevaCuota() {
    formularioCuota.reset();

    document.getElementById(
        "cuota-id"
    ).value = "";

    tituloFormulario.textContent =
        "Nueva cuota";

    document.getElementById(
        "estado-cuota-admin"
    ).value = "Pendiente";

    contenedorFormulario.hidden = false;

    selectorUsuario.disabled = false;
    selectorUsuario.focus();

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function abrirEdicionCuota(idCuota) {
    const cuota = cuotas.find(
        function (elemento) {
            return elemento.id === idCuota;
        }
    );

    if (!cuota) {
        return;
    }

    tituloFormulario.textContent =
        "Editar cuota";

    document.getElementById(
        "cuota-id"
    ).value = cuota.id;

    selectorUsuario.value =
        cuota.usuarioId;

    selectorUsuario.disabled = true;

    document.getElementById(
        "periodo-cuota"
    ).value =
        convertirPeriodoAInput(cuota.periodo);

    document.getElementById(
        "vencimiento-cuota"
    ).value = cuota.vencimiento;

    document.getElementById(
        "monto-cuota-admin"
    ).value = cuota.monto;

    document.getElementById(
        "estado-cuota-admin"
    ).value = cuota.estado;

    contenedorFormulario.hidden = false;

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function cerrarFormularioCuota() {
    formularioCuota.reset();
    selectorUsuario.disabled = false;
    contenedorFormulario.hidden = true;
}


function marcarCuotaPagada(idCuota) {
    const cuota = cuotas.find(
        function (elemento) {
            return elemento.id === idCuota;
        }
    );

    if (!cuota) {
        return;
    }

    const confirmar = confirm(
        `¿Deseas marcar como pagada la cuota ` +
        `${cuota.periodo} de ` +
        `@${cuota.nickname}?`
    );

    if (!confirmar) {
        return;
    }

    cuota.estado = "Pagada";

    guardarCuotas();
    mostrarCuotas();
}


formularioCuota.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        const idCuota = Number(
            document.getElementById(
                "cuota-id"
            ).value
        );

        const usuarioId =
            Number(selectorUsuario.value);

        const periodo =
            convertirPeriodo(
                document.getElementById(
                    "periodo-cuota"
                ).value
            );

        const vencimiento =
            document.getElementById(
                "vencimiento-cuota"
            ).value;

        const monto = Number(
            document.getElementById(
                "monto-cuota-admin"
            ).value
        );

        const estado =
            document.getElementById(
                "estado-cuota-admin"
            ).value;

        if (!Number.isInteger(monto) || monto <= 0) {
            alert("Ingresa un monto válido.");
            return;
        }

        if (idCuota) {
            const cuota = cuotas.find(
                function (elemento) {
                    return elemento.id === idCuota;
                }
            );

            if (cuota) {
                cuota.periodo = periodo;
                cuota.vencimiento = vencimiento;
                cuota.monto = monto;
                cuota.estado = estado;
            }
        } else {
            const usuario = usuarios.find(
                function (elemento) {
                    return elemento.id === usuarioId;
                }
            );

            if (!usuario) {
                alert(
                    "Debes seleccionar un usuario."
                );
                return;
            }

            const cuotaDuplicada = cuotas.some(
                function (cuota) {
                    return (
                        cuota.usuarioId === usuarioId &&
                        cuota.periodo === periodo
                    );
                }
            );

            if (cuotaDuplicada) {
                alert(
                    "El usuario ya tiene una cuota " +
                    "registrada para este periodo."
                );
                return;
            }

            cuotas.push({
                id: Date.now(),
                usuarioId: usuario.id,
                nombreUsuario: usuario.nombre,
                nickname: usuario.nickname,
                periodo: periodo,
                vencimiento: vencimiento,
                monto: monto,
                estado: estado
            });
        }

        guardarCuotas();
        actualizarFiltroPeriodos();
        cerrarFormularioCuota();
        mostrarCuotas();

        alert(
            idCuota
                ? "Cuota actualizada correctamente."
                : "Cuota registrada correctamente."
        );
    }
);


buscarCuota.addEventListener(
    "input",
    mostrarCuotas
);

filtroPeriodo.addEventListener(
    "change",
    mostrarCuotas
);

filtroEstado.addEventListener(
    "change",
    mostrarCuotas
);

botonNuevaCuota.addEventListener(
    "click",
    abrirNuevaCuota
);

cerrarFormulario.addEventListener(
    "click",
    cerrarFormularioCuota
);

cancelarFormulario.addEventListener(
    "click",
    cerrarFormularioCuota
);


cargarUsuarios();
cargarCuotas();
actualizarFiltroPeriodos();
mostrarCuotas();