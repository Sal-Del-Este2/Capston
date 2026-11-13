const API_INFORMACION = "http://localhost:8083/api/informacion-institucional";
const botonesInformacion = document.querySelectorAll(".boton-informacion-nosotros");
const modalInformacion = document.getElementById("modal-informacion-nosotros");
const tituloModal = document.getElementById("titulo-modal-nosotros");
const contenidoModal = document.getElementById("contenido-modal-nosotros");
const botonCerrarModal = document.getElementById("cerrar-modal-nosotros");
const botonCerrarInformacion = document.getElementById("boton-cerrar-informacion");
const estadoInformacion = document.getElementById("estado-informacion-nosotros");
let informacionInstitucional = null;
const seccionesInformacion = {
    mision: {titulo: "Nuestra misión", campo: "mision"},
    vision: {titulo: "Nuestra visión", campo: "vision"},
    historia: {titulo: "Nuestra historia", campo: "historia"},
    valores: {titulo: "Nuestros valores", campo: "valores"}
};
// Obtener información institucional
async function cargarInformacionInstitucional() {
    try {
        const respuesta = await fetch(API_INFORMACION);
        const texto = await respuesta.text();
        let data = {};
        if (texto) {
            try {data = JSON.parse(texto);
            } catch (error) {throw new Error("El servidor devolvió una respuesta inválida.");}
        }
        if (!respuesta.ok) {throw new Error(data.error || data.message || "No se pudo cargar la información institucional.");}
        informacionInstitucional = data;
        estadoInformacion.textContent = "Selecciona una sección para conocer más sobre nosotros.";
        botonesInformacion.forEach(boton => {boton.disabled = false;});
    } catch (error) {
        console.error("Error al cargar información institucional:", error);
        estadoInformacion.textContent = "No fue posible cargar la información institucional. Intenta nuevamente más tarde.";
        botonesInformacion.forEach(boton => {boton.disabled = true;});
    }
}
// Mostrar información seleccionada
function mostrarInformacion(seccion) {
    if (!informacionInstitucional) {return;}
    const configuracion = seccionesInformacion[seccion];
    if (!configuracion) {return;}
    const contenido = informacionInstitucional[configuracion.campo];
    tituloModal.textContent = configuracion.titulo;
    contenidoModal.textContent = contenido && contenido.trim() ? contenido : "Esta información todavía no ha sido registrada.";
    abrirModal();
}
// Abrir ventana
function abrirModal() {
    modalInformacion.hidden = false;
    modalInformacion.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-nosotros-abierto");
    botonCerrarModal.focus();
}
// Cerrar ventana
function cerrarModal() {
    modalInformacion.hidden = true;
    modalInformacion.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-nosotros-abierto");
}
// Eventos de los botones
botonesInformacion.forEach(boton => {
    boton.disabled = true;
    boton.addEventListener("click", () => {const seccion = boton.dataset.seccion; mostrarInformacion(seccion);});
});
// Eventos para cerrar la ventana
botonCerrarModal.addEventListener("click", cerrarModal);
botonCerrarInformacion.addEventListener("click", cerrarModal);
// Cerrar al hacer clic fuera de la ventana
modalInformacion.addEventListener("click", evento => {if (evento.target === modalInformacion) {cerrarModal();}});
// Cerrar con tecla Escape
document.addEventListener("keydown", evento => {if (evento.key === "Escape" && !modalInformacion.hidden) {cerrarModal();}});
// Inicializar página
cargarInformacionInstitucional();