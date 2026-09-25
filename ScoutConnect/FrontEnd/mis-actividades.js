const actividades = [
    {
        id: 1,
        nombre: "Campamento de primavera",
        fecha: "12-09-2026",
        horario: "08:30 horas",
        lugar: "Parque Mahuida, La Reina",
        estado: "Confirmada"
    },
    {
        id: 2,
        nombre: "Jornada de servicio comunitario",
        fecha: "03-10-2026",
        horario: "09:00 horas",
        lugar: "Peñalolén, Santiago",
        estado: "Confirmada"
    },
    {
        id: 3,
        nombre: "Taller de primeros auxilios",
        fecha: "18-07-2026",
        horario: "10:00 horas",
        lugar: "Sede Comunidad Scout",
        estado: "Finalizada"
    }
];

const listaActividades =
    document.getElementById("lista-actividades");

const totalActividades =
    document.getElementById("total-actividades");

const actividadesProximas =
    document.getElementById("actividades-proximas");

const actividadesFinalizadas =
    document.getElementById("actividades-finalizadas");

function obtenerClaseActividad(estado) {
    if (estado === "Confirmada") {
        return "actividad-confirmada";
    }

    return "actividad-finalizada";
}

function mostrarActividades() {
    if (!listaActividades) {
        return;
    }

    listaActividades.innerHTML = "";

    actividades.forEach(function (actividad) {
        const tarjeta = document.createElement("article");

        tarjeta.classList.add("tarjeta-actividad");

        tarjeta.innerHTML = `
            <div class="icono-actividad" aria-hidden="true">
                📅
            </div>

            <div class="informacion-actividad">
                <div class="encabezado-tarjeta-actividad">
                    <h3>${actividad.nombre}</h3>

                    <span
                        class="estado-actividad
                        ${obtenerClaseActividad(actividad.estado)}"
                    >
                        ${actividad.estado}
                    </span>
                </div>

                <div class="datos-actividad">
                    <p>
                        <strong>Fecha:</strong>
                        ${actividad.fecha}
                    </p>

                    <p>
                        <strong>Horario:</strong>
                        ${actividad.horario}
                    </p>

                    <p>
                        <strong>Lugar:</strong>
                        ${actividad.lugar}
                    </p>
                </div>

                <button
                    type="button"
                    class="boton-detalle-actividad"
                    data-id="${actividad.id}"
                >
                    Ver información
                </button>
            </div>
        `;

        listaActividades.appendChild(tarjeta);
    });

    actualizarResumenActividades();
    activarBotonesActividades();
}

function actualizarResumenActividades() {
    const proximas = actividades.filter(function (actividad) {
        return actividad.estado === "Confirmada";
    });

    const finalizadas = actividades.filter(function (actividad) {
        return actividad.estado === "Finalizada";
    });

    totalActividades.textContent = actividades.length;
    actividadesProximas.textContent = proximas.length;
    actividadesFinalizadas.textContent = finalizadas.length;
}

function activarBotonesActividades() {
    const botones =
        document.querySelectorAll(".boton-detalle-actividad");

    botones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            const idActividad = Number(boton.dataset.id);

            const actividadSeleccionada = actividades.find(
                function (actividad) {
                    return actividad.id === idActividad;
                }
            );

            if (actividadSeleccionada) {
                alert(
                    `Actividad: ${actividadSeleccionada.nombre}\n` +
                    `Fecha: ${actividadSeleccionada.fecha}\n` +
                    `Horario: ${actividadSeleccionada.horario}\n` +
                    `Lugar: ${actividadSeleccionada.lugar}\n` +
                    `Estado: ${actividadSeleccionada.estado}`
                );
            }
        });
    });
}

mostrarActividades();