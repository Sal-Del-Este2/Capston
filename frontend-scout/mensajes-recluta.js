const CLAVE_RECLUTAS = "reclutasScout";
const CLAVE_MENSAJES = "mensajesScout";

const listaMensajes =
    document.getElementById(
        "lista-mensajes-recluta"
    );

const mensajeSinResultados =
    document.getElementById(
        "sin-mensajes-recluta"
    );

const botonNuevoMensaje =
    document.getElementById(
        "boton-nuevo-mensaje-recluta"
    );

const contenedorFormulario =
    document.getElementById(
        "contenedor-formulario-mensaje-recluta"
    );

const formularioMensaje =
    document.getElementById(
        "form-mensaje-recluta"
    );

const botonCerrarFormulario =
    document.getElementById(
        "cerrar-formulario-mensaje-recluta"
    );

const botonCancelarFormulario =
    document.getElementById(
        "cancelar-mensaje-recluta"
    );

const selectorDestinatario =
    document.getElementById(
        "destinatario-mensaje-recluta"
    );

const inputAsunto =
    document.getElementById(
        "asunto-mensaje-recluta"
    );

const inputContenido =
    document.getElementById(
        "contenido-mensaje-recluta"
    );

const contadorCaracteres =
    document.getElementById(
        "caracteres-mensaje-recluta"
    );

const seleccionarTodos =
    document.getElementById(
        "seleccionar-todos-mensajes-recluta"
    );

const contadorSeleccionados =
    document.getElementById(
        "contador-mensajes-seleccionados"
    );

const botonEliminarSeleccionados =
    document.getElementById(
        "eliminar-mensajes-recluta"
    );

const botonSalir =
    document.getElementById(
        "salir-mensajes-recluta"
    );

let reclutaActual = null;
let mensajes = cargarMensajes();

function cargarReclutas() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(
                CLAVE_RECLUTAS
            )
        );

        return Array.isArray(datos)
            ? datos
            : [];
    } catch (error) {
        return [];
    }
}

function cargarMensajes() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(
                CLAVE_MENSAJES
            )
        );

        return Array.isArray(datos)
            ? datos
            : [];
    } catch (error) {
        return [];
    }
}

function guardarMensajes() {
    localStorage.setItem(
        CLAVE_MENSAJES,
        JSON.stringify(mensajes)
    );
}

function obtenerReclutaActual() {
    const idRecluta =
        sessionStorage.getItem(
            "reclutaSeleccionadoId"
        );

    return cargarReclutas().find(
        function (recluta) {
            return String(recluta.id) ===
                String(idRecluta);
        }
    ) || null;
}

function sesionValida() {
    const autenticado =
        sessionStorage.getItem(
            "usuarioAutenticado"
        );

    const rol =
        sessionStorage.getItem(
            "rolUsuario"
        );

    const rolTemporal =
        sessionStorage.getItem(
            "rolTemporal"
        );

    return (
        autenticado === "true" &&
        (
            rol === "RECLUTA" ||
            (
                rol === "USUARIO" &&
                rolTemporal === "RECLUTA"
            )
        )
    );
}

function perteneceAlApoderado(recluta) {
    const rol =
        sessionStorage.getItem(
            "rolUsuario"
        );

    if (rol !== "USUARIO") {
        return true;
    }

    const usuarioId =
        sessionStorage.getItem(
            "usuarioId"
        );

    const correo =
        sessionStorage.getItem(
            "correoUsuario"
        );

    return (
        String(recluta.apoderadoId) ===
            String(usuarioId) ||
        recluta.apoderadoCorreo === correo
    );
}

function claveActorActual() {
    return `RECLUTA:${reclutaActual.id}`;
}

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = texto ?? "";

    return elemento.innerHTML;
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);

    if (Number.isNaN(fecha.getTime())) {
        return "Sin fecha";
    }

    return fecha.toLocaleString(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}

function cargarDestinatarios() {
    selectorDestinatario.innerHTML = `
        <option value="">
            Selecciona un destinatario
        </option>
    `;

    if (reclutaActual.apoderadoCorreo) {
        const opcionApoderado =
            document.createElement("option");

        opcionApoderado.value =
            `APODERADO:${reclutaActual.apoderadoCorreo}`;

        opcionApoderado.textContent =
            `Mi apoderado (${reclutaActual.apoderadoCorreo})`;

        selectorDestinatario.appendChild(
            opcionApoderado
        );
    }

    const reclutasAutorizados =
        cargarReclutas().filter(
            function (recluta) {
                return (
                    String(recluta.id) !==
                        String(reclutaActual.id) &&
                    recluta.estado === "Activo" &&
                    recluta.grupo ===
                        reclutaActual.grupo &&
                    recluta.rama ===
                        reclutaActual.rama
                );
            }
        );

    reclutasAutorizados.forEach(
        function (recluta) {
            const opcion =
                document.createElement("option");

            opcion.value =
                `RECLUTA:${recluta.id}`;

            opcion.textContent =
                `${recluta.nombre} (@${recluta.nickname})`;

            selectorDestinatario.appendChild(
                opcion
            );
        }
    );
}

