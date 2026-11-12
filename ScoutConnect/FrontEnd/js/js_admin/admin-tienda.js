const API_FINANZAS = "http://localhost:8082/api";
const API_FINANZAS_BASE = "http://localhost:8082";
const API_USUARIOS = "http://localhost:8080";
const URL_GRUPOS = `${API_FINANZAS}/catalogos/grupos`;
const URL_RAMAS = `${API_FINANZAS}/catalogos/ramas`;
let productos = [];
let pedidos = [];
let grupos = [];
let ramas = [];
let fotosEdicion = [];
const listaProductos = document.getElementById("lista-productos-admin");
const listaPedidos = document.getElementById("lista-pedidos-admin");
const productosActivos = document.getElementById("productos-activos-admin");
const productosStockBajo = document.getElementById("stock-bajo-admin");
const pedidosPendientes = document.getElementById("pedidos-pendientes-admin");
const totalVendido = document.getElementById("total-vendido-admin");
const pestanaProductos = document.getElementById("pestana-productos");
const pestanaPedidos = document.getElementById("pestana-pedidos");
const seccionProductos = document.getElementById("seccion-productos-admin");
const seccionPedidos = document.getElementById("seccion-pedidos-admin");
const buscarProducto = document.getElementById("buscar-producto");
const filtroGrupo = document.getElementById("filtro-grupo-producto");
const filtroRama = document.getElementById("filtro-rama-producto");
const filtroStock = document.getElementById("filtro-stock-producto");
const filtroEstadoProducto = document.getElementById("filtro-estado-producto");
const buscarPedido = document.getElementById("buscar-pedido");
const filtroEstadoPedido = document.getElementById("filtro-estado-pedido");
const sinResultadosProductos = document.getElementById("sin-resultados-productos");
const sinResultadosPedidos = document.getElementById("sin-resultados-pedidos");
const botonNuevoProducto = document.getElementById("boton-nuevo-producto");
const contenedorFormulario = document.getElementById("contenedor-formulario-producto");
const formularioProducto = document.getElementById("form-producto");
const tituloFormulario = document.getElementById("titulo-formulario-producto");
const cerrarFormulario = document.getElementById("cerrar-formulario-producto");
const cancelarFormulario = document.getElementById("cancelar-formulario-producto");
const campoNombre = document.getElementById("nombre-producto-admin");
const campoGrupo = document.getElementById("grupo-producto-admin");
const campoRama = document.getElementById("rama-producto-admin");
const campoPrecio = document.getElementById("precio-producto-admin");
const campoStock = document.getElementById("stock-producto-admin");
const campoEstado = document.getElementById("estado-producto-admin");
const campoDescripcion = document.getElementById("descripcion-producto-admin");
const campoImagenes = document.getElementById("imagenes-producto-admin");
const vistaPreviaImagenes = document.getElementById("vista-previa-imagenes");
const botonCerrarSesion = document.getElementById("cerrar-sesion-admin");
const formatterCLP = new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
});
function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto ?? "");
    return elemento.innerHTML;
}
function formatearFecha(fecha) {
    if (!fecha) {return "";}
    return new Date(fecha).toLocaleString("es-CL", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}
function obtenerImagenPrincipal(producto) {
    const fotos = producto.fotos || [];
    if (fotos.length === 0) {return "";}
    const principal = fotos.find(function (foto) {return foto.ordenVisualizacion === 1;});
    return (principal || fotos[0]).url;
}
function cargarOpcionesFiltro(select, elementos, textoTodos) {
    select.innerHTML = `<option value="TODOS">${textoTodos}</option>`;
    elementos.forEach(function (elemento) {const opcion = document.createElement("option");
        opcion.value = elemento.id;
        opcion.textContent = elemento.nombre;
        select.appendChild(opcion);
    });
}
function cargarOpcionesFormulario(select, elementos, textoInicial) {
    select.innerHTML = `<option value="">${textoInicial}</option>`;
    elementos.forEach(function (elemento) {const opcion = document.createElement("option");
        opcion.value = elemento.id;
        opcion.textContent = elemento.nombre;
        select.appendChild(opcion);
    });
}
async function cargarCatalogos() {
    try {
        const [respuestaGrupos, respuestaRamas] = await Promise.all([
            fetchAutenticado(URL_GRUPOS),
            fetchAutenticado(URL_RAMAS)
        ]);
        const gruposData = await leerRespuesta(respuestaGrupos);
        const ramasData = await leerRespuesta(respuestaRamas);
        if (!respuestaGrupos.ok || !Array.isArray(gruposData)) {
            throw new Error("No se pudieron cargar los grupos.");
        }
        if (!respuestaRamas.ok || !Array.isArray(ramasData)) {
            throw new Error("No se pudieron cargar las ramas.");
        }
        grupos = gruposData;
        ramas = ramasData;
        cargarOpcionesFiltro(filtroGrupo, grupos, "Todos");
        cargarOpcionesFiltro(filtroRama, ramas, "Todas");
        cargarOpcionesFormulario(campoGrupo, grupos, "Seleccione un grupo");
        cargarOpcionesFormulario(campoRama, ramas, "Seleccione una rama");
    } catch (error) {
        console.error("Error al cargar catálogos:", error);
        if (obtenerToken()) {
            alert(error.message || "No se pudieron cargar grupos y ramas.");
        }
    }
}
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {return {};}
    try {return JSON.parse(texto);
    } catch (error) {return { error: texto };}
}
async function cargarProductos() {
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/admin?page=0&size=100`);
        if (!respuesta.ok) {throw new Error("No fue posible cargar los productos.");}
        const data = await respuesta.json();
        productos = data.content || [];
        mostrarProductos();
    } catch (error) {console.error("Error al cargar productos:", error); alert(error.message || "No fue posible cargar los productos.");}
}
async function cargarPedidos() {
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/admin/ordenes?page=0&size=100`);
        if (!respuesta.ok) {throw new Error("No fue posible cargar los pedidos.");}
        const data = await respuesta.json();
        pedidos = data.content || [];
        mostrarPedidos();
    } catch (error) {console.error("Error al cargar pedidos:", error); alert(error.message || "No fue posible cargar los pedidos.");}
}
function actualizarIndicadores() {
    const activos = productos.filter(function (producto) {return producto.estado === "ACTIVO";});
    const stockBajo = activos.filter(function (producto) {return producto.stock <= 10;});
    const pendientes = pedidos.filter(function (pedido) {
        return [
            "PENDIENTE",
            "EN_PROCESO",
            "PENDIENTE_ENTREGA"
        ].includes(pedido.estado);
    });
    const ventas = pedidos
        .filter(function (pedido) {return pedido.estado === "ENTREGADO";})
        .reduce(function (total, pedido) {return total + Number(pedido.total || 0);}, 0);
    productosActivos.textContent = activos.length;
    productosStockBajo.textContent = stockBajo.length;
    pedidosPendientes.textContent = pendientes.length;
    totalVendido.textContent = formatterCLP.format(ventas);
}
function obtenerProductosFiltrados() {
    const texto = buscarProducto.value.trim().toLowerCase();
    const grupo = filtroGrupo.value;
    const rama = filtroRama.value;
    const stock = filtroStock.value;
    const estado = filtroEstadoProducto.value;
    return productos.filter(function (producto) {
        const coincideTexto = texto === "" || producto.titulo.toLowerCase().includes(texto);
        const coincideGrupo = grupo === "TODOS" || String(producto.grupoId) === grupo;
        const coincideRama = rama === "TODOS" || String(producto.ramaId) === rama;
        const coincideStock = stock === "TODOS" || (stock === "BAJO" && producto.stock >= 0 && producto.stock <= 10);
        const coincideEstado = estado === "TODOS" || producto.estado === estado;
        return coincideTexto && coincideGrupo && coincideRama && coincideStock && coincideEstado;
    });
}
function mostrarProductos() {
    const filtrados = obtenerProductosFiltrados();
    listaProductos.innerHTML = "";
    sinResultadosProductos.hidden = filtrados.length !== 0;
    filtrados.forEach(function (producto) {
        const fila = document.createElement("tr");
        const imagen = obtenerImagenPrincipal(producto);
        const urlImagen = imagen
            ? `${API_FINANZAS_BASE}${imagen}`
            : "";
        const claseEstado = producto.estado === "ACTIVO"
            ? "estado-activo-admin"
            : "estado-inactivo-admin";
        fila.innerHTML = `
            <td>
                ${urlImagen
                    ? `<img src="${escaparHTML(urlImagen)}" alt="${escaparHTML(producto.titulo)}" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;">`
                    : `<span class="producto-sin-imagen">Sin imagen</span>`}
            </td>
            <td>
                <strong>${escaparHTML(producto.titulo)}</strong>
                <br>
                <small>${escaparHTML(producto.detalle || "")}</small>
            </td>
            <td>${escaparHTML(producto.grupoNombre || "")}</td>
            <td>${escaparHTML(producto.ramaNombre || "")}</td>
            <td>${formatterCLP.format(producto.precio)}</td>
            <td>${producto.stock}</td>
            <td><span class="estado-usuario-admin ${claseEstado}">${escaparHTML(producto.estado)}</span></td>
            <td>
                <div class="acciones-tabla-admin">
                    <button type="button" class="boton-editar-admin" data-id="${producto.id}">Editar</button>
                    
                    <button type="button" class="boton-estado-producto" data-id="${producto.id}"> ${producto.estado === "ACTIVO" ? "Pausar" : "Activar"}</button>
                </div>
            </td>
        `;
        listaProductos.appendChild(fila);
    });
    activarBotonesProductos();
    actualizarIndicadores();
}
function activarBotonesProductos() {
    document.querySelectorAll(".boton-editar-admin").forEach(function (boton) {
        boton.addEventListener("click", function () {abrirEdicionProducto(Number(boton.dataset.id));});
    });
    document.querySelectorAll(".boton-estado-producto").forEach(function (boton) {
        boton.addEventListener("click", function () {cambiarEstadoProducto(Number(boton.dataset.id));});
    });
}
function abrirNuevoProducto() {
    formularioProducto.reset();
    document.getElementById("producto-id").value = "";
    campoEstado.value = "true";
    vistaPreviaImagenes.innerHTML = "";
    tituloFormulario.textContent = "Nuevo producto";
    contenedorFormulario.hidden = false;
    campoNombre.focus();
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function mostrarVistaPreviaEdicion() {vistaPreviaImagenes.innerHTML = "";
    fotosEdicion.forEach(function (foto) {
        const contenedor = document.createElement("div");
        contenedor.style.display = "inline-flex";
        contenedor.style.flexDirection = "column";
        contenedor.style.alignItems = "center";
        contenedor.style.margin = "5px";
        const imagen = document.createElement("img");
        imagen.src = `${API_FINANZAS_BASE}${foto.url}`;
        imagen.alt = foto.nombreArchivo;
        imagen.style.width = "140px";
        imagen.style.height = "140px";
        imagen.style.objectFit = "contain";
        imagen.style.borderRadius = "8px";
        const botonEliminar = document.createElement("img");
        botonEliminar.src = "../img/iconos/cerrar.svg";
        botonEliminar.width = 20;
        botonEliminar.alt = "Eliminar fotografía";
        botonEliminar.title = "Eliminar fotografía";
        botonEliminar.style.marginTop = "5px";
        botonEliminar.style.cursor = "pointer";
        botonEliminar.addEventListener("click", function () {eliminarFotoEdicion(foto.id);});
        contenedor.appendChild(imagen);
        contenedor.appendChild(botonEliminar);
        vistaPreviaImagenes.appendChild(contenedor);
    });
}
async function eliminarFotoEdicion(fotoId) {
    if (fotosEdicion.length <= 1) {alert("El producto debe conservar al menos una imagen.");return;}
    if (!confirm("¿Deseas eliminar esta imagen?")) {return;}
    const productoId = document.getElementById("producto-id").value;
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/${productoId}/fotos/${fotoId}`, { method: "DELETE" });
        if (!respuesta.ok) {const mensaje = await leerError(respuesta); throw new Error(mensaje);}
        fotosEdicion = fotosEdicion.filter(function (foto) {return foto.id !== fotoId;});
        mostrarVistaPreviaEdicion();
        const producto = productos.find(function (elemento) {return elemento.id === Number(productoId);});
        if (producto) {producto.fotos = [...fotosEdicion];}
        mostrarProductos();
        alert("Imagen eliminada correctamente.");
    } catch (error) {console.error("Error al eliminar imagen:", error); alert(error.message || "No fue posible eliminar la imagen.");}
}
function abrirEdicionProducto(idProducto) {const producto = productos.find(function (elemento) {return elemento.id === idProducto;});
    if (!producto) {return;}
    tituloFormulario.textContent = "Editar producto";
    document.getElementById("producto-id").value = producto.id;
    campoNombre.value = producto.titulo;
    campoGrupo.value = producto.grupoId;
    campoRama.value = producto.ramaId;
    campoPrecio.value = producto.precio;
    campoStock.value = producto.stock;
    campoEstado.value = producto.estado === "ACTIVO" ? "true" : "false";
    campoDescripcion.value = producto.detalle || "";
    fotosEdicion = [...(producto.fotos || [])];
    campoImagenes.value = "";
    mostrarVistaPreviaEdicion();
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({ behavior: "smooth" });
}
function cerrarFormularioProducto() {
    formularioProducto.reset();
    document.getElementById("producto-id").value = "";
    vistaPreviaImagenes.innerHTML = "";
    contenedorFormulario.hidden = true;
}
campoImagenes.addEventListener("change", function () {
    const archivos = Array.from(campoImagenes.files || []);
    const esEdicion = Boolean(document.getElementById("producto-id").value);
    const cantidadActual = esEdicion ? fotosEdicion.length : 0;
    const totalImagenes = cantidadActual + archivos.length;
    if (totalImagenes > 3) {
        alert(`Solo puedes tener un máximo de 3 imágenes. Actualmente tienes ${cantidadActual}.`);
        campoImagenes.value = "";
        if (esEdicion) {mostrarVistaPreviaEdicion();
        } else {vistaPreviaImagenes.innerHTML = "";}
        return;
    }
    if (esEdicion) {mostrarVistaPreviaEdicion();
    } else {vistaPreviaImagenes.innerHTML = "";}
    vistaPreviaImagenes.innerHTML = "";
    archivos.forEach(function (archivo) {const imagen = document.createElement("img");
        imagen.src = URL.createObjectURL(archivo);
        imagen.alt = archivo.name;
        imagen.className = "miniatura-producto-admin";
        imagen.style.width = "140px";
        imagen.style.height = "140px";
        imagen.style.objectFit = "contain";
        imagen.style.borderRadius = "8px";
        imagen.style.margin = "5px";
        vistaPreviaImagenes.appendChild(imagen);
    });
});
formularioProducto.addEventListener("submit", async function (evento) {evento.preventDefault();
    const idProducto = document.getElementById("producto-id").value;
    const esEdicion = Boolean(idProducto);
    const datosProducto = {
        titulo: campoNombre.value.trim(),
        detalle: campoDescripcion.value.trim(),
        precio: Number(campoPrecio.value),
        stock: Number(campoStock.value),
        grupoId: Number(campoGrupo.value),
        ramaId: Number(campoRama.value)
    };
    const formData = new FormData();
    formData.append(
        "producto",
        new Blob([JSON.stringify(datosProducto)], {
            type: "application/json"
        })
    );
    const archivos = Array.from(campoImagenes.files || []);
    if (!esEdicion) {
        if (archivos.length === 0) {alert("Debes subir al menos una imagen."); return;}
        if (archivos.length > 3) {alert("El producto puede tener máximo 3 imágenes."); return;}
        archivos.forEach(function (archivo) {formData.append("archivos", archivo);});
    } else {
        if (fotosEdicion.length + archivos.length > 3) {alert("El producto puede tener máximo 3 imágenes."); return;}
    }
    try {
        const url = esEdicion
            ? `${API_FINANZAS}/productos/${idProducto}`
            : `${API_FINANZAS}/productos`;
        const respuesta = await fetchAutenticado(url, {method: esEdicion ? "PUT" : "POST", body: formData});
        if (!respuesta.ok) {const mensaje = await leerError(respuesta);
            throw new Error(mensaje);
        }
        if (esEdicion && archivos.length > 0) {
            const formDataImagenes = new FormData();
            archivos.forEach(function (archivo) {formDataImagenes.append("archivos", archivo);});
            const respuestaImagenes = await fetchAutenticado(`${API_FINANZAS}/productos/${idProducto}/fotos`,
                {
                    method: "POST",
                    body: formDataImagenes
                }
            );
            if (!respuestaImagenes.ok) {const mensaje = await leerError(respuestaImagenes); throw new Error(mensaje);}
        }
        alert(esEdicion ? "Producto actualizado." : "Producto creado.");
        cerrarFormularioProducto();
        await cargarProductos();
    } catch (error) {console.error("Error al guardar producto:", error); alert(error.message || "No fue posible guardar el producto.");}
});
async function cambiarEstadoProducto(idProducto) {
    const producto = productos.find(function (elemento) {return elemento.id === idProducto;});
    if (!producto) {return;}
    const nuevoEstado = producto.estado === "ACTIVO" ? "PAUSADO" : "ACTIVO";
    if (!confirm(`¿Deseas cambiar "${producto.titulo}" a estado ${nuevoEstado}?`)) {return;}
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/${idProducto}/estado?estado=${encodeURIComponent(nuevoEstado)}`, { method: "PUT" });
        if (!respuesta.ok) {const mensaje = await leerError(respuesta); throw new Error(mensaje);}
        await cargarProductos();
    } catch (error) {console.error("Error al cambiar estado:", error); alert(error.message || "No fue posible cambiar el estado del producto.");}
}
async function agregarImagenesProducto(productoId, cantidadActual) {
    const espacioDisponible = 3 - cantidadActual;
    if (espacioDisponible <= 0) {alert("El producto ya tiene el máximo de 3 imágenes."); return;}
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";
    input.multiple = true;
    input.addEventListener("change", async function () {
        const archivos = Array.from(input.files || []);
        if (archivos.length === 0) {return;}
        if (archivos.length > espacioDisponible) {alert(`Solo puedes agregar ${espacioDisponible} imagen(es).`); return;}
        const formData = new FormData();
        archivos.forEach(function (archivo) {formData.append("archivos", archivo);});
        try {
            const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/${productoId}/fotos`,
                {method: "POST", body: formData}
            );
            if (!respuesta.ok) {const mensaje = await leerError(respuesta); throw new Error(mensaje);}
            alert("Imágenes agregadas correctamente.");
            await cargarProductos();
        } catch (error) {console.error(error); alert(error.message || "No fue posible agregar las imágenes.");}
    });
    input.click();
}
async function reemplazarImagenProducto(productoId, fotos) {
    if (fotos.length === 0) {alert("El producto no tiene imágenes."); return;}
    const idIngresado = prompt("Ingresa el ID de la imagen que deseas reemplazar:", String(fotos[0].id));
    if (!idIngresado) {return;}
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";
    input.addEventListener("change", async function () {
        const archivo = input.files[0];
        if (!archivo) {return;}
        const formData = new FormData();
        formData.append("archivo", archivo);
        try {const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/${productoId}/fotos/${idIngresado}`,
            {method: "PUT", body: formData}
            );
            if (!respuesta.ok) {const mensaje = await leerError(respuesta); throw new Error(mensaje);}
            alert("Imagen reemplazada correctamente.");
            await cargarProductos();
        } catch (error) {console.error(error); alert(error.message || "No fue posible reemplazar la imagen.");}
    });
    input.click();
}
async function reemplazarTodasImagenesProducto(productoId) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png";
    input.multiple = true;
    input.addEventListener("change", async function () {
        const archivos = Array.from(input.files || []);
        if (archivos.length === 0 || archivos.length > 3) {alert("Debes seleccionar entre 1 y 3 imágenes."); return;}
        const formData = new FormData();
        archivos.forEach(function (archivo) {formData.append("archivos", archivo);});
        try {
            const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/${productoId}/fotos`,
                {
                    method: "PUT",
                    body: formData
                }
            );
            if (!respuesta.ok) {const mensaje = await leerError(respuesta);
                throw new Error(mensaje);
            }
            alert("Imágenes reemplazadas correctamente.");
            await cargarProductos();
        } catch (error) {console.error(error); alert(error.message || "No fue posible reemplazar las imágenes.");}
    });
    input.click();
}
async function eliminarImagenProducto(productoId, fotos) {
    if (fotos.length <= 1) {alert("El producto debe tener al menos una imagen."); return;}
    const idIngresado = prompt("Ingresa el ID de la imagen que deseas eliminar:", String(fotos[0].id));
    if (!idIngresado) {return;}
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/productos/${productoId}/fotos/${idIngresado}`, { method: "DELETE" });
        if (!respuesta.ok) {const mensaje = await leerError(respuesta);
            throw new Error(mensaje);
        }
        alert("Imagen eliminada correctamente.");
        await cargarProductos();
    } catch (error) {console.error(error); alert(error.message || "No fue posible eliminar la imagen.");}
}
function obtenerPedidosFiltrados() {
    const texto = buscarPedido.value.trim().toLowerCase();
    const estado = filtroEstadoPedido.value;
    return pedidos.filter(function (pedido) {
        const coincideTexto = texto === "" || String(pedido.id).includes(texto) || String(pedido.usuarioId).includes(texto);
        const coincideEstado = estado === "TODOS" || pedido.estado === estado;
        return coincideTexto && coincideEstado;
    });
}
function mostrarPedidos() {
    const filtrados = obtenerPedidosFiltrados();
    listaPedidos.innerHTML = "";
    sinResultadosPedidos.hidden = filtrados.length !== 0;
    filtrados.forEach(function (pedido) {
        const fila = document.createElement("tr");
        const productosTexto = (pedido.detalles || [])
            .map(function (detalle) {return `${detalle.cantidad} × ${detalle.nombreProducto || "Producto"}`;})
            .join(", ");
        const puedeEditar =
            pedido.estado !== "ENTREGADO" &&
            pedido.estado !== "CANCELADO";
        fila.innerHTML = `
            <td><strong>#${pedido.id}</strong></td>
            <td>Usuario ${pedido.usuarioId}</td>
            <td>${escaparHTML(formatearFecha(pedido.fecha))}</td>
            <td>${escaparHTML(productosTexto)}</td>
            <td>${formatterCLP.format(pedido.total)}</td>
            <td><span class="estado-usuario-admin estado-${pedido.estado.toLowerCase()}"> ${escaparHTML(pedido.estado)}</span></td>
            <td>
                <div class="acciones-tabla-admin">
                    ${puedeEditar ? `<button type="button" class="boton-editar-pedido" data-id="${pedido.id}">Avanzar</button>` : ""}
                    ${puedeEditar ? `<button type="button" class="boton-cancelar-pedido" data-id="${pedido.id}">Cancelar</button>` : ""}
                </div>
            </td>
        `;
        listaPedidos.appendChild(fila);
    });
    activarBotonesPedidos();
    actualizarIndicadores();
}
function activarBotonesPedidos() {
    document.querySelectorAll(".boton-editar-pedido").forEach(function (boton) {boton.addEventListener("click", function () {avanzarPedido(Number(boton.dataset.id));});});
    document.querySelectorAll(".boton-cancelar-pedido").forEach(function (boton) {boton.addEventListener("click", function () {cancelarPedido(Number(boton.dataset.id));});});
}
async function avanzarPedido(idPedido) {
    const pedido = pedidos.find(function (elemento) {return elemento.id === idPedido;});
    if (!pedido) {return;}
    const transiciones = {
        "PENDIENTE": "EN_PROCESO",
        "EN_PROCESO": "PENDIENTE_ENTREGA",
        "PENDIENTE_ENTREGA": "ENTREGADO"
    };
    const nuevoEstado = transiciones[pedido.estado];
    if (!nuevoEstado) {alert("Este pedido no puede avanzar más."); return;}
    if (!confirm(`¿Deseas cambiar el pedido #${pedido.id} a ${nuevoEstado}?`)) {return;}
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/admin/ordenes/${idPedido}/estado?estado=${encodeURIComponent(nuevoEstado)}`, { method: "PUT" });
        if (!respuesta.ok) {const mensaje = await leerError(respuesta);
            throw new Error(mensaje);
        }
        await cargarPedidos();
    } catch (error) {console.error(error); alert(error.message || "No fue posible cambiar el estado del pedido.");}
}
async function cancelarPedido(idPedido) {
    if (!confirm("¿Deseas cancelar este pedido?")) {return;}
    try {
        const respuesta = await fetchAutenticado(`${API_FINANZAS}/admin/ordenes/${idPedido}/estado?estado=CANCELADO`, { method: "PUT" });
        if (!respuesta.ok) {const mensaje = await leerError(respuesta);
            throw new Error(mensaje);
        }
        await cargarPedidos();
    } catch (error) {console.error(error); alert(error.message || "No fue posible cancelar el pedido.");}
}
pestanaProductos.addEventListener("click", function () {
    seccionProductos.hidden = false;
    seccionPedidos.hidden = true;
    pestanaProductos.classList.add("activa");
    pestanaPedidos.classList.remove("activa");
});
pestanaPedidos.addEventListener("click", function () {
    seccionProductos.hidden = true;
    seccionPedidos.hidden = false;
    contenedorFormulario.hidden = true;
    pestanaProductos.classList.remove("activa");
    pestanaPedidos.classList.add("activa");
    cargarPedidos();
});
buscarProducto.addEventListener("input", mostrarProductos);
filtroGrupo.addEventListener("change", mostrarProductos);
filtroRama.addEventListener("change", mostrarProductos);
filtroStock.addEventListener("change", mostrarProductos);
filtroEstadoProducto.addEventListener("change", mostrarProductos);
buscarPedido.addEventListener("input", mostrarPedidos);
filtroEstadoPedido.addEventListener("change", mostrarPedidos);
botonNuevoProducto.addEventListener("click", abrirNuevoProducto);
cerrarFormulario.addEventListener("click", cerrarFormularioProducto);
cancelarFormulario.addEventListener("click", cerrarFormularioProducto);
if (botonCerrarSesion) {botonCerrarSesion.addEventListener("click", function (evento) {evento.preventDefault(); sessionStorage.clear(); window.location.replace("login.html");});}
async function leerError(respuesta) {
    try {const data = await respuesta.json();
        return data.error || data.mensaje || `El servidor respondió ${respuesta.status}.`;
    } catch (error) {return `El servidor respondió ${respuesta.status}.`;}
}
async function iniciarAdminTienda() {
    await cargarCatalogos();
    await cargarProductos();
}
iniciarAdminTienda();