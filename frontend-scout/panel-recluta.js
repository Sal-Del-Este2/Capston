const CLAVE_RECLUTAS = "reclutasScout";

const nombreReclutaPanel =
    document.getElementById(
        "nombre-recluta-panel"
    );

const nicknameReclutaPanel =
    document.getElementById(
        "nickname-recluta-panel"
    );

const grupoReclutaPanel =
    document.getElementById(
        "grupo-recluta-panel"
    );

const ramaReclutaPanel =
    document.getElementById(
        "rama-recluta-panel"
    );

const botonSalirPanelRecluta =
    document.getElementById(
        "salir-panel-recluta"
    );

function cargarReclutas() {
    try {
        const datosGuardados =
            JSON.parse(
                localStorage.getItem(
                    CLAVE_RECLUTAS
                )
            );

        return Array.isArray(datosGuardados)
            ? datosGuardados
            : [];
    } catch (error) {
        console.error(
            "No fue posible cargar los reclutas:",
            error
        );

        return [];
    }
}

function obtenerReclutaSeleccionado() {
    const idRecluta =
        sessionStorage.getItem(
            "reclutaSeleccionadoId"
        );

    if (!idRecluta) {
        return null;
    }

    const reclutas = cargarReclutas();

    return reclutas.find(function (recluta) {
        return String(recluta.id) ===
            String(idRecluta);
    }) || null;
}

function obtenerTipoAcceso() {
    const usuarioAutenticado =
        sessionStorage.getItem(
            "usuarioAutenticado"
        );

    const rolUsuario =
        sessionStorage.getItem(
            "rolUsuario"
        );

    const rolTemporal =
        sessionStorage.getItem(
            "rolTemporal"
        );

    if (usuarioAutenticado !== "true") {
        return null;
    }

    /*
     * El apoderado ingresa temporalmente
     * al perfil de uno de sus reclutas.
     */
    if (
        rolUsuario === "USUARIO" &&
        rolTemporal === "RECLUTA"
    ) {
        return "APODERADO";
    }

    /*
     * El recluta ingresa directamente
     * mediante su nickname.
     */
    if (rolUsuario === "RECLUTA") {
        return "RECLUTA";
    }

    return null;
}

function perteneceAlApoderado(recluta) {
    const rolUsuario =
        sessionStorage.getItem(
            "rolUsuario"
        );

    if (rolUsuario !== "USUARIO") {
        return true;
    }

    const usuarioId =
        sessionStorage.getItem(
            "usuarioId"
        );

    const correoUsuario =
        sessionStorage.getItem(
            "correoUsuario"
        );

    return (
        String(recluta.apoderadoId) ===
            String(usuarioId) ||
        recluta.apoderadoCorreo ===
            correoUsuario
    );
}

function volverAlAccesoCorrespondiente() {
    const rolUsuario =
        sessionStorage.getItem(
            "rolUsuario"
        );

    if (rolUsuario === "USUARIO") {
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

    cerrarSesionRecluta();
}

function cerrarSesionRecluta() {
    sessionStorage.removeItem(
        "usuarioAutenticado"
    );

    sessionStorage.removeItem(
        "correoUsuario"
    );

    sessionStorage.removeItem(
        "usuarioId"
    );

    sessionStorage.removeItem(
        "rolUsuario"
    );

    sessionStorage.removeItem(
        "rolTemporal"
    );

    sessionStorage.removeItem(
        "reclutaSeleccionadoId"
    );

    window.location.replace("login.html");
}

function protegerPanelRecluta() {
    const tipoAcceso =
        obtenerTipoAcceso();

    if (!tipoAcceso) {
        window.location.replace(
            "login.html"
        );

        return null;
    }

    const recluta =
        obtenerReclutaSeleccionado();

    if (!recluta) {
        alert(
            "No se encontró el perfil del recluta."
        );

        volverAlAccesoCorrespondiente();
        return null;
    }

    if (!perteneceAlApoderado(recluta)) {
        alert(
            "No tienes autorización para acceder " +
            "a este perfil."
        );

        volverAlAccesoCorrespondiente();
        return null;
    }

    if (recluta.estado !== "Activo") {
        alert(
            "Esta cuenta se encuentra inactiva."
        );

        volverAlAccesoCorrespondiente();
        return null;
    }

    return recluta;
}

function mostrarDatosRecluta(recluta) {
    nombreReclutaPanel.textContent =
        recluta.nombre || "Recluta";

    nicknameReclutaPanel.textContent =
        `@${recluta.nickname || "recluta"}`;

    grupoReclutaPanel.textContent =
        recluta.grupo || "Sin información";

    ramaReclutaPanel.textContent =
        recluta.rama || "Sin información";

    document.title =
        `${recluta.nombre} | Comunidad Scout`;
}

if (botonSalirPanelRecluta) {
    botonSalirPanelRecluta.addEventListener(
        "click",
        function (evento) {
            evento.preventDefault();

            const rolUsuario =
                sessionStorage.getItem(
                    "rolUsuario"
                );

            if (rolUsuario === "USUARIO") {
                volverAlAccesoCorrespondiente();
                return;
            }

            const confirmarSalida = confirm(
                "¿Deseas cerrar tu sesión?"
            );

            if (confirmarSalida) {
                cerrarSesionRecluta();
            }
        }
    );
}

const reclutaActual =
    protegerPanelRecluta();

if (reclutaActual) {
    mostrarDatosRecluta(
        reclutaActual
    );
}