function obtenerMensajesVisibles() {
    const claveActual =
        claveActorActual();

    return mensajes
        .filter(function (mensaje) {
            const participa =
                mensaje.remitenteClave ===
                    claveActual ||
                mensaje.destinatarioClave ===
                    claveActual;

            const eliminado =
                Array.isArray(
                    mensaje.eliminadoPor
                ) &&
                mensaje.eliminadoPor.includes(
                    claveActual
                );

            return participa && !eliminado;
        })
        .sort(function (a, b) {
            return (
                new Date(b.fecha) -
                new Date(a.fecha)
            );
        });
}

function obtenerTipoMensaje(mensaje) {
    return mensaje.remitenteClave ===
        claveActorActual()
        ? "Enviado"
        : "Recibido";
}

function mostrarMensajes() {
    const mensajesVisibles =
        obtenerMensajesVisibles();

    listaMensajes.innerHTML = "";

    if (mensajesVisibles.length === 0) {
        mensajeSinResultados.hidden = false;
        seleccionarTodos.checked = false;
        seleccionarTodos.disabled = true;
        actualizarSeleccionados();
        return;
    }

    mensajeSinResultados.hidden = true;
    seleccionarTodos.disabled = false;

    mensajesVisibles.forEach(
        function (mensaje) {
            const tipo =
                obtenerTipoMensaje(mensaje);

            const esRecibido =
                tipo === "Recibido";

            const claseLectura =
                esRecibido &&
                mensaje.estado === "No leído"
                    ? "mensaje-recluta-no-leido"
                    : "";

            const persona =
                esRecibido
                    ? mensaje.remitenteNombre
                    : mensaje.destinatarioNombre;

            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                `tarjeta-mensaje-recluta ${claseLectura}`;

            tarjeta.innerHTML = `
                <div class="selector-tarjeta-mensaje">
                    <input
                        type="checkbox"
                        class="seleccionar-mensaje-recluta"
                        data-id="${mensaje.id}"
                        aria-label="Seleccionar mensaje"
                    >
                </div>

                <div class="contenido-tarjeta-mensaje">
                    <div class="encabezado-tarjeta-mensaje-recluta">
                        <div>
                            <span class="tipo-mensaje-recluta">
                                ${tipo}
                            </span>

                            <h3>
                                ${escaparHTML(mensaje.asunto)}
                            </h3>

                            <p>
                                ${
                                    esRecibido
                                        ? "De"
                                        : "Para"
                                }:
                                ${escaparHTML(persona)}
                            </p>
                        </div>

                        <div class="estado-fecha-mensaje">
                            <span>
                                ${escaparHTML(mensaje.estado)}
                            </span>

                            <time>
                                ${formatearFecha(mensaje.fecha)}
                            </time>
                        </div>
                    </div>

                    <p class="vista-previa-mensaje-recluta">
                        ${escaparHTML(mensaje.contenido)}
                    </p>

                    <div class="acciones-mensaje-recluta">
                        <button
                            type="button"
                            class="boton-ver-mensaje-recluta"
                            data-id="${mensaje.id}"
                        >
                            Ver mensaje
                        </button>

                        ${
                            esRecibido
                                ? `
                                    <button
                                        type="button"
                                        class="boton-reportar-mensaje-recluta"
                                        data-id="${mensaje.id}"
                                        ${mensaje.reportado ? "disabled" : ""}
                                    >
                                        ${
                                            mensaje.reportado
                                                ? "Reportado"
                                                : "Reportar"
                                        }
                                    </button>
                                `
                                : ""
                        }

                        <button
                            type="button"
                            class="boton-eliminar-mensaje-recluta"
                            data-id="${mensaje.id}"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            `;

            listaMensajes.appendChild(
                tarjeta
            );
        }
    );

    activarEventosMensajes();
    actualizarSeleccionados();
}

