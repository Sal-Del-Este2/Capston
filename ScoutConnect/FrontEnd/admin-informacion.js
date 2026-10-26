const API_PAGINA_PUBLICA = "http://localhost:8083/api";
const URL_INFORMACION = `${API_PAGINA_PUBLICA}/informacion-institucional`;
let informacionActual = null;
const formularioInformacion = document.getElementById("form-informacion");
const botonCancelar = document.getElementById("boton-cancelar");
const botonCerrarSesion = document.getElementById("cerrar-sesion-admin");
const campoId = document.getElementById("informacion-id");
const campoNombre = document.getElementById("nombre-institucion");
const campoCorreo = document.getElementById("correo-contacto");
const campoTelefono = document.getElementById("telefono-contacto");
const campoSitioWeb = document.getElementById("sitio-web");
const campoLogo = document.getElementById("logo-url");
const campoMision = document.getElementById("mision");
const campoVision = document.getElementById("vision");
const campoHistoria = document.getElementById("historia");
const campoValores = document.getElementById("valores");
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
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return { error: texto };}
}
async function cargarInformacion() {
    try {
        const respuesta = await fetch(URL_INFORMACION);
        // const respuesta = await fetchAutenticado(URL_INFORMACION);
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {throw new Error(data.error || data.message || "No se pudo cargar la información institucional.");}
        informacionActual = data;
        llenarFormulario(data);
    } catch (error) {console.error("Error al cargar información institucional:", error); alert(error.message);}
}
function llenarFormulario(informacion) {
    campoId.value = informacion.id ?? "";
    campoNombre.value = informacion.nombreInstitucion ?? "";
    campoCorreo.value = informacion.correoContacto ?? "";
    campoTelefono.value = informacion.telefonoContacto ?? "";
    campoSitioWeb.value = informacion.sitioWeb ?? "";
    campoLogo.value = informacion.logoUrl ?? "";
    campoMision.value = informacion.mision ?? "";
    campoVision.value = informacion.vision ?? "";
    campoHistoria.value = informacion.historia ?? "";
    campoValores.value = informacion.valores ?? "";
}
function validarFormulario() {if (!campoNombre.value.trim()) {alert("Debe ingresar el nombre de la institución."); campoNombre.focus(); return false;
    }return true;
}
function obtenerDatosInformacion() {
    return {
        nombreInstitucion: campoNombre.value.trim(),
        mision: campoMision.value.trim(),
        vision: campoVision.value.trim(),
        historia: campoHistoria.value.trim(),
        valores: campoValores.value.trim(),
        correoContacto: campoCorreo.value.trim(),
        telefonoContacto: campoTelefono.value.trim(),
        sitioWeb: campoSitioWeb.value.trim(),
        logoUrl: campoLogo.value.trim()
    };
}
async function guardarInformacion(evento) {evento.preventDefault();
    if (!validarFormulario()) {return;}
    if (!informacionActual || !informacionActual.id) {alert("No hay información institucional disponible para editar.");return;}
    const confirmacion = confirm("¿Deseas guardar los cambios en la información institucional?");
    if (!confirmacion) {return;}
    try {
        const respuesta = await fetchAutenticado(`${URL_INFORMACION}/${informacionActual.id}`, {
            method: "PUT",
            // headers: {"Content-Type": "application/json"},
            body: JSON.stringify(obtenerDatosInformacion())
        });
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {alert(data.error || data.message || "No se pudo guardar la información institucional."); return;}
        informacionActual = data;
        llenarFormulario(data);
        alert("Información institucional actualizada correctamente.");
    } catch (error) {console.error("Error al guardar información institucional:", error); alert(error.message || "No se pudo conectar con el servidor.");}
}
if (botonCerrarSesion) {botonCerrarSesion.addEventListener("click", function (evento) {evento.preventDefault(); sessionStorage.clear(); window.location.replace("login.html");});}
botonCancelar.addEventListener("click", function () {if (informacionActual) {llenarFormulario(informacionActual);}});
formularioInformacion.addEventListener("submit", guardarInformacion);
validarAccesoAdministrador();
cargarInformacion();