let actividades = [];

const listaActividades =
    document.getElementById("lista-actividades-admin");

const totalActividades =
    document.getElementById("total-actividades-admin");

const actividadesProgramadas =
    document.getElementById("actividades-programadas-admin");

const actividadesFinalizadas =
    document.getElementById("actividades-finalizadas-admin");

const totalInscritos =
    document.getElementById("total-inscritos-admin");

const buscarActividad =
    document.getElementById("buscar-actividad");

const filtroTipo =
    document.getElementById("filtro-tipo-actividad");

const filtroEstado =
    document.getElementById("filtro-estado-actividad");

const sinResultados =
    document.getElementById("sin-resultados-actividades");

const botonNuevaActividad =
    document.getElementById("boton-nueva-actividad");

const contenedorFormulario =
    document.getElementById(
        "contenedor-formulario-actividad"
    );

const formularioActividad =
    document.getElementById("form-actividad");

const tituloFormulario =
    document.getElementById(
        "titulo-formulario-actividad"
    );

const cerrarFormulario =
    document.getElementById(
        "cerrar-formulario-actividad"
    );

const cancelarFormulario =
    document.getElementById(
        "cancelar-formulario-actividad"
    );


function escaparHTML(texto) {
    const elemento = document.createElement("div");
    elemento.textContent = String(texto);

    return elemento.innerHTML;
}


function formatearFecha(fecha) {
    if (!fecha) {
        return "";
    }

    const partes = fecha.split("-");

    return `${partes[2]}-${partes[1]}-${partes[0]}`;
}


function cargarActividades() {
    const actividadesGuardadas =
        JSON.parse(
            localStorage.getItem("actividadesAdmin")
        ) || [];

    if (actividadesGuardadas.length > 0) {
        actividades = actividadesGuardadas;
        return;
    }

    actividades = [
        {
            id: 1,
            nombre: "Campamento de primavera",
            tipo: "Campamento",
            fecha: "2026-09-12",
            hora: "08:30",
            lugar: "Parque Mahuida, La Reina",
            cupos: 40,
            inscritos: 28,
            estado: "Programada",
            descripcion:
                "Campamento de primavera para integrantes de la comunidad."
        },
        {
            id: 2,
            nombre: "Jornada de servicio comunitario",
            tipo: "Servicio",
            fecha: "2026-10-03",
            hora: "09:00",
            lugar: "Peñalolén, Santiago",
            cupos: 30,
            inscritos: 18,
            estado: "Programada",
            descripcion:
                "Actividad de apoyo y servicio para la comunidad local."
        },
        {
            id: 3,
            nombre: "Taller de primeros auxilios",
            tipo: "Taller",
            fecha: "2026-07-18",
            hora: "10:00",
            lugar: "Sede Comunidad Scout",
            cupos: 25,
            inscritos: 22,
            estado: "Finalizada",
            descripcion:
                "Taller introductorio de primeros auxilios."
        }
    ];

    guardarActividades();
}


function guardarActividades() {
    localStorage.setItem(
        "actividadesAdmin",
        JSON.stringify(actividades)
    );
}


function actualizarIndicadores() {
    const programadas = actividades.filter(
        function (actividad) {
            return actividad.estado === "Programada";
        }
    );

    const finalizadas = actividades.filter(
        function (actividad) {
            return actividad.estado === "Finalizada";
        }
    );

    const inscritos = actividades.reduce(
        function (total, actividad) {
            return total + actividad.inscritos;
        },
        0
    );

    totalActividades.textContent =
        actividades.length;

    actividadesProgramadas.textContent =
        programadas.length;

    actividadesFinalizadas.textContent =
        finalizadas.length;

    totalInscritos.textContent = inscritos;
}


function obtenerActividadesFiltradas() {
    const texto =
        buscarActividad.value
            .trim()
            .toLowerCase();

    return actividades.filter(
        function (actividad) {
            const coincideTexto =
                actividad.nombre
                    .toLowerCase()
                    .includes(texto) ||
                actividad.lugar
                    .toLowerCase()
                    .includes(texto);

            const coincideTipo =
                filtroTipo.value === "TODOS" ||
                actividad.tipo === filtroTipo.value;

            const coincideEstado =
                filtroEstado.value === "TODOS" ||
                actividad.estado === filtroEstado.value;

            return (
                coincideTexto &&
                coincideTipo &&
                coincideEstado
            );
        }
    );
}


