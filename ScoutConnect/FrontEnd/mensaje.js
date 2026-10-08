const API_MENSAJES =
    "http://localhost:8080/mensajes";

const API_USUARIOS =
    "http://localhost:8080/usuarios";

const usuarioActualId =
    Number(sessionStorage.getItem("usuarioId"));

let mensajes = [];

const listaMensajes =
    document.getElementById("lista-mensajes");

const seleccionarTodos =
    document.getElementById("seleccionar-todos");

const contadorSeleccionados =
    document.getElementById("contador-seleccionados");

const botonEliminarSeleccionados =
    document.getElementById("eliminar-seleccionados");

const mensajeBandejaVacia =
    document.getElementById(
        "mensaje-bandeja-vacia"
    );

const botonNuevoMensaje =
    document.getElementById(
        "boton-nuevo-mensaje"
    );

const contenedorNuevoMensaje =
    document.getElementById(
        "contenedor-nuevo-mensaje"
    );

const cerrarFormularioMensaje =
    document.getElementById(
        "cerrar-formulario-mensaje"
    );

const cancelarFormularioMensaje =
    document.getElementById(
        "cancelar-formulario-mensaje"
    );

const formularioMensaje =
    document.getElementById("form-mensaje");

const tituloFormularioMensaje =
    document.getElementById(
        "titulo-formulario-mensaje"
    );

const campoMensajePadre =
    document.getElementById("mensaje-padre");

const selectorDestinatario =
    document.getElementById(
        "destinatario-mensaje"
    );

const campoAsunto =
    document.getElementById("asunto-mensaje");

const campoContenido =
    document.getElementById("texto-mensaje");

const campoArchivos =
    document.getElementById("archivos-mensaje");

const listaAdjuntos =
    document.getElementById(
        "lista-adjuntos-mensaje"
    );

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent =
        String(texto ?? "");

    return elemento.innerHTML;
}

async function leerRespuesta(respuesta) {
    const texto =
        await respuesta.text();

    if (!texto) {
        return {};
    }

    try {
        return JSON.parse(texto);
    } catch (error) {
        return {
            error: texto
        };
    }
}

function obtenerNombreEstado(estado) {
    if (estado === "NO_LEIDO") {
        return "No leído";
    }

    if (estado === "LEIDO") {
        return "Leído";
    }

    if (estado === "ENVIADO") {
        return "Enviado";
    }

    return estado || "";
}

function obtenerClaseEstado(estado) {
    return estado === "NO_LEIDO"
        ? "mensaje-no-leido"
        : "mensaje-leido";
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "";
    }

    const fechaConvertida =
        new Date(fecha);

    if (Number.isNaN(
        fechaConvertida.getTime()
    )) {
        return fecha;
    }

    return fechaConvertida.toLocaleString(
        "es-CL"
    );
}

function nombreParticipante(
    nickname,
    nombre
) {
    if (nombre) {
        return `${nombre} (@${nickname})`;
    }

    return `@${nickname}`;
}

function mapearMensaje(mensaje) {
    return {
        ...mensaje,

        estadoTexto:
            obtenerNombreEstado(
                mensaje.estado
            )
    };
}

async function cargarMensajes() {
    if (!usuarioActualId) {
        alert(
            "No se encontró la sesión del usuario."
        );

        return;
    }

    try {
        const [
            respuestaRecibidos,
            respuestaEnviados
        ] = await Promise.all([
            fetch(
                `${API_MENSAJES}/recibidos/` +
                `${usuarioActualId}`
            ),

            fetch(
                `${API_MENSAJES}/enviados/` +
                `${usuarioActualId}`
            )
        ]);

        const datosRecibidos =
            await leerRespuesta(
                respuestaRecibidos
            );

        const datosEnviados =
            await leerRespuesta(
                respuestaEnviados
            );

        if (!respuestaRecibidos.ok) {
            throw new Error(
                datosRecibidos.error ||
                "No se pudieron cargar los mensajes recibidos."
            );
        }

        if (!respuestaEnviados.ok) {
            throw new Error(
                datosEnviados.error ||
                "No se pudieron cargar los mensajes enviados."
            );
        }

        const recibidos =
            Array.isArray(datosRecibidos)
                ? datosRecibidos.map(mapearMensaje)
                : [];

        const enviados =
            Array.isArray(datosEnviados)
                ? datosEnviados.map(mapearMensaje)
                : [];

        mensajes = [
            ...recibidos,
            ...enviados
        ];

        mensajes.sort(function (a, b) {
            return new Date(
                b.fechaCreacion
            ) - new Date(
                a.fechaCreacion
            );
        });

        mostrarMensajes();

    } catch (error) {
        console.error(
            "Error al cargar mensajes:",
            error
        );

        alert(
            "No se pudieron cargar los mensajes."
        );
    }
}

