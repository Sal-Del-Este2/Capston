const CLAVE_FOTOS = "fotosReclutasScout";
const CLAVE_RECLUTAS = "reclutasScout";

const listaFotos =
    document.getElementById(
        "lista-admin-fotos"
    );

const mensajeSinResultados =
    document.getElementById(
        "sin-resultados-admin-fotos"
    );

const resultadoFotos =
    document.getElementById(
        "resultado-admin-fotos"
    );

const totalFotos =
    document.getElementById(
        "admin-total-fotos"
    );

const totalPendientes =
    document.getElementById(
        "admin-fotos-pendientes"
    );

const totalAprobadas =
    document.getElementById(
        "admin-fotos-aprobadas"
    );

const totalRechazadas =
    document.getElementById(
        "admin-fotos-rechazadas"
    );

const buscador =
    document.getElementById(
        "buscar-admin-foto"
    );

const filtroEstado =
    document.getElementById(
        "estado-admin-foto"
    );

const filtroGrupo =
    document.getElementById(
        "grupo-admin-foto"
    );

const filtroRama =
    document.getElementById(
        "rama-admin-foto"
    );

const botonLimpiarFiltros =
    document.getElementById(
        "limpiar-filtros-admin-fotos"
    );

const contenedorDetalle =
    document.getElementById(
        "detalle-admin-foto"
    );

const tituloDetalle =
    document.getElementById(
        "titulo-detalle-admin-foto"
    );

const imagenDetalle =
    document.getElementById(
        "imagen-detalle-admin-foto"
    );

const reclutaDetalle =
    document.getElementById(
        "recluta-detalle-admin-foto"
    );

const grupoDetalle =
    document.getElementById(
        "grupo-detalle-admin-foto"
    );

const actividadDetalle =
    document.getElementById(
        "actividad-detalle-admin-foto"
    );

const fechaDetalle =
    document.getElementById(
        "fecha-detalle-admin-foto"
    );

const descripcionDetalle =
    document.getElementById(
        "descripcion-detalle-admin-foto"
    );

const estadoDetalle =
    document.getElementById(
        "estado-detalle-admin-foto"
    );

const accionesDetalle =
    document.getElementById(
        "acciones-detalle-admin-foto"
    );

const botonCerrarDetalle =
    document.getElementById(
        "cerrar-detalle-admin-foto"
    );

const botonAprobarDetalle =
    document.getElementById(
        "aprobar-detalle-admin-foto"
    );

const botonRechazarDetalle =
    document.getElementById(
        "rechazar-detalle-admin-foto"
    );

const contenedorRechazo =
    document.getElementById(
        "formulario-rechazo-admin-foto"
    );

const formularioRechazo =
    document.getElementById(
        "form-rechazo-admin-foto"
    );

const inputIdRechazo =
    document.getElementById(
        "id-foto-rechazo"
    );

const inputMotivoRechazo =
    document.getElementById(
        "motivo-rechazo-admin-foto"
    );

const contadorMotivo =
    document.getElementById(
        "caracteres-motivo-rechazo"
    );

const botonCerrarRechazo =
    document.getElementById(
        "cerrar-rechazo-admin-foto"
    );

const botonCancelarRechazo =
    document.getElementById(
        "cancelar-rechazo-admin-foto"
    );

const botonCerrarSesion =
    document.getElementById(
        "cerrar-sesion-admin-fotos"
    );

let fotos = cargarFotos();
let fotoSeleccionadaId = null;

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
    localStorage.setItem(
        CLAVE_FOTOS,
        JSON.stringify(fotos)
    );
}

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

function guardarReclutas(reclutas) {
    localStorage.setItem(
        CLAVE_RECLUTAS,
        JSON.stringify(reclutas)
    );
}

function protegerModuloAdmin() {
    const autenticado =
        sessionStorage.getItem(
            "usuarioAutenticado"
        );

    const rol =
        sessionStorage.getItem(
            "rolUsuario"
        );

    if (
        autenticado !== "true" ||
        rol !== "ADMINISTRADOR"
    ) {
        alert(
            "Debes iniciar sesión como administrador."
        );

        window.location.replace(
            "login.html"
        );

        return false;
    }

    return true;
}

function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = texto ?? "";

    return elemento.innerHTML;
}

