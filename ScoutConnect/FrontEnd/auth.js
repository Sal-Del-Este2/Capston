const API_BASE = "http://localhost:8080";
function obtenerToken() {return sessionStorage.getItem("tokenUsuario") || "";}
function obtenerHeadersJSON() {return {"Content-Type": "application/json", "Authorization": "Bearer " + obtenerToken()};}
function obtenerHeadersAuth() {return {"Authorization": "Bearer " + obtenerToken()};}
async function fetchAutenticado(url, opciones = {}) {
    const token = obtenerToken();
    if (!token) {sessionStorage.clear(); window.location.href = "login.html"; throw new Error("Sesión no válida.");}
    const headers = new Headers(opciones.headers || {});
    headers.set("Authorization", "Bearer " + token);
    return fetch(url, { ...opciones, headers });
}
function cerrarSesionCompleta() {sessionStorage.clear(); window.location.href = "login.html";}