function obtenerClaseEstado(estado) {
    if (estado === "Programada") {
        return "estado-activo-admin";
    }

    if (estado === "Finalizada") {
        return "estado-finalizada-admin";
    }

    return "estado-inactivo-admin";
}


function mostrarActividades() {
    const actividadesFiltradas =
        obtenerActividadesFiltradas();

    listaActividades.innerHTML = "";

    sinResultados.hidden =
        actividadesFiltradas.length !== 0;

    actividadesFiltradas.forEach(
        function (actividad) {
            const fila =
                document.createElement("tr");

            const cuposRestantes =
                actividad.cupos - actividad.inscritos;

            const botonesEstado =
                actividad.estado === "Programada"
                    ? `
                        <button
                            type="button"
                            class="boton-finalizar-admin"
                            data-id="${actividad.id}"
                        >
                            Finalizar
                        </button>

                        <button
                            type="button"
                            class="boton-cancelar-actividad"
                            data-id="${actividad.id}"
                        >
                            Cancelar
                        </button>
                    `
                    : "";

            fila.innerHTML = `
                <td>
                    <strong>
                        ${escaparHTML(actividad.nombre)}
                    </strong>
                </td>

                <td>
                    ${escaparHTML(actividad.tipo)}
                </td>

                <td>
                    ${formatearFecha(actividad.fecha)}
                    <br>
                    <small>${escaparHTML(actividad.hora)} horas</small>
                </td>

                <td>
                    ${escaparHTML(actividad.lugar)}
                </td>

                <td>
                    ${actividad.inscritos}/${actividad.cupos}
                    <br>
                    <small>
                        ${cuposRestantes} disponibles
                    </small>
                </td>

                <td>
                    <span
                        class="estado-usuario-admin
                        ${obtenerClaseEstado(actividad.estado)}"
                    >
                        ${actividad.estado}
                    </span>
                </td>

                <td>
                    <div class="acciones-tabla-admin">

                        <button
                            type="button"
                            class="boton-editar-admin"
                            data-id="${actividad.id}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="boton-inscritos-admin"
                            data-id="${actividad.id}"
                        >
                            Ver inscritos
                        </button>

                        ${botonesEstado}

                    </div>
                </td>
            `;

            listaActividades.appendChild(fila);
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

    const botonesInscritos =
        document.querySelectorAll(
            ".boton-inscritos-admin"
        );

    const botonesFinalizar =
        document.querySelectorAll(
            ".boton-finalizar-admin"
        );

    const botonesCancelar =
        document.querySelectorAll(
            ".boton-cancelar-actividad"
        );

    botonesEditar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                abrirEdicionActividad(
                    Number(boton.dataset.id)
                );
            }
        );
    });

    botonesInscritos.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                verInscritos(
                    Number(boton.dataset.id)
                );
            }
        );
    });

    botonesFinalizar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                cambiarEstadoActividad(
                    Number(boton.dataset.id),
                    "Finalizada"
                );
            }
        );
    });

    botonesCancelar.forEach(function (boton) {
        boton.addEventListener(
            "click",
            function () {
                cambiarEstadoActividad(
                    Number(boton.dataset.id),
                    "Cancelada"
                );
            }
        );
    });
}


