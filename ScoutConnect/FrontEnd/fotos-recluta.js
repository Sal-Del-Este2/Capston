const CLAVE_RECLUTAS = "reclutasScout";
const CLAVE_FOTOS = "fotosReclutasScout";
const TAMANO_MAXIMO = 2 * 1024 * 1024;

const botonNuevaFoto =
    document.getElementById(
        "boton-nueva-foto-recluta"
    );

const contenedorFormulario =
    document.getElementById(
        "contenedor-formulario-foto-recluta"
    );

const formularioFoto =
    document.getElementById(
        "form-foto-recluta"
    );

const botonCerrarFormulario =
    document.getElementById(
        "cerrar-formulario-foto-recluta"
    );

const botonCancelar =
    document.getElementById(
        "cancelar-foto-recluta"
    );

const inputArchivo =
    document.getElementById(
        "archivo-foto-recluta"
    );

const inputTitulo =
    document.getElementById(
        "titulo-foto-recluta"
    );

const inputActividad =
    document.getElementById(
        "actividad-foto-recluta"
    );

const inputFecha =
    document.getElementById(
        "fecha-foto-recluta"
    );

const inputDescripcion =
    document.getElementById(
        "descripcion-foto-recluta"
    );

const contadorDescripcion =
    document.getElementById(
        "caracteres-descripcion-foto"
    );

const vistaPrevia =
    document.getElementById(
        "vista-previa-foto-recluta"
    );

const imagenPrevia =
    document.getElementById(
        "imagen-previa-recluta"
    );

const confirmacion =
    document.getElementById(
        "confirmar-foto-recluta"
    );

const filtroEstado =
    document.getElementById(
        "filtro-estado-foto"
    );

const listaFotos =
    document.getElementById(
        "lista-fotos-recluta"
    );

const mensajeSinFotos =
    document.getElementById(
        "sin-fotos-recluta"
    );

const totalFotos =
    document.getElementById(
        "total-fotos-recluta"
    );

const fotosPendientes =
    document.getElementById(
        "fotos-pendientes-recluta"
    );

const fotosAprobadas =
    document.getElementById(
        "fotos-aprobadas-recluta"
    );

const fotosRechazadas =
    document.getElementById(
        "fotos-rechazadas-recluta"
    );

const botonSalir =
    document.getElementById(
        "salir-fotos-recluta"
    );

let reclutaActual = null;
let fotos = cargarFotos();
let imagenProcesada = "";

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

function cargarFotos() {
    try {
        const datos = JSON.parse(
            localStorage.getItem(
                CLAVE_FOTOS
            )
        );

        return Array.isArray(datos)
            ? datos
            : [];
    } catch (error) {
        return [];
    }
}

