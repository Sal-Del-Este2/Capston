const compras = [
    {
        id: "SC-2026-001",
        fecha: "15-03-2026",
        productos: "Pañolín Scout",
        total: 12990,
        estado: "Entregado"
    },
    {
        id: "SC-2026-002",
        fecha: "08-05-2026",
        productos: "Camisa Scout, Insignia institucional",
        total: 34980,
        estado: "Entregado"
    },
    {
        id: "SC-2026-003",
        fecha: "25-08-2026",
        productos: "Mochila de excursión",
        total: 45990,
        estado: "En preparación"
    }
];

const listaCompras =
    document.getElementById("lista-compras");

const totalPedidos =
    document.getElementById("total-pedidos");

const comprasEntregadas =
    document.getElementById("compras-entregadas");

const totalComprado =
    document.getElementById("total-comprado");

function formatearMoneda(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}

function obtenerClaseEstado(estado) {
    if (estado === "Entregado") {
        return "estado-entregado";
    }

    if (estado === "En preparación") {
        return "estado-preparacion";
    }

    return "estado-pendiente-compra";
}

function mostrarCompras() {
    if (!listaCompras) {
        return;
    }

    listaCompras.innerHTML = "";

    compras.forEach(function (compra) {
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td>
                <strong>${compra.id}</strong>
            </td>

            <td>${compra.fecha}</td>

            <td>${compra.productos}</td>

            <td>${formatearMoneda(compra.total)}</td>

            <td>
                <span class="estado-compra ${obtenerClaseEstado(compra.estado)}">
                    ${compra.estado}
                </span>
            </td>

            <td>
                <button
                    type="button"
                    class="boton-detalle-compra"
                    data-id="${compra.id}"
                >
                    Ver detalle
                </button>
            </td>
        `;

        listaCompras.appendChild(fila);
    });

    actualizarResumen();
    activarBotonesDetalle();
}

function actualizarResumen() {
    const entregadas = compras.filter(function (compra) {
        return compra.estado === "Entregado";
    });

    const montoTotal = compras.reduce(
        function (acumulado, compra) {
            return acumulado + compra.total;
        },
        0
    );

    totalPedidos.textContent = compras.length;
    comprasEntregadas.textContent = entregadas.length;
    totalComprado.textContent = formatearMoneda(montoTotal);
}

function activarBotonesDetalle() {
    const botones =
        document.querySelectorAll(".boton-detalle-compra");

    botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const compraSeleccionada = compras.find(
                function (compra) {
                    return compra.id === boton.dataset.id;
                }
            );

            if (compraSeleccionada) {
                alert(
                    `Pedido: ${compraSeleccionada.id}\n` +
                    `Fecha: ${compraSeleccionada.fecha}\n` +
                    `Productos: ${compraSeleccionada.productos}\n` +
                    `Total: ${formatearMoneda(compraSeleccionada.total)}\n` +
                    `Estado: ${compraSeleccionada.estado}`
                );
            }
        });
    });
}

mostrarCompras();