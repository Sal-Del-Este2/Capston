const API_PAGINA_PUBLICA = "http://localhost:8083/api";
const URL_UBICACIONES = `${API_PAGINA_PUBLICA}/ubicaciones`;
const URL_COMUNAS = `${API_PAGINA_PUBLICA}/catalogos/comunas`;
let ubicaciones = [];
let comunas = [];
const listaUbicaciones = document.getElementById("lista-ubicaciones");
const totalUbicaciones = document.getElementById("total-ubicaciones");
const ubicacionesActivas = document.getElementById("ubicaciones-activas");
const ubicacionesInactivas = document.getElementById("ubicaciones-inactivas");
const ubicacionesConCoordenadas = document.getElementById("ubicaciones-con-coordenadas");
const buscadorUbicacion = document.getElementById("buscar-ubicacion");
const filtroEstado = document.getElementById("filtro-estado-ubicacion");
const sinResultados = document.getElementById("sin-resultados-ubicaciones");
const botonNuevaUbicacion = document.getElementById("boton-nueva-ubicacion");
const contenedorFormulario = document.getElementById("contenedor-formulario-ubicacion");
const formularioUbicacion = document.getElementById("form-ubicacion");
const tituloFormulario = document.getElementById("titulo-formulario-ubicacion");
const botonCerrarFormulario = document.getElementById("cerrar-formulario-ubicacion");
const botonCancelarFormulario = document.getElementById("cancelar-formulario-ubicacion");
const campoNombre = document.getElementById("nombre-ubicacion");
const campoComuna = document.getElementById("comuna-ubicacion");
const campoDireccion = document.getElementById("direccion-ubicacion");
const campoEstado = document.getElementById("estado-ubicacion");
const campoLatitud = document.getElementById("latitud-ubicacion");
const campoLongitud = document.getElementById("longitud-ubicacion");
const campoDescripcion = document.getElementById("descripcion-ubicacion");
function validarAccesoAdministrador() {
    const autenticado = sessionStorage.getItem("usuarioAutenticado");
    const rol = (
        sessionStorage.getItem("rol") ||
        sessionStorage.getItem("rolUsuario") ||
        sessionStorage.getItem("perfil") ||
        ""
    ).trim().toLowerCase();
    if (autenticado !== "true" || rol !== "administrador") {window.location.replace("login.html");}
}
function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto ?? "");
    return elemento.innerHTML;
}
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return { error: texto };}
}
async function cargarComunas() {
    try {
        const respuesta = await fetch(URL_COMUNAS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar las comunas.");}
        comunas = Array.isArray(data) ? data : [];
        campoComuna.innerHTML = '<option value="">Seleccione una comuna</option>';
        comunas.forEach(comuna => {
            const opcion = document.createElement("option");
            opcion.value = comuna.id;
            opcion.textContent = `${comuna.nombre} - ${comuna.regionNombre}`;
            campoComuna.appendChild(opcion);
        });
    } catch (error) {console.error("Error al cargar comunas:", error);alert("No se pudieron cargar las comunas.");}
}
async function cargarUbicaciones() {
    try {
        const respuesta = await fetch(URL_UBICACIONES);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar las ubicaciones.");}
        ubicaciones = Array.isArray(data) ? data : [];
        mostrarUbicaciones();
    } catch (error) {console.error("Error al cargar ubicaciones:", error); alert("No se pudieron cargar las ubicaciones.");}
}
function actualizarIndicadores() {
    const activas = ubicaciones.filter(ubicacion => ubicacion.activo === true);
    const inactivas = ubicaciones.filter(ubicacion => ubicacion.activo === false);
    const conCoordenadas = ubicaciones.filter(ubicacion =>
        ubicacion.latitud !== null &&
        ubicacion.longitud !== null
    );
    totalUbicaciones.textContent = ubicaciones.length;
    ubicacionesActivas.textContent = activas.length;
    ubicacionesInactivas.textContent = inactivas.length;
    ubicacionesConCoordenadas.textContent = conCoordenadas.length;
}
function obtenerUbicacionesFiltradas() {
    const texto = buscadorUbicacion.value.trim().toLowerCase();
    const estado = filtroEstado.value.toLowerCase();
    return ubicaciones.filter(ubicacion => {const textoBusqueda = `
            ${ubicacion.nombre}
            ${ubicacion.direccion || ""}
            ${ubicacion.comunaNombre || ""}
        `.toLowerCase();
        const coincideTexto = textoBusqueda.includes(texto);
        const estadoUbicacion = ubicacion.activo ? "activa" : "inactiva";
        const coincideEstado = estado === "todos" || estadoUbicacion === estado;
        return coincideTexto && coincideEstado;
    });
}
function mostrarUbicaciones() {
    const ubicacionesFiltradas = obtenerUbicacionesFiltradas();
    listaUbicaciones.innerHTML = "";
    sinResultados.hidden = ubicacionesFiltradas.length !== 0;
    ubicacionesFiltradas.forEach(ubicacion => {
        const coordenadas = ubicacion.latitud && ubicacion.longitud ? `${ubicacion.latitud}, ${ubicacion.longitud}` : "No definidas";
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(ubicacion.nombre)}</td>
            <td>${escaparHTML(ubicacion.comunaNombre)}</td>
            <td>${escaparHTML(ubicacion.direccion || "Sin dirección")}</td>
            <td>${escaparHTML(coordenadas)}</td>
            <td>${ubicacion.activo ? "Activa" : "Inactiva"}</td>
            <td>
                <button type="button" class="boton-editar-admin" data-id="${ubicacion.id}">Editar</button>
                <button type="button" class="boton-eliminar-admin" data-id="${ubicacion.id}"><img src="img/iconos/cerrar.svg" width="30px" alt="cerrar"></button>
            </td>
        `;
        listaUbicaciones.appendChild(fila);
    });
    activarBotones();
    actualizarIndicadores();
}
function activarBotones() {
    document.querySelectorAll(".boton-editar-admin").forEach(boton => {boton.addEventListener("click", () => {abrirEdicionUbicacion(Number(boton.dataset.id));});});
    document.querySelectorAll(".boton-eliminar-admin").forEach(boton => {boton.addEventListener("click", () => {eliminarUbicacion(Number(boton.dataset.id));});});
}
function abrirFormularioNuevo() {
    formularioUbicacion.reset();
    document.getElementById("ubicacion-id").value = "";
    tituloFormulario.textContent = "Registrar ubicación";
    contenedorFormulario.hidden = false;
    campoNombre.focus();
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function cerrarFormularioUbicacion() {
    formularioUbicacion.reset();
    document.getElementById("ubicacion-id").value = "";
    contenedorFormulario.hidden = true;
}
function abrirEdicionUbicacion(idUbicacion) {
    const ubicacion = ubicaciones.find(item => item.id === idUbicacion);
    if (!ubicacion) {return;}
    tituloFormulario.textContent = "Editar ubicación";
    document.getElementById("ubicacion-id").value = ubicacion.id;
    campoNombre.value = ubicacion.nombre ?? "";
    campoComuna.value = ubicacion.comunaId ?? "";
    campoDireccion.value = ubicacion.direccion ?? "";
    campoEstado.value = ubicacion.activo ? "true" : "false";
    campoLatitud.value = ubicacion.latitud ?? "";
    campoLongitud.value = ubicacion.longitud ?? "";
    campoDescripcion.value = ubicacion.descripcion ?? "";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function validarFormulario() {
    if (!campoNombre.value.trim()) {alert("Debe ingresar el nombre de la ubicación."); campoNombre.focus(); return false;}
    if (!campoComuna.value) {alert("Debe seleccionar una comuna."); campoComuna.focus(); return false;
    }return true;
}
function obtenerDatosUbicacion() {
    return {
        nombre: campoNombre.value.trim(),
        descripcion: campoDescripcion.value.trim(),
        direccion: campoDireccion.value.trim(),
        comunaId: Number(campoComuna.value),
        latitud: campoLatitud.value ? Number(campoLatitud.value) : null,
        longitud: campoLongitud.value ? Number(campoLongitud.value) : null,
        activo: campoEstado.value === "true"
    };
}
async function guardarUbicacion(evento) {
    evento.preventDefault();
    if (!validarFormulario()) {return;}
    const idUbicacion = document.getElementById("ubicacion-id").value;
    const datos = obtenerDatosUbicacion();
    const url = idUbicacion ? `${URL_UBICACIONES}/${idUbicacion}` : URL_UBICACIONES;
    const metodo = idUbicacion ? "PUT" : "POST";
    try {
        const respuesta = await fetch(url, {method: metodo, headers: {"Content-Type": "application/json"},body: JSON.stringify(datos)});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {alert(data.error || data.message || "No se pudo guardar la ubicación.");return;}
        alert(idUbicacion ? "Ubicación actualizada correctamente." : "Ubicación creada correctamente.");
        cerrarFormularioUbicacion(); await cargarUbicaciones();
    } catch (error) {console.error("Error al guardar ubicación:", error);alert("No se pudo conectar con el servidor.");}
}
async function eliminarUbicacion(idUbicacion) {
    const ubicacion = ubicaciones.find(item => item.id === idUbicacion);
    if (!ubicacion) {return;}
    const confirmacion = confirm(`¿Deseas eliminar la ubicación "${ubicacion.nombre}"?`);
    if (!confirmacion) {return;}
    try {
        const respuesta = await fetch(`${URL_UBICACIONES}/${idUbicacion}`, {method: "DELETE"});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {alert(data.error || data.message || "No se pudo eliminar la ubicación.");return;}
        alert("Ubicación eliminada correctamente."); await cargarUbicaciones();
    } catch (error) {console.error("Error al eliminar ubicación:", error);alert("No se pudo conectar con el servidor.");}
}
const botonCerrarSesion = document.getElementById("cerrar-sesion-admin");
if (botonCerrarSesion) {botonCerrarSesion.addEventListener("click", function (evento) {
    evento.preventDefault(); sessionStorage.clear(); window.location.replace("login.html");});
}
buscadorUbicacion.addEventListener("input", mostrarUbicaciones);
filtroEstado.addEventListener("change", mostrarUbicaciones);
botonNuevaUbicacion.addEventListener("click", abrirFormularioNuevo);
botonCerrarFormulario.addEventListener("click", cerrarFormularioUbicacion);
botonCancelarFormulario.addEventListener("click", cerrarFormularioUbicacion);
formularioUbicacion.addEventListener("submit", guardarUbicacion);
validarAccesoAdministrador();
async function iniciarPagina() {await cargarComunas(); await cargarUbicaciones();}
iniciarPagina();