"use strict";
const API_DONACIONES_ADMIN = "http://localhost:8082/api/donaciones/admin";
const TAMANIO_PAGINA = 100;
let donaciones = [];
const listaPagos = document.getElementById("lista-pagos-admin");
const totalRecaudado = document.getElementById("total-recaudado-admin");
const totalDonaciones = document.getElementById("total-donaciones-admin");
const operacionesPendientes = document.getElementById("operaciones-pendientes-admin");
const buscarOperacion = document.getElementById("buscar-operacion-admin");
const filtroEstado = document.getElementById("filtro-estado-pago-admin");
const filtroFechaDesde = document.getElementById("filtro-fecha-desde");
const filtroFechaHasta = document.getElementById("filtro-fecha-hasta");
const sinResultados = document.getElementById("sin-resultados-pagos-admin");
const estadoCarga = document.getElementById("estado-carga-donaciones-admin");
const botonActualizar = document.getElementById("actualizar-donaciones-admin");
const contenedorDetalle = document.getElementById("detalle-operacion-admin");
const contenidoDetalle = document.getElementById("contenido-detalle-operacion");
const cerrarDetalle = document.getElementById("cerrar-detalle-operacion");
function escaparHTML(valor) {
    const elemento = document.createElement("div");
    elemento.textContent = String(valor ?? "");
    return elemento.innerHTML;
}
function formatearMoneda(valor) {
    const monto = Number(valor) || 0;
    return monto.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}
