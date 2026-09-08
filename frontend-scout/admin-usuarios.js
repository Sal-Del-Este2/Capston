const USUARIO_ADMINISTRADOR_INICIAL = {
    id: 1,
    nombre: "Administrador Comunidad Scout",
    nickname: "admin_scout",
    correo: "admin@comunidadscout.cl",
    rol: "administrador",
    estado: "activo"
};

let usuarios = [];

const listaUsuarios =
    document.getElementById("lista-usuarios");

const totalUsuarios =
    document.getElementById("total-usuarios");

const usuariosActivos =
    document.getElementById("usuarios-activos");

const usuariosInactivos =
    document.getElementById("usuarios-inactivos");

const totalAdministradores =
    document.getElementById("total-administradores");

const buscadorUsuario =
    document.getElementById("buscar-usuario");

const filtroRol =
    document.getElementById("filtro-rol");

const filtroEstado =
    document.getElementById("filtro-estado");

const sinResultados =
    document.getElementById("sin-resultados-usuarios");

const botonNuevoUsuario =
    document.getElementById("boton-nuevo-usuario");

const contenedorFormulario =
    document.getElementById("contenedor-formulario-usuario");

const formularioUsuario =
    document.getElementById("form-usuario");

const tituloFormulario =
    document.getElementById("titulo-formulario-usuario");

const cerrarFormulario =
    document.getElementById("cerrar-formulario-usuario");

const cancelarFormulario =
    document.getElementById("cancelar-formulario-usuario");


function escaparHTML(texto) {
    const elemento =
        document.createElement("div");

    elemento.textContent = String(texto);

    return elemento.innerHTML;
}

// Función para cargar usuarios desde el backend

async function cargarUsuarios() {
    try {
        const respuesta = await fetch("http://localhost:8080/usuarios/listar");
        const data = await respuesta.json();

        usuarios = data; // ahora la lista viene desde PostgreSQL
        mostrarUsuarios();
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        alert("No se pudo cargar la lista de usuarios desde el servidor.");
    }
}



function guardarUsuarios() {
    localStorage.setItem(
        "usuariosAdmin",
        JSON.stringify(usuarios)
    );
}


function actualizarIndicadores() {
    const activos = usuarios.filter(
        function (usuario) {
            return usuario.estado === "activo";
        }
    );

    const inactivos = usuarios.filter(
        function (usuario) {
            return usuario.estado === "inactivo";
        }
    );

    const administradores = usuarios.filter(
        function (usuario) {
            return (
                usuario.rol === "administrador" &&
                usuario.estado === "activo"
            );
        }
    );

    totalUsuarios.textContent = usuarios.length;
    usuariosActivos.textContent = activos.length;
    usuariosInactivos.textContent = inactivos.length;
    totalAdministradores.textContent =
        administradores.length;
}


function obtenerUsuariosFiltrados() {
    const textoBusqueda =
        buscadorUsuario.value
            .trim()
            .toLowerCase();

    const rolSeleccionado =
        filtroRol.value;

    const estadoSeleccionado =
        filtroEstado.value;

    return usuarios.filter(
        function (usuario) {
            const coincideTexto =
                usuario.nombre
                    .toLowerCase()
                    .includes(textoBusqueda) ||
                usuario.nickname
                    .toLowerCase()
                    .includes(textoBusqueda) ||
                usuario.correo
                    .toLowerCase()
                    .includes(textoBusqueda);

            const coincideRol =
                rolSeleccionado === "TODOS" ||
                usuario.rol === rolSeleccionado;

            const coincideEstado =
                estadoSeleccionado === "TODOS" ||
                usuario.estado === estadoSeleccionado;

            return (
                coincideTexto &&
                coincideRol &&
                coincideEstado
            );
        }
    );
}


function mostrarUsuarios() {
    const usuariosFiltrados =
        obtenerUsuariosFiltrados();

    listaUsuarios.innerHTML = "";

    sinResultados.hidden =
        usuariosFiltrados.length !== 0;

    usuariosFiltrados.forEach(
        function (usuario) {
            const fila =
                document.createElement("tr");

            const claseEstado =
                usuario.estado === "activo"
                    ? "estado-activo-admin"
                    : "estado-inactivo-admin";

            const textoBotonEstado =
                usuario.estado === "activo"
                    ? "Desactivar"
                    : "Activar";

            fila.innerHTML = `
                <td>
                    ${escaparHTML(usuario.nombre)}
                </td>

                <td>
                    @${escaparHTML(usuario.nickname)}
                </td>

                <td>
                    ${escaparHTML(usuario.correo)}
                </td>

                <td>
                    <span class="rol-usuario-admin">
                        ${usuario.rol === "administrador"
                            ? "Administrador"
                            : "Usuario"}
                    </span>
                </td>

                <td>
                    <span
                        class="estado-usuario-admin
                        ${claseEstado}"
                    >
                        ${usuario.estado === "activo"
                            ? "Activo"
                            : "Inactivo"}
                    </span>
                </td>

                <td>
                    <div class="acciones-tabla-admin">

                        <button
                            type="button"
                            class="boton-editar-admin"
                            data-id="${usuario.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="boton-estado-admin"
                            data-id="${usuario.id}"
                        >
                            ${textoBotonEstado}
                        </button>

                    </div>
                </td>
            `;

            listaUsuarios.appendChild(fila);
        }
    );

    activarBotonesTabla();
    actualizarIndicadores();
}


