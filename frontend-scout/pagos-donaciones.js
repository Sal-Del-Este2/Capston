const MODO_DEMO = true;

const API_PAGOS =
    "http://localhost:8080/api/pagos/crear";

const cuotasPendientes = [
    {
        id: 4,
        periodo: "Abril 2026",
        monto: 15000
    },
    {
        id: 5,
        periodo: "Mayo 2026",
        monto: 15000
    },
    {
        id: 6,
        periodo: "Junio 2026",
        monto: 15000
    }
];

let historialOperaciones = [
    {
        fecha: "10-03-2026",
        tipo: "Membresía",
        detalle: "Cuota marzo 2026",
        monto: 15000,
        estado: "Pagado"
    },
    {
        fecha: "05-06-2026",
        tipo: "Donación",
        detalle: "Donación identificada",
        monto: 25000,
        estado: "Pagado"
    }
];

let operacionActual = null;

const formulario =
    document.getElementById("form-pago-donacion");

const tipoOperacion =
    document.getElementById("tipo-operacion");

const camposMembresia =
    document.getElementById("campos-membresia");

const camposDonacion =
    document.getElementById("campos-donacion");

const selectorCuota =
    document.getElementById("cuota-membresia");

const montoCuota =
    document.getElementById("monto-cuota");

const montoDonacion =
    document.getElementById("monto-donacion");

const tipoDonacion =
    document.getElementById("tipo-donacion");

const datosDonante =
    document.getElementById("datos-donante");

const nombreDonante =
    document.getElementById("nombre-donante");

const correoDonante =
    document.getElementById("correo-donante");

const botonRevisar =
    document.getElementById("boton-revisar-operacion");

const resumenOperacion =
    document.getElementById("resumen-operacion");

const detalleResumen =
    document.getElementById("detalle-resumen-operacion");

const botonEditar =
    document.getElementById("editar-operacion");

const botonContinuarPago =
    document.getElementById("continuar-pago");

const listaOperaciones =
    document.getElementById("lista-operaciones");


function formatearMoneda(valor) {
    return valor.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}


function escaparHTML(texto) {
    const elemento = document.createElement("div");

    elemento.textContent = String(texto);

    return elemento.innerHTML;
}


function cargarDatosUsuario() {
    const perfil =
        JSON.parse(
            localStorage.getItem("perfilUsuario")
        );

    const correoSesion =
        sessionStorage.getItem("correoUsuario");

    if (perfil) {
        nombreDonante.value =
            perfil.nombre || "";

        correoDonante.value =
            perfil.correo || correoSesion || "";
    } else {
        correoDonante.value =
            correoSesion || "";
    }
}


function cargarCuotasPendientes() {
    selectorCuota.innerHTML = `
        <option value="">
            Selecciona una cuota
        </option>
    `;

    cuotasPendientes.forEach(function (cuota) {
        const opcion =
            document.createElement("option");

        opcion.value = cuota.id;

        opcion.textContent =
            `${cuota.periodo} — ` +
            `${formatearMoneda(cuota.monto)}`;

        selectorCuota.appendChild(opcion);
    });
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


tipoOperacion.addEventListener(
    "change",
    function () {
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
    }
);


selectorCuota.addEventListener(
    "change",
    function () {
        const idCuota =
            Number(selectorCuota.value);

        const cuota = cuotasPendientes.find(
            function (elemento) {
                return elemento.id === idCuota;
            }
        );

        montoCuota.textContent =
            cuota
                ? formatearMoneda(cuota.monto)
                : "$0";
    }
);


tipoDonacion.addEventListener(
    "change",
    function () {
        const esIdentificada =
            tipoDonacion.value === "IDENTIFICADA";

        datosDonante.hidden = !esIdentificada;

        nombreDonante.required = esIdentificada;
        correoDonante.required = esIdentificada;

        if (esIdentificada) {
            cargarDatosUsuario();
        } else {
            nombreDonante.value = "";
            correoDonante.value = "";
        }
    }
);


formulario.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        if (tipoOperacion.value === "MEMBRESIA") {
            prepararMembresia();
        }

        if (tipoOperacion.value === "DONACION") {
            prepararDonacion();
        }
    }
);


function prepararMembresia() {
    const idCuota =
        Number(selectorCuota.value);

    const cuota = cuotasPendientes.find(
        function (elemento) {
            return elemento.id === idCuota;
        }
    );

    if (!cuota) {
        alert("Debes seleccionar una cuota pendiente.");
        return;
    }

    operacionActual = {
        tipoOperacion: "MEMBRESIA",
        cuotaId: cuota.id,
        periodo: cuota.periodo,
        monto: cuota.monto
    };

    mostrarResumen();
}


function prepararDonacion() {
    const monto =
        Number(montoDonacion.value);

    const clasificacion =
        tipoDonacion.value;

    if (!Number.isInteger(monto) || monto <= 0) {
        alert(
            "Ingresa un monto válido para la donación."
        );

        return;
    }

    if (
        clasificacion !== "IDENTIFICADA" &&
        clasificacion !== "ANONIMA"
    ) {
        alert(
            "Debes seleccionar el tipo de donación."
        );

        return;
    }

    if (
        clasificacion === "IDENTIFICADA" &&
        (
            nombreDonante.value.trim() === "" ||
            correoDonante.value.trim() === ""
        )
    ) {
        alert(
            "Completa los datos del donante."
        );

        return;
    }

    operacionActual = {
        tipoOperacion: "DONACION",
        monto: monto,
        tipoDonacion: clasificacion,
        nombre:
            clasificacion === "IDENTIFICADA"
                ? nombreDonante.value.trim()
                : null,
        correo:
            clasificacion === "IDENTIFICADA"
                ? correoDonante.value.trim()
                : null
    };

    mostrarResumen();
}


