const CLAVE_RECLUTAS = "reclutasScout";

const nombrePerfil =
    document.getElementById(
        "nombre-perfil-recluta"
    );

const nicknamePerfil =
    document.getElementById(
        "nickname-perfil-recluta"
    );

const estadoPerfil =
    document.getElementById(
        "estado-perfil-recluta"
    );

const datoNombre =
    document.getElementById(
        "dato-nombre-recluta"
    );

const datoNickname =
    document.getElementById(
        "dato-nickname-recluta"
    );

const datoNacimiento =
    document.getElementById(
        "dato-nacimiento-recluta"
    );

const datoEdad =
    document.getElementById(
        "dato-edad-recluta"
    );

const datoGrupo =
    document.getElementById(
        "dato-grupo-recluta"
    );

const datoRama =
    document.getElementById(
        "dato-rama-recluta"
    );

const datoApoderado =
    document.getElementById(
        "dato-apoderado-recluta"
    );

const datoContacto =
    document.getElementById(
        "dato-contacto-recluta"
    );

const datoTelefono =
    document.getElementById(
        "dato-telefono-recluta"
    );

const botonSalir =
    document.getElementById(
        "salir-perfil-recluta"
    );

function cargarReclutas() {
    try {
        const datos =
            JSON.parse(
                localStorage.getItem(
                    CLAVE_RECLUTAS
                )
            );

        return Array.isArray(datos)
            ? datos
            : [];
    } catch (error) {
        console.error(
            "No fue posible cargar los reclutas:",
            error
        );

        return [];
    }
}

function obtenerReclutaActual() {
    const idRecluta =
        sessionStorage.getItem(
            "reclutaSeleccionadoId"
        );

    if (!idRecluta) {
        return null;
    }

    return cargarReclutas().find(
        function (recluta) {
            return String(recluta.id) ===
                String(idRecluta);
        }
    ) || null;
}

function sesionReclutaValida() {
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

function formatearFecha(fecha) {
    if (!fecha) {
        return "Sin información";
    }

    const fechaCompleta =
        new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(fechaCompleta.getTime())) {
        return "Sin información";
    }

    return fechaCompleta.toLocaleDateString(
        "es-CL",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        }
    );
}

function calcularEdad(fecha) {
    if (!fecha) {
        return null;
    }

    const nacimiento =
        new Date(`${fecha}T00:00:00`);

    if (Number.isNaN(nacimiento.getTime())) {
        return null;
    }

    const hoy = new Date();

    let edad =
        hoy.getFullYear() -
        nacimiento.getFullYear();

    const diferenciaMes =
        hoy.getMonth() -
        nacimiento.getMonth();

    if (
        diferenciaMes < 0 ||
        (
            diferenciaMes === 0 &&
            hoy.getDate() <
                nacimiento.getDate()
        )
    ) {
        edad--;
    }

    return edad;
}

function mostrarPerfil(recluta) {
    const nombre =
        recluta.nombre ||
        "Sin información";

    const nickname =
        recluta.nickname
            ? `@${recluta.nickname}`
            : "Sin información";

    const edad =
        calcularEdad(
            recluta.fechaNacimiento
        );

    nombrePerfil.textContent =
        nombre;

    nicknamePerfil.textContent =
        nickname;

    estadoPerfil.textContent =
        recluta.estado ||
        "Sin información";

    estadoPerfil.classList.remove(
        "estado-perfil-activo",
        "estado-perfil-inactivo"
    );

    if (recluta.estado === "Activo") {
        estadoPerfil.classList.add(
            "estado-perfil-activo"
        );
    } else {
        estadoPerfil.classList.add(
            "estado-perfil-inactivo"
        );
    }

    datoNombre.textContent =
        nombre;

    datoNickname.textContent =
        nickname;

    datoNacimiento.textContent =
        formatearFecha(
            recluta.fechaNacimiento
        );

    datoEdad.textContent =
        edad === null
            ? "Sin información"
            : `${edad} años`;

    datoGrupo.textContent =
        recluta.grupo ||
        "Sin información";

    datoRama.textContent =
        recluta.rama ||
        "Sin información";

    datoApoderado.textContent =
        recluta.apoderadoCorreo ||
        "Sin información";

    datoContacto.textContent =
        recluta.contactoEmergencia ||
        "Sin información";

    datoTelefono.textContent =
        recluta.telefonoEmergencia ||
        "Sin información";

    document.title =
        `${nombre} | Comunidad Scout`;
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

    window.location.replace(
        "login.html"
    );
}

function iniciarPerfil() {
    if (!sesionReclutaValida()) {
        window.location.replace(
            "login.html"
        );

        return;
    }

    const recluta =
        obtenerReclutaActual();

    if (!recluta) {
        alert(
            "No se encontró el perfil del recluta."
        );

        regresarAccesoAnterior();
        return;
    }

    if (!perteneceAlApoderado(recluta)) {
        alert(
            "No tienes autorización para ver este perfil."
        );

        regresarAccesoAnterior();
        return;
    }

    if (recluta.estado !== "Activo") {
        alert(
            "Esta cuenta se encuentra inactiva."
        );

        regresarAccesoAnterior();
        return;
    }

    mostrarPerfil(recluta);
}

if (botonSalir) {
    botonSalir.addEventListener(
        "click",
        function (evento) {
            evento.preventDefault();

            const rol =
                sessionStorage.getItem(
                    "rolUsuario"
                );

            if (rol === "USUARIO") {
                regresarAccesoAnterior();
                return;
            }

            const confirmar = confirm(
                "¿Deseas cerrar tu sesión?"
            );

            if (confirmar) {
                cerrarSesion();
            }
        }
    );
}

iniciarPerfil();