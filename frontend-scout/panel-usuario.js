const usuarioAutenticado =
    sessionStorage.getItem("usuarioAutenticado");

const correoUsuario =
    sessionStorage.getItem("correoUsuario");

const rolUsuario =
    sessionStorage.getItem("rolUsuario");

const botonCerrarSesion =
    document.getElementById("cerrar-sesion");

/*
 * Proteger las páginas del usuario.
 * Temporalmente aceptamos sesiones antiguas que todavía
 * no tienen guardado el rol.
 */
if (
    usuarioAutenticado !== "true" ||
    !correoUsuario
) {
    window.location.replace("login.html");
}

/*
 * Si existe un rol, debe corresponder a un usuario adulto.
 * Las sesiones antiguas sin rol continúan funcionando.
 */
if (
    rolUsuario &&
    rolUsuario !== "USUARIO"
) {
    if (rolUsuario === "ADMINISTRADOR") {
        window.location.replace("panel-admin.html");
    } else if (rolUsuario === "RECLUTA") {
        window.location.replace("panel-recluta.html");
    } else {
        cerrarSesion();
    }
}

function cerrarSesion() {
    sessionStorage.removeItem("usuarioAutenticado");
    sessionStorage.removeItem("correoUsuario");
    sessionStorage.removeItem("usuarioId");
    sessionStorage.removeItem("rolUsuario");
    sessionStorage.removeItem("rolTemporal");
    sessionStorage.removeItem("reclutaSeleccionadoId");

    window.location.replace("login.html");
}

if (botonCerrarSesion) {
    botonCerrarSesion.addEventListener(
        "click",
        function (evento) {
            evento.preventDefault();

            const confirmarCierre = confirm(
                "¿Deseas cerrar tu sesión?"
            );

            if (confirmarCierre) {
                cerrarSesion();
            }
        }
    );
}