function mostrarResumen() {
    if (!operacionActual) {
        return;
    }

    let contenido = "";

    if (
        operacionActual.tipoOperacion ===
        "MEMBRESIA"
    ) {
        contenido = `
            <p>
                <strong>Operación:</strong>
                Pago de membresía
            </p>

            <p>
                <strong>Periodo:</strong>
                ${escaparHTML(operacionActual.periodo)}
            </p>

            <p>
                <strong>Monto:</strong>
                ${formatearMoneda(operacionActual.monto)}
            </p>
        `;
    }

    if (
        operacionActual.tipoOperacion ===
        "DONACION"
    ) {
        const tipoVisible =
            operacionActual.tipoDonacion ===
            "ANONIMA"
                ? "Anónima"
                : "Identificada";

        contenido = `
            <p>
                <strong>Operación:</strong>
                Donación
            </p>

            <p>
                <strong>Tipo:</strong>
                ${tipoVisible}
            </p>

            <p>
                <strong>Monto:</strong>
                ${formatearMoneda(operacionActual.monto)}
            </p>
        `;

        if (
            operacionActual.tipoDonacion ===
            "IDENTIFICADA"
        ) {
            contenido += `
                <p>
                    <strong>Nombre:</strong>
                    ${escaparHTML(operacionActual.nombre)}
                </p>

                <p>
                    <strong>Correo:</strong>
                    ${escaparHTML(operacionActual.correo)}
                </p>
            `;
        }
    }

    detalleResumen.innerHTML = contenido;
    resumenOperacion.hidden = false;

    resumenOperacion.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


botonEditar.addEventListener(
    "click",
    function () {
        resumenOperacion.hidden = true;
        operacionActual = null;

        formulario.scrollIntoView({
            behavior: "smooth"
        });
    }
);


botonContinuarPago.addEventListener(
    "click",
    function () {
        if (!operacionActual) {
            return;
        }

        iniciarPago(operacionActual);
    }
);


async function iniciarPago(datosOperacion) {
    botonContinuarPago.disabled = true;
    botonContinuarPago.textContent =
        "Procesando...";

    if (MODO_DEMO) {
        setTimeout(function () {
            registrarOperacionSimulada(
                datosOperacion
            );

            botonContinuarPago.disabled = false;
            botonContinuarPago.textContent =
                "Continuar al pago";
        }, 700);

        return;
    }

    try {
        const respuesta = await fetch(API_PAGOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datosOperacion)
        });

        if (!respuesta.ok) {
            throw new Error(
                "No fue posible crear el pago."
            );
        }

        const resultado =
            await respuesta.json();

        /*
         * El microservicio deberá responder:
         *
         * {
         *     "urlPago": "https://pasarela.cl/pago/..."
         * }
         */

        window.location.href =
            resultado.urlPago;

    } catch (error) {
        alert(error.message);

        botonContinuarPago.disabled = false;
        botonContinuarPago.textContent =
            "Continuar al pago";
    }
}


function registrarOperacionSimulada(datos) {
    const esMembresia =
        datos.tipoOperacion === "MEMBRESIA";

    historialOperaciones.unshift({
        fecha:
            new Date().toLocaleDateString("es-CL"),

        tipo:
            esMembresia
                ? "Membresía"
                : "Donación",

        detalle:
            esMembresia
                ? `Cuota ${datos.periodo}`
                : `Donación ${
                    datos.tipoDonacion === "ANONIMA"
                        ? "anónima"
                        : "identificada"
                }`,

        monto: datos.monto,
        estado: "Pago simulado"
    });

    mostrarHistorial();

    alert(
        "La operación fue preparada correctamente.\n\n" +
        "Actualmente funciona en modo de demostración. " +
        "Después se conectará con la pasarela de pago."
    );

    formulario.reset();

    camposMembresia.hidden = true;
    camposDonacion.hidden = true;
    datosDonante.hidden = true;
    botonRevisar.hidden = true;
    resumenOperacion.hidden = true;

    montoCuota.textContent = "$0";
    operacionActual = null;
}


function mostrarHistorial() {
    listaOperaciones.innerHTML = "";

    historialOperaciones.forEach(
        function (operacion) {
            const fila =
                document.createElement("tr");

            fila.innerHTML = `
                <td>
                    ${escaparHTML(operacion.fecha)}
                </td>

                <td>
                    ${escaparHTML(operacion.tipo)}
                </td>

                <td>
                    ${escaparHTML(operacion.detalle)}
                </td>

                <td>
                    ${formatearMoneda(operacion.monto)}
                </td>

                <td>
                    <span class="estado-pago">
                        ${escaparHTML(operacion.estado)}
                    </span>
                </td>
            `;

            listaOperaciones.appendChild(fila);
        }
    );
}


cargarCuotasPendientes();
cargarDatosUsuario();
mostrarHistorial();