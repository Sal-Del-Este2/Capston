const API_FINANZAS = "http://localhost:8082/finanzas";
const listaCuotas = document.getElementById("lista-cuotas");
const cantidadPagadas = document.getElementById("cantidad-pagadas");
const cantidadPendientes = document.getElementById("cantidad-pendientes");
const totalPendiente = document.getElementById("total-pendiente");
function formatearMoneda(valor) {return Number(valor || 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});}
function escaparHTML(texto) {const elemento = document.createElement("div");
    elemento.textContent = String(texto ?? "");
    return elemento.innerHTML;
}
function obtenerNombreMes(numeroMes) {
    const meses = [
        "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
        "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses[Number(numeroMes) - 1] || "";
}
function formatearFecha(fecha) {
    if (!fecha) return "";
    const partes = fecha.split("-");
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
function mostrarCuotas(cuotas) {
    if (!listaCuotas) return;
    listaCuotas.innerHTML = "";
    if (!Array.isArray(cuotas) || cuotas.length === 0) {
        listaCuotas.innerHTML = `
            <tr>
                <td colspan="5">No tienes cuotas registradas.</td>
            </tr>
        `;
        return;
    }
    cuotas.forEach(function (cuota) {
        const fila = document.createElement("tr");
        const esPendiente = cuota.estado === "PENDIENTE";
        const claseEstado = esPendiente ? "estado-pendiente" : "estado-pagada";
        const accion = esPendiente
        ? `<button type="button" class="boton-pagar-cuota" data-id="${cuota.id}">Pagar</button>`
            : `<span class="texto-cuota-pagada">Pago registrado</span>`;
        fila.innerHTML = `
            <td>${escaparHTML(obtenerNombreMes(cuota.mes))} ${escaparHTML(cuota.anio)}</td>
            <td>${escaparHTML(formatearFecha(cuota.fechaVencimiento))}</td>
            <td>${escaparHTML(formatearMoneda(cuota.monto))}</td>
            <td><span class="estado-cuota ${claseEstado}">${escaparHTML(cuota.estado)}</span></td>
            <td>${accion}</td>
        `;
        listaCuotas.appendChild(fila);
    });
    activarBotonesPago(cuotas);
}
function actualizarResumen(resumen) {
    cantidadPagadas.textContent = resumen.cuotasPagadas ?? 0;
    cantidadPendientes.textContent = resumen.cuotasPendientes ?? 0;
    totalPendiente.textContent = formatearMoneda(resumen.montoAdeudado ?? 0);
}
function activarBotonesPago(cuotas) {
    document.querySelectorAll(".boton-pagar-cuota").forEach(function (boton) {
        boton.addEventListener("click", async function () {
            const cuotaId = Number(boton.dataset.id);
            const cuota = cuotas.find(function (elemento) {return elemento.id === cuotaId;});
            if (!cuota) return;
            const confirmar = confirm(`¿Deseas pagar la cuota de ${obtenerNombreMes(cuota.mes)} ${cuota.anio} ` + `por ${formatearMoneda(cuota.monto)}?`);
            if (!confirmar) return;
            await iniciarPagoCuota(cuota);
        });
    });
}
async function iniciarPagoCuota(cuota) {
    try {const respuesta = await fetchAutenticado(`${API_FINANZAS}/pagar`, {
        method: "POST",
        body: JSON.stringify({
            tipoPago: "CUOTA",
            cuotaId: cuota.id,
            monto: cuota.monto,
            descripcion: `Pago cuota ${obtenerNombreMes(cuota.mes)} ${cuota.anio}`
        })});
        const data = await respuesta.json();
        if (!respuesta.ok) {alert(data.error || "No fue posible iniciar el pago."); return;}
        if (data.urlPago) {window.location.href = data.urlPago;
        } else {alert("No se recibió la URL de pago.");}
    } catch (error) {console.error("Error al iniciar pago:", error); alert(error.message || "No fue posible conectar con el servicio de pagos.");}
}
async function cargarCuotas() {
    try {
        const respuestaCuotas = await fetchAutenticado(`${API_FINANZAS}/cuotas/mias`);
        const cuotas = await respuestaCuotas.json();
        if (!respuestaCuotas.ok) {throw new Error(cuotas.error || "No se pudieron cargar las cuotas.");}
        const respuestaResumen = await fetchAutenticado(`${API_FINANZAS}/cuotas/mias/resumen`);
        const resumen = await respuestaResumen.json();
        if (!respuestaResumen.ok) {throw new Error(resumen.error || "No se pudo cargar el resumen.");}
        mostrarCuotas(cuotas);
        actualizarResumen(resumen);
    } catch (error) {console.error("Error al cargar cuotas:", error); alert(error.message || "No fue posible cargar tus cuotas.");}
}
cargarCuotas();