function normalizarTexto(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
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

function obtenerClaseEstado(estado) {
    if (estado === "APROBADA") {
        return "estado-foto-aprobada";
    }

    if (estado === "RECHAZADA") {
        return "estado-foto-rechazada";
    }

    return "estado-foto-pendiente";
}

function actualizarResumen() {
    totalFotos.textContent =
        fotos.length;

    totalPendientes.textContent =
        fotos.filter(function (foto) {
            return foto.estado ===
                "PENDIENTE";
        }).length;

    totalAprobadas.textContent =
        fotos.filter(function (foto) {
            return foto.estado ===
                "APROBADA";
        }).length;

    totalRechazadas.textContent =
        fotos.filter(function (foto) {
            return foto.estado ===
                "RECHAZADA";
        }).length;
}

function cargarGrupos() {
    const grupos = [
        ...new Set(
            fotos
                .map(function (foto) {
                    return foto.grupo;
                })
                .filter(Boolean)
        )
    ].sort();

    filtroGrupo.innerHTML = `
        <option value="TODOS">
            Todos los grupos
        </option>
    `;

    grupos.forEach(function (grupo) {
        const opcion =
            document.createElement("option");

        opcion.value = grupo;
        opcion.textContent = grupo;

        filtroGrupo.appendChild(opcion);
    });
}

function obtenerFotosFiltradas() {
    const textoBusqueda =
        normalizarTexto(
            buscador.value.trim()
        );

    return fotos
        .filter(function (foto) {
            const coincideEstado =
                filtroEstado.value === "TODAS" ||
                foto.estado ===
                    filtroEstado.value;

            const coincideGrupo =
                filtroGrupo.value === "TODOS" ||
                foto.grupo ===
                    filtroGrupo.value;

            const coincideRama =
                filtroRama.value === "TODAS" ||
                foto.rama ===
                    filtroRama.value;

            const textoFoto =
                normalizarTexto(
                    [
                        foto.reclutaNombre,
                        foto.reclutaNickname,
                        foto.titulo,
                        foto.actividad,
                        foto.descripcion
                    ].join(" ")
                );

            const coincideBusqueda =
                textoBusqueda === "" ||
                textoFoto.includes(
                    textoBusqueda
                );

            return (
                coincideEstado &&
                coincideGrupo &&
                coincideRama &&
                coincideBusqueda
            );
        })
        .sort(function (a, b) {
            if (
                a.estado === "PENDIENTE" &&
                b.estado !== "PENDIENTE"
            ) {
                return -1;
            }

            if (
                b.estado === "PENDIENTE" &&
                a.estado !== "PENDIENTE"
            ) {
                return 1;
            }

            return (
                new Date(b.fechaEnvio) -
                new Date(a.fechaEnvio)
            );
        });
}

function mostrarFotos() {
    const fotosFiltradas =
        obtenerFotosFiltradas();

    listaFotos.innerHTML = "";

    resultadoFotos.textContent =
        fotosFiltradas.length === 1
            ? "1 fotografía"
            : `${fotosFiltradas.length} fotografías`;

    if (fotosFiltradas.length === 0) {
        mensajeSinResultados.hidden = false;
        actualizarResumen();
        return;
    }

    mensajeSinResultados.hidden = true;

    fotosFiltradas.forEach(
        function (foto) {
            const tarjeta =
                document.createElement("article");

            tarjeta.className =
                "tarjeta-admin-foto";

            const accionesModeracion =
                foto.estado === "PENDIENTE"
                    ? `
                        <button
                            type="button"
                            class="boton-aprobar-foto
                            boton-aprobar-admin-foto"
                            data-id="${foto.id}"
                        >
                            Aprobar
                        </button>

                        <button
                            type="button"
                            class="boton-rechazar-foto
                            boton-rechazar-admin-foto"
                            data-id="${foto.id}"
                        >
                            Rechazar
                        </button>
                    `
                    : "";

            const resultadoRevision =
                foto.estado !== "PENDIENTE"
                    ? `
                        <p class="revision-admin-foto">
                            Revisada:
                            ${formatearFecha(foto.fechaRevision)}
                        </p>
                    `
                    : "";

            tarjeta.innerHTML = `
                <div class="imagen-admin-foto">
                    <img
                        src="${foto.imagen}"
                        alt="${escaparHTML(foto.titulo)}"
                    >

                    <span
                        class="estado-tarjeta-foto
                        ${obtenerClaseEstado(foto.estado)}"
                    >
                        ${escaparHTML(foto.estado)}
                    </span>
                </div>

                <div class="contenido-admin-foto">
                    <h3>
                        ${escaparHTML(foto.titulo)}
                    </h3>

                    <p class="autor-admin-foto">
                        ${escaparHTML(foto.reclutaNombre)}
                        (@${escaparHTML(foto.reclutaNickname)})
                    </p>

                    <p>
                        <strong>Grupo:</strong>
                        ${escaparHTML(foto.grupo)}
                        ·
                        ${escaparHTML(foto.rama)}
                    </p>

                    <p>
                        <strong>Actividad:</strong>
                        ${escaparHTML(foto.actividad)}
                    </p>

                    <p class="fecha-envio-admin-foto">
                        Enviada:
                        ${formatearFecha(foto.fechaEnvio)}
                    </p>

                    ${resultadoRevision}

                    <div class="acciones-admin-foto">
                        <button
                            type="button"
                            class="boton-ver-admin-foto"
                            data-id="${foto.id}"
                        >
                            Ver detalle
                        </button>

                        ${accionesModeracion}
                    </div>
                </div>
            `;

            listaFotos.appendChild(
                tarjeta
            );
        }
    );

    activarEventosTarjetas();
    actualizarResumen();
}

function activarEventosTarjetas() {
    document
        .querySelectorAll(
            ".boton-ver-admin-foto"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    abrirDetalle(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".boton-aprobar-admin-foto"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    aprobarFoto(
                        Number(boton.dataset.id)
                    );
                }
            );
        });

    document
        .querySelectorAll(
            ".boton-rechazar-admin-foto"
        )
        .forEach(function (boton) {
            boton.addEventListener(
                "click",
                function () {
                    abrirFormularioRechazo(
                        Number(boton.dataset.id)
                    );
                }
            );
        });
}

