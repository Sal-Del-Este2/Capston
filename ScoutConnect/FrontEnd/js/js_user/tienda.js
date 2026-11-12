
const API_FINANZAS = "http://localhost:8082";
const URL_PRODUCTOS = `${API_FINANZAS}/api/productos`;
const URL_ORDENES = `${API_FINANZAS}/api/ordenes`;
const CLAVE_CARRITO = "carritoScout";
const contenedorProductos = document.getElementById("contenedor-productos");
const mensajeTienda = document.getElementById("mensaje-tienda");
const cantidadCarrito = document.getElementById("cantidad-carrito");
const modalProducto = document.getElementById("modal-producto");
const cerrarProducto = document.querySelector(".cerrar-producto");
const nombreProductoModal = document.getElementById("nombre-producto-modal");
const descripcionProductoModal = document.getElementById("descripcion-producto-modal");
const precioProductoModal = document.getElementById("precio-producto-modal");
const stockProductoModal = document.getElementById("stock-producto-modal");
const botonAgregarCarrito = document.getElementById("agregar-carrito");
const modalCarrito = document.getElementById("modal-carrito");
const abrirCarrito = document.getElementById("abrir-carrito");
const cerrarCarrito = document.querySelector(".cerrar-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const totalCarrito = document.getElementById("total-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");
const botonVaciarCarrito = document.getElementById("vaciar-carrito");
const botonVaciarCarritoNavbar = document.getElementById("vaciar-carrito-navbar");
const botonConfirmarPago = document.getElementById("confirmar-pago");
const galeriaProductoModal = document.getElementById("galeria-producto-modal");
const modalComprobante = document.getElementById("modal-comprobante");
const cerrarComprobante = document.getElementById("cerrar-comprobante");
const tituloComprobante = document.getElementById("titulo-comprobante");
const mensajeResultadoPago = document.getElementById("mensaje-resultado-pago");
const detalleComprobante = document.getElementById("detalle-comprobante");
const comprobanteOrden = document.getElementById("comprobante-orden");
const comprobanteFecha = document.getElementById("comprobante-fecha");
const comprobanteEstado = document.getElementById("comprobante-estado");
const comprobanteProductos = document.getElementById("comprobante-productos");
const comprobanteNeto = document.getElementById("comprobante-neto");
const comprobanteIva = document.getElementById("comprobante-iva");
const comprobanteTotal = document.getElementById("comprobante-total");
const correoComprobante = document.getElementById("correo-comprobante");
const botonDescargarComprobante = document.getElementById("descargar-comprobante");
const botonEnviarComprobante = document.getElementById("enviar-comprobante");
const mensajeComprobante = document.getElementById("mensaje-comprobante");
let productos = [];
let productoSeleccionado = null;
let carrito = cargarCarrito();
let ordenComprobanteActual = null;
// Carrito de compra
function cargarCarrito() {
    try {
        const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
        if (!Array.isArray(guardado)) return [];
        return guardado
            .filter(item => item && Number.isInteger(Number(item.productoId)) && Number(item.productoId) > 0 && Number(item.cantidad) > 0)
            .map(item => ({productoId: Number(item.productoId), cantidad: Math.min(100, Math.floor(Number(item.cantidad)))}));
    } catch (error) {console.warn("No se pudo recuperar el carrito guardado:", error); return [];}
}
function guardarCarrito() {localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito)); actualizarCantidadCarrito();}
function actualizarCantidadCarrito() {cantidadCarrito.textContent = carrito.reduce((total, item) => total + item.cantidad, 0);}
function formatearMoneda(valor) {
    const numero = Number(valor);
    if (!Number.isFinite(numero)) {return "Precio no disponible";}
    return numero.toLocaleString("es-CL", {
        style: "currency",
        currency: "CLP",
        maximumFractionDigits: 0
    });
}
function obtenerPrecioVisible(producto) {return producto.precioConIva ?? producto.precio;}
function resolverUrlFoto(url) {
    if (!url) return "";
    try {return new URL(url, API_FINANZAS).href;
    } catch {return "";}
}
function obtenerImagenProducto(producto) {
    const foto = Array.isArray(producto.fotos) ? producto.fotos[0] : null;
    return foto?.url ? resolverUrlFoto(foto.url) : "";
}
function mostrarMensajeTienda(mensaje, esError = false) {
    mensajeTienda.textContent = mensaje || "";
    mensajeTienda.style.color = esError ? "#a52a2a" : "";
}
function mostrarMensajeCarrito(mensaje, esError = false) {
    mensajeCarrito.textContent = mensaje || "";
    mensajeCarrito.style.color = esError ? "#a52a2a" : "";
}
// Catalogo 
async function cargarProductos() {
    contenedorProductos.innerHTML = "<p>Cargando productos...</p>";
    mostrarMensajeTienda("");
    try {
        const respuesta = await fetch(`${URL_PRODUCTOS}?pagina=0&tamanio=100`);
        if (!respuesta.ok) {throw new Error(`No fue posible cargar el catálogo (${respuesta.status}).`);}
        const data = await respuesta.json();
        productos = Array.isArray(data) ? data : (Array.isArray(data.content) ? data.content : []);
        productos = productos.filter(producto => producto && producto.id != null && (!producto.estado || String(producto.estado).toUpperCase() === "ACTIVO")
        );
        renderizarProductos();
        actualizarCantidadCarrito();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        contenedorProductos.innerHTML = "";
        mostrarMensajeTienda("No fue posible cargar los productos. Verifica que MS-Finanzas esté disponible.", true);
    }
}
function renderizarProductos() {
    contenedorProductos.innerHTML = "";
    if (productos.length === 0) {contenedorProductos.innerHTML = "<p>No hay productos disponibles en este momento.</p>"; return;}
    productos.forEach(producto => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "tarjeta-producto";
        const contenedorImagen = document.createElement("div");
        contenedorImagen.className = "imagen-producto";
        const urlImagen = obtenerImagenProducto(producto);
        if (urlImagen) {
            const imagen = document.createElement("img");
            imagen.src = urlImagen;
            imagen.alt = producto.titulo || "Producto scout";
            imagen.onerror = () => {contenedorImagen.innerHTML = '<span class="sin-imagen-producto">Imagen no disponible</span>';};
            contenedorImagen.appendChild(imagen);
        } else {
            const sinImagen = document.createElement("span");
            sinImagen.className = "sin-imagen-producto";
            sinImagen.textContent = "Imagen no disponible";
            contenedorImagen.appendChild(sinImagen);
        }
        const contenido = document.createElement("div");
        contenido.className = "contenido-producto";
        const titulo = document.createElement("h2");
        titulo.textContent = producto.titulo || "Producto sin título";
        const descripcion = document.createElement("p");
        descripcion.textContent = producto.detalle || "Sin descripción disponible.";
        const precio = document.createElement("strong");
        precio.textContent = formatearMoneda(obtenerPrecioVisible(producto));
        const acciones = document.createElement("div");
        acciones.className = "acciones-producto";
        const botonVer = document.createElement("button");
        botonVer.type = "button";
        botonVer.className = "boton-producto";
        botonVer.textContent = "Ver";
        botonVer.addEventListener("click", () => {abrirDetalleProducto(producto);});
        const botonAgregar = document.createElement("button");
        botonAgregar.type = "button";
        botonAgregar.className = "boton-agregar";
        botonAgregar.textContent = "+";
        botonAgregar.title = "Agregar al carrito";
        const sinStock = Number(producto.stock) <= 0;
        botonAgregar.disabled = sinStock;
        if (sinStock) {botonAgregar.textContent = "Sin stock"; botonAgregar.title = "Producto sin stock";}
        botonAgregar.addEventListener("click", () => {agregarProducto(producto);});
        acciones.append(botonVer, botonAgregar);
        contenido.append(titulo, descripcion, precio, acciones);
        tarjeta.append(contenedorImagen, contenido);
        contenedorProductos.appendChild(tarjeta);
    });
}
// Detalle del producto
function abrirDetalleProducto(producto) {
    productoSeleccionado = producto;
    mostrarGaleriaProducto(producto);
    nombreProductoModal.textContent = producto.titulo || "Producto";
    descripcionProductoModal.textContent = producto.detalle || "Sin descripción disponible.";
    precioProductoModal.textContent = formatearMoneda(obtenerPrecioVisible(producto));
    stockProductoModal.textContent = `Stock disponible: ${Number(producto.stock) || 0}`;
    botonAgregarCarrito.disabled = Number(producto.stock) <= 0;
    modalProducto.style.display = "block";
}
function mostrarGaleriaProducto(producto) {
    galeriaProductoModal.innerHTML = "";
    galeriaProductoModal.style.display = "flex";
    galeriaProductoModal.style.justifyContent = "center";
    galeriaProductoModal.style.alignItems = "center";
    galeriaProductoModal.style.flexWrap = "wrap";
    galeriaProductoModal.style.gap = "10px";
    galeriaProductoModal.style.margin = "15px 0";
    const fotos = Array.isArray(producto.fotos) ? producto.fotos : [];
    if (fotos.length === 0) {galeriaProductoModal.textContent = "Imagen no disponible."; return;}
    fotos.forEach((foto, indice) => {
        if (!foto.url) return;
        const imagen = document.createElement("img");
        imagen.src = resolverUrlFoto(foto.url);
        imagen.alt = `${producto.titulo || "Producto"} - imagen ${indice + 1}`;
        imagen.style.width = "110px";
        imagen.style.height = "110px";
        imagen.style.objectFit = "contain";
        imagen.style.borderRadius = "8px";
        imagen.style.backgroundColor = "#ffffff";
        imagen.onerror = () => {imagen.remove();};
        galeriaProductoModal.appendChild(imagen);
    });
}
function cerrarModal(modal) {modal.style.display = "none";}
//Agregar productos en el carrito
function agregarProducto(producto) {
    const stock = Number(producto.stock);
    if (!Number.isFinite(stock) || stock <= 0) {alert("Este producto no tiene stock disponible."); return;}
    const existente = carrito.find(item => item.productoId === Number(producto.id));
    const cantidadActual = existente ? existente.cantidad : 0;
    if (cantidadActual >= stock) {alert("No puedes agregar más unidades que el stock disponible."); return;}
    if (existente) {existente.cantidad += 1;
    } else {carrito.push({productoId: Number(producto.id), cantidad: 1});}
    guardarCarrito();
    if (modalProducto.style.display === "block") {cerrarModal(modalProducto);}
    mostrarMensajeCarrito("Producto agregado al carrito.");
}
function obtenerProducto(productoId) {return productos.find(producto => Number(producto.id) === Number(productoId));}
function mostrarCarrito() {
    listaCarrito.innerHTML = "";
    let totalVisual = 0;
    let hayProductoNoDisponible = false;
    if (carrito.length === 0) {
        listaCarrito.innerHTML = "<p>Tu carrito está vacío.</p>";
        totalCarrito.textContent = formatearMoneda(0);
        botonConfirmarPago.disabled = true;
        return;
    }
    carrito.forEach((item, indice) => {
        const producto = obtenerProducto(item.productoId);
        const fila = document.createElement("div");
        fila.className = "item-carrito";
        const descripcion = document.createElement("span");
        const botonEliminar = document.createElement("button");
        botonEliminar.type = "button";
        botonEliminar.className = "eliminar-producto";
        botonEliminar.textContent = "Eliminar";
        botonEliminar.addEventListener("click", () => {
            carrito.splice(indice, 1);
            guardarCarrito();
            mostrarCarrito();
        });
        if (!producto) {
            descripcion.textContent = `Producto ID ${item.productoId}: ya no está disponible en el catálogo.`;
            hayProductoNoDisponible = true;
        } else {
            const precio = Number(obtenerPrecioVisible(producto));
            descripcion.textContent = `${producto.titulo} × ${item.cantidad} — ${formatearMoneda(precio * item.cantidad)}`;
            if (Number.isFinite(precio)) {totalVisual += precio * item.cantidad;}
            if (item.cantidad > Number(producto.stock)) {hayProductoNoDisponible = true; descripcion.textContent += " (stock insuficiente)";}
        }
        fila.append(descripcion, botonEliminar);
        listaCarrito.appendChild(fila);
    });
    totalCarrito.textContent = formatearMoneda(totalVisual);
    botonConfirmarPago.disabled = hayProductoNoDisponible || carrito.length === 0;
    if (hayProductoNoDisponible) {
        mostrarMensajeCarrito("Revisa los productos sin disponibilidad o con stock insuficiente.");
    } else {mostrarMensajeCarrito("");}
}
function vaciarCarrito() {
    if (carrito.length === 0) {alert("El carrito ya está vacío."); return;}
    if (!confirm("¿Deseas eliminar todos los productos del carrito?")) {return;}
    carrito = [];
    guardarCarrito();
    mostrarCarrito();
    mostrarMensajeCarrito("Carrito vaciado.");
}
// Crear la orden de pago par ainiciar con WebPay
async function confirmarCompra() {
    if (carrito.length === 0) {alert("Tu carrito está vacío."); return;}
    const items = carrito.map(item => ({productoId: item.productoId, cantidad: item.cantidad}));
    botonConfirmarPago.disabled = true;
    botonConfirmarPago.textContent = "Conectando con Webpay...";
    mostrarMensajeCarrito("");
    try {
        const respuesta = await fetchAutenticado(URL_ORDENES, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ items })
        });
        const data = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {throw new Error(data.error || data.mensaje || `No se pudo crear la orden (${respuesta.status}).`);}
        if (!data.url || !data.token) {throw new Error("El backend no devolvió los datos de inicio de Webpay (url y token).");}
        if (data.ordenId != null) {sessionStorage.setItem("ordenScoutPendiente", String(data.ordenId));}
        const formulario = document.createElement("form");
        formulario.method = "POST";
        formulario.action = data.url;
        const campoToken = document.createElement("input");
        campoToken.type = "hidden";
        campoToken.name = "token_ws";
        campoToken.value = data.token;
        formulario.appendChild(campoToken);
        document.body.appendChild(formulario);
        formulario.submit();
    } catch (error) {
        console.error("Error al iniciar la compra:", error);
        mostrarMensajeCarrito(error.message || "No fue posible iniciar el pago.", true);
        botonConfirmarPago.disabled = false;
        botonConfirmarPago.textContent = "Continuar a Webpay";
    }
}
// Resultado del pago con WebPay
function mostrarResultadoPago(titulo, mensaje) {
    tituloComprobante.textContent = titulo;
    mensajeResultadoPago.textContent = mensaje;
    detalleComprobante.hidden = true;
    modalComprobante.style.display = "block";
}
async function procesarRetornoWebpay() {
    const parametros = new URLSearchParams(window.location.search);
    const resultadoPago = parametros.get("pago");
    if (!resultadoPago) {return;}
    let ordenId = parametros.get("ordenId");
    if (!ordenId) {ordenId = sessionStorage.getItem("ordenScoutPendiente");}
    // Eliminar parámetros de retorno de la dirección del navegador.
    window.history.replaceState({}, document.title, window.location.pathname);
    switch (resultadoPago) {
        case "aprobado":
            if (!ordenId || !/^\d+$/.test(ordenId)) {
                mostrarResultadoPago("Pago aprobado", "El pago fue aprobado, pero no se pudo identificar la orden. Contacta al administrador.");
                return;
            }
            await consultarOrdenComprobante(ordenId);
            break;
        case "rechazado":
            mostrarResultadoPago("Pago rechazado", "Transbank no aprobó el pago. Tu carrito se ha conservado.");
            break;
        case "cancelado":
            mostrarResultadoPago("Pago cancelado", "La operación fue cancelada. Puedes volver a intentarlo desde tu carrito.");
            break;
        case "error":
            mostrarResultadoPago("No se pudo confirmar el pago", "No fue posible obtener la confirmación de la operación. Verifica el estado de tu compra antes de intentarlo nuevamente.");
            break;
        default: mostrarResultadoPago("Resultado desconocido", "No se reconoció el resultado de la operación.");
        break;
    }
}
// Mostrar comprobante
async function consultarOrdenComprobante(ordenId) {
    try {
        mensajeResultadoPago.textContent = "Pago aprobado. Consultando los datos de tu compra...";
        modalComprobante.style.display = "block";
        const respuesta = await fetchAutenticado(`${URL_ORDENES}/mias/${encodeURIComponent(ordenId)}`, {method: "GET"});
        const orden = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {throw new Error(orden.error || orden.mensaje || `No fue posible consultar la orden (${respuesta.status}).`);}
        if (Number(orden.id) !== Number(ordenId)) {throw new Error("La orden recibida no coincide con la solicitada.");}
        if (!Array.isArray(orden.detalles)) {throw new Error("La orden no contiene un detalle válido.");}
        mostrarComprobante(orden);
        // El carrito se limpia solamente después de recuperar la orden.
        carrito = [];
        guardarCarrito();
        sessionStorage.removeItem("ordenScoutPendiente");
        botonConfirmarPago.textContent = "Continuar a Webpay";
    } catch (error) {
        console.error("Error al consultar el comprobante:", error);
        tituloComprobante.textContent = "Pago aprobado";
        mensajeResultadoPago.textContent = "El pago fue aprobado, pero no se pudieron recuperar los datos de la orden. Puedes consultar tu compra en Mis compras.";
        detalleComprobante.hidden = true;
    }
}
function mostrarComprobante(orden) {
    ordenComprobanteActual = orden;
    tituloComprobante.textContent = "¡Compra realizada!";
    mensajeResultadoPago.textContent = "Tu pago fue aprobado. Estos son los datos de tu compra.";
    comprobanteOrden.textContent = `#${orden.id}`;
    comprobanteFecha.textContent = orden.fecha ? new Date(orden.fecha).toLocaleString("es-CL") : "No disponible";
    comprobanteEstado.textContent = orden.estadoPago || "No disponible";
    comprobanteNeto.textContent = formatearMoneda(orden.neto);
    comprobanteIva.textContent = formatearMoneda(orden.montoImpuesto);
    comprobanteTotal.textContent = formatearMoneda(orden.total);
    comprobanteProductos.innerHTML = "";
    orden.detalles.forEach(detalle => {
        const fila = document.createElement("div");
        fila.className = "detalle-comprobante-producto";
        // Imagen del producto desde el catálogo cargado.
        const producto = obtenerProducto(detalle.productoId);
        const urlImagen = producto ? obtenerImagenProducto(producto) : "";
        const contenedorImagen = document.createElement("div");
        contenedorImagen.className = "comprobante-imagen-producto";
        if (urlImagen) {
            const imagen = document.createElement("img");
            imagen.src = urlImagen;
            imagen.alt = detalle.nombreProducto || "Producto scout";
            imagen.onerror = () => {contenedorImagen.textContent = "Sin imagen";};
            contenedorImagen.appendChild(imagen);
        } else {contenedorImagen.textContent = "Sin imagen";}
        const nombre = document.createElement("p");
        nombre.className = "comprobante-producto-nombre";
        nombre.textContent = detalle.nombreProducto || "Producto sin nombre";
        const cantidad = document.createElement("span");
        cantidad.className = "comprobante-producto-cantidad";
        cantidad.textContent = `Cant: ${detalle.cantidad}`;
        const precio = document.createElement("span");
        precio.className = "comprobante-producto-precio";
        precio.textContent = `Precio: ${formatearMoneda(detalle.precioUnitario)}`;
        const subtotal = document.createElement("strong");
        subtotal.className = "comprobante-producto-subtotal";
        subtotal.textContent = `Subtotal: ${formatearMoneda(detalle.subtotal)}`;
        const informacion = document.createElement("div");
        informacion.className = "comprobante-producto-informacion";
        informacion.append(nombre, cantidad, precio, subtotal);
        fila.append(contenedorImagen, informacion);
        comprobanteProductos.appendChild(fila);
    });
    detalleComprobante.hidden = false;
    botonDescargarComprobante.disabled = false;
    botonEnviarComprobante.disabled = false;
    mensajeComprobante.textContent = "Puedes descargar tu comprobante en PDF o enviarlo a una dirección de correo electrónico.";
    correoComprobante.value = "";
}
async function cargarImagenParaPDF(url) {
    if (!url) return null;
    let objectUrl = null;
    try {const respuesta = await fetch(url);
        if (!respuesta.ok) {throw new Error(`No se pudo cargar la imagen: ${respuesta.status}`);}
        const blob = await respuesta.blob();
        objectUrl = URL.createObjectURL(blob);
        const imagen = new Image();
        await new Promise((resolve, reject) => {
            imagen.onload = resolve;
            imagen.onerror = () => reject(new Error("Imagen no válida"));
            imagen.src = objectUrl;
        });
        const canvas = document.createElement("canvas");
        canvas.width = imagen.naturalWidth;
        canvas.height = imagen.naturalHeight;
        const contexto = canvas.getContext("2d");
        contexto.drawImage(imagen, 0, 0);
        return canvas.toDataURL("image/png");
    } catch (error) {console.warn("No fue posible incorporar una imagen al PDF:", url, error); return null;
    } finally {
        if (objectUrl) {URL.revokeObjectURL(objectUrl);}
    }
}
async function descargarComprobantePDF() {
    if (!ordenComprobanteActual) {mensajeComprobante.textContent = "No hay información disponible para generar el comprobante."; return;}
    if (!window.jspdf || !window.jspdf.jsPDF) {mensajeComprobante.textContent = "No se pudo cargar la biblioteca para generar el PDF."; return;}
    botonDescargarComprobante.disabled = true;
    botonDescargarComprobante.textContent = "Generando PDF...";
    try {
        const orden = ordenComprobanteActual;
        const { jsPDF } = window.jspdf;
        const documento = new jsPDF();
        // Logo de la plataforma.
        const logo = await cargarImagenParaPDF(new URL("../img/ScoutConnet_2026.png", window.location.href).href);
        // Preparar imágenes de los productos.
        const productosPDF = await Promise.all(
            orden.detalles.map(async detalle => {
                const producto = obtenerProducto(detalle.productoId);
                const urlImagen = producto ? obtenerImagenProducto(producto) : "";
                return {detalle, imagen: await cargarImagenParaPDF(urlImagen)};
            })
        );
        const anchoPagina = documento.internal.pageSize.getWidth();
        const altoPagina = documento.internal.pageSize.getHeight();
        const margen = 15;
        let posicionY = 20;
        // Encabezado.
        if (logo) {documento.addImage(logo, "PNG", margen, posicionY, 25, 25);}
        documento.setFont("helvetica", "bold");
        documento.setFontSize(20);
        documento.text("Comunidad Scout", 47, posicionY + 10);
        documento.setFont("helvetica", "normal");
        documento.setFontSize(10);
        documento.text("Comprobante de compra", 47, posicionY + 17);
        posicionY += 35;
        documento.setDrawColor(190, 190, 190);
        documento.line(margen, posicionY, anchoPagina - margen, posicionY);
        posicionY += 10;
        // Datos de la orden.
        documento.setFontSize(11);
        documento.setFont("helvetica", "bold");
        documento.text(`Orden: #${orden.id}`, margen, posicionY);
        documento.setFont("helvetica", "normal");
        documento.text(`Estado: ${orden.estadoPago || "No disponible"}`, anchoPagina - margen, posicionY, { align: "right" });
        posicionY += 8;
        documento.text(`Fecha: ${orden.fecha ? new Date(orden.fecha).toLocaleString("es-CL") : "No disponible"}`, margen, posicionY);
        posicionY += 12;
        // Encabezado de productos.
        documento.setFont("helvetica", "bold");
        documento.setFontSize(12);
        documento.text("Productos", margen, posicionY);
        posicionY += 8;
        documento.setFontSize(9);
        documento.text("Producto", 42, posicionY);
        documento.text("Cant.", 112, posicionY, { align: "center" });
        documento.text("Precio", 145, posicionY, { align: "right" });
        documento.text("Subtotal", 195, posicionY, { align: "right" });
        posicionY += 3;
        documento.line(margen, posicionY, anchoPagina - margen, posicionY);
        posicionY += 7;
        // Detalle de productos.
        documento.setFont("helvetica", "normal");
        documento.setFontSize(9);
        for (const item of productosPDF) {
            const detalle = item.detalle;
            const nombre = documento.splitTextToSize(detalle.nombreProducto || "Producto sin nombre", 65);
            const alturaNombre = Math.max(nombre.length * 4, 8);
            const alturaFila = Math.max(23, alturaNombre + 8);
            // Comprobar espacio antes de dibujar el producto.
            if (posicionY + alturaFila > altoPagina - 35) {
                documento.addPage();
                posicionY = 20;
                documento.setFont("helvetica", "bold");
                documento.text("Productos (continuación)", margen, posicionY);
                posicionY += 10;
                documento.setFont("helvetica", "normal");
            }
            // Fotografía del producto.
            if (item.imagen) {
                documento.addImage(item.imagen, "PNG", margen, posicionY, 18, 18, undefined, "FAST");
            } else {
                documento.setDrawColor(200, 200, 200);
                documento.rect(margen, posicionY, 18, 18);
            }
            documento.text(nombre, 42, posicionY + 5);
            documento.text(String(detalle.cantidad), 112, posicionY + 5, { align: "center" });
            documento.text(formatearMoneda(detalle.precioUnitario), 145, posicionY + 5, { align: "right" });
            documento.text(formatearMoneda(detalle.subtotal), 195, posicionY + 5, { align: "right" });
            posicionY += alturaFila;
            documento.setDrawColor(220, 220, 220);
            documento.line(margen, posicionY, anchoPagina - margen, posicionY);
            posicionY += 5;
        }
        // Resumen tributario.
        if (posicionY + 40 > altoPagina - 15) {documento.addPage(); posicionY = 20;}
        posicionY += 5;
        documento.line(115, posicionY, anchoPagina - margen, posicionY);
        posicionY += 9;
        documento.setFont("helvetica", "normal");
        documento.setFontSize(10);
        documento.text("Neto total:", 125, posicionY);
        documento.text(formatearMoneda(orden.neto), anchoPagina - margen, posicionY, { align: "right" });
        posicionY += 8;
        documento.text("IVA:", 125, posicionY);
        documento.text(formatearMoneda(orden.montoImpuesto), anchoPagina - margen, posicionY, { align: "right" });
        posicionY += 10;
        documento.setFont("helvetica", "bold");
        documento.setFontSize(14);
        documento.text("TOTAL:", 125, posicionY);
        documento.text(formatearMoneda(orden.total), anchoPagina - margen, posicionY, { align: "right" });
        documento.save(`Comprobante_ScoutConnect_Orden_${orden.id}.pdf`);
        mensajeComprobante.textContent = "El comprobante PDF con las imágenes se ha generado correctamente.";
    } catch (error) {console.error("Error al generar el PDF:", error);
        mensajeComprobante.textContent = "No fue posible generar el comprobante PDF.";
    } finally {
        botonDescargarComprobante.disabled = false;
        botonDescargarComprobante.textContent = "Descargar en PDF";
    }
}
async function enviarComprobanteCorreo() {
    if (!ordenComprobanteActual) {mensajeComprobante.textContent = "No hay una orden disponible para enviar."; return;}
    const correo = correoComprobante.value.trim();
    if (!correo) {mensajeComprobante.textContent = "Ingresa el correo electrónico destinatario.";
        correoComprobante.focus();
        return;
    }
    if (!correoComprobante.checkValidity()) {correoComprobante.reportValidity(); return;}
    const ordenId = ordenComprobanteActual.id;
    botonEnviarComprobante.disabled = true;
    botonEnviarComprobante.textContent = "Enviando...";
    mensajeComprobante.textContent = "Generando el comprobante y enviando el correo...";
    try {
        const respuesta = await fetchAutenticado(`${URL_ORDENES}/mias/${encodeURIComponent(ordenId)}/comprobante`,
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({correo: correo})
            }
        );
        const data = await respuesta.json().catch(() => ({}));
        if (!respuesta.ok) {throw new Error(data.error || data.mensaje || `No fue posible enviar el comprobante (${respuesta.status}).`);}
        mensajeComprobante.textContent = data.mensaje || `Comprobante enviado correctamente a ${correo}.`;
        correoComprobante.value = "";
    } catch (error) {
        console.error("Error al enviar comprobante:", error);
        mensajeComprobante.textContent = error.message || "No fue posible enviar el comprobante.";
    } finally {
        botonEnviarComprobante.disabled = false;
        botonEnviarComprobante.textContent = "Enviar por correo";
    }
}

cerrarProducto.addEventListener("click", () => {cerrarModal(modalProducto);});
cerrarCarrito.addEventListener("click", () => {cerrarModal(modalCarrito);});
abrirCarrito.addEventListener("click", () => {mostrarCarrito();modalCarrito.style.display = "block";});
botonAgregarCarrito.addEventListener("click", () => {if (productoSeleccionado) {agregarProducto(productoSeleccionado);}});
botonVaciarCarrito.addEventListener("click", vaciarCarrito);
botonVaciarCarritoNavbar.addEventListener("click", vaciarCarrito);
botonConfirmarPago.addEventListener("click", confirmarCompra);
botonDescargarComprobante.addEventListener("click", descargarComprobantePDF);
botonEnviarComprobante.addEventListener("click", enviarComprobanteCorreo);
cerrarComprobante.addEventListener("click", () => {cerrarModal(modalComprobante);});
window.addEventListener("click", evento => {
    if (evento.target === modalProducto) {cerrarModal(modalProducto);}
    if (evento.target === modalCarrito) {cerrarModal(modalCarrito);}
    if (evento.target === modalComprobante) {cerrarModal(modalComprobante);}
});
actualizarCantidadCarrito();
cargarProductos();
procesarRetornoWebpay();