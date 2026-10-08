const API_MENSAJES = "http://localhost:8080/mensajes";
const usuarioAdministradorId = Number(sessionStorage.getItem("usuarioId"));
let mensajes = [];
let bandejaActual = "recibido";
const listaMensajes = document.getElementById("lista-mensajes-admin");
const totalMensajes = document.getElementById("total-mensajes-admin");
const tituloFormularioMensajeAdmin = document.getElementById("titulo-formulario-mensaje-admin");
const mensajesNoLeidos = document.getElementById("mensajes-no-leidos-admin");
const mensajesRecibidos = document.getElementById("mensajes-recibidos-admin");
const mensajesEnviados = document.getElementById("mensajes-enviados-admin");
const pestanaRecibidos = document.getElementById("pestana-recibidos");
const pestanaEnviados = document.getElementById("pestana-enviados");
const tituloListado = document.getElementById("titulo-listado-mensajes");
const buscarMensaje = document.getElementById("buscar-mensaje-admin");
const filtroEstado = document.getElementById("filtro-estado-mensaje-admin");
const seleccionarTodos = document.getElementById("seleccionar-todos-admin");
const contadorSeleccionados = document.getElementById("contador-seleccionados-admin");
const botonEliminarSeleccionados =document.getElementById("eliminar-seleccionados-admin");
const sinResultados =document.getElementById("sin-resultados-mensajes-admin");
const botonNuevoMensaje =document.getElementById("boton-nuevo-mensaje-admin");
const contenedorFormulario =document.getElementById("contenedor-formulario-mensaje-admin");
const formularioMensaje = document.getElementById("form-mensaje-admin");
const selectorDestinatario = document.getElementById("destinatario-admin");
const campoAsunto = document.getElementById("asunto-mensaje-admin");
const campoContenido = document.getElementById("contenido-mensaje-admin");
const campoArchivos = document.getElementById("archivos-mensaje-admin");
const campoMensajePadre = document.getElementById("mensaje-padre-admin");
const cerrarFormulario = document.getElementById("cerrar-formulario-mensaje-admin");
const cancelarFormulario = document.getElementById("cancelar-formulario-mensaje-admin");
function escaparHTML(texto) {const elemento = document.createElement("div");elemento.textContent = String(texto ?? "");return elemento.innerHTML;}
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return {error: texto};}
}
function obtenerNombreEstado(estado) {
    if (estado === "NO_LEIDO") {return "No leído";}
    if (estado === "LEIDO") {return "Leído";}
    if (estado === "ENVIADO") {return "Enviado";}
    return estado || "";
}
function obtenerTipoBandeja(mensaje) {
    const esRecibido = mensaje.destinatarioId === usuarioAdministradorId;
    return esRecibido
        ? "recibido"
        : "enviado";
}
function mapearMensaje(mensaje) {
    return {...mensaje,
        tipo: obtenerTipoBandeja(mensaje),
        remitente: mensaje.remitenteNickname,
        destinatarios: [mensaje.destinatarioNickname],
        fecha: mensaje.fechaCreacion,
        estadoTexto: obtenerNombreEstado(mensaje.estado)
    };
}
async function cargarMensajes() {
    if (!usuarioAdministradorId) {alert("No se encontró el usuario administrador.");return;}
    try {const [respuestaRecibidos, respuestaEnviados] = await Promise.all([
            fetch(`${API_MENSAJES}/recibidos/${usuarioAdministradorId}`),
            fetch(`${API_MENSAJES}/enviados/${usuarioAdministradorId}`)
        ]);
        const recibidos =await leerRespuesta(respuestaRecibidos);
        const enviados =await leerRespuesta(respuestaEnviados);
        if (!respuestaRecibidos.ok) {throw new Error(recibidos.error || "No se pudieron cargar los recibidos.");}
        if (!respuestaEnviados.ok) {throw new Error(enviados.error || "No se pudieron cargar los enviados.");}
        const mensajesRecibidosData = Array.isArray(recibidos) ? recibidos.map(mapearMensaje) : [];
        const mensajesEnviadosData = Array.isArray(enviados) ? enviados.map(mapearMensaje) : [];
        mensajes = [...mensajesRecibidosData, ...mensajesEnviadosData];
        mostrarMensajes();
    } catch (error) {console.error("Error al cargar mensajes:", error);
        alert("No se pudieron cargar los mensajes.");}
}
async function cargarDestinatarios() {
    try {const respuesta = await fetch("http://localhost:8080/usuarios/listar");
        const usuarios = await respuesta.json();
        if (!respuesta.ok) {throw new Error("No se pudieron cargar los usuarios.");}
        selectorDestinatario.innerHTML = '<option value="">Seleccione un destinatario</option>';
        usuarios.filter(function (usuario) {
            const activo = usuario.estado?.nombre ?.toLowerCase() === "activo";
            const administrador = usuario.id === usuarioAdministradorId;
            return activo && !administrador;
        })
        .forEach(function (usuario) {const opcion = document.createElement("option");
            opcion.value = usuario.id;
            opcion.textContent = `${usuario.nombre} ` + `(@${usuario.nickname})`;
            selectorDestinatario.appendChild(opcion);
        });
    } catch (error) {console.error("Error al cargar destinatarios:", error);alert("No se pudieron cargar los destinatarios.");}
}
function actualizarIndicadores() {
    const recibidos =mensajes.filter(function (mensaje) {return mensaje.tipo === "recibido";});
    const enviados =mensajes.filter(function (mensaje) {return mensaje.tipo === "enviado";});
    const noLeidos =recibidos.filter(function (mensaje) {return mensaje.estado === "NO_LEIDO";});
    totalMensajes.textContent = mensajes.length;
    mensajesNoLeidos.textContent = noLeidos.length;
    mensajesRecibidos.textContent = recibidos.length;
    mensajesEnviados.textContent = enviados.length;
}
function obtenerMensajesFiltrados() {
    const texto = buscarMensaje.value.trim().toLowerCase();
    const estado = filtroEstado.value;
    return mensajes.filter(function (mensaje) {if (mensaje.tipo !== bandejaActual) {return false;}
        const participantes = `${mensaje.remitenteNickname} ` + `${mensaje.destinatarioNickname}`;
        const coincideTexto = mensaje.asunto.toLowerCase().includes(texto) ||
            mensaje.contenido.toLowerCase().includes(texto) ||
            participantes.toLowerCase().includes(texto);
        const coincideEstado = estado === "TODOS" || mensaje.estado === estado;
        return coincideTexto && coincideEstado;
    });
}
function formatearFecha(fecha) {if (!fecha) {return "";}
    return new Date(fecha).toLocaleString("es-CL");
}