function guardarFotos() {
    try {
        localStorage.setItem(
            CLAVE_FOTOS,
            JSON.stringify(fotos)
        );

        return true;
    } catch (error) {
        console.error(
            "No fue posible guardar la fotografía:",
            error
        );

        alert(
            "No fue posible guardar la fotografía. " +
            "Prueba con una imagen de menor tamaño."
        );

        return false;
    }
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

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = texto ?? "";

    return elemento.innerHTML;
}

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin fecha";
    }

    const valor =
        fecha.includes("T")
            ? new Date(fecha)
            : new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(valor.getTime())) {
        return "Sin fecha";
    }

    return valor.toLocaleDateString(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function obtenerFotosDelRecluta() {
    return fotos
        .filter(function (foto) {
            return String(foto.reclutaId) ===
                String(reclutaActual.id);
        })
        .sort(function (a, b) {
            return (
                new Date(b.fechaEnvio) -
                new Date(a.fechaEnvio)
            );
        });
}

function actualizarResumen() {
    const fotosRecluta =
        obtenerFotosDelRecluta();

    const cantidadPendientes =
        fotosRecluta.filter(
            function (foto) {
                return foto.estado ===
                    "PENDIENTE";
            }
        ).length;

    totalFotos.textContent =
        fotosRecluta.length;

    fotosPendientes.textContent =
        cantidadPendientes;

    fotosAprobadas.textContent =
        fotosRecluta.filter(
            function (foto) {
                return foto.estado ===
                    "APROBADA";
            }
        ).length;

    fotosRechazadas.textContent =
        fotosRecluta.filter(
            function (foto) {
                return foto.estado ===
                    "RECHAZADA";
            }
        ).length;

    actualizarPendientesRecluta(
        cantidadPendientes
    );
}

function actualizarPendientesRecluta(cantidad) {
    const reclutas =
        cargarReclutas();

    const indice =
        reclutas.findIndex(
            function (recluta) {
                return String(recluta.id) ===
                    String(reclutaActual.id);
            }
        );

    if (indice === -1) {
        return;
    }

    reclutas[indice].fotosPendientes =
        cantidad;

    localStorage.setItem(
        CLAVE_RECLUTAS,
        JSON.stringify(reclutas)
    );
}

function claseEstadoFoto(estado) {
    if (estado === "APROBADA") {
        return "estado-foto-aprobada";
    }

    if (estado === "RECHAZADA") {
        return "estado-foto-rechazada";
    }

    return "estado-foto-pendiente";
}

function mostrarFotos() {
    const estadoSeleccionado =
        filtroEstado.value;

    let fotosVisibles =
        obtenerFotosDelRecluta();

    if (estadoSeleccionado !== "TODAS") {
        fotosVisibles =
            fotosVisibles.filter(
                function (foto) {
                    return foto.estado ===
                        estadoSeleccionado;
                }
            );
    }

    listaFotos.innerHTML = "";

    if (fotosVisibles.length === 0) {
        mensajeSinFotos.hidden = false;
        actualizarResumen();
        return;
    }

    mensajeSinFotos.hidden = true;

    fotosVisibles.forEach(function (foto) {
        const tarjeta =
            document.createElement("article");

        tarjeta.className =
            "tarjeta-foto-recluta";

        const puedeEliminar =
            foto.estado !== "APROBADA";

        const motivoRechazo =
            foto.estado === "RECHAZADA" &&
            foto.motivoRevision
                ? `
                    <div class="motivo-rechazo-foto">
                        <strong>Motivo del rechazo:</strong>
                        <p>
                            ${escaparHTML(foto.motivoRevision)}
                        </p>
                    </div>
                `
                : "";

        tarjeta.innerHTML = `
            <div class="imagen-tarjeta-foto">
                <img
                    src="${foto.imagen}"
                    alt="${escaparHTML(foto.titulo)}"
                >

                <span
                    class="estado-tarjeta-foto
                    ${claseEstadoFoto(foto.estado)}"
                >
                    ${escaparHTML(foto.estado)}
                </span>
            </div>

            <div class="contenido-tarjeta-foto">
                <h3>
                    ${escaparHTML(foto.titulo)}
                </h3>

                <p class="actividad-tarjeta-foto">
                    ${escaparHTML(foto.actividad)}
                </p>

                <p class="descripcion-tarjeta-foto">
                    ${escaparHTML(foto.descripcion)}
                </p>

                <div class="fechas-tarjeta-foto">
                    <span>
                        Actividad:
                        ${formatearFecha(foto.fechaActividad)}
                    </span>

                    <span>
                        Enviada:
                        ${formatearFecha(foto.fechaEnvio)}
                    </span>
                </div>

                ${motivoRechazo}

                ${
                    puedeEliminar
                        ? `
                            <button
                                type="button"
                                class="boton-eliminar-foto-recluta"
                                data-id="${foto.id}"
                            >
                                Eliminar fotografía
                            </button>
                        `
                        : `
                            <p class="foto-publicada-aviso">
                                ✓ Fotografía aprobada para publicación
                            </p>
                        `
                }
            </div>
        `;

        listaFotos.appendChild(
            tarjeta
        );
    });

    document
        .querySelectorAll(
            ".boton-eliminar-foto-recluta"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    eliminarFoto(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    actualizarResumen();
}

function abrirFormulario() {
    formularioFoto.reset();
    imagenProcesada = "";
    imagenPrevia.src = "";
    vistaPrevia.hidden = true;
    contadorDescripcion.textContent = "0";

    const hoy =
        new Date().toISOString().split("T")[0];

    inputFecha.max = hoy;

    contenedorFormulario.hidden = false;
    inputArchivo.focus();
}

function cerrarFormulario() {
    formularioFoto.reset();
    imagenProcesada = "";
    imagenPrevia.src = "";
    vistaPrevia.hidden = true;
    contadorDescripcion.textContent = "0";
    contenedorFormulario.hidden = true;
}

function validarArchivo(archivo) {
    const formatosPermitidos = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (
        !formatosPermitidos.includes(
            archivo.type
        )
    ) {
        alert(
            "El archivo debe ser una imagen JPG, PNG o WEBP."
        );
        return false;
    }

    if (archivo.size > TAMANO_MAXIMO) {
        alert(
            "La fotografía no puede superar los 2 MB."
        );
        return false;
    }

    return true;
}

function procesarImagen(archivo) {
    const lector = new FileReader();

    lector.addEventListener(
        "load",
        function () {
            const imagen = new Image();

            imagen.addEventListener(
                "load",
                function () {
                    const maximo = 1280;

                    let ancho = imagen.width;
                    let alto = imagen.height;

                    if (
                        ancho > maximo ||
                        alto > maximo
                    ) {
                        const proporcion =
                            Math.min(
                                maximo / ancho,
                                maximo / alto
                            );

                        ancho = Math.round(
                            ancho * proporcion
                        );

                        alto = Math.round(
                            alto * proporcion
                        );
                    }

                    const lienzo =
                        document.createElement(
                            "canvas"
                        );

                    lienzo.width = ancho;
                    lienzo.height = alto;

                    const contexto =
                        lienzo.getContext("2d");

                    contexto.drawImage(
                        imagen,
                        0,
                        0,
                        ancho,
                        alto
                    );

                    imagenProcesada =
                        lienzo.toDataURL(
                            "image/jpeg",
                            0.82
                        );

                    imagenPrevia.src =
                        imagenProcesada;

                    vistaPrevia.hidden = false;
                }
            );

            imagen.src = lector.result;
        }
    );

    lector.readAsDataURL(archivo);
}

function seleccionarImagen() {
    const archivo =
        inputArchivo.files[0];

    imagenProcesada = "";
    imagenPrevia.src = "";
    vistaPrevia.hidden = true;

    if (!archivo) {
        return;
    }

    if (!validarArchivo(archivo)) {
        inputArchivo.value = "";
        return;
    }

    procesarImagen(archivo);
}

function guardarNuevaFoto(evento) {
    evento.preventDefault();

    if (!imagenProcesada) {
        alert(
            "Selecciona una fotografía válida."
        );
        return;
    }

    const fechaActividad =
        new Date(
            `${inputFecha.value}T00:00:00`
        );

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (
        Number.isNaN(
            fechaActividad.getTime()
        ) ||
        fechaActividad > hoy
    ) {
        alert(
            "La fecha de la actividad no puede ser futura."
        );
        return;
    }

    if (!confirmacion.checked) {
        alert(
            "Debes confirmar que tienes autorización para compartir la fotografía."
        );
        return;
    }

    const nuevaFoto = {
        id: Date.now(),
        reclutaId: reclutaActual.id,
        reclutaNombre:
            reclutaActual.nombre,
        reclutaNickname:
            reclutaActual.nickname,
        apoderadoCorreo:
            reclutaActual.apoderadoCorreo,
        grupo: reclutaActual.grupo,
        rama: reclutaActual.rama,
        titulo:
            inputTitulo.value.trim(),
        actividad:
            inputActividad.value.trim(),
        descripcion:
            inputDescripcion.value.trim(),
        fechaActividad:
            inputFecha.value,
        fechaEnvio:
            new Date().toISOString(),
        imagen: imagenProcesada,
        estado: "PENDIENTE",
        motivoRevision: "",
        fechaRevision: null,
        revisadoPor: null
    };

    fotos.unshift(nuevaFoto);

    if (!guardarFotos()) {
        fotos = fotos.filter(
            function (foto) {
                return foto.id !==
                    nuevaFoto.id;
            }
        );

        return;
    }

    cerrarFormulario();
    mostrarFotos();

    alert(
        "La fotografía fue enviada y quedó pendiente de revisión."
    );
}

function eliminarFoto(idFoto) {
    const foto = fotos.find(
        function (elemento) {
            return (
                elemento.id === idFoto &&
                String(elemento.reclutaId) ===
                    String(reclutaActual.id)
            );
        }
    );

    if (!foto || foto.estado === "APROBADA") {
        alert(
            "No es posible eliminar esta fotografía."
        );
        return;
    }

    const confirmar = confirm(
        `¿Deseas eliminar la fotografía "${foto.titulo}"?`
    );

    if (!confirmar) {
        return;
    }

    fotos = fotos.filter(
        function (elemento) {
            return elemento.id !== idFoto;
        }
    );

    guardarFotos();
    mostrarFotos();
}

function regresarAccesoAnterior() {
    if (
        sessionStorage.getItem(
            "rolUsuario"
        ) === "USUARIO"
    ) {
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

    sessionStorage.clear();
    window.location.replace("login.html");
}

function iniciarModuloFotos() {
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

    mostrarFotos();
}

botonNuevaFoto.addEventListener(
    "click",
    abrirFormulario
);

botonCerrarFormulario.addEventListener(
    "click",
    cerrarFormulario
);

botonCancelar.addEventListener(
    "click",
    cerrarFormulario
);

inputArchivo.addEventListener(
    "change",
    seleccionarImagen
);

inputDescripcion.addEventListener(
    "input",
    function () {
        contadorDescripcion.textContent =
            inputDescripcion.value.length;
    }
);

formularioFoto.addEventListener(
    "submit",
    guardarNuevaFoto
);

filtroEstado.addEventListener(
    "change",
    mostrarFotos
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
            sessionStorage.clear();
            window.location.replace(
                "login.html"
            );
        }
    }
);

iniciarModuloFotos();