const CLAVE_RECLUTAS = "reclutasScout";

const formularioRecluta =
    document.getElementById("form-recluta");

const contenedorFormulario =
    document.getElementById("contenedor-formulario-recluta");

const botonNuevoRecluta =
    document.getElementById("boton-nuevo-recluta");

const botonCerrarFormulario =
    document.getElementById("cerrar-formulario-recluta");

const botonCancelarFormulario =
    document.getElementById("cancelar-formulario-recluta");

const listaReclutas =
    document.getElementById("lista-reclutas");

const mensajeSinReclutas =
    document.getElementById("sin-reclutas");

const totalReclutas =
    document.getElementById("total-reclutas");

const reclutasActivos =
    document.getElementById("reclutas-activos");

const fotosPendientes =
    document.getElementById("fotos-pendientes-reclutas");

const camposClave =
    document.getElementById("campos-clave-recluta");

const inputId =
    document.getElementById("recluta-id");

const inputNombre =
    document.getElementById("nombre-recluta");

const inputNickname =
    document.getElementById("nickname-recluta");

const inputNacimiento =
    document.getElementById("nacimiento-recluta");

const inputGrupo =
    document.getElementById("grupo-recluta");

const inputRama =
    document.getElementById("rama-recluta");

const inputEstado =
    document.getElementById("estado-recluta");

const inputContactoEmergencia =
    document.getElementById("contacto-emergencia-recluta");

const inputTelefonoEmergencia =
    document.getElementById("telefono-emergencia-recluta");

const inputPassword =
    document.getElementById("password-recluta");

const inputConfirmarPassword =
    document.getElementById("confirmar-password-recluta");

let reclutas = cargarReclutas();

function cargarReclutas() {
    try {
        const datosGuardados =
            JSON.parse(localStorage.getItem(CLAVE_RECLUTAS));

        return Array.isArray(datosGuardados)
            ? datosGuardados
            : [];
    } catch (error) {
        console.error("No fue posible cargar los reclutas:", error);
        return [];
    }
}

function guardarReclutas() {
    localStorage.setItem(
        CLAVE_RECLUTAS,
        JSON.stringify(reclutas)
    );
}

function obtenerApoderadoActual() {
    const correo =
        sessionStorage.getItem("correoUsuario") ||
        localStorage.getItem("correoUsuario") ||
        "apoderado@comunidadscout.cl";

    const idGuardado =
        sessionStorage.getItem("usuarioId") ||
        localStorage.getItem("usuarioId");

    return {
        id: idGuardado || correo.toLowerCase(),
        correo: correo.toLowerCase()
    };
}

function obtenerReclutasDelApoderado() {
    const apoderado = obtenerApoderadoActual();

    return reclutas.filter(function (recluta) {
        return (
            String(recluta.apoderadoId) === String(apoderado.id) ||
            recluta.apoderadoCorreo === apoderado.correo
        );
    });
}

function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = texto ?? "";
    return elemento.innerHTML;
}

function calcularEdad(fechaNacimiento) {
    const nacimiento = new Date(
        `${fechaNacimiento}T00:00:00`
    );

    const hoy = new Date();

    let edad =
        hoy.getFullYear() - nacimiento.getFullYear();

    const diferenciaMes =
        hoy.getMonth() - nacimiento.getMonth();

    if (
        diferenciaMes < 0 ||
        (
            diferenciaMes === 0 &&
            hoy.getDate() < nacimiento.getDate()
        )
    ) {
        edad--;
    }

    return edad;
}

function mostrarReclutas() {
    const reclutasApoderado =
        obtenerReclutasDelApoderado();

    listaReclutas.innerHTML = "";

    totalReclutas.textContent =
        reclutasApoderado.length;

    reclutasActivos.textContent =
        reclutasApoderado.filter(function (recluta) {
            return recluta.estado === "Activo";
        }).length;

    fotosPendientes.textContent =
        reclutasApoderado.reduce(
            function (total, recluta) {
                return total +
                    Number(recluta.fotosPendientes || 0);
            },
            0
        );

    if (reclutasApoderado.length === 0) {
        mensajeSinReclutas.hidden = false;
        return;
    }

    mensajeSinReclutas.hidden = true;

    reclutasApoderado.forEach(function (recluta) {
        const tarjeta = document.createElement("article");

        tarjeta.className = "tarjeta-recluta";

        const claseEstado =
            recluta.estado === "Activo"
                ? "estado-activo"
                : "estado-inactivo";

        tarjeta.innerHTML = `
            <div class="encabezado-recluta">
                <div>
                    <h3>${escaparHTML(recluta.nombre)}</h3>

                    <p class="nickname-recluta">
                        @${escaparHTML(recluta.nickname)}
                    </p>
                </div>

                <span class="estado-recluta ${claseEstado}">
                    ${escaparHTML(recluta.estado)}
                </span>
            </div>

            <div class="datos-recluta">
                <p>
                    <strong>Edad:</strong>
                    ${calcularEdad(recluta.fechaNacimiento)} años
                </p>

                <p>
                    <strong>Grupo:</strong>
                    ${escaparHTML(recluta.grupo)}
                </p>

                <p>
                    <strong>Rama:</strong>
                    ${escaparHTML(recluta.rama)}
                </p>

                <p>
                    <strong>Fotos pendientes:</strong>
                    ${Number(recluta.fotosPendientes || 0)}
                </p>
            </div>

            <div class="acciones-recluta">
                <button
                    type="button"
                    class="boton-principal boton-abrir-recluta"
                    data-id="${recluta.id}"
                >
                    Abrir panel
                </button>

                <button
                    type="button"
                    class="boton-secundario boton-editar-recluta"
                    data-id="${recluta.id}"
                >
                    Editar
                </button>

                <button
                    type="button"
                    class="boton-secundario boton-estado-recluta"
                    data-id="${recluta.id}"
                >
                    ${
                        recluta.estado === "Activo"
                            ? "Desactivar"
                            : "Activar"
                    }
                </button>

                <button
                    type="button"
                    class="boton-secundario boton-clave-recluta"
                    data-id="${recluta.id}"
                >
                    Restablecer clave
                </button>
            </div>
        `;

        listaReclutas.appendChild(tarjeta);
    });

    activarEventosReclutas();
}

