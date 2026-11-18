const API_INFORMACION = "http://localhost:8083/api/informacion-institucional";
// const API_CONTACTOS_REINO = "http://localhost:8083/api/contactos-reino";
const API_CONTACTOS = "http://localhost:8083/api/contactos-reino";
// const API_USUARIOS_REINO = "http://localhost:8080/usuarios/listar";
const API_REINOS = "http://localhost:8083/api/catalogos/reinos";
const botonesInformacion = document.querySelectorAll(".boton-informacion-nosotros");
const modalInformacion = document.getElementById("modal-informacion-nosotros");
const tituloModal = document.getElementById("titulo-modal-nosotros");
const contenidoModal = document.getElementById("contenido-modal-nosotros");
const botonCerrarModal = document.getElementById("cerrar-modal-nosotros");
const botonCerrarInformacion = document.getElementById("boton-cerrar-informacion");
const estadoInformacion = document.getElementById("estado-informacion-nosotros");
const estadoContactosReino = document.getElementById("estado-contactos-reino");
const botonesReinosContacto = document.getElementById("botones-reinos-contacto");
// const detalleContactoReino = document.getElementById("detalle-contacto-reino");
// const nombreReinoContacto = document.getElementById("nombre-reino-contacto");
// const representanteContacto = document.getElementById("representante-contacto");
// const cargoContacto = document.getElementById("cargo-contacto");
// const correoContacto = document.getElementById("correo-contacto");
// const telefonoContacto = document.getElementById("telefono-contacto");
// const comunaContacto = document.getElementById("comuna-contacto");
// const grupoContacto = document.getElementById("grupo-contacto");

