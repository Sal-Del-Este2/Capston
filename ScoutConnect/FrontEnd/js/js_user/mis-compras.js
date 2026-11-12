const API_FINANZAS_COMPRAS = "http://localhost:8082";
const URL_MIS_ORDENES = `${API_FINANZAS_COMPRAS}/api/ordenes/mias`;
const listaCompras = document.getElementById("lista-compras");
const totalPedidos = document.getElementById("total-pedidos");
const comprasEntregadas = document.getElementById("compras-entregadas");
const totalComprado = document.getElementById("total-comprado");
const mensajeCompras = document.getElementById("mensaje-compras");
let compras = [];
function formatearMoneda(valor) {
    const numero = Number(valor ?? 0);
    return numero.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}
function formatearFecha(fecha) {
    if (!fecha) return "—";
    const valor = new Date(fecha);
    if (Number.isNaN(valor.getTime())) return String(fecha);
    return valor.toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function obtenerEtiquetaEstado(estado) {
    const estados = {
        "PENDIENTE": "Pendiente",
        "EN_PROCESO": "En proceso",
        "PENDIENTE_ENTREGA": "Pendiente de entrega",
        "ENTREGADO": "Entregado",
        "CANCELADO": "Cancelado"
    };
    return estados[String(estado || "").trim().toUpperCase()] || estado || "Sin estado";
}
function obtenerClaseEstado(estado) {
    const valor = String(estado || "").trim().toUpperCase();
    if (valor === "ENTREGADO") return "estado-entregado";
    if (valor === "EN PROCESO" || valor === "PENDIENTE DE ENTREGA") return "estado-preparacion";
    return "estado-pendiente-compra";
}
function obtenerResumenProductos(detalles) {
    if (!Array.isArray(detalles) || detalles.length === 0) return "Sin detalle";
    return detalles.map(detalle => `${detalle.nombreProducto || `Producto ${detalle.productoId}`} × ${detalle.cantidad ?? 1}`).join(", ");
}
function crearCelda(texto) {
    const celda = document.createElement("td");
    celda.textContent = texto ?? "—";
    return celda;
}
function mostrarDetalleCompra(compra) {
    const detalles = Array.isArray(compra.detalles) ? compra.detalles : [];
    const lineas = detalles.map(detalle =>
        `${detalle.nombreProducto || `Producto ${detalle.productoId}`} | ` +
        `Cantidad: ${detalle.cantidad}`
        // `Precio unitario: ${formatearMoneda(detalle.precioUnitario)} | ` +
        // `Subtotal: ${formatearMoneda(detalle.subtotal)} | ` +
        // `Impuesto: ${formatearMoneda(detalle.montoImpuesto)}`
    );
    alert(
        `Pedido: #${compra.id}\n` +
        `Fecha: ${formatearFecha(compra.fecha)}\n` +
        `Estado de compra: ${obtenerEtiquetaEstado(compra.estado)}\n` +
        `Estado de pago: ${compra.estadoPago || "No disponible"}\n` +
        `Neto: ${formatearMoneda(compra.neto)}\n` +
        `Impuestos: ${formatearMoneda(compra.montoImpuesto)}\n` +
        `Total: ${formatearMoneda(compra.total)}\n\n` +
        `Productos:\n${lineas.length ? lineas.join("\n") : "Sin detalle disponible"}`
    );
}
function mostrarCompras() {
    listaCompras.innerHTML = "";
    if (compras.length === 0) {
        const fila = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 6;
        celda.textContent = "Todavía no tienes compras registradas.";
        celda.style.textAlign = "center";
        fila.appendChild(celda);
        listaCompras.appendChild(fila);
        actualizarResumen();
        return;
    }
    compras.forEach(compra => {
        const fila = document.createElement("tr");
        fila.appendChild(crearCelda(`#${compra.id}`));
        fila.appendChild(crearCelda(formatearFecha(compra.fecha)));
        fila.appendChild(crearCelda(obtenerResumenProductos(compra.detalles)));
        fila.appendChild(crearCelda(formatearMoneda(compra.total)));
        const celdaEstado = document.createElement("td");
        const etiqueta = document.createElement("span");
        etiqueta.className = `estado-compra ${obtenerClaseEstado(compra.estado)}`;
        etiqueta.textContent = `${compra.estadoPago || "No disponible"} | ${obtenerEtiquetaEstado(compra.estado)}`;
        celdaEstado.appendChild(etiqueta);
        fila.appendChild(celdaEstado);
        const celdaDetalle = document.createElement("td");
        const botonDetalle = document.createElement("button");
        botonDetalle.type = "button";
        botonDetalle.className = "boton-detalle-compra";
        botonDetalle.textContent = "Ver detalle";
        botonDetalle.addEventListener("click", () => mostrarDetalleCompra(compra));
        celdaDetalle.appendChild(botonDetalle);
        fila.appendChild(celdaDetalle);
        listaCompras.appendChild(fila);
    });
    actualizarResumen();
}
function actualizarResumen() {
    // Excluir compras cancelados.
    const comprasValidas = compras.filter(compra => String(compra.estado || "").trim().toUpperCase() !== "CANCELADO");
    // Contar las compras entregados.
    const entregadas = comprasValidas.filter(compra => String(compra.estado || "").trim().toUpperCase() === "ENTREGADO");
    // Suma únicamente las compras no canceladas.
    const montoTotal = comprasValidas.reduce((acumulado, compra) => acumulado + Number(compra.total || 0), 0);
    totalPedidos.textContent = comprasValidas.length;
    comprasEntregadas.textContent = entregadas.length;
    totalComprado.textContent = formatearMoneda(montoTotal);
}
async function cargarCompras() {
    try {
        mensajeCompras.textContent = "Cargando historial...";
        const respuesta = await fetchAutenticado(`${URL_MIS_ORDENES}?pagina=0&tamanio=100`, { method: "GET" });
        const data = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {throw new Error(data.error || data.mensaje || `No se pudo consultar el historial (${respuesta.status}).`);}
        compras = Array.isArray(data) ? data : (Array.isArray(data.content) ? data.content : []);
        compras.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0));
        mensajeCompras.textContent = compras.length
            ? `Se encontraron ${compras.length} pedido(s).`
            : "No hay compras registradas.";
        mostrarCompras();
    } catch (error) {
        console.error("Error al cargar el historial:", error);
        compras = [];
        mostrarCompras();
        mensajeCompras.textContent = error.message || "No fue posible cargar tus compras.";
    }
}
cargarCompras();