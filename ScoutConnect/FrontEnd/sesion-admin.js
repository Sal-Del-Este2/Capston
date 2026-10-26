const TIEMPO_INACTIVIDAD_ADMIN = 5 * 60 * 1000;
function obtenerRolSesion() {
    return (
        sessionStorage.getItem("rol") ||
        sessionStorage.getItem("rolUsuario") ||
        sessionStorage.getItem("perfil") ||
        ""
    ).trim().toLowerCase();
}
function esAdministradorActivo() {return (sessionStorage.getItem("usuarioAutenticado") === "true" && obtenerRolSesion() === "administrador");}
function cerrarSesionPorInactividad() {sessionStorage.clear();
    alert("Tu sesión administrativa se cerró por inactividad.");
    window.location.replace("login.html");
}
function reiniciarTemporizadorInactividad() {
    if (!esAdministradorActivo()) {return;}
    sessionStorage.setItem("ultimaActividadAdmin", Date.now().toString());
    clearTimeout(window.temporizadorInactividadAdmin);
    window.temporizadorInactividadAdmin = setTimeout(cerrarSesionPorInactividad, TIEMPO_INACTIVIDAD_ADMIN);
}
function validarSesionAdministrador() {
    if (!esAdministradorActivo()) {window.location.replace("login.html"); return false;}
    const ultimaActividad = Number(sessionStorage.getItem("ultimaActividadAdmin") || 0);
    if (ultimaActividad && Date.now() - ultimaActividad > TIEMPO_INACTIVIDAD_ADMIN) {cerrarSesionPorInactividad(); return false;}
    reiniciarTemporizadorInactividad();
    return true;
}
[
    "click",
    "keydown",
    "mousemove",
    "touchstart",
    "scroll",
    "submit",
    "change"
].forEach(evento => {document.addEventListener(evento, reiniciarTemporizadorInactividad, {passive: true});});
return true;
validarSesionAdministrador();