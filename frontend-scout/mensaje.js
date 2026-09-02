const correoUsuarioActual =
    sessionStorage.getItem("correoUsuario");

const usuariosRegistrados =
    JSON.parse(
        localStorage.getItem("usuariosRegistrados")
    ) || [];

const usuarioActual = usuariosRegistrados.find(
    function (usuario) {
        return usuario.correo === correoUsuarioActual;
    }
);

const nicknameUsuarioActual =
    usuarioActual
        ? usuarioActual.nickname
        : "usuario_actual";


let mensajes = [
    {
        id: 1,
        remitente: "administracion",
        destinatarios: [nicknameUsuarioActual],
        asunto: "Confirmación de inscripción",
        contenido:
            "Tu inscripción al campamento fue registrada correctamente.",
        fecha: "28-08-2026",
        estado: "No leído"
    },
    {
        id: 2,
        remitente: "administracion",
        destinatarios: [nicknameUsuarioActual],
        asunto: "Estado de cuota",
        contenido:
            "El pago de tu cuota de marzo fue recibido correctamente.",
        fecha: "20-08-2026",
        estado: "Leído"
    },
    {
        id: 3,
        remitente: "grupo_penalolen",
        destinatarios: [nicknameUsuarioActual],
        asunto: "Información de la tienda",
        contenido:
            "Tu pedido se encuentra actualmente en preparación.",
        fecha: "15-08-2026",
        estado: "Leído"
    }
];


const listaMensajes =
    document.getElementById("lista-mensajes");

const seleccionarTodos =
    document.getElementById("seleccionar-todos");

const contadorSeleccionados =
    document.getElementById("contador-seleccionados");

const botonEliminarSeleccionados =
    document.getElementById("eliminar-seleccionados");

const mensajeBandejaVacia =
    document.getElementById("mensaje-bandeja-vacia");

const botonNuevoMensaje =
    document.getElementById("boton-nuevo-mensaje");

const contenedorNuevoMensaje =
    document.getElementById("contenedor-nuevo-mensaje");

const cerrarFormularioMensaje =
    document.getElementById("cerrar-formulario-mensaje");

const formularioMensaje =
    document.getElementById("form-mensaje");


function escaparHTML(texto) {
    const elemento = document.createElement("div");

    elemento.textContent = texto;

    return elemento.innerHTML;
}


function formatearDestinatarios(destinatarios) {
    return destinatarios
        .map(function (destinatario) {
            if (destinatario === "administracion") {
                return "Administración";
            }

            return `@${destinatario}`;
        })
        .join(", ");
}


function obtenerClaseEstado(estado) {
    return estado === "No leído"
        ? "mensaje-no-leido"
        : "mensaje-leido";
}


function mostrarMensajes() {
    if (!listaMensajes) {
        return;
    }

    listaMensajes.innerHTML = "";

    if (mensajes.length === 0) {
        mensajeBandejaVacia.hidden = false;
        seleccionarTodos.checked = false;
        seleccionarTodos.disabled = true;

        actualizarSeleccionados();

        return;
    }

    mensajeBandejaVacia.hidden = true;
    seleccionarTodos.disabled = false;

    mensajes.forEach(function (mensaje) {
        const tarjeta =
            document.createElement("article");

        tarjeta.classList.add("tarjeta-mensaje");

        tarjeta.innerHTML = `
            <div class="selector-mensaje">
                <input
                    type="checkbox"
                    class="seleccionar-mensaje"
                    data-id="${mensaje.id}"
                    aria-label="Seleccionar mensaje"
                >
            </div>

            <div class="contenido-mensaje">

                <div class="encabezado-tarjeta-mensaje">

                    <div>
                        <h3>
                            ${escaparHTML(mensaje.asunto)}
                        </h3>

                        <p class="fecha-mensaje">
                            ${escaparHTML(mensaje.fecha)}
                        </p>

                        <p class="participantes-mensaje">
                            <strong>De:</strong>
                            @${escaparHTML(mensaje.remitente)}
                        </p>

                        <p class="participantes-mensaje">
                            <strong>Para:</strong>
                            ${escaparHTML(
                                formatearDestinatarios(
                                    mensaje.destinatarios
                                )
                            )}
                        </p>
                    </div>

                    <span
                        class="estado-mensaje
                        ${obtenerClaseEstado(mensaje.estado)}"
                    >
                        ${mensaje.estado}
                    </span>

                </div>

                <p class="texto-mensaje">
                    ${escaparHTML(mensaje.contenido)}
                </p>

                <div class="acciones-tarjeta-mensaje">

                    <button
                        type="button"
                        class="boton-leer-mensaje"
                        data-id="${mensaje.id}"
                    >
                        Ver mensaje
                    </button>

                    <button
                        type="button"
                        class="boton-eliminar-mensaje"
                        data-id="${mensaje.id}"
                    >
                        Eliminar
                    </button>

                </div>

            </div>
        `;

        listaMensajes.appendChild(tarjeta);
    });

    activarEventosMensajes();
    actualizarSeleccionados();
}


