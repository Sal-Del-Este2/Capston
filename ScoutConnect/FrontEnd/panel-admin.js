const API_USUARIOS = "http://localhost:8080/usuarios";
const API_MENSAJES = "http://localhost:8080/mensajes";
const API_ACTIVIDADES = "http://localhost:8081/api";
const URL_EVENTOS = `${API_ACTIVIDADES}/eventos`;
const totalUsuarios = document.getElementById("total-usuarios");
const totalUsuariosAdmin = document.getElementById("total-usuarios-admin");
const cuotasPendientesAdmin = document.getElementById("cuotas-pendientes-admin");
const actividadesAdmin = document.getElementById("actividades-admin");
const mensajesAdmin = document.getElementById("mensajes-admin");
const botonCerrarSesionAdmin = document.getElementById("cerrar-sesion-admin");
const usuarioAdministradorId = Number(sessionStorage.getItem("usuarioId"));
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return { error: texto };}
}
async function cargarTotalUsuarios() {
    try {
        const respuesta = await fetchAutenticado(`${API_USUARIOS}/listar`);
        const usuarios = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(usuarios.error || "No se pudieron cargar los usuarios.");}
        const cantidad = Array.isArray(usuarios) ? usuarios.length : 0;
        totalUsuarios.textContent = cantidad;
        totalUsuariosAdmin.textContent = cantidad;
    } catch (error) {
        console.error("Error al cargar usuarios para el resumen:", error);
        totalUsuarios.textContent = "0";
        totalUsuariosAdmin.textContent = "0";
    }
}
async function cargarActividadesProximas() {
    try {
        const respuesta = await fetchAutenticado(URL_EVENTOS);
        const eventos = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(eventos.error || "No se pudieron cargar las actividades.");}
        const listaEventos = Array.isArray(eventos) ? eventos : [];
        const actividadesProximas = listaEventos.filter(function (evento) {return evento.estado === "PENDIENTE" || evento.estado === "EN_CURSO";});
        actividadesAdmin.textContent = actividadesProximas.length;
    } catch (error) {console.error("Error al cargar actividades para el resumen:", error); actividadesAdmin.textContent = "0";}
}
async function cargarMensajesNoLeidos() {
    try {
        const respuesta = await fetchAutenticado(`${API_MENSAJES}/recibidos`);
        const mensajes = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(mensajes.error || "No se pudieron cargar los mensajes.");}
        const listaMensajes = Array.isArray(mensajes) ? mensajes : [];
        const noLeidos = listaMensajes.filter(function (mensaje) {return mensaje.estado === "NO_LEIDO";});
        mensajesAdmin.textContent = noLeidos.length;
    } catch (error) {console.error("Error al cargar mensajes para el resumen:", error); mensajesAdmin.textContent = "0";}
}
async function cargarResumenAdministrativo() {
    await Promise.all([
        cargarTotalUsuarios(),
        cargarActividadesProximas(),
        cargarMensajesNoLeidos()
    ]);
}
if (botonCerrarSesionAdmin) {
    botonCerrarSesionAdmin.addEventListener("click", function (evento) {
        evento.preventDefault();
        const confirmarSalida = confirm("¿Deseas cerrar la sesión administrativa?");
        if (!confirmarSalida) {return;}
        sessionStorage.clear();
        window.location.replace("login.html");
    });
}
cargarResumenAdministrativo();