function activarBotonesTabla() {
    const botonesEditar =
        document.querySelectorAll(
            ".boton-editar-admin"
        );

    const botonesEstado =
        document.querySelectorAll(
            ".boton-estado-admin"
        );

    botonesEditar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                abrirEdicionUsuario(
                    Number(boton.dataset.id)
                );
            }
        );
    });

    botonesEstado.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                cambiarEstadoUsuario(
                    Number(boton.dataset.id)
                );
            }
        );
    });
}


function abrirFormularioNuevo() {
    formularioUsuario.reset();

    document.getElementById(
        "usuario-id"
    ).value = "";

    tituloFormulario.textContent =
        "Registrar usuario";

    document.getElementById(
        "rol-usuario"
    ).value = "usuario";

    document.getElementById(
        "estado-usuario"
    ).value = "activo";

    contenedorFormulario.hidden = false;

    document.getElementById(
        "nombre-usuario"
    ).focus();

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function abrirEdicionUsuario(idUsuario) {
    const usuario = usuarios.find(
        function (elemento) {
            return elemento.id === idUsuario;
        }
    );

    if (!usuario) {
        return;
    }

    tituloFormulario.textContent =
        "Editar usuario";

    document.getElementById(
        "usuario-id"
    ).value = usuario.id;

    document.getElementById(
        "nombre-usuario"
    ).value = usuario.nombre;

    document.getElementById(
        "nickname-usuario"
    ).value = usuario.nickname;

    document.getElementById(
        "correo-usuario"
    ).value = usuario.correo;

    document.getElementById(
        "rol-usuario"
    ).value = usuario.rol;

    document.getElementById(
        "estado-usuario"
    ).value = usuario.estado;

    contenedorFormulario.hidden = false;

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function cerrarFormularioUsuario() {
    formularioUsuario.reset();
    contenedorFormulario.hidden = true;
}


async function cambiarEstadoUsuario(idUsuario) {
    const usuario = usuarios.find(
        function (elemento) {
            return elemento.id === idUsuario;
        }
    );

    if (!usuario) {
        return;
    }

    if (usuario.id === USUARIO_ADMINISTRADOR_INICIAL.id) {
        alert("La cuenta administrativa principal no puede ser desactivada.");
        return;
    }

    const nuevoEstado = usuario.estado === "activo" ? "inactivo" : "activo";

    const confirmarCambio = confirm(
        `¿Deseas cambiar el estado de @${usuario.nickname} a ${nuevoEstado}?`
    );

    if (!confirmarCambio) {
        return;
    }

    try {
        const respuesta = await fetch(`http://localhost:8080/usuarios/estado/${idUsuario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        const data = await respuesta.json();

        if (data.error) {
            alert(data.error);
        } else {
            alert(data.mensaje);
            await cargarUsuarios(); // refresca la lista desde el backend
        }
    } catch (error) {
        console.error("Error al cambiar estado:", error);
        alert("No se pudo conectar con el servidor.");
    }
}


// Formulario de registro y edición de usuarios desde el frontend al backend
formularioUsuario.addEventListener("submit", async function (evento) {
    evento.preventDefault();

    const idUsuario = Number(document.getElementById("usuario-id").value);
    const nombre = document.getElementById("nombre-usuario").value.trim();
    const nickname = document.getElementById("nickname-usuario").value.trim().toLowerCase();
    const correo = document.getElementById("correo-usuario").value.trim().toLowerCase();
    const rol = document.getElementById("rol-usuario").value;
    let estado = document.getElementById("estado-usuario").value;

    // ⚠️ Si no se selecciona estado, lo dejamos en "activo"
    if (!estado || estado.trim() === "") {
        estado = "activo";
    }

    const validarNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü ]+$/;
    const validarNickname = /^[a-z0-9_]{3,20}$/;

    if (!validarNombre.test(nombre)) {
        alert("El nombre solo puede contener letras y espacios.");
        return;
    }

    if (!validarNickname.test(nickname)) {
        alert("El nickname debe tener entre 3 y 20 caracteres y solo puede contener letras, números y guion bajo.");
        return;
    }

    try {
        if (!idUsuario) {
            // --- CREACIÓN ---
            const respuesta = await fetch("http://localhost:8080/usuarios/registro?rolSolicitante=administrador", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombre,
                    nickname: nickname,
                    correo: correo,
                    password: "ClaveTemporal123", // idealmente usar un input real
                    rol: rol,
                    estado: estado
                })
            });

            const data = await respuesta.json();

            if (data.error) {
                alert(data.error);
            } else {
                alert(data.mensaje);
                cerrarFormularioUsuario();
                await cargarUsuarios(); // refresca la lista desde el backend
            }
        } else {
            // --- EDICIÓN ---
            const respuesta = await fetch(`http://localhost:8080/usuarios/editar/${idUsuario}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombre,
                    nickname: nickname,
                    correo: correo,
                    rol: rol,
                    estado: estado
                })
            });

            const data = await respuesta.json();

            if (data.error) {
                alert(data.error);
            } else {
                alert(data.mensaje);
                cerrarFormularioUsuario();
                await cargarUsuarios(); // refresca la lista desde el backend
            }
        }
    } catch (error) {
        console.error("Error al registrar/editar usuario:", error);
        alert("No se pudo conectar con el servidor.");
    }
});



buscadorUsuario.addEventListener(
    "input",
    mostrarUsuarios
);

filtroRol.addEventListener(
    "change",
    mostrarUsuarios
);

filtroEstado.addEventListener(
    "change",
    mostrarUsuarios
);

botonNuevoUsuario.addEventListener(
    "click",
    abrirFormularioNuevo
);

cerrarFormulario.addEventListener(
    "click",
    cerrarFormularioUsuario
);

cancelarFormulario.addEventListener(
    "click",
    cerrarFormularioUsuario
);


cargarUsuarios();
mostrarUsuarios();