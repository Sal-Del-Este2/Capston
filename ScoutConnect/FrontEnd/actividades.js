const API_ACTIVIDADES = "http://localhost:8081/api";
const usuarioAutenticado = sessionStorage.getItem("usuarioAutenticado") === "true";
const rolUsuario = (sessionStorage.getItem("rolUsuario") || "").toLowerCase();
const esAdministrador = rolUsuario === "administrador";
const URL_NOTICIAS = usuarioAutenticado ? `${API_ACTIVIDADES}/noticias` : `${API_ACTIVIDADES}/public/noticias`;
const URL_EVENTOS = usuarioAutenticado ? `${API_ACTIVIDADES}/eventos` : `${API_ACTIVIDADES}/public/eventos`;
let noticias = [];
let eventos = [];
const enlacePanelUsuario = document.getElementById("enlace-panel-usuario");
const cerrarSesion = document.getElementById("cerrar-sesion");
const descripcionActividades = document.getElementById("descripcion-actividades");
const totalNoticias = document.getElementById("total-noticias-publicas");
const totalEventos = document.getElementById("total-eventos-publicos");
const eventosFinalizados = document.getElementById("eventos-finalizados-publicos");
const listaNoticias = document.getElementById("lista-noticias-publicas");
const listaEventos = document.getElementById("lista-eventos-publicos");
const sinNoticias = document.getElementById("sin-noticias-publicas");
const sinEventos = document.getElementById("sin-eventos-publicos");
const contenedorDetalle = document.getElementById("contenedor-detalle-evento");
const tituloDetalle = document.getElementById("titulo-detalle-evento");
const contenidoDetalle = document.getElementById("contenido-detalle-evento");
const cerrarDetalle = document.getElementById("cerrar-detalle-evento");
function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto ?? "");
    return elemento.innerHTML;
}
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return {error: texto};}
}
function formatearFecha(fecha) {
    if (!fecha) {return "";}
    const partes = fecha.split("-");
    if (partes.length !== 3) {return fecha;}
    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}