function activarEventosReclutas() {
    document
        .querySelectorAll(".boton-abrir-recluta")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                abrirPanelRecluta(
                    Number(boton.dataset.id)
                );
            });
        });

    document
        .querySelectorAll(".boton-editar-recluta")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                editarRecluta(
                    Number(boton.dataset.id)
                );
            });
        });

    document
        .querySelectorAll(".boton-estado-recluta")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                cambiarEstadoRecluta(
                    Number(boton.dataset.id)
                );
            });
        });

    document
        .querySelectorAll(".boton-clave-recluta")
        .forEach(function (boton) {
            boton.addEventListener("click", function () {
                restablecerClave(
                    Number(boton.dataset.id)
                );
            });
        });
}

function abrirFormularioNuevo() {
    formularioRecluta.reset();
    inputId.value = "";

    camposClave.hidden = false;
    inputPassword.required = true;
    inputConfirmarPassword.required = true;

    contenedorFormulario.hidden = false;
    inputNombre.focus();
}

function cerrarFormulario() {
    formularioRecluta.reset();
    inputId.value = "";

    camposClave.hidden = false;
    inputPassword.required = true;
    inputConfirmarPassword.required = true;

    contenedorFormulario.hidden = true;
}

function editarRecluta(idRecluta) {
    const recluta = reclutas.find(function (elemento) {
        return elemento.id === idRecluta;
    });

    if (!recluta) {
        return;
    }

    inputId.value = recluta.id;
    inputNombre.value = recluta.nombre;
    inputNickname.value = recluta.nickname;
    inputNacimiento.value = recluta.fechaNacimiento;
    inputGrupo.value = recluta.grupo;
    inputRama.value = recluta.rama;
    inputEstado.value = recluta.estado;
    inputContactoEmergencia.value =
        recluta.contactoEmergencia;
    inputTelefonoEmergencia.value =
        recluta.telefonoEmergencia;

    camposClave.hidden = true;
    inputPassword.required = false;
    inputConfirmarPassword.required = false;

    contenedorFormulario.hidden = false;
    inputNombre.focus();
}

function nicknameDisponible(nickname, idActual) {
    const nicknameNormalizado =
        nickname.toLowerCase();

    const usadoPorRecluta = reclutas.some(
        function (recluta) {
            return (
                recluta.nickname.toLowerCase() ===
                    nicknameNormalizado &&
                recluta.id !== idActual
            );
        }
    );

    if (usadoPorRecluta) {
        return false;
    }

    const usuarios = JSON.parse(
        localStorage.getItem("usuariosRegistrados") || "[]"
    );

    return !usuarios.some(function (usuario) {
        return (
            usuario.nickname &&
            usuario.nickname.toLowerCase() ===
                nicknameNormalizado
        );
    });
}

