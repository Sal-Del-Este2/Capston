let mensajes = [];
let bandejaActual = "recibido";

const listaMensajes =
    document.getElementById("lista-mensajes-admin");

const totalMensajes =
    document.getElementById("total-mensajes-admin");

const mensajesNoLeidos =
    document.getElementById("mensajes-no-leidos-admin");

const mensajesRecibidos =
    document.getElementById("mensajes-recibidos-admin");

const mensajesEnviados =
    document.getElementById("mensajes-enviados-admin");

const pestanaRecibidos =
    document.getElementById("pestana-recibidos");

const pestanaEnviados =
    document.getElementById("pestana-enviados");

const tituloListado =
    document.getElementById("titulo-listado-mensajes");

const buscarMensaje =
    document.getElementById("buscar-mensaje-admin");

const filtroEstado =
    document.getElementById(
        "filtro-estado-mensaje-admin"
    );

const seleccionarTodos =
    document.getElementById(
        "seleccionar-todos-admin"
    );

const contadorSeleccionados =
    document.getElementById(
        "contador-seleccionados-admin"
    );

const botonEliminarSeleccionados =
    document.getElementById(
        "eliminar-seleccionados-admin"
    );

const sinResultados =
    document.getElementById(
        "sin-resultados-mensajes-admin"
    );

const botonNuevoMensaje =
    document.getElementById(
        "boton-nuevo-mensaje-admin"
    );

const contenedorFormulario =
    document.getElementById(
        "contenedor-formulario-mensaje-admin"
    );

const formularioMensaje =
    document.getElementById("form-mensaje-admin");

const selectorDestinatarios =
    document.getElementById("destinatarios-admin");

const cerrarFormulario =
    document.getElementById(
        "cerrar-formulario-mensaje-admin"
    );

const cancelarFormulario =
    document.getElementById(
        "cancelar-formulario-mensaje-admin"
    );


function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = String(texto);

    return elemento.innerHTML;
}


function cargarMensajes() {
    const mensajesGuardados =
        JSON.parse(
            localStorage.getItem("mensajesAdmin")
        ) || [];

    if (mensajesGuardados.length > 0) {
        mensajes = mensajesGuardados;
        return;
    }

    mensajes = [
        {
            id: 1,
            tipo: "recibido",
            remitente: "ana_scout",
            destinatarios: ["administracion"],
            asunto: "Consulta por campamento",
            contenido:
                "Hola, quisiera saber si todavía quedan cupos para el campamento de primavera.",
            fecha: "30-08-2026",
            estado: "No leído"
        },
        {
            id: 2,
            tipo: "recibido",
            remitente: "cristobal_ventura",
            destinatarios: ["administracion"],
            asunto: "Problema con pago de cuota",
            contenido:
                "Realicé el pago de mi cuota, pero todavía aparece pendiente.",
            fecha: "29-08-2026",
            estado: "Leído"
        },
        {
            id: 3,
            tipo: "enviado",
            remitente: "administracion",
            destinatarios: [
                "ana_scout",
                "cristobal_ventura"
            ],
            asunto: "Recordatorio de actividad",
            contenido:
                "Les recordamos que la actividad comienza a las 08:30 horas.",
            fecha: "28-08-2026",
            estado: "Enviado"
        }
    ];

    guardarMensajes();
}


function guardarMensajes() {
    localStorage.setItem(
        "mensajesAdmin",
        JSON.stringify(mensajes)
    );
}


function cargarDestinatarios() {
    const usuarios =
        JSON.parse(
            localStorage.getItem("usuariosAdmin")
        ) || [];

    const usuariosActivos = usuarios.filter(
        function (usuario) {
            return (
                usuario.estado === "activo" &&
                usuario.rol === "usuario"
            );
        }
    );

    selectorDestinatarios.innerHTML = "";

    usuariosActivos.forEach(function (usuario) {
        const opcion =
            document.createElement("option");

        opcion.value = usuario.nickname;

        opcion.textContent =
            `${usuario.nombre} (@${usuario.nickname})`;

        selectorDestinatarios.appendChild(opcion);
    });

    if (usuariosActivos.length === 0) {
        const usuariosSimulados = [
            "ana_scout",
            "cristobal_ventura",
            "felipe_scout"
        ];

        usuariosSimulados.forEach(
            function (nickname) {
                const opcion =
                    document.createElement("option");

                opcion.value = nickname;
                opcion.textContent = `@${nickname}`;

                selectorDestinatarios.appendChild(
                    opcion
                );
            }
        );
    }
}


