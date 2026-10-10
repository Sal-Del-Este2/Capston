const API_ACTIVIDADES = "http://localhost:8081/api";
const URL_NOTICIAS = `${API_ACTIVIDADES}/noticias`;
const usuarioAdministradorId = Number(sessionStorage.getItem("usuarioId"));
let noticias = [];
const listaNoticias = document.getElementById("lista-noticias-admin");
const totalNoticias = document.getElementById("total-noticias-admin");
const noticiasPendientes = document.getElementById("noticias-pendientes-admin");
const noticiasCurso = document.getElementById("noticias-curso-admin");
const noticiasFinalizadas = document.getElementById("noticias-finalizadas-admin");
const buscarNoticia = document.getElementById("buscar-noticia");
const filtroEstado = document.getElementById("filtro-estado-noticia");
const sinResultados = document.getElementById("sin-resultados-noticias");
const botonNuevaNoticia = document.getElementById("boton-nueva-noticia");
const contenedorFormulario = document.getElementById("contenedor-formulario-noticia");
const formularioNoticia = document.getElementById("form-noticia");
const tituloFormulario = document.getElementById("titulo-formulario-noticia");
const cerrarFormulario = document.getElementById("cerrar-formulario-noticia");
const cancelarFormulario = document.getElementById("cancelar-formulario-noticia");
const campoId = document.getElementById("noticia-id");
const campoTitulo = document.getElementById("titulo-noticia");
const campoFecha = document.getElementById("fecha-noticia");
const campoLugar = document.getElementById("lugar-noticia");
const campoEstado = document.getElementById("estado-noticia");
const campoDetalle = document.getElementById("detalle-noticia");
function escaparHTML(texto) {const elemento = document.createElement("div"); elemento.textContent = String(texto ?? ""); return elemento.innerHTML}
async function leerRespuesta(respuesta) {const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {
        return {error: texto};
    }
}
function obtenerNombreEstado(estado) {const estados = {
    PENDIENTE: "Pendiente",
    EN_CURSO: "En curso",
    FINALIZADA: "Finalizada"
    };return estados[estado] || estado;
}
function obtenerClaseEstado(estado) {
    if (estado === "FINALIZADA") {return "estado-finalizada-admin";}
    if (estado === "EN_CURSO") {return "estado-activo-admin";}
    return "estado-inactivo-admin";
}
function formatearFecha(fecha) {
    if (!fecha) {return "";}
    const partes = fecha.split("-");
    if (partes.length !== 3) {return fecha;}
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
async function cargarNoticias() {
    try {
        const respuesta = await fetch(URL_NOTICIAS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar las noticias.");}
        noticias = Array.isArray(data) ? data : [];
        mostrarNoticias();
    } catch (error) {console.error("Error al cargar noticias:", error); alert("No se pudieron cargar las noticias.");}
}
function actualizarIndicadores() {
    const pendientes = noticias.filter(function (noticia) {return noticia.estado === "PENDIENTE";});
    const enCurso = noticias.filter(function (noticia) {return noticia.estado === "EN_CURSO";});
    const finalizadas = noticias.filter(function (noticia) {return noticia.estado === "FINALIZADA";});
    totalNoticias.textContent = noticias.length;
    noticiasPendientes.textContent = pendientes.length;
    noticiasCurso.textContent = enCurso.length;
    noticiasFinalizadas.textContent = finalizadas.length;
}
function obtenerNoticiasFiltradas() {
    const texto = buscarNoticia.value.trim().toLowerCase();
    return noticias.filter(function (noticia) {
        const coincideTexto = noticia.titulo.toLowerCase().includes(texto) ||
            noticia.lugar.toLowerCase().includes(texto) ||
            noticia.detalle.toLowerCase().includes(texto);
        const coincideEstado = filtroEstado.value === "TODOS" || noticia.estado === filtroEstado.value;
        return coincideTexto && coincideEstado;
    });
}
function mostrarNoticias() {
    const noticiasFiltradas = obtenerNoticiasFiltradas();
    listaNoticias.innerHTML = "";
    sinResultados.hidden = noticiasFiltradas.length !== 0;
    noticiasFiltradas.forEach(function (noticia) {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>
                <strong>${escaparHTML(noticia.titulo)}</strong>
                <br>
                <small>${escaparHTML(noticia.detalle)}</small>
            </td>
            <td>${escaparHTML(formatearFecha(noticia.fechaRealizacion))}</td>
            <td>${escaparHTML(noticia.lugar)}</td>
            <td>
                <span class="estado-usuario-admin ${obtenerClaseEstado(noticia.estado)}"> ${escaparHTML(obtenerNombreEstado(noticia.estado))}</span>
            </td>
            <td>
                <div class="acciones-tabla-admin">
                    <button type="button" class="boton-editar-admin" data-id="${noticia.id}">Editar</button>
                    <button type="button" class="boton-eliminar-noticia" data-id="${noticia.id}">Eliminar</button>
                </div>
            </td>
        `;
        listaNoticias.appendChild(fila);
    });
    activarBotonesTabla();
    actualizarIndicadores();
}
function activarBotonesTabla() {
    document.querySelectorAll(".boton-editar-admin").forEach(function (boton) {boton.addEventListener("click", function () {abrirEdicionNoticia(Number(boton.dataset.id));});});
    document.querySelectorAll(".boton-eliminar-noticia").forEach(function (boton) {boton.addEventListener("click", function () {eliminarNoticia(Number(boton.dataset.id));});});
}
function abrirNuevaNoticia() {
    formularioNoticia.reset();
    campoId.value = "";
    campoEstado.value = "PENDIENTE";
    tituloFormulario.textContent = "Nueva noticia";
    contenedorFormulario.hidden = false;
    campoTitulo.focus();
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
function abrirEdicionNoticia(idNoticia) {
    const noticia = noticias.find(function (elemento) {return elemento.id === idNoticia;});
    if (!noticia) {return;}
    campoId.value = noticia.id;
    campoTitulo.value = noticia.titulo;
    campoFecha.value = noticia.fechaRealizacion;
    campoLugar.value = noticia.lugar;
    campoEstado.value = noticia.estado;
    campoDetalle.value = noticia.detalle;
    tituloFormulario.textContent = "Editar noticia";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
function cerrarFormularioNoticia() {formularioNoticia.reset();
    campoId.value = "";
    contenedorFormulario.hidden = true;}
async function guardarNoticia(evento) {
    evento.preventDefault();
    const idNoticia = Number(campoId.value);
    const datos = {
        titulo: campoTitulo.value.trim(),
        fechaRealizacion: campoFecha.value,
        lugar: campoLugar.value.trim(),
        estado: campoEstado.value,
        detalle: campoDetalle.value.trim()
    };
    if (
        !datos.titulo ||
        !datos.fechaRealizacion ||
        !datos.lugar ||
        !datos.estado ||
        !datos.detalle
    ) {alert("Completa todos los campos obligatorios."); return;}
    if (!idNoticia && !usuarioAdministradorId) {alert("No se encontró el identificador " + "del administrador en la sesión.");
        return;
    }
    if (!idNoticia) {datos.creadorId = usuarioAdministradorId;}
    const url = idNoticia ? `${URL_NOTICIAS}/${idNoticia}` : URL_NOTICIAS;
    const metodo = idNoticia ? "PUT" : "POST";
    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo guardar la noticia.");}
        cerrarFormularioNoticia();
        await cargarNoticias();
        alert(idNoticia ? "Noticia actualizada correctamente." : "Noticia creada correctamente.");
    } catch (error) {console.error("Error al guardar noticia:", error); alert(error.message);}
}
async function eliminarNoticia(idNoticia) {
    const noticia = noticias.find(function (elemento) {return elemento.id === idNoticia;});
    if (!noticia) {return;}
    const confirmar = confirm(`¿Deseas eliminar la noticia ` + `"${noticia.titulo}"?`);
    if (!confirmar) {return;}
    try {
        const respuesta = await fetch(`${URL_NOTICIAS}/${idNoticia}`, {method: "DELETE"});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo eliminar la noticia.");}
        await cargarNoticias();
        alert("Noticia eliminada correctamente.");
    } catch (error) {console.error("Error al eliminar noticia:", error); alert(error.message);}
}
buscarNoticia.addEventListener("input", mostrarNoticias);
filtroEstado.addEventListener("change", mostrarNoticias);
botonNuevaNoticia.addEventListener("click", abrirNuevaNoticia);
cerrarFormulario.addEventListener("click", cerrarFormularioNoticia);
cancelarFormulario.addEventListener("click", cerrarFormularioNoticia);
formularioNoticia.addEventListener("submit", guardarNoticia);
cargarNoticias();