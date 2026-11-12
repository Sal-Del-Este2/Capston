const API_BASE = "http://localhost:8080";
function obtenerToken() {return sessionStorage.getItem("tokenUsuario") || sessionStorage.getItem("token") || "";}
function decodificarPayloadJWT(token) {
    try {
        const partes = token.split(".");
        if (partes.length !== 3) {return null;}
        const payloadBase64 = partes[1].replace(/-/g, "+").replace(/_/g, "/");
        const payloadJSON = decodeURIComponent(atob(payloadBase64).split("").map(caracter => "%" + ("00" + caracter.charCodeAt(0).toString(16)).slice(-2)).join(""));
        return JSON.parse(payloadJSON);
    } catch (error) {return null;}
}
function tokenExpirado() {
    const token = obtenerToken();
    if (!token) {return true;}
    const payload = decodificarPayloadJWT(token);
    if (!payload || !payload.exp) {return true;}
    return payload.exp * 1000 <= Date.now();
}
function cerrarSesionCompleta() {sessionStorage.clear(); window.location.href = "login.html";}
function validarSesionActiva() {
    if (tokenExpirado()) {sessionStorage.clear();
        alert("Tu sesión ha expirado. Debes iniciar sesión nuevamente.");
        window.location.href = "login.html";
        return false;
    }return true;
}
function obtenerHeadersJSON() {return {"Content-Type": "application/json", "Authorization": "Bearer " + obtenerToken()};}
function obtenerHeadersAuth() {return {"Authorization": "Bearer " + obtenerToken()};}
async function fetchAutenticado(url, opciones = {}) {
    if (!validarSesionActiva()) {throw new Error("Sesión expirada.");}
    const token = obtenerToken();
    const headers = new Headers(opciones.headers || {});
    headers.set("Authorization", "Bearer " + token);
    const esFormData = opciones.body instanceof FormData;
    if (opciones.body  && !esFormData && !headers.has("Content-Type")) {headers.set("Content-Type", "application/json");}
    const respuesta = await fetch(url, {...opciones,headers});
    if (respuesta.status === 401) {sessionStorage.clear();
        alert("Tu sesión ha expirado. Debes iniciar sesión nuevamente.");
        window.location.href = "../html/login.html";
        throw new Error("Sesión expirada.");
    }
    if (respuesta.status === 403) {
        // console.error("Acceso denegado en:", url); // no eliminar
        throw new Error(`No tienes permisos para realizar esta acción. (${url})`);}
    return respuesta;
}
document.addEventListener("DOMContentLoaded", function () {
    const paginaActual = window.location.pathname.split("/").pop();
    const paginasProtegidas = [
        "../html/panel-usuario.html",
        "../html/panel-recluta.html",
        "../html/panel-admin.html",
        "../html/perfil-usuario.html",
        "../html/estado-cuotas.html",
        "../html/mis-compras.html",
        "../html/mensaje.html",
        "../html/mis-actividades.html",
        "../html/pagos-donaciones.html",
        "../html/admin-usuarios.html",
        "../html/admin-cuotas.html",
        "../html/admin-noticias.html",
        "../html/admin-eventos.html",
        "../html/admin-tienda.html",
        "../html/admin-mensajes.html",
        "../html/admin-pagos.html",
        "../html/admin-reportes.html",
        "../html/admin-ubicaciones.html",
        "../html/admin-informacion.html",
        "../html/admin-contactos-reino.html",
        "../html/admin-politicas.html"
    ];
    if (paginasProtegidas.includes(paginaActual)) {validarSesionActiva();}
});