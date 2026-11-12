const API_FINANZAS = "http://localhost:8082/finanzas";
let cuotasPendientes = [];
let operacionActual = null;
const formulario = document.getElementById("form-pago-donacion");
const tipoOperacion = document.getElementById("tipo-operacion");
const camposMembresia = document.getElementById("campos-membresia");
const camposDonacion = document.getElementById("campos-donacion");
const selectorCuota = document.getElementById("cuota-membresia");
const montoCuota = document.getElementById("monto-cuota");
const montoDonacion = document.getElementById("monto-donacion");
const tipoDonacion = document.getElementById("tipo-donacion");
const datosDonante = document.getElementById("datos-donante");
const nombreDonante = document.getElementById("nombre-donante");
const correoDonante = document.getElementById("correo-donante");
const botonRevisar = document.getElementById("boton-revisar-operacion");
const resumenOperacion = document.getElementById("resumen-operacion");
const detalleResumen = document.getElementById("detalle-resumen-operacion");
const botonEditar = document.getElementById("editar-operacion");
const botonContinuarPago = document.getElementById("continuar-pago");
const listaOperaciones = document.getElementById("lista-operaciones");
function formatearMoneda(valor) {return Number(valor || 0).toLocaleString("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});}
function escaparHTML(texto) {const elemento = document.createElement("div");
    elemento.textContent = String(texto ?? "");
    return elemento.innerHTML;
}
function obtenerNombreMes(numeroMes) {const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ];
    return meses[Number(numeroMes) - 1] || "";
}
function cargarDatosUsuario() {
    const perfil = JSON.parse(localStorage.getItem("perfilUsuario"));
    const correoSesion = sessionStorage.getItem("correoUsuario");
    if (perfil) {
        nombreDonante.value = perfil.nombre || "";
        correoDonante.value = perfil.correo || correoSesion || "";
    } else {correoDonante.value = correoSesion || "";}
}
// function usuarioAutenticado() {return typeof obtenerToken === "function" && obtenerToken() !== "";}
function haySesionFinanzas() {return typeof obtenerToken === "function" && obtenerToken() !== "";}
async function cargarCuotasPendientes() {
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/cuotas/mias`);
        const cuotas = await leerJSON(respuesta);
        if (!respuesta.ok) {throw new Error(cuotas?.error || "No se pudieron cargar las cuotas.");}
        cuotasPendientes = Array.isArray(cuotas)
            ? cuotas.filter(function (cuota) {return cuota.estado === "PENDIENTE";})
            : [];
        selectorCuota.innerHTML = `<option value="">Selecciona una cuota</option>`;
        if (cuotasPendientes.length === 0) {
            const opcion = document.createElement("option");
            opcion.value = "";
            opcion.textContent = "No tienes cuotas pendientes";
            selectorCuota.appendChild(opcion);
            return;
        }
        cuotasPendientes.forEach(function (cuota) {
            const opcion = document.createElement("option");
            opcion.value = cuota.id;
            opcion.textContent = `${obtenerNombreMes(cuota.mes)} ${cuota.anio} — ${formatearMoneda(cuota.monto)}`;
            selectorCuota.appendChild(opcion);
        });
    } catch (error) {console.error("Error al cargar cuotas pendientes:", error); alert(error.message || "No fue posible cargar tus cuotas pendientes.");}
}
function limpiarCampos() {
    selectorCuota.value = "";
    montoCuota.textContent = "$0";
    montoDonacion.value = "";
    tipoDonacion.value = "";
    datosDonante.hidden = true;
    selectorCuota.required = false;
    montoDonacion.required = false;
    tipoDonacion.required = false;
    nombreDonante.required = false;
    correoDonante.required = false;
    resumenOperacion.hidden = true;
    operacionActual = null;
}
tipoOperacion.addEventListener("change", function () {
    limpiarCampos();
    camposMembresia.hidden = true;
    camposDonacion.hidden = true;
    botonRevisar.hidden = true;
    if (tipoOperacion.value === "MEMBRESIA") {
        camposMembresia.hidden = false;
        botonRevisar.hidden = false;
        selectorCuota.required = true;
    }
    if (tipoOperacion.value === "DONACION") {
        camposDonacion.hidden = false;
        botonRevisar.hidden = false;
        montoDonacion.required = true;
        tipoDonacion.required = true;
    }
});
selectorCuota.addEventListener("change", function () {
    const cuotaId = Number(selectorCuota.value);
    const cuota = cuotasPendientes.find(function (elemento) {return elemento.id === cuotaId;});
    montoCuota.textContent = cuota ? formatearMoneda(cuota.monto) : "$0";
});
tipoDonacion.addEventListener("change", function () {
    const esIdentificada = tipoDonacion.value === "IDENTIFICADA";
    if (haySesionFinanzas()) {
        // Usuario con sesión: la donación se identifica automáticamente
        datosDonante.hidden = true;
        nombreDonante.required = false;
        correoDonante.required = false;
        return;
    }
    datosDonante.hidden = !esIdentificada;
    nombreDonante.required = esIdentificada;
    correoDonante.required = esIdentificada;
    if (esIdentificada) {cargarDatosUsuario();
    } else {
        nombreDonante.value = "";
        correoDonante.value = "";
    }
});
formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (tipoOperacion.value === "MEMBRESIA") {prepararMembresia();}
    if (tipoOperacion.value === "DONACION") {prepararDonacion();}
});
function prepararMembresia() {
    const cuotaId = Number(selectorCuota.value);
    const cuota = cuotasPendientes.find(function (elemento) {return elemento.id === cuotaId;});
    if (!cuota) {alert("Debes seleccionar una cuota pendiente."); return;}
    operacionActual = {
        tipoPago: "CUOTA",
        cuotaId: cuota.id,
        monto: cuota.monto,
        descripcion: `Pago cuota ${obtenerNombreMes(cuota.mes)} ${cuota.anio}`,
        periodo: `${obtenerNombreMes(cuota.mes)} ${cuota.anio}`
    };
    mostrarResumen();
}
function prepararDonacion() {
    const monto = Number(montoDonacion.value);
    const clasificacion = tipoDonacion.value;
    if (!Number.isInteger(monto) || monto <= 0) {alert("Ingresa un monto válido para la donación.");return;}
    if (clasificacion !== "IDENTIFICADA" && clasificacion !== "ANONIMA") {alert("Debes seleccionar el tipo de donación."); return;}
    const autenticado = haySesionFinanzas();
    if (!autenticado && clasificacion === "IDENTIFICADA" && (nombreDonante.value.trim() === "" || correoDonante.value.trim() === "")) {
        alert("Completa los datos del donante.");
        return;
    }
    operacionActual = {
        tipoPago: "DONACION",
        monto: monto,
        descripcion: autenticado
            ? "Donación identificada"
            : clasificacion === "IDENTIFICADA"
                ? `Donación identificada de ${nombreDonante.value.trim()}`
                : "Donación anónima"
    };
    mostrarResumen();
}
function mostrarResumen() {
    if (!operacionActual) return;
    let contenido = "";
    if (operacionActual.tipoPago === "CUOTA") {
        contenido = `
            <p><strong>Operación:</strong> Pago de membresía</p>
            <p><strong>Periodo:</strong> ${escaparHTML(operacionActual.periodo)}</p>
            <p><strong>Monto:</strong> ${escaparHTML(formatearMoneda(operacionActual.monto))}</p>
        `;
    }
    if (operacionActual.tipoPago === "DONACION") {
        contenido = `
            <p><strong>Operación:</strong> Donación</p>
            <p><strong>Monto:</strong> ${escaparHTML(formatearMoneda(operacionActual.monto))}</p>
        `;
    }
    detalleResumen.innerHTML = contenido;
    resumenOperacion.hidden = false;
    resumenOperacion.scrollIntoView({ behavior: "smooth", block: "start" });
}
botonEditar.addEventListener("click", function () {
    resumenOperacion.hidden = true;
    operacionActual = null;
    formulario.scrollIntoView({ behavior: "smooth" });
});
botonContinuarPago.addEventListener("click", async function () {
    if (!operacionActual) return;
    await iniciarPago(operacionActual);
});
async function iniciarPago(datosOperacion) {
    botonContinuarPago.disabled = true;
    botonContinuarPago.textContent = "Procesando...";

    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/pagar`, {
            method: "POST",
            body: JSON.stringify(datosOperacion)
        });

        const texto = await respuesta.text();
        console.log("STATUS /finanzas/pagar:", respuesta.status);
        console.log("RESPUESTA /finanzas/pagar:", texto);

        let data = null;

        if (texto) {
            try {
                data = JSON.parse(texto);
            } catch (error) {
                console.error("La respuesta no es JSON válido:", texto);
            }
        }

        if (!respuesta.ok) {
            alert(data?.error || `El servidor respondió ${respuesta.status}.`);
            return;
        }

        if (data?.urlPago) {
            window.location.href = data.urlPago;
            return;
        }

        alert("No se recibió la URL de pago.");
    } catch (error) {
        console.error("Error al iniciar pago:", error);
        alert(error.message || "No fue posible conectar con el servicio de pagos.");
    } finally {
        botonContinuarPago.disabled = false;
        botonContinuarPago.textContent = "Continuar al pago";
    }
}
async function leerJSON(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return null;}
    try {return JSON.parse(texto);
    } catch (error) {console.error("Respuesta no válida:", texto); return null;}
}
async function cargarHistorial() {
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/cuotas/mias`);
        const cuotas = await leerJSON(respuesta);
        if (!respuesta.ok) {throw new Error(cuotas?.error || "No se pudo cargar el historial.");}
        listaOperaciones.innerHTML = "";
        if (!Array.isArray(cuotas) || cuotas.length === 0) {
            listaOperaciones.innerHTML = `
                <tr>
                    <td colspan="5">No tienes movimientos registrados.</td>
                </tr>
            `;
            return;
        }
        cuotas.forEach(function (cuota) {
            const fila = document.createElement("tr");
            fila.innerHTML = `
                <td>${escaparHTML(obtenerNombreMes(cuota.mes))} ${escaparHTML(cuota.anio)}</td>
                <td>Membresía</td>
                <td>Cuota ${escaparHTML(obtenerNombreMes(cuota.mes))} ${escaparHTML(cuota.anio)}</td>
                <td>${escaparHTML(formatearMoneda(cuota.monto))}</td>
                <td>${escaparHTML(cuota.estado)}</td>
            `;
            listaOperaciones.appendChild(fila);
        });
    } catch (error) {console.error("Error al cargar historial:", error);}
}
cargarCuotasPendientes();
cargarHistorial();