function formatearFecha(fecha) {
    if (!fecha) {return "No disponible";}
    const fechaTexto = String(fecha);
    // El backend entrega LocalDateTime en formato ISO.
    const partes = fechaTexto.substring(0, 10).split("-");
    if (partes.length !== 3) {return "No disponible";}
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
function formatearFechaHora(fecha) {
    if (!fecha) {return "No disponible"; }
    const fechaTexto = String(fecha);
    const fechaFormateada = formatearFecha(fechaTexto);
    const hora = fechaTexto.length >= 16 ? fechaTexto.substring(11, 16) : "";
    return hora ? `${fechaFormateada} ${hora}` : fechaFormateada;
}
function normalizarTexto(valor) {return String(valor ?? "").trim().toLowerCase();}
function obtenerNombreDonante(donacion) {
    if (donacion.tipoDonacion === "ANONIMA") {return "Donante anónimo";}
    return donacion.nombreDonante || "Nombre no informado";
}
function obtenerClaseEstado(estado) {
    const estadoNormalizado = normalizarTexto(estado).toUpperCase();
    if (estadoNormalizado === "PAGADO") {return "estado-activo-admin";}
    if (estadoNormalizado === "PENDIENTE") {return "estado-pendiente-admin";}
    return "estado-inactivo-admin";
}
// datos del backend donacion
async function consultarDonaciones() {
    if (typeof esAdministradorActivo !== "function" ||
        !esAdministradorActivo()) {
        window.location.replace("login.html");
        return;
    }
    if (typeof fetchAutenticado !== "function") {throw new Error("No está disponible el mecanismo de autenticación.");}
    const donacionesObtenidas = [];
    let pagina = 0;
    let totalPaginas = 1;
    do {
        const url = `${API_DONACIONES_ADMIN}?pagina=${pagina}&tamanio=${TAMANIO_PAGINA}`;
        const respuesta = await fetchAutenticado(url, {method: "GET"});
        if (!respuesta.ok) {throw new Error(`No fue posible consultar las donaciones. Código HTTP: ${respuesta.status}`);}
        const resultado = await respuesta.json();
        if (!resultado || !Array.isArray(resultado.content)) {throw new Error("La respuesta del servidor no tiene el formato esperado.");}
        donacionesObtenidas.push(...resultado.content);
        totalPaginas = Number(resultado.totalPages) || 0;
        pagina++;
    } while (pagina < totalPaginas);
    donaciones = donacionesObtenidas;
    // Ordenar desde la donación más reciente.
    donaciones.sort((a, b) => {return String(b.fecha || "").localeCompare(String(a.fecha || ""));});
    actualizarIndicadores();
    mostrarDonaciones();
}
// Resumen
function actualizarIndicadores() {
    const donacionesPagadas = donaciones.filter(donacion => normalizarTexto(donacion.estadoPago).toUpperCase() === "PAGADO");
    const donacionesPendientes = donaciones.filter(donacion => normalizarTexto(donacion.estadoPago).toUpperCase() === "PENDIENTE");
    const montoTotalRecaudado = donacionesPagadas.reduce((total, donacion) => total + (Number(donacion.monto) || 0), 0);
    totalRecaudado.textContent = formatearMoneda(montoTotalRecaudado);
    totalDonaciones.textContent = donaciones.length;
    operacionesPendientes.textContent = donacionesPendientes.length;
}
// Filtros en donacion
function obtenerDonacionesFiltradas() {
    const texto = normalizarTexto(buscarOperacion.value);
    const estadoSeleccionado = filtroEstado.value;
    const fechaDesde = filtroFechaDesde.value;
    const fechaHasta = filtroFechaHasta.value;
    return donaciones.filter(donacion => {
        const nombre = normalizarTexto(donacion.nombreDonante);
        const correo = normalizarTexto(donacion.correoDonante);
        const grupo = normalizarTexto(donacion.grupoNombre);
        const tipo = normalizarTexto(donacion.tipoDonacion);
        const coincideTexto =
            nombre.includes(texto) ||
            correo.includes(texto) ||
            grupo.includes(texto) ||
            tipo.includes(texto) ||
            (tipo === "anonima" && "donante anónimo".includes(texto));

        const estado = normalizarTexto(donacion.estadoPago).toUpperCase();
        const coincideEstado = estadoSeleccionado === "TODOS" || estado === estadoSeleccionado;
        const fechaDonacion = String(donacion.fecha || "").substring(0, 10);
        const coincideDesde = !fechaDesde || fechaDonacion >= fechaDesde;
        const coincideHasta = !fechaHasta || fechaDonacion <= fechaHasta;
        return coincideTexto && coincideEstado && coincideDesde && coincideHasta;
    });
}
// Mostrar donaciones
function mostrarDonaciones() {
    const donacionesFiltradas = obtenerDonacionesFiltradas();
    listaPagos.innerHTML = "";
    sinResultados.hidden = donacionesFiltradas.length !== 0;
    donacionesFiltradas.forEach(donacion => {
        const fila = document.createElement("tr");
        const donante = escaparHTML(obtenerNombreDonante(donacion));
        const correo = donacion.tipoDonacion === "IDENTIFICADA" && donacion.correoDonante ? `<br><small>${escaparHTML(donacion.correoDonante)}</small>` : "";
        const tipo = donacion.tipoDonacion === "ANONIMA" ? "Anónima" : "Identificada";
        const grupo = donacion.grupoNombre ? escaparHTML(donacion.grupoNombre) : "No asociado";
        const estado = escaparHTML(donacion.estadoPago || "No disponible");
        fila.innerHTML = `
            <td>${escaparHTML(formatearFechaHora(donacion.fecha))}</td>
            <td>
                ${donante}
                ${correo}
            </td>
            <td>${tipo}</td>
            <td>${grupo}</td>
            <td>${formatearMoneda(donacion.monto)}</td>
            <td>
                <span class="estado-usuario-admin ${obtenerClaseEstado(donacion.estadoPago)}">${estado}</span>
            </td>
            <td>
                <div class="acciones-tabla-admin">
                    <button type="button" class="boton-detalle-operacion" data-id="${Number(donacion.id)}">Ver detalle</button>
                </div>
            </td>
        `;
        listaPagos.appendChild(fila);
    });
    actualizarIndicadores();
}
// Donación
function mostrarDetalleDonacion(idDonacion) {
    const donacion = donaciones.find(elemento => Number(elemento.id) === Number(idDonacion));
    if (!donacion) {return;}
    const esAnonima = donacion.tipoDonacion === "ANONIMA";
    const nombre = esAnonima ? "Donante anónimo" : donacion.nombreDonante || "No informado";
    const correo = esAnonima ? "No corresponde" : donacion.correoDonante || "No informado";
    contenidoDetalle.innerHTML = `
        <div class="dato-detalle-operacion">
            <span>Tipo de donación</span>
            <strong>${escaparHTML(esAnonima ? "Anónima" : "Identificada")}</strong>
        </div>
        <div class="dato-detalle-operacion">
            <span>Donante</span>
            <strong>${escaparHTML(nombre)}</strong>
        </div>
        <div class="dato-detalle-operacion">
            <span>Correo electrónico</span>
            <strong>${escaparHTML(correo)}</strong>
        </div>
        <div class="dato-detalle-operacion">
            <span>Monto</span>
            <strong>${formatearMoneda(donacion.monto)}</strong>
        </div>
        <div class="dato-detalle-operacion">
            <span>Fecha de donación</span>
            <strong>${escaparHTML(formatearFechaHora(donacion.fecha))}</strong>
        </div>
        <div class="dato-detalle-operacion">
            <span>Estado del pago</span>
            <strong>${escaparHTML(donacion.estadoPago || "No disponible")}</strong>
        </div>
        <div class="dato-detalle-operacion">
            <span>Grupo asociado</span>
            <strong>${escaparHTML(donacion.grupoNombre || "No asociado")}</strong>
        </div>
    `;
    contenedorDetalle.hidden = false;
    contenedorDetalle.scrollIntoView({behavior: "smooth", block: "start"});
}
// registros de la tabla
listaPagos.addEventListener("click", function (evento) {
    const boton = evento.target.closest(".boton-detalle-operacion");
    if (!boton) {return;}
    const idDonacion = Number(boton.dataset.id);
    mostrarDetalleDonacion(idDonacion);
});
// Valida las fechas
function validarRangoFechas() {
    if (
        filtroFechaDesde.value &&
        filtroFechaHasta.value &&
        filtroFechaDesde.value > filtroFechaHasta.value
    ) {alert("La fecha inicial no puede ser posterior a la fecha final."); filtroFechaHasta.value = "";}
    mostrarDonaciones();
}
// Actualizacion y carga
async function cargarDonaciones() {
    botonActualizar.disabled = true;
    botonActualizar.textContent = "Actualizando...";
    estadoCarga.hidden = false;
    estadoCarga.textContent = "Consultando donaciones...";
    try {await consultarDonaciones();
        estadoCarga.textContent = `Se encontraron ${donaciones.length} donaciones registradas.`;
        if (donaciones.length === 0) {estadoCarga.textContent = "No existen donaciones registradas.";}
    } catch (error) {
        console.error("Error al consultar donaciones:", error);
        estadoCarga.textContent = "No fue posible cargar las donaciones. Revisa la sesión y la conexión con el servidor.";
        listaPagos.innerHTML = "";
        sinResultados.hidden = true;
        totalRecaudado.textContent = formatearMoneda(0);
        totalDonaciones.textContent = "0";
        operacionesPendientes.textContent = "0";
        if (error.message) {console.error("Detalle del error:", error.message);}
    } finally {botonActualizar.disabled = false; botonActualizar.textContent = "Actualizar";}
}
// Filtros y controles
buscarOperacion.addEventListener("input", mostrarDonaciones);
filtroEstado.addEventListener("change", mostrarDonaciones);
filtroFechaDesde.addEventListener("change", validarRangoFechas);
filtroFechaHasta.addEventListener("change", validarRangoFechas);
botonActualizar.addEventListener("click", cargarDonaciones);
cerrarDetalle.addEventListener("click", function () {contenedorDetalle.hidden = true;});
cargarDonaciones();