async function cargarDestinatarios() {
    try {
        const respuesta =
            await fetch(
                `${API_USUARIOS}/listar`
            );

        const usuarios =
            await leerRespuesta(respuesta);

        if (!respuesta.ok) {
            throw new Error(
                usuarios.error ||
                "No se pudieron cargar los usuarios."
            );
        }

        selectorDestinatario.innerHTML =
            `
                <option value="">
                    Selecciona un destinatario
                </option>
            `;

        if (!Array.isArray(usuarios)) {
            return;
        }

        usuarios
            .filter(function (usuario) {
                const usuarioId =
                    Number(usuario.id);

                const estado =
                    typeof usuario.estado ===
                    "string"
                        ? usuario.estado
                        : usuario.estado?.nombre;

                const activo =
                    estado?.toLowerCase() ===
                    "activo";

                return activo &&
                    usuarioId !== usuarioActualId;
            })
            .forEach(function (usuario) {
                const opcion =
                    document.createElement("option");

                opcion.value =
                    usuario.id;

                opcion.textContent =
                    nombreParticipante(
                        usuario.nickname,
                        usuario.nombre
                    );

                selectorDestinatario.appendChild(
                    opcion
                );
            });

    } catch (error) {
        console.error(
            "Error al cargar destinatarios:",
            error
        );

        alert(
            "No se pudieron cargar los destinatarios."
        );
    }
}