function activarEventosMensajes() {
    document
        .querySelectorAll(
            ".seleccionar-mensaje-recluta"
        )
        .forEach(function (casilla) {
            casilla.addEventListener(
                "change",
                actualizarSeleccionados
            );
        });

    document
        .querySelectorAll(
            ".boton-ver-mensaje-recluta"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    verMensaje(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".boton-reportar-mensaje-recluta"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    reportarMensaje(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".boton-eliminar-mensaje-recluta"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    eliminarMensaje(
                        Number(boton.dataset.id)
                    );
                }
            );
        });
}

function actualizarSeleccionados() {
    const casillas =
        document.querySelectorAll(
            ".seleccionar-mensaje-recluta"
        );

    const seleccionadas =
        document.querySelectorAll(
            ".seleccionar-mensaje-recluta:checked"
        );

    const cantidad =
        seleccionadas.length;

    contadorSeleccionados.textContent =
        cantidad === 1
            ? "1 mensaje seleccionado"
            : `${cantidad} mensajes seleccionados`;

    botonEliminarSeleccionados.disabled =
        cantidad === 0;

    seleccionarTodos.checked =
        casillas.length > 0 &&
        cantidad === casillas.length;

    seleccionarTodos.indeterminate =
        cantidad > 0 &&
        cantidad < casillas.length;
}

function abrirFormulario() {
    formularioMensaje.reset();
    contadorCaracteres.textContent = "0";
    cargarDestinatarios();

    contenedorFormulario.hidden = false;
    selectorDestinatario.focus();
}

function cerrarFormulario() {
    formularioMensaje.reset();
    contadorCaracteres.textContent = "0";
    contenedorFormulario.hidden = true;
}

function procesarDestinatario(valor) {
    const separador =
        valor.indexOf(":");

    if (separador === -1) {
        return null;
    }

    const tipo =
        valor.substring(0, separador);

    const identificador =
        valor.substring(separador + 1);

    if (tipo === "APODERADO") {
        if (
            identificador !==
            reclutaActual.apoderadoCorreo
        ) {
            return null;
        }

        return {
            clave: `APODERADO:${identificador}`,
            nombre: "Mi apoderado"
        };
    }

    if (tipo === "RECLUTA") {
        const destinatario =
            cargarReclutas().find(
                function (recluta) {
                    return (
                        String(recluta.id) ===
                            identificador &&
                        recluta.estado === "Activo" &&
                        recluta.grupo ===
                            reclutaActual.grupo &&
                        recluta.rama ===
                            reclutaActual.rama
                    );
                }
            );

        if (!destinatario) {
            return null;
        }

        return {
            clave:
                `RECLUTA:${destinatario.id}`,
            nombre:
                `${destinatario.nombre} (@${destinatario.nickname})`
        };
    }

    return null;
}

function enviarMensaje(evento) {
    evento.preventDefault();

    const destinatario =
        procesarDestinatario(
            selectorDestinatario.value
        );

    const asunto =
        inputAsunto.value.trim();

    const contenido =
        inputContenido.value.trim();

    if (!destinatario) {
        alert(
            "Selecciona un destinatario autorizado."
        );
        return;
    }

    if (asunto === "" || contenido === "") {
        alert(
            "Debes completar el asunto y el mensaje."
        );
        return;
    }

    mensajes.push({
        id: Date.now(),
        remitenteClave:
            claveActorActual(),
        remitenteNombre:
            `${reclutaActual.nombre} (@${reclutaActual.nickname})`,
        destinatarioClave:
            destinatario.clave,
        destinatarioNombre:
            destinatario.nombre,
        asunto: asunto,
        contenido: contenido,
        fecha: new Date().toISOString(),
        estado: "No leído",
        eliminadoPor: [],
        reportado: false,
        estadoModeracion: null
    });

    guardarMensajes();
    cerrarFormulario();
    mostrarMensajes();

    alert(
        "Tu mensaje fue enviado correctamente."
    );
}

function verMensaje(idMensaje) {
    const mensaje = mensajes.find(
        function (elemento) {
            return elemento.id === idMensaje;
        }
    );

    if (!mensaje) {
        return;
    }

    if (
        mensaje.destinatarioClave ===
        claveActorActual()
    ) {
        mensaje.estado = "Leído";
        guardarMensajes();
    }

    const tipo =
        obtenerTipoMensaje(mensaje);

    const persona =
        tipo === "Recibido"
            ? mensaje.remitenteNombre
            : mensaje.destinatarioNombre;

    alert(
        `${tipo}: ${persona}\n` +
        `Asunto: ${mensaje.asunto}\n` +
        `Fecha: ${formatearFecha(mensaje.fecha)}\n\n` +
        mensaje.contenido
    );

    mostrarMensajes();
}