function actualizarIndicadores() {
    const recibidos = mensajes.filter(
        function (mensaje) {
            return mensaje.tipo === "recibido";
        }
    );

    const enviados = mensajes.filter(
        function (mensaje) {
            return mensaje.tipo === "enviado";
        }
    );

    const noLeidos = recibidos.filter(
        function (mensaje) {
            return mensaje.estado === "No leído";
        }
    );

    totalMensajes.textContent =
        mensajes.length;

    mensajesNoLeidos.textContent =
        noLeidos.length;

    mensajesRecibidos.textContent =
        recibidos.length;

    mensajesEnviados.textContent =
        enviados.length;
}


function obtenerMensajesFiltrados() {
    const texto =
        buscarMensaje.value
            .trim()
            .toLowerCase();

    return mensajes.filter(
        function (mensaje) {
            if (mensaje.tipo !== bandejaActual) {
                return false;
            }

            const participantes = [
                mensaje.remitente,
                ...mensaje.destinatarios
            ]
                .join(" ")
                .toLowerCase();

            const coincideTexto =
                mensaje.asunto
                    .toLowerCase()
                    .includes(texto) ||
                mensaje.contenido
                    .toLowerCase()
                    .includes(texto) ||
                participantes.includes(texto);

            const coincideEstado =
                bandejaActual === "enviado" ||
                filtroEstado.value === "TODOS" ||
                mensaje.estado === filtroEstado.value;

            return coincideTexto && coincideEstado;
        }
    );
}


function formatearDestinatarios(destinatarios) {
    return destinatarios
        .map(function (destinatario) {
            return `@${destinatario}`;
        })
        .join(", ");
}


function mostrarMensajes() {
    const mensajesFiltrados =
        obtenerMensajesFiltrados();

    listaMensajes.innerHTML = "";

    sinResultados.hidden =
        mensajesFiltrados.length !== 0;

    seleccionarTodos.checked = false;
    seleccionarTodos.indeterminate = false;

    mensajesFiltrados.forEach(
        function (mensaje) {
            const tarjeta =
                document.createElement("article");

            tarjeta.classList.add(
                "tarjeta-mensaje-admin"
            );

            const participante =
                mensaje.tipo === "recibido"
                    ? `
                        <strong>De:</strong>
                        @${escaparHTML(mensaje.remitente)}
                    `
                    : `
                        <strong>Para:</strong>
                        ${escaparHTML(
                            formatearDestinatarios(
                                mensaje.destinatarios
                            )
                        )}
                    `;

            const botonResponder =
                mensaje.tipo === "recibido"
                    ? `
                        <button
                            type="button"
                            class="boton-responder-admin"
                            data-id="${mensaje.id}"
                        >
                            Responder
                        </button>
                    `
                    : "";

            const claseEstado =
                mensaje.estado === "No leído"
                    ? "mensaje-no-leido"
                    : "mensaje-leido";

            tarjeta.innerHTML = `
                <div class="selector-mensaje-admin">
                    <input
                        type="checkbox"
                        class="seleccionar-mensaje-admin"
                        data-id="${mensaje.id}"
                        aria-label="Seleccionar mensaje"
                    >
                </div>

                <div class="contenido-mensaje-admin">

                    <div class="encabezado-mensaje-admin">

                        <div>
                            <h3>
                                ${escaparHTML(mensaje.asunto)}
                            </h3>

                            <p>${participante}</p>

                            <small>
                                ${escaparHTML(mensaje.fecha)}
                            </small>
                        </div>

                        <span
                            class="estado-mensaje ${claseEstado}"
                        >
                            ${escaparHTML(mensaje.estado)}
                        </span>

                    </div>

                    <p class="texto-mensaje-admin">
                        ${escaparHTML(mensaje.contenido)}
                    </p>

                    <div class="acciones-tabla-admin">

                        <button
                            type="button"
                            class="boton-ver-mensaje-admin"
                            data-id="${mensaje.id}"
                        >
                            Ver mensaje
                        </button>

                        ${botonResponder}

                        <button
                            type="button"
                            class="boton-eliminar-mensaje-admin"
                            data-id="${mensaje.id}"
                        >
                            Eliminar
                        </button>

                    </div>

                </div>
            `;

            listaMensajes.appendChild(tarjeta);
        }
    );

    activarEventosMensajes();
    actualizarSeleccionados();
    actualizarIndicadores();
}