function validarFormulario(idActual) {
    const nickname =
        inputNickname.value.trim().toLowerCase();

    const expresionNickname =
        /^[a-z0-9_]{3,20}$/;

    if (!expresionNickname.test(nickname)) {
        alert(
            "El nickname debe contener entre 3 y 20 caracteres. " +
            "Solo puede usar letras minúsculas, números y guion bajo."
        );

        inputNickname.focus();
        return false;
    }

    if (!nicknameDisponible(nickname, idActual)) {
        alert("Ese nickname ya está siendo utilizado.");
        inputNickname.focus();
        return false;
    }

    const nacimiento =
        new Date(`${inputNacimiento.value}T00:00:00`);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (
        Number.isNaN(nacimiento.getTime()) ||
        nacimiento > hoy
    ) {
        alert("La fecha de nacimiento no es válida.");
        inputNacimiento.focus();
        return false;
    }

    const telefono =
        inputTelefonoEmergencia.value
            .trim()
            .replace(/\s/g, "");

    const expresionTelefono =
        /^\+?[0-9]{8,15}$/;

    if (!expresionTelefono.test(telefono)) {
        alert(
            "Ingresa un teléfono válido de entre 8 y 15 dígitos."
        );

        inputTelefonoEmergencia.focus();
        return false;
    }

    if (!idActual) {
        const password = inputPassword.value;
        const confirmacion =
            inputConfirmarPassword.value;

        const expresionPassword =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{12,64}$/;

        if (!expresionPassword.test(password)) {
            alert(
                "La contraseña debe tener entre 12 y 64 caracteres, " +
                "una mayúscula, una minúscula, un número y un carácter especial."
            );

            inputPassword.focus();
            return false;
        }

        if (password !== confirmacion) {
            alert("Las contraseñas no coinciden.");
            inputConfirmarPassword.focus();
            return false;
        }
    }

    return true;
}

function guardarFormulario(evento) {
    evento.preventDefault();

    const idActual =
        inputId.value === ""
            ? null
            : Number(inputId.value);

    if (!validarFormulario(idActual)) {
        return;
    }

    const apoderado = obtenerApoderadoActual();

    const datosRecluta = {
        nombre: inputNombre.value.trim(),
        nickname:
            inputNickname.value.trim().toLowerCase(),
        fechaNacimiento: inputNacimiento.value,
        grupo: inputGrupo.value,
        rama: inputRama.value,
        estado: inputEstado.value,
        contactoEmergencia:
            inputContactoEmergencia.value.trim(),
        telefonoEmergencia:
            inputTelefonoEmergencia.value.trim()
    };

    if (idActual) {
        const indice = reclutas.findIndex(
            function (recluta) {
                return recluta.id === idActual;
            }
        );

        if (indice === -1) {
            return;
        }

        reclutas[indice] = {
            ...reclutas[indice],
            ...datosRecluta
        };

        alert("Los datos del recluta fueron actualizados.");
    } else {
        reclutas.push({
            id: Date.now(),
            apoderadoId: apoderado.id,
            apoderadoCorreo: apoderado.correo,
            ...datosRecluta,
            rol: "RECLUTA",
            claveConfigurada: true,
            requiereCambioClave: false,
            fotosPendientes: 0,
            fechaRegistro: new Date().toISOString()
        });

        /*
         * La contraseña no se guarda en localStorage.
         * Más adelante será enviada al servicio de identidad,
         * que deberá almacenarla utilizando un hash seguro.
         */

        alert("El perfil del recluta fue creado correctamente.");
    }

    guardarReclutas();
    cerrarFormulario();
    mostrarReclutas();
}

function cambiarEstadoRecluta(idRecluta) {
    const recluta = reclutas.find(function (elemento) {
        return elemento.id === idRecluta;
    });

    if (!recluta) {
        return;
    }

    const nuevoEstado =
        recluta.estado === "Activo"
            ? "Inactivo"
            : "Activo";

    const confirmar = confirm(
        `¿Deseas cambiar el estado de ${recluta.nombre} ` +
        `a "${nuevoEstado}"?`
    );

    if (!confirmar) {
        return;
    }

    recluta.estado = nuevoEstado;

    guardarReclutas();
    mostrarReclutas();
}

function restablecerClave(idRecluta) {
    const recluta = reclutas.find(function (elemento) {
        return elemento.id === idRecluta;
    });

    if (!recluta) {
        return;
    }

    const confirmar = confirm(
        `¿Deseas solicitar el restablecimiento de la clave ` +
        `de @${recluta.nickname}?`
    );

    if (!confirmar) {
        return;
    }

    recluta.requiereCambioClave = true;
    recluta.fechaSolicitudClave =
        new Date().toISOString();

    guardarReclutas();

    alert(
        "La solicitud fue registrada. " +
        `Las instrucciones serán enviadas a ${recluta.apoderadoCorreo}.`
    );
}

function abrirPanelRecluta(idRecluta) {
    const recluta = reclutas.find(function (elemento) {
        return elemento.id === idRecluta;
    });

    if (!recluta) {
        return;
    }

    if (recluta.estado !== "Activo") {
        alert(
            "No es posible ingresar porque este perfil está inactivo."
        );
        return;
    }

    sessionStorage.setItem(
        "reclutaSeleccionadoId",
        String(recluta.id)
    );

    sessionStorage.setItem(
        "rolTemporal",
        "RECLUTA"
    );

    window.location.href = "panel-recluta.html";
}

botonNuevoRecluta.addEventListener(
    "click",
    abrirFormularioNuevo
);

botonCerrarFormulario.addEventListener(
    "click",
    cerrarFormulario
);

botonCancelarFormulario.addEventListener(
    "click",
    cerrarFormulario
);

formularioRecluta.addEventListener(
    "submit",
    guardarFormulario
);

mostrarReclutas();