function mostrarMensajes() {
    const mensajesFiltrados = obtenerMensajesFiltrados();
    listaMensajes.innerHTML = "";
    sinResultados.hidden = mensajesFiltrados.length !== 0;
    mensajesFiltrados.forEach(function (mensaje) {
        const tarjeta = document.createElement("article");
        tarjeta.classList.add("tarjeta-mensaje-admin");
        const claseEstado = mensaje.estado === "NO_LEIDO" ? "mensaje-no-leido" : "mensaje-leido";
        const botonResponder = mensaje.tipo === "recibido" ? ` <button type="button" class="boton-responder-admin" data-id="${mensaje.id}">Responder</button>` : "";
        tarjeta.innerHTML = `
            <div class="selector-mensaje-admin">
                <input type="checkbox" class="seleccionar-mensaje-admin" data-id="${mensaje.id}">
            </div>
            <div class="contenido-mensaje-admin">
                <div class="encabezado-mensaje-admin">
                    <div>
                        <h3>${escaparHTML(mensaje.asunto)}</h3>
                        <p><strong>${mensaje.tipo === "recibido" ? "De:" : "Para:"}</strong>
                            ${mensaje.tipo === "recibido" ? `@${escaparHTML(mensaje.remitenteNickname)}` : `@${escaparHTML(mensaje.destinatarioNickname)}`}
                        </p>
                        <small>${escaparHTML(formatearFecha(mensaje.fechaCreacion))}</small>
                    </div>
                    <span
                        class="estado-mensaje ${claseEstado}">
                        ${escaparHTML(
                            mensaje.estadoTexto
                        )}
                    </span>
                </div>
                <p class="texto-mensaje-admin">${escaparHTML(mensaje.contenido)}</p>
                <div class="acciones-tabla-admin">
                    <button type="button" class="boton-ver-mensaje-admin" data-id="${mensaje.id}">Ver mensaje</button>
                    ${botonResponder}
                    <button type="button" class="boton-eliminar-mensaje-admin" data-id="${mensaje.id}">Eliminar</button>
                </div>
            </div>
        `;
        listaMensajes.appendChild(tarjeta);
    });
    activarEventosMensajes();
    actualizarSeleccionados();
    actualizarIndicadores();
}
function activarEventosMensajes() {
    document.querySelectorAll(".seleccionar-mensaje-admin").forEach(function (casilla) {casilla.addEventListener("change", actualizarSeleccionados);});
    document.querySelectorAll(".boton-ver-mensaje-admin").forEach(function (boton) {boton.addEventListener("click", function () {verMensaje(Number(boton.dataset.id));});});
    document.querySelectorAll(".boton-responder-admin").forEach(function (boton) {boton.addEventListener("click", function () {responderMensaje(Number(boton.dataset.id));});});
    document.querySelectorAll(".boton-eliminar-mensaje-admin").forEach(function (boton) {boton.addEventListener("click", function () {eliminarMensaje(Number(boton.dataset.id));});});
}
function actualizarSeleccionados() {
    const casillas = document.querySelectorAll(".seleccionar-mensaje-admin");
    const seleccionadas = document.querySelectorAll(".seleccionar-mensaje-admin:checked");
    const cantidad = seleccionadas.length; contadorSeleccionados.textContent = cantidad === 1 ? "1 mensaje seleccionado" : `${cantidad} mensajes seleccionados`;
    botonEliminarSeleccionados.disabled = cantidad === 0;
    seleccionarTodos.checked = casillas.length > 0 && cantidad === casillas.length;
    seleccionarTodos.indeterminate = cantidad > 0 && cantidad < casillas.length;
}
function abrirFormularioMensaje() {
    formularioMensaje.reset();
    campoMensajePadre.value = "";
    selectorDestinatario.disabled = false;
    campoAsunto.readOnly = false;
    tituloFormularioMensajeAdmin.textContent = "Enviar mensaje";
    contenedorFormulario.hidden = false;
    selectorDestinatario.focus();
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
function cerrarFormularioMensaje() {
    formularioMensaje.reset();
    campoMensajePadre.value = "";
    selectorDestinatario.disabled = false;
    campoAsunto.readOnly = false;
    contenedorFormulario.hidden = true;
}
async function enviarMensaje() {
    const destinatarioId = Number(selectorDestinatario.value);
    const asunto = campoAsunto.value.trim();
    const contenido = campoContenido.value.trim();
    if (!destinatarioId) {alert("Selecciona un destinatario."); return false;}
    if (!asunto || asunto.length > 255) {alert("El asunto debe tener entre 1 y 255 caracteres.");return false;}
    if (!contenido || contenido.length > 500) {alert("El mensaje debe tener entre 1 y 500 caracteres.");return false;}
    const archivos = Array.from(campoArchivos.files);
    if (archivos.length > 2) {alert("Solo puedes adjuntar hasta 2 archivos.");return false;}
    const formData = new FormData();
    const datosMensaje = {remitenteId: usuarioAdministradorId, destinatarioId, asunto, contenido};
    formData.append("mensaje", JSON.stringify(datosMensaje));
    archivos.forEach(function (archivo) {formData.append("archivos", archivo);});
    const respuesta = await fetch(API_MENSAJES, {method: "POST",body: formData});
    const data = await leerRespuesta(respuesta);
    if (!respuesta.ok) {alert(data.error || "No se pudo enviar el mensaje.");return false;}
    alert("Mensaje enviado correctamente.");
    return true;
}
formularioMensaje.addEventListener("submit",
    async function (evento) {evento.preventDefault();
        try {const enviado = await enviarMensaje();
            if (!enviado) {return;}
            cerrarFormularioMensaje();
            await cargarMensajes();
            bandejaActual = "enviado";
            pestanaRecibidos.classList.remove("activa");
            pestanaEnviados.classList.add("activa");
            tituloListado.textContent = "Mensajes enviados";
            filtroEstado.value = "TODOS";
            mostrarMensajes();
        } catch (error) {console.error("Error al enviar mensaje:", error);
            alert("No se pudo conectar con el servidor.");
        }
    }
);
async function marcarComoLeido(idMensaje) {
    const respuesta = await fetch(`${API_MENSAJES}/${idMensaje}/leer` + `?usuarioId=${usuarioAdministradorId}`, {method: "PUT"});
    if (!respuesta.ok) {return;}
    await cargarMensajes();
}
async function verMensaje(idMensaje) {
    const mensaje = mensajes.find(function (elemento) {return elemento.id === idMensaje;});
    if (!mensaje) {return;}
    if (mensaje.tipo === "recibido" && mensaje.estado === "NO_LEIDO") {await marcarComoLeido(idMensaje);}
    alert(
        `De: @${mensaje.remitenteNickname}\n` +
        `Para: @${mensaje.destinatarioNickname}\n` +
        `Asunto: ${mensaje.asunto}\n` +
        `Fecha: ${formatearFecha(mensaje.fechaCreacion)}\n\n` +
        `${mensaje.contenido}`
    );
}
async function responderMensaje(idMensaje) {
    const mensaje = mensajes.find(function (elemento) {return elemento.id === idMensaje;});
    if (!mensaje) {return;}
    campoMensajePadre.value = mensaje.id;
    selectorDestinatario.value =mensaje.remitenteId;
    selectorDestinatario.disabled = true;
    campoAsunto.value = mensaje.asunto.startsWith("Re:") ? mensaje.asunto : `Re: ${mensaje.asunto}`;
    campoAsunto.readOnly = true;
    campoContenido.value = "";
    campoArchivos.value = "";
    tituloFormularioMensajeAdmin.textContent = "Responder mensaje";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
    await marcarComoLeido(idMensaje);
}
async function eliminarMensaje(idMensaje) {
    if (!confirm("¿Deseas eliminar este mensaje?")) {return;}
    const respuesta =await fetch(`${API_MENSAJES}/${idMensaje}` + `?usuarioId=${usuarioAdministradorId}`, {method: "DELETE"});
    const data =await leerRespuesta(respuesta);
    if (!respuesta.ok) {alert(data.error || "No se pudo eliminar el mensaje.");return;}
    await cargarMensajes();
}
seleccionarTodos.addEventListener("change",
    function () {document.querySelectorAll(".seleccionar-mensaje-admin").forEach(function (casilla) {casilla.checked = seleccionarTodos.checked;});actualizarSeleccionados();});
botonEliminarSeleccionados.addEventListener("click",
    async function () {
        const seleccionadas =document.querySelectorAll(".seleccionar-mensaje-admin:checked");
        const ids = Array.from(seleccionadas).map(function (casilla) {return Number(casilla.dataset.id);});
        if (!ids.length) {return;}
        if (!confirm(`¿Deseas eliminar ${ids.length} mensajes?`)) {return;}
        for (const id of ids) {await fetch(`${API_MENSAJES}/${id}` + `?usuarioId=${usuarioAdministradorId}`, {method: "DELETE"});}
        await cargarMensajes();
    }
);
pestanaRecibidos.addEventListener("click",
    function () {
        bandejaActual = "recibido";
        pestanaRecibidos.classList.add("activa");
        pestanaEnviados.classList.remove("activa");
        tituloListado.textContent = "Mensajes recibidos";
        filtroEstado.disabled = false;
        mostrarMensajes();
    }
);
pestanaEnviados.addEventListener(
    "click",
    function () {bandejaActual = "enviado";
        pestanaRecibidos.classList.remove("activa");
        pestanaEnviados.classList.add("activa");
        tituloListado.textContent = "Mensajes enviados";
        filtroEstado.value = "TODOS";
        filtroEstado.disabled = true;
        mostrarMensajes();
    }
);
buscarMensaje.addEventListener("input", mostrarMensajes);
filtroEstado.addEventListener("change", mostrarMensajes);
botonNuevoMensaje.addEventListener("click", abrirFormularioMensaje);
cerrarFormulario.addEventListener("click", cerrarFormularioMensaje);
cancelarFormulario.addEventListener("click", cerrarFormularioMensaje);
cargarDestinatarios();
cargarMensajes();
mostrarMensajes();