let contactosActivosReino = [];
// let usuariosContactosReino = [];
let informacionInstitucional = null;
const seccionesInformacion = {
    mision: {titulo: "Nuestra misión", campo: "mision"},
    vision: {titulo: "Nuestra visión", campo: "vision"},
    historia: {titulo: "Nuestra historia", campo: "historia"},
    valores: {titulo: "Nuestros valores", campo: "valores"}
};
// Ubicaciones configuradas manualmente para cada reino
const ubicacionesReinos = {
    1: {
        direccion: "Palena 1741",
        comuna: "Peñalolén",
        ubicacionMapa: "Palena 1741, 7911384 Peñalolén, Región Metropolitana"
    },
    2: {
        direccion: "Manuela Errázuriz 5862",
        comuna: "Pedro Aguirre Cerda",
        ubicacionMapa: "Manuela Errázuriz 5862, Pedro Aguirre Cerda, Región Metropolitana"
    }
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
// Obtener respuesta de una API
async function obtenerDatosAPI(url) {
    const respuesta = await fetch(url);
    const texto = await respuesta.text();
    let data = {};
    if (texto) {
        try {data = JSON.parse(texto);
        } catch (error) {throw new Error("El servidor devolvió una respuesta inválida.");}
    }
    if (!respuesta.ok) {
        throw new Error(data.message || data.error || `Error al consultar ${url}. Código: ${respuesta.status}`);
    }return data;
}
// Cargar contactos y usuarios
// async function cargarContactosReino() {
//     try {
//         // Solo se consulta el endpoint público de contactos.
//         const contactos = await obtenerDatosAPI(API_CONTACTOS_REINO);
//         contactosActivosReino = Array.isArray(contactos) ? contactos.filter(contacto => contacto.activo === true) : [];
//         mostrarBotonesReinos();
//     } catch (error) {
//         console.error("Error al cargar contactos por reino:", error);
//         estadoContactosReino.textContent = "No fue posible cargar los contactos. Intenta nuevamente más tarde.";
//         botonesReinosContacto.innerHTML = "";
//         detalleContactoReino.hidden = true;
//     }
// }
// Cargar contactos y usuarios
async function cargarContactosReino() {
    try {
        const [contactos, reinos] = await Promise.all([
            obtenerDatosAPI(API_CONTACTOS),
            obtenerDatosAPI(API_REINOS)
        ]);
        contactosActivosReino = contactos
            .filter(contacto => contacto.activo === true)
            .map(contacto => {
                const reino = reinos.find(item => item.id === contacto.reinoId);
                return {...contacto, comuna: reino?.comunaNombre || "No disponible"};
            });
        mostrarBotonesReinos();
    } catch (error) {
        console.error("Error al cargar contactos por reino:", error);
        estadoContactosReino.textContent = "No fue posible cargar los contactos. Intenta nuevamente más tarde.";
        botonesReinosContacto.innerHTML = "";
        detalleContactoReino.hidden = true;
    }
}
// Mostrar un botón por cada reino con contacto activo
// function mostrarBotonesReinos() {
//     botonesReinosContacto.innerHTML = "";
//     detalleContactoReino.hidden = true;
//     if (contactosActivosReino.length === 0) {estadoContactosReino.textContent = "Actualmente no hay representantes registrados."; return;}
//     // Evitar botones duplicados para un mismo reino
//     const contactosPorReino = new Map();
//     contactosActivosReino.forEach(contacto => {if (!contactosPorReino.has(contacto.reinoId)) {contactosPorReino.set(contacto.reinoId, contacto);}});
//     contactosPorReino.forEach(contacto => {
//         const boton = document.createElement("button");
//         boton.type = "button";
//         boton.classList.add("boton-reino-contacto");
//         boton.textContent = contacto.reinoNombre;
//         boton.addEventListener("click", () => {mostrarDetalleContacto(contacto);});
//         botonesReinosContacto.appendChild(boton);
//     });
//     estadoContactosReino.textContent = "Selecciona un reino para consultar sus datos de contacto.";
// }
// Mostrar un botón por cada reino con contacto activo
function mostrarBotonesReinos() {
    botonesReinosContacto.innerHTML = "";
    if (contactosActivosReino.length === 0) {
        estadoContactosReino.textContent = "Actualmente no hay representantes registrados.";
        return;
    }
    const contactosPorReino = new Map();
    contactosActivosReino.forEach(contacto => {
        if (!contactosPorReino.has(contacto.reinoId)) {contactosPorReino.set(contacto.reinoId, contacto);}
    });
    contactosPorReino.forEach(contacto => {
        const boton = document.createElement("button");
        boton.type = "button";
        boton.classList.add("boton-informacion-nosotros");
        boton.textContent = contacto.reinoNombre;
        boton.addEventListener("click", () => {mostrarDetalleContacto(contacto);});
        botonesReinosContacto.appendChild(boton);
    });
    estadoContactosReino.textContent = "Selecciona un reino para consultar sus datos de contacto.";
}
// Mostrar información del reino seleccionado
// function mostrarDetalleContacto(contacto) {
//     nombreReinoContacto.textContent = contacto.reinoNombre || "Reino sin nombre";
//     // El endpoint público no entrega el nombre del usuario.
//     // representanteContacto.textContent = "No disponible";
//     cargoContacto.textContent = contacto.cargo || "No informado";
//     correoContacto.textContent = contacto.correo || "No informado";
//     telefonoContacto.textContent = contacto.telefono || "No informado";
//     // El endpoint público tampoco entrega la comuna del usuario.
//     comunaContacto.textContent = contacto.comuna || "No disponible";
//     grupoContacto.textContent = contacto.reinoNombre || "No disponible";
//     detalleContactoReino.hidden = false;
//     detalleContactoReino.scrollIntoView({behavior: "smooth", block: "nearest"});
// }
// Mostrar información del reino seleccionado
function mostrarDetalleContacto(contacto) {
    const ubicacion = ubicacionesReinos[contacto.reinoId];
    tituloModal.textContent = contacto.reinoNombre || "Contacto del reino";
    contenidoModal.innerHTML = "";
    // Información del contacto
    const datos = [
        // {etiqueta: "Representante", valor: "No disponible"},
        {etiqueta: "Cargo", valor: contacto.cargo || "No informado"},
        {etiqueta: "Correo", valor: contacto.correo || "No informado", tipo: "correo"},
        {etiqueta: "Teléfono", valor: contacto.telefono || "No informado", tipo: "telefono"},
        {etiqueta: "Comuna", valor: ubicacion?.comuna || contacto.comuna || "No disponible"},
        {etiqueta: "Grupo Scout", valor: contacto.reinoNombre || "No disponible"}
    ];
    const lista = document.createElement("dl");
    lista.classList.add("datos-contacto-reino");
    datos.forEach(dato => {
        const contenedor = document.createElement("div");
        const etiqueta = document.createElement("dt");
        const valor = document.createElement("dd");
        etiqueta.textContent = dato.etiqueta;
        // para enviar un correo al contacto
        if (dato.tipo === "correo" && dato.valor !== "No informado") {
            const enlace = document.createElement("a");
            enlace.href = `mailto:${dato.valor}`;
            enlace.textContent = dato.valor;
            valor.appendChild(enlace);
        // para llamar al numero de contacto.
        } else if (dato.tipo === "telefono" && dato.valor !== "No informado") {
            const enlace = document.createElement("a");
            enlace.href = `tel:${dato.valor.replace(/[^\d+]/g, "")}`;
            enlace.textContent = dato.valor;
            valor.appendChild(enlace);
        } else {valor.textContent = dato.valor;}
        contenedor.appendChild(etiqueta);
        contenedor.appendChild(valor);
        lista.appendChild(contenedor);
    });
    contenidoModal.appendChild(lista);
    // Ubicación del grupo
    const seccionMapa = document.createElement("div");
    seccionMapa.classList.add("ubicacion-contacto-reino");
    const tituloUbicacion = document.createElement("h3");
    tituloUbicacion.textContent = "Ubicación del grupo";
    seccionMapa.appendChild(tituloUbicacion);
    if (ubicacion?.ubicacionMapa) {
        const ubicacionCodificada = encodeURIComponent(ubicacion.ubicacionMapa);
        const mapa = document.createElement("iframe");
        mapa.src = `https://maps.google.com/maps?q=${ubicacionCodificada}&output=embed`;
        mapa.title = `Ubicación de ${contacto.reinoNombre}`;
        mapa.loading = "lazy";
        mapa.referrerPolicy = "no-referrer-when-downgrade";
        seccionMapa.appendChild(mapa);
        const enlace = document.createElement("a");
        enlace.href = `https://www.google.com/maps/search/?api=1&query=${ubicacionCodificada}`;
        enlace.target = "_blank";
        enlace.rel = "noopener noreferrer";
        // enlace.textContent = "Ver ubicación en Google Maps";
        seccionMapa.appendChild(enlace);
    } else {
        const mensaje = document.createElement("p");
        mensaje.textContent = "Ubicación pendiente de registrar.";
        seccionMapa.appendChild(mensaje);
    }
    contenidoModal.appendChild(seccionMapa);
    abrirModal();
}
// Boton para subir
const btnSubir = document.getElementById("btnSubir");
window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {btnSubir.style.display = "block";
    } else {btnSubir.style.display = "none";}
});
btnSubir.addEventListener("click", () => {window.scrollTo({top: 0, behavior: "smooth"});});
// Eventos para cerrar la ventana
botonCerrarModal.addEventListener("click", cerrarModal);
botonCerrarInformacion.addEventListener("click", cerrarModal);
// Cerrar al hacer clic fuera de la ventana
modalInformacion.addEventListener("click", evento => {if (evento.target === modalInformacion) {cerrarModal();}});
// Cerrar con tecla Escape
document.addEventListener("keydown", evento => {if (evento.key === "Escape" && !modalInformacion.hidden) {cerrarModal();}});
// Inicializar página
cargarInformacionInstitucional();
// Inicializar contactos
cargarContactosReino();