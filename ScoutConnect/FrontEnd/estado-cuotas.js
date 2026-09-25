const cuotas = [
    {
        id: 1,
        periodo: "Enero 2026",
        vencimiento: "10-01-2026",
        monto: 15000,
        estado: "Pagada"
    },
    {
        id: 2,
        periodo: "Febrero 2026",
        vencimiento: "10-02-2026",
        monto: 15000,
        estado: "Pagada"
    },
    {
        id: 3,
        periodo: "Marzo 2026",
        vencimiento: "10-03-2026",
        monto: 15000,
        estado: "Pagada"
    },
    {
        id: 4,
        periodo: "Abril 2026",
        vencimiento: "10-04-2026",
        monto: 15000,
        estado: "Pendiente"
    },
    {
        id: 5,
        periodo: "Mayo 2026",
        vencimiento: "10-05-2026",
        monto: 15000,
        estado: "Pendiente"
    },
    {
        id: 6,
        periodo: "Junio 2026",
        vencimiento: "10-06-2026",
        monto: 15000,
        estado: "Pendiente"
    }
];

const listaCuotas =
    document.getElementById("lista-cuotas");

const cantidadPagadas =
    document.getElementById("cantidad-pagadas");

const cantidadPendientes =
    document.getElementById("cantidad-pendientes");

const totalPendiente =
    document.getElementById("total-pendiente");

function formatearMoneda(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}

function mostrarCuotas() {
    if (!listaCuotas) {
        return;
    }

    listaCuotas.innerHTML = "";

    cuotas.forEach(function (cuota) {
        const fila = document.createElement("tr");

        const claseEstado =
            cuota.estado === "Pagada"
                ? "estado-pagada"
                : "estado-pendiente";

        const accion =
            cuota.estado === "Pagada"
                ? `<span class="texto-cuota-pagada">
                    Pago registrado
                </span>`
                : `<button
                    type="button"
                    class="boton-pagar-cuota"
                    data-id="${cuota.id}"
                >
                    Pagar
                </button>`;

        fila.innerHTML = `
            <td>${cuota.periodo}</td>
            <td>${cuota.vencimiento}</td>
            <td>${formatearMoneda(cuota.monto)}</td>
            <td>
                <span class="estado-cuota ${claseEstado}">
                    ${cuota.estado}
                </span>
            </td>
            <td>${accion}</td>
        `;

        listaCuotas.appendChild(fila);
    });

    actualizarResumen();
    activarBotonesPago();
}

function actualizarResumen() {
    const cuotasPagadas = cuotas.filter(function (cuota) {
        return cuota.estado === "Pagada";
    });

    const cuotasPendientes = cuotas.filter(function (cuota) {
        return cuota.estado === "Pendiente";
    });

    const montoPendiente = cuotasPendientes.reduce(
        function (total, cuota) {
            return total + cuota.monto;
        },
        0
    );

    cantidadPagadas.textContent = cuotasPagadas.length;
    cantidadPendientes.textContent = cuotasPendientes.length;
    totalPendiente.textContent = formatearMoneda(montoPendiente);
}

function activarBotonesPago() {
    const botonesPago =
        document.querySelectorAll(".boton-pagar-cuota");

    botonesPago.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const idCuota = Number(boton.dataset.id);

            const cuotaSeleccionada = cuotas.find(
                function (cuota) {
                    return cuota.id === idCuota;
                }
            );

            if (cuotaSeleccionada) {
                alert(
                    `Has seleccionado la cuota de ` +
                    `${cuotaSeleccionada.periodo} por ` +
                    `${formatearMoneda(cuotaSeleccionada.monto)}.\n\n` +
                    `Posteriormente este botón se conectará ` +
                    `con la pasarela de pago.`
                );
            }
        });
    });
}

mostrarCuotas();