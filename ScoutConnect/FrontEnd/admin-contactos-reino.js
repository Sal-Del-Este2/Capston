const API_PAGINA_PUBLICA = "http://localhost:8083/api";
const API_USUARIOS = "http://localhost:8080/usuarios/listar";
const URL_CONTACTOS = `${API_PAGINA_PUBLICA}/contactos-reino`;
const URL_REINOS = `${API_PAGINA_PUBLICA}/catalogos/reinos`;
let contactos = [];
let reinos = [];
let usuarios = [];
const listaContactos = document.getElementById("lista-contactos");
const totalReinos = document.getElementById("total-reinos");
const reinosConRepresentante = document.getElementById("reinos-con-representante");
const reinosSinRepresentante = document.getElementById("reinos-sin-representante");
const sinResultados = document.getElementById("sin-resultados-contactos");
const botonNuevoContacto = document.getElementById("boton-nuevo-contacto");
const contenedorFormulario = document.getElementById("contenedor-formulario-contacto");
const formularioContacto = document.getElementById("form-contacto");
const tituloFormulario = document.getElementById("titulo-formulario-contacto");
const botonCerrarFormulario = document.getElementById("cerrar-formulario-contacto");
const botonCancelarFormulario = document.getElementById("cancelar-formulario-contacto");
const botonCerrarSesion = document.getElementById("cerrar-sesion-admin");
const campoContactoId = document.getElementById("contacto-id");
const campoReino = document.getElementById("reino-contacto");
const campoUsuario = document.getElementById("usuario-contacto");
const campoCargo = document.getElementById("cargo-contacto");
const campoCorreo = document.getElementById("correo-contacto");
const campoTelefono = document.getElementById("telefono-contacto");
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
async function cargarReinos() {
    try {
        const respuesta = await fetch(URL_REINOS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar los reinos.");}
        reinos = Array.isArray(data) ? data : [];
        campoReino.innerHTML = '<option value="">Seleccione un reino</option>';
        reinos.forEach(reino => {
            const opcion = document.createElement("option");
            opcion.value = reino.id;
            opcion.textContent = `${reino.nombre} - ${reino.comunaNombre}`;
            campoReino.appendChild(opcion);
        });
        actualizarIndicadores();
    } catch (error) {console.error("Error al cargar reinos:", error);alert(error.message);}
}
async function cargarUsuarios() {
    try {
        const respuesta = await fetchAutenticado(API_USUARIOS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar los usuarios.");}
        usuarios = Array.isArray(data) ? data : [];
        campoUsuario.innerHTML = '<option value="">Seleccione un usuario</option>';
        usuarios
            .filter(usuario => {const estado = usuario.estado?.nombre?.toLowerCase();return !estado || estado === "activo";})
            .forEach(usuario => {const opcion = document.createElement("option");
                opcion.value = usuario.id;
                opcion.textContent = `${usuario.nombre} (@${usuario.nickname})`;
                campoUsuario.appendChild(opcion);
            });
    } catch (error) {console.error("Error al cargar usuarios:", error); alert("No se pudieron cargar los usuarios.");}
}
async function cargarContactos() {
    try {
        const respuesta = await fetch(URL_CONTACTOS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar los contactos.");}
        contactos = Array.isArray(data) ? data : [];
        mostrarContactos();
    } catch (error) {console.error("Error al cargar contactos:", error);alert(error.message);}
}
function obtenerContactoActivoPorReino(idReino) {return contactos.find(contacto => contacto.reinoId === idReino && contacto.activo === true);}
function actualizarIndicadores() {const conRepresentante = reinos.filter(reino => obtenerContactoActivoPorReino(reino.id));
    totalReinos.textContent = reinos.length;
    reinosConRepresentante.textContent = conRepresentante.length;
    reinosSinRepresentante.textContent = reinos.length - conRepresentante.length;
}
function mostrarContactos() {listaContactos.innerHTML = "";
    if (reinos.length === 0) {sinResultados.hidden = false; sinResultados.textContent = "No hay reinos activos registrados."; return;}
    reinos.forEach(reino => {
        const contacto = obtenerContactoActivoPorReino(reino.id);
        const usuario = contacto ? usuarios.find(item => item.id === contacto.usuarioId) : null;
        const nombreRepresentante = usuario
            ? `${usuario.nombre} (@${usuario.nickname})`
            : contacto
                ? `Usuario ID ${contacto.usuarioId}`
                : "Sin representante";
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(reino.nombre)}</td>
            <td>${escaparHTML(reino.comunaNombre)}</td>
            <td>${escaparHTML(nombreRepresentante)}</td>
            <td>${escaparHTML(contacto?.cargo || "No definido")}</td>
            <td>${escaparHTML(contacto?.correo || "No definido")}</td>
            <td>${escaparHTML(contacto?.telefono || "No definido")}</td>
            <td>
                ${
                    contacto
                        ? `
                        <div class="acciones-tabla-admin">
                            <button type="button" class="boton-editar-admin" data-contacto-id="${contacto.id}">Editar</button>
                            <button type="button" class="boton-eliminar-admin" data-contacto-id="${contacto.id}"><img src="img/iconos/cerrar.svg" width="20px" alt="cerrar"></button>
                        `
                        : `
                            <button type="button" class="boton-asignar-admin" data-reino-id="${reino.id}">Asignar</button>
                        </div>
                        `
                }
            </td>
        `;
        listaContactos.appendChild(fila);
    });
    sinResultados.hidden = reinos.length !== 0;
    activarBotones();
    actualizarIndicadores();
}
function activarBotones() {
    document.querySelectorAll(".boton-asignar-admin").forEach(boton => {boton.addEventListener("click", () => {abrirFormularioNuevo(Number(boton.dataset.reinoId));});});
    document.querySelectorAll(".boton-editar-admin").forEach(boton => {boton.addEventListener("click", () => {abrirEdicionContacto(Number(boton.dataset.contactoId));});});
    document.querySelectorAll(".boton-eliminar-admin").forEach(boton => {boton.addEventListener("click", () => {quitarRepresentante(Number(boton.dataset.contactoId));});});
}
function abrirFormularioNuevo(idReino = "") {
    formularioContacto.reset();
    campoContactoId.value = "";
    campoReino.value = idReino || "";
    tituloFormulario.textContent = "Asignar representante";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function cerrarFormularioContacto() {
    formularioContacto.reset();
    campoContactoId.value = "";
    contenedorFormulario.hidden = true;
}
function abrirEdicionContacto(idContacto) {
    const contacto = contactos.find(item => item.id === idContacto);
    if (!contacto) {return;}
    tituloFormulario.textContent = "Editar representante";
    campoContactoId.value = contacto.id;
    campoReino.value = contacto.reinoId;
    campoUsuario.value = contacto.usuarioId;
    campoCargo.value = contacto.cargo ?? "";
    campoCorreo.value = contacto.correo ?? "";
    campoTelefono.value = contacto.telefono ?? "";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function validarFormulario() {
    if (!campoReino.value) {alert("Debe seleccionar un reino."); campoReino.focus(); return false;}
    if (!campoUsuario.value) {alert("Debe seleccionar un representante."); campoUsuario.focus(); return false;
    }return true;
}
function obtenerDatosContacto() {
    return {
        reinoId: Number(campoReino.value),
        usuarioId: Number(campoUsuario.value),
        cargo: campoCargo.value.trim(),
        correo: campoCorreo.value.trim(),
        telefono: campoTelefono.value.trim()
    };
}
async function guardarContacto(evento) {evento.preventDefault();
    if (!validarFormulario()) {return;}
    const idContacto = campoContactoId.value;
    const datos = obtenerDatosContacto();
    const url = idContacto ? `${URL_CONTACTOS}/${idContacto}` : URL_CONTACTOS;
    const metodo = idContacto ? "PUT" : "POST";
    try {
        const respuesta = await fetchAutenticado(url, {
            method: metodo,
            // headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        });
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {alert(data.error || data.message || "No se pudo guardar el representante."); return;}
        alert(idContacto ? "Representante actualizado correctamente." : "Representante asignado correctamente.");
        cerrarFormularioContacto();
        await cargarContactos();
    } catch (error) {console.error("Error al guardar contacto:", error); alert(error.message || "No se pudo conectar con el servidor.");}
}
async function quitarRepresentante(idContacto) {
    const contacto = contactos.find(item => item.id === idContacto);
    if (!contacto) {return;}
    const confirmacion = confirm(`¿Deseas quitar al representante del reino "${contacto.reinoNombre}"?`);
    if (!confirmacion) {return;}
    try {
        const respuesta = await fetchAutenticado(`${URL_CONTACTOS}/${idContacto}`, {method: "DELETE"});
        if (!respuesta.ok) {const data = await leerRespuesta(respuesta); alert(data.error || data.message || "No se pudo quitar el representante."); return;}
        alert("Representante quitado correctamente.");
        await cargarContactos();
    } catch (error) {console.error("Error al quitar representante:", error); alert("No se pudo conectar con el servidor.");}
}
botonNuevoContacto.addEventListener("click", () => abrirFormularioNuevo());
botonCerrarFormulario.addEventListener("click", cerrarFormularioContacto);
botonCancelarFormulario.addEventListener("click", cerrarFormularioContacto);
formularioContacto.addEventListener("submit", guardarContacto);
if (botonCerrarSesion) {botonCerrarSesion.addEventListener("click", function (evento) {evento.preventDefault(); sessionStorage.clear(); window.location.replace("login.html");});}
validarAccesoAdministrador();
async function iniciarPagina() {
    await cargarReinos();
    await cargarUsuarios();
    await cargarContactos();
}
iniciarPagina();