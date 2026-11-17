
const API_POLITICAS = "http://localhost:8083/api/politicas/publicadas";
// Elementos HTML
const listadoPoliticas = document.getElementById("listado-politicas");
const estadoPoliticas = document.getElementById("estado-politicas");
const modalPolitica = document.getElementById("modal-politica");
const tituloModalPolitica = document.getElementById("titulo-modal-politica");
const versionModalPolitica = document.getElementById("version-modal-politica");
const tipoModalPolitica = document.getElementById("tipo-modal-politica");
const textoModalPolitica = document.getElementById("texto-modal-politica");
const botonCerrarModal = document.getElementById("cerrar-modal-politica");
const botonCerrarPolitica = document.getElementById("boton-cerrar-politica");
let politicasPublicadas = [];
// cargar politicas
async function cargarPoliticasPublicadas() {
    try {
        estadoPoliticas.textContent = "Cargando políticas...";
        estadoPoliticas.classList.remove("error");
        const respuesta = await fetch(API_POLITICAS);
        const texto = await respuesta.text();
        let data = [];
        if (texto) {
            try {data = JSON.parse(texto);
            } catch (error) {throw new Error("El servidor devolvió una respuesta inválida.");}
        }
        if (!respuesta.ok) {
            throw new Error(data.message || "No fue posible obtener las políticas publicadas.");
        }
        if (!Array.isArray(data)) {throw new Error("La respuesta del servidor no tiene el formato esperado.");}
        // Solo conservar políticas publicadas
        politicasPublicadas = data.filter(politica => politica.publicada === true);
        mostrarPoliticas();
    } catch (error) {
        console.error("Error al cargar las políticas:", error);
        listadoPoliticas.innerHTML = "";
        estadoPoliticas.textContent = "No fue posible cargar las políticas. Intenta nuevamente más tarde.";
        estadoPoliticas.classList.add("error");
    }
}

// mostrar las tarjetas activas
function mostrarPoliticas() {
    listadoPoliticas.innerHTML = "";
    if (politicasPublicadas.length === 0) {
        estadoPoliticas.textContent = "Actualmente no hay políticas publicadas para consultar.";
        return;
    }
    estadoPoliticas.textContent = `Se encontraron ${politicasPublicadas.length} política(s) publicada(s).`;
    politicasPublicadas.forEach(politica => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-politica";
        const tipo = document.createElement("span");
        tipo.className = "tipo-tarjeta-politica";
        tipo.textContent = politica.tipoPoliticaNombre || "Política institucional";
        const titulo = document.createElement("h3");
        titulo.textContent = politica.titulo || "Política sin título";
        const descripcion = document.createElement("p");
        const contenido = politica.contenido || "";
        descripcion.textContent = contenido.length > 140 ? contenido.substring(0, 140).trim() + "..." : contenido;
        const boton = document.createElement("button");
        boton.type = "button";
        boton.className = "boton-leer-politica";
        boton.textContent = "Leer política";
        boton.addEventListener("click", () => {mostrarDetallePolitica(politica);});
        tarjeta.appendChild(tipo);
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(descripcion);
        tarjeta.appendChild(boton);
        listadoPoliticas.appendChild(tarjeta);
    });
}
// Mostra el contenido
function mostrarDetallePolitica(politica) {
    if (!politica || politica.publicada !== true) {return;}
    tituloModalPolitica.textContent = politica.titulo || "Política institucional";
    versionModalPolitica.textContent = `Versión ${politica.version ?? "No especificada"}`;
    tipoModalPolitica.textContent = politica.tipoPoliticaNombre || "Política institucional";
    // textContent evita interpretar el contenido como HTML
    textoModalPolitica.textContent = politica.contenido || "Esta política no contiene información.";
    abrirModalPolitica();
}
// par abrir el modal
function abrirModalPolitica() {
    modalPolitica.hidden = false;
    modalPolitica.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-politica-abierto");
    botonCerrarModal.focus();
}
// para cerrar el modal
function cerrarModalPolitica() {
    modalPolitica.hidden = true;
    modalPolitica.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-politica-abierto");
}
// mustra el evendo del modal
botonCerrarModal.addEventListener("click", cerrarModalPolitica);
botonCerrarPolitica.addEventListener("click", cerrarModalPolitica);
// Cerrar al presionar fuera del contenido
modalPolitica.addEventListener("click", evento => {
    if (evento.target === modalPolitica) {cerrarModalPolitica();}
});
// Cerrar con Escape
document.addEventListener("keydown", evento => {
    if (evento.key === "Escape" && !modalPolitica.hidden) {cerrarModalPolitica();}
});
// boton para volver arriba
const btnSubir = document.getElementById("btnSubir");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
        btnSubir.style.display = "block";
    } else {btnSubir.style.display = "none";}
});
btnSubir.addEventListener("click", () => {window.scrollTo({top: 0, behavior: "smooth"});});
cargarPoliticasPublicadas();