function obtenerNombreEstado(estado) {
    const estados = {
        PENDIENTE: "Pendiente",
        EN_CURSO: "En curso",
        FINALIZADA: "Finalizada"
    };
    return estados[estado] || estado;
}
function obtenerClaseEstado(estado) {
    if (estado === "FINALIZADA") {return "actividad-finalizada";}
    return "actividad-confirmada";
}
function obtenerUrlFoto(foto) {
    if (!foto?.url) {return "";}
    if (foto.url.startsWith("http")) {return foto.url;}
    return `http://localhost:8081${foto.url}`;
}
function configurarNavegacion() {
    if (!usuarioAutenticado) {descripcionActividades.textContent = "Como visitante externo puedes revisar " + "noticias y eventos finalizados de la " + "Comunidad Scout.";return;}
    enlacePanelUsuario.hidden = false;
    cerrarSesion.hidden = false;
    if (esAdministrador) {enlacePanelUsuario.href = "panel-admin.html"; enlacePanelUsuario.textContent = "Administración";
    } else {enlacePanelUsuario.href = "panel-usuario.html"; enlacePanelUsuario.textContent = "Mi panel";}
    descripcionActividades.textContent = "Consulta noticias y eventos de la " + "Comunidad Scout.";
    cerrarSesion.addEventListener("click", function (evento) {evento.preventDefault(); sessionStorage.clear(); window.location.href = "index.html";});
}
async function cargarContenido() {
    try {
        const [respuestaNoticias, respuestaEventos] = await Promise.all([fetch(URL_NOTICIAS), fetch(URL_EVENTOS)]);
        const datosNoticias = await leerRespuesta(respuestaNoticias);
        const datosEventos = await leerRespuesta(respuestaEventos);
        if (!respuestaNoticias.ok) {throw new Error(datosNoticias.error || "No se pudieron cargar las noticias.");}
        if (!respuestaEventos.ok) {throw new Error(datosEventos.error || "No se pudieron cargar los eventos.");}
        noticias = Array.isArray(datosNoticias) ? datosNoticias : [];
        eventos = Array.isArray(datosEventos) ? datosEventos : [];
        mostrarNoticias();
        mostrarEventos();
        actualizarResumen();
    } catch (error) {
        console.error("Error al cargar contenido:", error);
        listaNoticias.innerHTML = `
            <p class="mensaje-bandeja-vacia">No fue posible cargar las noticias.</p>
        `;
        listaEventos.innerHTML = `
            <p class="mensaje-bandeja-vacia">No fue posible cargar los eventos.</p>
        `;
    }
}
function actualizarResumen() {
    const finalizados = eventos.filter(function (evento) {return evento.estado === "FINALIZADA";});
    totalNoticias.textContent = noticias.length;
    totalEventos.textContent = eventos.length;
    eventosFinalizados.textContent = finalizados.length;
}
function mostrarNoticias() {
    listaNoticias.innerHTML = "";
    sinNoticias.hidden = noticias.length !== 0;
    noticias.forEach(function (noticia) {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta-actividad");
        tarjeta.innerHTML = `
            <div class="icono-actividad" aria-hidden="true">
                📰
            </div>
            <div class="informacion-actividad">
                <div class="encabezado-tarjeta-actividad">
                    <h3>${escaparHTML(noticia.titulo)}</h3>
                    <span class="estado-actividad ${obtenerClaseEstado(noticia.estado)}">${escaparHTML(obtenerNombreEstado(noticia.estado))}</span>
                </div>
                <div class="datos-actividad">
                    <p><strong>Fecha:</strong>${escaparHTML(formatearFecha(noticia.fechaRealizacion))}</p>
                    <p><strong>Lugar:</strong>${escaparHTML(noticia.lugar)}</p>
                    <p>${escaparHTML(noticia.detalle)}</p>
                </div>
            </div>
        `;
        listaNoticias.appendChild(tarjeta);
    });
}
function mostrarEventos() {
    listaEventos.innerHTML = "";
    sinEventos.hidden = eventos.length !== 0;
    eventos.forEach(function (evento) {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta-actividad");
        const fotoPrincipal = Array.isArray(evento.fotos) ? evento.fotos.find(function (foto) {return foto.esPrincipal;}): null;
        const imagen = fotoPrincipal ? `
            <img src="${obtenerUrlFoto(fotoPrincipal)}" alt="${escaparHTML(evento.titulo)}" style="width: 150px; height: 110px; object-fit: cover; border-radius: 8px;">
            `
            : `
            <div class="icono-actividad" aria-hidden="true">
                📅
            </div>
        `;
        tarjeta.innerHTML = ` ${imagen}
            <div class="informacion-actividad">
                <div
                    class="encabezado-tarjeta-actividad">
                    <h3>${escaparHTML(evento.titulo)}</h3>
                    <spanclass="estado-actividad ${obtenerClaseEstado(evento.estado)}">${escaparHTML(obtenerNombreEstado(evento.estado))}</span>
                </div>
                <div class="datos-actividad">
                    <p><strong>Fecha:</strong>${escaparHTML(formatearFecha(evento.fechaRealizacion))}</p>
                    <p><strong>Lugar:</strong>${escaparHTML(evento.lugar)}</p>
                    <p>${escaparHTML(evento.detalle)}</p>
                </div>
                <button type="button" class="boton-detalle-actividad" data-id="${evento.id}">Ver evento</button>
            </div>
        `;
        listaEventos.appendChild(tarjeta);
    });
    document.querySelectorAll(".boton-detalle-actividad")
        .forEach(function (boton) {boton.addEventListener("click", function () {abrirDetalleEvento(Number(boton.dataset.id));});});
}
async function abrirDetalleEvento(idEvento) {
    try {
        const respuesta = await fetch(`${URL_EVENTOS}/${idEvento}`);
        const evento = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(evento.error || "No se pudo cargar el evento.");}
        tituloDetalle.textContent = evento.titulo;
        const fotos = Array.isArray(evento.fotos)
                ? evento.fotos
                : [];
        const galeria =fotos.length ? fotos.map(function (foto) {
            return `
                <img src="${obtenerUrlFoto(foto)}" alt="${escaparHTML(foto.nombreArchivo)}"
                style="max-width: 220px; max-height: 160px; object-fit: cover; border-radius: 8px; margin: 6px;">
                `;
        }).join("")
            : `
            <p>Este evento no tiene fotografías.</p>
        `;
        contenidoDetalle.innerHTML = `
            <div class="datos-actividad">
                <p><strong>Fecha:</strong>${escaparHTML(formatearFecha(evento.fechaRealizacion))}</p>
                <p><strong>Lugar:</strong>${escaparHTML(evento.lugar)}</p>
                <p><strong>Estado:</strong>${escaparHTML(obtenerNombreEstado(evento.estado))}</p>
                <p>${escaparHTML(evento.detalle)}</p>
            </div>
            <div>
                <h3>Galería</h3>
                ${galeria}
            </div>
        `;
        contenedorDetalle.hidden = false;
        contenedorDetalle.scrollIntoView({behavior: "smooth"});
    } catch (error) {console.error("Error al cargar detalle del evento:", error);alert(error.message);}
}
cerrarDetalle.addEventListener("click", function () {
    contenedorDetalle.hidden = true;
    contenidoDetalle.innerHTML = "";
});
configurarNavegacion();
cargarContenido();