function abrirDetalle(idFoto) {
    const foto = fotos.find(
        function (elemento) {
            return elemento.id === idFoto;
        }
    );

    if (!foto) {
        return;
    }

    fotoSeleccionadaId = foto.id;

    tituloDetalle.textContent =
        foto.titulo;

    imagenDetalle.src =
        foto.imagen;

    imagenDetalle.alt =
        foto.titulo;

    reclutaDetalle.textContent =
        `${foto.reclutaNombre} (@${foto.reclutaNickname})`;

    grupoDetalle.textContent =
        `${foto.grupo} · ${foto.rama}`;

    actividadDetalle.textContent =
        foto.actividad;

    fechaDetalle.textContent =
        formatearFecha(
            foto.fechaActividad
        );

    descripcionDetalle.textContent =
        foto.descripcion;

    estadoDetalle.textContent =
        foto.estado;

    accionesDetalle.hidden =
        foto.estado !== "PENDIENTE";

    contenedorDetalle.hidden = false;

    contenedorDetalle.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}

function cerrarDetalle() {
    fotoSeleccionadaId = null;
    imagenDetalle.src = "";
    contenedorDetalle.hidden = true;
}

function aprobarFoto(idFoto) {
    const foto = fotos.find(
        function (elemento) {
            return elemento.id === idFoto;
        }
    );

    if (
        !foto ||
        foto.estado !== "PENDIENTE"
    ) {
        return;
    }

    const confirmar = confirm(
        `¿Deseas aprobar la fotografía "${foto.titulo}"?`
    );

    if (!confirmar) {
        return;
    }

    foto.estado = "APROBADA";
    foto.fechaRevision =
        new Date().toISOString();

    foto.revisadoPor =
        sessionStorage.getItem(
            "correoUsuario"
        ) || "Administrador";

    foto.motivoRevision = "";

    guardarFotos();
    sincronizarPendientesRecluta(
        foto.reclutaId
    );

    cerrarDetalle();
    mostrarFotos();

    alert(
        "La fotografía fue aprobada correctamente."
    );
}