function abrirNuevaActividad() {
    formularioActividad.reset();

    document.getElementById(
        "actividad-id"
    ).value = "";

    document.getElementById(
        "estado-actividad-admin"
    ).value = "Programada";

    tituloFormulario.textContent =
        "Nueva actividad";

    contenedorFormulario.hidden = false;

    document.getElementById(
        "nombre-actividad"
    ).focus();

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function abrirEdicionActividad(idActividad) {
    const actividad = actividades.find(
        function (elemento) {
            return elemento.id === idActividad;
        }
    );

    if (!actividad) {
        return;
    }

    tituloFormulario.textContent =
        "Editar actividad";

    document.getElementById(
        "actividad-id"
    ).value = actividad.id;

    document.getElementById(
        "nombre-actividad"
    ).value = actividad.nombre;

    document.getElementById(
        "tipo-actividad"
    ).value = actividad.tipo;

    document.getElementById(
        "fecha-actividad"
    ).value = actividad.fecha;

    document.getElementById(
        "hora-actividad"
    ).value = actividad.hora;

    document.getElementById(
        "lugar-actividad"
    ).value = actividad.lugar;

    document.getElementById(
        "cupos-actividad"
    ).value = actividad.cupos;

    document.getElementById(
        "estado-actividad-admin"
    ).value = actividad.estado;

    document.getElementById(
        "descripcion-actividad"
    ).value = actividad.descripcion;

    contenedorFormulario.hidden = false;

    contenedorFormulario.scrollIntoView({
        behavior: "smooth"
    });
}


function cerrarFormularioActividad() {
    formularioActividad.reset();
    contenedorFormulario.hidden = true;
}


function cambiarEstadoActividad(
    idActividad,
    nuevoEstado
) {
    const actividad = actividades.find(
        function (elemento) {
            return elemento.id === idActividad;
        }
    );

    if (!actividad) {
        return;
    }

    const confirmar = confirm(
        `¿Deseas cambiar "${actividad.nombre}" ` +
        `al estado ${nuevoEstado}?`
    );

    if (!confirmar) {
        return;
    }

    actividad.estado = nuevoEstado;

    guardarActividades();
    mostrarActividades();
}


function verInscritos(idActividad) {
    const actividad = actividades.find(
        function (elemento) {
            return elemento.id === idActividad;
        }
    );

    if (!actividad) {
        return;
    }

    alert(
        `Actividad: ${actividad.nombre}\n` +
        `Personas inscritas: ${actividad.inscritos}\n` +
        `Cupos totales: ${actividad.cupos}\n` +
        `Cupos disponibles: ` +
        `${actividad.cupos - actividad.inscritos}\n\n` +
        "Posteriormente se mostrará el listado " +
        "obtenido desde el microservicio de actividades."
    );
}


formularioActividad.addEventListener(
    "submit",
    function (evento) {
        evento.preventDefault();

        const idActividad = Number(
            document.getElementById(
                "actividad-id"
            ).value
        );

        const nombre = document
            .getElementById("nombre-actividad")
            .value
            .trim();

        const tipo =
            document.getElementById(
                "tipo-actividad"
            ).value;

        const fecha =
            document.getElementById(
                "fecha-actividad"
            ).value;

        const hora =
            document.getElementById(
                "hora-actividad"
            ).value;

        const lugar = document
            .getElementById("lugar-actividad")
            .value
            .trim();

        const cupos = Number(
            document.getElementById(
                "cupos-actividad"
            ).value
        );

        const estado =
            document.getElementById(
                "estado-actividad-admin"
            ).value;

        const descripcion = document
            .getElementById(
                "descripcion-actividad"
            )
            .value
            .trim();

        if (!Number.isInteger(cupos) || cupos <= 0) {
            alert(
                "Los cupos deben ser un número mayor que cero."
            );

            return;
        }

        if (idActividad) {
            const actividad = actividades.find(
                function (elemento) {
                    return elemento.id === idActividad;
                }
            );

            if (!actividad) {
                return;
            }

            if (cupos < actividad.inscritos) {
                alert(
                    `No puedes reducir los cupos a ${cupos}, ` +
                    `porque ya existen ${actividad.inscritos} ` +
                    `personas inscritas.`
                );

                return;
            }

            actividad.nombre = nombre;
            actividad.tipo = tipo;
            actividad.fecha = fecha;
            actividad.hora = hora;
            actividad.lugar = lugar;
            actividad.cupos = cupos;
            actividad.estado = estado;
            actividad.descripcion = descripcion;

        } else {
            actividades.push({
                id: Date.now(),
                nombre: nombre,
                tipo: tipo,
                fecha: fecha,
                hora: hora,
                lugar: lugar,
                cupos: cupos,
                inscritos: 0,
                estado: estado,
                descripcion: descripcion
            });
        }

        guardarActividades();
        cerrarFormularioActividad();
        mostrarActividades();

        alert(
            idActividad
                ? "Actividad actualizada correctamente."
                : "Actividad registrada correctamente."
        );
    }
);


buscarActividad.addEventListener(
    "input",
    mostrarActividades
);

filtroTipo.addEventListener(
    "change",
    mostrarActividades
);

filtroEstado.addEventListener(
    "change",
    mostrarActividades
);

botonNuevaActividad.addEventListener(
    "click",
    abrirNuevaActividad
);

cerrarFormulario.addEventListener(
    "click",
    cerrarFormularioActividad
);

cancelarFormulario.addEventListener(
    "click",
    cerrarFormularioActividad
);


cargarActividades();
mostrarActividades();