const API_PAGINA_PUBLICA = "http://localhost:8083/api";
const URL_POLITICAS = `${API_PAGINA_PUBLICA}/politicas`;
const URL_TIPOS_POLITICA = `${API_PAGINA_PUBLICA}/catalogos/tipos-politica`;
let politicas = [];
let tiposPolitica = [];
const listaPoliticas = document.getElementById("lista-politicas");
const totalPoliticas = document.getElementById("total-politicas");
const politicasPublicadas = document.getElementById("politicas-publicadas");
const politicasNoPublicadas = document.getElementById("politicas-no-publicadas");
const buscadorPolitica = document.getElementById("buscar-politica");
const filtroEstado = document.getElementById("filtro-estado-politica");
const sinResultados = document.getElementById("sin-resultados-politicas");
const botonNuevaPolitica = document.getElementById("boton-nueva-politica");
const contenedorFormulario = document.getElementById("contenedor-formulario-politica");
const formularioPolitica = document.getElementById("form-politica");
const tituloFormulario = document.getElementById("titulo-formulario-politica");
const botonCerrarFormulario = document.getElementById("cerrar-formulario-politica");
const botonCancelarFormulario = document.getElementById("cancelar-formulario-politica");
const botonCerrarSesion = document.getElementById("cerrar-sesion-admin");
const campoPoliticaId = document.getElementById("politica-id");
const campoTipo = document.getElementById("tipo-politica");
const campoTitulo = document.getElementById("titulo-politica");
const campoContenido = document.getElementById("contenido-politica");
const campoEstado = document.getElementById("estado-politica");
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
    const elemento = document.createElement("div"); elemento.textContent = String(texto ?? ""); return elemento.innerHTML;}
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return { error: texto };}
}
async function cargarTiposPolitica() {
    try {
        const respuesta = await fetch(URL_TIPOS_POLITICA);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar los tipos de política.");}
        tiposPolitica = Array.isArray(data) ? data : [];
        campoTipo.innerHTML = '<option value="">Seleccione un tipo</option>';
        tiposPolitica.forEach(tipo => {
            const opcion = document.createElement("option");
            opcion.value = tipo.id;
            opcion.textContent = tipo.nombre;
            campoTipo.appendChild(opcion);
        });
    } catch (error) {console.error("Error al cargar tipos de política:", error); alert(error.message);}
}
async function cargarPoliticas() {
    try {
        const respuesta = await fetchAutenticado(URL_POLITICAS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar las políticas.");}
        politicas = Array.isArray(data) ? data : [];
        mostrarPoliticas();
    } catch (error) {console.error("Error al cargar políticas:", error); alert(error.message || "No se pudieron cargar las políticas.");}
}
function actualizarIndicadores() {
    const publicadas = politicas.filter(politica => politica.publicada === true);
    const noPublicadas = politicas.filter(politica => politica.publicada === false);
    totalPoliticas.textContent = politicas.length;
    politicasPublicadas.textContent = publicadas.length;
    politicasNoPublicadas.textContent = noPublicadas.length;
}
function obtenerPoliticasFiltradas() {
    const texto = buscadorPolitica.value.trim().toLowerCase();
    const estado = filtroEstado.value;
    return politicas.filter(politica => {
        const textoBusqueda = `
            ${politica.titulo}
            ${politica.contenido}
            ${politica.tipoPoliticaNombre || ""}
        `.toLowerCase();
        const coincideTexto = textoBusqueda.includes(texto);
        const coincideEstado = estado === "todos" || (estado === "publicada" && politica.publicada === true) || (estado === "no-publicada" && politica.publicada === false);
        return coincideTexto && coincideEstado;
    });
}
function formatearFecha(fecha) {if (!fecha) {return "Sin actualización";} return new Date(fecha).toLocaleString("es-CL");}
function mostrarPoliticas() {
    const politicasFiltradas = obtenerPoliticasFiltradas();
    listaPoliticas.innerHTML = "";
    sinResultados.hidden = politicasFiltradas.length !== 0;
    politicasFiltradas.forEach(politica => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(politica.titulo)}</td>
            <td>${escaparHTML(politica.tipoPoliticaNombre)}</td>
            <td>${escaparHTML(politica.version)}</td>
            <td>${politica.publicada ? "Publicada" : "No publicada"}</td>
            <td>${escaparHTML(formatearFecha(politica.fechaActualizacion))}</td>
            <td>
                <button type="button" class="boton-editar-admin" data-id="${politica.id}">Editar</button>
                <button type="button" class="boton-despublicar-admin" data-id="${politica.id}"> ${politica.publicada ? "Despublicar" : "Publicar"}</button>
            </td>
        `;
        listaPoliticas.appendChild(fila);
    });
    activarBotones();
    actualizarIndicadores();
}
function activarBotones() {
    document.querySelectorAll(".boton-editar-admin").forEach(boton => {boton.addEventListener("click", () => {abrirEdicionPolitica(Number(boton.dataset.id));});});
    document.querySelectorAll(".boton-despublicar-admin").forEach(boton => {boton.addEventListener("click", () => {cambiarPublicacion(Number(boton.dataset.id));});});
}
function abrirFormularioNuevo() {
    formularioPolitica.reset();
    campoPoliticaId.value = "";
    tituloFormulario.textContent = "Crear política";
    contenedorFormulario.hidden = false;
    campoTitulo.focus();
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function cerrarFormularioPolitica() {
    formularioPolitica.reset();
    campoPoliticaId.value = "";
    contenedorFormulario.hidden = true;
}
function abrirEdicionPolitica(idPolitica) {
    const politica = politicas.find(item => item.id === idPolitica);
    if (!politica) {return;}
    tituloFormulario.textContent = "Editar política";
    campoPoliticaId.value = politica.id;
    campoTipo.value = politica.tipoPoliticaId;
    campoTitulo.value = politica.titulo;
    campoContenido.value = politica.contenido;
    campoEstado.value = politica.publicada ? "true" : "false";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function validarFormulario() {
    if (!campoTipo.value) {alert("Debe seleccionar un tipo de política."); campoTipo.focus(); return false;}
    if (!campoTitulo.value.trim()) {alert("Debe ingresar el título de la política."); campoTitulo.focus(); return false;}
    if (!campoContenido.value.trim()) {alert("Debe ingresar el contenido de la política."); campoContenido.focus(); return false;
    }return true;
}
function obtenerDatosPolitica() {
    return {
        tipoPoliticaId: Number(campoTipo.value),
        titulo: campoTitulo.value.trim(),
        contenido: campoContenido.value.trim(),
        publicada: campoEstado.value === "true"
    };
}
async function guardarPolitica(evento) {
    evento.preventDefault();
    if (!validarFormulario()) {return;}
    const idPolitica = campoPoliticaId.value;
    const datos = obtenerDatosPolitica();
    const url = idPolitica ? `${URL_POLITICAS}/${idPolitica}` : URL_POLITICAS;
    const metodo = idPolitica ? "PUT" : "POST";
    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            // headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        });
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {alert(data.error || data.message || "No se pudo guardar la política.");
            return;
        }
        alert(idPolitica ? "Política actualizada correctamente." : "Política creada correctamente.");
        cerrarFormularioPolitica();
        await cargarPoliticas();
    } catch (error) {console.error("Error al guardar política:", error); alert(error.message || "No se pudo conectar con el servidor.");}
}
async function cambiarPublicacion(idPolitica) {
    const politica = politicas.find(item => item.id === idPolitica);
    if (!politica) {return;}
    const nuevaPublicacion = !politica.publicada;
    const confirmacion = confirm(nuevaPublicacion
        ? `¿Deseas publicar la política "${politica.titulo}"?`
        : `¿Deseas despublicar la política "${politica.titulo}"?`
    );
    if (!confirmacion) {return;}
    try {
        const respuesta = await fetchAutenticado(`${URL_POLITICAS}/${idPolitica}/publicar?publicada=${nuevaPublicacion}`,
            { method: "PATCH" }
        );
        if (!respuesta.ok) {const data = await leerRespuesta(respuesta);
            alert(data.error || data.message || "No se pudo cambiar el estado de la política.");
            return;
        }
        alert(nuevaPublicacion ? "Política publicada correctamente." : "Política despublicada correctamente.");
        await cargarPoliticas();
    } catch (error) {console.error("Error al cambiar publicación:", error); alert(error.message || "No se pudo conectar con el servidor.");}
}
buscadorPolitica.addEventListener("input", mostrarPoliticas);
filtroEstado.addEventListener("change", mostrarPoliticas);
botonNuevaPolitica.addEventListener("click", abrirFormularioNuevo);
botonCerrarFormulario.addEventListener("click", cerrarFormularioPolitica);
botonCancelarFormulario.addEventListener("click", cerrarFormularioPolitica);
formularioPolitica.addEventListener("submit", guardarPolitica);
if (botonCerrarSesion) {botonCerrarSesion.addEventListener("click", function (evento) {evento.preventDefault(); sessionStorage.clear(); window.location.replace("login.html");});}
validarAccesoAdministrador();
async function iniciarPagina() {await cargarTiposPolitica(); await cargarPoliticas();}
iniciarPagina();