function mostrarMensajes() {
    listaMensajes.innerHTML = "";

    if (!mensajes.length) {
        mensajeBandejaVacia.hidden =
            false;

        seleccionarTodos.checked =
            false;

        seleccionarTodos.disabled =
            true;

        actualizarSeleccionados();

        return;
    }

    mensajeBandejaVacia.hidden =
        true;

    seleccionarTodos.disabled =
        false;

    mensajes.forEach(function (mensaje) {
        const tarjeta =
            document.createElement("article");

        tarjeta.classList.add(
            "tarjeta-mensaje"
        );

        const remitente =
            mensaje.remitenteNickname ||
            "desconocido";

        const destinatario =
            mensaje.destinatarioNickname ||
            "desconocido";

        const claseEstado =
            obtenerClaseEstado(
                mensaje.estado
            );

        tarjeta.innerHTML = `
            <div class="selector-mensaje">
                <input
                    type="checkbox"
                    class="seleccionar-mensaje"
                    data-id="${mensaje.id}"
                    aria-label="Seleccionar mensaje">
            </div>

            <div class="contenido-mensaje">

                <div
                    class="encabezado-tarjeta-mensaje">

                    <div>
                        <h3>
                            ${escaparHTML(
                                mensaje.asunto
                            )}
                        </h3>

                        <p
                            class="fecha-mensaje">
                            ${escaparHTML(
                                formatearFecha(
                                    mensaje.fechaCreacion
                                )
                            )}
                        </p>

                        <p
                            class="participantes-mensaje">
                            <strong>De:</strong>
                            @${escaparHTML(
                                remitente
                            )}
                        </p>

                        <p
                            class="participantes-mensaje">
                            <strong>Para:</strong>
                            @${escaparHTML(
                                destinatario
                            )}
                        </p>
                    </div>

                    <span
                        class="estado-mensaje ${claseEstado}">
                        ${escaparHTML(
                            mensaje.estadoTexto
                        )}
                    </span>
                </div>

                <p class="texto-mensaje">
                    ${escaparHTML(
                        mensaje.contenido
                    )}
                </p>

                <div
                    class="acciones-tarjeta-mensaje">

                    <button
                        type="button"
                        class="boton-leer-mensaje"
                        data-id="${mensaje.id}">
                        Ver mensaje
                    </button>

                    <button
                        type="button"
                        class="boton-responder-mensaje"
                        data-id="${mensaje.id}">
                        Responder
                    </button>

                    <button
                        type="button"
                        class="boton-eliminar-mensaje"
                        data-id="${mensaje.id}">
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
    document
        .querySelectorAll(
            ".seleccionar-mensaje"
        )
        .forEach(function (casilla) {
            casilla.addEventListener(
                "change",
                actualizarSeleccionados
            );
        });

    document
        .querySelectorAll(
            ".boton-leer-mensaje"
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
            ".boton-responder-mensaje"
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
            ".boton-eliminar-mensaje"
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
            ".seleccionar-mensaje"
        );

    const seleccionadas =
        document.querySelectorAll(
            ".seleccionar-mensaje:checked"
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

function limpiarFormulario() {
    formularioMensaje.reset();

    campoMensajePadre.value =
        "";

    selectorDestinatario.disabled =
        false;

    campoAsunto.readOnly =
        false;

    tituloFormularioMensaje.textContent =
        "Enviar un nuevo mensaje";

    listaAdjuntos.innerHTML =
        "";
}

function abrirFormularioMensaje() {
    limpiarFormulario();

    contenedorNuevoMensaje.hidden =
        false;

    selectorDestinatario.focus();

    contenedorNuevoMensaje.scrollIntoView({
        behavior: "smooth"
    });
}

function cerrarFormulario() {
    limpiarFormulario();

    contenedorNuevoMensaje.hidden =
        true;
}

function mostrarArchivosSeleccionados() {
    listaAdjuntos.innerHTML =
        "";

    const archivos =
        Array.from(campoArchivos.files);

    archivos.forEach(function (archivo) {
        const elemento =
            document.createElement("p");

        elemento.textContent =
            `${archivo.name} ` +
            `(${Math.ceil(
                archivo.size / 1024
            )} KB)`;

        listaAdjuntos.appendChild(
            elemento
        );
    });
}

function validarArchivos(archivos) {
    const extensionesPermitidas = [
        "pdf",
        "docx",
        "xlsx",
        "jpg",
        "jpeg",
        "png"
    ];

    if (archivos.length > 2) {
        alert(
            "Puedes adjuntar como máximo 2 archivos."
        );

        return false;
    }

    for (const archivo of archivos) {
        const partes =
            archivo.name.split(".");

        const extension =
            partes.length > 1
                ? partes.pop().toLowerCase()
                : "";

        if (!extensionesPermitidas.includes(
            extension
        )) {
            alert(
                `El archivo "${archivo.name}" ` +
                "no tiene un formato permitido."
            );

            return false;
        }
    }

    return true;
}

async function enviarMensaje() {
    const destinatarioId =
        Number(selectorDestinatario.value);

    const asunto =
        campoAsunto.value.trim();

    const contenido =
        campoContenido.value.trim();

    const archivos =
        Array.from(campoArchivos.files);

    if (!destinatarioId) {
        alert(
            "Selecciona un destinatario."
        );

        return false;
    }

    if (!asunto) {
        alert(
            "Escribe un asunto."
        );

        return false;
    }

    if (asunto.length > 255) {
        alert(
            "El asunto no puede superar " +
            "los 255 caracteres."
        );

        return false;
    }

    if (!contenido) {
        alert(
            "Escribe el contenido del mensaje."
        );

        return false;
    }

    if (contenido.length > 500) {
        alert(
            "El mensaje no puede superar " +
            "los 500 caracteres."
        );

        return false;
    }

    if (!validarArchivos(archivos)) {
        return false;
    }

    const datosMensaje = {
        remitenteId: usuarioActualId,
        destinatarioId,
        asunto,
        contenido
    };

    const formData =
        new FormData();

    formData.append(
        "mensaje",
        JSON.stringify(datosMensaje)
    );

    archivos.forEach(function (archivo) {
        formData.append(
            "archivos",
            archivo
        );
    });

    const mensajePadreId =
        Number(campoMensajePadre.value);

    const url =
        mensajePadreId
            ? `${API_MENSAJES}/` +
              `${mensajePadreId}/respuesta`
            : API_MENSAJES;

    const respuesta =
        await fetch(url, {
            method: "POST",
            body: formData
        });

    const data =
        await leerRespuesta(respuesta);

    if (!respuesta.ok) {
        alert(
            data.error ||
            "No se pudo enviar el mensaje."
        );

        return false;
    }

    return true;
}

async function marcarComoLeido(idMensaje) {
    const respuesta =
        await fetch(
            `${API_MENSAJES}/${idMensaje}/leer` +
            `?usuarioId=${usuarioActualId}`,
            {
                method: "PUT"
            }
        );

    if (!respuesta.ok) {
        const data =
            await leerRespuesta(respuesta);

        console.error(
            data.error ||
            "No se pudo marcar el mensaje como leído."
        );

        return false;
    }

    return true;
}

async function verMensaje(idMensaje) {
    const mensaje =
        mensajes.find(function (elemento) {
            return elemento.id === idMensaje;
        });

    if (!mensaje) {
        return;
    }

    if (
        mensaje.estado === "NO_LEIDO" &&
        mensaje.destinatarioId ===
        usuarioActualId
    ) {
        await marcarComoLeido(idMensaje);
        mensaje.estado = "LEIDO";
        mensaje.estadoTexto = "Leído";
    }

    alert(
        `De: @${mensaje.remitenteNickname}\n` +
        `Para: @${mensaje.destinatarioNickname}\n` +
        `Asunto: ${mensaje.asunto}\n` +
        `Fecha: ${formatearFecha(
            mensaje.fechaCreacion
        )}\n\n` +
        `${mensaje.contenido}`
    );

    mostrarMensajes();
}

async function responderMensaje(idMensaje) {
    const mensaje =
        mensajes.find(function (elemento) {
            return elemento.id === idMensaje;
        });

    if (!mensaje) {
        return;
    }

    campoMensajePadre.value =
        mensaje.id;

    selectorDestinatario.value =
        mensaje.remitenteId;

    selectorDestinatario.disabled =
        true;

    campoAsunto.value =
        mensaje.asunto.startsWith("Re:")
            ? mensaje.asunto
            : `Re: ${mensaje.asunto}`;

    campoAsunto.readOnly =
        true;

    campoContenido.value =
        "";

    campoArchivos.value =
        "";

    listaAdjuntos.innerHTML =
        "";

    tituloFormularioMensaje.textContent =
        "Responder mensaje";

    contenedorNuevoMensaje.hidden =
        false;

    campoContenido.focus();

    contenedorNuevoMensaje.scrollIntoView({
        behavior: "smooth"
    });

    if (mensaje.estado === "NO_LEIDO") {
        await marcarComoLeido(idMensaje);
    }
}

async function eliminarMensaje(idMensaje) {
    const mensaje =
        mensajes.find(function (elemento) {
            return elemento.id === idMensaje;
        });

    if (!mensaje) {
        return;
    }

    const confirmar =
        confirm(
            `¿Deseas eliminar el mensaje ` +
            `"${mensaje.asunto}"?`
        );

    if (!confirmar) {
        return;
    }

    const respuesta =
        await fetch(
            `${API_MENSAJES}/${idMensaje}` +
            `?usuarioId=${usuarioActualId}`,
            {
                method: "DELETE"
            }
        );

    const data =
        await leerRespuesta(respuesta);

    if (!respuesta.ok) {
        alert(
            data.error ||
            "No se pudo eliminar el mensaje."
        );

        return;
    }

    await cargarMensajes();
}

seleccionarTodos.addEventListener(
    "change",
    function () {
        document
            .querySelectorAll(
                ".seleccionar-mensaje"
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
    async function () {
        const seleccionadas =
            document.querySelectorAll(
                ".seleccionar-mensaje:checked"
            );

        const ids =
            Array.from(seleccionadas)
                .map(function (casilla) {
                    return Number(
                        casilla.dataset.id
                    );
                });

        if (!ids.length) {
            return;
        }

        const confirmar =
            confirm(
                `¿Deseas eliminar ${ids.length} ` +
                "mensajes seleccionados?"
            );

        if (!confirmar) {
            return;
        }

        try {
            for (const id of ids) {
                const respuesta =
                    await fetch(
                        `${API_MENSAJES}/${id}` +
                        `?usuarioId=${usuarioActualId}`,
                        {
                            method: "DELETE"
                        }
                    );

                if (!respuesta.ok) {
                    console.error(
                        `No se pudo eliminar ` +
                        `el mensaje ${id}.`
                    );
                }
            }

            await cargarMensajes();

        } catch (error) {
            console.error(
                "Error al eliminar mensajes:",
                error
            );

            alert(
                "No se pudieron eliminar " +
                "todos los mensajes."
            );
        }
    }
);

botonNuevoMensaje.addEventListener(
    "click",
    abrirFormularioMensaje
);

cerrarFormularioMensaje.addEventListener(
    "click",
    cerrarFormulario
);

cancelarFormularioMensaje.addEventListener(
    "click",
    cerrarFormulario
);

campoArchivos.addEventListener(
    "change",
    function () {
        const archivos =
            Array.from(campoArchivos.files);

        if (!validarArchivos(archivos)) {
            campoArchivos.value =
                "";

            listaAdjuntos.innerHTML =
                "";

            return;
        }

        mostrarArchivosSeleccionados();
    }
);

formularioMensaje.addEventListener(
    "submit",
    async function (evento) {
        evento.preventDefault();

        try {
            const enviado =
                await enviarMensaje();

            if (!enviado) {
                return;
            }

            cerrarFormulario();

            await cargarMensajes();

            alert(
                "Tu mensaje fue enviado correctamente."
            );

        } catch (error) {
            console.error(
                "Error al enviar el mensaje:",
                error
            );

            alert(
                "No se pudo conectar con el servidor."
            );
        }
    }
);
async function iniciarMensajes() {
    if (!usuarioActualId) {alert("La sesión no contiene un usuario válido.");return;}
    await cargarDestinatarios();
    await cargarMensajes();
}
iniciarMensajes();