function abrirFormularioRechazo(idFoto) {
    const foto = fotos.find(
        function (elemento) {
            return elemento.id === idFoto;
        }
    );

    if (
        !foto ||
        foto.estado !== "PENDIENTE"
    ) {
        return;
    }

    inputIdRechazo.value =
        foto.id;

    inputMotivoRechazo.value = "";
    contadorMotivo.textContent = "0";

    contenedorRechazo.hidden = false;

    contenedorRechazo.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    inputMotivoRechazo.focus();
}

function cerrarFormularioRechazo() {
    formularioRechazo.reset();
    inputIdRechazo.value = "";
    contadorMotivo.textContent = "0";
    contenedorRechazo.hidden = true;
}

function confirmarRechazo(evento) {
    evento.preventDefault();

    const idFoto =
        Number(inputIdRechazo.value);

    const motivo =
        inputMotivoRechazo.value.trim();

    const foto = fotos.find(
        function (elemento) {
            return elemento.id === idFoto;
        }
    );

    if (
        !foto ||
        foto.estado !== "PENDIENTE"
    ) {
        cerrarFormularioRechazo();
        return;
    }

    if (motivo.length < 10) {
        alert(
            "El motivo debe contener al menos 10 caracteres."
        );

        inputMotivoRechazo.focus();
        return;
    }

    foto.estado = "RECHAZADA";
    foto.motivoRevision = motivo;
    foto.fechaRevision =
        new Date().toISOString();

    foto.revisadoPor =
        sessionStorage.getItem(
            "correoUsuario"
        ) || "Administrador";

    guardarFotos();
    sincronizarPendientesRecluta(
        foto.reclutaId
    );

    cerrarFormularioRechazo();
    cerrarDetalle();
    mostrarFotos();

    alert(
        "La fotografía fue rechazada y el motivo quedó registrado."
    );
}

function sincronizarPendientesRecluta(
    idRecluta
) {
    const reclutas =
        cargarReclutas();

    const recluta =
        reclutas.find(
            function (elemento) {
                return String(elemento.id) ===
                    String(idRecluta);
            }
        );

    if (!recluta) {
        return;
    }

    recluta.fotosPendientes =
        fotos.filter(function (foto) {
            return (
                String(foto.reclutaId) ===
                    String(idRecluta) &&
                foto.estado === "PENDIENTE"
            );
        }).length;

    guardarReclutas(reclutas);
}

function limpiarFiltros() {
    buscador.value = "";
    filtroEstado.value = "TODAS";
    filtroGrupo.value = "TODOS";
    filtroRama.value = "TODAS";

    mostrarFotos();
}

function cerrarSesionAdmin() {
    if (
        !confirm(
            "¿Deseas cerrar tu sesión?"
        )
    ) {
        return;
    }

    sessionStorage.clear();

    window.location.replace(
        "login.html"
    );
}

buscador.addEventListener(
    "input",
    mostrarFotos
);

filtroEstado.addEventListener(
    "change",
    mostrarFotos
);

filtroGrupo.addEventListener(
    "change",
    mostrarFotos
);

filtroRama.addEventListener(
    "change",
    mostrarFotos
);

botonLimpiarFiltros.addEventListener(
    "click",
    limpiarFiltros
);

botonCerrarDetalle.addEventListener(
    "click",
    cerrarDetalle
);

botonAprobarDetalle.addEventListener(
    "click",
    function () {
        aprobarFoto(
            fotoSeleccionadaId
        );
    }
);

botonRechazarDetalle.addEventListener(
    "click",
    function () {
        abrirFormularioRechazo(
            fotoSeleccionadaId
        );
    }
);

botonCerrarRechazo.addEventListener(
    "click",
    cerrarFormularioRechazo
);

botonCancelarRechazo.addEventListener(
    "click",
    cerrarFormularioRechazo
);

inputMotivoRechazo.addEventListener(
    "input",
    function () {
        contadorMotivo.textContent =
            inputMotivoRechazo.value.length;
    }
);

formularioRechazo.addEventListener(
    "submit",
    confirmarRechazo
);

botonCerrarSesion.addEventListener(
    "click",
    function (evento) {
        evento.preventDefault();
        cerrarSesionAdmin();
    }
);

if (protegerModuloAdmin()) {
    cargarGrupos();
    mostrarFotos();
}