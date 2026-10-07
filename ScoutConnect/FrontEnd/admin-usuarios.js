// const USUARIO_ADMINISTRADOR_INICIAL = {
//     id: 1,
//     nombre: "Administrador Comunidad Scout",
//     nickname: "admin_scout",
//     correo: "admin@comunidadscout.cl",
//     rol: "administrador",
//     estado: "activo"
// };

let usuarios = [];
const listaUsuarios =document.getElementById("lista-usuarios");
const totalUsuarios =document.getElementById("total-usuarios");
const usuariosActivos =document.getElementById("usuarios-activos");
const usuariosInactivos =document.getElementById("usuarios-inactivos");
const totalAdministradores =document.getElementById("total-administradores");

const buscadorUsuario =document.getElementById("buscar-usuario");
const filtroRol =document.getElementById("filtro-rol");
const filtroEstado =document.getElementById("filtro-estado");
const sinResultados =document.getElementById("sin-resultados-usuarios");

const botonNuevoUsuario =document.getElementById("boton-nuevo-usuario");
const contenedorFormulario =document.getElementById("contenedor-formulario-usuario");
const formularioUsuario =document.getElementById("form-usuario");
const tituloFormulario =document.getElementById("titulo-formulario-usuario");
const cerrarFormulario =document.getElementById("cerrar-formulario-usuario");
const cancelarFormulario =document.getElementById("cancelar-formulario-usuario");

const campoNombre = document.getElementById("nombre-usuario");
const campoRut = document.getElementById("rut-usuario");
const campoTelefono = document.getElementById("telefono-usuario");
const campoNacimiento = document.getElementById("nacimiento-usuario");
const campoNickname = document.getElementById("nickname-usuario");
const campoCorreo = document.getElementById("correo-usuario");
const campoPassword = document.getElementById("password-usuario");
const campoDireccion = document.getElementById("direccion-usuario");

const campoRol = document.getElementById("rol-usuario");
const campoEstado = document.getElementById("estado-usuario");
const campoRegion = document.getElementById("region-usuario");
const campoComuna = document.getElementById("comuna-usuario");
const campoGrupo = document.getElementById("grupo-usuario");

const campoPdf = document.getElementById("pdf-usuario");

