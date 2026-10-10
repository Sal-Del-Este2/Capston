const API_ACTIVIDADES = "http://localhost:8081/api";
const URL_EVENTOS = `${API_ACTIVIDADES}/eventos`;
const usuarioAdministradorId = Number(sessionStorage.getItem("usuarioId"));
let eventos = [];
let eventoGaleriaActual = null;
let urlsPrevias = [];
const listaEventos = document.getElementById("lista-eventos-admin");
const totalEventos = document.getElementById("total-eventos-admin");
const eventosPendientes = document.getElementById("eventos-pendientes-admin");
const eventosCurso = document.getElementById("eventos-curso-admin");
const eventosFinalizados = document.getElementById("eventos-finalizados-admin");
const buscarEvento = document.getElementById("buscar-evento");
const filtroEstado = document.getElementById("filtro-estado-evento");
const sinResultados = document.getElementById("sin-resultados-eventos");
const botonNuevoEvento = document.getElementById("boton-nuevo-evento");
const contenedorFormulario = document.getElementById("contenedor-formulario-evento");
const formularioEvento = document.getElementById("form-evento");
const tituloFormulario = document.getElementById("titulo-formulario-evento");
const cerrarFormulario = document.getElementById("cerrar-formulario-evento");
const cancelarFormulario = document.getElementById("cancelar-formulario-evento");
const campoId = document.getElementById("evento-id");
const campoTitulo = document.getElementById("titulo-evento");
const campoFecha = document.getElementById("fecha-evento");
const campoLugar = document.getElementById("lugar-evento");
const campoEstado = document.getElementById("estado-evento");
const campoDetalle = document.getElementById("detalle-evento");
const contenedorGaleria = document.getElementById("contenedor-galeria-evento");
const cerrarGaleria = document.getElementById("cerrar-galeria-evento");
const tituloGaleria = document.getElementById("titulo-galeria-evento");
const campoEventoGaleriaId = document.getElementById("evento-galeria-id");
const formularioFotos = document.getElementById("form-fotos-evento");
const campoArchivos = document.getElementById("archivos-evento");
const vistaPrevia = document.getElementById("vista-previa-nuevas-fotos");
const listaFotos = document.getElementById("lista-fotos-evento");
const sinFotos = document.getElementById("sin-fotos-evento");
function escaparHTML(texto) {const elemento = document.createElement("div");elemento.textContent = String(texto ?? "");return elemento.innerHTML;}
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return {error: texto};}
}
function obtenerNombreEstado(estado) {
    const estados = {
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
function obtenerUrlFoto(foto) {
    if (!foto) {return "";}
    if (foto.url?.startsWith("http")) {return foto.url;}
    return `http://localhost:8081${foto.url}`;
}
async function cargarEventos() {
    try {
        const respuesta = await fetch(URL_EVENTOS);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron cargar los eventos.");}
        eventos = Array.isArray(data) ? data : [];
        mostrarEventos();
    } catch (error) {
        console.error("Error al cargar eventos:", error);
        alert("No se pudieron cargar los eventos.");
    }
}
function actualizarIndicadores() {
    const pendientes = eventos.filter(function (evento) {return evento.estado === "PENDIENTE";});
    const enCurso = eventos.filter(function (evento) {return evento.estado === "EN_CURSO";});
    const finalizados = eventos.filter(function (evento) {return evento.estado === "FINALIZADA";});
    totalEventos.textContent = eventos.length;
    eventosPendientes.textContent = pendientes.length;
    eventosCurso.textContent = enCurso.length;
    eventosFinalizados.textContent = finalizados.length;
}
function obtenerEventosFiltrados() {
    const texto = buscarEvento.value.trim().toLowerCase();
    return eventos.filter(function (evento) {
        const coincideTexto = evento.titulo.toLowerCase().includes(texto) ||
            evento.lugar.toLowerCase().includes(texto) ||
            evento.detalle.toLowerCase().includes(texto);
        const coincideEstado = filtroEstado.value === "TODOS" ||
            evento.estado === filtroEstado.value;
        return coincideTexto && coincideEstado;
    });
}
function mostrarEventos() {
    const eventosFiltrados = obtenerEventosFiltrados();
    listaEventos.innerHTML = "";
    sinResultados.hidden = eventosFiltrados.length !== 0;
    eventosFiltrados.forEach(function (evento) {
        const fila = document.createElement("tr");
        const cantidadFotos = Array.isArray(evento.fotos) ? evento.fotos.length : 0;
        fila.innerHTML = `
            <td>
                <strong>${escaparHTML(evento.titulo)}</strong>
                <br>
                <small>${escaparHTML(evento.detalle)}</small>
            </td>
            <td>${escaparHTML(formatearFecha(evento.fechaRealizacion))}
            </td>
            <td>${escaparHTML(evento.lugar)}</td>
            <td><spanclass="estado-usuario-admin ${obtenerClaseEstado(evento.estado)}">${escaparHTML(obtenerNombreEstado(evento.estado))}</span></td>
            <td>${cantidadFotos}/20</td>
            <td>
                <div class="acciones-tabla-admin">
                    <button type="button" class="boton-editar-admin" data-id="${evento.id}">Editar</button>
                    <button type="button" class="boton-galeria-evento" data-id="${evento.id}">Galería</button>
                    <button type="button" class="boton-eliminar-evento" data-id="${evento.id}">Eliminar</button>
                </div>
            </td>
        `;
        listaEventos.appendChild(fila);
    });
    activarBotonesTabla();
    actualizarIndicadores();
}
function activarBotonesTabla() {
    document.querySelectorAll(".boton-editar-admin").forEach(function (boton) {
        boton.addEventListener("click", function () {abrirEdicionEvento(Number(boton.dataset.id));});
    });
    document.querySelectorAll(".boton-galeria-evento").forEach(function (boton) {
        boton.addEventListener("click", function () {abrirGaleriaEvento(Number(boton.dataset.id));});
    });
    document.querySelectorAll(".boton-eliminar-evento").forEach(function (boton) {boton.addEventListener("click", function () {eliminarEvento(Number(
        boton.dataset.id));});
    });
}
function abrirNuevoEvento() {
    formularioEvento.reset();
    campoId.value = "";
    campoEstado.value = "PENDIENTE";
    tituloFormulario.textContent = "Nuevo evento";
    contenedorFormulario.hidden = false;
    campoTitulo.focus();
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
function abrirEdicionEvento(idEvento) {
    const evento = eventos.find(function (elemento) {return elemento.id === idEvento;});
    if (!evento) {return;}
    campoId.value = evento.id;
    campoTitulo.value = evento.titulo;
    campoFecha.value = evento.fechaRealizacion;
    campoLugar.value = evento.lugar;
    campoEstado.value = evento.estado;
    campoDetalle.value = evento.detalle;
    tituloFormulario.textContent = "Editar evento";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
function cerrarFormularioEvento() {
    formularioEvento.reset();
    campoId.value = "";
    contenedorFormulario.hidden = true;
}
async function guardarEvento(eventoFormulario) {
    eventoFormulario.preventDefault();
    const idEvento = Number(campoId.value);
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
    ) {alert("Completa todos los campos obligatorios.");
        return;
    }
    if (!idEvento && !usuarioAdministradorId) {alert("No se encontró el identificador " + "del administrador en la sesión.");
        return;
    }
    if (!idEvento) {datos.creadorId = usuarioAdministradorId;}
    const url = idEvento ? `${URL_EVENTOS}/${idEvento}` : URL_EVENTOS;
    const metodo = idEvento ? "PUT" : "POST";
    try {
        const respuesta = await fetch(url, {
            method: metodo, headers: {"Content-Type": "application/json"},
            body: JSON.stringify(datos)
        });
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo guardar el evento.");}
        cerrarFormularioEvento();
        await cargarEventos();
        alert(idEvento ? "Evento actualizado correctamente." : "Evento creado correctamente.");
    } catch (error) {console.error("Error al guardar evento:", error);alert(error.message);}
}
async function abrirGaleriaEvento(idEvento) {
    try {
        const respuesta = await fetch(`${URL_EVENTOS}/${idEvento}`);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo cargar el evento.");}
        eventoGaleriaActual = data;
        campoEventoGaleriaId.value = data.id;
        tituloGaleria.textContent = `Galería: ${data.titulo}`;
        campoArchivos.value = "";
        limpiarVistaPrevia();
        mostrarFotosGaleria(data.fotos || []);
        contenedorGaleria.hidden = false;
        contenedorGaleria.scrollIntoView({behavior: "smooth"});
    } catch (error) {console.error("Error al abrir galería:", error);alert(error.message);}
}
function cerrarGaleriaEvento() {
    campoEventoGaleriaId.value = "";
    campoArchivos.value = "";
    eventoGaleriaActual = null;
    limpiarVistaPrevia();
    listaFotos.innerHTML = "";
    sinFotos.hidden = true;
    contenedorGaleria.hidden = true;
}
function limpiarVistaPrevia() {
    urlsPrevias.forEach(function (url) {URL.revokeObjectURL(url);});
    urlsPrevias = [];
    vistaPrevia.innerHTML = "";
}
function mostrarVistaPreviaArchivos() {
    limpiarVistaPrevia();
    const archivos = Array.from(campoArchivos.files);
    archivos.forEach(function (archivo) {
        const url = URL.createObjectURL(archivo);
        urlsPrevias.push(url);
        const bloque = document.createElement("div");
        bloque.className = "tarjeta-actividad";
        bloque.innerHTML = `
            <img src="${url}" alt="Vista previa de ${escaparHTML(archivo.name)}" style="max-width: 160px; max-height: 120px; object-fit: cover;">
            <p>${escaparHTML(archivo.name)}</p>
        `;
        vistaPrevia.appendChild(bloque);
    });
}
function validarArchivos(archivos, cantidadActual) {
    const tiposPermitidos = [
        "image/jpeg",
		"image/png",
		"image/heic",
		"image/heif",
		"image/heif-sequence"
    ];
    if (!archivos.length) {
        alert("Selecciona al menos una fotografía.");
        return false;
    }
    if (cantidadActual + archivos.length > 20) {
        alert("El evento no puede superar " + "las 20 fotografías.");
        return false;
    }
    for (const archivo of archivos) {
        if (!tiposPermitidos.includes(archivo.type)) {
            alert(`"${archivo.name}" no es JPG ni PNG.`);
            return false;
        }
        if (archivo.size > 10 * 1024 * 1024) {alert(`"${archivo.name}" supera los 10 MB.`);
            return false;
        }
    }
    return true;
}
async function subirFotos(eventoFormulario) {
    eventoFormulario.preventDefault();
    const eventoId = Number(campoEventoGaleriaId.value);
    const archivos = Array.from(campoArchivos.files);
    const cantidadActual = eventoGaleriaActual?.fotos?.length || 0;
    if (!eventoId) {alert("No se encontró el evento de la galería.");return;}
    if (!validarArchivos(archivos, cantidadActual)) {return;}
    const formData = new FormData();
    archivos.forEach(function (archivo) {formData.append("archivos", archivo);});
    try {
        const respuesta = await fetch(`${URL_EVENTOS}/${eventoId}/fotos`,{method: "POST", body: formData});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudieron subir las fotografías.");}
        campoArchivos.value = "";
        limpiarVistaPrevia();
        await abrirGaleriaEvento(eventoId);
        await cargarEventos();
        alert("Fotografías subidas correctamente.");
    } catch (error) {console.error("Error al subir fotografías:", error);
        alert(error.message);
    }
}
function mostrarFotosGaleria(fotos) {
    listaFotos.innerHTML = "";
    sinFotos.hidden = fotos.length !== 0;
    fotos.forEach(function (foto) {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta-actividad");
        const etiquetaPrincipal = foto.esPrincipal
                ? `
                    <span class="estado-actividad actividad-confirmada">Foto principal</span>
                  `
                : "";
        const botonPrincipal = foto.esPrincipal
                ? ""
                : `
                    <button type="button" class="boton-editar-admin" data-id="${foto.id}"> Definir como principal
                    </button>
                  `;
        tarjeta.innerHTML = `
            <div class="informacion-actividad">
                <img src="${obtenerUrlFoto(foto)}" alt="${escaparHTML(foto.nombreArchivo)}" style="max-width: 220px; max-height: 160px; object-fit: cover;">
                <h3>${escaparHTML(foto.nombreArchivo)}</h3>
                <p>Orden: ${foto.ordenVisualizacion}</p>
                ${etiquetaPrincipal}
                <div class="acciones-tabla-admin">${botonPrincipal}
                    <button type="button" class="boton-eliminar-evento" data-id="${foto.id}"> Eliminar foto
                    </button>
                </div>
            </div>
        `;
        listaFotos.appendChild(tarjeta);
    });
    document
        .querySelectorAll("#lista-fotos-evento .boton-editar-admin")
        .forEach(function (boton) {boton.addEventListener("click", function () {marcarFotoPrincipal(Number(boton.dataset.id));});});
    document
        .querySelectorAll("#lista-fotos-evento .boton-eliminar-evento")
        .forEach(function (boton) {boton.addEventListener("click", function () {eliminarFoto(Number(boton.dataset.id));});});
}
async function marcarFotoPrincipal(fotoId) {
    const eventoId = Number(campoEventoGaleriaId.value);
    if (!eventoId) {return;}
    try {
        const respuesta = await fetch(`${URL_EVENTOS}/${eventoId}/fotos/` + `${fotoId}/principal`, {method: "PUT"});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo definir la foto principal.");}
        await abrirGaleriaEvento(eventoId);
        await cargarEventos();
    } catch (error) {console.error("Error al definir foto principal:", error); alert(error.message);}
}
async function eliminarFoto(fotoId) {
    const eventoId = Number(campoEventoGaleriaId.value);
    if (!eventoId) {return;}
    const confirmar = confirm("¿Deseas eliminar esta fotografía?");
    if (!confirmar) {return;}
    try {
        const respuesta = await fetch(`${URL_EVENTOS}/${eventoId}/fotos/` + `${fotoId}`, {method: "DELETE"});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo eliminar la fotografía.");}
        await abrirGaleriaEvento(eventoId);
        await cargarEventos();
    } catch (error) {console.error("Error al eliminar fotografía:", error);alert(error.message);}
}
async function eliminarEvento(idEvento) {
    const evento = eventos.find(function (elemento) {return elemento.id === idEvento;});
    if (!evento) {return;}
    const confirmar = confirm(`¿Deseas eliminar el evento ` + `"${evento.titulo}"?`);
    if (!confirmar) {return;}
    try {
        const respuesta = await fetch(`${URL_EVENTOS}/${idEvento}`, {method: "DELETE"});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || "No se pudo eliminar el evento.");}
        await cargarEventos();
        alert("Evento eliminado correctamente.");
    } catch (error) {console.error("Error al eliminar evento:", error);alert(error.message);}
}
buscarEvento.addEventListener("input", mostrarEventos);
filtroEstado.addEventListener("change", mostrarEventos);
botonNuevoEvento.addEventListener("click", abrirNuevoEvento);
cerrarFormulario.addEventListener("click", cerrarFormularioEvento);
cancelarFormulario.addEventListener("click", cerrarFormularioEvento);
formularioEvento.addEventListener("submit", guardarEvento);
cerrarGaleria.addEventListener("click", cerrarGaleriaEvento);
campoArchivos.addEventListener("change", mostrarVistaPreviaArchivos);
formularioFotos.addEventListener("submit", subirFotos);
cargarEventos();