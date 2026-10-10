function obtenerRolActual() {return String(sessionStorage.getItem("rolUsuario") || "").trim().toLowerCase();}
function existeSesionValida() {
    const autenticado = sessionStorage.getItem("usuarioAutenticado") === "true";
    const usuarioId = sessionStorage.getItem("usuarioId");
    const rol = obtenerRolActual();
    return autenticado && Boolean(usuarioId) && Boolean(rol);
}
function redirigirALogin() {sessionStorage.clear();
    window.location.replace("login.html");
}
function protegerPagina(rolesPermitidos) {
    if (!existeSesionValida()) {redirigirALogin(); return false;}
    const rolActual = obtenerRolActual();
    const rolesNormalizados = rolesPermitidos.map(function (rol) {return String(rol).trim().toLowerCase();});
    if (!rolesNormalizados.includes(rolActual)) {alert("No tienes autorización para acceder " + "a esta página.");redirigirSegunRol(); return false;}
    return true;
}
function redirigirSegunRol() {
    const rol = obtenerRolActual();
    if (rol === "administrador") {window.location.replace("panel-admin.html");return;}
    if (rol === "dirigente") {window.location.replace("panel-recluta.html");return;}
    if (rol === "recluta") {window.location.replace("panel-recluta.html");return;}
    if (rol === "apoderado") {window.location.replace("panel-usuario.html");return;}
    redirigirALogin();
}
function cerrarSesion() {sessionStorage.clear(); window.location.replace("login.html");}
function configurarCerrarSesion() {
    const enlacesCerrarSesion = document.querySelectorAll("#cerrar-sesion, " + "#cerrar-sesion-admin, " + "#salir-panel-recluta");
    enlacesCerrarSesion.forEach(function (enlace) {enlace.addEventListener("click", function (evento) {evento.preventDefault();
                // const confirmar = confirm("¿Deseas cerrar tu sesión?");
                // if (confirmar) {cerrarSesion();}
            }
        );
    });
}