function activarEventosMensajes() {
    const casillas =
        document.querySelectorAll(
            ".seleccionar-mensaje"
        );

    const botonesLeer =
        document.querySelectorAll(
            ".boton-leer-mensaje"
        );

    const botonesEliminar =
        document.querySelectorAll(
            ".boton-eliminar-mensaje"
        );

    casillas.forEach(function (casilla) {
        casilla.addEventListener(
            "change",
            actualizarSeleccionados
        );
    });

    botonesLeer.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                verMensaje(
                    Number(boton.dataset.id)
                );
            }
        );
    });

    botonesEliminar.forEach(function (boton) {
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
            ".seleccionar-mensaje"
        );

    const seleccionadas =
        document.querySelectorAll(
            ".seleccionar-mensaje:checked"
        );

    const cantidad = seleccionadas.length;

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


function verMensaje(idMensaje) {
    const mensaje = mensajes.find(
        function (elemento) {
            return elemento.id === idMensaje;
        }
    );

    if (!mensaje) {
        return;
    }

    mensaje.estado = "Leído";

    alert(
        `De: @${mensaje.remitente}\n` +
        `Para: ${formatearDestinatarios(
            mensaje.destinatarios
        )}\n` +
        `Asunto: ${mensaje.asunto}\n` +
        `Fecha: ${mensaje.fecha}\n\n` +
        `${mensaje.contenido}`
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

    const confirmarEliminacion = confirm(
        `¿Deseas eliminar el mensaje ` +
        `"${mensaje.asunto}"?`
    );

    if (!confirmarEliminacion) {
        return;
    }

    mensajes = mensajes.filter(
        function (elemento) {
            return elemento.id !== idMensaje;
        }
    );

    mostrarMensajes();
}


seleccionarTodos.addEventListener(
    "change",
    function () {
        const casillas =
            document.querySelectorAll(
                ".seleccionar-mensaje"
            );

        casillas.forEach(function (casilla) {
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
                ".seleccionar-mensaje:checked"
            );

        const idsSeleccionados =
            Array.from(seleccionadas).map(
                function (casilla) {
                    return Number(
                        casilla.dataset.id
                    );
                }
            );

        if (idsSeleccionados.length === 0) {
            return;
        }

        const confirmarEliminacion = confirm(
            `¿Deseas eliminar ` +
            `${idsSeleccionados.length} ` +
            `mensajes seleccionados?`
        );

        if (!confirmarEliminacion) {
            return;
        }

        mensajes = mensajes.filter(
            function (mensaje) {
                return !idsSeleccionados.includes(
                    mensaje.id
                );
            }
        );

        mostrarMensajes();
    }
);


botonNuevoMensaje.addEventListener(
    "click",
    function () {
        contenedorNuevoMensaje.hidden = false;

        document
            .getElementById(
                "destinatarios-mensaje"
            )
            .focus();
    }
);


cerrarFormularioMensaje.addEventListener(
    "click",
    function () {
        contenedorNuevoMensaje.hidden = true;
        formularioMensaje.reset();
    }
);


formularioMensaje.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        const selectorDestinatarios =
            document.getElementById(
                "destinatarios-mensaje"
            );

        const destinatarios = Array.from(
            selectorDestinatarios.selectedOptions
        ).map(function (opcion) {
            return opcion.value;
        });

        const asunto = document
            .getElementById("asunto-mensaje")
            .value;

        const contenido = document
            .getElementById("texto-mensaje")
            .value
            .trim();

        if (
            destinatarios.length === 0 ||
            asunto === "" ||
            contenido === ""
        ) {
            alert(
                "Debes seleccionar al menos un destinatario, " +
                "completar el asunto y escribir el mensaje."
            );

            return;
        }

        if (
            destinatarios.includes(
                nicknameUsuarioActual
            )
        ) {
            alert(
                "No puedes enviarte un mensaje a ti mismo."
            );

            return;
        }

        const fechaActual =
            new Date().toLocaleDateString(
                "es-CL"
            );

        mensajes.unshift({
            id: Date.now(),
            remitente: nicknameUsuarioActual,
            destinatarios: destinatarios,
            asunto: asunto,
            contenido: contenido,
            fecha: fechaActual,
            estado: "Leído"
        });

        formularioMensaje.reset();
        contenedorNuevoMensaje.hidden = true;

        mostrarMensajes();

        alert(
            "Tu mensaje fue enviado correctamente."
        );
    }
);


mostrarMensajes();