function eliminarMensaje(idMensaje) {
    const mensaje = mensajes.find(
        function (elemento) {
            return elemento.id === idMensaje;
        }
    );

    if (!mensaje) {
        return;
    }

    const confirmar = confirm(
        `¿Deseas eliminar el mensaje "${mensaje.asunto}"?`
    );

    if (!confirmar) {
        return;
    }

    marcarMensajeEliminado(mensaje);
    guardarMensajes();
    mostrarMensajes();
}

function marcarMensajeEliminado(mensaje) {
    if (!Array.isArray(mensaje.eliminadoPor)) {
        mensaje.eliminadoPor = [];
    }

    const claveActual =
        claveActorActual();

    if (
        !mensaje.eliminadoPor.includes(
            claveActual
        )
    ) {
        mensaje.eliminadoPor.push(
            claveActual
        );
    }
}

function reportarMensaje(idMensaje) {
    const mensaje = mensajes.find(
        function (elemento) {
            return elemento.id === idMensaje;
        }
    );

    if (
        !mensaje ||
        mensaje.destinatarioClave !==
            claveActorActual()
    ) {
        return;
    }

    const motivo = prompt(
        "Describe brevemente por qué deseas reportar este mensaje:"
    );

    if (
        motivo === null ||
        motivo.trim() === ""
    ) {
        return;
    }

    mensaje.reportado = true;
    mensaje.motivoReporte =
        motivo.trim();

    mensaje.fechaReporte =
        new Date().toISOString();

    mensaje.estadoModeracion =
        "PENDIENTE";

    guardarMensajes();
    mostrarMensajes();

    alert(
        "El mensaje fue reportado a la administración."
    );
}

function regresarAccesoAnterior() {
    const rol =
        sessionStorage.getItem(
            "rolUsuario"
        );

    if (rol === "USUARIO") {
        sessionStorage.removeItem(
            "rolTemporal"
        );

        sessionStorage.removeItem(
            "reclutaSeleccionadoId"
        );

        window.location.replace(
            "mis-reclutas.html"
        );
        return;
    }

    cerrarSesion();
}

function cerrarSesion() {
    sessionStorage.clear();
    window.location.replace("login.html");
}

function iniciarMensajes() {
    if (!sesionValida()) {
        window.location.replace(
            "login.html"
        );
        return;
    }

    reclutaActual =
        obtenerReclutaActual();

    if (
        !reclutaActual ||
        reclutaActual.estado !== "Activo" ||
        !perteneceAlApoderado(
            reclutaActual
        )
    ) {
        alert(
            "No tienes autorización para acceder a esta sección."
        );

        regresarAccesoAnterior();
        return;
    }

    cargarDestinatarios();
    mostrarMensajes();
}

botonNuevoMensaje.addEventListener(
    "click",
    abrirFormulario
);

botonCerrarFormulario.addEventListener(
    "click",
    cerrarFormulario
);

botonCancelarFormulario.addEventListener(
    "click",
    cerrarFormulario
);

formularioMensaje.addEventListener(
    "submit",
    enviarMensaje
);

inputContenido.addEventListener(
    "input",
    function () {
        contadorCaracteres.textContent =
            inputContenido.value.length;
    }
);

seleccionarTodos.addEventListener(
    "change",
    function () {
        document
            .querySelectorAll(
                ".seleccionar-mensaje-recluta"
            )
            .forEach(function (casilla) {
                casilla.checked =
                    seleccionarTodos.checked;
            });

        actualizarSeleccionados();
    }
);

botonEliminarSeleccionados.addEventListener(
    "click",
    function () {
        const seleccionadas =
            document.querySelectorAll(
                ".seleccionar-mensaje-recluta:checked"
            );

        if (seleccionadas.length === 0) {
            return;
        }

        const confirmar = confirm(
            `¿Deseas eliminar ${seleccionadas.length} mensajes?`
        );

        if (!confirmar) {
            return;
        }

        const ids = Array.from(
            seleccionadas
        ).map(function (casilla) {
            return Number(
                casilla.dataset.id
            );
        });

        mensajes.forEach(
            function (mensaje) {
                if (ids.includes(mensaje.id)) {
                    marcarMensajeEliminado(
                        mensaje
                    );
                }
            }
        );

        guardarMensajes();
        mostrarMensajes();
    }
);

botonSalir.addEventListener(
    "click",
    function (evento) {
        evento.preventDefault();

        if (
            sessionStorage.getItem(
                "rolUsuario"
            ) === "USUARIO"
        ) {
            regresarAccesoAnterior();
            return;
        }

        if (
            confirm(
                "¿Deseas cerrar tu sesión?"
            )
        ) {
            cerrarSesion();
        }
    }
);

iniciarMensajes();