function activarEventosMensajes() {
    document
        .querySelectorAll(
            ".seleccionar-mensaje-admin"
        )
        .forEach(function (casilla) {
            casilla.addEventListener(
                "change",
                actualizarSeleccionados
            );
        });

    document
        .querySelectorAll(
            ".boton-ver-mensaje-admin"
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
            ".boton-responder-admin"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    responderMensaje(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".boton-eliminar-mensaje-admin"
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
            ".seleccionar-mensaje-admin"
        );

    const seleccionadas =
        document.querySelectorAll(
            ".seleccionar-mensaje-admin:checked"
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

    if (mensaje.tipo === "recibido") {
        mensaje.estado = "Leído";
        guardarMensajes();
    }

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


function abrirFormularioMensaje() {
    formularioMensaje.reset();
    contenedorFormulario.hidden = false;

    selectorDestinatarios.focus();

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function cerrarFormularioMensaje() {
    formularioMensaje.reset();
    contenedorFormulario.hidden = true;
}


function responderMensaje(idMensaje) {
    const mensaje = mensajes.find(
        function (elemento) {
            return elemento.id === idMensaje;
        }
    );

    if (!mensaje) {
        return;
    }

    abrirFormularioMensaje();

    Array.from(
        selectorDestinatarios.options
    ).forEach(function (opcion) {
        opcion.selected =
            opcion.value === mensaje.remitente;
    });

    document.getElementById(
        "asunto-mensaje-admin"
    ).value = `Re: ${mensaje.asunto}`;

    mensaje.estado = "Leído";
    guardarMensajes();
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

    if (
        !confirm(
            `¿Deseas eliminar el mensaje ` +
            `"${mensaje.asunto}"?`
        )
    ) {
        return;
    }

    mensajes = mensajes.filter(
        function (elemento) {
            return elemento.id !== idMensaje;
        }
    );

    guardarMensajes();
    mostrarMensajes();
}


seleccionarTodos.addEventListener(
    "change",
    function () {
        document
            .querySelectorAll(
                ".seleccionar-mensaje-admin"
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
        const ids = Array.from(
            document.querySelectorAll(
                ".seleccionar-mensaje-admin:checked"
            )
        ).map(function (casilla) {
            return Number(casilla.dataset.id);
        });

        if (
            ids.length === 0 ||
            !confirm(
                `¿Deseas eliminar ${ids.length} mensajes?`
            )
        ) {
            return;
        }

        mensajes = mensajes.filter(
            function (mensaje) {
                return !ids.includes(mensaje.id);
            }
        );

        guardarMensajes();
        mostrarMensajes();
    }
);


formularioMensaje.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        const destinatarios = Array.from(
            selectorDestinatarios.selectedOptions
        ).map(function (opcion) {
            return opcion.value;
        });

        const asunto = document
            .getElementById("asunto-mensaje-admin")
            .value
            .trim();

        const contenido = document
            .getElementById("contenido-mensaje-admin")
            .value
            .trim();

        if (destinatarios.length === 0) {
            alert(
                "Selecciona al menos un destinatario."
            );
            return;
        }

        mensajes.unshift({
            id: Date.now(),
            tipo: "enviado",
            remitente: "administracion",
            destinatarios: destinatarios,
            asunto: asunto,
            contenido: contenido,
            fecha:
                new Date().toLocaleDateString("es-CL"),
            estado: "Enviado"
        });

        guardarMensajes();
        cerrarFormularioMensaje();

        bandejaActual = "enviado";

        pestanaRecibidos.classList.remove("activa");
        pestanaEnviados.classList.add("activa");

        tituloListado.textContent =
            "Mensajes enviados";

        filtroEstado.value = "TODOS";
        filtroEstado.disabled = true;

        mostrarMensajes();

        alert("Mensaje enviado correctamente.");
    }
);


pestanaRecibidos.addEventListener(
    "click",
    function () {
        bandejaActual = "recibido";

        pestanaRecibidos.classList.add("activa");
        pestanaEnviados.classList.remove("activa");

        tituloListado.textContent =
            "Mensajes recibidos";

        filtroEstado.disabled = false;

        mostrarMensajes();
    }
);


pestanaEnviados.addEventListener(
    "click",
    function () {
        bandejaActual = "enviado";

        pestanaRecibidos.classList.remove("activa");
        pestanaEnviados.classList.add("activa");

        tituloListado.textContent =
            "Mensajes enviados";

        filtroEstado.value = "TODOS";
        filtroEstado.disabled = true;

        mostrarMensajes();
    }
);


buscarMensaje.addEventListener(
    "input",
    mostrarMensajes
);

filtroEstado.addEventListener(
    "change",
    mostrarMensajes
);

botonNuevoMensaje.addEventListener(
    "click",
    abrirFormularioMensaje
);

cerrarFormulario.addEventListener(
    "click",
    cerrarFormularioMensaje
);

cancelarFormulario.addEventListener(
    "click",
    cerrarFormularioMensaje
);


cargarMensajes();
cargarDestinatarios();
mostrarMensajes();