// Evita ataques XSS convirtiendo texto plano en texto seguro para mostrar en HTML.
function escaparHTML(texto) {const elemento = document.createElement("div");
    elemento.textContent = String(texto ?? ""); return elemento.innerHTML;
}
// Intenta convertir la respuesta del backend a JSON. Si no es JSON válido, devuelve el texto como error.
async function leerRespuesta(respuesta) {
    const texto = await respuesta.text();
    if (!texto) {
        return {};
    } try {
        return JSON.parse(texto);
    } catch (error) {
        return {error: texto};
    }
}
// llena el formulario con el dato del usuario
async function cargarCatalogos() {
    try {
        const [respuestaRoles, respuestaEstados, respuestaRegiones, respuestaComunas, respuestaGrupos] = await Promise.all([
            fetch("http://localhost:8080/roles/listar"),
            fetch("http://localhost:8080/estados/listar"),
            fetch("http://localhost:8080/regiones/listar"),
            fetch("http://localhost:8080/comunas/listar"),
            fetch("http://localhost:8080/grupos/listar")
        ]);
        const [roles, estados, regiones, comunas, grupos] = await Promise.all([
            respuestaRoles.json(),
            respuestaEstados.json(),
            respuestaRegiones.json(),
            respuestaComunas.json(),
            respuestaGrupos.json()
        ]);
        cargarOpciones(campoRol, roles, "Seleccione un rol");
        cargarOpciones(campoEstado, estados, "Seleccione un estado");
        cargarOpciones(campoRegion, regiones, "Seleccione una región");
        cargarOpciones(campoComuna, comunas, "Seleccione una comuna");
        cargarOpciones(campoGrupo, grupos, "Seleccione un grupo");
    } catch (error) {console.error("Error al cargar catálogos:", error);
        alert("No se pudieron cargar los datos del formulario.");
    }
}
// cargar opciones desde el backend
function cargarOpciones(select, elementos, textoInicial) {select.innerHTML = "";
    const opcionInicial = document.createElement("option");
    opcionInicial.value = "";
    opcionInicial.textContent = textoInicial;
    select.appendChild(opcionInicial);
    elementos.forEach(function (elemento) {
        const opcion = document.createElement("option");
        opcion.value = elemento.id;
        opcion.textContent = elemento.nombre;
        select.appendChild(opcion);
    });
}
// Función para cargar usuarios desde el backend
async function cargarUsuarios() {
    try {const respuesta = await fetch("http://localhost:8080/usuarios/listar");
        if (!respuesta.ok) {throw new Error("No se pudo obtener la lista de usuarios.");}
        usuarios = await respuesta.json();
        mostrarUsuarios();
        // usuarios = data; // ahora la lista viene desde PostgreSQL
    } catch (error) {console.error("Error al cargar usuarios:", error);
        alert("No se pudo cargar la lista de usuarios desde el servidor.");
    }
}
// Actualiza los contadores del panel administrativo
function actualizarIndicadores() {
    const activos = usuarios.filter(function (usuario) {return usuario.estado?.nombre?.toLowerCase() === "activo";});
    const inactivos = usuarios.filter(function (usuario) {return usuario.estado?.nombre?.toLowerCase() === "inactivo";});
    const administradores = usuarios.filter(function (usuario) {return usuario.rol?.nombre?.toLowerCase() === "administrador";});
    totalUsuarios.textContent = usuarios.length;
    usuariosActivos.textContent = activos.length;
    usuariosInactivos.textContent = inactivos.length;
    totalAdministradores.textContent = administradores.length;
}
// filtros de la gestion de usuarios en admin
function obtenerUsuariosFiltrados() {
    const textoBusqueda = buscadorUsuario.value.trim().toLowerCase();
    const rolSeleccionado = filtroRol.value.toLowerCase();
    const estadoSeleccionado = filtroEstado.value.toLowerCase();
    return usuarios.filter(function (usuario) {
        const coincideTexto =
        usuario.nombre?.toLowerCase().includes(textoBusqueda) ||
        usuario.nickname?.toLowerCase().includes(textoBusqueda) ||
        usuario.correo?.toLowerCase().includes(textoBusqueda);
        const nombreRol = usuario.rol?.nombre?.trim().toLowerCase();
        const nombreEstado = usuario.estado?.nombre?.trim().toLowerCase();
        const coincideEstado = estadoSeleccionado === "todos" || nombreEstado === estadoSeleccionado;
        const coincideRol = rolSeleccionado === "todos" || nombreRol === rolSeleccionado;
        return coincideTexto && coincideRol && coincideEstado;
    });
}
// filtrar usuarios
function mostrarUsuarios() {
    const usuariosFiltrados = obtenerUsuariosFiltrados();
    const usuarioActualId = Number(sessionStorage.getItem("usuarioId"));
    listaUsuarios.innerHTML = "";
    sinResultados.hidden = usuariosFiltrados.length !== 0;
    usuariosFiltrados.forEach(function (usuario) {
        const esUsuarioActual = usuario.id === usuarioActualId;
        const botonEliminar = esUsuarioActual
                ? `<button type="button" class="boton-eliminar-admin" data-id="${usuario.id}" disabled> No disponible </button>`
                : `<button type="button" class="boton-eliminar-admin" data-id="${usuario.id}"><img src="img/iconos/cerrar.svg" width="30px" alt="cerrar"></button>`;
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${escaparHTML(usuario.nombre)}</td>
            <td>@${escaparHTML(usuario.nickname)}</td>
            <td>${escaparHTML(usuario.correo)}</td>
            <td>${escaparHTML(usuario.rol?.nombre)}</td>
            <td>${escaparHTML(usuario.estado?.nombre)}</td>
            <td>
                <button type="button" class="boton-editar-admin" data-id="${usuario.id}">Editar</button>
                ${botonEliminar}
            </td>
        `;
        listaUsuarios.appendChild(fila);
    });
    activarBotonesEditar();
    actualizarIndicadores();
}
// activar edicion
function activarBotonesEditar() {
    const botonesEditar = document.querySelectorAll(".boton-editar-admin");
    const botonesEliminar = document.querySelectorAll(".boton-eliminar-admin"); // ++
    botonesEditar.forEach(function (boton) {boton.addEventListener("click", function () {
        abrirEdicionUsuario(Number(boton.dataset.id));});
    });
    botonesEliminar.forEach(function (boton) {boton.addEventListener("click", function () {
        eliminarUsuario(Number(boton.dataset.id));});
    });
}
// eliminar usuarios
async function eliminarUsuario(idUsuario) {
    const usuarioActualId = Number(sessionStorage.getItem("usuarioId"));
    if (idUsuario === usuarioActualId) {alert("No puedes eliminar tu propia cuenta administrativa.");
        return;
    }
    const usuario = usuarios.find(function (elemento) {return elemento.id === idUsuario;});
    if (!usuario) {
        return;
    }
    const confirmarEliminacion = confirm(`¿Deseas eliminar al usuario "${usuario.nickname}"?`);
    if (!confirmarEliminacion) {
        return;
    }
    try {
        const respuesta = await fetch(`http://localhost:8080/usuarios/${idUsuario}`,{method: "DELETE"});
        const data = await leerRespuesta(respuesta);
        if (!respuesta.ok) {alert(data.error || data.message || "No se pudo eliminar el usuario.");
            return;
        }
        if (data.error) {alert(data.error);
            return;
        }
        alert(data.mensaje);
        await cargarUsuarios();
    } catch (error) {console.error("Error al eliminar usuario:",error);
        alert("No se pudo conectar con el servidor.");
    }
}
// abrir formulario
function abrirFormularioNuevo() {
    formularioUsuario.reset();
    document.getElementById("usuario-id").value = "";
    campoPdf.value = "";
    campoPassword.required = true;
    tituloFormulario.textContent = "Registrar usuario";
    contenedorFormulario.hidden = false;
    campoNombre.focus();
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
// cierra el formulario
function cerrarFormularioUsuario() {formularioUsuario.reset();
    document.getElementById("usuario-id").value = "";
    campoPassword.required = true;
    contenedorFormulario.hidden = true;
}
// abre la edicion del formulario
function abrirEdicionUsuario(idUsuario) {
    const usuario = usuarios.find(function (elemento) {return elemento.id === idUsuario;});
    if (!usuario) {
        return;
    }
    tituloFormulario.textContent = "Editar usuario";
    document.getElementById("usuario-id").value = usuario.id;
    campoNombre.value = usuario.nombre ?? "";
    campoRut.value = usuario.rut ?? "";
    campoTelefono.value = usuario.telefono ?? "";
    campoNacimiento.value = usuario.nacimiento ?? "";
    campoNickname.value = usuario.nickname ?? "";
    campoCorreo.value = usuario.correo ?? "";
    campoDireccion.value = usuario.direccion ?? "";
    campoRol.value = usuario.rol?.id ?? "";
    campoEstado.value = usuario.estado?.id ?? "";
    campoRegion.value = usuario.region?.id ?? "";
    campoComuna.value = usuario.comuna?.id ?? "";
    campoGrupo.value = usuario.grupo?.id ?? "";
    campoPassword.value = "";
    campoPassword.required = false;
    campoPdf.value = "";
    contenedorFormulario.hidden = false;
    contenedorFormulario.scrollIntoView({behavior: "smooth"});
}
// valida el formulario para crear
function validarFormulario() {
    const camposTexto = [campoNombre, campoRut, campoTelefono, campoNickname, campoCorreo, campoDireccion];
    for (const campo of camposTexto) {
        if (!campo.value.trim()) {alert(`Debe completar el campo: ${campo.previousElementSibling.textContent}`); campo.focus();
            return false;
        }
    }
    if (!campoNacimiento.value) {alert("Debe ingresar la fecha de nacimiento."); campoNacimiento.focus();
        return false;
    }
    const idUsuario = document.getElementById("usuario-id").value;
    if (!idUsuario && !campoPassword.value.trim()) {alert("Debe ingresar la contraseña."); campoPassword.focus();
        return false;
    }
    const selects = [campoRol, campoEstado, campoRegion, campoComuna, campoGrupo];

    for (const select of selects) {if (!select.value) {alert(`Debe seleccionar: ${select.previousElementSibling.textContent}`); select.focus();
            return false;
        }
    }
    if (campoPdf.files.length > 0) {const archivo = campoPdf.files[0];
        if (archivo.type !== "application/pdf") {alert("Solo se permiten archivos PDF."); campoPdf.value = "";campoPdf.focus();
            return false;
        }
        if (archivo.size > 5 * 1024 * 1024) {alert("El PDF no puede superar los 5 MB."); campoPdf.value = ""; campoPdf.focus();
            return false;
        }
    }
    return true;
}
// obtiene los datos del usuario
function obtenerDatosUsuario(incluirPassword) {
    const datosUsuario = {
        nombre: campoNombre.value.trim(),
        rut: campoRut.value.trim(),
        telefono: campoTelefono.value.trim(),
        nacimiento: campoNacimiento.value,
        nickname: campoNickname.value.trim().toLowerCase(),
        correo: campoCorreo.value.trim().toLowerCase(),
        direccion: campoDireccion.value.trim(),
        rol: {id: Number(campoRol.value)},
        estado: {id: Number(campoEstado.value)},
        region: {id: Number(campoRegion.value)},
        comuna: {id: Number(campoComuna.value)},
        grupo: {id: Number(campoGrupo.value)}
    };
    if (incluirPassword) {datosUsuario.password = campoPassword.value.trim();}
    return datosUsuario;
}
// crear usuario
async function crearUsuario() {
    const datosUsuario = obtenerDatosUsuario(true);
    const formularioMultipart = new FormData();
    formularioMultipart.append("usuario", new Blob([JSON.stringify(datosUsuario)],{type: "application/json"}));
    if (campoPdf.files.length > 0) {formularioMultipart.append("archivo", campoPdf.files[0]);}
    const respuesta = await fetch("http://localhost:8080/usuarios/registro?rolSolicitante=administrador",{
            method: "POST",
            body: formularioMultipart
        }
    );
    const data = await leerRespuesta(respuesta);
    if (!respuesta.ok) {console.error("Error del backend:", data);
        alert(data.error || data.message || "El servidor rechazó la creación del usuario.");
        return false;
    }
    if (data.error) {alert(data.error);
        return false;
    }
    alert(data.mensaje);
    return true;
}
//editar usuario
async function editarUsuario(idUsuario) {
    const datosUsuario = obtenerDatosUsuario(false);
    const formularioMultipart = new FormData();
    formularioMultipart.append("usuario",new Blob(
        [JSON.stringify(datosUsuario)],{type: "application/json"})
    );
    if (campoPdf.files.length > 0) {formularioMultipart.append("archivo",campoPdf.files[0]);
    }
    const respuesta = await fetch(`http://localhost:8080/usuarios/editar/${idUsuario}`,{
        method: "PUT",
        body: formularioMultipart
    });
    const data = await leerRespuesta(respuesta);
    if (!respuesta.ok) {console.error("Error del backend:", data);
        alert(data.error || data.message || "El servidor rechazó la edición del usuario.");
        return false;
    }
    if (data.error) {alert(data.error);
        return false;
    }
    alert(data.mensaje);
    return true;
}
formularioUsuario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (!validarFormulario()) {
        return;
    }
    const idUsuario = document.getElementById("usuario-id").value;
    try {
        if (!idUsuario) {const creado = await crearUsuario();
            if (!creado) {
                return;
            }
        } else {const editado = await editarUsuario(idUsuario);
            if (!editado) {
                return;
            }
        }
        cerrarFormularioUsuario();
        await cargarUsuarios();
    } catch (error) {console.error("Error al guardar usuario:", error);alert("No se pudo conectar con el servidor.");}
});
buscadorUsuario.addEventListener("input", mostrarUsuarios);
filtroRol.addEventListener("change", mostrarUsuarios);
filtroEstado.addEventListener("change", mostrarUsuarios);
botonNuevoUsuario.addEventListener("click",abrirFormularioNuevo);
cerrarFormulario.addEventListener("click",cerrarFormularioUsuario);
cancelarFormulario.addEventListener("click",cerrarFormularioUsuario);
async function iniciarPagina() {
    await cargarCatalogos();
    await cargarUsuarios();
}
iniciarPagina();